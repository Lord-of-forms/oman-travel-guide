import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import experiencesData from './data/experiences.json';
import { getDestinationById } from './data/destinations.js';
import ExperienceGrid from './components/ExperienceGrid';
import ExperienceDetail from './components/ExperienceDetail';
import ExperienceWizard from './components/ExperienceWizard';
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
  Map
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  // --- Destination ---
  const [currentDestinationId] = useState(() => {
    return localStorage.getItem('travel_guide_destination') || 'oman';
  });
  const currentDestination = getDestinationById(currentDestinationId);
  const destKey = `travel_guide_${currentDestinationId}`;

  // --- States ---
  const [activeTab, setActiveTab] = useState('discovery'); // discovery, planner, guide, settings
  const [viewMode, setViewMode] = useState('grid');
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('gemini_selected_model');
    const validModels = ['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview'];
    return validModels.includes(saved) ? saved : 'gemini-3.1-flash-lite-preview';
  });
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [apiStatus, setApiStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [customPlaces, setCustomPlaces] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_custom_places`), []);
  });
  const [hiddenIds, setHiddenIds] = useState(() => {
    return safeJsonParse(localStorage.getItem(`${destKey}_hidden_ids`), []);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');

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

  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem(`${destKey}_start_date`) || '2026-11-01';
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(`${destKey}_onboarding_done`);
  });
  const [showDatePrompt, setShowDatePrompt] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  // --- Derived Data ---
  const allExperiences = useMemo(() => [...experiencesData, ...customPlaces], [customPlaces]);

  const filteredExperiences = useMemo(() => {
    return allExperiences
      .filter(exp => !hiddenIds.includes(exp.id))
      .filter(exp => selectedCategory === 'Alle' || exp.category === selectedCategory)
      .filter(exp =>
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [allExperiences, hiddenIds, selectedCategory, searchQuery]);

  const selectedPlacesInOrder = useMemo(() => {
    return selectedIds.map(id => allExperiences.find(p => p.id === id)).filter(Boolean);
  }, [selectedIds, allExperiences]);

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

  // --- Persistence ---
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
  useEffect(() => {
    if (!showOnboarding) localStorage.setItem(`${destKey}_onboarding_done`, 'true');
  }, [showOnboarding, destKey]);

  // --- Actions ---
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
        systemInstruction: `Du bist ein spezialisierter Reise-Agent für ${currentDestination.name} (${currentDestination.country}). Erstelle für einen Ort ein PRÄZISES JSON. Pflichtfelder: title, location, category (Wüste, Wasser, Gebirge, Kultur, Küste), country, shortDescription, longDescription, highlights (Array mit 4 Punkten), tags (Array mit 3-4 Tags). Gib NUR das JSON-Objekt ohne Erklärungen aus.`
      });
      const result = await model.generateContent(`Recherchiere Details für diesen Ort in ${currentDestination.name}: ${newPlaceName}`);
      const response = await result.response;
      let text = response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Kein gültiges JSON gefunden.");
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
        systemInstruction: `Sortiere die Orte geografisch sinnvoll für eine ${currentDestination.name}-Rundreise. Gib NUR ein JSON-Array der IDs zurück.`
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

  const getAiDurationSuggestion = async (place) => {
    if (!apiKey) return;
    setIsSuggesting(place.id);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const result = await model.generateContent(`Schlage Aufenthaltsdauer für ${place.title} vor. Format: 'VORSCHLAG: X Tage. GRUND: Y'.`);
      const text = (await result.response).text();
      const dayMatch = text.match(/(\d+(\.\d+)?)/);
      setAiSuggestions(prev => ({ ...prev, [place.id]: { text: text.replace("VORSCHLAG:", "").trim(), suggestedDays: dayMatch ? parseFloat(dayMatch[1]) : 1 } }));
    } catch (e) { console.error(e); } finally { setIsSuggesting(null); }
  };

  const confirmDuration = (id, days) => {
    setCustomDurations(prev => ({ ...prev, [id]: days }));
    setAiSuggestions(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  };

  const generateItinerary = async () => {
    if (!apiKey || selectedIds.length === 0) return;
    setIsGenerating(true); setErrorMessage('');
    try {
      const orderWithNotes = selectedPlacesInOrder.map((p, i) => {
        const note = placeNotes[p.id] ? ` (Notiz: ${placeNotes[p.id]})` : "";
        return `${i + 1}. ${p.title} (${customDurations[p.id] || "variabel"} Tage)${note}`;
      }).join('\n');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
        systemInstruction: `Du bist ein professioneller ${currentDestination.name}-Reise-Experte. Erstelle einen Detailplan für ${tripDuration} Tage ab ${startDate}.
        Reisestil: ${travelStyle}.
        Transportmittel: ${transportType}.
        WICHTIG: Meide folgende Gebiete/Straßen: ${avoidAreas}.
        Besondere Anforderungen/Wünsche: ${personalRequirements}.
        Integriere diese spezifischen Erkenntnisse/Notizen zu den Orten:
        ${orderWithNotes}
        Berücksichtige Transport-spezifische Logistik (z.B. Fahrzeiten, 4x4 Erfordernisse).
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

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-brand">
          <h1>Travel Guide</h1>
          <span className="destination-badge">{currentDestination.emoji} {currentDestination.name}</span>
        </div>

        <nav className="tab-navigation">
          <button className={`nav-item ${activeTab === 'discovery' ? 'active' : ''}`} onClick={() => { setActiveTab('discovery'); window.scrollTo(0, 0); }}><Compass size={18} /> Entdecken</button>
          <button className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => { setActiveTab('planner'); window.scrollTo(0, 0); }}><Navigation size={18} /> Reiseplaner {selectedIds.length > 0 && `(${selectedIds.length})`}</button>
          <button className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => { setActiveTab('guide'); window.scrollTo(0, 0); }}><ShieldAlert size={18} /> Reise-Info</button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); window.scrollTo(0, 0); }}><Settings size={18} /> Einstellungen</button>
        </nav>

        <div className="header-status">
          <div className={`api-dot ${apiStatus}`} title={`API Status: ${apiStatus}`} />
        </div>
      </header>

      <main className="content-container" style={{ paddingTop: '2rem' }}>
        {activeTab === 'discovery' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="filter-bar">
              <div className="search-wrapper">
                <Search className="search-icon-fixed" size={18} />
                <input type="text" placeholder="Suche..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="filter-chips">
                {['Alle', ...currentDestination.categories].map(cat => (
                  <button key={cat} className={`chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                ))}
                <button className="secondary-btn" onClick={() => setShowAddForm(true)}><Plus size={16} /> KI-Recherche</button>
                <button className="discovery-btn" onClick={() => setShowWizard(true)}><Sparkles size={16} /> KI-Wegweiser</button>
              </div>
            </div>
            {filteredExperiences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                <h3>Keine Orte gefunden</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {searchQuery || selectedCategory !== 'Alle'
                    ? 'Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.'
                    : 'Noch keine Orte vorhanden. Nutzen Sie den KI-Wegweiser, um Geheimtipps zu entdecken.'}
                </p>
                {(searchQuery || selectedCategory !== 'Alle') && (
                  <button className="secondary-btn" style={{ marginTop: '1rem' }} onClick={() => { setSearchQuery(''); setSelectedCategory('Alle'); }}>
                    Filter zurücksetzen
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
              />
            )}
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="planner-view">
            <div className="itinerary-summary-box">
              <h2>Reise-Timeline</h2>
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
                  <Calendar size={18} /> <span>Start: {formatDate(new Date(startDate))}</span>
                </div>
                <button className="plan-btn" onClick={generateItinerary} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} KI-Plan generieren
                </button>
                <button className="secondary-btn" onClick={optimizeRoute} disabled={selectedIds.length < 2}><MapIcon size={18} /> Optimieren</button>
                {selectedIds.length > 0 && <button className="secondary-btn" onClick={openInGoogleMaps}><Map size={18} /> In Maps öffnen</button>}
              </div>
            </div>
            {itinerary && <div className="itinerary-result-area"><div className="itinerary-summary-box"><ReactMarkdown>{itinerary}</ReactMarkdown></div></div>}
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="guide-view">
            <div className="discovery-header" style={{ textAlign: 'center' }}>
              <h1>Reise-Guide: November 2026</h1>
              <p>Wetter: 25-30°C | Visum: e-Visa | Kleidung: Respektvoll</p>
            </div>
            <div className="experience-grid">
              <div className="card"><h3>Wetter</h3><p>Perfekte Reisezeit, angenehme Temperaturen.</p></div>
              <div className="card"><h3>Visum</h3><p>Bis 14 Tage oft visafrei, sonst e-Visa nötig.</p></div>
              <div className="card"><h3>Transport</h3><p>4x4 für Gebirge und Wüste empfohlen.</p></div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-container">
            <div className="settings-section">
              <h2><Settings size={20} /> API-Einstellungen</h2>
              <div className="settings-card">
                <label>Gemini API Key</label>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.75rem' }}>
                  Holen Sie sich einen kostenlosen API-Key unter{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)' }}>
                    aistudio.google.com
                  </a>
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Key hier einfügen..."
                />
                {apiKey && apiStatus === 'success' && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>
                    Verbunden: {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
                  </div>
                )}
                <div className={`api-status-banner ${apiStatus}`}>
                  {apiStatus === 'success' ? '✅ API Bereit' : apiStatus === 'checking' ? '⏳ Prüfe...' : apiStatus === 'error' ? `❌ ${errorMessage || 'API Fehler'}` : 'API nicht konfiguriert'}
                </div>
              </div>

              <div className="settings-card" style={{ marginTop: '1rem' }}>
                <label>Modell-Auswahl</label>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                  <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Neueste)</option>
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Schnell)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h2><Compass size={20} /> Reise-Präferenzen</h2>
              <div className="settings-card">
                <div className="form-group">
                  <label>Bevorzugtes Transportmittel</label>
                  <select value={transportType} onChange={e => setTransportType(e.target.value)}>
                    <option value="Mietwagen">Mietwagen (Selbstfahrer)</option>
                    <option value="Taxi">Privater Fahrer / Taxi</option>
                    <option value="Bus">Öffentliche Busse (Mwasalat)</option>
                    <option value="Inlandsflug">Inlandsflüge</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Regionen oder Straßen meiden</label>
                  <input type="text" value={avoidAreas} onChange={e => setAvoidAreas(e.target.value)} placeholder="z.B. Bergpässe..." />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Besondere Anforderungen / Wünsche</label>
                  <textarea
                    value={personalRequirements}
                    onChange={e => setPersonalRequirements(e.target.value)}
                    placeholder="z.B. Barrierefreiheit, vegetarisch..."
                    style={{ minHeight: '80px' }}
                  />
                </div>
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
                    <option value="Bus">Öffentliche Busse</option>
                    <option value="Inlandsflug">Inlandsflüge</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Meidungen</label>
                  <input
                    type="text"
                    placeholder="z.B. Offroad-Pisten..."
                    value={avoidAreas}
                    onChange={e => setAvoidAreas(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Besondere Anforderungen / Wünsche</label>
                <textarea
                  placeholder="z.B. Barrierefreiheit, vegetarisch..."
                  value={personalRequirements}
                  onChange={e => setPersonalRequirements(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <button className="plan-btn" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }} onClick={() => setShowOnboarding(false)}>Abenteuer starten</button>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', opacity: 0.5, marginTop: '1rem' }}>Sie können diese Einstellungen jederzeit im Reiter "Einstellungen" anpassen.</p>
            </motion.div>
          </motion.div>
        )}
        {showDatePrompt && (
          <motion.div className="modal-overlay" onClick={() => setShowDatePrompt(false)} style={{ zIndex: 1100 }}>
            <motion.div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
              <Calendar size={40} color="var(--accent-gold)" />
              <h3>Ort hinzufügen?</h3>
              <p>Wird an das Ende Ihrer Route angehängt.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="secondary-btn" onClick={() => setShowDatePrompt(false)}>Nein</button>
                <button className="plan-btn" onClick={handleConfirmAdd}>Ja, hinzufügen</button>
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
      </AnimatePresence>
    </div>
  );
}

export default App;
