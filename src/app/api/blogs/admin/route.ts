import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const body = await req.json();
    const { title, slug, excerpt, body_html, thumbnail_url, category, author, source_name, source_url, images, status } = body;

    if (!title || !slug) {
      return errorResponse('Tiêu đề và slug là bắt buộc', 400, req.nextUrl.pathname);
    }

    // Check slug taken
    const { data: existingBlog } = await supabaseAdmin
      .from('blogs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingBlog) {
      return errorResponse(`Slug "${slug}" đã được sử dụng`, 409, req.nextUrl.pathname);
    }

    const payload = {
      title,
      slug,
      excerpt: excerpt ?? '',
      body_html: body_html ?? '',
      thumbnail_url: thumbnail_url || null,
      category: category ?? 'blog',
      author: author ?? 'Aizen',
      source_name: source_name || null,
      source_url: source_url || null,
      images: images ?? [],
      status: status ?? 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    if (blog.status === 'published') {
      revalidatePath('/portal/blogs');
      revalidatePath(`/portal/blogs/${blog.slug}`);
    }

    return successResponse(blog, 201);
  } catch (err) {
    console.error('POST /api/blogs/admin error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
