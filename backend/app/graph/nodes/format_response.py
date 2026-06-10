import json

from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm
from app.graph.state import AgentState


async def format_response_node(state: AgentState):
    """
    Summarizes data results using DeepSeek for efficiency.
    """
    query_results = state.get("query_results")
    error = state.get("error")
    user_messages = state.get("messages", [])
    user_query = user_messages[-1].content if user_messages else ""
    result_text = json.dumps(query_results, default=str)

    # Use DeepSeek for conversational summaries.
    llm = get_llm(temperature=0.7)

    if error:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "The user tried to query their database, but an error occurred. Explain the error politely and suggest what might be wrong.",
                ),
                ("human", "Query: {user_query}\nError: {error}"),
            ]
        )
        prompt_input = {"user_query": user_query, "error": error}
    else:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful data assistant. Based on the user's query and the data returned from their database, provide a concise and conversational summary of the results.",
                ),
                ("human", "Query: {user_query}\nData: {query_results}"),
            ]
        )
        prompt_input = {"user_query": user_query, "query_results": result_text}

    chain = prompt | llm

    try:
        response = await chain.ainvoke(prompt_input)
        return {
            "final_answer": response.content,
            "messages": [AIMessage(content=response.content)],
        }
    except Exception as e:
        return {
            "final_answer": f"I processed the query but had trouble formatting the response: {str(e)}"
        }
