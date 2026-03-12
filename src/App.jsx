import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import experiencesData from './data/experiences.json';
import { getDestinationById } from './data/destinations.js';
import ExperienceGrid from './components/ExperienceGrid';
import ExperienceDetail from './components/ExperienceDetail';
import ExperienceWizard from './components/ExperienceWizard';
import WeatherWidget from './components/WeatherWidget';
import CurrencyConverter from './components/CurrencyConverter';
import PackingList from './components/PackingList';
import { useLanguage } from './i18n/LanguageContext.jsx';
import { getCurrencyForCountry } from './data/currencyMap.js';
import { generateItineraryShareText, shareViaWhatsApp, shareViaEmail, copyToClipboard } from './utils/sharing.js';
import {
  CheckCircle,
  RefreshCw,
  Settings,
  ShieldAlert,
  Calendar,
  Map as MapIcon,
  Sparkles,
  Loader2,
  X,
  Plus,
  Download,
  Archive,
  Navigation,
  ChevronRight,
  Compass,
  Search,
  LayoutGrid,
  List,
  Star,
  AlertTriangle,
  Map,
  Globe,
  Share2,
  SortDesc,
  ChevronDown,
  Package,
  WifiOff,
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const MapView = lazy(() => import('./components/MapView'));

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function getNoteText(note) {
  if (!note) return '';
  if (typeof note === 'object') return note.text || '';
  return note;
}

function App() {
  const { t, locale, setLocale } = useLanguage();

  const [currentDestinationId] = useState(() => {
    return localStorage.getItem('travel_guide_destination') || 'oman';
  });
  const currentDestination = getDestinationById(currentDestinationId);
  const destKey = `travel_guide_${currentDestinationId}`;

  const [activeTab, setActiveTab] = useState('discovery');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('gemini_selected_model');
    const validModels = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-1.5-pro'];
    return validModels.includes(saved) ? saved : 'gemini-2.5-flash';
  });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [apiStatus, setApiStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [weatherApiKey, setWeatherApiKey] = useState(localStorage.getItem('travel_guide_weather_api_key') || '');
  const [homeCurrency, setHomeCurrency] = useState(localStorage.getItem('travel_guide_home_currency') || 'EUR');

  const [customPlaces, setCustomPlaces] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_custom_places`), []);
  });
  const [hiddenIds, setHiddenIds] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_hidden_ids`), []);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [sortByRating, setSortByRating] = useState(false);

  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tripDuration, setTripDuration] = useState(7);
  const [travelStyle, setTravelStyle] = useState('Ausgewogen');
  const [transportType, setTransportType] = useState(() => localStorage.getItem(`${destKey}_transport`) || 'Mietwagen');
  const [avoidAreas, setAvoidAreas] = useState(() => localStorage.getItem(`${destKey}_avoid`) || '');
  const [personalRequirements, setPersonalRequirements] = useState(() => localStorage.getItem(`${destKey}_reqs`) || '');
  const [itinerary, setItinerary] = useState(null);

  const [ratings, setRatings] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_ratings`), {});
  });
  const [customDurations, setCustomDurations] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_custom_durations`), {});
  });
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [placeNotes, setPlaceNotes] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_place_notes`), {});
  });
  const [isSuggesting, setIsSuggesting] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [showPackingList, setShowPackingList] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem(`${destKey}_start_date`) || '2026-11-01';
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(`${destKey}_onboarding_done`);
  });
  const [showDatePrompt, setShowDatePrompt] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      setSwUpdateAvailable(true);
      setSwRegistration(e.detail);
    };
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  const allExperiences = useMemo(() => [...experiencesData, ...customPlaces], [customPlaces]);

  const filteredExperiences = useMemo(() => {
    let results = allExperiences
      .filter(exp => !hiddenIds.includes(exp.id))
      .filter(exp => selectedCategory === 'Alle' || exp.category === selectedCategory)
      .filter(exp =>
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    if (sortByRating) {
      results = [...results].sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0));
    }
    return results;
  }, [allExperiences, hiddenIds, selectedCategory, searchQuery, sortByRating, ratings]);

  const selectedPlacesInOrder = useMemo(() => {
    return selectedIds.map(id => allExperiences.find(p => p.id === id)).filter(Boolean);
  }, [selectedIds, allExperiences]);

  const avgRating = useMemo(() => {
    const rated = selectedPlacesInOrder.filter(p => (ratings[p.id] || 0) > 0);
    if (rated.length === 0) return null;
    return (rated.reduce((sum, p) => sum + ratings[p.id], 0) / rated.length).toFixed(1);
  }, [selectedPlacesInOrder, ratings]);

  const destinationCurrency = getCurrencyForCountry(currentDestination?.country || 'Oman');

  const getPlaceDate = useCallback((index) => {
    if (!startDate) return null;
    let current = new Date(startDate);
    for (let i = 0; i < index; i++) {
      const placeId = selectedIds[i];
      const duration = customDurations[placeId] || 1;
      current.setDate(current.getDate() + duration);
    }
    return current;
  }, [startDate, selectedIds, customDurations]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  useEffect(() => localStorage.setItem(`${destKey}_custom_places`, JSON.stringify(customPlaces)), [customPlaces, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_hidden_ids`, JSON.stringify(hiddenIds)), [hiddenIds, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_ratings`, JSON.stringify(ratings)), [ratings, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_custom_durations`, JSON.stringify(customDurations)), [customDurations, destKey]);
  useEffect(() => localStorage.setItem('gemini_selected_model', selectedModel), [selectedModel]);
  useEffect(() => localStorage.setItem(`${destKey}_start_date`, startDate), [startDate, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_transport`, transportType), [transportType, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_avoid`, avoidAreas), [avoidAreas, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_reqs`, personalRequirements), [personalRequirements, destKey]);
  useEffect(() => localStorage.setItem(`${destKey}_place_notes`, JSON.stringify(placeNotes)), [placeNotes, destKey]);
  useEffect(() => localStorage.setItem('travel_guide_weather_api_key', weatherApiKey), [weatherApiKey]);
  useEffect(() => localStorage.setItem('travel_guide_home_currency', homeCurrency), [homeCurrency]);
  useEffect(() => {
    if (!showOnboarding) localStorage.setItem(`${destKey}_onboarding_done`, 'true');
  }, [showOnboarding, destKey]);

  const validateKey = useCallback(async (key) => {
    if (!key || key.length < 10) { setApiStatus('idle'); return; }
    setApiStatus('checking');
    try {
      const cleanKey = key.trim();
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const result = await model.generateContent("Test");
      const response = await result.response;
      if (response) {
        setApiStatus('success');
        setErrorMessage('');
        setApiKey(cleanKey);
        localStorage.setItem('gemini_api_key', cleanKey);
      }
    } catch (error) {
      console.error("Validation Error:", error);
      setApiStatus('error');
      setErrorMessage(error.message || 'Ungültiger Key oder Verbindungsfehler');
    }
  }, [selectedModel]);

  useEffect(() => {
    if (apiKey && apiKey.length > 20) {
      const timer = setTimeout(() => validateKey(apiKey), 1000);
      return () => clearTimeout(timer);
    }
  }, [apiKey, validateKey]);

  const researchAndAddPlace = async (e) => {
    e.preventDefault();
    if (!newPlaceName.trim() || !apiKey) return;
    setIsResearching(true);
    setErrorMessage('');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: `Du bist ein spezialisierter Reise-Agent fuer ${currentDestination.name} (${currentDestination.country}). Erstelle fuer einen Ort ein PRAEZISES JSON. Pflichtfelder: title, location, category (Wueste, Wasser, Gebirge, Kultur, Kueste), country, shortDescription, longDescription, highlights (Array mit 4 Punkten), tags (Array mit 3-4 Tags). Gib NUR das JSON-Objekt ohne Erklaerungen aus.`
      });
      const result = await model.generateContent(`Recherchiere Details fuer diesen Ort in ${currentDestination.name}: ${newPlaceName}`);
      const response = await result.response;
      let text = response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Kein gueltiges JSON gefunden.");
      const generatedData = JSON.parse(jsonMatch[0]);
      setCustomPlaces(prev => [...prev, { ...generatedData, country: generatedData.country || currentDestination.country, id: `custom-${Date.now()}` }]);
      setNewPlaceName(''); setShowAddForm(false);
    } catch (error) {
      console.error("Research Error:", error);
      setErrorMessage(`Recherche-Fehler: ${error.message}`);
    } finally { setIsResearching(false); }
  };

  const removePlace = (id) => {
    setHiddenIds(prev => [...prev, id]);
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setPendingId(id);
      setShowDatePrompt(true);
    }
  };

  const handleConfirmAdd = () => {
    setSelectedIds(prev => [...prev, pendingId]);
    setShowDatePrompt(false);
    setPendingId(null);
  };

  const optimizeRoute = async () => {
    if (!apiKey || selectedIds.length < 2) return;
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: `Sortiere die Orte geografisch sinnvoll fuer eine ${currentDestination.name}-Rundreise. Gib NUR ein JSON-Array der IDs zurueck.`
      });
      const placesText = selectedPlacesInOrder.map(p => `ID: ${p.id}, Titel: ${p.title}, Ort: ${p.location}`).join('\n');
      const result = await model.generateContent(`Sortiere:\n${placesText}`);
      const response = await result.response;
      const match = response.text().match(/\[.*\]/s);
      if (match) setSelectedIds(JSON.parse(match[0]).filter(id => selectedIds.includes(id)));
    } catch (error) { setErrorMessage(`Optimierung fehlgeschlagen: ${error.message}`); }
    finally { setIsGenerating(false); }
  };

  const openInGoogleMaps = () => {
    if (selectedIds.length === 0) return;
    const places = selectedPlacesInOrder;
    if (places.length === 1) {
      const p = places[0];
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.title + ' ' + p.location + ' ' + (p.country || currentDestination.country))}`, '_blank');
    } else {
      const waypoints = places.map(p => encodeURIComponent(p.title + ', ' + p.location)).join('/');
      window.open(`https://www.google.com/maps/dir/${waypoints}`, '_blank');
    }
  };

  const handleRate = (id, score) => setRatings(prev => ({ ...prev, [id]: score }));

  const generateItinerary = async () => {
    if (!apiKey || selectedIds.length === 0) return;
    setIsGenerating(true); setErrorMessage('');
    try {
      const orderWithNotes = selectedPlacesInOrder.map((p, i) => {
        const noteText = getNoteText(placeNotes[p.id]);
        const noteStr = noteText ? ` (Notiz: ${noteText})` : "";
        return `${i + 1}. ${p.title} (${customDurations[p.id] || "variabel"} Tage)${noteStr}`;
      }).join('\n');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: `Du bist ein professioneller ${currentDestination.name}-Reise-Experte. Erstelle einen Detailplan fuer ${tripDuration} Tage ab ${startDate}.
        Reisestil: ${travelStyle}.
        Transportmittel: ${transportType}.
        WICHTIG: Meide folgende Gebiete/Strassen: ${avoidAreas}.
        Besondere Anforderungen/Wuensche: ${personalRequirements}.
        Integriere diese spezifischen Erkenntnisse/Notizen zu den Orten:
        ${orderWithNotes}
        Beruecksichtige Transport-spezifische Logistik (z.B. Fahrzeiten, 4x4 Erfordernisse).
        Nutze Markdown und antworte auf Deutsch.`
      });
      const result = await model.generateContent(`Plan Details:\n${orderWithNotes}`);
      setItinerary((await result.response).text());
    } catch (error) { setErrorMessage(`Fehler: ${error.message}`); } finally { setIsGenerating(false); }
  };

  const handleDiscoveryComplete = (newPlaces) => setCustomPlaces(prev => [...prev, ...newPlaces]);

  const reorderSelectedIds = (index, direction) => {
    const newIds = [...selectedIds];
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= newIds.length) return;
    [newIds[index], newIds[newIdx]] = [newIds[newIdx], newIds[index]];
    setSelectedIds(newIds);
  };

  const exportNotes = () => {
    const entries = Object.entries(placeNotes).filter(([, v]) => getNoteText(v));
    if (entries.length === 0) return;
    const md = entries.map(([id, note]) => {
      const place = allExperiences.find(p => p.id === id);
      const text = getNoteText(note);
      const updatedAt = typeof note === 'object' && note?.updatedAt
        ? `\n*Bearbeitet: ${new Date(note.updatedAt).toLocaleString('de-DE')}*` : '';
      return `## ${place?.title || id}\n${text}${updatedAt}`;
    }).join('\n\n---\n\n');
    const blob = new Blob([`# Reisenotizen - ${currentDestination.name}\n\n${md}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notizen-${currentDestinationId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSharePlan = async () => {
    const text = generateItineraryShareText(selectedPlacesInOrder, currentDestination);
    await copyToClipboard(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSwUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage('SKIP_WAITING');
    }
    window.location.reload();
  };

  const categoryLabels = {
    'Alle': t('cat.all'),
    'Wueste': t('cat.desert'),
    'Wasser': t('cat.water'),
    'Gebirge': t('cat.mountain'),
    'Kultur': t('cat.culture'),
    'Kueste': t('cat.coast'),
  };

  const getCatLabel = (cat) => {
    const map = {
      'Alle': t('cat.all'),
      'Wüste': t('cat.desert'),
      'Wasser': t('cat.water'),
      'Gebirge': t('cat.mountain'),
      'Kultur': t('cat.culture'),
      'Küste': t('cat.coast'),
    };
    return map[cat] || cat;
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {isOffline && (
          <motion.div
            className="offline-banner"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
          >
            <WifiOff size={16} />
            <span>{t('offline.message')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {swUpdateAvailable && (
          <motion.div
            className="sw-update-toast"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
          >
            <span>{t('update.available')}</span>
            <button onClick={handleSwUpdate}>{t('update.reload')}</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="main-header">
        <div className="header-brand">
          <h1>Travel Guide</h1>
          <span className="destination-badge">{currentDestination.emoji} {currentDestination.name}</span>
        </div>

        <nav className="tab-navigation">
          <button className={`nav-item ${activeTab === 'discovery' ? 'active' : ''}`} onClick={() => { setActiveTab('discovery'); window.scrollTo(0, 0); }}><Compass size={18} /> {t('nav.discover')}</button>
          <button className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => { setActiveTab('planner'); window.scrollTo(0, 0); }}><Navigation size={18} /> {t('nav.planner')} {selectedIds.length > 0 && `(${selectedIds.length})`}</button>
          <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => { setActiveTab('map'); window.scrollTo(0, 0); }}><Map size={18} /> {t('nav.map')}</button>
          <button className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => { setActiveTab('guide'); window.scrollTo(0, 0); }}><ShieldAlert size={18} /> {t('nav.guide')}</button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); window.scrollTo(0, 0); }}><Settings size={18} /> {t('nav.settings')}</button>
        </nav>

        <div className="header-status">
          <div className="header-lang-toggle">
            <button className={`lang-btn ${locale === 'de' ? 'active' : ''}`} onClick={() => setLocale('de')}>DE</button>
            <span style={{ opacity: 0.4 }}>|</span>
            <button className={`lang-btn ${locale === 'en' ? 'active' : ''}`} onClick={() => setLocale('en')}>EN</button>
          </div>
          <div className={`api-dot ${apiStatus}`} title={`API Status: ${apiStatus}`} />
        </div>
      </header>

      <main className="content-container" style={{ paddingTop: '2rem' }}>
        {activeTab === 'discovery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="filter-bar">
              <div className="search-wrapper">
                <Search className="search-icon-fixed" size={18} />
                <input type="text" placeholder={t('search.placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="filter-chips">
                {['Alle', ...currentDestination.categories].map(cat => (
                  <button key={cat} className={`chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                    {getCatLabel(cat)}
                  </button>
                ))}
                <button
                  className={`chip ${sortByRating ? 'active' : ''}`}
                  onClick={() => setSortByRating(s => !s)}
                  title={t('action.sort_by_rating')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <SortDesc size={14} /><Star size={12} />
                </button>
                <button className="secondary-btn" onClick={() => setShowAddForm(true)}><Plus size={16} /> {t('action.ai_research')}</button>
                <button className="discovery-btn" onClick={() => setShowWizard(true)}><Sparkles size={16} /> {t('action.ai_guide')}</button>
              </div>
            </div>
            {filteredExperiences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h3>{t('empty.no_places')}</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {searchQuery || selectedCategory !== 'Alle'
                    ? 'Versuchen Sie einen anderen Suchbegriff oder waehlen Sie eine andere Kategorie.'
                    : 'Noch keine Orte vorhanden. Nutzen Sie den KI-Wegweiser.'}
                </p>
                {(searchQuery || selectedCategory !== 'Alle') && (
                  <button className="secondary-btn" style={{ marginTop: '1rem' }} onClick={() => { setSearchQuery(''); setSelectedCategory('Alle'); }}>
                    {t('empty.reset_filters')}
                  </button>
                )}
              </div>
            ) : (
              <ExperienceGrid
                experiences={filteredExperiences}
                onDetailOpen={setSelectedExperience}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
                onRemove={removePlace}
                ratings={ratings}
                onRate={handleRate}
                viewMode={viewMode}
                destination={currentDestination}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="planner-view">
            <div className="itinerary-summary-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>{t('planner.timeline')}</h2>
                {avgRating !== null && (
                  <div className="planner-avg-rating">
                    <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    <span>{avgRating}</span>
                    <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: '4px' }}>{t('planner.rating_avg')}</span>
                  </div>
                )}
              </div>
              <div className="timeline-container">
                {selectedPlacesInOrder.map((p, idx) => (
                  <div key={p.id} className="manage-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="idx-tag">{idx + 1}</div>
                        <div>
                          <strong>{p.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>{formatDate(getPlaceDate(idx))}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="restore-btn" onClick={() => reorderSelectedIds(idx, -1)} disabled={idx === 0}>↑</button>
                        <button className="restore-btn" onClick={() => reorderSelectedIds(idx, 1)} disabled={idx === selectedIds.length - 1}>↓</button>
                        <button className="restore-btn" style={{ color: '#f44336' }} onClick={() => toggleSelection(p.id)}><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="travel-dates" onClick={() => setShowOnboarding(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                  <Calendar size={18} /> <span>{t('planner.start')} {formatDate(new Date(startDate))}</span>
                </div>
                <button className="plan-btn" onClick={generateItinerary} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} {t('action.generate_plan')}
                </button>
                <button className="secondary-btn" onClick={optimizeRoute} disabled={selectedIds.length < 2}><MapIcon size={18} /> {t('action.optimize_route')}</button>
                {selectedIds.length > 0 && <button className="secondary-btn" onClick={openInGoogleMaps}><Map size={18} /> {t('action.open_in_maps')}</button>}
                {selectedIds.length > 0 && (
                  <button className="secondary-btn" onClick={handleSharePlan} style={{ color: shareCopied ? 'var(--accent-gold)' : undefined }}>
                    <Share2 size={16} /> {shareCopied ? 'Kopiert!' : t('action.share_plan')}
                  </button>
                )}
              </div>
            </div>
            {itinerary && <div className="itinerary-result-area"><div className="itinerary-summary-box"><ReactMarkdown>{itinerary}</ReactMarkdown></div></div>}

            <div className="packing-section-wrapper" style={{ marginTop: '2rem' }}>
              <button
                className="packing-toggle-btn"
                onClick={() => setShowPackingList(s => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '1rem 1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem' }}
              >
                <Package size={18} />
                <span>{t('planner.packing_list')}</span>
                <ChevronDown size={16} style={{ marginLeft: 'auto', transform: showPackingList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <AnimatePresence>
                {showPackingList && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                    <div style={{ paddingTop: '1rem' }}>
                      <PackingList destination={currentDestination} locale={locale} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '70vh', minHeight: '500px' }}>
            <Suspense fallback={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <Loader2 className="animate-spin" size={32} />
              </div>
            }>
              <MapView
                experiences={allExperiences.filter(e => !hiddenIds.includes(e.id))}
                destination={currentDestination}
                onDetailOpen={setSelectedExperience}
              />
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="guide-view">
            <div className="discovery-header" style={{ textAlign: 'center' }}>
              <h1>Reise-Guide: {currentDestination.name}</h1>
              <p>Visum: e-Visa | Kleidung: Respektvoll</p>
            </div>

            <div className="guide-widgets-grid">
              <div>
                <h3 className="guide-section-title">{t('guide.weather')}</h3>
                <WeatherWidget destination={currentDestination} apiKey={weatherApiKey} />
              </div>
              <div>
                <h3 className="guide-section-title">{t('guide.currency')}</h3>
                <CurrencyConverter destinationCurrency={destinationCurrency} homeCurrency={homeCurrency} />
              </div>
            </div>

            <div className="experience-grid" style={{ marginTop: '2rem' }}>
              <div className="card"><h3>Visum</h3><p>Bis 14 Tage oft visafrei, sonst e-Visa noetig.</p></div>
              <div className="card"><h3>Transport</h3><p>4x4 fuer Gebirge und Wueste empfohlen.</p></div>
              <div className="card"><h3>Klima</h3><p>Perfekte Reisezeit Oktober bis Maerz, angenehme Temperaturen.</p></div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-container">
            <div className="settings-section">
              <h2><Settings size={20} /> {t('settings.api_settings')}</h2>
              <div className="settings-card">
                <label>{t('settings.api_key')}</label>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem' }}>
                  Kostenlosen API-Key unter{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)' }}>
                    aistudio.google.com
                  </a>
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Key hier einfuegen..."
                />
                {apiKey && apiStatus === 'success' && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>
                    Verbunden: {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
                  </div>
                )}
                <div className={`api-status-banner ${apiStatus}`}>
                  {apiStatus === 'success' ? 'API Bereit' : apiStatus === 'checking' ? 'Pruefe...' : apiStatus === 'error' ? `API Fehler: ${errorMessage || ''}` : 'API nicht konfiguriert'}
                </div>
              </div>

              <div className="settings-card" style={{ marginTop: '1rem' }}>
                <label>{t('settings.model')}</label>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Schnellst)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Standard)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Intelligentest)</option>
                </select>
              </div>

              <div className="settings-card" style={{ marginTop: '1rem' }}>
                <label>{t('settings.weather_api_key')}</label>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem' }}>
                  Kostenloser Key unter{' '}
                  <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)' }}>openweathermap.org</a>
                </p>
                <input
                  type="password"
                  value={weatherApiKey}
                  onChange={e => setWeatherApiKey(e.target.value)}
                  placeholder="OpenWeatherMap API Key..."
                />
              </div>
            </div>

            <div className="settings-section">
              <h2><Globe size={20} /> {t('settings.language')} &amp; {t('settings.home_currency')}</h2>
              <div className="settings-card">
                <label>{t('settings.language')}</label>
                <div className="lang-toggle-settings">
                  <button className={`lang-btn-lg ${locale === 'de' ? 'active' : ''}`} onClick={() => setLocale('de')}>Deutsch</button>
                  <button className={`lang-btn-lg ${locale === 'en' ? 'active' : ''}`} onClick={() => setLocale('en')}>English</button>
                </div>
              </div>
              <div className="settings-card" style={{ marginTop: '1rem' }}>
                <label>{t('settings.home_currency')}</label>
                <select value={homeCurrency} onChange={e => setHomeCurrency(e.target.value)}>
                  {['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h2><Compass size={20} /> {t('settings.travel_prefs')}</h2>
              <div className="settings-card">
                <div className="form-group">
                  <label>Bevorzugtes Transportmittel</label>
                  <select value={transportType} onChange={e => setTransportType(e.target.value)}>
                    <option value="Mietwagen">Mietwagen (Selbstfahrer)</option>
                    <option value="Taxi">Privater Fahrer / Taxi</option>
                    <option value="Bus">Oeffentliche Busse (Mwasalat)</option>
                    <option value="Inlandsflug">Inlandsfluege</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Regionen oder Strassen meiden</label>
                  <input type="text" value={avoidAreas} onChange={e => setAvoidAreas(e.target.value)} placeholder="z.B. Bergpaesse..." />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Besondere Anforderungen / Wuensche</label>
                  <textarea
                    value={personalRequirements}
                    onChange={e => setPersonalRequirements(e.target.value)}
                    placeholder="z.B. Barrierefreiheit, vegetarisch..."
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h2><Download size={20} /> Daten</h2>
              <div className="settings-card">
                <button className="secondary-btn" onClick={exportNotes} style={{ width: '100%', justifyContent: 'center' }}>
                  <Download size={16} /> {t('settings.export_notes')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div className="modal-overlay" style={{ zIndex: 5000 }}>
            <motion.div className="modal-content" style={{ padding: '2.5rem', maxWidth: '700px', height: 'auto', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Reiseplanung {currentDestination.name}</h2>
                <button className="close-btn-mini" onClick={() => setShowOnboarding(false)}><X size={20} /></button>
              </div>
              <div className="onboarding-grid">
                <div className="form-group">
                  <label>Startdatum</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Gesamtdauer (Tage)</label>
                  <input type="number" value={tripDuration} onChange={e => setTripDuration(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transportmittel</label>
                  <select value={transportType} onChange={e => setTransportType(e.target.value)}>
                    <option value="Mietwagen">Mietwagen (Selbstfahrer)</option>
                    <option value="Taxi">Privater Fahrer / Taxi</option>
                    <option value="Bus">Oeffentliche Busse</option>
                    <option value="Inlandsflug">Inlandsfluege</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Meidungen</label>
                  <input type="text" placeholder="z.B. Offroad-Pisten..." value={avoidAreas} onChange={e => setAvoidAreas(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Besondere Anforderungen / Wuensche</label>
                <textarea placeholder="z.B. Barrierefreiheit, vegetarisch..." value={personalRequirements} onChange={e => setPersonalRequirements(e.target.value)} style={{ minHeight: '80px' }} />
              </div>
              <button className="plan-btn" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} onClick={() => setShowOnboarding(false)}>{t('action.start_adventure')}</button>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>Einstellungen sind jederzeit anpassbar.</p>
            </motion.div>
          </motion.div>
        )}
        {showDatePrompt && (
          <motion.div className="modal-overlay" onClick={() => setShowDatePrompt(false)} style={{ zIndex: 1100 }}>
            <motion.div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <Calendar size={40} color="var(--accent-gold)" />
              <h3>Ort hinzufuegen?</h3>
              <p>Wird an das Ende Ihrer Route angehaengt.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="secondary-btn" onClick={() => setShowDatePrompt(false)}>Nein</button>
                <button className="plan-btn" onClick={handleConfirmAdd}>Ja, hinzufuegen</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {selectedExperience && (
          <ExperienceDetail
            experience={selectedExperience}
            onClose={() => setSelectedExperience(null)}
            apiKey={apiKey}
            selectedModel={selectedModel}
            onToggleSelection={toggleSelection}
            isSelected={selectedIds.includes(selectedExperience.id)}
            rating={ratings[selectedExperience.id] || 0}
            onRate={handleRate}
            duration={customDurations[selectedExperience.id] || 1}
            onDurationChange={(id, val) => setCustomDurations(prev => ({ ...prev, [id]: val }))}
            note={placeNotes[selectedExperience.id] || ""}
            onNoteChange={(id, val) => setPlaceNotes(prev => ({ ...prev, [id]: val }))}
            destination={currentDestination}
          />
        )}
        {showWizard && <ExperienceWizard onClose={() => setShowWizard(false)} onDiscoveryComplete={handleDiscoveryComplete} apiKey={apiKey} selectedModel={selectedModel} destination={currentDestination} />}
        {showAddForm && (
          <motion.div className="modal-overlay" onClick={() => setShowAddForm(false)} style={{ zIndex: 1100 }}>
            <motion.div className="modal-content" style={{ padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{t('action.ai_research')}</h3>
                <button className="close-btn-mini" onClick={() => setShowAddForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={researchAndAddPlace}>
                <input
                  type="text"
                  value={newPlaceName}
                  onChange={e => setNewPlaceName(e.target.value)}
                  placeholder="Ortsname eingeben..."
                  style={{ width: '100%', marginBottom: '1rem' }}
                  autoFocus
                />
                {errorMessage && <p style={{ color: '#f44336', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{errorMessage}</p>}
                <button className="plan-btn" type="submit" disabled={isResearching || !apiKey} style={{ width: '100%', justifyContent: 'center' }}>
                  {isResearching ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {isResearching ? 'Recherchiere...' : 'Ort recherchieren & hinzufuegen'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
