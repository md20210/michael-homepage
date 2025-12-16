#!/usr/bin/env python3
"""
Migration: Add password_hash column to users table
Run this on Railway: python migrate_add_password.py
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def migrate():
    """Add password_hash column if it doesn't exist"""
    database_url = os.getenv('DATABASE_URL', '')

    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return False

    # Convert to asyncpg format
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)

    print(f"🔄 Connecting to database...")
    engine = create_async_engine(database_url, echo=True)

    try:
        async with engine.begin() as conn:
            # Check if column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='password_hash'
            """))

            if result.fetchone() is None:
                print("\n✅ Adding password_hash column...")
                await conn.execute(text("""
                    ALTER TABLE users ADD COLUMN password_hash VARCHAR NULL
                """))
                print("✅ Migration successful! Column password_hash added.\n")
                return True
            else:
                print("\n⚠️  Column password_hash already exists. No migration needed.\n")
                return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}\n")
        return False
    finally:
        await engine.dispose()

if __name__ == "__main__":
    success = asyncio.run(migrate())
    exit(0 if success else 1)
