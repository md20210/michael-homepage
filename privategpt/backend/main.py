"""FastAPI Main Application"""
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import os
import shutil

from config import get_settings
from database import get_db, init_db, User, Assistant, Document, Message
from auth import create_magic_link, verify_magic_link, get_current_user
from rag import rag_engine

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="Dabrock PrivateGxT API",
    description="DSGVO-konforme KI-Assistenten mit eigenen Dokumenten",
    version="0.1.0 (PoC)"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models
class EmailRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime


class AssistantResponse(BaseModel):
    id: int
    name: str
    created_at: datetime


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime
    processed: bool


class MessageRequest(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


# Startup event
@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    await init_db()
    # Create upload directory
    os.makedirs("uploads", exist_ok=True)


# Health check
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Dabrock PrivateGxT API",
        "version": "0.1.0"
    }


# Auth endpoints
@app.post("/auth/request-magic-link")
async def request_magic_link(
    email_request: EmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request magic link to be sent via email"""
    try:
        await create_magic_link(email_request.email, db)
        return {"message": "Magic link sent! Check your email."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/auth/verify", response_model=TokenResponse)
async def verify_magic_link_endpoint(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify magic link token and return JWT"""
    jwt_token = await verify_magic_link(token, db)
    return TokenResponse(access_token=jwt_token)


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# Assistant endpoints
@app.get("/assistants", response_model=List[AssistantResponse])
async def get_assistants(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all assistants for current user"""
    result = await db.execute(
        select(Assistant).where(Assistant.user_id == current_user.id)
    )
    assistants = result.scalars().all()
    return assistants


@app.post("/assistants", response_model=AssistantResponse)
async def create_assistant(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new assistant (only one for PoC)"""
    # Check if user already has an assistant
    result = await db.execute(
        select(Assistant).where(Assistant.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an assistant. PoC supports only one assistant per user."
        )

    # Create new assistant
    assistant = Assistant(
        user_id=current_user.id,
        name="Mein Assistent"
    )
    db.add(assistant)
    await db.commit()
    await db.refresh(assistant)
    return assistant


@app.get("/assistants/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific assistant"""
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    return assistant


# Document endpoints
@app.get("/assistants/{assistant_id}/documents", response_model=List[DocumentResponse])
async def get_documents(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all documents for an assistant"""
    # Verify ownership
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    # Get documents
    result = await db.execute(
        select(Document).where(Document.assistant_id == assistant_id)
    )
    documents = result.scalars().all()
    return documents


@app.post("/assistants/{assistant_id}/documents", response_model=DocumentResponse)
async def upload_document(
    assistant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a document (PDF only for PoC)"""
    # Verify ownership
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    # Check file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported in PoC"
        )

    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    max_size = settings.max_file_size_mb * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.max_file_size_mb}MB"
        )

    # Save file
    upload_dir = f"uploads/{current_user.id}/{assistant_id}"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create document record
    document = Document(
        assistant_id=assistant_id,
        filename=file.filename,
        file_path=file_path,
        file_type="pdf",
        file_size=file_size,
        processed=False
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)

    # Process document in background (extract text, create embeddings)
    try:
        chunk_count = await rag_engine.processor.process_document(file_path, document.id)
        document.processed = True
        await db.commit()
        print(f"Document {document.id} processed successfully: {chunk_count} chunks")
    except Exception as e:
        print(f"Error processing document {document.id}: {e}")
        # Document remains marked as unprocessed

    return document


# Chat endpoints
@app.get("/assistants/{assistant_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for an assistant"""
    # Verify ownership
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.assistant_id == assistant_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return messages


@app.post("/assistants/{assistant_id}/chat", response_model=MessageResponse)
async def chat(
    assistant_id: int,
    message_request: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get AI response"""
    # Verify ownership
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    # Save user message
    user_message = Message(
        assistant_id=assistant_id,
        role="user",
        content=message_request.content
    )
    db.add(user_message)
    await db.commit()

    # Get all processed documents for this assistant
    result = await db.execute(
        select(Document).where(
            Document.assistant_id == assistant_id,
            Document.processed == True
        )
    )
    documents = result.scalars().all()
    document_ids = [doc.id for doc in documents]

    # Query using RAG
    try:
        rag_result = await rag_engine.query(
            question=message_request.content,
            assistant_id=assistant_id,
            document_ids=document_ids
        )
        ai_response = rag_result["answer"]

        # Add source info if context was used
        if rag_result["context_used"] and rag_result["sources"]:
            ai_response += f"\n\n📚 Quellen: {len(rag_result['sources'])} Dokument-Abschnitte"

    except Exception as e:
        print(f"RAG error: {e}")
        ai_response = f"Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage: {str(e)}"

    # Save AI message
    ai_message = Message(
        assistant_id=assistant_id,
        role="assistant",
        content=ai_response
    )
    db.add(ai_message)
    await db.commit()
    await db.refresh(ai_message)

    return ai_message


# Data deletion endpoint
@app.delete("/users/me")
async def delete_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete all user data (DSGVO compliance)"""
    # Delete uploaded files
    upload_dir = f"uploads/{current_user.id}"
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)

    # Delete user (cascade will delete assistants, documents, messages)
    await db.delete(current_user)
    await db.commit()

    return {"message": "All your data has been deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
