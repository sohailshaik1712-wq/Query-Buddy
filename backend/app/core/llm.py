from langchain_openai import ChatOpenAI

from app.core.config import settings


def get_llm(model: str = "deepseek-v4-flash", temperature: float = 0):
    """
    Returns a ChatOpenAI instance configured for DeepSeek.
    """
    return ChatOpenAI(
        model=model,
        openai_api_key=settings.DEEPSEEK_API_KEY,
        openai_api_base=settings.DEEPSEEK_API_BASE,
        temperature=temperature,
    )
