'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { submitRegistration } from './actions';

function CustomSelect({
  label,
  name,
  options,
  icon,
  placeholder,
  required
}: {
  label: string;
  name: string;
  options: string[];
  icon: string;
  placeholder: string;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [otherValue, setOtherValue] = useState('');

  const isOther = selected === 'Khác';

  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-bold text-on-surface-variant font-headline ml-1 uppercase" htmlFor={name}>{label}</label>
      <input type="hidden" name={name} value={isOther ? otherValue : selected} required={required} />

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group cursor-pointer w-full pl-12 pr-12 py-4 bg-surface-container-low border-2 rounded-2xl transition-all duration-300 flex items-center ${isOpen ? 'border-primary bg-white ring-4 ring-primary/10 shadow-lg' : 'border-transparent hover:bg-surface-container'
          }`}
      >
        <span className={`material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isOpen || selected ? 'text-primary' : 'text-on-surface-variant'
          }`}>
          {icon}
        </span>

        <span className={`font-medium ${selected ? 'text-on-surface' : 'text-on-surface-variant/60'}`}>
          {selected || placeholder}
        </span>

        <span className={`material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'
          }`}>
          expand_more
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close when clicking outside */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2"
            >
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                    if (option !== 'Khác') setOtherValue('');
                  }}
                  className={`px-5 py-3 text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${selected === option
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                >
                  {option}
                  {selected === option && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOther && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="Vui lòng nhập thông tin của bạn"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              required={required}
              className="w-full mt-2 px-5 py-3 bg-surface-container-low border-2 border-primary/20 rounded-xl focus:border-primary focus:bg-white transition-all outline-none text-on-surface text-sm font-medium"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['values', 'speakers', 'register'];
      let currentSection = '';

      // Sử dụng ngưỡng 150px từ cạnh trên màn hình để xác định section đang xem
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Nếu phần đỉnh của section vượt qua ngưỡng 150px lên trên, nó là active
          if (rect.top <= 150) {
            currentSection = section;
          }
        }
      }

      // Xoá trạng thái nếu đang ở trên cùng
      if (window.scrollY < 200) {
        currentSection = '';
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = async (formData: FormData) => {
    setFormState('loading');
    const result = await submitRegistration(formData);
    if (result.success) {
      setFormState('success');
      setMessage(result.message || 'Thành công!');
    } else {
      setFormState('error');
      setMessage(result.error || 'Có lỗi xảy ra.');
    }
  };

  return (
    <main className="overflow-x-hidden relative min-h-screen">
      {/* Toàn bộ Background */}
      <div className="fixed inset-0 z-[-1]">
        <Image
          src="/new_background.jpg"
          alt="Main Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/20"></div>
      </div>
      {/* Toast for Errors */}
      {formState === 'error' ? (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-28 right-4 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl text-white shadow-2xl bg-red-500"
        >
          <span className="material-symbols-outlined">error</span>
          <span className="font-headline font-medium text-sm">{message}</span>
        </motion.div>
      ) : null}

      {/* Success Modal */}
      <AnimatePresence>
        {formState === 'success' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormState('idle')}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[95vh]"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setFormState('idle')}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-6 md:p-8 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-black font-headline text-on-surface mb-1">Đăng ký thành công!</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">Chúng tôi sẽ sớm liên hệ xác nhận với bạn.</p>

                <div className="bg-emerald-50 rounded-2xl p-5 md:p-6 border border-emerald-100 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-headline font-black text-sm md:text-base text-emerald-800 mb-4 uppercase tracking-wider leading-tight">
                      Vui lòng quét QR thanh toán phí cam kết chia sẻ
                    </h4>

                    <div className="relative group mx-auto w-full max-w-[240px] md:max-w-[280px]">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                      <div className="relative bg-white p-2.5 rounded-2xl border border-emerald-100 shadow-lg">
                        <Image
                          src="/qr_v1.jpg"
                          alt="QR Phí Tea Break"
                          width={400}
                          height={400}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <p className="font-black text-emerald-700 text-sm">Phí cam kết: 100.000đ</p>
                      <div className="bg-white/90 backdrop-blur py-2.5 px-4 rounded-xl border border-dashed border-emerald-200 inline-block text-center w-full max-w-[240px]">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Nội dung chuyển khoản</p>
                        <p className="text-sm font-black text-primary tracking-tight">HỌ TÊN - SỐ ĐIỆN THOẠI</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setFormState('idle')}
                    className="w-full max-w-[120px] py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Đã hiểu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-md border border-slate-200/50 rounded-full mx-auto max-w-6xl px-2">
        <div className="flex justify-between items-center px-6 py-3">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image
              alt="AIZEN Logo"
              width={160}
              height={32}
              className="h-6 sm:h-7 w-auto object-contain"
              src="/logo.png"
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-headline"></span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            <a className={`pb-1 font-headline text-sm transition-all ${activeSection === 'values' ? 'text-primary font-bold border-b-[3px] border-primary' : 'text-slate-500 font-semibold hover:text-slate-900 border-b-[3px] border-transparent'}`} href="#values">Giá trị</a>
            <a className={`pb-1 font-headline text-sm transition-all ${activeSection === 'speakers' ? 'text-primary font-bold border-b-[3px] border-primary' : 'text-slate-500 font-semibold hover:text-slate-900 border-b-[3px] border-transparent'}`} href="#speakers">Diễn giả</a>
            <a className={`pb-1 font-headline text-sm transition-all ${activeSection === 'register' ? 'text-primary font-bold border-b-[3px] border-primary' : 'text-slate-500 font-semibold hover:text-slate-900 border-b-[3px] border-transparent'}`} href="#register">Thời gian</a>
          </div>
          <a
            href="#register"
            className="bg-primary text-white px-8 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 transition-all active:scale-95 uppercase tracking-wider"
          >
            Đăng ký ngay
          </a>
        </div>
      </nav>

      <div className="">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex flex-col items-center justify-center overflow-hidden pt-40 pb-32">
          {/* Background Atmospheric Effect */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            {/* Animated Floating Blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/30 rounded-full blur-[120px] mix-blend-multiply"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary-container/20 rounded-full blur-[120px] mix-blend-multiply"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            {/* Social Proof Badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center mb-12 gap-5"
            >
              <div className="inline-flex items-center px-6 py-3 md:px-10 md:py-5 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-xl md:text-4xl shadow-lg shadow-primary/10 border border-primary/20 bg-gradient-to-r from-secondary-container to-tertiary-container/30">
                <span className="material-symbols-outlined text-[30px] md:text-[54px] mr-3 md:mr-4">local_fire_department</span>
                Giới hạn chỉ 30 suất
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 text-primary rounded-2xl border border-primary/10 backdrop-blur-sm self-center">
                <span className="material-symbols-outlined text-2xl">event_available</span>
                <span className="font-headline font-black text-lg md:text-xl uppercase tracking-wider">Hạn đăng ký: Đến hết ngày 04/05/2026</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-headline font-extrabold text-on-background tracking-tight leading-tight mb-8 flex flex-col items-center gap-4"
            >
              <span className="text-5xl md:text-6xl lg:text-7xl">CHUỖI AI SOLUTIONS TALK</span>
              <span className="text-lg md:text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary leading-normal md:whitespace-nowrap font-black">
                CHIA SẺ MIỄN PHÍ TỪ CỘNG ĐỒNG AI ỨNG DỤNG SALES & MARKETING
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-headline text-3xl md:text-4xl lg:text-5xl font-black text-on-surface max-w-5xl mx-auto leading-tight mb-12"
            >
              <span className="text-red-600">BUỔI 2: AI VIDEO</span><br />
              <span className="text-red-600 md:whitespace-nowrap">PHỦ SÓNG SIÊU TỐC - TỐI ƯU CHI PHÍ</span>
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-6"
            >
              <div className="flex flex-col items-center gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-12 py-5 bg-primary text-white rounded-full font-black text-xl shadow-2xl shadow-primary/40 flex items-center gap-3 group transition-all"
                >
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>
                  ĐĂNG KÝ THAM GIA NGAY
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.5
                  }}
                  className="mt-4 flex items-center gap-3 md:gap-4 px-6 py-4 md:px-12 md:py-5 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-tertiary to-tertiary-dim text-white border-2 border-white/20 shadow-2xl shadow-tertiary/40"
                >
                  <span className="material-symbols-outlined text-[24px] md:text-[32px]">verified</span>
                  <span className="font-headline font-black text-lg md:text-3xl uppercase tracking-widest italic">
                    100% Offline thực hành
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section - Bento Grid */}
        <section id="values" className="bg-white/80 backdrop-blur-md py-24 px-8 relative overflow-hidden scroll-mt-32">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black font-headline tracking-tight mb-4 text-on-surface">Giá trị cốt lõi từ chương trình</h2>
              <p className="text-on-surface-variant max-w-4xl mx-auto">Học đi đôi với hành. Chúng tôi tập trung vào việc tạo ra kết quả thực tế ngay tại buổi chia sẻ.</p>
            </div>
            <div className="editorial-grid">
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,83,204,0.06)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">videocam</span>
                </div>
                <h3 className="text-2xl font-black font-headline mb-4">Tự sản xuất video ngắn 15-30 giây siêu nhanh</h3>
                <p className="text-on-surface-variant leading-relaxed">Ứng dụng AI tạo video chuyên nghiệp chỉ với vài câu lệnh, giúp bứt phá doanh số trên đa nền tảng.</p>
              </div>
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,83,204,0.06)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">person_off</span>
                </div>
                <h3 className="text-2xl font-black font-headline mb-4">Không cần thuê mẫu, không cần đội quay dựng, không cần thiết bị đắt tiền</h3>
                <p className="text-on-surface-variant leading-relaxed">Xóa bỏ rào cản nhân sự và thiết bị, giúp bạn tự làm chủ quy trình sản xuất video chất lượng cao.</p>
              </div>
              <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,83,204,0.06)] flex flex-col items-start transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">speed</span>
                </div>
                <h3 className="text-2xl font-black font-headline mb-4">Tối ưu chi phí, thời gian và năng suất</h3>
                <p className="text-on-surface-variant leading-relaxed">Dễ dàng duy trì nhận diện thương hiệu và phủ sóng nội dung siêu tốc với chi phí tối ưu nhất.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Speakers Section */}
        <section id="speakers" className="py-24 px-8 max-w-7xl mx-auto scroll-mt-40 bg-white/40 backdrop-blur-sm rounded-[4rem] my-24 border border-white/20">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
              <span className="material-symbols-outlined text-sm">mic</span>
              <span className="text-xs font-bold uppercase tracking-widest font-headline">DIỄN GIẢ CHƯƠNG TRÌNH</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-surface-container-low rounded-[3rem] p-8 lg:p-12 border border-outline-variant/10 shadow-sm overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              <div className="w-full lg:w-2/5 flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-tertiary rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
                  <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-8 border-white shadow-xl relative">
                    <Image
                      src="/dien-gia.jpg"
                      alt="Lê Thanh Hải - CEO AIZEN"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-3/5">
                <h3 className="text-4xl lg:text-5xl font-black font-headline mb-2 text-on-surface tracking-tighter">Lê Thanh Hải</h3>
                <p className="text-xl font-bold text-primary font-headline mb-6">CEO AIZEN</p>
                <div className="w-16 h-1.5 bg-gradient-to-r from-primary to-tertiary rounded-full mb-8"></div>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  Chuyên gia với <span className="text-on-surface font-bold">hơn 15 năm kinh nghiệm thực chiến</span> trong ngành Công nghệ thông tin. Anh trực tiếp dẫn dắt lộ trình đưa AI vào vận hành, giúp doanh nghiệp đóng gói quy trình, tối ưu hiệu suất và bứt phá doanh thu từ những trải nghiệm và ứng dụng thực tế nhất.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">share</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Form & Details Section */}
        <section id="register" className="py-24 px-8 max-w-7xl mx-auto relative mb-12 scroll-mt-40">
          <div className="editorial-grid">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-5 order-2 lg:order-1"
            >
              <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-outline-variant/10">
                <h2 className="text-3xl font-black font-headline mb-8 tracking-tight">Đăng ký tham gia</h2>
                <form action={handleAction} className="space-y-6">
                  {/* Honeypot field - Hidden from users, only visible to spam bots */}
                  <div className="hidden" aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant font-headline ml-1" htmlFor="fullname">Họ và tên</label>
                    <input id="fullname" name="fullname" className="w-full px-5 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none text-on-surface" placeholder="Nguyễn Văn A" type="text" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant font-headline ml-1" htmlFor="phone">Số điện thoại</label>
                    <input id="phone" name="phone" className="w-full px-5 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none text-on-surface" placeholder="09xx xxx xxx" type="tel" pattern="^(0|84)(3|5|7|8|9|1[2689])([0-9]{8})$" title="Vui lòng nhập số điện thoại Việt Nam hợp lệ (10 số)" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant font-headline ml-1" htmlFor="email">Email công việc</label>
                    <input id="email" name="email" className="w-full px-5 py-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none text-on-surface" placeholder="name@company.com" type="email" required />
                  </div>

                  <CustomSelect
                    label="Bạn biết đến sự kiện từ đâu? *"
                    name="referral"
                    icon="group"
                    placeholder="Chọn nguồn thông tin"
                    options={[
                      "Cộng Đồng AI ỨNG DỤNG SALE & MARKETING",
                      "Khách hàng AIZEN",
                      "Người quen giới thiệu",
                      "Khác"
                    ]}
                    required
                  />

                  <CustomSelect
                    label="Bạn là? *"
                    name="role"
                    icon="work"
                    placeholder="Chọn vai trò của bạn"
                    options={[
                      "Chủ doanh nghiệp",
                      "Quản lý phòng ban",
                      "Nhân viên",
                      "Sinh viên",
                      "Khác"
                    ]}
                    required
                  />

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black text-lg shadow-xl shadow-primary/30 hover:bg-primary-dim hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {formState === 'loading' ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">send</span>
                          GỬI THÔNG TIN ĐĂNG KÝ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-7 order-1 lg:order-2 lg:pl-16"
            >
              <div className="sticky top-32">
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block font-headline">Thông tin chi tiết</span>
                <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter mb-10 leading-tight">
                  Buổi 2 <br /><span className="text-red-600 whitespace-nowrap">AI VIDEO: PHỦ SÓNG SIÊU TỐC</span>
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xl mb-1">Thời gian tổ chức</h4>
                      <p className="text-on-surface-variant">Thứ Bảy, ngày 09 tháng 05 năm 2026. <br />Thời gian: 8h30-11h30</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                      <span className="material-symbols-outlined">map</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xl mb-1">Offline - THỰC HÀNH</h4>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined">laptop_mac</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xl mb-1">Yêu cầu chuẩn bị</h4>
                      <p className="text-on-surface-variant">Vui lòng mang theo Laptop cá nhân để tham gia phần thực hành làm Video AI cùng các chuyên gia.</p>
                    </div>
                  </div>
                  <div className="flex gap-6 pt-6 border-t border-slate-200/50 mt-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-6 italic bg-slate-50 p-4 rounded-2xl border-l-[4px] border-primary/30">
                        Buổi chia sẻ hoàn toàn <span className="text-primary font-bold uppercase">miễn phí</span>. Phí cam kết giữ chỗ 150k ưu tiên đăng ký trong ngày 04/04/2026 (bao gồm mua license các công cụ, chia sẻ địa điểm và tea-break) giúp chúng tôi mang đến trải nghiệm thực hành tốt nhất cho bạn. Sau ngày này, phí cam kết giữ chỗ sẽ là 250k.
                      </p>
                      <div className="relative group max-w-[300px]">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                          <Image
                            src="/qr_v1.jpg"
                            alt="QR Phí Tea Break"
                            width={300}
                            height={300}
                            className="w-full h-auto rounded-xl"
                          />
                        </div>
                        <div className="mt-4 text-center">
                          <div className="">
                            <p className="text-[13px] font-bold text-slate-600 bg-slate-100 py-3 px-6 rounded-xl border border-dashed border-slate-300 inline-block tracking-tight text-center leading-relaxed">
                              Nội dung chuyển khoản:<br />
                              <span className="text-primary font-black text-[15px]">HỌ TÊN - SỐ ĐIỆN THOẠI</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer id="partners" className="bg-white w-full border-t border-slate-200 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <a
              href="https://aizenworld.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image
                alt="AIZEN Logo"
                width={160}
                height={32}
                className="h-6 sm:h-7 w-auto object-contain"
                src="/logo.png"
              />
            </a>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-600">
                <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                <p className="text-sm font-medium leading-relaxed max-w-xs">
                  69 Bến Vân Đồn, phường Xóm Chiếu, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-primary text-xl">call</span>
                <p className="text-sm font-medium">0362 077 399</p>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                <p className="text-sm font-medium">info@aizenworld.com</p>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-primary text-xl">language</span>
                <a href="https://aizenworld.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
                  aizenworld.com
                </a>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <a className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium" href="#">Chính sách bảo mật</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium" href="#">Điều khoản dịch vụ</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium" href="#">Liên hệ</a>
            <a className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium" href="#">Đơn vị tổ chức</a>
          </div>
        </div>
      </footer>
      {/* Floating Zalo Button */}
      <a
        href="https://zalo.me/0362077399"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] flex items-center gap-2 bg-[#0068ff] text-white px-5 py-3 rounded-full shadow-2xl hover:scale-105 transition-all active:scale-95 group"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.01 2c-5.523 0-10 3.731-10 8.333 0 2.404 1.206 4.562 3.125 6.075-.24 1.157-1.125 3.328-1.125 3.328a.5.5 0 00.741.528c.026-.016 3.14-1.996 4.316-2.775.92.179 1.9.274 2.91.274 5.522 0 10-3.731 10-8.333S17.532 2 12.01 2z" fill="#0068ff" />
          </svg>
        </div>
        <span className="font-headline font-bold text-sm tracking-tight">Hỗ trợ Zalo</span>
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </div>
      </a>
    </main>
  );
}
