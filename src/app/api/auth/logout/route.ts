import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/portal/supabase-server';

export async function POST(_req: NextRequest) {
  const response = successResponse({ message: 'Đăng xuất thành công' });

  // 🔒 Xóa sạch 3 HttpOnly cookies xác thực phía Server
  response.cookies.delete('access_token');
  response.cookies.delete('admin_token');
  response.cookies.delete('refresh_token');

  return response;
}
