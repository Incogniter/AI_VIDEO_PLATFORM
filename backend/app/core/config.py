import os
# from pathlib import Path

# from dotenv import load_dotenv
from sqlalchemy.engine import URL

# ROOT_DIR = Path(__file__).resolve().parents[2]
# load_dotenv(ROOT_DIR / ".env")


class Settings:
    APP_NAME = os.getenv("APP_NAME", "AI Video Platform API")
    API_V1_PREFIX = os.getenv("API_V1_PREFIX", "/Synapse")
    BACKEND_CORS_ORIGINS = os.getenv("BACKEND_CORS_ORIGINS", "")
    DB_USER = os.getenv("DB_USER", "")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "")
    DB_PORT = int(os.getenv("DB_PORT", "5432"))
    DB_NAME = os.getenv("DB_NAME", "postgres")
    DATABASE_URL = URL.create(
        drivername="postgresql+psycopg2",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        query={"sslmode": "require"},
    )
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
