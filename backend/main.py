from fastapi import FastAPI
from routing import get_routing
from enum import Enum
import uvicorn
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    total_emissions: float
    goods_type: str
    goods_type_score: int
    segments: list[Segment]
    modes: list[str]


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

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
