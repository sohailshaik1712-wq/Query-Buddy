from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    # Conversation history
    messages: Annotated[List[BaseMessage], add_messages]

    # Context
    workspace_id: str
    db_type: str

    # Intermediate steps
    schema_info: Optional[str]
    reasoning: Optional[str]
    sql_query: Optional[str]
    query_results: Optional[List[Dict[str, Any]]]

    # Robustness & Self-Correction
    retry_count: int
    max_retries: int
    reflection_comment: Optional[str]

    # Error handling
    error: Optional[str]

    # Final response
    final_answer: Optional[str]
