from sqlalchemy import Column, Integer, String, Enum, Float, func, DateTime
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum as PyEnum
from geoalchemy2 import Geometry

Base = declarative_base()


class TransportationMode(str, PyEnum):
    AIR = "AIR"
    GROUND = "GROUND"
    SEA = "SEA"


class Route(Base):
    __tablename__ = "route"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    mode = Column(Enum(TransportationMode), nullable=False)
    distance = Column(Float, nullable=False)
    travel_time = Column(Float, nullable=False, comment="In hours")
    start_point = Column(Geometry("POINT", 4326), nullable=False)
    end_point = Column(Geometry("POINT", 4326), nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp(),
                        nullable=False)
