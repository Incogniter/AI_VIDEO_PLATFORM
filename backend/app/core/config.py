import os
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class Settings:
    APP_NAME = os.getenv("APP_NAME", "AI Video Platform API")
    API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/Synapse")
    BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "")
    DATABASE_URL = (
        "postgresql+asyncpg://"
        f"{os.getenv('SUPABASE_DB_USER', 'postgres')}:"
        f"{quote(os.getenv('SUPABASE_DB_PASSWORD', ''), safe='')}@"
        f"{os.getenv('SUPABASE_DB_HOST', '')}:"
        f"{os.getenv('SUPABASE_DB_PORT', '5432')}/"
        f"{os.getenv('SUPABASE_DB_NAME', 'postgres')}?ssl=require"
    )
    SUPABASE_DB_SCHEMA = os.getenv("SUPABASE_DB_SCHEMA", "app")
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "5"))
    DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()


def get_settings() -> Settings:
    return settings
