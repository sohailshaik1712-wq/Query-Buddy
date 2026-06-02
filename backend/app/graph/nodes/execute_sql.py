import uuid

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.database import SessionLocal
from app.graph.state import AgentState
from app.models.database_connection import DatabaseConnection


async def execute_sql_node(state: AgentState):
    """
    Executes the generated SQL query against the user's database.
    """
    workspace_id = state.get("workspace_id")
    sql_query = state.get("sql_query")

    if not sql_query:
        return {"error": "No SQL query to execute"}

    async with SessionLocal() as db:
        result = await db.execute(
            select(DatabaseConnection).where(
                DatabaseConnection.workspace_id == uuid.UUID(workspace_id)
            )
        )
        db_conn = result.scalars().first()

        if not db_conn:
            return {"error": "Database connection not found"}

        url = f"postgresql+asyncpg://{db_conn.username}:{db_conn.password}@{db_conn.host}:{db_conn.port}/{db_conn.database}"

        engine = create_async_engine(url)
        try:
            async with engine.connect() as conn:
                result = await conn.execute(text(sql_query))

                # Fetch results if it was a SELECT query
                if result.returns_rows:
                    rows = result.fetchall()
                    # Convert to list of dicts
                    columns = result.keys()
                    query_results = [dict(zip(columns, row)) for row in rows]
                    return {"query_results": query_results, "error": None}
                else:
                    return {
                        "query_results": [
                            {"message": "Query executed successfully, no rows returned"}
                        ],
                        "error": None,
                    }
        except Exception as e:
            error_msg = str(e)
            # Try to extract the core error message from SQLAlchemy/asyncpg
            if "relation" in error_msg and "does not exist" in error_msg:
                error_msg = f"Table not found: {error_msg.split('relation')[1].strip()}"
            elif "column" in error_msg and "does not exist" in error_msg:
                error_msg = f"Column not found: {error_msg.split('column')[1].strip()}"

            return {"error": f"SQL Execution Error: {error_msg}"}
        finally:
            await engine.dispose()
