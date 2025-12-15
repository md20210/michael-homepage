"""Backend Internationalization (i18n) Support"""
from typing import Dict

# Translation dictionary
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    # Error messages
    "error.processing": {
        "de": "Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage: {error}",
        "en": "Sorry, there was an error processing your request: {error}",
        "es": "Lo siento, hubo un error al procesar tu solicitud: {error}",
    },
    "error.model_load": {
        "de": "Modell konnte nicht geladen werden",
        "en": "Failed to load model",
        "es": "Error al cargar el modelo",
    },
    "error.insufficient_disk_space": {
        "de": "Nicht genügend Speicherplatz! Benötigt: {required} GB, Verfügbar: {available} GB. Railway Volume ist zu klein. Bitte nutze ein kleineres Modell (z.B. Qwen2.5-3B mit 2GB oder DeepSeek-R1-1.5B mit 1.12GB) oder erhöhe das Railway Volume.",
        "en": "Insufficient disk space! Required: {required} GB, Available: {available} GB. Railway Volume is too small. Please use a smaller model (e.g., Qwen2.5-3B with 2GB or DeepSeek-R1-1.5B with 1.12GB) or increase the Railway Volume.",
        "es": "¡Espacio en disco insuficiente! Requerido: {required} GB, Disponible: {available} GB. El volumen de Railway es demasiado pequeño. Utiliza un modelo más pequeño (p. ej., Qwen2.5-3B con 2GB o DeepSeek-R1-1.5B con 1.12GB) o aumenta el volumen de Railway.",
    },

    # Source details
    "source.llm_only": {
        "de": "Direkt vom LLM",
        "en": "Direct from LLM",
        "es": "Directo del LLM",
    },
    "source.web_search": {
        "de": "Web-Suche",
        "en": "Web Search",
        "es": "Búsqueda Web",
    },
    "source.documents": {
        "de": "{count} Dokument(e)",
        "en": "{count} Document(s)",
        "es": "{count} Documento(s)",
    },
    "source.web_and_docs": {
        "de": "Web-Suche + {count} Dokument(e)",
        "en": "Web Search + {count} Document(s)",
        "es": "Búsqueda Web + {count} Documento(s)",
    },
}


def get_translation(key: str, language: str = "de", **kwargs) -> str:
    """
    Get translation for a key in specified language

    Args:
        key: Translation key (e.g., "error.processing")
        language: Language code (de, en, es)
        **kwargs: Format variables for string interpolation

    Returns:
        Translated string with variables filled in
    """
    # Normalize language code (e.g., "en-US" -> "en")
    lang = language.lower().split("-")[0] if language else "de"

    # Fallback to German if language not supported
    if lang not in ["de", "en", "es"]:
        lang = "de"

    # Get translation or fallback to German
    translations = TRANSLATIONS.get(key, {})
    text = translations.get(lang, translations.get("de", key))

    # Format with variables
    try:
        return text.format(**kwargs)
    except KeyError:
        return text


def parse_accept_language(accept_language: str | None) -> str:
    """
    Parse Accept-Language header and return best match

    Args:
        accept_language: Accept-Language header value (e.g., "de-DE,de;q=0.9,en;q=0.8")

    Returns:
        Best matching language code (de, en, es) or "de" as fallback
    """
    if not accept_language:
        return "de"

    # Parse Accept-Language header
    # Format: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
    languages = []
    for part in accept_language.split(","):
        lang_parts = part.strip().split(";")
        lang = lang_parts[0].split("-")[0].lower()  # Get base language (de, en, es)

        # Get quality value (default 1.0)
        quality = 1.0
        if len(lang_parts) > 1 and lang_parts[1].startswith("q="):
            try:
                quality = float(lang_parts[1][2:])
            except ValueError:
                quality = 1.0

        languages.append((lang, quality))

    # Sort by quality (highest first)
    languages.sort(key=lambda x: x[1], reverse=True)

    # Return first supported language
    for lang, _ in languages:
        if lang in ["de", "en", "es"]:
            return lang

    # Fallback to German
    return "de"
