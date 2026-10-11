'use client';

import { useState } from 'react';
import { 
  Download, Copy, Check, Share2, 
  FileText, FileImage, FileCode, Printer,
  MessageCircle, Mail, Cloud, Loader2,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  exportPng, 
  exportSvg, 
  exportJson, 
  exportPdf,
  copyToClipboard,
  copyQrImage 
} from '@/lib/qr-generator/exporter';
import { buildQRContent } from '@/lib/qr-generator/generators';
import { createQr } from '@/lib/qr-generator/api';
import { getPublicUrl } from '@/lib/qr-generator/api';
import { saveQrRecord } from '@/lib/qr-generator/autosave';
import { QR_MESSAGES } from '@/lib/qr-generator/constants';
import type { QRData, QRType, QRSettings, SavedQR } from '@/lib/qr-generator/types';

interface ExportPanelProps {
  type: QRType;
  data: QRData;
  settings: QRSettings;
  disabled?: boolean;
}

type ExportFormat = 'png' | 'svg' | 'pdf' | 'json';

export default function ExportPanel({
  type,
  data,
  settings,
  disabled = false,
}: ExportPanelProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<SavedQR | null>(null);
  const [error, setError] = useState<string | null>(null);

  const content = buildQRContent(type, data);
  const hasContent = content.trim().length > 0;

  // ============================================
  // Export Handlers
  // ============================================

  const handleExport = async (format: ExportFormat) => {
    if (!hasContent) {
      setError('الرجاء إدخال البيانات أولاً');
      return;
    }

    setActiveAction(format);
    setError(null);

    try {
      const filename = `intooly-qr-${type}-${Date.now()}`;

      switch (format) {
        case 'png':
          await exportPng(content, settings, filename);
          break;
        case 'svg':
          await exportSvg(content, settings, filename);
          break;
        case 'pdf':
          await exportPdf(content, settings, filename);
          break;
        case 'json':
          exportJson(type, data, filename);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التصدير');
    } finally {
      setTimeout(() => setActiveAction(null), 1000);
    }
  };

  // ============================================
  // Copy Handlers
  // ============================================

  const handleCopyText = async () => {
    if (!hasContent) return;

    const success = await copyToClipboard(content);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      setError('فشل النسخ');
    }
  };

  const handleCopyImage = async () => {
    if (!hasContent) return;

    const success = await copyQrImage(content, settings);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } else {
      setError('فشل نسخ الصورة — جرب التحميل');
    }
  };

  // ============================================
  // Share Handlers
  // ============================================

  const getShareUrl = (): string => {
    if (createdRecord) {
      return createdRecord.url;
    }
    return content;
  };

  const handleShare = (platform: 'whatsapp' | 'twitter' | 'email') => {
    const shareUrl = getShareUrl();
    const text = `QR Code من intooly: ${shareUrl}`;

    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('QR Code')}&body=${encodeURIComponent(text)}`;
        break;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ============================================
  // Create QR on Server
  // ============================================

  const handleCreateOnServer = async () => {
    if (!hasContent) {
      setError('الرجاء إدخال البيانات أولاً');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await createQr(type, data);

      const savedRecord: SavedQR = {
        id: response.id,
        apiKey: response.apiKey,
        type,
        name: data.name || data.title || 'QR Code',
        url: response.url,
        createdAt: response.createdAt,
        data,
      };

      saveQrRecord(savedRecord);
      setCreatedRecord(savedRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!createdRecord) return;

    const success = await copyToClipboard(createdRecord.url);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // ============================================
  // Render
  // ============================================

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 md:p-6 space-y-4">
      {/* العنوان */}
      <div>
        <h3 className="font-extrabold text-ink-900 text-base md:text-lg flex items-center gap-2">
          📥 التصدير والمشاركة
        </h3>
        <p className="text-xs md:text-sm text-ink-500 font-bold mt-1">
          حمّل، انسخ، أو شارك QR
        </p>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* التصدير */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-ink-700 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          التحميل
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ExportButton
            icon={<FileImage className="w-4 h-4" />}
            label="PNG"
            onClick={() => handleExport('png')}
            loading={activeAction === 'png'}
            disabled={disabled || !hasContent}
            primary
          />
          <ExportButton
            icon={<FileCode className="w-4 h-4" />}
            label="SVG"
            onClick={() => handleExport('svg')}
            loading={activeAction === 'svg'}
            disabled={disabled || !hasContent}
          />
          <ExportButton
            icon={<Printer className="w-4 h-4" />}
            label="PDF"
            onClick={() => handleExport('pdf')}
            loading={activeAction === 'pdf'}
            disabled={disabled || !hasContent}
          />
          <ExportButton
            icon={<FileText className="w-4 h-4" />}
            label="JSON"
            onClick={() => handleExport('json')}
            loading={activeAction === 'json'}
            disabled={disabled || !hasContent}
          />
        </div>
      </div>

      {/* النسخ */}
      <div className="space-y-2 pt-3 border-t border-ink-100">
        <p className="text-xs font-extrabold text-ink-700 flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          النسخ
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyText}
            disabled={disabled || !hasContent}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border-2 ${
              copiedText
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-white hover:bg-ink-50 text-ink-700 border-ink-200'
            } disabled:opacity-50`}
          >
            {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedText ? 'تم!' : 'نسخ النص'}
          </button>

          <button
            onClick={handleCopyImage}
            disabled={disabled || !hasContent}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border-2 ${
              copiedImage
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-white hover:bg-ink-50 text-ink-700 border-ink-200'
            } disabled:opacity-50`}
          >
            {copiedImage ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedImage ? 'تم!' : 'نسخ الصورة'}
          </button>
        </div>
      </div>

      {/* المشاركة */}
      <div className="space-y-2 pt-3 border-t border-ink-100">
        <p className="text-xs font-extrabold text-ink-700 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          المشاركة
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleShare('whatsapp')}
            disabled={disabled}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-200 text-xs font-bold transition-all disabled:opacity-50"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            واتساب
          </button>
          <button
            onClick={() => handleShare('twitter')}
            disabled={disabled}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-sky-200 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Twitter
          </button>
          <button
            onClick={() => handleShare('email')}
            disabled={disabled}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-ink-50 hover:bg-ink-100 text-ink-700 border-2 border-ink-200 text-xs font-bold transition-all disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" />
            بريد
          </button>
        </div>
      </div>

      {/* إنشاء QR على الخادم */}
      <div className="space-y-2 pt-3 border-t border-ink-100">
        <p className="text-xs font-extrabold text-ink-700 flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5" />
          رابط دائم (يُحفظ على الخادم)
        </p>

        {!createdRecord && (
          <button
            onClick={handleCreateOnServer}
            disabled={disabled || creating || !hasContent}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-l from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black text-sm transition-all shadow-md"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                إنشاء QR دائم
              </>
            )}
          </button>
        )}

        {createdRecord && (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-green-800 mb-1">
                  ✅ تم الإنشاء بنجاح!
                </p>
                <p className="text-[10px] text-green-700 font-mono break-all" dir="ltr">
                  {createdRecord.url}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyUrl}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border-2 ${
                copiedText
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-white hover:bg-ink-50 text-ink-700 border-ink-200'
              }`}
            >
              {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedText ? 'تم النسخ!' : 'نسخ الرابط'}
            </button>

            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-[10px] text-amber-800 font-bold">
                🔑 احفظ مفتاح API للعودة لاحقاً: 
              </p>
              <p className="text-[10px] text-amber-900 font-mono break-all mt-1" dir="ltr">
                {createdRecord.apiKey}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Helper Component
// ============================================

interface ExportButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  primary?: boolean;
}

function ExportButton({ icon, label, onClick, loading, disabled, primary }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all
        ${
          primary
            ? 'bg-gradient-to-l from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-md'
            : 'bg-white hover:bg-ink-50 text-ink-700 border-2 border-ink-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {loading ? '...' : label}
    </button>
  );
}


