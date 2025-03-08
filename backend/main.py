from contextlib import asynccontextmanager
from typing import Annotated, List
from fastapi import Depends, FastAPI, Query, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import create_tables, get_db
from models import Route
from dtos import RouteDTO
from pydantic import BaseModel
from typing import Optional, Dict
from LogiLink.backend.routing2 import main as process_shipment

SessionDep = Annotated[AsyncSession, Depends(get_db)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Cache to store form data
form_cache: Dict[str, dict] = {}
    

def get_point(value: str) -> str:
    lat_str, lon_str = value.split(',')
    latitude = float(lat_str)
    longitude = float(lon_str)
    return f"SRID=4326;POINT({longitude} {latitude})"


@app.get("/routes", response_model=List[RouteDTO])
async def index(session: SessionDep,
                to: str,
                from_param: str = Query(alias="from")):
    from_point = get_point(from_param)

    stmt = select(Route).order_by(
        func.ST_Distance(Route.start_point, func.ST_GeomFromText(from_point, 4326))
    ).limit(3)

    result = await session.execute(stmt)

    return result.scalars().all()

# Define request model
class ShipmentRequest(BaseModel):
    origin: str
    destination: str
    weight: int
    goods_type: str  # Standard, Perishable, Hazardous, High-value, Fragile, Oversized
    priority: str  # Cost-effective, Fastest Delivery, Balanced, Eco-friendly
    perishability: Optional[int] = None  # Scale of 1-10 (Only for perishable goods)

@app.post("/submit-shipment/")
async def submit_shipment(request: ShipmentRequest):
    """
    API endpoint to collect shipment data from the UI.
    If goods are perishable, the API expects a perishability value (1-10).
    """

    # Validate input for perishability
    if request.goods_type.lower() == "perishable" and request.perishability is None:
        raise HTTPException(status_code=400, detail="Perishability level (1-10) required for perishable goods.")
    
    # Generate cache key based on input fields
    cache_key = f"{request.origin}-{request.destination}-{request.weight}-{request.goods_type}-{request.priority}"
    
    # Check if the request exists in cache
    if cache_key in form_cache:
        return {"message": "Using cached data", "data": form_cache[cache_key]}
    
    # Store in cache
    form_cache[cache_key] = request.dict()
    
    # Map priority string to integer
    priority_int = 3 # Default value for Balanced priority
    if(request.priority == "Cost-effective"):
       priority_int = 1
    elif(request.priority == "Fastest Delivery"):
       priority_int = 2
    elif(request.priority == "Eco-friendly"):
       priority_int = 4

    # Process the shipment data
    process_shipment(
        source=request.origin,
        destination=request.destination,
        priority=priority_int,
        goods_type=request.goods_type.lower(),
        cargo_weight=request.weight
    )

    return {"message": "Shipment data received successfully", "data": request.dict()}

