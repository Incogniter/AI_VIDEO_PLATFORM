from fastapi import APIRouter, Depends

from app.api.MW.auth.service import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me")
def current_user(user: dict = Depends(get_current_user)) -> dict:
    return {
        "id": user["id"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "user_metadata": user.get("user_metadata", {}),
    }
