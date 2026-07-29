'use client';

import { useState, useEffect } from 'react';

export default function CaiDatPage() {
  const [larkUrl, setLarkUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.lark_webhook_url) {
          setLarkUrl(res.data.lark_webhook_url);
          setSavedUrl(res.data.lark_webhook_url);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!larkUrl.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập URL webhook' });
      return;
    }
    if (!larkUrl.startsWith('https://open.larksuite.com/') && !larkUrl.startsWith('https://open.feishu.cn/')) {
      setMessage({ type: 'error', text: 'URL không hợp lệ. Phải bắt đầu bằng https://open.larksuite.com/ hoặc https://open.feishu.cn/' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lark_webhook_url: larkUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedUrl(larkUrl.trim());
        setMessage({ type: 'success', text: '✅ Đã lưu Lark Webhook URL thành công! Server sẽ dùng URL mới ngay lập tức.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Lưu thất bại' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Lỗi kết nối server' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    const urlToTest = savedUrl || larkUrl;
    if (!urlToTest.trim()) {
      setMessage({ type: 'error', text: 'Chưa có URL để test. Hãy lưu URL trước.' });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const vnTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
        .toISOString().replace('T', ' ').substring(0, 19);
      const res = await fetch(urlToTest, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          msg_type: 'text',
          content: { text: `🔔 Test thông báo từ AIZEN Admin\n⏰ Thời gian: ${vnTime}\n✅ Webhook kết nối thành công!` },
        }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Gửi test thành công! Kiểm tra nhóm Lark của bạn.' });
      } else {
        setMessage({ type: 'error', text: `❌ Webhook trả lỗi HTTP ${res.status}. Kiểm tra lại URL.` });
      }
    } catch {
      setMessage({ type: 'error', text: '❌ Không kết nối được tới Lark. Kiểm tra lại URL.' });
    } finally {
      setTesting(false);
    }
  }

  const isDirty = larkUrl !== savedUrl;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Cài đặt hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý các cấu hình thông báo và tích hợp</p>
      </div>

      {/* Lark Webhook Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Lark Webhook Thông Báo</h2>
            <p className="text-xs text-gray-400">Nhận thông báo đăng ký khóa học & yêu cầu tài liệu</p>
          </div>
          {savedUrl && (
            <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Đang hoạt động
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Lark Webhook URL
            </label>
            <input
              type="url"
              value={larkUrl}
              onChange={(e) => setLarkUrl(e.target.value)}
              placeholder="https://open.larksuite.com/open-apis/bot/v2/hook/..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Tạo Incoming Webhook trong nhóm Lark → Thêm ứng dụng → Custom Bot
            </p>
          </div>

          {savedUrl && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span className="truncate">URL đang dùng: <span className="font-mono text-gray-600">{savedUrl.substring(0, 60)}...</span></span>
            </div>
          )}

          {message && (
            <div className={`flex items-start gap-2 text-sm px-3 py-2.5 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isDirty ? 'Lưu URL mới' : 'Đã lưu'}
                </>
              )}
            </button>

            <button
              onClick={handleTest}
              disabled={testing || !savedUrl}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-600 text-sm font-medium rounded-lg transition-colors"
            >
              {testing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang gửi test...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Gửi Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hướng dẫn */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-2">📋 Hướng dẫn lấy Lark Webhook URL</p>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>Mở nhóm Lark muốn nhận thông báo</li>
          <li>Nhấn icon <strong>⚙️ Cài đặt</strong> → <strong>Bots</strong> → <strong>Thêm Bot</strong></li>
          <li>Chọn <strong>Custom Bot</strong> → nhập tên → Thêm</li>
          <li>Copy <strong>Webhook URL</strong> và dán vào ô trên</li>
        </ol>
      </div>
    </div>
  );
}
