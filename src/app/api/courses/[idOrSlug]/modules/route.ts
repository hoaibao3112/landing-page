import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;

    const { data, error } = await supabaseAdmin
      .from('course_modules')
      .select('*')
      .eq('course_id', idOrSlug)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return successResponse(data || []);
  } catch (err) {
    console.error('GET /api/courses/[idOrSlug]/modules error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const { idOrSlug: courseId } = await params;
    const body = await req.json();
    const modules = body.modules || [];

    // Fetch existing modules to backup
    const { data: oldModules, error: fetchError } = await supabaseAdmin
      .from('course_modules')
      .select('*')
      .eq('course_id', courseId);

    if (fetchError) throw fetchError;

    // Delete existing modules
    const { error: deleteError } = await supabaseAdmin
      .from('course_modules')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) throw deleteError;

    if (modules.length === 0) {
      return successResponse({ success: true });
    }

    const insertData = modules.map((m: any, idx: number) => ({
      course_id: courseId,
      title: m.title,
      subtitle: m.subtitle || null,
      description: m.description || null,
      duration_minutes: m.duration_minutes,
      start_time: m.start_time || null,
      item_type: m.item_type,
      order_index: idx,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('course_modules')
      .insert(insertData);

    if (insertError) {
      console.error('Insert modules failed, trying to restore backup...', insertError);
      if (oldModules && oldModules.length > 0) {
        const restoreData = oldModules.map(({ id, ...rest }) => rest);
        const { error: restoreError } = await supabaseAdmin
          .from('course_modules')
          .insert(restoreData);

        if (restoreError) {
          console.error('KHẨN CẤP: Phục hồi modules cũ thất bại!', restoreError);
        }
      }
      throw insertError;
    }

    return successResponse({ success: true });
  } catch (err) {
    console.error('PUT /api/courses/[idOrSlug]/modules error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
