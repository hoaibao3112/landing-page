import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { id } = await params;
    const body = await req.json();

    const { data: existing } = await supabaseAdmin
      .from('promo_codes')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return errorResponse('Không tìm thấy mã khuyến mãi', 404, req.nextUrl.pathname);
    }

    if (body.course_id) {
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('id')
        .eq('id', body.course_id)
        .maybeSingle();
      if (!course) {
        return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('promo_codes')
      .update(body)
      .eq('id', id)
      .select('id, code, plan, discount_type, discount_value, max_uses, used_count, expires_at, is_active, note, created_at, course_id, courses(title)')
      .single();

    if (error) throw error;

    return successResponse(data);
  } catch (err) {
    console.error('PATCH /api/promo-codes/admin/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { id } = await params;

    const { data: existing } = await supabaseAdmin
      .from('promo_codes')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return errorResponse('Không tìm thấy mã khuyến mãi', 404, req.nextUrl.pathname);
    }

    const { error } = await supabaseAdmin
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return successResponse({ message: 'Đã xóa mã khuyến mãi' });
  } catch (err) {
    console.error('DELETE /api/promo-codes/admin/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
