"""Authentication with Magic Links"""
import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import resend

from config import get_settings
from database import get_db, User, MagicLink

settings = get_settings()
security = HTTPBearer()

# Configure Resend
resend.api_key = settings.resend_api_key


def create_jwt_token(email: str) -> str:
    """Create JWT token for authenticated user"""
    expire = datetime.utcnow() + timedelta(days=settings.session_expiry_days)
    payload = {
        "sub": email,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


async def verify_jwt_token(token: str) -> Optional[str]:
    """Verify JWT token and return email"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    email = await verify_jwt_token(token)

    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()

    return user


async def create_magic_link(email: str, db: AsyncSession) -> str:
    """Create magic link token and send email"""
    # Generate secure token
    token = secrets.token_urlsafe(32)

    # Create expiry time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.magic_link_expiry_minutes)

    # Save to database
    magic_link = MagicLink(
        email=email,
        token=token,
        expires_at=expires_at
    )
    db.add(magic_link)
    await db.commit()

    # Create magic link URL
    # Construct magic link URL with /privategpt/ base path
    magic_link_url = f"{settings.frontend_url}/privategpt/auth/verify?token={token}"

    # Send email
    try:
        resend.Emails.send({
            "from": settings.from_email,
            "to": email,
            "subject": "🔐 Dein Login-Link für Dabrock PrivateGxT",
            "html": f"""
            <h2>Willkommen bei Dabrock PrivateGxT!</h2>
            <p>Klicke auf den folgenden Link, um dich anzumelden:</p>
            <p><a href="{magic_link_url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                🔐 Jetzt anmelden
            </a></p>
            <p>Dieser Link ist <strong>15 Minuten</strong> gültig.</p>
            <p>Falls du diese E-Mail nicht angefordert hast, ignoriere sie einfach.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
                Dabrock PrivateGxT - DSGVO-konform & sicher<br>
                Deine Daten bleiben bei dir.
            </p>
            """
        })
    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email"
        )

    return token


async def verify_magic_link(token: str, db: AsyncSession) -> str:
    """Verify magic link token and return JWT"""
    # Find magic link
    result = await db.execute(
        select(MagicLink).where(
            MagicLink.token == token,
            MagicLink.used == False
        )
    )
    magic_link = result.scalar_one_or_none()

    if magic_link is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired link"
        )

    # Check if expired
    if datetime.utcnow() > magic_link.expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Link expired"
        )

    # Mark as used
    magic_link.used = True

    # Get or create user
    result = await db.execute(select(User).where(User.email == magic_link.email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(email=magic_link.email)
        db.add(user)

    user.last_login = datetime.utcnow()
    await db.commit()

    # Create JWT token
    jwt_token = create_jwt_token(magic_link.email)

    return jwt_token
