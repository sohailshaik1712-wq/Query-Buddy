from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.schemas import Token, User, UserCreate
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=User)
async def register(*, db: AsyncSession = Depends(get_db), user_in: UserCreate) -> Any:
    auth_service = AuthService(db)
    user = await auth_service.register_user(user_in)
    return user


@router.get("/me", response_model=User)
async def read_current_user(
    current_user: UserModel = Depends(get_current_user),
) -> Any:
    return current_user


@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    auth_service = AuthService(db)
    user = await auth_service.authenticate(
        email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": auth_service.create_token(user),
        "token_type": "bearer",
    }
