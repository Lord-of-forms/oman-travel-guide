# Projekt-Dokumentation: Oman Unentdeckt 🇴🇲✨

Dieses Dokument bietet eine Übersicht über alle implementierten Funktionen, die Architektur der KI-Integration und die Benutzer-Workflows.

---

## 🚀 Kernfunktionen

### 1. KI-gestützte Entdeckung
*   **Discovery Wizard**: Ein interaktiver 4-Schritte-Assistent, der durch gezielte Fragen (Terrain, Aktivität, Stil) personalisierte Geheimtipps generiert.
*   **Agentenrecherche (KI-Recherche)**: Nutzer können neue Orte nur mit dem Namen hinzufügen; ein KI-Agent recherchiert automatisch Details wie Kurzbeschreibung, Highlights, Kategorisierung und Standort.
*   **In-Detail KI-Assistent**: Jeder Ort verfügt über einen dedizierten Chat-Bereich, in dem spezifische Fragen zur Anreise, Ausrüstung oder Campingplätzen beantwortet werden.

### 2. Reiseplanung & Management
*   **Interaktive Timeline**: Verwaltung der ausgewählten Orte mit Drag-and-Drop-ähnlicher Reihung (Pfeile) und Indexierung.
*   **Dynamisches Zeitmanagement**: Manuelle Eingabe der Aufenthaltsdauer oder KI-gestützte Vorschläge basierend auf der Bedeutung des Ortes.
*   **Routen- & Budget-Generator**: Erstellung eines vollständigen Reiseplans inklusive Zeitplan und Kostenschätzung auf Basis von Gemini-Modellen.

### 3. UI/UX & Ansichten
*   **Multi-View Support**: Umschalten zwischen bildorientiertem Grid und kompakter Listenansicht.
*   **In-Detail Selection**: Orte können direkt beim Betrachten der Details zum Reiseplaner hinzugefügt oder daraus entfernt werden.
*   **Archivsystem**: Orte können ausgeblendet (archiviert) und bei Bedarf wiederhergestellt werden.

### 4. Technische Robustheit (KI & Quota)
*   **Multi-Modell-Architektur**: Unterstützung für Gemini 3.1 Flash Lite (Neueste, Standard) und Gemini 3 Flash (Schnell).
*   **Smart Quota Recovery**: Überwachung von 429-Fehlern (Limit überschritten). Bei Erreichen des Limits von Gemini 3.1 Flash Lite wird dem Nutzer ein direkter Wechsel zu Gemini 3 Flash angeboten.
*   **API-Key Hardening**: Automatische Bereinigung von Leerzeichen, Validierungs-Prüfung beim Start und dedizierter Reset-Button in den Einstellungen.

---

## 🗺️ Benutzer-Workflows

### A. Workflow "Von der Idee zum Ort"
1.  **Einstieg**: Start im Tab "Entdecken".
2.  **Interaktion**: Nutzen des "KI-Discovery-Wizards" für neue Inspiration ODER Direktsuche via Filter/Suche.
3.  **Vertiefung**: Klick auf eine Kachel öffnet die Detailansicht.
4.  **Entscheidung**: Klick auf den Button **"In den Planer"** (direkt in der Detailansicht) fügt den Ort der aktiven Reise hinzu.

### B. Workflow "Agenten-Expansion"
1.  **Bedürfnis**: Nutzer möchte einen Ort hinzufügen, der nicht in der Liste ist.
2.  **Aktion**: Klick auf **"KI-Ortsrecherche"**.
3.  **Input**: Eingabe des Namens (z.B. "Wadi Shab").
4.  **Magie**: KI-Agent generiert eine vollständige Datenkarte und integriert sie in die lokale Sammlung.

### C. Workflow "Routen-Optimierung"
1.  **Planung**: Wechsel zum Tab "Reiseplaner".
2.  **Struktur**: Anpassen der Reihenfolge der Orte an die geplante Fahrtrichtung.
3.  **KI-Support**: Anfordern eines **"KI-Aufenthalts-Vorschlags"** für favorisierte Orte (Top-Rated).
4.  **Generierung**: Festlegen der Reise-Dauer und Klick auf **"KI-Route generieren"**.

### D. Workflow "Export & Abreise"
1.  **Finalisierung**: Prüfen des generierten Plans (Markdown-Vorschau).
2.  **Sicherung**: Export des Plans als `.md` Datei für die Offline-Nutzung.
3.  **Teilen**: Versenden der Route via WhatsApp/E-Mail an Mitreisende.
4.  **Navigation**: Klick auf **"In Google Maps öffnen"** erstellt eine Multi-Stopp-Route für das Smartphone.

---

## 🛠️ Technologien
*   **Frontend**: React, Framer Motion (Animationen), Lucide React (Icons).
*   **AI Engine**: `@google/generative-ai` (Gemini SDK).
*   **Persistence**: `localStorage` (API-Keys, Favoriten, eigene Recherche-Ergebnisse).
*   **Styling**: Modernes Vanilla-CSS mit Glasmorphismus-Effekten.
