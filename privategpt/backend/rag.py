"""RAG (Retrieval Augmented Generation) Logic"""
import os
from typing import List, Dict
import PyPDF2
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import httpx

from config import get_settings

settings = get_settings()

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=ChromaSettings(anonymized_telemetry=False)
)


class DocumentProcessor:
    """Process documents and create embeddings"""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            raise
        return text

    def split_text(self, text: str) -> List[str]:
        """Split text into chunks"""
        chunks = self.text_splitter.split_text(text)
        return chunks

    async def process_document(self, file_path: str, document_id: int) -> int:
        """Process document: extract text, split, and store in vector DB"""
        # Extract text
        text = self.extract_text_from_pdf(file_path)

        if not text.strip():
            raise ValueError("No text could be extracted from PDF")

        # Split into chunks
        chunks = self.split_text(text)

        # Get or create collection for this document
        collection_name = f"doc_{document_id}"
        try:
            collection = chroma_client.get_collection(collection_name)
            # Delete existing collection if it exists
            chroma_client.delete_collection(collection_name)
        except:
            pass

        collection = chroma_client.create_collection(
            name=collection_name,
            metadata={"document_id": document_id}
        )

        # Create embeddings and store
        # ChromaDB will automatically create embeddings using default embedding function
        collection.add(
            documents=chunks,
            ids=[f"chunk_{i}" for i in range(len(chunks))],
            metadatas=[{"chunk_index": i, "document_id": document_id} for i in range(len(chunks))]
        )

        return len(chunks)


class RAGEngine:
    """RAG Engine for querying documents"""

    def __init__(self):
        self.processor = DocumentProcessor()

    async def query(
        self,
        question: str,
        assistant_id: int,
        document_ids: List[int],
        max_results: int = 3
    ) -> Dict[str, any]:
        """Query documents and generate answer"""

        if not document_ids:
            # No documents, return general response
            response = await self._generate_response_without_context(question)
            return {
                "answer": response,
                "sources": [],
                "context_used": False
            }

        # Retrieve relevant chunks from all documents
        all_chunks = []
        sources = []

        for doc_id in document_ids:
            collection_name = f"doc_{doc_id}"
            try:
                collection = chroma_client.get_collection(collection_name)

                # Query collection
                results = collection.query(
                    query_texts=[question],
                    n_results=max_results
                )

                # Add to chunks
                if results and results['documents']:
                    for i, doc in enumerate(results['documents'][0]):
                        all_chunks.append(doc)
                        sources.append({
                            "document_id": doc_id,
                            "chunk_index": i,
                            "distance": results['distances'][0][i] if results['distances'] else None
                        })

            except Exception as e:
                print(f"Error querying collection {collection_name}: {e}")
                continue

        # Generate answer using LLM
        if all_chunks:
            response = await self._generate_response_with_context(question, all_chunks)
            context_used = True
        else:
            response = await self._generate_response_without_context(question)
            context_used = False

        return {
            "answer": response,
            "sources": sources,
            "context_used": context_used
        }

    async def _generate_response_with_context(
        self,
        question: str,
        context_chunks: List[str]
    ) -> str:
        """Generate response using Ollama LLM with context"""

        # Build context
        context = "\n\n".join(context_chunks[:5])  # Use top 5 chunks

        # Create prompt
        prompt = f"""Du bist ein hilfreicher KI-Assistent. Beantworte die Frage basierend auf den folgenden Dokumenten-Auszügen.

Wenn die Antwort nicht in den Dokumenten enthalten ist, sage das ehrlich.

DOKUMENTE:
{context}

FRAGE: {question}

ANTWORT:"""

        # Call Ollama (longer timeout for CPU-only inference)
        try:
            async with httpx.AsyncClient(timeout=600.0) as client:  # 10 minutes for CPU
                response = await client.post(
                    f"{settings.ollama_base_url}/api/generate",
                    json={
                        "model": settings.llm_model,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "Keine Antwort erhalten")

        except httpx.TimeoutException:
            return f"⏱️ Timeout: Das Modell antwortet nicht. CPU-Inferenz kann sehr langsam sein.\n\nTipp: Nutze ein kleineres Modell oder GPU-Beschleunigung."
        except httpx.HTTPStatusError as e:
            return f"❌ Ollama Fehler ({e.response.status_code}): {e.response.text}"
        except Exception as e:
            print(f"Error calling Ollama: {e}")
            return f"Fehler bei der LLM-Anfrage: {str(e)}\n\nIst Ollama gestartet? (ollama serve)"

    async def _generate_response_without_context(self, question: str) -> str:
        """Generate response using Ollama LLM without document context"""

        try:
            async with httpx.AsyncClient(timeout=600.0) as client:  # 10 minutes for CPU
                response = await client.post(
                    f"{settings.ollama_base_url}/api/generate",
                    json={
                        "model": settings.llm_model,
                        "prompt": question,
                        "stream": False
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "Keine Antwort erhalten")
        except httpx.TimeoutException:
            return f"⏱️ Timeout: Das Modell antwortet nicht. CPU-Inferenz kann sehr langsam sein.\n\nTipp: Nutze ein kleineres Modell oder GPU-Beschleunigung."
        except httpx.HTTPStatusError as e:
            return f"❌ Ollama Fehler ({e.response.status_code}): {e.response.text}"

        except Exception as e:
            print(f"Error calling Ollama: {e}")
            return f"Fehler bei der LLM-Anfrage: {str(e)}\n\nIst Ollama gestartet? (ollama serve)"


# Global instance
rag_engine = RAGEngine()
