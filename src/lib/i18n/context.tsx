'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, dictionaries } from './dictionaries';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionaries.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('dailypulse_lang') as Language;
    if (saved && (saved === 'en' || saved === 'om' || saved === 'am')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dailypulse_lang', lang);
  };

  const value = {
    language,
    setLanguage,
    t: dictionaries[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
