import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class MessageBase(BaseModel):
    role: str
    content: str
    metadata_json: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: uuid.UUID
    chat_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
