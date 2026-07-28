import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return errorResponse('Không tìm thấy refresh token', 401, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      const response = errorResponse('Phiên đăng nhập đã hết hạn', 401, req.nextUrl.pathname);
      response.cookies.delete('access_token');
      response.cookies.delete('admin_token');
      response.cookies.delete('refresh_token');
      return response;
    }

    let isAdmin = false;
    try {
      const { data: { user: fullUser } } = await supabaseAdmin.auth.admin.getUserById(data.user.id);
      if (fullUser) {
        const role = fullUser.app_metadata?.role || fullUser.role;
        if (role === 'admin') isAdmin = true;
      }
    } catch (_) {}

    const response = successResponse({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: (data.user.user_metadata?.['full_name'] as string | undefined) || '',
        avatarUrl: (data.user.user_metadata?.['avatar_url'] as string | undefined) || null,
        role: isAdmin ? 'admin' : 'user',
      },
    });

    const isProd = process.env.NODE_ENV === 'production';
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    response.cookies.set('access_token', data.session.access_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: sevenDaysInSeconds,
      path: '/',
    });

    if (isAdmin) {
      response.cookies.set('admin_token', data.session.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: sevenDaysInSeconds,
        path: '/',
      });
    }

    if (data.session.refresh_token) {
      response.cookies.set('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: sevenDaysInSeconds * 4,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('Refresh token error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
