from fastapi import APIRouter

from app.api.MW.health.router import router as health_router

router = APIRouter()
router.include_router(health_router)
