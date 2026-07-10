import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Vui lòng điền đầy đủ email và mật khẩu', 400, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      return errorResponse('Email hoặc mật khẩu không chính xác', 401, req.nextUrl.pathname);
    }

    return successResponse({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.['full_name'] as string | undefined,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
