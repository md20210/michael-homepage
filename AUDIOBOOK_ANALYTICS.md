# Audiobook Download Analytics

## Übersicht
Das System trackt jeden Klick auf den "Mein Hörbuch" Button und speichert:
- Zeitstempel
- Sprache (DE/EN/ES)
- User-Agent (Browser-Info)
- IP-Adresse

## Statistiken abrufen

### Alle Klicks anzeigen
```bash
curl https://michael-homepage-production.up.railway.app/api/audiobook-stats
```

### Oder im Browser:
```
https://michael-homepage-production.up.railway.app/api/audiobook-stats
```

## Statistik-Ausgabe

```json
{
  "totalClicks": 5,
  "clicks": [
    {
      "id": 1,
      "timestamp": "2025-12-01T10:30:00.000Z",
      "language": "de",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    }
  ],
  "byLanguage": {
    "de": 2,
    "en": 2,
    "es": 1,
    "unknown": 0
  },
  "lastClick": "2025-12-01T10:30:00.000Z"
}
```

## Health Check
Der `/health` Endpoint zeigt auch die Gesamtzahl der Klicks:
```bash
curl https://michael-homepage-production.up.railway.app/health
```

## Wichtig
⚠️ Die Daten werden im Speicher gehalten und gehen bei Railway-Neustart verloren.
Für permanente Speicherung müsste eine Datenbank (PostgreSQL/MongoDB) integriert werden.

## Nächste Schritte (optional)
- [ ] Datenbank-Integration für permanente Speicherung
- [ ] Admin-Dashboard zur Visualisierung
- [ ] Export als CSV/Excel
- [ ] Email-Benachrichtigungen bei Downloads
