'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function InstructorsHero() {
  const { t } = useLanguage();

  return (
    <section className="py-16 text-center bg-transparent">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-3">
          {t('instructors.hero_badge')}
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-md">
          {t('instructors.hero_title')}
        </h1>
        <p className="text-slate-100 text-base max-w-xl mx-auto leading-relaxed font-medium">
          {t('instructors.hero_subtitle')}
        </p>
      </div>
    </section>
  );
}
