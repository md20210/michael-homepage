"""Web Search Integration mit SearxNG für Hybrid RAG"""
import httpx
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import re
from config import get_settings

settings = get_settings()


class SearxNGSearch:
    """SearxNG Web Search Integration"""

    def __init__(self, searxng_url: str = None):
        """
        Initialize SearxNG search client

        Args:
            searxng_url: URL der SearxNG-Instanz (default: aus config)
        """
        self.searxng_url = searxng_url or settings.searxng_url
        self.max_results = settings.searxng_max_results

    async def search(self, query: str, max_results: int = None) -> List[Dict[str, str]]:
        """
        Suche mit SearxNG

        Args:
            query: Suchanfrage
            max_results: Max. Anzahl Ergebnisse (default: aus config)

        Returns:
            Liste von Suchergebnissen mit title, url, content
        """
        max_results = max_results or self.max_results

        print(f"🌐 [WEB SEARCH] Searching SearxNG for: {query}")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # SearxNG API Anfrage
                response = await client.get(
                    f"{self.searxng_url}/search",
                    params={
                        "q": query,
                        "format": "json",
                        "language": "de",  # Deutsche Ergebnisse bevorzugen
                        "time_range": "year",  # Aktuelle Ergebnisse
                        "safesearch": "1"
                    }
                )
                response.raise_for_status()
                data = response.json()

                results = []
                for item in data.get("results", [])[:max_results]:
                    result = {
                        "title": item.get("title", ""),
                        "url": item.get("url", ""),
                        "content": item.get("content", ""),
                        "engine": item.get("engine", "unknown")
                    }
                    results.append(result)
                    print(f"   📄 {result['title'][:60]}... ({result['engine']})")

                print(f"✅ [WEB SEARCH] Found {len(results)} results")
                return results

        except httpx.TimeoutException:
            print(f"⏱️ [WEB SEARCH] Timeout - SearxNG nicht erreichbar")
            return []
        except httpx.HTTPStatusError as e:
            print(f"❌ [WEB SEARCH] HTTP Error {e.response.status_code}")
            return []
        except Exception as e:
            print(f"❌ [WEB SEARCH] Error: {e}")
            return []

    def format_search_results(self, results: List[Dict[str, str]]) -> str:
        """
        Formatiert Suchergebnisse als Kontext für LLM

        Args:
            results: Liste von Suchergebnissen

        Returns:
            Formatierter Text-Kontext
        """
        if not results:
            return ""

        context = "WEB-SUCHERGEBNISSE:\n\n"

        for i, result in enumerate(results, 1):
            context += f"[{i}] {result['title']}\n"
            context += f"Quelle: {result['url']}\n"

            # Content bereinigen und kürzen
            content = result['content'].strip()
            content = re.sub(r'\s+', ' ', content)  # Mehrfache Leerzeichen entfernen

            if len(content) > 300:
                content = content[:300] + "..."

            context += f"{content}\n\n"

        return context

    async def search_and_format(self, query: str, max_results: int = None) -> str:
        """
        Suche durchführen und formatierte Ergebnisse zurückgeben

        Args:
            query: Suchanfrage
            max_results: Max. Anzahl Ergebnisse

        Returns:
            Formatierter Kontext für LLM
        """
        results = await self.search(query, max_results)
        return self.format_search_results(results)


class AnswerQualityDetector:
    """Erkennt, ob eine Antwort unzureichend ist und Web-Suche benötigt"""

    # Keywords die auf fehlende Informationen hindeuten
    UNCERTAINTY_KEYWORDS = [
        "diese information",
        "nicht im dokument",
        "kann ich nicht",
        "weiß ich nicht",
        "keine information",
        "nicht verfügbar",
        "nicht bekannt",
        "ich habe keine",
        "keine daten",
        "nicht enthalten"
    ]

    # Keywords die auf Zeitbezug hindeuten (aktuelle Daten benötigt)
    TEMPORAL_KEYWORDS = [
        "aktuell",
        "heute",
        "jetzt",
        "momentan",
        "derzeit",
        "gegenwärtig",
        "neueste",
        "latest",
        "2024",
        "2025"
    ]

    @staticmethod
    def needs_web_search(question: str, answer: str, has_documents: bool = False) -> bool:
        """
        Entscheidet, ob Web-Suche benötigt wird

        Args:
            question: Die Frage des Users
            answer: Die generierte Antwort
            has_documents: Ob lokale Dokumente vorhanden sind

        Returns:
            True wenn Web-Suche empfohlen wird
        """
        question_lower = question.lower()
        answer_lower = answer.lower()

        # 1. Check: Antwort enthält Unsicherheits-Keywords
        uncertainty_detected = any(
            keyword in answer_lower
            for keyword in AnswerQualityDetector.UNCERTAINTY_KEYWORDS
        )

        # 2. Check: Frage bezieht sich auf aktuelle Daten
        temporal_query = any(
            keyword in question_lower
            for keyword in AnswerQualityDetector.TEMPORAL_KEYWORDS
        )

        # 3. Check: Antwort ist sehr kurz (< 50 Zeichen)
        too_short = len(answer.strip()) < 50

        # 4. Check: Keine Dokumente vorhanden
        no_context = not has_documents

        # Entscheidungslogik
        if uncertainty_detected:
            print(f"🔍 [QUALITY] Uncertainty detected in answer")
            return True

        if temporal_query and (no_context or too_short):
            print(f"🔍 [QUALITY] Temporal query without sufficient local context")
            return True

        if no_context and too_short:
            print(f"🔍 [QUALITY] No documents and short answer")
            return True

        return False

    @staticmethod
    def get_search_query(question: str, answer: str) -> str:
        """
        Generiert optimierte Suchanfrage basierend auf Frage und Antwort

        Args:
            question: Original-Frage
            answer: Bisherige Antwort

        Returns:
            Optimierte Suchanfrage
        """
        # Einfach: Verwende die Original-Frage
        # TODO: Könnte mit LLM verbessert werden (Query-Rewriting)
        return question


# Global instance
searxng_client = SearxNGSearch()
