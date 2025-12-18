#!/usr/bin/env python3
"""
Migration: Add email_verified and verification_token columns to users table
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def migrate():
    """Add email verification columns if they don't exist"""
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
            # Check if email_verified column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='email_verified'
            """))

            if result.fetchone() is None:
                print("\n✅ Adding email_verified column...")
                await conn.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE
                """))
                print("✅ Column email_verified added.\n")
            else:
                print("\n⚠️  Column email_verified already exists.\n")

            # Check if verification_token column exists
            result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='verification_token'
            """))

            if result.fetchone() is None:
                print("✅ Adding verification_token column...")
                await conn.execute(text("""
                    ALTER TABLE users
                    ADD COLUMN verification_token VARCHAR NULL
                """))

                # Add index
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_users_verification_token
                    ON users(verification_token)
                """))
                print("✅ Column verification_token added with index.\n")
            else:
                print("⚠️  Column verification_token already exists.\n")

            print("✅ Migration successful!\n")
            return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}\n")
        return False
    finally:
        await engine.dispose()

if __name__ == "__main__":
    success = asyncio.run(migrate())
    exit(0 if success else 1)
