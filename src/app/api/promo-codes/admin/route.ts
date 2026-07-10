import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const body = await req.json();
    const { code, course_id, plan, discount_type, discount_value, max_uses, expires_at, note } = body;

    if (!code || !course_id || !plan || !discount_type || discount_value === undefined || max_uses === undefined) {
      return errorResponse('Thiếu thông tin bắt buộc', 400, req.nextUrl.pathname);
    }

    // Check code unique
    const { data: existing } = await supabaseAdmin
      .from('promo_codes')
      .select('id')
      .eq('code', code.toUpperCase().trim())
      .maybeSingle();

    if (existing) {
      return errorResponse(`Mã "${code}" đã tồn tại`, 409, req.nextUrl.pathname);
    }

    // Check course exists
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .maybeSingle();

    if (!course) {
      return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .insert({
        code: code.toUpperCase().trim(),
        course_id,
        plan,
        discount_type,
        discount_value,
        max_uses,
        expires_at: expires_at || null,
        note: note ?? null,
        is_active: true,
        used_count: 0,
      })
      .select('id, code, plan, discount_type, discount_value, max_uses, used_count, expires_at, is_active, note, created_at, course_id, courses(title)')
      .single();

    if (error) throw error;

    return successResponse(data, 201);
  } catch (err) {
    console.error('POST /api/promo-codes/admin error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
