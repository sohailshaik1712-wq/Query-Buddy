import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.user import User
from app.models.workspace import Workspace


async def test_create_workspace():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Try to find a user
        from sqlalchemy import select

        result = await session.execute(select(User))
        user = result.scalars().first()

        if not user:
            print("No user found. Please register first.")
            return

        print(f"Testing workspace creation for user: {user.email}")

        try:
            new_ws = Workspace(
                name="Test Workspace", description="Manual test", owner_id=user.id
            )
            session.add(new_ws)
            await session.commit()
            print(f"Successfully created workspace: {new_ws.id}")
        except Exception as e:
            print(f"Error creating workspace: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_create_workspace())
