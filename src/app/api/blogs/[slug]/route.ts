import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Fetch the main blog
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Blog không tồn tại hoặc chưa xuất bản', 404, req.nextUrl.pathname);
      }
      throw error;
    }

    // 2. Fetch related blogs
    const { data: related, error: relatedErr } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .eq('category', blog.category)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(5);

    if (relatedErr) throw relatedErr;

    return successResponse({
      ...blog,
      related: related || [],
    });
  } catch (err) {
    console.error('GET /api/blogs/[slug] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
