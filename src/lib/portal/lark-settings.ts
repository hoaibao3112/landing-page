import { supabaseAdmin } from '@/lib/portal/supabase-server';

let cachedWebhookUrl: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // Cache 1 phút

/**
 * Lấy Lark Webhook URL theo thứ tự ưu tiên:
 * 1. Cache in-memory (60s)
 * 2. Supabase app_settings table (admin có thể đổi qua UI)
 * 3. Fallback env var LARK_WEBHOOK_URL
 */
export async function getLarkWebhookUrl(): Promise<string | null> {
  const now = Date.now();

  if (cachedWebhookUrl && now < cacheExpiry) {
    return cachedWebhookUrl;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'lark_webhook_url')
      .single();

    if (!error && data?.value) {
      cachedWebhookUrl = data.value;
      cacheExpiry = now + CACHE_TTL_MS;
      return cachedWebhookUrl;
    }
  } catch {
    // Silently fallback to env
  }

  // Fallback to env var
  const envUrl = process.env.LARK_WEBHOOK_URL || null;
  if (envUrl) {
    cachedWebhookUrl = envUrl;
    cacheExpiry = now + CACHE_TTL_MS;
  }
  return envUrl;
}

/** Xóa cache khi admin cập nhật URL mới */
export function invalidateLarkWebhookCache() {
  cachedWebhookUrl = null;
  cacheExpiry = 0;
}
