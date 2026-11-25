from hashlib import sha256
from secrets import token_urlsafe

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A valid bearer token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    settings = get_settings()
    if not settings.SUPABASE_URL or not settings.SUPABASE_PUBLISHABLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured on this server.",
        )

    try:
        response = httpx.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": settings.SUPABASE_PUBLISHABLE_KEY,
                "Authorization": f"Bearer {credentials.credentials}",
            },
            timeout=5.0,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase Auth could not be reached.",
        ) from exc

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The Supabase session is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase Auth could not validate the session.",
        )

    user = response.json()
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase Auth returned an invalid user profile.",
        )

    return user


def create_device_login_request(db: Session, email: str) -> dict[str, object]:
    normalized_email = email.strip().lower()
    request_secret = token_urlsafe(32)
    request_secret_hash = sha256(request_secret.encode("utf-8")).hexdigest()

    try:
        recent_pending_request = db.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM private.device_login_requests
                    WHERE lower(email) = :email
                      AND status = 'pending'
                      AND expires_at > NOW()
                      AND created_at > NOW() - INTERVAL '1 minute'
                )
                """
            ),
            {"email": normalized_email},
        ).scalar_one()

        if recent_pending_request:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="A recent sign-in request is still active. Try again shortly.",
            )

        row = db.execute(
            text(
                """
                INSERT INTO private.device_login_requests (email, request_secret_hash)
                VALUES (:email, :request_secret_hash)
                RETURNING id, expires_at
                """
            ),
            {
                "email": normalized_email,
                "request_secret_hash": request_secret_hash,
            },
        ).mappings().one()
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not create a sign-in request.",
        ) from exc

    return {
        "request_id": str(row["id"]),
        "request_secret": request_secret,
        "expires_at": row["expires_at"],
    }
