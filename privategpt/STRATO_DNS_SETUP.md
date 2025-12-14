# 🌐 Strato DNS Setup für Resend Domain-Verifikation

## 📋 DNS-Records von Resend (dabrock.eu)

Du musst diese **5 DNS-Records** bei Strato hinzufügen:

---

## 1️⃣ DKIM Record (E-Mail Signing)

**Warum:** Authentifiziert deine E-Mails (verhindert Spam-Markierung)

```
Type:     TXT
Name:     resend._domainkey
Content:  p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC362tS5mG8q86oGGyu1uszSwVx4/bB1PaOQyXi9e61Undhj6HF6K+0Fv/5S7xqK2EN3ntig3e8oYmedWsAX+Y5gKitNX+5NHZQNFeJsjcT8taR6i+2V6TvkWk3CIjQOr5qXUW3VWBW19WAGy6cXK1IJ9O4mHj6yWs+whovnxLmGQIDAQAB
TTL:      Auto / 3600
```

---

## 2️⃣ SPF Record - MX (E-Mail Sending)

**Warum:** Erlaubt Amazon SES, E-Mails in deinem Namen zu senden

```
Type:     MX
Name:     send
Content:  feedback-smtp.eu-west-1.amazonses.com
TTL:      Auto / 3600
Priority: 10
```

---

## 3️⃣ SPF Record - TXT (E-Mail Policy)

**Warum:** Definiert, welche Server E-Mails für deine Domain senden dürfen

```
Type:     TXT
Name:     send
Content:  v=spf1 include:amazonses.com ~all
TTL:      Auto / 3600
```

---

## 4️⃣ MX Record (E-Mail Receiving)

**Warum:** Empfängt Bounce/Feedback-E-Mails von Amazon SES

```
Type:     MX
Name:     @
Content:  inbound-smtp.eu-west-1.amazonaws.com
TTL:      Auto / 3600
Priority: 4
```

**⚠️ WICHTIG:** Wenn du bereits einen MX-Record hast (für deine normale E-Mail), **behalte den**! Füge diesen als **zweiten MX-Record** hinzu.

---

## 🔧 Schritt-für-Schritt: DNS-Records bei Strato hinzufügen

### Schritt 1: Strato DNS-Verwaltung öffnen

1. Gehe zu: https://www.strato.de
2. Login → **Kunden-Login**
3. Gehe zu: **Domains** → **dabrock.eu**
4. Klicke: **DNS-Einstellungen** oder **Domain-Verwaltung**
5. Suche nach: **DNS-Records bearbeiten** oder **Erweiterte DNS-Einstellungen**

### Schritt 2: DKIM TXT-Record hinzufügen

```
Typ:    TXT
Host:   resend._domainkey.dabrock.eu
        (oder nur: resend._domainkey)
Wert:   p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC362tS5mG8q86oGGyu1uszSwVx4/bB1PaOQyXi9e61Undhj6HF6K+0Fv/5S7xqK2EN3ntig3e8oYmedWsAX+Y5gKitNX+5NHZQNFeJsjcT8taR6i+2V6TvkWk3CIjQOr5qXUW3VWBW19WAGy6cXK1IJ9O4mHj6yWs+whovnxLmGQIDAQAB
TTL:    3600 (oder "Auto")
```

- Klick "Hinzufügen" oder "Speichern"

### Schritt 3: SPF MX-Record hinzufügen

```
Typ:      MX
Host:     send.dabrock.eu
          (oder nur: send)
Wert:     feedback-smtp.eu-west-1.amazonses.com
Priorität: 10
TTL:      3600
```

- Klick "Hinzufügen" oder "Speichern"

### Schritt 4: SPF TXT-Record hinzufügen

```
Typ:    TXT
Host:   send.dabrock.eu
        (oder nur: send)
Wert:   v=spf1 include:amazonses.com ~all
TTL:    3600
```

- Klick "Hinzufügen" oder "Speichern"

### Schritt 5: MX-Record für Receiving hinzufügen

```
Typ:      MX
Host:     dabrock.eu
          (oder: @ oder leer lassen für Root-Domain)
Wert:     inbound-smtp.eu-west-1.amazonaws.com
Priorität: 4
TTL:      3600
```

**⚠️ WICHTIG:**
- Wenn du **bereits einen MX-Record** hast (z.B. für GMX, Gmail, etc.): **BEHALTE DEN!**
- Füge diesen neuen MX-Record **zusätzlich** hinzu
- Dein bestehender MX-Record sollte Priorität 1-3 haben
- Dieser Resend-MX-Record hat Priorität 4 (niedrigere Priorität = Backup)

### Schritt 6: Speichern & Warten

1. **Speichere** alle DNS-Records bei Strato
2. **Warte 5-15 Minuten** (DNS-Propagierung)
3. Optional: Prüfe mit https://dnschecker.org
   - Gib ein: `resend._domainkey.dabrock.eu`
   - Type: TXT
   - ✅ Sollte den DKIM-Wert zeigen

---

## ✅ Schritt 7: Domain bei Resend verifizieren

1. Gehe zurück zu: https://resend.com/domains
2. Wähle: **dabrock.eu**
3. Klicke: **"Verify Domain"** oder **"Check Records"**
4. ✅ Status sollte **"Verified"** werden

**Falls nicht verifiziert:**
- Warte noch 5-10 Minuten
- Prüfe nochmal alle Records bei Strato
- Verwende https://dnschecker.org zur Überprüfung

---

## 🧪 Testen

Nach erfolgreicher Verifikation:

1. Gehe zu: https://www.dabrock.eu/privategpt
2. Versuche Login mit: `michael.dabrock@web.de`
3. ✅ E-Mail sollte ankommen (Absender: noreply@dabrock.eu)
4. ✅ Login sollte funktionieren!

---

## 📊 Übersicht: Was jeder Record macht

| Record | Zweck | Erforderlich? |
|--------|-------|---------------|
| **DKIM TXT** | E-Mail Signatur (Anti-Spam) | ✅ Ja |
| **SPF MX** | E-Mail Sending Server | ✅ Ja |
| **SPF TXT** | E-Mail Sending Policy | ✅ Ja |
| **MX (Priority 4)** | Bounce/Feedback empfangen | ⚠️ Optional (empfohlen) |

---

## 🔧 Strato-spezifische Hinweise

### Host/Name Feld:

Strato erlaubt verschiedene Formate:

✅ **Richtig:**
- `resend._domainkey`
- `resend._domainkey.dabrock.eu`

❌ **Falsch:**
- `resend._domainkey.dabrock.eu.` (kein Punkt am Ende!)

### TTL (Time To Live):

- Wenn Strato fragt: Wähle **3600** oder **Auto**
- Das ist die Cache-Zeit (1 Stunde)

### @ Symbol:

- `@` bedeutet "Root-Domain" (dabrock.eu)
- Manche Panels nutzen `@`, andere lassen es leer

---

## 🆘 Troubleshooting

**Problem:** "Verify" schlägt fehl
- ✅ Prüfe alle Records nochmal
- ✅ Warte 15-30 Min (DNS braucht Zeit)
- ✅ Verwende https://dnschecker.org

**Problem:** DKIM zu lang für Strato-Feld
- ✅ Strato sollte lange TXT-Records unterstützen
- ✅ Falls nicht: Kontaktiere Strato-Support

**Problem:** MX-Record Konflikt
- ✅ Behalte deinen bestehenden MX-Record
- ✅ Füge Resend-MX mit niedrigerer Priorität hinzu (4 statt 1)

---

## 📞 Support

- Strato Support: https://www.strato.de/faq/
- Resend Docs: https://resend.com/docs/dashboard/domains/introduction
- DNS Checker: https://dnschecker.org
