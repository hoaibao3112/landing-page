'use client';

import Image from 'next/image';
import { FadeIn, StaggerChildren } from '@/components/portal/ui/AnimationWrapper';
import { useLanguage } from '@/context/LanguageContext';

const toolKeys = [
  { key: 'claude', name: 'Claude AI', src: '/logo_claudeAi.jpg' },
  { key: 'gemini', name: 'Gemini AI', src: '/gemina.jpg' },
  { key: 'notebooklm', name: 'NotebookLM', src: '/notbookLm.jpg' },
  { key: 'dreamina', name: 'Dreamina AI', src: '/dreamia_ai.jpg' },
  { key: 'hailuo', name: 'Hailuo AI', src: '/hailuo_ai.jpg' },
] as const;

export function ToolsSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-transparent py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn direction="up" className="text-center mb-12">
          <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-2">
            {t('instructors.tools_tag')}
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-md">
            {t('instructors.tools_title')}
          </h2>
          <p className="text-slate-100 mt-3 max-w-xl mx-auto text-sm leading-relaxed font-medium">
            {t('instructors.tools_description')}
          </p>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6" stagger={100}>
          {toolKeys.map((tool) => (
            <div
              key={tool.name}
              className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:border-amber-400/80 group"
            >
              <div className="relative size-20 md:size-24 mb-4 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-700/80 shadow-md group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={tool.src}
                  alt={tool.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 80px, 96px"
                  priority
                />
              </div>

              <h3 className="font-bold text-white text-sm md:text-base mb-1 group-hover:text-amber-300 transition-colors">
                {tool.name}
              </h3>

              <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold rounded-full border border-amber-400/40 mb-3">
                {t(`instructors.tools_items.${tool.key}.badge`)}
              </span>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[48px] font-medium">
                {t(`instructors.tools_items.${tool.key}.description`)}
              </p>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
