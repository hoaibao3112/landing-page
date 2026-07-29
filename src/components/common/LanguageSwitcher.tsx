'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage, Language } from '@/context/LanguageContext';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const options: { id: Language; label: string; flag: string; fullName: string }[] = [
    { id: 'vi', label: 'VI', flag: '🇻🇳', fullName: 'Tiếng Việt' },
    { id: 'en', label: 'EN', flag: '🇬🇧', fullName: 'English' },
  ];

  return (
    <div
      className={`relative inline-flex items-center bg-slate-950/80 border border-white/15 p-1 rounded-full backdrop-blur-xl shadow-inner select-none ${className}`}
    >
      {options.map((option) => {
        const isActive = language === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLanguage(option.id)}
            className={`relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-black tracking-wider transition-colors duration-200 cursor-pointer rounded-full ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={option.fullName}
          >
            {isActive && (
              <motion.div
                layoutId="activeLanguagePill"
                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full shadow-md shadow-sky-500/35 border border-sky-400/40"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-xs leading-none filter drop-shadow">{option.flag}</span>
            <span className="relative z-10 font-extrabold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
