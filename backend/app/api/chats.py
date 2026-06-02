import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.chat import Chat, ChatCreate, ChatRead, ChatUpdate
from app.services.chat_service import ChatService

router = APIRouter()


@router.get("/workspace/{workspace_id}", response_model=List[ChatRead])
async def list_chats(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat_service = ChatService(db)
    return await chat_service.get_chats(current_user.id, workspace_id)


@router.post("", response_model=ChatRead)
async def create_chat(
    chat_in: ChatCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat_service = ChatService(db)
    return await chat_service.create_chat(current_user.id, chat_in)


@router.get("/thread/{chat_id}", response_model=Chat)
async def get_chat(
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat_service = ChatService(db)
    return await chat_service.get_chat_history(current_user.id, chat_id)


@router.patch("/{chat_id}", response_model=ChatRead)
async def update_chat(
    chat_id: uuid.UUID,
    chat_in: ChatUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat_service = ChatService(db)
    return await chat_service.update_chat(current_user.id, chat_id, chat_in)


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    chat_service = ChatService(db)
    await chat_service.delete_chat(current_user.id, chat_id)
