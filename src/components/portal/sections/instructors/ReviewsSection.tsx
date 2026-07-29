'use client';

import { Button } from '@/components/portal/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import type { Review } from '@aizen/types';

interface ReviewsSectionProps {
  reviews?: Review[];
}

const DEMO_REVIEW_AUTHORS = ['Nguyễn Văn Minh', 'Trần Thị Hương', 'Lê Quốc Bảo'];
const DEMO_REVIEW_RATINGS = [5, 5, 5];
const DEMO_REVIEW_IDS = ['1', '2', '3'];

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const { t } = useLanguage();

  const displayReviews = [
    {
      id: DEMO_REVIEW_IDS[0],
      author: DEMO_REVIEW_AUTHORS[0],
      role: t('instructors.demo_reviews.review1.role'),
      rating: DEMO_REVIEW_RATINGS[0],
      content: t('instructors.demo_reviews.review1.content'),
    },
    {
      id: DEMO_REVIEW_IDS[1],
      author: DEMO_REVIEW_AUTHORS[1],
      role: t('instructors.demo_reviews.review2.role'),
      rating: DEMO_REVIEW_RATINGS[1],
      content: t('instructors.demo_reviews.review2.content'),
    },
    {
      id: DEMO_REVIEW_IDS[2],
      author: DEMO_REVIEW_AUTHORS[2],
      role: t('instructors.demo_reviews.review3.role'),
      rating: DEMO_REVIEW_RATINGS[2],
      content: t('instructors.demo_reviews.review3.content'),
    },
  ];

  return (
    <section className="bg-transparent py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-amber-400 text-xs font-extrabold uppercase tracking-widest mb-2">
            {t('instructors.reviews_tag')}
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-white drop-shadow-md">
            {t('instructors.reviews_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {displayReviews.map((review) => (
            <div key={review.id} className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl hover:border-amber-400/80 transition-all">
              <div className="flex mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-slate-200 text-sm leading-relaxed mb-5 font-medium">&quot;{review.content}&quot;</p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-extrabold text-sm flex-shrink-0">
                  {review.author[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{review.author}</p>
                  <p className="text-xs text-amber-400 font-semibold">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" className="border-white/40 text-white bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 hover:border-amber-400 hover:text-amber-300 font-bold px-6 py-2.5 rounded-full cursor-pointer">
            {t('instructors.reviews_view_more')}
          </Button>
        </div>
      </div>
    </section>
  );
}
