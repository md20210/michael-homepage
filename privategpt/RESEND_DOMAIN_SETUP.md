# 📧 Resend Domain Verifikation & Production Setup

## Problem
- ❌ Nur `michael.dabrock@gmx.es` kann sich anmelden
- ❌ Andere E-Mails (z.B. `michael.dabrock@web.de`) bekommen "500: Failed to send email"

## Lösung: Resend Production-Modus

### ✅ Schritt 1: Domain bei Resend verifizieren

1. **Gehe zu Resend Dashboard**:
   - https://resend.com/domains
   - Login mit deinem Resend Account

2. **Füge Domain hinzu**:
   - Klick "Add Domain"
   - Gib ein: `dabrock.eu`
   - Klick "Add"

3. **DNS-Records kopieren**:
   Resend zeigt dir DNS-Records wie diese (Beispiel):

   ```
   Type: TXT
   Name: resend._domainkey
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...

   Type: TXT
   Name: _resend
   Value: resend-verify=abc123xyz...

   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```

4. **DNS-Records bei Strato hinzufügen**:
   - Gehe zu Strato → DNS-Verwaltung für dabrock.eu
   - Füge die Records von Resend hinzu (siehe Punkt 3)
   - Speichern

5. **Warte & Verifiziere**:
   - Warte 5-15 Minuten (DNS-Propagierung)
   - Gehe zurück zu Resend
   - Klick "Verify Domain"
   - ✅ Status sollte "Verified" werden

---

### ✅ Schritt 2: Railway Environment Variable setzen

**Option A: Railway Dashboard** (Empfohlen)

1. Gehe zu: https://railway.app
2. Wähle dein Projekt: `michael-homepage`
3. Wähle Service: `backend`
4. Klick auf Tab: **"Variables"**
5. Suche: `FROM_EMAIL`
6. Ändere Wert auf: `noreply@dabrock.eu`
7. Klick "Save" oder Railway deployed automatisch

**Option B: Railway CLI**

```bash
cd /mnt/e/Project20250615/portfolio-website/michael-homepage
export RAILWAY_TOKEN="9559480d-f22c-4d1f-90c8-5399567b140b"
railway link
# Dann im Railway Dashboard die Variable ändern
```

---

### ✅ Schritt 3: Code-Änderungen (bereits erledigt ✅)

- ✅ `backend/.env`: `FROM_EMAIL=noreply@dabrock.eu`
- ✅ `backend/.env.example`: `FROM_EMAIL=noreply@dabrock.eu`
- ✅ `backend/config.py`: Default ist bereits `noreply@dabrock.eu`

**Commit & Deploy:**
```bash
git add privategpt/backend/.env privategpt/backend/.env.example
git commit -m "Change FROM_EMAIL to noreply@dabrock.eu for production"
git push origin main
```

---

### 📊 Vorher vs. Nachher

| Zustand | FROM_EMAIL | Erlaubte E-Mails |
|---------|------------|------------------|
| **Vorher** | `onboarding@resend.dev` | Nur michael.dabrock@gmx.es (verifiziert) |
| **Nachher** | `noreply@dabrock.eu` | ✅ **ALLE E-Mail-Adressen** |

---

### 🧪 Testen

Nach Domain-Verifikation + Railway-Deployment:

1. Gehe zu: https://www.dabrock.eu/privategpt
2. Versuch Login mit: `michael.dabrock@web.de`
3. ✅ Sollte funktionieren!
4. Check E-Mail Inbox
5. ✅ Magic Link sollte ankommen (Absender: noreply@dabrock.eu)

---

### 🔍 Troubleshooting

**Problem**: Domain wird nicht verifiziert
- ✅ Prüfe DNS-Records bei Strato
- ✅ Warte 15-30 Min (DNS-Propagierung)
- ✅ Verwende: https://dnschecker.org zur Überprüfung

**Problem**: E-Mails kommen nicht an
- ✅ Check Spam-Ordner
- ✅ Prüfe Railway Logs: `railway logs --service backend`
- ✅ Prüfe Resend Dashboard → "Logs" → Siehe gesendete E-Mails

**Problem**: Railway Variable nicht gesetzt
- ✅ Gehe zu Railway Dashboard → Variables
- ✅ Stelle sicher `FROM_EMAIL=noreply@dabrock.eu` ist gesetzt
- ✅ Railway deployed automatisch nach Variable-Änderung

---

### 📚 Links

- Resend Dashboard: https://resend.com
- Railway Dashboard: https://railway.app
- DNS Checker: https://dnschecker.org
- Resend Docs: https://resend.com/docs/dashboard/domains/introduction
