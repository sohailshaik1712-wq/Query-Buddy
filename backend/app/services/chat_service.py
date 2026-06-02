import asyncio
import uuid
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import Chat
from app.models.message import Message
from app.repositories.chat_repository import ChatRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.chat import ChatCreate, ChatUpdate
from app.schemas.message import MessageCreate


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.chat_repo = ChatRepository(db)
        self.workspace_repo = WorkspaceRepository(db)

    async def get_chats(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID
    ) -> List[Chat]:
        # Verify workspace ownership
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace or workspace.owner_id != user_id:
            raise HTTPException(status_code=404, detail="Workspace not found")

        return await self.chat_repo.get_multi_by_workspace(workspace_id)

    async def create_chat(self, user_id: uuid.UUID, chat_in: ChatCreate) -> Chat:
        workspace = await self.workspace_repo.get_by_id(chat_in.workspace_id)
        if not workspace or workspace.owner_id != user_id:
            raise HTTPException(status_code=404, detail="Workspace not found")

        return await self.chat_repo.create(chat_in)

    async def get_chat_history(self, user_id: uuid.UUID, chat_id: uuid.UUID) -> Chat:
        chat = await self.chat_repo.get_by_id(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        # Verify ownership through workspace
        workspace = await self.workspace_repo.get_by_id(chat.workspace_id)
        if not workspace or workspace.owner_id != user_id:
            raise HTTPException(status_code=404, detail="Chat not found")

        return chat

    async def add_message(
        self, user_id: uuid.UUID, chat_id: uuid.UUID, message_in: MessageCreate
    ) -> Message:
        await self.get_chat_history(user_id, chat_id)  # Verification
        return await self.chat_repo.add_message(chat_id, message_in)

    async def delete_chat(self, user_id: uuid.UUID, chat_id: uuid.UUID) -> None:
        await self.get_chat_history(user_id, chat_id)  # Verification
        await self.chat_repo.remove(chat_id)

    async def update_chat(
        self, user_id: uuid.UUID, chat_id: uuid.UUID, chat_in: ChatUpdate
    ) -> Chat:
        chat = await self.get_chat_history(user_id, chat_id)  # Verification

        update_data = chat_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(chat, field, value)

        self.db.add(chat)
        await self.db.flush()
        return chat
