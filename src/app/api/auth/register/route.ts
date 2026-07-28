import { NextRequest } from 'next/server';
import { supabaseAdmin, successResponse, errorResponse } from '@/lib/portal/supabase-server';
import { checkRateLimit, getClientIp } from '@/lib/portal/rate-limit';
import { registerSchema } from '@/schemas/auth.schema';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit Check (3 requests / 1 giờ / IP)
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp, 'auth-register', 3, 3_600_000)) {
      return errorResponse('Bạn đã thực hiện quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ.', 429, req.nextUrl.pathname);
    }

    // 2. Validate input bằng Zod
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse(issue?.message || 'Dữ liệu đăng ký không hợp lệ', 400, req.nextUrl.pathname);
    }

    const { email, password, fullName, phone, company } = parseResult.data;

    // 3. Đăng ký tài khoản trong Supabase Auth
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
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName,
      },
      message: 'Đăng ký tài khoản thành công',
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return errorResponse(err instanceof Error ? err.message : 'Internal Server Error', 500, req.nextUrl.pathname);
  }
}
