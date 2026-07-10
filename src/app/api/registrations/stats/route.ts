import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin.rpc('get_registration_stats');

    if (error) {
      console.error('Failed to get stats via RPC:', error);
      return errorResponse('Lỗi khi truy vấn dữ liệu thống kê', 400, req.nextUrl.pathname);
    }

    return successResponse(data);
  } catch (err) {
    console.error('GET /api/registrations/stats error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
