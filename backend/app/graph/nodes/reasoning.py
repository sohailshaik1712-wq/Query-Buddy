from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.graph.state import AgentState


async def reasoning_node(state: AgentState):
    """
    Analyzes the user's request and the schema to plan the SQL generation.
    """
    messages = state.get("messages", [])
    schema_info = state.get("schema_info", "")
    db_type = state.get("db_type", "postgresql")

    user_query = messages[-1].content

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash", google_api_key=settings.GOOGLE_API_KEY, temperature=0
    )

    system_prompt = f"""You are a Database Analyst. Your goal is to plan a SQL query for {db_type}.

    SCHEMA:
    {schema_info}

    TASK:
    Analyze the user's question and the schema.
    1. Identify which tables and columns are needed.
    2. Determine the necessary joins and their conditions.
    3. Identify any filters, aggregations, or sorting required.
    4. Plan the logical steps to arrive at the answer.

    Respond with a concise step-by-step plan.
    """

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{user_query}")]
    )

    chain = prompt | llm

    try:
        response = await chain.ainvoke({"user_query": user_query})
        return {"reasoning": response.content}
    except Exception as e:
        return {"error": f"Reasoning Error: {str(e)}"}
