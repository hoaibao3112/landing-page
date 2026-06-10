'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateVoucher } from '@/app/actions';

interface Voucher {
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  applicable_package: string;
}

interface EditVoucherModalProps {
  voucher: Voucher;
}

const formatDbDateForDatetimeLocal = (dbDateStr: string) => {
  if (!dbDateStr) return '';
  return dbDateStr.replace(' ', 'T').substring(0, 16);
};

export default function EditVoucherModal({ voucher }: EditVoucherModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateVoucher(voucher.code, formData);
      if (result.success) {
        setSuccess(result.message || 'Cập nhật voucher thành công.');
        setTimeout(() => {
          setOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error || 'Đã có lỗi xảy ra.');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[15px]">edit</span>
        Sửa
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative text-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-600">close</span>
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-6">Chỉnh sửa Voucher</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mã Code *</label>
                <input
                  type="text"
                  name="code"
                  defaultValue={voucher.code}
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mức giảm (%) *</label>
                  <input
                    type="number"
                    name="discount_percent"
                    min="1"
                    max="100"
                    defaultValue={voucher.discount_percent}
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đã dùng *</label>
                  <input
                    type="number"
                    name="used_count"
                    min="0"
                    defaultValue={voucher.used_count}
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tối đa *</label>
                  <input
                    type="number"
                    name="max_uses"
                    min="1"
                    defaultValue={voucher.max_uses}
                    required
                    disabled={isPending}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gói áp dụng *</label>
                <select
                  name="applicable_package"
                  defaultValue={voucher.applicable_package}
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] bg-white font-medium cursor-pointer"
                >
                  <option value="1 người">Gói 1 người (1.300.000đ)</option>
                  <option value="Nhóm 2 người">Nhóm 2 người (2.200.000đ)</option>
                  <option value="Nhóm 4 người">Nhóm 4 người (3.960.000đ)</option>
                  <option value="Early Bird">Early Bird (950.000đ)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hạn sử dụng *</label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  defaultValue={formatDbDateForDatetimeLocal(voucher.expires_at)}
                  required
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a7a5e]/20 focus:border-[#1a7a5e] font-medium cursor-pointer"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
