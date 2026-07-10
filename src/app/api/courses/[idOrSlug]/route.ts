import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function adjustCourseStatus(course: any) {
  if (course.status === 'completed' || !course.start_date) return course;

  const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const startDateStr = course.start_date.slice(0, 10);

  if (startDateStr < today) {
    return { ...course, status: 'completed' };
  }
  return course;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const isUuid = UUID_REGEX.test(idOrSlug);

    if (isUuid) {
      // Admin GET by ID
      const admin = await verifyAdmin(req);
      if (!admin) {
        return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
      }

      const { data, error } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', idOrSlug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
        }
        throw error;
      }

      return successResponse(adjustCourseStatus(data));
    } else {
      // Public GET by Slug
      const { data, error } = await supabaseAdmin
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            subtitle,
            description,
            duration_minutes,
            order_index,
            start_time,
            item_type
          ),
          instructors (id, name, title, avatar_url, bio)
        `)
        .eq('slug', idOrSlug)
        .order('order_index', { referencedTable: 'course_modules', ascending: true })
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return errorResponse('Khóa học không tồn tại', 404, req.nextUrl.pathname);
        }
        throw error;
      }

      return successResponse(adjustCourseStatus(data));
    }
  } catch (err) {
    console.error('GET /api/courses/[idOrSlug] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { idOrSlug } = await params;
    const isUuid = UUID_REGEX.test(idOrSlug);

    if (!isUuid) {
      return errorResponse('ID khóa học không hợp lệ', 400, req.nextUrl.pathname);
    }

    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update(body)
      .eq('id', idOrSlug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
      }
      throw error;
    }

    return successResponse(adjustCourseStatus(data));
  } catch (err) {
    console.error('PATCH /api/courses/[idOrSlug] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { idOrSlug } = await params;
    const isUuid = UUID_REGEX.test(idOrSlug);

    if (!isUuid) {
      return errorResponse('ID khóa học không hợp lệ', 400, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', idOrSlug)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Không tìm thấy khóa học', 404, req.nextUrl.pathname);
      }
      throw error;
    }

    return successResponse(adjustCourseStatus(data));
  } catch (err) {
    console.error('DELETE /api/courses/[idOrSlug] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
