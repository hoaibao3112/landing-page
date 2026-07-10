import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 9);
    const offset = (page - 1) * limit;

    let builder = supabaseAdmin
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      builder = builder.eq('category', category);
    }

    const { data, error, count } = await builder;

    if (error) throw error;

    return successResponse({
      items: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/blogs error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
