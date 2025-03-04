from collections.abc import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from models import Base

database_url = "postgresql+asyncpg://test:test@127.0.0.1:5432/logilink"

engine = create_async_engine(database_url, echo=True, future=True)

AsyncSessionFactory = async_sessionmaker(
    engine,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator:
    async with AsyncSessionFactory() as session:
        try:
            yield session
        except Exception as e:
            print(f"Error getting database session: {e}")
            raise


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

        with open("insert.sql", 'r') as f:
            await conn.execute(text(f.read()))
