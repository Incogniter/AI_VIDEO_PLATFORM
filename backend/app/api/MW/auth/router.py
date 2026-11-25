from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.MW.auth.service import (approve_device_login_request, create_device_login_request, exchange_device_login, get_current_user)
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


class DeviceLoginRequestBody(BaseModel):
    email: EmailStr


class DeviceLoginRequestResponse(BaseModel):
    request_id: UUID
    request_secret: str
    expires_at: datetime


class DeviceLoginSecretBody(BaseModel):
    request_secret: str


@router.post(
    "/device-login-requests",
    response_model=DeviceLoginRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_device_login(
    body: DeviceLoginRequestBody,
    db: Session = Depends(get_db),
) -> dict[str, object]:
    return create_device_login_request(db, str(body.email))


@router.post("/device-login-requests/{request_id}/approve")
def approve_device_login(request_id: UUID, db: Session = Depends(get_db), user: dict = Depends(get_current_user)) -> dict[str, str]:
    return approve_device_login_request(db, request_id, user)


@router.post("/device-login-requests/{request_id}/exchange")
def exchange_device_login_token(request_id: UUID, body: DeviceLoginSecretBody, db: Session = Depends(get_db)) -> dict[str, str]:
    return exchange_device_login(db, request_id, body.request_secret)


@router.get("/me")
def current_user(user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": user["id"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "user_metadata": user.get("user_metadata", {}),
    }
