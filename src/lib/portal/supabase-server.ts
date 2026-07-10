import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

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
  const user = await verifyUser(req);
  if (!user) return null;

  try {
    const { data: { user: fullUser }, error } = await supabaseAdmin.auth.admin.getUserById(user.sub);
    if (error || !fullUser) return null;

    const role = fullUser.app_metadata?.role || fullUser.role;
    if (role !== 'admin') return null;

    return {
      sub: user.sub,
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
  return Response.json({
    success: true,
    data,
    statusCode: status,
    timestamp: new Date().toISOString(),
  }, { status });
}

export function errorResponse(message: string | string[], status = 500, path = '') {
  return Response.json({
    success: false,
    statusCode: status,
    message,
    timestamp: new Date().toISOString(),
    path,
  }, { status });
}
