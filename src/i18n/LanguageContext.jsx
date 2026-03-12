import React, { createContext, useContext, useState, useCallback } from 'react';
import de from './translations/de.json';
import en from './translations/en.json';

const translations = { de, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('travel_guide_language') || 'de';
  });

  const setLocale = useCallback((lang) => {
    setLocaleState(lang);
    localStorage.setItem('travel_guide_language', lang);
  }, []);

  const t = useCallback((key) => {
    const dict = translations[locale] || translations.de;
    return dict[key] ?? key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
