import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';
import { invalidateLarkWebhookCache } from '@/lib/portal/lark-settings';

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value')
      .in('key', ['lark_webhook_url']);

    if (error) throw error;

    const settings: Record<string, string> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return successResponse(settings);
  } catch (err) {
    console.error('GET /api/settings error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const body = await req.json();
    const allowedKeys = ['lark_webhook_url'];

    const upserts = Object.entries(body)
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, value]) => ({ key, value: String(value) }));

    if (upserts.length === 0) {
      return errorResponse('Không có setting hợp lệ để cập nhật', 400, req.nextUrl.pathname);
    }

    const { error } = await supabaseAdmin
      .from('app_settings')
      .upsert(upserts, { onConflict: 'key' });

    if (error) throw error;

    invalidateLarkWebhookCache();
    return successResponse({ message: 'Cập nhật settings thành công' });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
