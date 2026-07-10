import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('instructors')
      .select(`
        id, name, title, bio, avatar_url, social_links,
        courses (id, title, slug, status, thumbnail_url, start_date)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse(`Giảng viên không tồn tại`, 404, req.nextUrl.pathname);
      }
      throw error;
    }

    return successResponse(data);
  } catch (err) {
    console.error('GET /api/instructors/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
