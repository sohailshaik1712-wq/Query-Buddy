from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.graph.state import AgentState


async def generate_sql_node(state: AgentState):
    """
    Generates SQL using Gemini 1.5 Flash for high precision.
    """
    messages = state.get("messages", [])
    schema_info = state.get("schema_info", "")
    reasoning = state.get("reasoning", "")
    db_type = state.get("db_type", "postgresql")
    previous_error = state.get("error")
    previous_query = state.get("sql_query")
    retry_count = state.get("retry_count", 0)

    user_query = messages[-1].content

    # Use Gemini Flash for complex SQL generation.
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", google_api_key=settings.GOOGLE_API_KEY, temperature=0
    )

    system_prompt = f"""You are a {db_type} expert. Generate a query based on the schema and reasoning plan below.

    SCHEMA:
    {schema_info}

    REASONING PLAN:
    {reasoning}

    RULES:
    1. Return ONLY the raw SQL. No markdown, no formatting.
    2. Use exact table/column names.
    """

    if previous_error and retry_count > 0:
        system_prompt += f"""
        PREVIOUS ATTEMPT FAILED:
        Query: {previous_query}
        Error: {previous_error}

        FIX the error above. Ensure the SQL is valid and solves the user's request.
        """

    prompt = ChatPromptTemplate.from_messages(
        [("system", system_prompt), ("human", "{user_query}")]
    )

    chain = prompt | llm

    try:
        response = await chain.ainvoke({"user_query": user_query})
        sql = (
            str(response.content)
            .strip()
            .replace("```sql", "")
            .replace("```", "")
            .strip()
        )
        return {"sql_query": sql, "retry_count": retry_count + 1, "error": None}
    except Exception as e:
        return {"error": f"Gemini Flash Error: {str(e)}"}
