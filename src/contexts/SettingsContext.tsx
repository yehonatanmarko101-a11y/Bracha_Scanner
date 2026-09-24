import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../locales/translations';

type Language = 'en' | 'he';
type Tradition = 'ashkenazi' | 'sephardi' | 'yemenite';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  tradition: Tradition;
  setTradition: (trad: Tradition) => void;
  hasAcceptedDisclaimer: boolean;
  setHasAcceptedDisclaimer: (val: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('bracha_lang') as Language) || 'en';
  });
  
  const [tradition, setTraditionState] = useState<Tradition>(() => {
    return (localStorage.getItem('bracha_tradition') as Tradition) || 'ashkenazi';
  });

  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimerState] = useState<boolean>(() => {
    return localStorage.getItem('bracha_disclaimer_accepted') === 'true';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('bracha_theme') as Theme;
    if (saved === 'dark' || saved === 'light') return saved;
    // Auto-detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('bracha_lang', lang);
    setLanguageState(lang);
    document.documentElement.dir = 'ltr';
  };

  const setTradition = (trad: Tradition) => {
    localStorage.setItem('bracha_tradition', trad);
    setTraditionState(trad);
  };

  const setHasAcceptedDisclaimer = (val: boolean) => {
    localStorage.setItem('bracha_disclaimer_accepted', String(val));
    setHasAcceptedDisclaimerState(val);
  };

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('bracha_theme', newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    document.documentElement.dir = 'ltr';
  }, [language]);

  // Handle setting/removing the .dark class on root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{
      language, setLanguage,
      tradition, setTradition,
      hasAcceptedDisclaimer, setHasAcceptedDisclaimer,
      theme, setTheme,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
