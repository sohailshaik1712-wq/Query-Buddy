import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database_connection import DatabaseConnection
from app.models.workspace import Workspace
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.database_connection import DatabaseConnectionCreate
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate


class WorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.workspace_repo = WorkspaceRepository(db)

    async def get_workspaces(self, user_id: uuid.UUID) -> List[Workspace]:
        return await self.workspace_repo.get_multi_by_owner(owner_id=user_id)

    async def create_workspace(
        self, user_id: uuid.UUID, workspace_in: WorkspaceCreate
    ) -> Workspace:
        return await self.workspace_repo.create_with_owner(workspace_in, user_id)

    async def update_workspace(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID, workspace_in: WorkspaceUpdate
    ) -> Workspace:
        workspace = await self.get_workspace(user_id, workspace_id)
        return await self.workspace_repo.update(workspace, workspace_in)

    async def get_workspace(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID
    ) -> Workspace:
        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace or workspace.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found"
            )
        return workspace

    async def set_database_connection(
        self,
        user_id: uuid.UUID,
        workspace_id: uuid.UUID,
        connection_in: DatabaseConnectionCreate,
    ) -> DatabaseConnection:
        workspace = await self.get_workspace(user_id, workspace_id)

        # If connection already exists, update it, otherwise create
        if workspace.database_connection:
            db_conn = workspace.database_connection
            for field, value in connection_in.model_dump().items():
                setattr(db_conn, field, value)
        else:
            db_conn = DatabaseConnection(
                workspace_id=workspace_id, **connection_in.model_dump()
            )
            self.db.add(db_conn)

        await self.db.flush()
        return db_conn

    async def delete_database_connection(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID
    ) -> None:
        workspace = await self.get_workspace(user_id, workspace_id)
        if workspace.database_connection:
            await self.db.delete(workspace.database_connection)
            await self.db.flush()

    async def delete_workspace(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID
    ) -> None:
        workspace = await self.get_workspace(user_id, workspace_id)
        await self.workspace_repo.remove(workspace_id)

    async def execute_raw_sql(
        self, user_id: uuid.UUID, workspace_id: uuid.UUID, sql: str
    ):
        workspace = await self.get_workspace(user_id, workspace_id)
        if not workspace.database_connection:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No database connection configured for this workspace",
            )

        from app.services.database_service import DatabaseService

        return await DatabaseService.execute_query(workspace.database_connection, sql)
