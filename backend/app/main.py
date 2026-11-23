from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.MW.router import router as mw_router
from app.core.config import get_settings
from app.db.session import close_database_connection

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await close_database_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Backend API for the AI Video & Communication Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mw_router, prefix=settings.API_V1_PREFIX)
