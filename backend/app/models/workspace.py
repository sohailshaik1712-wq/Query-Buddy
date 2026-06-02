import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.chat import Chat
    from app.models.database_connection import DatabaseConnection
    from app.models.user import User


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="workspaces")

    # 1:1 Relationship with DatabaseConnection
    database_connection: Mapped["DatabaseConnection"] = relationship(
        back_populates="workspace",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    # 1:N Relationship with Chat
    chats: Mapped[List["Chat"]] = relationship(
        back_populates="workspace", cascade="all, delete-orphan", lazy="selectin"
    )
