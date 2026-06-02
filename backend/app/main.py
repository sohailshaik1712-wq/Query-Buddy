from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.chats import router as chats_router
from app.api.messages import router as messages_router
from app.api.workspaces import router as workspaces_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(
    workspaces_router, prefix=f"{settings.API_V1_STR}/workspaces", tags=["workspaces"]
)
app.include_router(chats_router, prefix=f"{settings.API_V1_STR}/chats", tags=["chats"])
app.include_router(
    messages_router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"]
)


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
