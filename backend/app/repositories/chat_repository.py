import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import Chat
from app.models.message import Message
from app.schemas.chat import ChatCreate, ChatUpdate
from app.schemas.message import MessageCreate


class ChatRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, chat_id: uuid.UUID) -> Optional[Chat]:
        result = await self.db.execute(
            select(Chat).where(Chat.id == chat_id).options(selectinload(Chat.messages))
        )
        return result.scalars().first()

    async def get_multi_by_workspace(
        self, workspace_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Chat]:
        result = await self.db.execute(
            select(Chat)
            .where(Chat.workspace_id == workspace_id)
            .order_by(Chat.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(self, chat_in: ChatCreate) -> Chat:
        db_obj = Chat(**chat_in.model_dump())
        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def add_message(
        self, chat_id: uuid.UUID, message_in: MessageCreate
    ) -> Message:
        db_obj = Message(chat_id=chat_id, **message_in.model_dump())
        self.db.add(db_obj)
        # Update chat updated_at timestamp
        result = await self.db.execute(select(Chat).where(Chat.id == chat_id))
        chat = result.scalars().first()
        if chat:
            from datetime import datetime

            chat.updated_at = datetime.utcnow()

        await self.db.flush()
        return db_obj

    async def remove(self, chat_id: uuid.UUID) -> Optional[Chat]:
        db_obj = await self.get_by_id(chat_id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
        return db_obj
