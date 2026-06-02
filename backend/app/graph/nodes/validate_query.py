from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.graph.state import AgentState


async def validate_query_node(state: AgentState):
    """
    Evaluates SQL safety and intent using Gemini 1.5 Flash.
    """
    sql_query = state.get("sql_query")
    user_query = state.get("messages")[-1].content
    schema_info = state.get("schema_info")

    # Use Gemini Flash for critical auditing.
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash", google_api_key=settings.GOOGLE_API_KEY, temperature=0
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are a SQL Auditor. Evaluate the following:
        1. Does the SQL correctly answer the user's question?
        2. Is the SQL safe (no DROP, DELETE, TRUNCATE)?
        3. Are the table/column names correct based on the schema?

        SCHEMA: {schema_info}

        Respond with 'VALID' or an explanation of what is wrong.
        """,
            ),
            ("human", f"User Question: {user_query}\nGenerated SQL: {sql_query}"),
        ]
    )

    chain = prompt | llm

    try:
        response = await chain.ainvoke({"schema_info": schema_info})
        decision = str(response.content).strip()
        if decision.upper() == "VALID":
            return {"reflection_comment": "VALID", "error": None}
        else:
            return {
                "error": f"Validation Failed: {decision}",
                "reflection_comment": decision,
            }
    except Exception as e:
        return {"error": f"Validation Error (Gemini Flash): {str(e)}"}
