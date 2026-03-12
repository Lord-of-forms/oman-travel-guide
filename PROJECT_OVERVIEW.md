# Project Documentation: Travel Guide 🌍✨
# Projekt-Dokumentation: Travel Guide 🌍✨

---

## 🇬🇧 English

This document provides an overview of all implemented features, the AI integration architecture, and user workflows.

### 🚀 Core Features

#### 1. AI-Powered Discovery
- **Discovery Wizard**: An interactive 4-step assistant that generates personalized hidden gem recommendations through targeted questions (terrain, activity, style)
- **AI Place Research**: Users can add new places by name only; an AI agent automatically researches details like description, highlights, categorization, and location
- **In-Detail AI Assistant**: Every place has a dedicated chat area where users can ask specific questions about arrival, equipment, camping spots, etc.

#### 2. Multi-Destination Architecture
- **Destination Selector**: Browse featured destinations or search for any destination worldwide
- **Dynamic AI Prompts**: All AI interactions adapt to the selected destination
- **Per-Destination Storage**: Custom places, ratings, notes, and plans are stored separately per destination
- **Oman as Featured Example**: The original Oman data is preserved as a featured/template destination

#### 3. Trip Planning & Management
- **Interactive Timeline**: Manage selected places with drag-and-drop-like reordering (arrows) and indexing
- **Dynamic Duration Management**: Manual duration input or AI-suggested durations based on the significance of the place
- **Route & Budget Generator**: Creates a complete travel plan including schedule and cost estimation using Gemini models
- **Google Maps Integration**: Opens a multi-stop route directly in Google Maps

#### 4. Additional Features
- **Weather Widget**: Current weather and 5-day forecast using OpenWeatherMap API
- **Currency Converter**: Real-time exchange rates for destination currencies
- **Interactive Map**: All places displayed as pins on a Leaflet/OpenStreetMap view
- **Packing Lists**: Smart templates by destination type (desert, beach, mountain, city)
- **Share Feature**: Share places and plans via Web Share API, WhatsApp, Email, or clipboard
- **Multi-Language**: German and English interface with dynamic AI prompt language

#### 5. User Accounts (Supabase)
- **Email/Password Authentication**: Registration and login via Supabase Auth
- **Personal Profiles**: Users can save favorite places, notes, trip plans, and packing lists
- **Admin Panel**: Admin users (managed via `admin_users` table) can manage content and users
- **Row Level Security**: All database tables protected with RLS policies

#### 6. Technical Robustness
- **Multi-Model Architecture**: Support for Gemini 3 Flash (performance), 2.5 Flash (stability), and 1.5 Pro (precision)
- **Smart Quota Recovery**: Monitoring of 429 errors with automatic model switching suggestions
- **PWA / Offline Support**: Service worker caching for offline access
- **Error Boundary**: Friendly error recovery UI instead of white screen crashes
- **Defensive Data Handling**: Try/catch for localStorage, null checks for AI-generated data

### 🗺️ User Workflows

#### A. Discovery Workflow
1. Select a destination (or create a new one)
2. Browse the discovery tab or use the AI Discovery Wizard
3. Click a card to open the detail view with AI chat
4. Add places to your trip planner

#### B. AI Research Workflow
1. Click "AI Research" to add a place not in the list
2. Enter the place name
3. AI generates a complete data card and adds it to the collection

#### C. Route Optimization Workflow
1. Switch to the Trip Planner tab
2. Reorder places for optimal routing
3. Request AI duration suggestions
4. Generate a complete AI-powered itinerary

#### D. Export & Departure Workflow
1. Review the generated plan (Markdown preview)
2. Export as .md file or share via WhatsApp/Email
3. Open multi-stop route in Google Maps

### 🛠 Technologies
- **Frontend**: React 19, Vite 7, Framer Motion, Lucide React
- **AI Engine**: @google/generative-ai (Gemini SDK)
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **Maps**: Leaflet + react-leaflet + OpenStreetMap
- **Persistence**: Supabase DB + localStorage fallback
- **Styling**: Modern Vanilla CSS with Glassmorphism effects
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🇩🇪 Deutsch

Dieses Dokument bietet eine Übersicht über alle implementierten Funktionen, die KI-Integrationsarchitektur und die Benutzer-Workflows.

### 🚀 Kernfunktionen

#### 1. KI-gestützte Entdeckung
- **Discovery Wizard**: Interaktiver 4-Schritte-Assistent für personalisierte Geheimtipps
- **KI-Ortsrecherche**: Orte per Name hinzufügen — KI recherchiert automatisch alle Details
- **In-Detail KI-Assistent**: Dedizierter Chat pro Ort für spezifische Reisefragen

#### 2. Multi-Destinationen-Architektur
- **Destinations-Auswahl**: Featured Destinations durchsuchen oder weltweit jedes Ziel finden
- **Dynamische KI-Prompts**: Alle KI-Interaktionen passen sich dem gewählten Ziel an
- **Getrennte Datenspeicherung**: Eigene Orte, Bewertungen und Pläne pro Destination

#### 3. Reiseplanung & Management
- **Interaktive Timeline**: Reihenfolge per Pfeiltasten anpassen
- **KI-Aufenthaltsvorschläge**: Automatische Dauer-Empfehlungen
- **Routen- & Budget-Generator**: Vollständiger Reiseplan mit Zeitplan und Kosten

#### 4. Zusätzliche Features
- **Wetter-Widget**: Aktuelles Wetter und 5-Tage-Vorhersage
- **Währungsrechner**: Echtzeit-Wechselkurse
- **Interaktive Karte**: Alle Orte als Pins auf OpenStreetMap
- **Packlisten**: Vorlagen nach Destinationstyp
- **Teilen-Funktion**: Via Link, WhatsApp, E-Mail
- **Mehrsprachig**: Deutsch und Englisch

#### 5. Benutzerkonten (Supabase)
- Email/Passwort-Authentifizierung
- Persönliche Profile mit gespeicherten Orten und Plänen
- Admin-Panel für Inhalts- und Benutzerverwaltung

#### 6. Technische Robustheit
- Multi-Modell-Unterstützung (Gemini 3/2.5/1.5)
- PWA / Offline-Support
- Error Boundary & defensive Datenverarbeitung

### 🗺️ Benutzer-Workflows

#### A. Von der Idee zum Ort
1. Destination wählen
2. Tab "Entdecken" oder KI-Discovery-Wizard nutzen
3. Kachel anklicken für Detailansicht mit KI-Chat
4. "In den Planer" klicken

#### B. KI-Recherche
1. "KI-Ortsrecherche" klicken
2. Ortsnamen eingeben
3. KI generiert vollständige Datenkarte

#### C. Routen-Optimierung
1. Zum Reiseplaner wechseln
2. Reihenfolge anpassen
3. KI-Route generieren

#### D. Export & Abreise
1. Plan prüfen und als .md exportieren
2. Via WhatsApp/E-Mail teilen
3. In Google Maps öffnen

### 🛠 Technologien
- **Frontend**: React 19, Vite 7, Framer Motion, Lucide React
- **KI-Engine**: @google/generative-ai (Gemini SDK)
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **Karten**: Leaflet + react-leaflet + OpenStreetMap
- **Persistenz**: Supabase DB + localStorage-Fallback
- **Styling**: Modernes Vanilla-CSS mit Glassmorphismus-Effekten
- **Deployment**: GitHub Pages via GitHub Actions
