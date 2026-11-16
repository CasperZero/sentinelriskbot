import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sentinel_language');
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      // Ignore storage access errors in restricted iframes
    }
    if (typeof navigator !== 'undefined') {
      const navLang = (navigator.language || '').toLowerCase();
      if (navLang.startsWith('en')) return 'en';
      if (navLang.startsWith('es')) return 'es';
    }
    return 'es';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    const cleanLang: Language = lang === 'en' ? 'en' : 'es';
    setLanguageState(cleanLang);
    try {
      localStorage.setItem('sentinel_language', cleanLang);
    } catch {
      // Ignore storage write errors
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
