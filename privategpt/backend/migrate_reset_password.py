#!/usr/bin/env python3
"""Reset password for michael.dabrock@web.de"""
import os
import asyncio
from sqlalchemy import text
from database import get_async_engine

HASH = "$2b$12$tdH54f1xv0ax4hla.sLZneY7O8bpGIK6dTEz6YQ0gZRA7qgq4rtLm"  # Password: 12345678

async def reset_password():
    """Reset password for michael.dabrock@web.de"""
    engine = get_async_engine()

    async with engine.begin() as conn:
        await conn.execute(
            text("UPDATE users SET password_hash = :hash WHERE email = :email"),
            {"hash": HASH, "email": "michael.dabrock@web.de"}
        )
        print("✅ Password reset for michael.dabrock@web.de to: 12345678")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_password())
