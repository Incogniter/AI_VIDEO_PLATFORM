import logging

from fastapi import APIRouter, HTTPException

from app.api.MW.health.service import check_database_health, get_service_health

router = APIRouter(tags=["Health"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check() -> dict[str, str]:
    return get_service_health()


@router.get("/health/db")
def database_health() -> dict[str, str]:
    try:
        return check_database_health()
    except Exception as exc:
        logger.exception("Database connection failed")
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {type(exc).__name__}",
        ) from exc
