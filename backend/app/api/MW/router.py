from fastapi import APIRouter

from app.api.MW.auth.router import router as auth_router
from app.api.MW.health.router import router as health_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(health_router)
