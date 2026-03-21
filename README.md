# Oman Unentdeckt - Projekthistorie & Dokumentation

Diese Dokumentation fasst die Entwicklung der interaktiven Oman-Reiseplattform zusammen.

## 🌟 Projekt-Zusammenfassung
Eine moderne Web-App, die 20 außergewöhnliche "Off-the-beaten-path"-Erlebnisse im Oman präsentiert. Integriert mit der Gemini AI von Google, um individuelle Reisefragen direkt auf der Seite zu beantworten.

## 🛠 Technologie-Stack
- **Frontend**: React 18 (Vite)
- **Styling**: Vanilla CSS (Custom Design System, Glassmorphism)
- **Animationen**: Framer Motion
- **Icons**: Lucide React
- **KI**: Google Generative AI SDK (Gemini 3.1 Flash Lite)
- **Inhalte**: `experiences.json` (20 recherchierte Orte)

## 📈 Entwicklungsverlauf (Chronologie)

1. **Konzeption & Recherche**: 
   - Auswahl von 20 einzigartigen Orten abseits der touristischen Massen.
   - Kategorisierung in Dörfer, Wüste, Küste, Natur und Abenteuer.

2. **Grundgerüst & Design**:
   - Initialisierung des Projekts.
   - Erstellung eines "Premium"-Designs in Dark-Mode mit goldenen Akzenten.
   - Entwicklung der interaktiven Karten-Ansicht.

3. **KI-Integration & Lokalisierung**:
   - Anbindung der Gemini API mit lokaler Key-Speicherung.
   - Komplette Übersetzung der Datenbank und Benutzeroberfläche ins Deutsche.
   - Anpassung der KI-Prompts für deutschsprachige Geheimtipps.

4. **UX-Optimierung**:
   - Einführung eines immersiven Split-Screen-Layouts (60/40 Ansicht).
   - Implementierung von Markdown-Rendering für schön formatierte KI-Antworten.
   - Hinzufügen von "Suggested Questions" für schnellen Einstieg.

5. **Fehlerbehebung & Diagnose**:
   - Implementierung eines detaillierten Status-Systems für den API-Key.
   - Hinzufügen eines Hilfe-Panels zur Diagnose von Netzwerk-Blockaden (VPN, Ad-Blocker).

## 🚀 Installation & Betrieb

Falls Sie das Projekt in einer neuen Umgebung starten möchten:

1. Navigieren Sie in das Projektverzeichnis.
2. Führen Sie `npm install` aus, um alle Module zu laden.
3. Starten Sie die App mit `npm run dev`.
4. Öffnen Sie den angezeigten Link (meist `http://localhost:5173`).
5. Geben Sie Ihren Gemini API Key oben rechts ein.

---
**Hinweis zum Export**: Dieses Projekt wurde auf Ihren Desktop kopiert, um einen schnellen Zugriff zu ermöglichen.
