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
import json
from routing import get_routing
from enum import Enum
import uvicorn
from pydantic import BaseModel

# SessionDep = Annotated[AsyncSession, Depends(get_db)]

@asynccontextmanager
async def lifespan(app: FastAPI):
#    await create_tables()
    yield


app = FastAPI(lifespan=lifespan)


# Cache to store form data
form_cache: Dict[str, dict] = {}



class Segment(BaseModel):
    start: str
    end: str
    mode: str
    distance_km: float | str
    time_hr: float
    base_cost: float
    goods_type_multiplier: float
    adjusted_cost: float
    goods_impact: int
    customs_cost: float
    total_segment_cost: float
    geometry: str | None = None
    coordinates: list[tuple[float, float]]


class Data(BaseModel):
    valid: bool
    total_cost: float
    total_time: float
    total_distance: float
    goods_type: str
    goods_type_score: int
    segments: list[Segment]
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

class Route(BaseModel):
    overview: list[str]
    data: Data


class Priority(str, Enum):
    COST = "cost"
    TIME = "time"
    ECO = "eco"
    BALANCED = "balanced"


class GoodsType(str, Enum):
    STANDARD = "1"
    PERISHABLE = "2"
    HAZARDOUS = "3"
    FRAGILE = "4"
    OVERSIZE = "5"
    HIGH_VALUE = "6"


@app.get("/routes/{source}/{destination}", response_model=list[Route])
async def routes(source: str,
                 destination: str,
                 priority: Priority = Priority.BALANCED,
                 goods_type: str = GoodsType.STANDARD,
                 cargo_weight: float = 0):
    res = get_routing(source, destination, priority, goods_type, cargo_weight)

    routes = []

    for routing_info, data_dict in res:
        output = {
            "overview": routing_info,
            "data": data_dict
        }

        routes.append(output)

    return routes

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
