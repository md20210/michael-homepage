"""RAG Engine mit LlamaIndex - Bessere Antwortqualität"""
import os

# CRITICAL: Set cache directories BEFORE any imports
os.environ['SENTENCE_TRANSFORMERS_HOME'] = '/tmp/.cache'
os.environ['HF_HOME'] = '/tmp/.cache'
os.environ['TRANSFORMERS_CACHE'] = '/tmp/.cache'

from typing import List, Dict
from pathlib import Path
import traceback

# LlamaIndex imports
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    Settings,
    Document as LlamaDocument
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.llama_cpp import LlamaCPP
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
import chromadb

from config import get_settings
from web_search import searxng_client, AnswerQualityDetector
from llm_models import get_model_path, DEFAULT_MODEL, get_model

settings = get_settings()

# Global variables
_current_model_id = DEFAULT_MODEL
_llm_instance = None
_chroma_client = None
_indices = {}  # Cache indices per document


def get_chroma_client():
    """Get or create ChromaDB client"""
    global _chroma_client
    if _chroma_client is None:
        chroma_db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        _chroma_client = chromadb.PersistentClient(
            path=chroma_db_path,
            settings=chromadb.Settings(anonymized_telemetry=False)
        )
    return _chroma_client


def get_llm():
    """Get or create LLM instance"""
    global _llm_instance, _current_model_id

    if _llm_instance is None:
        model_path = get_model_path(_current_model_id)

        if not os.path.exists(model_path):
            print(f"⚠️ Model not found at {model_path}")

            # Try fallback to qwen2.5-0.5b
            fallback_model_id = "qwen2.5-0.5b"
            fallback_path = get_model_path(fallback_model_id)

            if os.path.exists(fallback_path):
                print(f"🔄 Falling back to {fallback_model_id}...")
                _current_model_id = fallback_model_id
                model_path = fallback_path
            else:
                raise FileNotFoundError(f"No models available")

        print(f"🔄 [LlamaIndex] Loading LLM: {_current_model_id} from {model_path}...")

        try:
            _llm_instance = LlamaCPP(
                model_path=model_path,
                temperature=settings.llm_temperature,
                max_new_tokens=settings.llm_max_tokens,
                context_window=settings.llm_context_size,
                model_kwargs={"n_threads": settings.llm_threads},
                verbose=False
            )
            print(f"✅ [LlamaIndex] LLM loaded successfully!")
        except (ValueError, FileNotFoundError, Exception) as e:
            # If loading fails, try qwen2.5-0.5b as last resort
            if _current_model_id != "qwen2.5-0.5b":
                print(f"⚠️ Failed to load {_current_model_id}: {e}")
                print(f"🔄 Trying emergency fallback to qwen2.5-0.5b...")
                _current_model_id = "qwen2.5-0.5b"
                model_path = get_model_path("qwen2.5-0.5b")

                if os.path.exists(model_path):
                    _llm_instance = LlamaCPP(
                        model_path=model_path,
                        temperature=settings.llm_temperature,
                        max_new_tokens=settings.llm_max_tokens,
                        context_window=settings.llm_context_size,
                        model_kwargs={"n_threads": settings.llm_threads},
                        verbose=False
                    )
                    print(f"✅ [LlamaIndex] Emergency fallback successful!")
                else:
                    raise FileNotFoundError(f"No models available - please wait for downloads to complete")
            else:
                raise

    return _llm_instance


def reload_llm(model_id: str):
    """Reload LLM with different model"""
    global _llm_instance, _current_model_id

    print(f"🔄 [LlamaIndex] Switching LLM from {_current_model_id} to {model_id}...")

    if _llm_instance is not None:
        print(f"🗑️  [LlamaIndex] Unloading {_current_model_id}...")
        old_instance = _llm_instance
        _llm_instance = None

        del old_instance
        import gc
        gc.collect()
        print(f"✅ [LlamaIndex] {_current_model_id} unloaded")

    _current_model_id = model_id

    # Force reload on next query
    _llm_instance = None

    print(f"✅ [LlamaIndex] Model switched to {model_id}")


def setup_llamaindex():
    """Configure LlamaIndex global settings"""
    # Set embedding model (multilingual for German support)
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="paraphrase-multilingual-MiniLM-L12-v2",
        cache_folder="/tmp/.cache"
    )

    # Set LLM
    Settings.llm = get_llm()

    # Set chunk size
    Settings.chunk_size = 512
    Settings.chunk_overlap = 50

    print("✅ [LlamaIndex] Settings configured")


class DocumentProcessor:
    """Process documents with LlamaIndex"""

    def __init__(self):
        setup_llamaindex()
        self.chroma_client = get_chroma_client()

    def process_pdf(self, file_path: str, document_id: int) -> int:
        """Process PDF and create LlamaIndex index"""
        print(f"📄 [LlamaIndex] Processing PDF: {file_path}")

        try:
            # Create collection name
            collection_name = f"doc_{document_id}"

            # Delete existing collection if exists
            try:
                self.chroma_client.delete_collection(collection_name)
                print(f"🗑️  Deleted existing collection: {collection_name}")
            except:
                pass

            # Load document with LlamaIndex
            documents = SimpleDirectoryReader(
                input_files=[file_path]
            ).load_data()

            print(f"📖 [LlamaIndex] Loaded {len(documents)} document(s)")

            # Create ChromaDB collection
            chroma_collection = self.chroma_client.get_or_create_collection(collection_name)

            # Create vector store
            vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
            storage_context = StorageContext.from_defaults(vector_store=vector_store)

            # Create index
            index = VectorStoreIndex.from_documents(
                documents,
                storage_context=storage_context,
                show_progress=True
            )

            # Cache index
            _indices[document_id] = index

            # Count nodes
            node_count = len(index.docstore.docs)
            print(f"✅ [LlamaIndex] Created index with {node_count} nodes")

            return node_count

        except Exception as e:
            print(f"❌ [LlamaIndex] Error processing PDF: {e}")
            print(traceback.format_exc())
            raise


class RAGEngine:
    """RAG Engine with LlamaIndex"""

    def __init__(self):
        self.processor = DocumentProcessor()
        self.chroma_client = get_chroma_client()

    async def query(
        self,
        question: str,
        assistant_id: int,
        document_ids: List[int],
        max_results: int = 3
    ) -> Dict[str, any]:
        """Query documents with LlamaIndex"""

        if not document_ids:
            print(f"⚠️ [LlamaIndex] No documents for query: {question}")
            response = await self._generate_without_context(question)
            return {
                "answer": response,
                "sources": [],
                "context_used": False,
                "web_search_used": False
            }

        print(f"🔍 [LlamaIndex] Querying {len(document_ids)} document(s): {question}")

        # Load or get cached indices
        indices = []
        for doc_id in document_ids:
            if doc_id in _indices:
                indices.append(_indices[doc_id])
            else:
                # Load from ChromaDB
                collection_name = f"doc_{doc_id}"
                try:
                    chroma_collection = self.chroma_client.get_collection(collection_name)
                    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
                    index = VectorStoreIndex.from_vector_store(vector_store)
                    indices.append(index)
                    _indices[doc_id] = index
                except Exception as e:
                    print(f"❌ [LlamaIndex] Error loading index for doc {doc_id}: {e}")

        if not indices:
            print(f"⚠️ [LlamaIndex] No valid indices found")
            response = await self._generate_without_context(question)
            return {
                "answer": response,
                "sources": [],
                "context_used": False,
                "web_search_used": False
            }

        # Merge indices if multiple
        if len(indices) == 1:
            index = indices[0]
        else:
            # Merge multiple indices
            from llama_index.core.composability import ComposableGraph
            all_nodes = []
            for idx in indices:
                all_nodes.extend(idx.docstore.docs.values())

            index = VectorStoreIndex(all_nodes)

        # Query with LlamaIndex
        query_engine = index.as_query_engine(similarity_top_k=max_results)
        response = query_engine.query(question)

        answer = str(response)
        sources = [{"document_id": doc_id} for doc_id in document_ids]

        # Web Search check
        web_search_used = False
        if settings.enable_web_search:
            needs_web = AnswerQualityDetector.needs_web_search(
                question=question,
                answer=answer,
                has_documents=True
            )

            if needs_web:
                print(f"🌐 [LlamaIndex] Triggering web search...")
                web_results = await searxng_client.search(question)

                if web_results:
                    # Combine web results with document context
                    web_context = "\n\n".join([
                        f"**{r['title']}**\n{r['content']}" for r in web_results[:3]
                    ])

                    # Re-query with web context
                    enhanced_question = f"""Frage: {question}

Zusätzliche aktuelle Informationen aus dem Internet:
{web_context}

Beantworte die Frage basierend auf den Dokumenten UND den Web-Informationen."""

                    response = query_engine.query(enhanced_question)
                    answer = str(response)
                    web_search_used = True

        return {
            "answer": answer,
            "sources": sources,
            "context_used": True,
            "web_search_used": web_search_used
        }

    async def _generate_without_context(self, question: str) -> str:
        """Generate answer without document context"""
        llm = get_llm()

        prompt = f"""Du bist ein hilfreicher Assistent. Beantworte die folgende Frage:

Frage: {question}

Antwort:"""

        response = llm.complete(prompt)
        return str(response)


# Global instance
rag_engine = RAGEngine()
chroma_client = get_chroma_client()
