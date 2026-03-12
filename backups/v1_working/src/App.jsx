import React, { useState, useEffect, useCallback } from 'react';
import experiencesData from './data/experiences.json';
import ExperienceGrid from './components/ExperienceGrid';
import ExperienceDetail from './components/ExperienceDetail';
import { Key, CheckCircle, XCircle, RefreshCw, Settings2, ExternalLink, AlertTriangle, ShieldAlert, WifiOff } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [experiences, setExperiences] = useState(experiencesData);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [apiStatus, setApiStatus] = useState('idle'); // idle, checking, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [rawError, setRawError] = useState('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const validateKey = useCallback(async (key) => {
    if (!key || key.length < 10) {
      setApiStatus('idle');
      return;
    }
    setApiStatus('checking');
    setErrorMessage('');
    setRawError('');

    try {
      // 1. Raw Connectivity Check (Basic Fetch)
      // This checks if the domain is reachable at all (ignoring CORS for a HEAD request if possible, 
      // but standard fetch to root or a known endpoint is better).
      // However, googleapis.com/v1beta/models is the real test.

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

      const result = await model.generateContent("Sag 'OK'");
      const response = await result.response;
      const text = response.text();

      setApiStatus('success');
      localStorage.setItem('gemini_api_key', key);
    } catch (error) {
      console.error("API-Validierung fehlgeschlagen:", error);
      setApiStatus('error');

      const msg = error.message || String(error);
      setRawError(msg);

      if (msg.includes("API_KEY_INVALID")) {
        setErrorMessage('Key ungültig');
      } else if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setErrorMessage('Netzwerk-Blockade');
        setShowTroubleshooting(true);
      } else if (msg.includes("quota")) {
        setErrorMessage('Quote erschöpft');
      } else {
        setErrorMessage('Verbindungsfehler');
      }
    }
  }, []);

  useEffect(() => {
    if (apiKey && apiKey.length > 20) {
      const timer = setTimeout(() => validateKey(apiKey), 1000);
      return () => clearTimeout(timer);
    }
  }, [apiKey, validateKey]);

  return (
    <div className="app-container">
      <div className={`api-config ${apiStatus}`}>
        <div className="api-info-wrapper">
          {apiStatus === 'success' && <CheckCircle size={16} color="#4caf50" />}
          {apiStatus === 'error' && <ShieldAlert size={16} color="#f44336" />}
          {apiStatus === 'checking' && <RefreshCw size={16} color="#d4af37" className="animate-spin" />}
          {apiStatus === 'idle' && <Settings2 size={16} color="#d4af37" />}

          <input
            type="password"
            placeholder="Gemini API Key eingeben"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className={apiStatus}
          />

          {apiStatus === 'error' && (
            <button className="test-btn" onClick={() => validateKey(apiKey)}>
              Prüfen
            </button>
          )}
        </div>

        <div className="api-status-container">
          {apiStatus !== 'idle' && (
            <div className={`api-status-tag ${apiStatus}`}>
              {apiStatus === 'success' ? 'Verbunden' : (errorMessage || 'Prüfen...')}
            </div>
          )}

          <button
            className="trouble-link"
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          >
            Hilfe <AlertTriangle size={10} />
          </button>
        </div>

        <AnimatePresence>
          {showTroubleshooting && (
            <motion.div
              className="troubleshooting-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h4>Problembehebung:</h4>
              <ul>
                <li><strong>VPN/Proxy:</strong> Deaktiviere VPN oder Proxy.</li>
                <li><strong>Ad-Blocker:</strong> Deaktiviere Ad-Blocker für diese Seite.</li>
                <li><strong>Region:</strong> In manchen Ländern (z.B. EU/UK) ist der Zugriff über API Studio manchmal eingeschränkt.</li>
                <li><strong>CORS:</strong> Prüfe, ob dein Browser Anfragen an <code>googleapis.com</code> blockiert.</li>
              </ul>
              <div className="raw-err-box">
                <code>Fehler: {rawError || 'Keine Details'}</code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          Oman Unentdeckt
        </motion.h1>
        <p>Erkunden Sie 20 außergewöhnliche Erlebnisse abseits der Touristenpfade</p>
      </header>

      <ExperienceGrid
        experiences={experiences}
        onSelect={setSelectedExperience}
      />

      <AnimatePresence>
        {selectedExperience && (
          <ExperienceDetail
            experience={selectedExperience}
            onClose={() => setSelectedExperience(null)}
            apiKey={apiKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
