import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class DatabaseConnectionBase(BaseModel):
    db_type: str
    host: str
    port: int
    database: str
    username: str
    extra_params: Optional[Dict[str, Any]] = {}


class DatabaseConnectionCreate(DatabaseConnectionBase):
    password: str


class DatabaseConnectionUpdate(BaseModel):
    db_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    extra_params: Optional[Dict[str, Any]] = None


class DatabaseConnection(DatabaseConnectionBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
