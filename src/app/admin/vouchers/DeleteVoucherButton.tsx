'use client';

import { useTransition } from 'react';
import { deleteVoucher } from '@/app/actions';

export default function DeleteVoucherButton({ code }: { code: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`)) {
      startTransition(async () => {
        const result = await deleteVoucher(code);
        if (!result.success) {
          alert(result.error || 'Đã có lỗi xảy ra khi xóa.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[15px]">delete</span>
      Xóa
    </button>
  );
}
