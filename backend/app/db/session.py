from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.pool import NullPool
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    database=settings.DB_NAME,
    query={"sslmode": "require"},
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    autoflush=False,
    autocommit=False,
)


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def check_database_connection() -> None:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))


def close_database_connection() -> None:
    engine.dispose()
