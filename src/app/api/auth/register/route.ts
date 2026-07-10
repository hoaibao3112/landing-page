import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, phone, company } = body;

    if (!email || !password || !fullName) {
      return errorResponse('Vui lòng điền đầy đủ các thông tin bắt buộc', 400, req.nextUrl.pathname);
    }

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone ?? null,
          company: company ?? null,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return errorResponse('Email đã được đăng ký sử dụng', 409, req.nextUrl.pathname);
      }
      return errorResponse(error.message, 400, req.nextUrl.pathname);
    }

    return successResponse({
      user: data.user,
      session: data.session,
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
