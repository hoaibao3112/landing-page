'use client';

import { Suspense } from 'react';
import { Breadcrumb } from '@/components/portal/common/Breadcrumb';
import { CourseCard } from '@/components/portal/sections/courses/CourseCard';
import { CourseFilters } from '@/components/portal/sections/courses/CourseFilters';
import { Pagination } from '@/components/portal/ui/Pagination';
import type { Course, PaginatedResponse } from '@aizen/types';
import { useLanguage } from '@/context/LanguageContext';

interface CoursesClientProps {
  items: Course[];
  pagination: PaginatedResponse<Course>['pagination'];
  currentPage: number;
}

export function CoursesClient({ items, pagination, currentPage }: CoursesClientProps) {
  const { t } = useLanguage();

  const nearestUpcomingDate = items
    .filter((c) => c.status === 'upcoming' && c.start_date)
    .map((c) => c.start_date as string)
    .sort()[0] ?? null;

  // Sắp diễn ra: gần nhất lên đầu (start_date ascending)
  const upcomingCourses = items
    .filter((c) => c.status === 'upcoming')
    .sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return a.start_date.localeCompare(b.start_date);
    });

  // Đã diễn ra: vừa kết thúc gần nhất lên đầu (start_date descending)
  const pastCourses = items
    .filter((c) => c.status !== 'upcoming')
    .sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return b.start_date.localeCompare(a.start_date);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[{ label: t('nav.home'), href: '/portal' }, { label: t('nav.courses') }]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{t('courses.title')}</h1>
        <p className="text-amber-400 font-extrabold mt-1 text-sm">{pagination.total} {t('courses.available_count')}</p>
      </div>

      <Suspense fallback={<div className="flex flex-col sm:flex-row gap-3 animate-pulse">
        <div className="flex-1 h-10 bg-slate-800/50 rounded-lg" />
        <div className="w-44 h-10 bg-slate-800/50 rounded-lg" />
        <div className="w-36 h-10 bg-slate-800/50 rounded-lg" />
      </div>}>
        <CourseFilters />
      </Suspense>

      {items.length === 0 ? (
        <div className="mt-16 text-center bg-slate-900/80 p-12 rounded-3xl border border-slate-700/60 backdrop-blur-md">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-slate-200 font-medium">{t('courses.empty_title')}</p>
        </div>
      ) : (
        <>
          {/* Section 1: Các khóa học sắp diễn ra */}
          {upcomingCourses.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-amber-400 text-2xl">🔥</span>
                <h2 className="text-xl md:text-2xl font-black text-white">{t('courses.upcoming_title')}</h2>
                <span className="ml-auto bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {upcomingCourses.length} {t('courses.courses_count')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isNearestUpcoming={nearestUpcomingDate !== null && course.start_date === nearestUpcomingDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Các khóa học đã diễn ra */}
          {pastCourses.length > 0 && (
            <div className={upcomingCourses.length > 0 ? 'mt-14' : 'mt-10'}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-emerald-400 text-2xl">✅</span>
                <h2 className="text-xl md:text-2xl font-black text-white">{t('courses.past_title')}</h2>
                <span className="ml-auto bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {pastCourses.length} {t('courses.courses_count')}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isNearestUpcoming={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-12">
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}
