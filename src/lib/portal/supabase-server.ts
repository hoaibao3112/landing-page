import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url-for-buildtime.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key-for-buildtime';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface UserPayload {
  sub: string;
  email?: string;
  role?: string;
}

export async function verifyUser(req: NextRequest): Promise<UserPayload | null> {
  try {
    let token: string | undefined;

    // 1. Ưu tiên đọc token từ HttpOnly Cookies
    const cookieToken = req.cookies.get('access_token')?.value || req.cookies.get('admin_token')?.value;
    if (cookieToken) {
      token = cookieToken;
    } else {
      // 2. Fallback sang Authorization: Bearer header (phục vụ test Postman/cURL)
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const [type, bearerToken] = authHeader.split(' ');
        if (type === 'Bearer' && bearerToken) {
          token = bearerToken;
        }
      }
    }

    if (!token) return null;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    console.error('verifyUser error:', err);
    return null;
  }
}

export async function verifyAdmin(req: NextRequest): Promise<UserPayload | null> {
  try {
    let token: string | undefined;

    // 1. Chỉ nhận admin_token cookie — KHÔNG fallback sang access_token (user cookie)
    //    để tránh user thường vô tình được process qua admin path
    token = req.cookies.get('admin_token')?.value;

    // 2. Fallback sang Authorization: Bearer header (dành cho Postman/cURL/testing)
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const [type, bearerToken] = authHeader.split(' ');
        if (type === 'Bearer' && bearerToken) {
          token = bearerToken;
        }
      }
    }

    if (!token) return null;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    const { data: { user: fullUser }, error: adminError } = await supabaseAdmin.auth.admin.getUserById(user.id);
    if (adminError || !fullUser) return null;

    const role = fullUser.app_metadata?.role || fullUser.role;
    if (role !== 'admin') return null;

    return {
      sub: user.id,
      email: user.email,
      role,
    };
  } catch (err) {
    console.error('verifyAdmin error:', err);
    return null;
  }
}

// Replicate HTTP error handling and response structures from NestJS filters/interceptors
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      statusCode: status,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(message: string | string[], status = 500, path = '') {
  // Ở môi trường production, che giấu chi tiết lỗi 500 để tránh rò rỉ thông tin hạ tầng
  const safeMessage =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Đã xảy ra sự cố hệ thống. Vui lòng thử lại sau!'
      : message;

  return NextResponse.json(
    {
      success: false,
      statusCode: status,
      message: safeMessage,
      timestamp: new Date().toISOString(),
      path,
    },
    { status }
  );
}

/**
 * Escape/Sanitize user search string for safe use inside PostgREST filter expressions (.or(), .ilike(), etc.)
 * Prevents PostgREST filter injection by removing/escaping reserved characters (, () % _ \ " ')
 */
export function sanitizePostgrestSearch(search: string): string {
  if (!search) return '';
  return search
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/,/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();
}
