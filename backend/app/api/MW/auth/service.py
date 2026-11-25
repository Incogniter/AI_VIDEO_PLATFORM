import hmac
import logging
import time
from hashlib import sha256
from secrets import token_urlsafe
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings

bearer_scheme = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


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

        db.execute(
            text("""
                UPDATE private.device_login_requests
                SET status = 'cancelled', session_token_hash = NULL
                WHERE lower(email) = :email AND status IN ('pending', 'approved')
            """),
            {"email": normalized_email},
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


def _admin_headers() -> dict[str, str]:
    settings = get_settings()
    admin_key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not settings.SUPABASE_URL or not admin_key:
        raise HTTPException(status_code=503, detail="Device sign-in is not configured.")
    headers = {"apikey": admin_key, "Content-Type": "application/json"}
    if not admin_key.startswith("sb_secret_"):
        headers["Authorization"] = f"Bearer {admin_key}"
    return headers


def _create_session_token_hash(email: str) -> str:
    settings = get_settings()
    try:
        response = httpx.post(
            f"{settings.SUPABASE_URL}/auth/v1/admin/generate_link",
            headers=_admin_headers(),
            json={"type": "magiclink", "email": email},
            timeout=10.0,
        )
        response.raise_for_status()
        body = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.exception("Could not generate one-time device login token")
        raise HTTPException(status_code=502, detail="Could not approve this sign-in request.") from exc
    token_hash = body.get("hashed_token") or body.get("properties", {}).get("hashed_token")
    if not token_hash:
        logger.error("Supabase Auth did not return a hashed token for device login")
        raise HTTPException(status_code=502, detail="Could not approve this sign-in request.")
    return token_hash


def _broadcast_approval(request_id: UUID) -> None:
    settings = get_settings()
    for attempt in range(3):
        try:
            response = httpx.post(
                f"{settings.SUPABASE_URL}/realtime/v1/api/broadcast/device-login:{request_id}/events/approved?private=false",
                headers={"apikey": settings.SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json"},
                json={"status": "approved"},
                timeout=5.0,
            )
            response.raise_for_status()
            return
        except httpx.HTTPError as exc:
            if attempt == 2:
                logger.exception("Could not broadcast device login approval")
                raise HTTPException(status_code=502, detail="Could not notify the device waiting to sign in.") from exc
            time.sleep(0.15 * (attempt + 1))


def approve_device_login_request(db: Session, request_id: UUID, user: dict) -> dict[str, str]:
    email = (user.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=403, detail="An email-verified account is required.")
    if not user.get("email_confirmed_at"):
        raise HTTPException(status_code=403, detail="An email-verified account is required.")
    try:
        row = db.execute(text("""
            SELECT id, email, status, user_id, expires_at
            FROM private.device_login_requests WHERE id = :id FOR UPDATE
        """), {"id": str(request_id)}).mappings().first()
        if not row or not hmac.compare_digest(row["email"].lower(), email):
            raise HTTPException(status_code=404, detail="Sign-in request not found.")
        if row["expires_at"] <= db.execute(text("SELECT NOW()")).scalar_one():
            db.execute(text("UPDATE private.device_login_requests SET status = 'expired', session_token_hash = NULL WHERE id = :id AND status IN ('pending', 'approved')"), {"id": str(request_id)})
            db.commit()
            raise HTTPException(status_code=410, detail="Sign-in request expired.")
        already_approved = row["status"] == "approved" and str(row["user_id"]) == str(user["id"])
        if already_approved:
            db.commit()
        elif row["status"] != "pending":
            db.execute(text("UPDATE private.device_login_requests SET status = 'expired' WHERE id = :id AND status = 'pending'"), {"id": str(request_id)})
            db.commit()
            raise HTTPException(status_code=410, detail="Sign-in request expired.")
        else:
            token_hash = _create_session_token_hash(email)
            db.execute(text("""
                UPDATE private.device_login_requests
                SET status = 'approved', user_id = :user_id, session_token_hash = :token_hash, approved_at = NOW()
                WHERE id = :id
            """), {"id": str(request_id), "user_id": str(user["id"]), "token_hash": token_hash})
            db.commit()
    except HTTPException:
        if db.in_transaction(): db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Database error approving device login")
        raise HTTPException(status_code=503, detail="Could not approve this sign-in request.") from exc
    _broadcast_approval(request_id)
    return {"status": "approved"}


def _verify_request_secret(db: Session, request_id: UUID, request_secret: str, *, lock: bool = False):
    suffix = " FOR UPDATE" if lock else ""
    row = db.execute(text(f"""
        SELECT id, request_secret_hash, status, expires_at, session_token_hash
        FROM private.device_login_requests WHERE id = :id{suffix}
    """), {"id": str(request_id)}).mappings().first()
    supplied_hash = sha256(request_secret.encode("utf-8")).hexdigest()
    if not row or not hmac.compare_digest(row["request_secret_hash"], supplied_hash):
        raise HTTPException(status_code=404, detail="Sign-in request not found.")
    return row


def exchange_device_login(db: Session, request_id: UUID, request_secret: str) -> dict[str, str]:
    try:
        row = _verify_request_secret(db, request_id, request_secret, lock=True)
        now = db.execute(text("SELECT NOW()")).scalar_one()
        if row["expires_at"] <= now:
            db.execute(text("UPDATE private.device_login_requests SET status = 'expired', session_token_hash = NULL WHERE id = :id"), {"id": str(request_id)})
            db.commit()
            raise HTTPException(status_code=410, detail="Sign-in request expired.")
        if row["status"] != "approved" or not row["session_token_hash"]:
            raise HTTPException(status_code=409, detail="Sign-in request is not approved.")
        token_hash = row["session_token_hash"]
        db.execute(text("""
            UPDATE private.device_login_requests SET status = 'completed', session_token_hash = NULL, completed_at = NOW()
            WHERE id = :id AND status = 'approved'
        """), {"id": str(request_id)})
        db.commit()
        return {"token_hash": token_hash, "type": "magiclink"}
    except HTTPException:
        if db.in_transaction(): db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail="Could not complete sign-in.") from exc
