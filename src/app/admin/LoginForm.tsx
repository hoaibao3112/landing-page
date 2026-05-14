'use client';

import { useState } from 'react';
import { loginAdmin } from '../actions';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || 'Lỗi đăng nhập');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-body px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
        <h1 className="text-2xl font-black font-headline mb-6 text-center text-slate-900 border-b pb-4">
          Admin Portal
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2">Tên tài khoản</label>
            <input 
              name="username"
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium text-slate-900"
              placeholder="Nhập tên đăng nhập..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-600 block mb-2">Mật khẩu truy cập</label>
            <input 
              name="password"
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium text-slate-900"
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}
          <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-bold font-headline hover:bg-primary-dim transition-colors shadow-lg shadow-primary/20 active:scale-95">
            Xác nhận
          </button>
        </form>
      </div>
      <p className="mt-8 text-sm text-slate-400">© 2026 Tích hợp hệ thống nội bộ</p>
    </div>
  );
}
