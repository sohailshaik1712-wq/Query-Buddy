import uuid
from typing import Any, List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import Message, MessageCreate
from app.services.agent_service import AgentService
from app.services.chat_service import ChatService

router = APIRouter()


@router.post("/{chat_id}", response_model=List[Message])
async def send_message(
    chat_id: uuid.UUID,
    message_in: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    chat_service = ChatService(db)
    agent_service = AgentService(db)

    # 1. Save user message
    user_msg = await chat_service.add_message(current_user.id, chat_id, message_in)

    # 2. Get chat to find workspace_id
    chat = await chat_service.get_chat_history(current_user.id, chat_id)

    # 3. Run the LangGraph agent
    assistant_msg = await agent_service.run_query_agent(
        chat.workspace_id, chat_id, message_in.content
    )

    # Return both messages to update the frontend UI immediately
    return [user_msg, assistant_msg]
