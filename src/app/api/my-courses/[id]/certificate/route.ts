import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyUser, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyUser(req);
    if (!user) {
      return errorResponse('Quyền truy cập bị từ chối', 401, req.nextUrl.pathname);
    }

    const { id: enrollmentId } = await params;

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, status, completed_at, courses(title)')
      .eq('id', enrollmentId)
      .eq('user_id', user.sub)
      .single();

    if (error || !data) {
      return errorResponse('Không tìm thấy bản ghi đăng ký', 404, req.nextUrl.pathname);
    }

    if (data.status !== 'completed') {
      return errorResponse('Khóa học chưa hoàn thành, chưa thể cấp chứng chỉ', 400, req.nextUrl.pathname);
    }

    const courseTitle = Array.isArray(data.courses)
      ? (data.courses as any)[0]?.title
      : (data.courses as any)?.title;

    return successResponse({
      enrollmentId: data.id,
      courseTitle,
      completedAt: data.completed_at,
      certificateUrl: null, // Sẽ cải tiến tạo PDF chứng chỉ sau
    });
  } catch (err) {
    console.error('GET /api/my-courses/[id]/certificate error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
