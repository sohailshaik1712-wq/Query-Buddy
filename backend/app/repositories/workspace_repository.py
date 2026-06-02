import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        result = await self.db.execute(
            select(Workspace)
            .where(Workspace.id == workspace_id)
            .options(selectinload(Workspace.database_connection))
        )
        return result.scalars().first()

    async def get_multi_by_owner(
        self, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Workspace]:
        result = await self.db.execute(
            select(Workspace)
            .where(Workspace.owner_id == owner_id)
            .options(selectinload(Workspace.database_connection))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create_with_owner(
        self, workspace_in: WorkspaceCreate, owner_id: uuid.UUID
    ) -> Workspace:
        db_obj = Workspace(**workspace_in.model_dump(), owner_id=owner_id)
        self.db.add(db_obj)
        await self.db.flush()
        # Re-fetch using get_by_id to ensure eager loading and session compatibility
        return await self.get_by_id(db_obj.id)

    async def update(
        self, db_obj: Workspace, workspace_in: WorkspaceUpdate
    ) -> Workspace:
        update_data = workspace_in.model_dump(exclude_unset=True)
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def remove(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        db_obj = await self.get_by_id(workspace_id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
        return db_obj
