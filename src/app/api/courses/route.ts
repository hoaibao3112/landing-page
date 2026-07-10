import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

function adjustCourseStatus(course: any) {
  if (course.status === 'completed' || !course.start_date) return course;

  const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const startDateStr = course.start_date.slice(0, 10);

  if (startDateStr < today) {
    return { ...course, status: 'completed' };
  }
  return course;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 9);
    const offset = (page - 1) * limit;

    let builder = supabaseAdmin
      .from('courses')
      .select('*', { count: 'exact' })
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      builder = builder.ilike('title', `%${search}%`);
    }

    const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (status === 'upcoming') {
      builder = builder.eq('status', 'upcoming').or(`start_date.gte.${today},start_date.is.null`);
    } else if (status === 'completed') {
      builder = builder.or(`status.eq.completed,start_date.lt.${today}`);
    } else if (status) {
      builder = builder.eq('status', status);
    }

    if (category) {
      builder = builder.eq('category', category);
    }
    if (year) {
      builder = builder.like('start_date', `${year}%`);
    }

    const { data, error, count } = await builder;

    if (error) throw error;

    const mappedData = (data || []).map((c) => adjustCourseStatus(c));

    return successResponse({
      items: mappedData,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/courses error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return successResponse(adjustCourseStatus(data), 201);
  } catch (err) {
    console.error('POST /api/courses error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
