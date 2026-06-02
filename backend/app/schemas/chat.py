import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.message import Message


class ChatBase(BaseModel):
    title: Optional[str] = "New Chat"


class ChatCreate(ChatBase):
    workspace_id: uuid.UUID


class ChatUpdate(BaseModel):
    title: Optional[str] = None


class ChatRead(ChatBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Chat(ChatRead):
    # Optional nested relationship
    messages: List[Message] = []
