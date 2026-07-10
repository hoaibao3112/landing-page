import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('id, rating, content, created_at, profiles(full_name, avatar_url)')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return successResponse(data || []);
  } catch (err) {
    console.error('GET /api/reviews/course/[courseId] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
