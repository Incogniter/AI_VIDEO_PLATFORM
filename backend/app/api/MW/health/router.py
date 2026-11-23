from fastapi import APIRouter, HTTPException

from app.db.session import check_database_connection

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "AI Video Platform API"}


@router.get("/health/db")
async def database_health() -> dict[str, str]:
    try:
        await check_database_connection()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed",
        ) from exc

    return {"status": "healthy", "database": "connected"}
