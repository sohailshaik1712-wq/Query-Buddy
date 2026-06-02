import uuid

from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine

from app.models.database_connection import DatabaseConnection


class DatabaseService:
    @staticmethod
    def test_connection(connection: DatabaseConnection) -> bool:
        """
        Sync test for database connection.
        In a real app, this should support multiple DB types.
        """
        # Construction of connection string (example for Postgres)
        if connection.db_type == "postgresql":
            url = f"postgresql://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}"
            try:
                engine = create_engine(url, connect_args={"connect_timeout": 5})
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                return True
            except Exception as e:
                print(f"Connection failed: {e}")
                return False
        return False

    @staticmethod
    async def get_schema_info(connection: DatabaseConnection) -> str:
        """
        Retrieves schema info for the LLM.
        Currently supports PostgreSQL.
        """
        if connection.db_type != "postgresql":
            return f"Unsupported database type: {connection.db_type}"

        url = f"postgresql+asyncpg://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}"
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                # Query to get tables and their columns
                query = text("""
                    SELECT
                        table_name,
                        column_name,
                        data_type
                    FROM
                        information_schema.columns
                    WHERE
                        table_schema = 'public'
                    ORDER BY
                        table_name, ordinal_position;
                """)
                result = await conn.execute(query)
                rows = result.fetchall()

                if not rows:
                    return "No tables found in the public schema."

                schema_parts = []
                current_table = ""
                for row in rows:
                    table, column, dtype = row
                    if table != current_table:
                        current_table = table
                        schema_parts.append(f"\nTable: {table}")
                    schema_parts.append(f"  - {column} ({dtype})")

                return "\n".join(schema_parts)
        except Exception as e:
            return f"Error extracting schema: {str(e)}"
        finally:
            await engine.dispose()

    @staticmethod
    async def execute_query(connection: DatabaseConnection, query: str):
        """
        Executes a raw SQL query and returns results.
        """
        if connection.db_type != "postgresql":
            raise ValueError(f"Unsupported database type: {connection.db_type}")

        url = f"postgresql+asyncpg://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}"
        engine = create_async_engine(url)
        try:
            async with engine.connect() as conn:
                result = await conn.execute(text(query))
                if result.returns_rows:
                    rows = result.fetchall()
                    return [dict(row._mapping) for row in rows]
                else:
                    # For non-SELECT queries, commit and return message
                    await conn.commit()
                    return [
                        {"message": "Query executed successfully, no rows returned."}
                    ]
        finally:
            await engine.dispose()
