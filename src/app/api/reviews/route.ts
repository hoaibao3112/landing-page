import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyUser, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return errorResponse('Quyền truy cập bị từ chối', 401, req.nextUrl.pathname);
    }

    const body = await req.json();
    const { courseId, rating, content } = body;

    if (!courseId || rating === undefined) {
      return errorResponse('Thiếu thông tin đánh giá bắt buộc', 400, req.nextUrl.pathname);
    }

    // Verify course exists
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (courseErr || !course) {
      return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
    }

    // Only enrolled + completed users can review
    const { data: enrollment, error: enrollErr } = await supabaseAdmin
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.sub)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollErr || !enrollment) {
      return errorResponse('Bạn chưa đăng ký khóa học này', 400, req.nextUrl.pathname);
    }

    if (enrollment.status !== 'completed') {
      return errorResponse('Bạn phải hoàn thành khóa học trước khi đánh giá', 400, req.nextUrl.pathname);
    }

    // No duplicate reviews
    const { data: existing } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('user_id', user.sub)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      return errorResponse('Bạn đã đánh giá khóa học này rồi', 409, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: user.sub,
        course_id: courseId,
        rating,
        content: content || '',
      })
      .select('id, rating, content, created_at')
      .single();

    if (error) {
      console.error('Insert review failed:', error);
      return errorResponse('Gửi đánh giá khóa học thất bại', 400, req.nextUrl.pathname);
    }

    return successResponse(data, 201);
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
