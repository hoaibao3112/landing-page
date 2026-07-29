'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/portal/ui/Input';
import { Button } from '@/components/portal/ui/Button';
import { apiClient } from '@/lib/portal/api/api-client';
import { useLanguage } from '@/context/LanguageContext';

import { registerSchema } from '@/schemas/auth.schema';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

const INITIAL: RegisterForm = { fullName: '', email: '', password: '', phone: '' };

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState<RegisterForm>(INITIAL);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const next: Partial<RegisterForm> = {};
    if (!form.fullName.trim()) next.fullName = t('auth.register.err_fullname_required');
    if (!form.email.trim()) next.email = t('auth.register.err_email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('auth.register.err_email_invalid');

    const pwResult = registerSchema.shape.password.safeParse(form.password);
    if (!pwResult.success) {
      const issue = pwResult.error.issues[0];
      next.password = issue?.message || t('auth.register.err_password_format');
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      router.push('/portal/auth/login?registered=1');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t('auth.register.err_api_failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold text-primary-500">AIZEN</span>
            <span className="text-2xl font-light text-gray-400"> Education</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">{t('auth.register.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.register.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            id="fullName"
            label={t('auth.register.fullname_label')}
            placeholder={t('auth.register.fullname_placeholder')}
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            error={errors.fullName}
            required
          />
          <Input
            id="email"
            label={t('auth.register.email_label')}
            type="email"
            placeholder={t('auth.register.email_placeholder')}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
            required
          />
          <Input
            id="phone"
            label={t('auth.register.phone_label')}
            type="tel"
            placeholder={t('auth.register.phone_placeholder')}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            id="password"
            label={t('auth.register.password_label')}
            type="password"
            placeholder={t('auth.register.password_placeholder')}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            required
          />
        </div>

        {apiError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {apiError}
          </p>
        )}

        <Button
          size="lg"
          className="w-full mt-5"
          isLoading={isLoading}
          onClick={handleRegister}
        >
          {t('auth.register.submit_btn')}
        </Button>

        <p className="text-sm text-center text-gray-500 mt-5">
          {t('auth.register.has_account')}{' '}
          <Link href="/portal/auth/login" className="text-primary-500 hover:underline font-medium">
            {t('auth.register.login_link')}
          </Link>
        </p>
      </div>
    </div>
  );
}
