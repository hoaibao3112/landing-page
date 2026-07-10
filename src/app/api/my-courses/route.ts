import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyUser, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return errorResponse('Quyền truy cập bị từ chối', 401, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id, status, completed_at, created_at,
        courses (id, title, slug, thumbnail_url, status, start_date, category)
      `)
      .eq('user_id', user.sub)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch my enrollments failed:', error);
      return errorResponse('Lỗi khi truy vấn danh sách khóa học', 400, req.nextUrl.pathname);
    }

    return successResponse(data || []);
  } catch (err) {
    console.error('GET /api/my-courses error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return errorResponse('Quyền truy cập bị từ chối', 401, req.nextUrl.pathname);
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return errorResponse('Missing courseId in request body', 400, req.nextUrl.pathname);
    }

    // Check course exists
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseErr || !course) {
      return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
    }

    // Check already enrolled
    const { data: existing } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.sub)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existing) {
      return errorResponse('Bạn đã đăng ký tham gia khóa học này rồi', 409, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .insert({ user_id: user.sub, course_id: courseId, status: 'upcoming' })
      .select('id, status, created_at')
      .single();

    if (error) {
      console.error('Enroll user failed:', error);
      return errorResponse('Đăng ký tham gia khóa học thất bại', 400, req.nextUrl.pathname);
    }

    return successResponse(data, 201);
  } catch (err) {
    console.error('POST /api/my-courses error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
