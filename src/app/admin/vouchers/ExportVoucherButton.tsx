'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { VoucherPDFDocument } from './VoucherPDF';

interface Voucher {
  code: string;
  discount_percent: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  applicable_package: string;
}

interface ExportVoucherButtonProps {
  voucher: Voucher;
}

export default function ExportVoucherButton({ voucher }: ExportVoucherButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Construct the absolute path of the logo for react-pdf loading
      const logoUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/logo2.png` 
        : '/logo2.png';

      // Dynamically render PDF to Blob
      const doc = <VoucherPDFDocument voucher={voucher} logoUrl={logoUrl} />;
      const blob = await pdf(doc).toBlob();
      
      // Create Object URL and download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Voucher_${voucher.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate voucher PDF:', error);
      alert('Đã xảy ra lỗi khi tạo file PDF. Vui lòng thử lại!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={isGenerating}
      title="Xuất PDF"
      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <svg className="animate-spin h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <Download className="w-4 h-4" />
      )}
    </button>
  );
}
