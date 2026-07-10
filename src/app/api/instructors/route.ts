import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search');

    let builder = supabaseAdmin
      .from('instructors')
      .select('id, name, title, bio, avatar_url, social_links')
      .order('created_at', { ascending: true });

    if (search) {
      builder = builder.ilike('name', `%${search}%`);
    }

    const { data, error } = await builder;

    if (error) throw error;

    return successResponse(data || []);
  } catch (err) {
    console.error('GET /api/instructors error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
