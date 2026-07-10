import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ status: 'completed' })
      .eq('status', 'upcoming')
      .lt('start_date', today)
      .select('id');

    if (error) throw error;

    return successResponse({ updatedCount: data?.length ?? 0 });
  } catch (err) {
    console.error('POST /api/courses/sync-status error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
