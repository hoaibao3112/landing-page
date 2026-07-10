import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { id } = await params;
    const { data: blog, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Không tìm thấy bài viết', 404, req.nextUrl.pathname);
      }
      throw error;
    }

    return successResponse(blog);
  } catch (err) {
    console.error('GET /api/blogs/admin/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { id } = await params;
    const body = await req.json();

    // Find existing blog
    const { data: existing, error: findError } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return errorResponse('Không tìm thấy bài viết', 404, req.nextUrl.pathname);
    }

    if (body.slug && body.slug !== existing.slug) {
      const { data: slugTaken } = await supabaseAdmin
        .from('blogs')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .maybeSingle();

      if (slugTaken) {
        return errorResponse(`Slug "${body.slug}" đã được sử dụng`, 409, req.nextUrl.pathname);
      }
    }

    const payload: Record<string, any> = { ...body };
    if (body.status === 'published' && existing.status !== 'published') {
      payload.published_at = new Date().toISOString();
    } else if (body.status && body.status !== 'published') {
      payload.published_at = null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('blogs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Revalidate paths
    revalidatePath('/portal/blogs');
    revalidatePath(`/portal/blogs/${existing.slug}`);
    if (updated.slug !== existing.slug) {
      revalidatePath(`/portal/blogs/${updated.slug}`);
    }

    return successResponse(updated);
  } catch (err) {
    console.error('PATCH /api/blogs/admin/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { id } = await params;

    const { data: existing, error: findError } = await supabaseAdmin
      .from('blogs')
      .select('slug')
      .eq('id', id)
      .single();

    if (findError || !existing) {
      return errorResponse('Không tìm thấy bài viết', 404, req.nextUrl.pathname);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Revalidate paths
    revalidatePath('/portal/blogs');
    revalidatePath(`/portal/blogs/${existing.slug}`);

    return successResponse({ success: true });
  } catch (err) {
    console.error('DELETE /api/blogs/admin/[id] error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
