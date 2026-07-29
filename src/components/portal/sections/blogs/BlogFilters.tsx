'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/portal/utils/cn';
import { useLanguage } from '@/context/LanguageContext';

export function BlogFilters() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const categories = [
    { label: t('blog.all'), value: '' },
    { label: 'Blog', value: 'blog' },
    { label: t('blog.news'), value: 'news' },
  ];

  const currentCategory = params.get('category') ?? '';

  function updateCategory(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set('category', value);
    else next.delete('category');
    next.delete('page');
    startTransition(() => router.push(`/blogs?${next.toString()}`));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => updateCategory(cat.value)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
            currentCategory === cat.value
              ? 'bg-sky-500 text-white border-sky-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-sky-400 hover:text-sky-500',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
