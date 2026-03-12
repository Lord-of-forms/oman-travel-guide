# 🌍 Travel Guide — AI-Powered Multi-Destination Travel Planner

> **Your intelligent travel companion for any destination worldwide.**
> *Ihr intelligenter Reisebegleiter für jedes Ziel weltweit.*

---

## 🇬🇧 English

### About
Travel Guide is a modern, AI-powered web application that helps you discover, plan, and organize trips to any destination in the world. Powered by Google's Gemini AI, it generates personalized recommendations, creates detailed itineraries, and provides an intelligent travel assistant for each place.

### ✨ Features
- **🤖 AI-Powered Discovery** — Interactive wizard that generates personalized hidden gem recommendations using Gemini AI
- **🗺️ Multi-Destination Support** — Explore any destination worldwide, not limited to a single country
- **📅 Smart Trip Planner** — Build and organize your itinerary with AI-optimized routing and duration suggestions
- **💬 AI Travel Assistant** — Ask destination-specific questions about each place (arrival, gear, camping, etc.)
- **🔍 AI Place Research** — Add any place by name; the AI agent researches and generates a complete data card
- **⭐ Ratings & Notes** — Rate places, add personal notes, and export them
- **📱 Mobile Optimized** — Fully responsive design with touch-friendly navigation
- **🌐 Multi-Language** — German and English interface
- **🌤️ Weather Widget** — Current weather and 5-day forecast per destination
- **💱 Currency Converter** — Real-time exchange rates for destination currencies
- **🗺️ Interactive Map** — View all discovered places as pins on an OpenStreetMap
- **📤 Share Feature** — Share places and trip plans via link, WhatsApp, or email
- **🧳 Packing Lists** — Smart packing list templates by destination type
- **📴 Offline Support** — PWA with service worker for offline access
- **🔐 User Accounts** — Supabase-powered authentication with personal profiles

### 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7 |
| **Styling** | Vanilla CSS (Glassmorphism Design System) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **AI Engine** | Google Generative AI SDK (Gemini 2.5 Flash / 3 Flash / 1.5 Pro) |
| **Backend** | Supabase (Auth, Database, Row Level Security) |
| **Maps** | Leaflet + OpenStreetMap |
| **Deployment** | GitHub Pages (CI/CD via GitHub Actions) |

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+ and npm
- A [Google Gemini API Key](https://aistudio.google.com/apikey)
- (Optional) A [Supabase](https://supabase.com) project for user accounts

#### Installation

```bash
# Clone the repository
git clone https://github.com/Lord-of-forms/travel-guide.git
cd travel-guide

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key  # Optional: can also be entered in the app UI
```

> **Note:** The Gemini API key can also be entered directly in the app's Settings tab. Supabase credentials are required only if you want user authentication features.

#### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

### 🗄️ Supabase Setup

If you want to enable user accounts and cloud sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file from `supabase/migrations/`
3. Copy your **Project URL** and **anon public key** from Settings → API
4. Add them to your `.env` file as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Enable **Email Auth** in Authentication → Providers
6. (Optional) To create an admin user, insert their `user_id` into the `admin_users` table

### 📁 Project Structure

```
travel-guide/
├── .github/workflows/    # GitHub Actions CI/CD
├── public/               # Static assets (icons, manifest)
├── src/
│   ├── components/       # React components
│   ├── data/             # Destination data & templates
│   │   └── destinations/ # Per-destination JSON files
│   ├── i18n/             # Translations (DE/EN)
│   ├── lib/              # Supabase client, utilities
│   └── index.css         # Global styles
├── supabase/
│   └── migrations/       # SQL schema & RLS policies
├── .env.example          # Environment variable template
├── index.html            # Entry point
├── vite.config.js        # Vite configuration
└── package.json
```

### 🌐 Live Demo

[**→ Open Travel Guide**](https://lord-of-forms.github.io/travel-guide/)

---

## 🇩🇪 Deutsch

### Über das Projekt
Travel Guide ist eine moderne, KI-gestützte Webanwendung, die Ihnen hilft, Reisen zu jedem Ziel weltweit zu entdecken, zu planen und zu organisieren. Angetrieben von Googles Gemini-KI generiert sie personalisierte Empfehlungen, erstellt detaillierte Reisepläne und bietet einen intelligenten Reiseassistenten für jeden Ort.

### ✨ Funktionen
- **🤖 KI-gestützte Entdeckung** — Interaktiver Assistent, der personalisierte Geheimtipps mit Gemini-KI generiert
- **🗺️ Multi-Destinationen** — Erkunden Sie jedes Reiseziel weltweit
- **📅 Intelligenter Reiseplaner** — Erstellen und organisieren Sie Ihren Reiseplan mit KI-optimierter Routenführung
- **💬 KI-Reiseassistent** — Stellen Sie ortsspezifische Fragen zu Anreise, Ausrüstung, Camping etc.
- **🔍 KI-Ortsrecherche** — Fügen Sie jeden Ort per Name hinzu; der KI-Agent recherchiert automatisch alle Details
- **⭐ Bewertungen & Notizen** — Bewerten Sie Orte und fügen Sie persönliche Notizen hinzu
- **📱 Mobiloptimiert** — Vollständig responsives Design mit Touch-Navigation
- **🌐 Mehrsprachig** — Deutsche und englische Benutzeroberfläche
- **🌤️ Wetter-Widget** — Aktuelles Wetter und 5-Tage-Vorhersage pro Destination
- **💱 Währungsrechner** — Echtzeit-Wechselkurse für Zielland-Währungen
- **🗺️ Interaktive Karte** — Alle entdeckten Orte als Pins auf OpenStreetMap
- **📤 Teilen-Funktion** — Orte und Reisepläne per Link, WhatsApp oder E-Mail teilen
- **🧳 Packlisten** — Intelligente Packlisten-Vorlagen nach Destinationstyp
- **📴 Offline-Support** — PWA mit Service Worker für Offline-Zugriff
- **🔐 Benutzerkonten** — Supabase-basierte Authentifizierung mit persönlichen Profilen

### 🚀 Schnellstart

```bash
git clone https://github.com/Lord-of-forms/travel-guide.git
cd travel-guide
npm install
cp .env.example .env   # Umgebungsvariablen konfigurieren
npm run dev
```

Öffnen Sie [http://localhost:5173](http://localhost:5173) im Browser.

### Umgebungsvariablen

```env
VITE_SUPABASE_URL=https://ihr-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=ihr-supabase-anon-key
VITE_GEMINI_API_KEY=ihr-gemini-api-key  # Optional: kann auch in der App eingegeben werden
```

> **Hinweis:** Der Gemini API Key kann auch direkt im Einstellungen-Tab der App eingegeben werden. Supabase-Zugangsdaten werden nur für die Benutzerauthentifizierung benötigt.

### 🗄️ Supabase-Einrichtung

1. Erstellen Sie ein kostenloses Projekt auf [supabase.com](https://supabase.com)
2. Führen Sie die Migrationsdatei aus `supabase/migrations/` im SQL-Editor aus
3. Kopieren Sie **Projekt-URL** und **anon public key** aus Einstellungen → API
4. Tragen Sie diese in Ihre `.env`-Datei als `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` ein
5. Aktivieren Sie **Email Auth** unter Authentication → Providers
6. (Optional) Erstellen Sie einen Admin-Benutzer durch Einfügen der `user_id` in die `admin_users`-Tabelle

---

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.
