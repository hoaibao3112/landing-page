'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import viDict from '@/locales/vi.json';
import enDict from '@/locales/en.json';

export type Language = 'vi' | 'en';
export type InterpolationParams = Record<string, string | number>;

type Dictionaries = typeof viDict;

const dictionaries: Record<Language, Dictionaries> = {
  vi: viDict,
  en: enDict as Dictionaries,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, params?: InterpolationParams) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function interpolate(template: string, params?: InterpolationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

export function LanguageProvider({
  children,
  initialLanguage = 'vi',
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    try {
      // Sync cookie with localStorage for subsequent page loads without breaking initial hydration
      const savedLang = localStorage.getItem('aizen_language') as Language;
      if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
        document.cookie = `aizen_language=${savedLang}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (_) {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('aizen_language', lang);
      document.cookie = `aizen_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (_) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const t = (keyPath: string, params?: InterpolationParams): string => {
    const dict = dictionaries[language] || dictionaries.vi;
    const keys = keyPath.split('.');
    let current: any = dict;
    let found = true;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        found = false;
        break;
      }
    }

    let result = '';
    if (found && typeof current === 'string') {
      result = current;
    } else {
      // Fallback sang từ điển tiếng Việt nếu không tìm thấy key ở tiếng Anh
      let fallback: any = dictionaries.vi;
      let fallbackFound = true;
      for (const k of keys) {
        if (fallback && typeof fallback === 'object' && k in fallback) {
          fallback = fallback[k];
        } else {
          fallbackFound = false;
          break;
        }
      }
      if (fallbackFound && typeof fallback === 'string') {
        result = fallback;
      } else {
        result = keyPath;
      }
    }

    return interpolate(result, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'vi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (keyPath: string, params?: InterpolationParams) => {
        const keys = keyPath.split('.');
        let current: any = viDict;
        let found = true;
        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            found = false;
            break;
          }
        }
        const result = found && typeof current === 'string' ? current : keyPath;
        return interpolate(result, params);
      },
    };
  }
  return context;
}
