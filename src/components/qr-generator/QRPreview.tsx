'use client';

import { useEffect, useState } from 'react';
import { Download, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { generateQrDataUrl, generateQrSvg, buildQRContent } from '@/lib/qr-generator/generators';
import { exportPng, exportSvg, copyQrImage } from '@/lib/qr-generator/exporter';
import type { QRData, QRType, QRSettings } from '@/lib/qr-generator/types';
import { QR_MESSAGES } from '@/lib/qr-generator/constants';

interface QRPreviewProps {
  type: QRType;
  data: QRData;
  settings: QRSettings;
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
}

export default function QRPreview({
  type,
  data,
  settings,
  size = 'md',
  showActions = true,
}: QRPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // تحديد الأبعاد حسب الحجم
  const sizeMap = {
    sm: { width: 180, class: 'max-w-[180px]' },
    md: { width: 280, class: 'max-w-[280px]' },
    lg: { width: 400, class: 'max-w-[400px]' },
  };

  const currentSize = sizeMap[size];

  // توليد المعاينة عند تغيير البيانات
  useEffect(() => {
    let cancelled = false;

    async function updatePreview() {
      try {
        const content = buildQRContent(type, data);

        if (!content || content.trim().length === 0) {
          setPreviewUrl(null);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        const dataUrl = await generateQrDataUrl(content, {
          ...settings,
          size: currentSize.width,
        });

        if (!cancelled) {
          setPreviewUrl(dataUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : QR_MESSAGES.ERROR);
          setPreviewUrl(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // تأخير بسيط لتجنب الطلبات المتكررة
    const timer = setTimeout(updatePreview, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [type, data, settings, currentSize.width]);

  // تحميل PNG
  const handleDownloadPng = async () => {
    try {
      const content = buildQRContent(type, data);
      await exportPng(content, settings, `intooly-qr-${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التحميل');
    }
  };

  // تحميل SVG
  const handleDownloadSvg = async () => {
    try {
      const content = buildQRContent(type, data);
      await exportSvg(content, settings, `intooly-qr-${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التحميل');
    }
  };

  // نسخ الصورة
  const handleCopy = async () => {
    try {
      const content = buildQRContent(type, data);
      const success = await copyQrImage(content, settings);

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError('فشل النسخ — جرب التحميل');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل النسخ');
    }
  };

  // حالة فارغة
  const isEmpty = !previewUrl && !loading && !error;

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-6">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-ink-900 text-base">
          👁️ المعاينة المباشرة
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-ink-500 font-bold">
            <Loader2 className="w-3 h-3 animate-spin" />
            جاري التحديث...
          </div>
        )}
      </div>

      {/* منطقة المعاينة */}
      <div className="flex items-center justify-center min-h-[280px] bg-gradient-to-br from-ink-50 to-brand-50 rounded-xl p-4 relative overflow-hidden">

        {/* حالة التحميل */}
        {loading && !previewUrl && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-sm text-ink-500 font-bold">جاري توليد QR...</p>
          </div>
        )}

        {/* حالة فارغة */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="text-5xl opacity-40">🔲</div>
            <p className="text-sm text-ink-500 font-bold">
              ابدأ بإدخال البيانات
            </p>
            <p className="text-xs text-ink-400">
              سيظهر QR هنا مباشرة
            </p>
          </div>
        )}

        {/* معاينة QR */}
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="QR Code Preview"
              className={`${currentSize.class} w-full rounded-lg shadow-lg`}
              style={{
                imageRendering: 'pixelated',
              }}
            />
          </div>
        )}
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* الأزرار */}
      {showActions && previewUrl && (
        <div className="mt-4 space-y-2">
          {/* الصف 1: تحميل */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadPng}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-l from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-lg text-sm transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>

            <button
              onClick={handleDownloadSvg}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-lg text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              SVG
            </button>
          </div>

          {/* الصف 2: نسخ */}
          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
              copied
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-white hover:bg-ink-50 text-ink-700 border-ink-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                نسخ الصورة
              </>
            )}
          </button>

          {/* معلومات */}
          <div className="pt-2 border-t border-ink-100">
            <div className="flex items-center justify-between text-xs text-ink-500 font-bold">
              <span>الحجم: {settings.size}×{settings.size}</span>
              <span>تصحيح: {settings.errorCorrection}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
