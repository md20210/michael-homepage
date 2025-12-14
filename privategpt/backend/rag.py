"""RAG (Retrieval Augmented Generation) Logic - Railway Version mit llama-cpp-python"""
import os

# CRITICAL: Set cache directories BEFORE any imports that use them
os.environ['SENTENCE_TRANSFORMERS_HOME'] = '/tmp/.cache'
os.environ['HF_HOME'] = '/tmp/.cache'
os.environ['TRANSFORMERS_CACHE'] = '/tmp/.cache'

# Debug: Print environment variables to verify they're set
print(f"DEBUG: SENTENCE_TRANSFORMERS_HOME = {os.environ.get('SENTENCE_TRANSFORMERS_HOME')}")
print(f"DEBUG: HF_HOME = {os.environ.get('HF_HOME')}")
print(f"DEBUG: TRANSFORMERS_CACHE = {os.environ.get('TRANSFORMERS_CACHE')}")

from typing import List, Dict
import PyPDF2
import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils import embedding_functions
from langchain.text_splitter import RecursiveCharacterTextSplitter
import traceback

# NEU: llama-cpp-python statt httpx/Ollama
try:
    from llama_cpp import Llama
    LLAMA_CPP_AVAILABLE = True
except ImportError:
    LLAMA_CPP_AVAILABLE = False
    print("⚠️ llama-cpp-python not installed. Falling back to Ollama.")

# Fallback: httpx für Ollama
import httpx

from config import get_settings
from web_search import searxng_client, AnswerQualityDetector
from llm_models import get_model_path, DEFAULT_MODEL, get_model

settings = get_settings()

# Global variable to track current model
_current_model_id = DEFAULT_MODEL

# Initialize ChromaDB - NEU: Persistent Path für Railway Volume
chroma_db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
chroma_client = chromadb.PersistentClient(
    path=chroma_db_path,
    settings=ChromaSettings(anonymized_telemetry=False)
)

# Initialize Embedding Function for ChromaDB
# Using multilingual model for German/English support
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

# NEU: Global LLM Instance (lazy loading)
_llm_instance = None


def get_llm() -> Llama:
    """Get or create LLM instance (singleton)"""
    global _llm_instance, _current_model_id
    if not LLAMA_CPP_AVAILABLE:
        return None

    if _llm_instance is None:
        model_path = get_model_path(_current_model_id)

        if not os.path.exists(model_path):
            print(f"⚠️ Model not found at {model_path}")
            print("Falling back to Ollama...")
            return None

        print(f"🔄 Loading LLM model: {_current_model_id} from {model_path}...")
        _llm_instance = Llama(
            model_path=model_path,
            n_ctx=settings.llm_context_size,
            n_threads=settings.llm_threads,
            verbose=False
        )
        print(f"✅ LLM model {_current_model_id} loaded successfully!")
    return _llm_instance


def reload_llm(model_id: str):
    """Reload LLM with different model"""
    global _llm_instance, _current_model_id

    print(f"🔄 [RELOAD] Switching LLM from {_current_model_id} to {model_id}...")

    # Explicitly unload current model from memory
    if _llm_instance is not None:
        print(f"🗑️  [RELOAD] Unloading {_current_model_id} from memory...")
        old_instance = _llm_instance
        _llm_instance = None

        # Force garbage collection to free RAM immediately
        del old_instance
        import gc
        gc.collect()
        print(f"✅ [RELOAD] {_current_model_id} unloaded from RAM")

    _current_model_id = model_id

    # Load new model (will be loaded on next get_llm() call)
    print(f"✅ [RELOAD] LLM model switched to {model_id} (will load on next request)")


def get_current_model_id() -> str:
    """Get current model ID"""
    global _current_model_id
    return _current_model_id


def get_model_info_for_prompt() -> str:
    """Generate dynamic model information for system prompt"""
    global _current_model_id

    try:
        model = get_model(_current_model_id)

        # Build model description
        model_info = f"""Du bist ein KI-Assistent basierend auf dem Modell **{model.name}** ({model.params} Parameter).

Deine Fähigkeiten:
- Deutschsprachige Konversation und Textverarbeitung
- Dokumenten-Analyse und Informationsextraktion
- Web-Suche für aktuelle Informationen
- Logisches Denken und Reasoning
- Faktenbasierte Antworten

Technische Details:
- Modell: {model.name}
- Parameter: {model.params}
- Qualitätsstufe: {model.quality}
- Optimiert für: {model.description}"""

        return model_info
    except Exception as e:
        print(f"⚠️ [PROMPT] Error getting model info: {e}")
        # Fallback wenn Model-Info nicht verfügbar
        return "Du bist ein deutschsprachiger KI-Assistent."


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
            metadata={"document_id": document_id},
            embedding_function=embedding_function
        )

        # Create embeddings and store
        try:
            print(f"DEBUG: About to call collection.add() for {len(chunks)} chunks...")
            print(f"DEBUG: Cache env vars at this point:")
            print(f"  SENTENCE_TRANSFORMERS_HOME={os.environ.get('SENTENCE_TRANSFORMERS_HOME')}")
            print(f"  HF_HOME={os.environ.get('HF_HOME')}")
            collection.add(
                documents=chunks,
                ids=[f"chunk_{i}" for i in range(len(chunks))],
                metadatas=[{"chunk_index": i, "document_id": document_id} for i in range(len(chunks))]
            )
            print(f"DEBUG: collection.add() succeeded!")
        except Exception as e:
            print(f"ERROR in collection.add(): {e}")
            print(f"Traceback:\n{traceback.format_exc()}")
            raise

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
            print(f"⚠️ No documents provided for question: {question}")
            response = await self._generate_response_without_context(question)
            return {
                "answer": response,
                "sources": [],
                "context_used": False
            }

        # Retrieve relevant chunks from all documents
        all_chunks = []
        sources = []

        print(f"🔍 Searching in {len(document_ids)} document(s) for: {question}")

        for doc_id in document_ids:
            collection_name = f"doc_{doc_id}"
            try:
                collection = chroma_client.get_collection(
                    name=collection_name,
                    embedding_function=embedding_function
                )
                print(f"✅ Found collection: {collection_name} ({collection.count()} chunks)")

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
                    print(f"📄 Retrieved {len(results['documents'][0])} chunks from {collection_name}")
                else:
                    print(f"⚠️ No results from {collection_name}")

            except Exception as e:
                print(f"❌ Error querying collection {collection_name}: {e}")
                continue

        # Generate answer using LLM
        if all_chunks:
            response = await self._generate_response_with_context(question, all_chunks)
            context_used = True
        else:
            response = await self._generate_response_without_context(question)
            context_used = False

        # HYBRID RAG: Check if web search is needed
        web_search_used = False
        web_sources = []

        if settings.enable_web_search:
            needs_web = AnswerQualityDetector.needs_web_search(
                question=question,
                answer=response,
                has_documents=bool(all_chunks)
            )

            if needs_web:
                print(f"🌐 [HYBRID RAG] Web search triggered for better answer")

                # Generate search query
                search_query = AnswerQualityDetector.get_search_query(question, response)

                # Perform web search
                web_context = await searxng_client.search_and_format(search_query)

                if web_context:
                    # Regenerate answer with web context
                    combined_context = []

                    # Add local document chunks if available
                    if all_chunks:
                        combined_context.extend(all_chunks[:3])  # Top 3 local chunks

                    # Add web search context
                    combined_context.append(web_context)

                    # Generate improved answer
                    response = await self._generate_response_with_context(
                        question,
                        combined_context,
                        is_hybrid=True
                    )
                    web_search_used = True
                    web_sources = ["SearxNG Web Search"]

                    print(f"✅ [HYBRID RAG] Answer enhanced with web search results")

        return {
            "answer": response,
            "sources": sources,
            "context_used": context_used,
            "web_search_used": web_search_used,
            "web_sources": web_sources
        }

    async def _generate_response_with_context(
        self,
        question: str,
        context_chunks: List[str],
        is_hybrid: bool = False
    ) -> str:
        """Generate response using llama-cpp-python or Ollama with context

        Args:
            question: User question
            context_chunks: Context from documents and/or web search
            is_hybrid: Whether this uses hybrid RAG (local + web)
        """

        # Build context
        context = "\n\n".join(context_chunks[:5])  # Use top 5 chunks

        # Try llama-cpp-python first
        llm = get_llm()
        if llm is not None:
            # Create prompt (Qwen2.5 ChatML Format) - Optimized for better German
            source_type = "Dokumenten und Web-Suchergebnissen" if is_hybrid else "bereitgestellten Dokumenten"
            model_info = get_model_info_for_prompt()

            prompt = f"""<|im_start|>system
{model_info}

WICHTIGE REGELN:
1. Beantworte AUSSCHLIESSLICH auf Deutsch
2. Nutze NUR Informationen aus den {source_type}
3. Zitiere direkt aus den Quellen wenn möglich
4. Wenn die Information nicht vorhanden ist, sage das ehrlich
5. Schreibe in vollständigen, korrekten deutschen Sätzen
6. Sei präzise, sachlich und professionell
{'7. Kennzeichne Web-Informationen mit "Laut Web-Suche:" wenn relevant' if is_hybrid else ''}<|im_end|>
<|im_start|>user
{'INFORMATIONSQUELLEN (Dokumente + Web):' if is_hybrid else 'DOKUMENTEN-AUSZÜGE:'}
{context}

FRAGE: {question}

ANTWORT (auf Deutsch, basierend auf den Quellen):<|im_end|>
<|im_start|>assistant
"""

            try:
                output = llm(
                    prompt,
                    max_tokens=1024,  # Increased from 512 for longer answers
                    temperature=0.3,  # Lowered from 0.7 for more precise answers
                    top_p=0.9,  # Nucleus sampling for better quality
                    top_k=40,  # Limit vocabulary for more coherent responses
                    stop=["<|im_end|>", "<|im_start|>"],
                    echo=False,
                    repeat_penalty=1.15  # Increased to prevent repetition
                )
                response_text = output['choices'][0]['text'].strip()
                print(f"🤖 [WITH CONTEXT] Generated response ({len(response_text)} chars): {response_text[:100]}...")
                return response_text

            except Exception as e:
                print(f"Error calling llama-cpp-python: {e}")
                print("Falling back to Ollama...")

        # Fallback to Ollama
        prompt = f"""Du bist ein hilfreicher KI-Assistent. Beantworte die Frage basierend auf den folgenden Dokumenten-Auszügen.

Wenn die Antwort nicht in den Dokumenten enthalten ist, sage das ehrlich.

DOKUMENTE:
{context}

FRAGE: {question}

ANTWORT:"""

        try:
            async with httpx.AsyncClient(timeout=600.0) as client:
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
        """Generate response using llama-cpp-python or Ollama without document context"""

        # Try llama-cpp-python first
        llm = get_llm()
        if llm is not None:
            model_info = get_model_info_for_prompt()

            prompt = f"""<|im_start|>system
{model_info}

Beantworte AUSSCHLIESSLICH auf Deutsch in vollständigen, korrekten Sätzen.
Sei präzise, sachlich und professionell.<|im_end|>
<|im_start|>user
{question}<|im_end|>
<|im_start|>assistant
"""

            try:
                output = llm(
                    prompt,
                    max_tokens=1024,  # Increased from 512
                    temperature=0.3,  # Lowered from 0.7
                    top_p=0.9,
                    top_k=40,
                    stop=["<|im_end|>", "<|im_start|>"],
                    echo=False,
                    repeat_penalty=1.15
                )
                response_text = output['choices'][0]['text'].strip()
                print(f"🤖 [NO CONTEXT] Generated response ({len(response_text)} chars)")
                return response_text

            except Exception as e:
                print(f"Error calling llama-cpp-python: {e}")
                print("Falling back to Ollama...")

        # Fallback to Ollama
        try:
            async with httpx.AsyncClient(timeout=600.0) as client:
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
