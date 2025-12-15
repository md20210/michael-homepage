"""FastAPI Main Application"""
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import os
import shutil
import traceback

from config import get_settings
from database import get_db, init_db, User, Assistant, Document, Message, SystemSettings
from auth import create_magic_link, verify_magic_link, get_current_user
# from rag import rag_engine, chroma_client, reload_llm  # OLD
from rag_llamaindex import rag_engine, chroma_client, reload_llm  # NEW: LlamaIndex
from llm_models import get_all_models, get_model, DEFAULT_MODEL
from i18n import get_translation, parse_accept_language

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
    source_type: str | None = None  # "llm_only", "rag", "hybrid"
    source_details: str | None = None  # e.g., "2 documents", "Web + Documents"


# Admin Models
class LLMModelResponse(BaseModel):
    id: str
    name: str
    filename: str
    size_gb: float
    params: str
    quality: str
    description: str


class SetLLMRequest(BaseModel):
    model_id: str


# Helper functions
def is_superadmin(user: User) -> bool:
    """Check if user is superadmin"""
    return user.email == settings.superadmin_email


async def get_current_llm_model(db: AsyncSession) -> str:
    """Get current LLM model from database"""
    result = await db.execute(
        select(SystemSettings).where(SystemSettings.key == "llm_model")
    )
    setting = result.scalar_one_or_none()
    return setting.value if setting else DEFAULT_MODEL


async def set_current_llm_model(db: AsyncSession, model_id: str, user_email: str):
    """Set current LLM model in database"""
    result = await db.execute(
        select(SystemSettings).where(SystemSettings.key == "llm_model")
    )
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = model_id
        setting.updated_by = user_email
        setting.updated_at = datetime.utcnow()
    else:
        setting = SystemSettings(
            key="llm_model",
            value=model_id,
            updated_by=user_email
        )
        db.add(setting)

    await db.commit()


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

    # Get documents (newest first)
    result = await db.execute(
        select(Document)
        .where(Document.assistant_id == assistant_id)
        .order_by(Document.uploaded_at.desc())
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
    print(f"\n📤 === UPLOAD REQUEST RECEIVED ===")
    print(f"Assistant ID: {assistant_id}")
    print(f"User: {current_user.email}")
    print(f"Filename: {file.filename}")
    print(f"Content Type: {file.content_type}")

    # Verify ownership
    result = await db.execute(
        select(Assistant).where(
            Assistant.id == assistant_id,
            Assistant.user_id == current_user.id
        )
    )
    assistant = result.scalar_one_or_none()

    if not assistant:
        print(f"❌ Assistant {assistant_id} not found for user {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found"
        )

    print(f"✅ Assistant verified: {assistant.name}")

    # Check file type
    if not file.filename.lower().endswith('.pdf'):
        print(f"❌ Invalid file type: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported in PoC"
        )

    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    print(f"📏 File size: {file_size} bytes ({file_size / 1024:.2f} KB)")

    max_size = settings.max_file_size_mb * 1024 * 1024
    if file_size > max_size:
        print(f"❌ File too large: {file_size} > {max_size}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.max_file_size_mb}MB"
        )

    # Save file
    upload_dir = f"uploads/{current_user.id}/{assistant_id}"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{file.filename}"
    print(f"💾 Saving to: {file_path}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"✅ File saved successfully")

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

    print(f"✅ Document record created: ID={document.id}")

    # Process document in background (extract text, create embeddings)
    try:
        print(f"🔄 Starting document processing...")
        chunk_count = await rag_engine.processor.process_document(file_path, document.id)
        document.processed = True
        await db.commit()
        print(f"✅ Document {document.id} processed successfully: {chunk_count} chunks")
    except Exception as e:
        print(f"❌ Error processing document {document.id}: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        # Document remains marked as unprocessed

    print(f"=== UPLOAD COMPLETE ===\n")
    return document


@app.delete("/assistants/{assistant_id}/documents/{document_id}")
async def delete_document(
    assistant_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a single document"""
    print(f"\n🗑️  [DELETE] Starting document deletion: doc_id={document_id}, user={current_user.email}")

    # Verify assistant ownership
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

    # Get document
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.assistant_id == assistant_id
        )
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    # Delete file from filesystem
    print(f"   📁 [DELETE] Deleting file: {document.file_path}")
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
        print(f"   ✅ [DELETE] File deleted from filesystem")
    else:
        print(f"   ⚠️  [DELETE] File not found on filesystem (already deleted?)")

    # Delete ChromaDB collection
    print(f"   🗄️  [DELETE] Deleting ChromaDB collection: doc_{document.id}")
    try:
        collection_name = f"doc_{document.id}"
        chroma_client.delete_collection(collection_name)
        print(f"   ✅ [DELETE] ChromaDB collection deleted: {collection_name}")
    except Exception as e:
        print(f"   ⚠️  [DELETE] Error deleting ChromaDB collection: {e}")

    # Delete from database
    print(f"   🗃️  [DELETE] Deleting from PostgreSQL database...")
    await db.delete(document)
    await db.commit()
    print(f"   ✅ [DELETE] Database record deleted")

    print(f"✅ [DELETE] Document '{document.filename}' deleted successfully\n")
    return {"message": "Document deleted successfully"}


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

    # Convert to MessageResponse with source_type (for old messages without metadata)
    responses = []
    for msg in messages:
        # User messages don't have source_type
        if msg.role == "user":
            responses.append(MessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at,
                source_type=None,
                source_details=None
            ))
        else:
            # Parse old "📚 Quellen:" format if present
            source_type = None
            source_details = None

            if "📚 Quellen:" in msg.content:
                # Old format - parse it
                if "Web-Suche" in msg.content and "Dokument" in msg.content:
                    source_type = "hybrid"
                elif "Web-Suche" in msg.content:
                    source_type = "hybrid"
                elif "Dokument" in msg.content:
                    source_type = "rag"
            else:
                # No source info = likely llm_only
                source_type = "llm_only"

            responses.append(MessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at,
                source_type=source_type,
                source_details=source_details
            ))

    return responses


@app.post("/assistants/{assistant_id}/chat", response_model=MessageResponse)
async def chat(
    assistant_id: int,
    message_request: MessageRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get AI response"""
    # Parse language from Accept-Language header
    accept_language = request.headers.get("Accept-Language", "de")
    language = parse_accept_language(accept_language)
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

    print(f"📊 Found {len(documents)} processed documents for assistant {assistant_id}")
    print(f"📋 Document IDs: {document_ids}")
    if documents:
        for doc in documents:
            print(f"   - Doc {doc.id}: {doc.filename} (processed: {doc.processed})")

    # Query using RAG
    try:
        rag_result = await rag_engine.query(
            question=message_request.content,
            assistant_id=assistant_id,
            document_ids=document_ids
        )
        ai_response = rag_result["answer"]

        # Determine source type for response metadata
        source_type = None
        source_details = None

        if rag_result.get("web_search_used", False):
            source_type = "hybrid"
            if rag_result["context_used"]:
                source_details = get_translation("source.web_and_docs", language, count=len(rag_result['sources']))
            else:
                source_details = get_translation("source.web_search", language)
        elif rag_result["context_used"]:
            source_type = "rag"
            source_details = get_translation("source.documents", language, count=len(rag_result['sources']))
        else:
            source_type = "llm_only"
            source_details = get_translation("source.llm_only", language)

    except Exception as e:
        print(f"RAG error: {e}")
        ai_response = get_translation("error.processing", language, error=str(e))
        source_type = "error"
        source_details = None

    # Save AI message
    ai_message = Message(
        assistant_id=assistant_id,
        role="assistant",
        content=ai_response
    )
    db.add(ai_message)
    await db.commit()
    await db.refresh(ai_message)

    # Add source metadata to response (not stored in DB)
    response_dict = {
        "id": ai_message.id,
        "role": ai_message.role,
        "content": ai_message.content,
        "created_at": ai_message.created_at,
        "source_type": source_type,
        "source_details": source_details
    }

    return MessageResponse(**response_dict)


@app.delete("/assistants/{assistant_id}/messages")
async def delete_chat_history(
    assistant_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete all messages for an assistant (keep documents)"""
    print(f"\n🗑️  [DELETE CHAT] User {current_user.email} deleting chat for assistant {assistant_id}")

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

    # Delete all messages for this assistant
    result = await db.execute(
        select(Message).where(Message.assistant_id == assistant_id)
    )
    messages = result.scalars().all()
    message_count = len(messages)

    print(f"   📊 [DELETE CHAT] Found {message_count} messages to delete")

    for message in messages:
        await db.delete(message)

    await db.commit()

    print(f"✅ [DELETE CHAT] Deleted {message_count} messages\n")
    return {"message": f"{message_count} messages deleted", "count": message_count}


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


# Admin endpoints (nur für Superadmin)
@app.get("/admin/is-admin")
async def check_admin(current_user: User = Depends(get_current_user)):
    """Check if current user is superadmin"""
    return {"is_admin": is_superadmin(current_user)}


@app.get("/admin/llm/models", response_model=List[LLMModelResponse])
async def get_available_models(current_user: User = Depends(get_current_user)):
    """Get all available LLM models (Superadmin only)"""
    if not is_superadmin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Superadmin hat Zugriff auf diesen Endpoint"
        )

    return get_all_models()


@app.get("/admin/llm/current")
async def get_current_model(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get currently selected LLM model with memory status (Superadmin only)"""
    if not is_superadmin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Superadmin hat Zugriff auf diesen Endpoint"
        )

    model_id = await get_current_llm_model(db)
    model = get_model(model_id)

    # Check if model is loaded in RAM
    from rag import _llm_instance, get_current_model_id
    is_loaded_in_ram = _llm_instance is not None
    ram_model_id = get_current_model_id() if is_loaded_in_ram else None

    return {
        "model_id": model_id,
        "model_name": model.name,
        "model_info": {
            "filename": model.filename,
            "size_gb": model.size_gb,
            "params": model.params,
            "quality": model.quality
        },
        "memory_status": {
            "loaded_in_ram": is_loaded_in_ram,
            "ram_model_id": ram_model_id,
            "message": f"✅ {model.name} loaded in RAM" if is_loaded_in_ram else f"⏳ {model.name} will load on first request"
        }
    }


@app.post("/admin/llm/set")
async def set_llm_model(
    request: SetLLMRequest,
    request_obj: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Set LLM model (Superadmin only)"""
    if not is_superadmin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nur Superadmin hat Zugriff auf diesen Endpoint"
        )

    # Validate model exists
    from llm_models import AVAILABLE_MODELS
    if request.model_id not in AVAILABLE_MODELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model_id: {request.model_id}. Available models: {list(AVAILABLE_MODELS.keys())}"
        )

    model = get_model(request.model_id)

    # Check if model file exists, download if not
    from pathlib import Path
    from llm_models import get_model_path
    model_path = Path(get_model_path(request.model_id))

    if not model_path.exists():
        print(f"📥 [ADMIN] Model {model.name} not found, downloading...")
        from download_model import download_model
        import re

        # Get user language from request
        accept_language = request_obj.headers.get("accept-language")
        lang = parse_accept_language(accept_language)

        try:
            success = download_model(request.model_id)
            if not success:
                error_msg = get_translation("error.model_load", lang)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=error_msg
                )
            print(f"✅ [ADMIN] Model {model.name} downloaded successfully")
        except HTTPException:
            raise  # Re-raise HTTPException directly
        except RuntimeError as e:
            # Disk space error - parse and translate
            error_str = str(e)

            # Try to extract GB values from error message
            match = re.search(r'Benötigt: ([\d.]+) GB, Verfügbar: ([\d.]+) GB', error_str)
            if match:
                required = match.group(1)
                available = match.group(2)
                error_msg = get_translation("error.insufficient_disk_space", lang, required=required, available=available)
            else:
                # Fallback to original error message
                error_msg = error_str

            print(f"❌ [ADMIN] Disk space error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
                detail=error_msg
            )
        except Exception as e:
            print(f"❌ [ADMIN] Error downloading model: {e}")
            error_msg = get_translation("error.processing", lang, error=str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=error_msg
            )

    # Save to database
    try:
        await set_current_llm_model(db, request.model_id, current_user.email)
    except Exception as e:
        print(f"❌ [ADMIN] Error saving model to database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Speichern in Datenbank: {str(e)}"
        )

    # Reload LLM in memory
    try:
        reload_llm(request.model_id)
        print(f"🔄 [ADMIN] LLM Model switched to: {model.name} by {current_user.email}")
    except Exception as e:
        print(f"❌ [ADMIN] Error reloading LLM: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Laden des Modells: {str(e)}"
        )

    return {
        "message": f"LLM Model erfolgreich gewechselt zu: {model.name}",
        "model_id": request.model_id,
        "model_name": model.name
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
