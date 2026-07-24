'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Instructor } from '@aizen/types';

interface InstructorCardProps {
  instructor: Pick<Instructor, 'id' | 'name' | 'title' | 'avatar_url' | 'bio'>;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 md:mb-8"
    >
      <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.2em] text-[#38bdf8] uppercase mb-6 w-full justify-center">
        <span className="w-6 h-px bg-[#38bdf8]/60" />
        DIỄN GIẢ CHƯƠNG TRÌNH
        <span className="w-6 h-px bg-[#38bdf8]/60" />
      </p>

      <div
        className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-white/20 shadow-2xl shadow-sky-950/50"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/backgoundTrangkhoahoc.jpg"
            alt="Instructor background"
            fill
            className="object-cover object-center opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" />
        </div>

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0EA5E9]/20 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-8 sm:gap-10">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex-shrink-0"
          >
            {instructor.avatar_url ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#3b82f6] blur-xl opacity-60 scale-110" />
                <Image
                  src={instructor.avatar_url}
                  alt={instructor.name}
                  width={220}
                  height={220}
                  className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full object-cover border-4 border-sky-400/60 shadow-2xl shadow-sky-500/40"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#3b82f6] blur-xl opacity-60 scale-110" />
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-sky-500/40 border-4 border-sky-400/60">
                  <span className="text-white text-5xl font-bold">{instructor.name.charAt(0)}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
              {instructor.name}
            </h3>
            <p className="text-sky-400 font-semibold text-sm mb-3">{instructor.title}</p>
            <div className="flex items-center gap-1 mb-4 justify-center sm:justify-start">
              <div className="w-6 h-0.5 bg-sky-500 rounded-full" />
              <div className="w-2 h-0.5 bg-sky-500/50 rounded-full" />
            </div>

            {instructor.bio && (
              <p className="text-slate-300 text-sm leading-[1.8] mb-5 max-w-lg">{instructor.bio}</p>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              {[
                {
                  label: 'Chia sẻ',
                  path: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
                },
                {
                  label: 'Email',
                  path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                },
              ].map((btn) => (
                <motion.button
                  key={btn.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={btn.label}
                  className="w-9 h-9 rounded-full border border-white/12 bg-white/5 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/8 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.path} />
                  </svg>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
