import json

from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.graph.state import AgentState


async def format_response_node(state: AgentState):
    """
    Summarizes data results using Gemini 1.5 Flash for efficiency.
    """
    query_results = state.get("query_results")
    error = state.get("error")
    user_messages = state.get("messages", [])
    user_query = user_messages[-1].content if user_messages else ""
    result_text = json.dumps(query_results, default=str)

    # Use Gemini Flash for conversational summaries.
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.7,
    )

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
        # Fallback to standard 1.5 flash
        try:
            llm_fallback = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash", google_api_key=settings.GOOGLE_API_KEY
            )
            response = await (prompt | llm_fallback).ainvoke(prompt_input)
            return {
                "final_answer": response.content,
                "messages": [AIMessage(content=response.content)],
            }
        except Exception:
            return {
                "final_answer": f"I processed the query but had trouble formatting the response: {str(e)}"
            }
