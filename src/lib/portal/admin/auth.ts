// Client-side only — chỉ gọi trong browser context
// 🔒 SECURITY: Token được lưu trong HttpOnly Cookie phía Server (chống XSS)
// User info (không nhạy cảm) lưu sessionStorage để hiển thị UI admin

const ADMIN_USER_KEY = 'admin_user';

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
}

export function setAdminSession(_token: string | undefined, user: AdminUser): void {
  if (typeof window === 'undefined') return;

  // Chỉ lưu user info (không nhạy cảm) vào sessionStorage để hiển thị UI admin
  try {
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  } catch (_) {}
}

export function getAdminToken(): string | null {
  // Token được lưu trong HttpOnly Cookie phía Server, JS client không đọc token
  return null;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  // Xóa user info khỏi sessionStorage
  try { sessionStorage.removeItem(ADMIN_USER_KEY); } catch (_) {}

  // Gọi API logout để xóa HttpOnly Cookies ở Server
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});

  // Dọn dẹp localStorage cũ (nếu có)
  try {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_expires_at');
    localStorage.removeItem('admin_user');
  } catch (_) {}
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminUser();
}

// Dọn dẹp các key cũ trong localStorage khi app khởi động
export function cleanupLegacyAdminStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_expires_at');
    const oldUser = localStorage.getItem('admin_user');
    if (oldUser) {
      try { sessionStorage.setItem(ADMIN_USER_KEY, oldUser); } catch (_) {}
      localStorage.removeItem('admin_user');
    }
  } catch (_) {}
}