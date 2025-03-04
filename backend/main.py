from typing import Annotated, List
from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import create_tables, get_db
from models import Route
from dtos import RouteDTO

app = FastAPI()

SessionDep = Annotated[AsyncSession, Depends(get_db)]


@app.on_event("startup")
async def on_startup():
    await create_tables()


@app.get("/", response_model=List[RouteDTO])
async def index(session: SessionDep):
    results = await session.execute(select(Route))
    routes = results.scalars().all()
    return routes
