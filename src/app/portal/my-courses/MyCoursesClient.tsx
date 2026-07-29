'use client';

import { UpcomingCourseCard } from '@/components/portal/sections/my-courses/UpcomingCourseCard';
import { CompletedCourseCard } from '@/components/portal/sections/my-courses/CompletedCourseCard';
import type { Enrollment } from '@aizen/types';
import { useLanguage } from '@/context/LanguageContext';

interface MyCoursesClientProps {
  upcoming: Enrollment[];
  completed: Enrollment[];
}

export function MyCoursesClient({ upcoming, completed }: MyCoursesClientProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-md">
        {t('my_courses.title')}
      </h1>
      <p className="text-amber-400 font-extrabold mb-10 text-sm">{t('my_courses.subtitle')}</p>

      {/* Upcoming */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2.5 h-5 bg-amber-400 rounded-full inline-block" />
          {t('my_courses.upcoming_section')}
        </h2>
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-4">
            {upcoming.map((e) => (
              <UpcomingCourseCard key={e.id} enrollment={e} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md rounded-2xl text-slate-300">
            <p className="text-3xl mb-3">📅</p>
            <p className="font-medium">{t('my_courses.no_upcoming')}</p>
          </div>
        )}
      </section>

      {/* Completed */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2.5 h-5 bg-emerald-400 rounded-full inline-block" />
          {t('my_courses.completed_section')}
        </h2>
        {completed.length > 0 ? (
          <div className="flex flex-col gap-4">
            {completed.map((e) => (
              <CompletedCourseCard key={e.id} enrollment={e} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md rounded-2xl text-slate-300">
            <p className="text-3xl mb-3">🏆</p>
            <p className="font-medium">{t('my_courses.no_completed')}</p>
          </div>
        )}
      </section>
    </div>
  );
}
