import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(base) {
  return `travel_guide_rates_${base}`;
}

function loadRatesCache(base) {
  try {
    const raw = localStorage.getItem(getCacheKey(base));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveRatesCache(base, data) {
  try {
    localStorage.setItem(getCacheKey(base), JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch {}
}

const CURRENCY_SYMBOLS = {
  EUR: '€', USD: '$', GBP: '£', JPY: '¥', OMR: 'ر.ع.', AED: 'د.إ',
  CHF: 'CHF', CAD: 'C$', AUD: 'A$', CNY: '¥', INR: '₹', THB: '฿',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft',
  SAR: '﷼', KWD: 'KD', BHD: 'BD', QAR: '﷼', JOD: 'JD',
};

const CurrencyConverter = ({ destinationCurrency = 'OMR', homeCurrency = 'EUR' }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState('100');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [swapped, setSwapped] = useState(false);

  const fromCurrency = swapped ? destinationCurrency : homeCurrency;
  const toCurrency = swapped ? homeCurrency : destinationCurrency;

  const fetchRates = async (force = false) => {
    if (!force) {
      const cached = loadRatesCache(fromCurrency);
      if (cached?.rates) {
        setRates(cached.rates);
        setLastUpdated(new Date(cached.timestamp));
        setFromCache(true);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.result !== 'success') throw new Error(json['error-type'] || 'API error');
      saveRatesCache(fromCurrency, json);
      setRates(json.rates);
      setLastUpdated(new Date());
      setFromCache(false);
    } catch (e) {
      const cached = loadRatesCache(fromCurrency);
      if (cached?.rates) {
        setRates(cached.rates);
        setLastUpdated(new Date(cached.timestamp));
        setFromCache(true);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, [fromCurrency]);

  const convertedAmount = rates && amount
    ? (parseFloat(amount) * (rates[toCurrency] || 1)).toFixed(3)
    : null;

  const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || fromCurrency;
  const toSymbol = CURRENCY_SYMBOLS[toCurrency] || toCurrency;

  return (
    <motion.div className="currency-converter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="currency-header">
        <h3>
          <ArrowRightLeft size={16} style={{ marginRight: '0.4rem' }} />
          {fromCurrency} → {toCurrency}
        </h3>
        {lastUpdated && (
          <span className="currency-updated">
            {fromCache ? '📦' : '🔄'} {lastUpdated.toLocaleDateString('de-DE')}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5, padding: '0.5rem 0' }}>
          <RefreshCw size={14} className="animate-spin" />
          <span style={{ fontSize: '0.85rem' }}>Lade Kurse...</span>
        </div>
      )}

      {error && !rates && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.6, padding: '0.5rem 0' }}>
          <WifiOff size={14} />
          <span style={{ fontSize: '0.8rem' }}>{error}</span>
        </div>
      )}

      {rates && (
        <>
          <div className="currency-inputs">
            <div className="currency-field">
              <label>{fromCurrency}</label>
              <div className="currency-input-wrap">
                <span className="currency-symbol">{fromSymbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                  step="any"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              className="currency-swap-btn"
              onClick={() => setSwapped(s => !s)}
              title="Tauschen"
            >
              <ArrowRightLeft size={16} />
            </button>

            <div className="currency-field">
              <label>{toCurrency}</label>
              <div className="currency-input-wrap result">
                <span className="currency-symbol">{toSymbol}</span>
                <span className="currency-result">
                  {convertedAmount !== null ? convertedAmount : '—'}
                </span>
              </div>
            </div>
          </div>

          {rates[toCurrency] && (
            <div className="currency-rate">
              1 {fromCurrency} = {rates[toCurrency].toFixed(4)} {toCurrency}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default CurrencyConverter;
