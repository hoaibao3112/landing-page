import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { searchParams } = req.nextUrl;
    const courseId = searchParams.get('course_id');
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 20);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('promo_codes')
      .select(
        'id, code, plan, discount_type, discount_value, max_uses, used_count, expires_at, is_active, note, created_at, course_id, courses(title)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (search) {
      query = query.ilike('code', `%${search.toUpperCase().trim()}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return successResponse({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('GET /api/promo-codes/admin/list error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
