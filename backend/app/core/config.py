import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")


class Settings:
    APP_NAME = os.getenv("APP_NAME", "AI Video Platform API")
    API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/Synapse")
    BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "")
    DB_USER = os.getenv("user", "")
    DB_PASSWORD = os.getenv("password", "")
    DB_HOST = os.getenv("host", "")
    DB_PORT = int(os.getenv("port", "5432"))
    DB_NAME = os.getenv("dbname", "postgres")
    SUPABASE_DB_SCHEMA = os.getenv("SUPABASE_DB_SCHEMA", "app")

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
