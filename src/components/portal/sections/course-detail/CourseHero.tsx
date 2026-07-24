'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CourseWithDetails } from '@aizen/types';
import { computeCoursePlanPrices } from '@/lib/portal/utils/pricing';

interface CourseHeroProps {
  course: CourseWithDetails;
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + 'đ';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatWeekdayDate(dateStr: string | null, endDateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const weekday = weekdays[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (endDateStr) {
    const dEnd = new Date(endDateStr);
    if (!isNaN(dEnd.getTime())) {
      const weekdayEnd = weekdays[dEnd.getDay()];
      const dayEnd = String(dEnd.getDate()).padStart(2, '0');
      const monthEnd = String(dEnd.getMonth() + 1).padStart(2, '0');
      const yearEnd = dEnd.getFullYear();
      return `${weekday} & ${weekdayEnd}, ${day}/${month} - ${dayEnd}/${monthEnd}/${yearEnd}`;
    }
  }

  return `${weekday}, ${day}/${month}/${year}`;
}

function renderLocationText(loc: string) {
  if (loc.includes(' (')) {
    const parts = loc.split(' (');
    return (
      <>
        <span className="block">{parts[0]}</span>
        <span className="block text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">({parts.slice(1).join(' (')}</span>
      </>
    );
  }
  return loc;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { y: 28, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function CourseHero({ course }: CourseHeroProps) {
  const date = formatDate(course.start_date);
  const planPrices = computeCoursePlanPrices({
    price: course.price || 0,
    priceGroup: course.price_group || 0,
    plansConfig: course.plans_config ?? undefined,
  });

  const minGroupPrice = Math.min(
    planPrices.group2PricePerPerson > 0 ? planPrices.group2PricePerPerson : Infinity,
    planPrices.group4PricePerPerson > 0 ? planPrices.group4PricePerPerson : Infinity
  );
  const displayGroupPrice = Number.isFinite(minGroupPrice) && minGroupPrice > 0
    ? minGroupPrice
    : (course.price_group > 0 ? course.price_group : 0);
  const formattedWeekdayDate = formatWeekdayDate(course.start_date, course.end_date);
  const isCompleted = course.status === 'completed';

  return (
    <section className="relative pt-6 pb-12 text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0EA5E9]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-12 right-0 w-72 h-72 rounded-full bg-[#3b82f6]/8 blur-[80px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center"
      >
        {/* Logos Bar — Chỉ hiển thị bộ 3 logo cho khóa phối hợp tổ chức (AI Sales & Marketing Fullstack) */}
        {(course.slug?.toLowerCase().includes('aisalemark') || course.title?.toLowerCase().includes('sales & marketing')) && (
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <Image
              src="/anh3logo.png"
              alt="3 Logos - PTIT, PTTC, AIZEN"
              width={700}
              height={200}
              className="h-24 sm:h-36 md:h-44 w-auto object-contain drop-shadow-md"
              priority
            />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] mb-4 text-white"
        >
          {course.title}
        </motion.h1>

        {/* Description / Co-organizer info */}
        {(() => {
          const isPtitCourse = course.slug?.toLowerCase().includes('aisalemark') || course.title?.toLowerCase().includes('sales & marketing');
          const descriptionText = isPtitCourse
            ? (course.description || 'Khóa đào tạo do Aizen phối hợp tổ chức cùng Trung tâm đào tạo bưu chính viễn thông (PTTC), trực thuộc Học viện công nghệ bưu chính viễn thông (PTIT).')
            : course.description;

          if (!descriptionText) return null;

          return (
            <motion.p
              variants={fadeUp}
              className={
                isPtitCourse
                  ? 'text-xs sm:text-sm text-sky-400 font-semibold leading-relaxed mb-6 max-w-2xl mx-auto px-4'
                  : 'text-base sm:text-lg text-slate-200 font-medium leading-[1.6] mb-6 max-w-2xl mx-auto px-4'
              }
            >
              {descriptionText}
            </motion.p>
          );
        })()}

        {/* Date + Time + Location Sub-bar (Matching Image 1 Exact Layout) */}
        {(formattedWeekdayDate || course.location) && (
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap mb-8 text-left"
          >
            {/* Date & Time Column */}
            {formattedWeekdayDate && (
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sky-400 text-2xl shrink-0">calendar_month</span>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm sm:text-base leading-tight">
                    {formattedWeekdayDate}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold leading-tight mt-0.5">
                    {course.schedule_time || '8h30 - 17h'}
                  </span>
                </div>
              </div>
            )}

            {/* Vertical Separator */}
            {formattedWeekdayDate && course.location && (
              <span className="text-slate-600/80 hidden sm:inline text-lg font-light">|</span>
            )}

            {/* Location */}
            {course.location && (
              <div className="flex items-start sm:items-center gap-2.5 max-w-[380px] sm:max-w-[480px]">
                <span className="material-symbols-outlined text-sky-400 text-2xl shrink-0 mt-0.5 sm:mt-0">location_on</span>
                {course.location_url ? (
                  <a
                    href={course.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-black text-sm sm:text-base hover:text-sky-300 transition-colors cursor-pointer leading-snug break-words"
                    title="Mở vị trí trên Google Maps"
                  >
                    {renderLocationText(course.location)}
                  </a>
                ) : (
                  <span className="text-white font-black text-sm sm:text-base leading-snug break-words">
                    {renderLocationText(course.location)}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Meta stats */}
        {(() => {
          const items = (course.highlights && course.highlights.length > 0)
            ? course.highlights
            : [
                { icon: 'groups', value: '01 Ngày', label: 'Offline thực hành' },
                { icon: 'headset_mic', value: '03 Ngày', label: 'Online hỗ trợ' },
                { icon: 'all_inclusive', value: 'Trọn đời', label: 'Học lại miễn phí' },
              ];

          return (
            <motion.div
              variants={fadeUp}
              className={`grid gap-2 border-y border-white/10 py-6 mb-8 w-full max-w-2xl ${
                items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`flex flex-col items-center text-center px-3 ${i < items.length - 1 ? 'border-r border-white/10' : ''}`}
                >
                  <div className="w-11 h-11 rounded-full bg-sky-500/15 border border-sky-400/30 flex items-center justify-center mb-2.5 shadow-sm shadow-sky-500/20">
                    <span className="material-symbols-outlined text-sky-400 text-lg">{item.icon || 'star'}</span>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">{item.value}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          );
        })()}

        {/* Price + Date block removed per user request */}
      </motion.div>
    </section>
  );
}