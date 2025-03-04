from pydantic import BaseModel
from models import TransportationMode
from datetime import datetime


class RouteDTO(BaseModel):
    id: int
    name: str
    mode: TransportationMode
    distance: float
    travel_time: float
    #start_point: str
    #end_point: str
    created_at: datetime
