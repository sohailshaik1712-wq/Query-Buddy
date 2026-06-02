import uuid
from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.database_connection import DatabaseConnection, DatabaseConnectionCreate
from app.schemas.workspace import (
    Workspace,
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceUpdate,
)
from app.services.workspace_service import WorkspaceService

router = APIRouter()


@router.get("", response_model=List[WorkspaceRead])
async def list_workspaces(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.get_workspaces(current_user.id)


@router.post("", response_model=WorkspaceRead)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.create_workspace(current_user.id, workspace_in)


@router.patch("/{workspace_id}", response_model=WorkspaceRead)
async def update_workspace(
    workspace_id: uuid.UUID,
    workspace_in: WorkspaceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.update_workspace(
        current_user.id, workspace_id, workspace_in
    )


@router.get("/{workspace_id}", response_model=Workspace)
async def get_workspace(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.get_workspace(current_user.id, workspace_id)


@router.post("/{workspace_id}/connection", response_model=DatabaseConnection)
async def set_connection(
    workspace_id: uuid.UUID,
    connection_in: DatabaseConnectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.set_database_connection(
        current_user.id, workspace_id, connection_in
    )


@router.delete("/{workspace_id}/connection", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    workspace_service = WorkspaceService(db)
    await workspace_service.delete_database_connection(current_user.id, workspace_id)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    workspace_service = WorkspaceService(db)
    await workspace_service.delete_workspace(current_user.id, workspace_id)


@router.post("/{workspace_id}/execute-sql")
async def execute_sql(
    workspace_id: uuid.UUID,
    sql: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    workspace_service = WorkspaceService(db)
    return await workspace_service.execute_raw_sql(current_user.id, workspace_id, sql)
