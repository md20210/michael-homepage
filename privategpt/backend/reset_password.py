#!/usr/bin/env python3
"""Reset password for a user in Railway PostgreSQL database"""
import os
import sys
import asyncio
from passlib.context import CryptContext
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def reset_password(email: str, new_password: str):
    """Reset user password"""

    # Get DATABASE_URL from Railway environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)

    # Convert to async URL
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    print(f"🔐 Resetting password for: {email}")

    # Create async engine
    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if user exists
        result = await session.execute(
            text("SELECT id, email FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()

        if not user:
            print(f"❌ User not found: {email}")
            await engine.dispose()
            sys.exit(1)

        print(f"✅ Found user ID: {user.id}")

        # Hash new password
        hashed_password = pwd_context.hash(new_password)
        print(f"🔒 Generated password hash: {hashed_password[:50]}...")

        # Update password
        await session.execute(
            text("UPDATE users SET password_hash = :password_hash WHERE email = :email"),
            {"password_hash": hashed_password, "email": email}
        )
        await session.commit()

        print(f"✅ Password updated successfully for {email}")
        print(f"   New password: {new_password}")

    await engine.dispose()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reset_password.py <email> <new_password>")
        sys.exit(1)

    email = sys.argv[1]
    new_password = sys.argv[2]

    asyncio.run(reset_password(email, new_password))
