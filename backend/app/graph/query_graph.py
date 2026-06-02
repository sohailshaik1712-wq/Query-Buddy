from langgraph.graph import END, StateGraph

from app.graph.nodes.execute_sql import execute_sql_node
from app.graph.nodes.extract_schema import extract_schema_node
from app.graph.nodes.fetch_context import fetch_context_node
from app.graph.nodes.format_response import format_response_node
from app.graph.nodes.generate_sql import generate_sql_node
from app.graph.nodes.reasoning import reasoning_node
from app.graph.nodes.validate_query import validate_query_node
from app.graph.state import AgentState


def should_continue(state: AgentState):
    """
    Determines if we should retry SQL generation or move to execution.
    """
    error = state.get("error")
    retry_count = state.get("retry_count", 0)
    max_retries = state.get("max_retries", 3)

    if error and retry_count < max_retries:
        return "generate_sql"
    return "execute_sql"


def create_query_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("fetch_context", fetch_context_node)
    workflow.add_node("extract_schema", extract_schema_node)
    workflow.add_node("reasoning", reasoning_node)
    workflow.add_node("generate_sql", generate_sql_node)
    workflow.add_node("validate_query", validate_query_node)
    workflow.add_node("execute_sql", execute_sql_node)
    workflow.add_node("format_response", format_response_node)

    workflow.set_entry_point("fetch_context")
    workflow.add_edge("fetch_context", "extract_schema")
    workflow.add_edge("extract_schema", "reasoning")
    workflow.add_edge("reasoning", "generate_sql")
    workflow.add_edge("generate_sql", "validate_query")

    # Conditional logic for self-correction
    workflow.add_conditional_edges(
        "validate_query",
        should_continue,
        {"generate_sql": "generate_sql", "execute_sql": "execute_sql"},
    )

    # If execute fails, we also might want to retry
    workflow.add_conditional_edges(
        "execute_sql",
        should_continue,
        {
            "generate_sql": "generate_sql",
            "execute_sql": "format_response",  # In should_continue, no error means proceed
        },
    )

    workflow.add_edge("format_response", END)

    return workflow.compile()
