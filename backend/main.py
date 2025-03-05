from contextlib import asynccontextmanager
from typing import Annotated, List
from fastapi import Depends, FastAPI, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import create_tables, get_db
from models import Route
from dtos import RouteDTO

SessionDep = Annotated[AsyncSession, Depends(get_db)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(lifespan=lifespan)
    

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
