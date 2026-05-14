'use client';

import { deleteRegistration } from '../actions';
import { useState } from 'react';

export default function DeleteButton({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa người đăng ký này?')) return;
    
    setIsDeleting(true);
    const res = await deleteRegistration(id);
    if (!res.success) {
      alert(res.error || 'Có lỗi xảy ra khi xóa.');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
        isDeleting 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'
      }`}
      title="Xóa người đăng ký"
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDeleting ? 'sync' : 'delete'}
      </span>
      {isDeleting ? 'Đang xóa...' : 'Xóa'}
    </button>
  );
}
