from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


settings = get_settings()


class Base(DeclarativeBase):
    metadata = MetaData(schema=settings.SUPABASE_DB_SCHEMA)
