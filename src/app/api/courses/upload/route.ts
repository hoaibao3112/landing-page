import { NextRequest } from 'next/server';
import { supabaseAdmin, verifyAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return errorResponse('Quyền truy cập bị từ chối', 403, req.nextUrl.pathname);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('Không tìm thấy file để upload', 400, req.nextUrl.pathname);
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      return errorResponse('Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF', 400, req.nextUrl.pathname);
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return errorResponse('File size exceeds the 5MB limit', 400, req.nextUrl.pathname);
    }

    const cleanFileName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${cleanFileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from('courses')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('courses')
      .getPublicUrl(fileName);

    return successResponse(publicUrl, 201);
  } catch (err) {
    console.error('POST /api/courses/upload error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
