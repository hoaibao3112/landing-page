import { cookies } from 'next/headers';
import viDict from '@/locales/vi.json';
import enDict from '@/locales/en.json';
import type { Language } from '@/context/LanguageContext';

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('aizen_language')?.value;
  return lang === 'en' ? 'en' : 'vi';
}

export async function getServerDict() {
  const lang = await getServerLanguage();
  return lang === 'en' ? enDict : viDict;
}
