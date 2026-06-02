import asyncio
import json
import uuid
from datetime import date, datetime
from typing import Any

from langchain_core.messages import HumanMessage

from app.graph.query_graph import create_query_graph
from app.repositories.chat_repository import ChatRepository
from app.schemas.message import MessageCreate


class AgentService:
    def __init__(self, db):
        self.db = db
        self.chat_repo = ChatRepository(db)

    def _default_serializer(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, uuid.UUID):
            return str(obj)
        return str(obj)

    async def run_query_agent(
        self, workspace_id: uuid.UUID, chat_id: uuid.UUID, user_message: str
    ):
        # Initialize the graph
        graph = create_query_graph()

        # Prepare the initial state
        initial_state = {
            "messages": [HumanMessage(content=user_message)],
            "workspace_id": str(workspace_id),
            "retry_count": 0,
            "max_retries": 3,
        }

        try:
            final_state = await asyncio.wait_for(
                graph.ainvoke(initial_state), timeout=60
            )
        except Exception as exc:
            error_message = (
                "LLM request timed out after 60 seconds"
                if isinstance(exc, asyncio.TimeoutError)
                else str(exc)
            )
            assistant_message = MessageCreate(
                role="assistant",
                content=(
                    "I couldn't process that question right now. "
                    "Check that the LLM API key and database connection are configured."
                ),
                metadata_json={"error": error_message},
            )
            return await self.chat_repo.add_message(chat_id, assistant_message)

        # Prepare metadata
        raw_metadata = {
            "sql": final_state.get("sql_query"),
            "results": final_state.get("query_results"),
            "error": final_state.get("error"),
        }

        # Ensure it's fully serializable
        safe_metadata = json.loads(
            json.dumps(raw_metadata, default=self._default_serializer)
        )

        assistant_message = MessageCreate(
            role="assistant",
            content=final_state.get(
                "final_answer", "I encountered an error processing your request."
            ),
            metadata_json=safe_metadata,
        )

        return await self.chat_repo.add_message(chat_id, assistant_message)
