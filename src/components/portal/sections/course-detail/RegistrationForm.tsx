'use client';

import { useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/portal/utils/format';
import { useLanguage } from '@/context/LanguageContext';
import {
  createRegistration,
  createGroupRegistration,
  validatePromoCode,
  type PromoValidateResult,
} from '@/lib/portal/api/registrations.api';

// ─── Types ───────────────────────────────────────────
interface PlanOverride {
  price?: number;
  original_price?: number;
  label?: string;
  sublabel?: string;
  [key: string]: unknown;
}

interface PlansConfig {
  early_bird?: PlanOverride;
  individual?: PlanOverride;
  group_2?: PlanOverride;
  group_4?: PlanOverride;
  [key: string]: PlanOverride | undefined;
}

interface RegistrationFormProps {
  courseId: string;
  price: number;
  priceGroup: number;
  plansConfig?: PlansConfig | null;
}

type PlanKey = 'early_bird' | 'individual' | 'group_2' | 'group_4';

interface PlanConfig {
  key: PlanKey;
  label: string;
  sublabel: string;
  priceLabel: string;
  originalPriceLabel?: string;
  memberCount: number;
  badge?: { text: string; color: string };
  basePrice: number; // Giá thực để tính giảm
}

interface MemberForm {
  fullName: string;
  phone: string;
  email: string;
  company: string;
  position: string;
}

interface MemberErrors {
  fullName?: string;
  phone?: string;
  email?: string;
}

const REFERRAL_SOURCES = [
  'Cộng Đồng AI ỨNG DỤNG SALE & MARKETING',
  'Khách hàng AIZEN',
  'Người quen giới thiệu',
  'Facebook / Instagram',
  'Khác',
];

const REFERRAL_KEYS: Record<string, string> = {
  'Cộng Đồng AI ỨNG DỤNG SALE & MARKETING': 'registration_form.referral_sources.ai_community',
  'Khách hàng AIZEN': 'registration_form.referral_sources.aizen_customer',
  'Người quen giới thiệu': 'registration_form.referral_sources.acquaintance',
  'Facebook / Instagram': 'registration_form.referral_sources.social',
  'Khác': 'registration_form.referral_sources.other',
};

const emptyMember = (): MemberForm => ({ fullName: '', phone: '', email: '', company: '', position: '' });
const emptyErrors = (): MemberErrors => ({});
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Plan card ────────────────────────────────────────
function PlanCard({ plan, selected, onClick }: { plan: PlanConfig; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-200 ${
        selected
          ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/20'
          : 'border-white/10 bg-white/5 hover:border-sky-500/40 hover:bg-white/10'
      }`}
    >
      {plan.badge && (
        <span className={`absolute -top-2.5 left-3 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide text-white ${plan.badge.color}`}>
          {plan.badge.text}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-white text-sm">{plan.label}</p>
          <p className="text-slate-400 text-xs mt-0.5">{plan.sublabel}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sky-300 text-sm">{plan.priceLabel}</p>
          {plan.originalPriceLabel && (
            <p className="text-slate-500 line-through text-xs">{plan.originalPriceLabel}</p>
          )}
        </div>
      </div>
      {selected && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ─── Person form section ──────────────────────────────
interface PersonSectionProps {
  index: number;
  total: number;
  member: MemberForm;
  errors: MemberErrors;
  onChange: (field: keyof MemberForm, value: string) => void;
}

function PersonSection({ index, total, member, errors, onChange }: PersonSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3">
      {total > 1 && (
        <div className="flex items-center gap-2 pt-1">
          <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </div>
          <p className="text-sm font-semibold text-white">{t('registration_form.person_info')} {index + 1}</p>
        </div>
      )}
      <DarkInput id={`fullName_${index}`} label={t('registration_form.fullname')} placeholder={t('registration_form.fullname_placeholder')}
        value={member.fullName} error={errors.fullName} required
        onChange={(e) => onChange('fullName', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <DarkInput id={`phone_${index}`} label={t('registration_form.phone')} placeholder={t('registration_form.phone_placeholder')} type="tel"
          value={member.phone} error={errors.phone} required
          onChange={(e) => onChange('phone', e.target.value)} />
        <DarkInput id={`email_${index}`} label={t('registration_form.email')} placeholder={t('registration_form.email_placeholder')} type="email"
          value={member.email} error={errors.email} required
          onChange={(e) => onChange('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DarkInput id={`company_${index}`} label={t('registration_form.company')} placeholder={t('registration_form.company_placeholder')}
          value={member.company} onChange={(e) => onChange('company', e.target.value)} />
        <DarkInput id={`position_${index}`} label={t('registration_form.position')} placeholder={t('registration_form.position_placeholder')}
          value={member.position} onChange={(e) => onChange('position', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Dark styled input ────────────────────────────────
interface DarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function DarkInput({ label, error, id, required, ...props }: DarkInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-300">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        {...props}
        style={{ color: '#ffffff', caretColor: '#ffffff', WebkitTextFillColor: '#ffffff' }}
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-slate-700/60 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500/60 transition-colors ${
          error ? 'border-red-400/60' : 'border-white/15 hover:border-white/25'
        }`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            i < current ? 'bg-sky-500 border-sky-500 text-white'
            : i === current ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/40'
            : 'bg-white/5 border-white/20 text-slate-400'
          }`}>
            {i < current
              ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              : i + 1}
          </div>
          {i < total - 1 && <div className={`w-10 h-0.5 transition-all ${i < current ? 'bg-sky-500' : 'bg-white/15'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Promo Code Input ─────────────────────────────────
interface PromoCodeInputProps {
  courseId: string;
  plan: string;
  basePrice: number;
  onApplied: (result: PromoValidateResult | null) => void;
  onCodeChange?: (code: string) => void;
}

function PromoCodeInput({ courseId, plan, basePrice, onApplied, onCodeChange }: PromoCodeInputProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [applied, setApplied] = useState<PromoValidateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const discountAmount = applied?.valid && applied.discount_type && applied.discount_value
    ? applied.discount_type === 'percent'
      ? Math.round((basePrice * applied.discount_value) / 100)
      : Math.min(applied.discount_value, basePrice)
    : 0;

  async function handleApply() {
    if (!code.trim()) return;
    setIsChecking(true);
    setError(null);
    setApplied(null);
    onApplied(null);
    try {
      const result = await validatePromoCode(code.trim().toUpperCase(), courseId, plan);
      if (result.valid) {
        setApplied(result);
        onApplied(result);
      } else {
        setError(result.message);
      }
    } catch {
      setError(t('registration_form.promo_error_check'));
    } finally {
      setIsChecking(false);
    }
  }

  function handleRemove() {
    setCode('');
    setApplied(null);
    setError(null);
    onApplied(null);
    onCodeChange?.('');
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-300">
        {t('registration_form.promo_label')}
        <span className="ml-1.5 text-sky-400/70 font-normal">{t('registration_form.promo_optional')}</span>
      </label>

      {applied?.valid ? (
        /* Applied state */
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-emerald-300 text-sm font-bold tracking-wider">{code.toUpperCase()}</p>
            <p className="text-emerald-400/80 text-xs">
              {applied.discount_type === 'percent'
                ? t('registration_form.discount_percent', { value: applied.discount_value ?? 0, amount: formatCurrency(discountAmount) })
                : t('registration_form.discount_fixed', { amount: formatCurrency(discountAmount) })}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 p-0.5"
            aria-label={t('registration_form.clear_code_aria')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        /* Input state */
        <div className="flex gap-2">
          <input
            id="promo-code-input"
            type="text"
            value={code}
            placeholder={t('registration_form.promo_placeholder')}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setCode(val);
              setError(null);
              onCodeChange?.(val);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            style={{ color: '#ffffff', caretColor: '#ffffff' }}
            className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border bg-slate-700/60 text-white text-sm font-mono tracking-widest placeholder:text-slate-400/70 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors ${
              error ? 'border-red-400/60' : 'border-white/15 hover:border-white/25'
            }`}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={isChecking || !code.trim()}
            className="px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            {isChecking ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : t('registration_form.promo_apply')}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-xs">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Price Summary ─────────────────────────────────────
function PriceSummary({
  basePrice,
  promo,
}: {
  basePrice: number;
  promo: PromoValidateResult | null;
}) {
  const { t } = useLanguage();
  const discountAmount = promo?.valid && promo.discount_type && promo.discount_value
    ? promo.discount_type === 'percent'
      ? Math.round((basePrice * promo.discount_value) / 100)
      : Math.min(promo.discount_value, basePrice)
    : 0;

  const finalPrice = Math.max(0, basePrice - discountAmount);
  const hasDiscount = discountAmount > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-1.5">
      <div className="flex justify-between items-center text-sm text-slate-400">
        <span>{t('registration_form.original_price')}:</span>
        <span className={hasDiscount ? 'line-through text-slate-500' : 'text-white font-semibold'}>
          {formatCurrency(basePrice)}
        </span>
      </div>

      {hasDiscount && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-emerald-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t('registration_form.discount')}:
          </span>
          <span className="text-emerald-400 font-semibold">-{formatCurrency(discountAmount)}</span>
        </div>
      )}

      <div className="border-t border-white/10 pt-1.5 flex justify-between items-center">
        <span className="text-sm font-semibold text-white">{t('registration_form.total_payment')}:</span>
        <div className="text-right">
          <span className="text-lg font-extrabold text-sky-300">{formatCurrency(finalPrice)}</span>
          {hasDiscount && (
            <p className="text-[10px] text-emerald-400 text-right">
              {t('registration_form.savings')} {formatCurrency(discountAmount)}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────
export function RegistrationForm({ courseId, price, priceGroup, plansConfig }: RegistrationFormProps) {
  const { t } = useLanguage();

  // Đọc giá từ plans_config nếu có, fallback về công thức cũ
  const indivPrice = plansConfig?.individual?.price ?? price;
  const indivOriginalPrice = plansConfig?.individual?.original_price ?? null; // null = không gạch ngang
  const g2Price = plansConfig?.group_2?.price ?? priceGroup;
  const g2OriginalPrice = plansConfig?.group_2?.original_price ?? price; // fallback: giá cá nhân
  const g4Price = plansConfig?.group_4?.price ?? Math.round(priceGroup * 1.8 / 4);
  const g4OriginalPrice = plansConfig?.group_4?.original_price ?? price; // fallback: giá cá nhân
  const group4TotalPrice = g4Price * 4;

  const PLANS: PlanConfig[] = [
    {
      key: 'early_bird', label: t('registration_form.early_bird'), sublabel: '',
      priceLabel: formatCurrency(Math.round(price * 0.73)),
      originalPriceLabel: formatCurrency(price),
      memberCount: 1, basePrice: Math.round(price * 0.73),
      badge: { text: t('registration_form.limited_qty'), color: 'bg-amber-500' },
    },
    {
      key: 'individual', label: t('registration_form.individual'), sublabel: '',
      priceLabel: formatCurrency(indivPrice),
      // Chỉ hiện gạch ngang nếu admin đã set original_price
      ...(indivOriginalPrice ? { originalPriceLabel: formatCurrency(indivOriginalPrice) } : {}),
      memberCount: 1, basePrice: indivPrice,
    },
    {
      key: 'group_2', label: t('registration_form.group_2'), sublabel: '',
      priceLabel: formatCurrency(g2Price * 2),
      originalPriceLabel: formatCurrency(g2OriginalPrice * 2),
      memberCount: 2, basePrice: g2Price * 2,
      badge: { text: t('registration_form.hot'), color: 'bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 shadow-md shadow-red-500/30' },
    },
    {
      key: 'group_4', label: t('registration_form.group_4'), sublabel: '',
      priceLabel: formatCurrency(group4TotalPrice),
      originalPriceLabel: formatCurrency(g4OriginalPrice * 4),
      memberCount: 4, basePrice: group4TotalPrice,
      badge: { text: t('registration_form.best_savings'), color: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30' },
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState<PlanConfig>(PLANS[1]!);
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<MemberForm[]>(Array.from({ length: 1 }, emptyMember));
  const [memberErrors, setMemberErrors] = useState<MemberErrors[]>([emptyErrors()]);
  const [referral, setReferral] = useState('');
  const [referralError, setReferralError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoValidateResult | null>(null);
  const [promoCodeStr, setPromoCodeStr] = useState('');

  const totalSteps = selectedPlan.memberCount;
  const isMulti = totalSteps > 1;
  const isLastStep = step === totalSteps - 1;

  function handlePlanSelect(plan: PlanConfig) {
    setSelectedPlan(plan);
    setStep(0);
    setMembers(Array.from({ length: plan.memberCount }, emptyMember));
    setMemberErrors(Array.from({ length: plan.memberCount }, emptyErrors));
    setReferral('');
    setReferralError(undefined);
    setApiError(null);
    setAppliedPromo(null);
  }

  function updateMember(idx: number, field: keyof MemberForm, value: string) {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
    if (['fullName', 'phone', 'email'].includes(field)) {
      setMemberErrors((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: undefined } : e)));
    }
  }

  function validateStep(idx: number): boolean {
    const m = members[idx]!;
    const e: MemberErrors = {};
    if (!m.fullName.trim()) e.fullName = t('registration_form.err_fullname');
    if (!m.phone.trim()) e.phone = t('registration_form.err_phone');
    if (!m.email.trim()) e.email = t('registration_form.err_email');
    else if (!EMAIL_REGEX.test(m.email)) e.email = t('registration_form.err_email_invalid');
    setMemberErrors((prev) => prev.map((old, i) => (i === idx ? e : old)));
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => s + 1);
    setApiError(null);
  }

  const handlePromoApplied = useCallback((result: PromoValidateResult | null) => {
    setAppliedPromo(result);
  }, []);

  async function handleSubmit() {
    if (!validateStep(step)) return;
    let refValid = true;
    if (!referral) { setReferralError(t('registration_form.err_referral')); refValid = false; }
    else setReferralError(undefined);
    if (!refValid) return;

    setIsLoading(true);
    setApiError(null);

    // Lấy promoCode nếu đã apply thành công
    const promoCode = appliedPromo?.valid ? promoCodeStr : undefined;

    try {
      let message: string;
      if (totalSteps === 1) {
        const m = members[0]!;
        const result = await createRegistration({
          courseId, fullName: m.fullName, phone: m.phone, email: m.email,
          company: m.company || undefined, position: m.position || undefined,
          referral, plan: selectedPlan.key,
          promoCode,
        });
        message = result.message;
      } else {
        const result = await createGroupRegistration({
          courseId, referral,
          members: members.map((m) => ({
            fullName: m.fullName, phone: m.phone, email: m.email,
            company: m.company || undefined, position: m.position || undefined,
          })),
          promoCode,
        });
        message = result.message;
      }
      setSuccess(message);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('registration_form.err_submit_fallback'));
    } finally {
      setIsLoading(false);
    }
  }

  // ── Success ───────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-gradient-to-br from-emerald-900/60 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-8 text-center">
        <p className="text-4xl mb-4">🎉</p>
        <p className="font-bold text-white text-lg mb-1">{t('registration_form.success_title')}</p>
        <p className="text-emerald-300 text-sm">{success}</p>
        <button onClick={() => { setSuccess(null); handlePlanSelect(PLANS[1]!); }}
          className="mt-5 text-sm text-emerald-400 underline">{t('registration_form.register_more')}</button>
      </div>
    );
  }

  return (
    <div className="relative border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm sticky top-20 shadow-2xl shadow-black/30"
      style={{ backgroundImage: "linear-gradient(180deg, rgba(15,30,53,0.85) 0%, rgba(11,22,40,0.9) 100%), url('/backgoundTrangkhoahoc.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <div className="text-center pt-5 pb-4 px-6 border-b border-white/8">
        <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('registration_form.header_tag')}</p>
        <h3 className="text-xl font-extrabold text-white">{t('registration_form.header_title')}</h3>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* ── Plan cards ── */}
        <div className="flex flex-col gap-2.5">
          {PLANS.map((plan) => (
            <PlanCard key={plan.key} plan={plan}
              selected={selectedPlan.key === plan.key}
              onClick={() => handlePlanSelect(plan)} />
          ))}
        </div>

        <div className="border-t border-white/8" />

        {/* ── Step indicator (multi-person) ── */}
        {isMulti && (
          <div className="flex flex-col items-center gap-1">
            <StepIndicator current={step} total={totalSteps} />
            <p className="text-xs text-slate-400">{t('registration_form.person_info')} {step + 1} / {totalSteps}</p>
          </div>
        )}

        {/* ── Person form ── */}
        <div key={`step-${step}-${selectedPlan.key}`} className="animate-fade-in">
          <PersonSection
            index={step} total={totalSteps}
            member={members[step]!} errors={memberErrors[step]!}
            onChange={(field, value) => updateMember(step, field, value)}
          />
        </div>

        {/* ── Referral + Promo (last step) ── */}
        {isLastStep && (
          <>
            {/* Referral */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="referral" className="text-xs font-medium text-slate-300">
                {t('registration_form.referral_question')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select id="referral" value={referral}
                  onChange={(e) => { setReferral(e.target.value); setReferralError(undefined); }}
                  style={{ color: referral === '' ? 'rgb(100,116,139)' : '#ffffff' }}
                  className={`w-full appearance-none px-4 py-2.5 pr-10 border rounded-lg text-sm bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors ${
                    referralError ? 'border-red-400/60' : 'border-white/15 hover:border-white/25'
                  } ${referral === '' ? 'text-slate-500' : 'text-white'}`}
                >
                  <option value="" disabled className="bg-slate-800">{t('registration_form.referral_placeholder')}</option>
                  {REFERRAL_SOURCES.map((src) => (
                    <option key={src} value={src} className="bg-slate-800">
                      {t(REFERRAL_KEYS[src] || src)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
              {referralError && <p className="text-xs text-red-400">{referralError}</p>}
            </div>

            {/* ── Promo Code ── */}
            <div className="border-t border-white/8 pt-3">
              <PromoCodeInput
                courseId={courseId}
                plan={selectedPlan.key}
                basePrice={selectedPlan.basePrice}
                onApplied={handlePromoApplied}
                onCodeChange={setPromoCodeStr}
              />
            </div>
          </>
        )}

        {/* ── Price Summary (last step) ── */}
        {isLastStep && (
          <PriceSummary
            basePrice={selectedPlan.basePrice}
            promo={appliedPromo}
          />
        )}

        {/* ── API error ── */}
        {apiError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        {/* ── Action buttons ── */}
        {isMulti && !isLastStep ? (
          <button onClick={handleNext}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            {t('registration_form.next')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button id="btn-register-submit" onClick={handleSubmit} disabled={isLoading}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>{t('registration_form.submitting')}</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {t('registration_form.submit')}
                </>
              )}
            </button>
            {isMulti && step > 0 && (
              <button onClick={() => { setStep((s) => s - 1); setApiError(null); }}
                className="w-full py-2 rounded-xl border border-white/15 text-slate-400 hover:bg-white/5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('registration_form.back_to')} {step}
              </button>
            )}
          </div>
        )}

        <p className="text-[11px] text-center text-slate-500 leading-relaxed">
          {t('registration_form.terms_agree')}{' '}
          <a href="/terms" className="underline hover:text-slate-300">{t('registration_form.terms_link')}</a>
        </p>
      </div>
    </div>
  );
}
