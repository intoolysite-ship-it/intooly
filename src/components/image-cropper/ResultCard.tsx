'use client';

// ============================================================
// 📊 بطاقة نتيجة القص
// ============================================================

import { useState } from 'react';
import {
  Download, Trash2, CheckCircle2, AlertCircle,
  Loader2, Eye, EyeOff,
} from 'lucide-react';
import type { ImageItem } from '@/lib/image-cropper/types';
import { formatBytes } from '@/lib/image-cropper/cropper';

// ============================================================
// 📝 الأنواع
// ============================================================

interface ResultCardProps {
  item: ImageItem;
  onDownload: () => void;
  onRemove: () => void;
}

// ============================================================
// 🎨 المكوّن الرئيسي
// ============================================================

export default function ResultCard({
  item,
  onDownload,
  onRemove,
}: ResultCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  const hasResult = item.status === 'done' && item.croppedUrl;

  // حساب التوفير
  const savings =
    item.info && item.croppedSize
      ? Math.round(
          ((item.info.size - item.croppedSize) / item.info.size) * 100
        )
      : 0;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">

      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-l from-slate-50 to-amber-50/30 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-lg">✂️</span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-black text-slate-900 text-sm truncate"
              title={item.name}
            >
              {item.name}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              {item.info && `${item.info.width}×${item.info.height}`}
              {item.info && ` · ${item.info.format}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
          title="حذف"
          aria-label="حذف"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* ============================================ */}
      {/* Body */}
      {/* ============================================ */}
      <div className="p-3">

        {/* Preview */}
        <div
          className="relative rounded-xl overflow-hidden bg-slate-900 mb-3"
          style={{ aspectRatio: 1 }}
        >
          {showComparison && item.croppedUrl && item.originalUrl ? (
            <ComparisonView
              beforeUrl={item.originalUrl}
              afterUrl={item.croppedUrl}
            />
          ) : (
            <>
              <img
                src={item.croppedUrl || item.originalUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* زر المقارنة */}
              {hasResult && (
                <button
                  type="button"
                  onClick={() => setShowComparison(true)}
                  className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-black flex items-center gap-1.5 hover:bg-black/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  مقارنة
                </button>
              )}

              {/* الحالة */}
              <div className="absolute top-2 right-2">
                {item.status === 'cropping' && (
                  <span className="px-3 py-1.5 rounded-full bg-blue-500/90 backdrop-blur-sm text-white text-xs font-black flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    جاري...
                  </span>
                )}
                {item.status === 'done' && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تم
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-xs font-black flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    خطأ
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* زر إغلاق المقارنة */}
        {showComparison && (
          <button
            type="button"
            onClick={() => setShowComparison(false)}
            className="w-full mb-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
            إغلاق المقارنة
          </button>
        )}

        {/* معلومات النتيجة */}
        {hasResult && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* الحجم */}
            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
              <p className="text-[10px] font-black text-slate-500 mb-0.5">
                الحجم
              </p>
              <p className="text-xs font-black text-slate-900">
                {formatBytes(item.info?.size || 0)}
                <span className="text-slate-400 mx-1">→</span>
                <span className="text-emerald-600">
                  {formatBytes(item.croppedSize || 0)}
                </span>
              </p>
            </div>

            {/* التوفير */}
            {savings !== 0 && (
              <div
                className={`rounded-lg p-2.5 text-center ${
                  savings > 0 ? 'bg-emerald-50' : 'bg-red-50'
                }`}
              >
                <p
                  className={`text-[10px] font-black mb-0.5 ${
                    savings > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {savings > 0 ? 'التوفير' : 'الزيادة'}
                </p>
                <p
                  className={`text-xs font-black ${
                    savings > 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {savings > 0 ? '↓' : '↑'} {Math.abs(savings)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* خطأ */}
        {item.status === 'error' && item.errorMessage && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-700 leading-relaxed">
              {item.errorMessage}
            </p>
          </div>
        )}

        {/* زر التحميل */}
        {hasResult && (
          <button
            type="button"
            onClick={onDownload}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            تحميل الصورة المقصوصة
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 👁️ مكوّن المقارنة قبل/بعد
// ============================================================

function ComparisonView({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [position, setPosition] = useState(50);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  };

  return (
    <div
      className="relative w-full h-full select-none cursor-ew-resize"
      onMouseMove={(e) => handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
        }
      }}
    >
      {/* After (المقصوصة) */}
      <img
        src={afterUrl}
        alt="بعد"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* Before (الأصلية) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt="قبل"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* الفاصل */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 shadow-2xl pointer-events-none z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white shadow-xl flex items-center justify-center">
          <span className="text-white font-black text-lg">⇔</span>
        </div>
      </div>

      {/* التسميات */}
      <span className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black">
        قبل
      </span>
      <span className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black">
        بعد
      </span>
    </div>
  );
}