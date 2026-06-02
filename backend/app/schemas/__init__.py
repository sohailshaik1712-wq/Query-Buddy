from typing import Optional

# Also include a schema for authentication tokens
from pydantic import BaseModel

from app.schemas.chat import Chat, ChatCreate, ChatRead, ChatUpdate
from app.schemas.database_connection import (
    DatabaseConnection,
    DatabaseConnectionCreate,
    DatabaseConnectionUpdate,
)
from app.schemas.message import Message, MessageCreate
from app.schemas.user import User, UserCreate, UserUpdate
from app.schemas.workspace import Workspace, WorkspaceCreate, WorkspaceUpdate


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
