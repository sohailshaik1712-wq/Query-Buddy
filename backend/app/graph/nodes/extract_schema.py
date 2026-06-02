import uuid

from sqlalchemy import select

from app.core.database import SessionLocal
from app.graph.state import AgentState
from app.models.database_connection import DatabaseConnection
from app.services.database_service import DatabaseService


async def extract_schema_node(state: AgentState):
    """
    Connects to the database and extracts its schema information.
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

        # Use DatabaseService to get real schema info
        schema_info = await DatabaseService.get_schema_info(db_conn)

        if schema_info.startswith("Error"):
            return {"error": schema_info}

        return {"schema_info": schema_info}
