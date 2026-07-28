import { NextRequest } from 'next/server';
import { verifyAdmin, verifyUser, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function GET(req: NextRequest) {
  try {
    // 1. Kiểm tra nếu là Admin
    const admin = await verifyAdmin(req);
    if (admin) {
      return successResponse({
        user: {
          id: admin.sub,
          email: admin.email,
          role: 'admin',
        },
      });
    }

    // 2. Kiểm tra nếu là User thường
    const user = await verifyUser(req);
    if (user) {
      return successResponse({
        user: {
          id: user.sub,
          email: user.email,
          role: user.role || 'user',
        },
      });
    }

    return errorResponse('Phiên làm việc không tồn tại hoặc đã hết hạn', 401, req.nextUrl.pathname);
  } catch (err) {
    console.error('GET /api/auth/me error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
