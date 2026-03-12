import React, { useState, useEffect } from 'react';
import { Cloud, Wind, Droplets, Thermometer, RefreshCw, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext.jsx';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(destId) {
  return `travel_guide_weather_${destId}`;
}

function loadCache(destId) {
  try {
    const raw = localStorage.getItem(getCacheKey(destId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveCache(destId, data) {
  try {
    localStorage.setItem(getCacheKey(destId), JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch (_e) { /* ignore */ }
}

const WEATHER_ICONS = {
  '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️',
  '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️',
};

function getWeatherEmoji(icon) {
  const code = icon?.substring(0, 2);
  return WEATHER_ICONS[code] || '🌡️';
}

function groupForecastByDay(list) {
  const days = {};
  list.forEach(item => {
    const date = item.dt_txt.substring(0, 10);
    if (!days[date]) days[date] = item;
    else {
      // prefer midday entry
      const h = parseInt(item.dt_txt.substring(11, 13));
      const existing = parseInt(days[date].dt_txt.substring(11, 13));
      if (Math.abs(h - 12) < Math.abs(existing - 12)) days[date] = item;
    }
  });
  return Object.values(days).slice(0, 5);
}

const WeatherWidget = ({ destination, apiKey }) => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const destId = destination?.id || destination?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
  const cityName = destination?.name || 'Muscat';

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const fetchWeather = async (force = false) => {
    if (!apiKey) return;

    if (!force) {
      const cached = loadCache(destId);
      if (cached) {
        setData(cached);
        setLastUpdated(new Date(cached.timestamp));
        setFromCache(true);
        return;
      }
    }

    if (!isOnline) {
      const cached = loadCache(destId);
      if (cached) { setData(cached); setLastUpdated(new Date(cached.timestamp)); setFromCache(true); }
      else setError('Offline – keine gecachten Wetterdaten verfügbar.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)},${encodeURIComponent(destination?.country || '')}&appid=${apiKey}&units=metric&lang=de&cnt=40`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      saveCache(destId, json);
      setData(json);
      setLastUpdated(new Date());
      setFromCache(false);
    } catch (e) {
      const cached = loadCache(destId);
      if (cached) {
        setData(cached);
        setLastUpdated(new Date(cached.timestamp));
        setFromCache(true);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchWeather(); }, [apiKey, destId]);

  if (!apiKey) {
    return (
      <motion.div className="weather-widget weather-no-key" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Cloud size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{t('weather.no_key')}</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div className="weather-widget weather-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <RefreshCw size={24} className="animate-spin" style={{ opacity: 0.5 }} />
        <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>{t('weather.loading')}</span>
      </motion.div>
    );
  }

  if (error && !data) {
    return (
      <motion.div className="weather-widget weather-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <WifiOff size={24} style={{ opacity: 0.5 }} />
        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>
      </motion.div>
    );
  }

  if (!data || !data.list) return null;

  const current = data.list[0];
  const forecast = groupForecastByDay(data.list);
  const cityDisplay = data.city?.name || cityName;

  const formatDay = (dtTxt) => {
    const d = new Date(dtTxt);
    return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  return (
    <motion.div className="weather-widget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="weather-header">
        <div>
          <h3 className="weather-city">{cityDisplay}</h3>
          {lastUpdated && (
            <span className="weather-updated">
              {fromCache ? '📦 ' : '🔄 '}
              {lastUpdated.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button className="restore-btn" onClick={() => fetchWeather(true)} title={t('weather.refresh')}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Current conditions */}
      <div className="weather-current">
        <div className="weather-temp">
          <span className="weather-emoji">{getWeatherEmoji(current.weather?.[0]?.icon)}</span>
          <span className="weather-degree">{Math.round(current.main?.temp)}°C</span>
        </div>
        <div className="weather-details">
          <span className="weather-desc">{current.weather?.[0]?.description}</span>
          <div className="weather-meta">
            <span><Droplets size={13} /> {current.main?.humidity}%</span>
            <span><Wind size={13} /> {Math.round(current.wind?.speed * 3.6)} km/h</span>
          </div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="weather-forecast">
        {forecast.map((day, i) => (
          <div key={i} className="forecast-day">
            <span className="forecast-date">{i === 0 ? 'Heute' : formatDay(day.dt_txt)}</span>
            <span className="forecast-icon">{getWeatherEmoji(day.weather?.[0]?.icon)}</span>
            <span className="forecast-temp">{Math.round(day.main?.temp)}°</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
