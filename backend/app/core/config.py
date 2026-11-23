from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    APP_NAME: str
    API_V1_PREFIX: str
    BACKEND_CORS_ORIGINS: str
    SUPABASE_DB_USER: str
    SUPABASE_DB_PASSWORD: str
    SUPABASE_DB_HOST: str
    SUPABASE_DB_PORT: int
    SUPABASE_DB_NAME: str
    SUPABASE_DB_SCHEMA: str
    DB_POOL_SIZE: int
    DB_MAX_OVERFLOW: int
    DB_POOL_TIMEOUT: int

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def DATABASE_URL(self) -> URL:
        return URL.create(
            drivername="postgresql+asyncpg",
            username=self.SUPABASE_DB_USER,
            password=self.SUPABASE_DB_PASSWORD,
            host=self.SUPABASE_DB_HOST,
            port=self.SUPABASE_DB_PORT,
            database=self.SUPABASE_DB_NAME,
            query={"ssl": "require"},
        )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
