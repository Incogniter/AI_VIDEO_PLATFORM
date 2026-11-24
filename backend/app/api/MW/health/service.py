from app.db.session import check_database_connection


def get_service_health() -> dict[str, str]:
    return {"status": "healthy", "service": "AI Video Platform API"}


def check_database_health() -> dict[str, str]:
    check_database_connection()
    return {"status": "healthy", "database": "connected"}
