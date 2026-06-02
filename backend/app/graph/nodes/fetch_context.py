import uuid

from sqlalchemy import select

from app.core.database import SessionLocal
from app.graph.state import AgentState
from app.models.database_connection import DatabaseConnection


async def fetch_context_node(state: AgentState):
    """
    Fetches the database connection details for the given workspace.
    """
    workspace_id = state.get("workspace_id")
    if not workspace_id:
        return {"error": "No workspace_id provided in state"}

    async with SessionLocal() as db:
        result = await db.execute(
            select(DatabaseConnection).where(
                DatabaseConnection.workspace_id == uuid.UUID(workspace_id)
            )
        )
        db_conn = result.scalars().first()

        if not db_conn:
            return {
                "error": f"No database connection found for workspace {workspace_id}"
            }

        return {
            "db_type": db_conn.db_type,
            # We'll store the actual connection object or its details in a way
            # that nodes can use it. For now, let's just return the db_type
            # and we might need to pass the whole object or a connection string.
        }
