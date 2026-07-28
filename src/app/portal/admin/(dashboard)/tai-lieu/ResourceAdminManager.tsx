'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ResourceConfigItem,
  ResourceAccessRequest,
  getResourcesAction,
  saveResourceAction,
  deleteResourceAction,
  getAvailableCourseOptionsAction,
  getResourceAccessRequestsAction,
  updateResourceAccessRequestStatusAction,
  deleteResourceAccessRequestAction,
  uploadResourceCoverImageAction,
} from '@/app/actions';

// Professional SVG Icons
const Icons = {
  Folder: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.063c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  Academic: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  Zap: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
};

export default function ResourceAdminManager({ initialData }: { initialData: ResourceConfigItem[] }) {
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');
  const [resources, setResources] = useState<ResourceConfigItem[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceConfigItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Flow Resource / Custom Cover Mode State
  const [coverMode, setCoverMode] = useState<'course' | 'custom'>('course');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Access Requests State
  const [requests, setRequests] = useState<ResourceAccessRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [courseOptions, setCourseOptions] = useState<Array<{ title: string; cover_image: string }>>([
    { title: 'Làm chủ Claude AI (Khóa 3 mới nhất)', cover_image: '/claudeKhoa3moi.jpg' },
    { title: 'Làm chủ Claude AI (Khóa 1 & 2)', cover_image: '/khoa3.jpg' },
    { title: 'AI Sale & Marketing Fullstack', cover_image: '/fullstack.jpg' },
    { title: 'Claude AI Trợ Lý Tự Động', cover_image: '/Lam_chu_claude_ai.jpg' },
  ]);

  useEffect(() => {
    getAvailableCourseOptionsAction().then((opts) => {
      if (opts && opts.length > 0) {
        setCourseOptions(opts);
      }
    });
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoadingRequests(true);
    const list = await getResourceAccessRequestsAction();
    setRequests(list);
    setLoadingRequests(false);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<ResourceConfigItem>>({
    id: '',
    title: '',
    description: '',
    category: 'Làm chủ Claude AI (Khóa 1 & 2)',
    course_origin: '',
    cover_image: '',
    file_type: 'pdf',
    file_type_label: 'Google Drive PDF',
    drive_url: '',
    tags: [],
    course_cta_text: '',
    course_cta_link: '',
    course_cta_badge: '',
    is_popular: false,
    is_active: true,
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCoverMode('course');
    setFormData({
      id: `resource-${Date.now()}`,
      title: '',
      description: '',
      category: 'Làm chủ Claude AI (Khóa 1 & 2)',
      course_origin: '🎓 Khóa 1 & 2 (150+ Học viên)',
      cover_image: courseOptions[0]?.cover_image || '/claudeKhoa3moi.jpg',
      file_type: 'pdf',
      file_type_label: 'Google Drive PDF',
      drive_url: '',
      tags: [],
      course_cta_text: '',
      course_cta_link: '',
      course_cta_badge: '',
      is_popular: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ResourceConfigItem) => {
    setEditingItem(item);
    setFormData(item);
    // Dynamic check if cover_image belongs to courseOptions or custom
    const isCourseCover = courseOptions.some((opt) => opt.cover_image === item.cover_image);
    setCoverMode(isCourseCover ? 'course' : 'custom');
    setIsModalOpen(true);
  };

  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadResourceCoverImageAction(fd);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, cover_image: res.url }));
      } else {
        alert((res as any).error || (res as any).message || 'Lỗi khi tải ảnh lên.');
      }
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + (err?.message || 'Có lỗi xảy ra'));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ tiêu đề tài liệu.' });
      return;
    }

    setIsSaving(true);
    const payload: ResourceConfigItem = {
      id: formData.id || `resource-${Date.now()}`,
      title: formData.title || '',
      description: formData.description || '',
      category: formData.category || 'Tất cả',
      course_origin: formData.course_origin || '',
      cover_image: formData.cover_image || '/claudeKhoa3moi.jpg',
      file_type: formData.file_type || 'pdf',
      file_type_label: formData.file_type_label || 'Google Drive PDF',
      drive_url: formData.drive_url || '',
      tags: Array.isArray(formData.tags) ? formData.tags : String(formData.tags || '').split(',').map((t) => t.trim()),
      course_cta_text: formData.course_cta_text || 'Xem chi tiết khóa học',
      course_cta_link: formData.course_cta_link || '/portal/courses',
      course_cta_badge: formData.course_cta_badge || '🔥 KHÓA HỌC HOT',
      is_popular: !!formData.is_popular,
      is_active: formData.is_active !== false,
    };

    const res = await saveResourceAction(payload);
    setIsSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setIsModalOpen(false);
      const updated = await getResourcesAction();
      setResources(updated);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    const res = await deleteResourceAction(id);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      const updated = await getResourcesAction();
      setResources(updated);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  // Request handlers
  const handleCopyEmail = (email: string, reqId: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(reqId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleRequestStatus = async (id: string, currentStatus: 'pending' | 'approved') => {
    const newStatus = currentStatus === 'pending' ? 'approved' : 'pending';
    const res = await updateResourceAccessRequestStatusAction(id, newStatus);
    if (res.success) {
      loadRequests();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return;
    const res = await deleteResourceAccessRequestAction(id);
    if (res.success) {
      loadRequests();
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'pending') return r.status === 'pending';
    if (requestFilter === 'approved') return r.status === 'approved';
    return true;
  });

  const handleToggleActive = async (item: ResourceConfigItem) => {
    const updatedStatus = item.is_active === false ? true : false;
    const updatedItem = { ...item, is_active: updatedStatus };

    setResources((prev) => prev.map((r) => (r.id === item.id ? updatedItem : r)));

    const res = await saveResourceAction(updatedItem);
    if (!res.success) {
      alert(res.message || 'Có lỗi xảy ra khi cập nhật trạng thái.');
      setResources((prev) => prev.map((r) => (r.id === item.id ? item : r)));
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Icons.Folder />
            <span>Quản Lý Kho Tài Nguyên AIZEN</span>
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Quản lý tài liệu theo khóa học & tài liệu luồng, danh sách Gmail đăng ký cấp quyền Google Drive
          </p>
        </div>

        {activeTab === 'resources' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Icons.Plus />
            <span>Thêm Tài Liệu Mới</span>
          </button>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Icons.Folder />
          <span>Kho Tài Liệu ({resources.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Icons.Mail />
          <span>Yêu Cầu Cấp Quyền Gmail ({requests.length})</span>
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: RESOURCES TABLE */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Ảnh bìa</th>
                  <th className="px-4 py-3.5">Tên tài liệu &amp; Mô tả</th>
                  <th className="px-4 py-3.5">Khóa học nguồn (Social Proof)</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                      Chưa có tài liệu nào. Bấm nút &quot;+ Thêm Tài Liệu Mới&quot; để tạo.
                    </td>
                  </tr>
                ) : (
                  resources.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Cover Image Thumbnail */}
                      <td className="px-4 py-3.5">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                          <Image
                            src={item.cover_image || '/claudeKhoa3moi.jpg'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-extrabold text-slate-900 leading-snug line-clamp-2">{item.title}</p>
                        <span className="inline-block text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200/80">
                          {item.category}
                        </span>
                      </td>

                      {/* Course Origin Badge */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200/80 max-w-[160px] truncate">
                          {item.course_origin}
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                            item.is_active !== false
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                          title="Bấm để Ẩn hoặc Hiện tài liệu trên trang công khai"
                        >
                          {item.is_active !== false ? (
                            <>
                              <Icons.Eye />
                              <span>Đang Hiện</span>
                            </>
                          ) : (
                            <>
                              <Icons.EyeOff />
                              <span>Đã Ẩn</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Icons.Edit />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[11px] border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Icons.Trash />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GMAIL REQUESTS TABLE */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls & Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRequestFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  requestFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Tất cả ({requests.length})</span>
              </button>
              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  requestFilter === 'pending'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icons.Clock />
                <span>Chờ cấp quyền ({pendingCount})</span>
              </button>
              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  requestFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icons.CheckCircle />
                <span>Đã cấp quyền ({requests.length - pendingCount})</span>
              </button>
            </div>
            <button
              onClick={loadRequests}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Icons.Refresh />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>

          {/* Requests Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Gmail Học viên</th>
                    <th className="px-4 py-3.5">Tài liệu yêu cầu</th>
                    <th className="px-4 py-3.5">Thời gian gửi</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right">Thao tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRequests ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                        Đang tải danh sách yêu cầu từ Server...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold">
                        Chưa có yêu cầu cấp quyền Gmail nào trong danh mục này.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Gmail + Quick Copy Button */}
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{req.user_email}</span>
                            <button
                              onClick={() => handleCopyEmail(req.user_email, req.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
                              title="Bấm để Copy Email dán vào Google Drive share settings"
                            >
                              {copiedId === req.id ? (
                                <>
                                  <Icons.Check />
                                  <span>Đã copy!</span>
                                </>
                              ) : (
                                <>
                                  <Icons.Copy />
                                  <span>Copy Gmail</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Document Title */}
                        <td className="px-4 py-3.5 max-w-xs font-semibold text-slate-800">
                          <p className="line-clamp-1">{req.resource_title}</p>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                          {req.created_at ? new Date(req.created_at).toLocaleString('vi-VN') : 'Mới vừa gửi'}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {req.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Icons.CheckCircle />
                              <span>Đã thêm vô Drive</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                              <Icons.Clock />
                              <span>Chờ Admin thêm Gmail</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleRequestStatus(req.id, req.status)}
                            className={`px-3 py-1 font-bold rounded-lg text-[11px] border transition-all cursor-pointer inline-flex items-center gap-1 ${
                              req.status === 'approved'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm'
                            }`}
                          >
                            {req.status === 'approved' ? (
                              <>
                                <Icons.Clock />
                                <span>Đánh dấu chưa thêm</span>
                              </>
                            ) : (
                              <>
                                <Icons.Check />
                                <span>Đánh dấu đã thêm</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[11px] border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Icons.Trash />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full text-slate-900 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-amber-600 flex items-center gap-2">
                {editingItem ? <Icons.Edit /> : <Icons.Plus />}
                <span>{editingItem ? 'Cập Nhật Tài Liệu' : 'Thêm Tài Liệu Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Resource Mode Switcher */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setCoverMode('course');
                    if (!courseOptions.some((opt) => opt.cover_image === formData.cover_image)) {
                      setFormData((prev) => ({
                        ...prev,
                        cover_image: courseOptions[0]?.cover_image || '/claudeKhoa3moi.jpg',
                      }));
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    coverMode === 'course'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <Icons.Academic />
                  <span>Tài Liệu Theo Khóa Học</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCoverMode('custom');
                    if (!formData.course_origin) {
                      setFormData((prev) => ({ ...prev, course_origin: '⚡ Tài liệu luồng AIZEN' }));
                    }
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    coverMode === 'custom'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <Icons.Zap />
                  <span>Tài Liệu Luồng (Ảnh Bìa Tự Chọn)</span>
                </button>
              </div>

              {/* Cover Image Selection Section */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {coverMode === 'course' ? 'Chọn Ảnh Bìa Khóa Học (*)' : 'Ảnh Bìa Tài Liệu Luồng (*)'}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-sm">
                    <Image
                      src={formData.cover_image || '/claudeKhoa3moi.jpg'}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {coverMode === 'course' ? (
                      <select
                        value={formData.cover_image || courseOptions[0]?.cover_image || '/claudeKhoa3moi.jpg'}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                        className="w-full bg-white border border-slate-300 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs outline-none transition-all cursor-pointer shadow-sm"
                      >
                        {courseOptions.map((opt) => (
                          <option key={opt.cover_image + opt.title} value={opt.cover_image}>
                            {opt.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-3 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5">
                          <Icons.Upload />
                          <span>{isUploadingCover ? 'Đang tải ảnh lên Supabase...' : 'Tải Ảnh Tải Lên Từ Máy Tính'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadCoverImage}
                            disabled={isUploadingCover}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề tài liệu (*)</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="VD: Slide Bài Giảng Claude AI Khóa 1"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục tab (*)</label>
                  <select
                    value={formData.category || 'Làm chủ Claude AI (Khóa 1 & 2)'}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="Làm chủ Claude AI (Khóa 1 & 2)">Làm chủ Claude AI (Khóa 1 &amp; 2)</option>
                    <option value="AI Sale & Marketing Fullstack">AI Sale &amp; Marketing Fullstack</option>
                    <option value="Slide & Ebook">Slide &amp; Ebook</option>
                    <option value="Template & Cheat Sheet">Template &amp; Cheat Sheet</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả tóm tắt nội dung tài liệu..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Course Origin Badge */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Khóa học nguồn (Social Proof)</label>
                <input
                  type="text"
                  value={formData.course_origin || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, course_origin: e.target.value }))}
                  placeholder="VD: 🎓 Khóa 1 & 2 (150+ Học viên)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
                <input
                  type="text"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value as any }))}
                  placeholder="Claude AI, Slide bài giảng"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Active Status Checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="is_active_checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="is_active_checkbox" className="font-bold text-slate-800 cursor-pointer select-none text-xs flex items-center gap-1.5">
                  <Icons.Eye />
                  <span>Hiển thị tài liệu này công khai trên trang Kho Tài Nguyên</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isSaving ? '⏳ Đang lưu...' : editingItem ? 'Cập Nhật Tài Liệu' : 'Tạo Tài Liệu Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
