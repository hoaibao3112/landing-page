'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResourceConfigItem, submitResourceAccessRequestAction } from '@/app/actions';

const DEFAULT_RESOURCES: ResourceConfigItem[] = [
  {
    id: 'claude-khoa1-2-slide',
    title: 'Slide Bài Giảng & Giáo Trình Claude AI (Khóa 1 & 2)',
    description: 'Bộ slide bài giảng chi tiết bao gồm Mindset - Skillset - Toolset giúp tối ưu hiệu suất làm việc 8 tiếng thành 3 tiếng với Claude AI.',
    category: 'Làm chủ Claude AI (Khóa 1 & 2)',
    course_origin: '🎓 Khóa 1 & 2 (Đã hoàn thành - 150+ Học viên)',
    cover_image: '/claudeKhoa3moi.jpg',
    file_type: 'pdf',
    file_type_label: 'Google Drive PDF',
    drive_url: 'https://drive.google.com/',
    tags: ['Claude AI', 'Slide bài giảng', 'Tối ưu hiệu suất', 'Khóa 1 & 2'],
    course_cta_text: 'Đăng ký ngay Khóa 3 (05/09/2026)',
    course_cta_link: '/portal/courses/lam-chu-claude-ai-khoa-3',
    course_cta_badge: '🔥 ĐANG MỞ CỔNG KHÓA 3',
    is_popular: true,
    is_active: true,
  },
  {
    id: 'claude-prompt-library-500',
    title: 'Thư Viện 500+ Prompts Claude AI Thực Chiến Cho Doanh Nghiệp',
    description: 'Tổng hợp câu lệnh prompt chuẩn hóa dành cho tự động hóa phòng ban, quản trị, lập kế hoạch marketing và viết content sales.',
    category: 'Làm chủ Claude AI (Khóa 1 & 2)',
    course_origin: '🎓 Khóa 1 & 2 (Tài liệu tốt nghiệp thực hành)',
    cover_image: '/khoa3.jpg',
    file_type: 'sheet',
    file_type_label: 'Google Sheet / Excel',
    drive_url: 'https://drive.google.com/',
    tags: ['Prompt Library', 'Automated Workflow', 'Claude 3.5 Sonnet'],
    course_cta_text: 'Đăng ký ngay Khóa 3 (05/09/2026)',
    course_cta_link: '/portal/courses/lam-chu-claude-ai-khoa-3',
    course_cta_badge: '🔥 ĐANG MỞ CỔNG KHÓA 3',
    is_popular: true,
    is_active: true,
  },
  {
    id: 'ai-sale-marketing-fullstack-kit',
    title: 'Bộ Toolkit & Template AI Sale & Marketing Fullstack',
    description: 'Tài liệu hướng dẫn xây dựng kịch bản bán hàng, tự động hóa phễu tư vấn và bộ công cụ AI Marketing trọn gói.',
    category: 'AI Sale & Marketing Fullstack',
    course_origin: '🚀 Khóa AI Sale & Marketing (Đã tốt nghiệp)',
    cover_image: '/fullstack.jpg',
    file_type: 'doc',
    file_type_label: 'Google Docs',
    drive_url: 'https://drive.google.com/',
    tags: ['AI Marketing', 'Sale Funnel', 'Fullstack AI'],
    course_cta_text: 'Tham gia Khóa tiếp theo (22-23/08/2026)',
    course_cta_link: '/portal/courses/aisalemarkertingfullstack',
    course_cta_badge: '📅 KHAI GIẢNG 22-23/08',
    is_popular: false,
    is_active: true,
  },
  {
    id: 'claude-ai-agent-building-guide',
    title: 'Hướng Dẫn Xây Dựng AI Agent Trợ Lý Tự Động Làm Việc',
    description: 'Tài liệu từng bước hướng dẫn thiết lập trợ lý Claude AI chuyên biệt cho từng phòng ban: CSKH, Copywriting, Research.',
    category: 'Làm chủ Claude AI (Khóa 1 & 2)',
    course_origin: '🎓 Khóa 2 (Dự án thực tế học viên)',
    cover_image: '/Lam_chu_claude_ai.jpg',
    file_type: 'pdf',
    file_type_label: 'Google Drive PDF',
    drive_url: 'https://drive.google.com/',
    tags: ['AI Agent', 'Trợ lý ảo', 'Workflow'],
    course_cta_text: 'Đăng ký ngay Khóa 3 (05/09/2026)',
    course_cta_link: '/portal/courses/lam-chu-claude-ai-khoa-3',
    course_cta_badge: '🔥 ĐANG MỞ CỔNG KHÓA 3',
    is_popular: false,
    is_active: true,
  },
];

const CATEGORIES = [
  'Tất cả',
  'Làm chủ Claude AI (Khóa 1 & 2)',
  'AI Sale & Marketing Fullstack',
  'Slide & Ebook',
  'Template & Cheat Sheet',
];

export function ResourcesClient({ initialResources }: { initialResources?: ResourceConfigItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Email Verification Modal State
  const [selectedDriveItem, setSelectedDriveItem] = useState<ResourceConfigItem | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('aizen_user_email');
      if (savedEmail) setUserEmail(savedEmail);
    }
  }, []);

  const handleOpenReceiveModal = (item: ResourceConfigItem) => {
    setSelectedDriveItem(item);
    setEmailError('');
    setRequestSuccess(false);
    setIsModalOpen(true);
  };

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      setEmailError('Vui lòng nhập Email để mở tài liệu.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      setEmailError('Vui lòng nhập đúng định dạng Email (ví dụ: name@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aizen_user_email', userEmail.trim());
    }

    const res = await submitResourceAccessRequestAction(
      userEmail.trim(),
      selectedDriveItem?.id || '',
      selectedDriveItem?.title || ''
    );

    setIsSubmitting(false);

    if (res.success) {
      setRequestSuccess(true);
    } else {
      setEmailError(res.message || 'Có lỗi xảy ra khi gửi yêu cầu.');
    }
  };

  const resourcesData = initialResources && initialResources.length > 0 ? initialResources : DEFAULT_RESOURCES;

  const filteredResources = resourcesData.filter((item) => {
    if (item.is_active === false) return false;
    const matchesCategory =
      selectedCategory === 'Tất cả' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-10 max-w-7xl mx-auto">
      {/* 2-Column Layout: Left (Main Materials) & Right (Upcoming Courses Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (8 cols): Filter Tabs, Hero Header & Resource Cards Grid */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Control Bar: Filter Tabs + Search Input (PLATED AT VERY TOP) */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Horizontal Scrollable Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap touch-manipulation snap-start active:scale-95 ${
                        active
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-auto sm:min-w-[220px]">
                <input
                  type="text"
                  placeholder="Tìm tài liệu, slide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-9 text-xs text-white placeholder-slate-400 outline-none transition-all"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hero Header */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950/40 border border-slate-700/80 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image
                src="/backgoundTrangkhoahoc.jpg"
                alt="Resources Hero Background"
                fill
                className="object-cover object-center opacity-85 scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/40 to-slate-950/70 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-3.5 shadow-sm max-w-full">
                <span className="truncate">❤️ CHO ĐI GIÁ TRỊ THỰC — ĐỒNG HÀNH CÙNG CỘNG ĐỒNG</span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3.5 drop-shadow-md">
                Kho Tài Nguyên AI Thực Chiến <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300">
                  Cho Đi Để Cùng Phát Triển
                </span>
              </h1>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium mb-5">
                AIZEN tin rằng tri thức chỉ thực sự có giá trị khi được chia sẻ. Toàn bộ Slide bài giảng, Ebook, Prompt Library &amp; Template vận hành từ các khóa học 
                <strong className="text-amber-400 font-bold"> Làm chủ Claude AI (Khóa 1 &amp; 2) </strong> 
                và <strong className="text-sky-400 font-bold"> AI Sale &amp; Marketing </strong> đều được chúng tôi công khai 100% miễn phí — Không giấu nghề!
              </p>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 sm:p-3 text-center backdrop-blur-md">
                  <p className="text-sm sm:text-xl font-black text-amber-400">100% Free</p>
                  <p className="text-slate-400 text-[9px] sm:text-[11px] font-bold mt-0.5">Google Drive</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 sm:p-3 text-center backdrop-blur-md">
                  <p className="text-sm sm:text-xl font-black text-sky-400">150+ Học viên</p>
                  <p className="text-slate-400 text-[9px] sm:text-[11px] font-bold mt-0.5">Đã tốt nghiệp</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 sm:p-3 text-center backdrop-blur-md">
                  <p className="text-sm sm:text-xl font-black text-emerald-400">Thực Chiến</p>
                  <p className="text-slate-400 text-[9px] sm:text-[11px] font-bold mt-0.5">Áp dụng ngay</p>
                </div>
              </div>
            </div>
          </section>

          {/* Resource Cards Grid */}
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-slate-900/60 rounded-2xl sm:rounded-3xl border border-slate-800 p-4">
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-2">
                Không tìm thấy tài liệu phù hợp với tìm kiếm &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {filteredResources.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden bg-slate-950/40 border border-slate-700/80 hover:border-amber-400/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-amber-500/20"
                >
                  {/* Card Background Image Overlay */}
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <Image
                      src="/backgoundTrangkhoahoc.jpg"
                      alt="Card Background"
                      fill
                      className="object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/35 to-slate-950/70 backdrop-blur-[1px]" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                    <div>
                      {/* Course Cover Image Thumbnail (Compact Height) */}
                      <div className="relative w-full h-28 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 mb-2 group-hover:border-amber-400/60 transition-colors shadow-inner">
                        <Image
                          src={item.cover_image || '/claudeKhoa3moi.jpg'}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                        
                        {/* Popular Badge */}
                        {item.is_popular && (
                          <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-md z-10">
                            ★ HOT RESOURCE
                          </span>
                        )}
                      </div>

                      {/* Course Origin & Social Proof Badge */}
                      <div className="mb-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm max-w-full truncate">
                          {item.course_origin}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-snug mb-1 drop-shadow-sm">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-200 text-[10px] sm:text-[11px] leading-relaxed mb-2 line-clamp-2 font-medium">
                        {item.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {Array.isArray(item.tags) &&
                          item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[8px] sm:text-[9px] font-bold text-slate-200 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700 shadow-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Receive Resource Button */}
                    <div className="pt-2 border-t border-slate-700/80 shrink-0">
                      <button
                        onClick={() => handleOpenReceiveModal(item)}
                        className="w-full h-9.5 flex items-center justify-center py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider touch-manipulation"
                      >
                        <span>Nhận Tài Liệu Ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Upcoming Courses Sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 mt-6 lg:mt-0">
          {/* Sidebar Header Banner */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 border border-amber-500/50 rounded-xl sm:rounded-2xl p-3 text-center shadow-xl backdrop-blur-md">
            <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] uppercase tracking-wider rounded-full mb-1 shadow">
              🔥 ĐÀO TẠO THỰC CHÍẾN
            </span>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              Các Khóa Học Sắp Diễn Ra
            </h2>
            <p className="text-slate-300 text-[11px] font-medium mt-0.5">
              Đăng ký giữ chỗ các lớp học đào tạo AI mới nhất từ AIZEN
            </p>
          </div>

          {/* Upcoming Course Card 1: AI Sale & Marketing Fullstack (Nearest: 22-23/08/2026) */}
          <div className="group relative overflow-hidden bg-slate-900/90 border border-sky-500/50 hover:border-sky-400 rounded-xl sm:rounded-2xl p-3 shadow-xl transition-all duration-300 space-y-2">
            <div className="relative w-full h-28 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <Image
                src="/fullstack.jpg"
                alt="AI Sale & Marketing Fullstack"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow z-10">
                🚀 KHAI GIẢNG GẦN NHẤT (22-23/08)
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-sky-300 transition-colors leading-snug">
                AI Sale &amp; Marketing Fullstack
              </h3>
              <p className="text-slate-300 text-[11px] mt-1 font-medium">
                📅 Khai giảng: <strong className="text-sky-400 font-bold">22-23/08/2026</strong> (2 Ngày Offline)
              </p>
              <p className="text-emerald-400 text-[10px] font-extrabold mt-0.5">
                ⚡ Tự động hóa phễu marketing &amp; sales doanh nghiệp
              </p>
            </div>

            <Link
              href="/portal/courses/aisalemarkertingfullstack"
              className="w-full h-9 flex items-center justify-center py-2 px-3 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs rounded-lg sm:rounded-xl text-center transition-all shadow-md hover:scale-[1.02] active:scale-95 uppercase tracking-wider block touch-manipulation"
            >
              Đăng ký Khóa 22-23/08 →
            </Link>
          </div>

          {/* Upcoming Course Card 2: Claude AI Khóa 3 (Next: 05/09/2026) */}
          <div className="group relative overflow-hidden bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 rounded-xl sm:rounded-2xl p-3 shadow-xl transition-all duration-300 space-y-2">
            <div className="relative w-full h-28 sm:h-32 rounded-lg sm:rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
              <Image
                src="/claudeKhoa3moi.jpg"
                alt="Làm chủ Claude AI Khóa 3"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow z-10">
                🔥 ĐANG MỞ CỔNG KHÓA 3 (05/09)
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors leading-snug">
                Làm Chủ Claude AI (Khóa 3)
              </h3>
              <p className="text-slate-300 text-[11px] mt-1 font-medium">
                📅 Khai giảng: <strong className="text-amber-400 font-bold">05/09/2026</strong> (Offline &amp; Online)
              </p>
              <p className="text-emerald-400 text-[10px] font-extrabold mt-0.5">
                ⚡ Chỉ còn 15 suất ưu đãi Early Bird
              </p>
            </div>

            <Link
              href="/portal/courses/lam-chu-claude-ai-khoa-3"
              className="w-full h-9 flex items-center justify-center py-2 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-lg sm:rounded-xl text-center transition-all shadow-md hover:scale-[1.02] active:scale-95 uppercase tracking-wider block touch-manipulation"
            >
              Đăng ký Khóa 3 ngay →
            </Link>
          </div>

          {/* Hotline & Advisory Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center space-y-1.5 backdrop-blur-md">
            <p className="text-xs font-bold text-slate-300">Bạn cần tư vấn lộ trình học phù hợp?</p>
            <Link
              href="/portal/courses"
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs rounded-lg sm:rounded-xl border border-amber-500/30 block transition-all"
            >
              🎓 Xem tất cả khóa học AIZEN
            </Link>
          </div>
        </div>
      </div>

      {/* Email Verification Modal (Mobile Optimized) */}
      {isModalOpen && selectedDriveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative bg-slate-900 border border-amber-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full text-white shadow-2xl space-y-4 my-auto overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-amber-400">Nhận Tài Liệu Khóa Học</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer touch-manipulation"
              >
                ✕
              </button>
            </div>

            {/* Selected Resource Card Info */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
              <div className="relative w-14 sm:w-16 h-10 sm:h-12 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-900">
                <Image
                  src={selectedDriveItem.cover_image || '/claudeKhoa3moi.jpg'}
                  alt={selectedDriveItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{selectedDriveItem.title}</p>
                <span className="inline-block text-[10px] text-amber-300 font-medium truncate max-w-full">
                  {selectedDriveItem.course_origin}
                </span>
              </div>
            </div>

            {requestSuccess ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ✓
                </div>
                <h4 className="text-base font-black text-emerald-400">Đã Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-slate-300 text-xs leading-relaxed font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-left">
                  Ban quản trị AIZEN đã nhận được yêu cầu cấp quyền từ Gmail <strong className="text-amber-300 font-bold">{userEmail}</strong>. Admin sẽ duyệt &amp; thêm Email của bạn vào danh sách được phép truy cập trên Google Drive trong thời gian sớm nhất.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 text-center cursor-pointer uppercase tracking-wider"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Instruction Text */}
                <p className="text-slate-200 text-xs leading-relaxed font-medium bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  Vui lòng nhập <strong className="text-amber-300 font-bold">Email</strong> bạn đã sử dụng để đăng ký khóa học tại AIZEN:
                </p>

                {/* Verification Form */}
                <form onSubmit={handleConfirmEmail} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Địa chỉ Gmail (*):
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="ví dụ: hotro@aizen.edu.vn"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-3 text-sm sm:text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                    />
                    {emailError && (
                      <p className="text-rose-400 text-[11px] font-bold mt-1">{emailError}</p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                    >
                      {isSubmitting ? (
                        <span>⏳ Đang gửi yêu cầu...</span>
                      ) : (
                        <span>🚀 Gửi Yêu Cầu Cấp Quyền ↗</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
