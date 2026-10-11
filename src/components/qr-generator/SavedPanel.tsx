'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, Copy, Check, ExternalLink, Trash2, 
  RotateCcw, Inbox, AlertCircle, X
} from 'lucide-react';
import { 
  loadQrRecords, 
  deleteQrRecord, 
  clearAllRecords,
  formatDate 
} from '@/lib/qr-generator/autosave';
import { copyToClipboard } from '@/lib/qr-generator/exporter';
import { QR_TYPES } from '@/lib/qr-generator/constants';
import type { SavedQR } from '@/lib/qr-generator/types';

interface SavedPanelProps {
  onRestore: (record: SavedQR) => void;
  disabled?: boolean;
}

export default function SavedPanel({ onRestore, disabled = false }: SavedPanelProps) {
  const [records, setRecords] = useState<SavedQR[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // تحميل السجلات
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const loaded = loadQrRecords();
    setRecords(loaded);
  };

  // نسخ الرابط
  const handleCopy = async (record: SavedQR) => {
    const success = await copyToClipboard(record.url);
    if (success) {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // حذف سجل
  const handleDelete = (id: string) => {
    if (deleteQrRecord(id)) {
      loadRecords();
    }
  };

  // حذف الكل
  const handleClearAll = () => {
    if (clearAllRecords()) {
      setRecords([]);
      setShowClearConfirm(false);
    }
  };

  // حالة فارغة
  if (records.length === 0) {
    return (
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-6 md:p-8 text-center">
        <div className="text-6xl mb-4 opacity-30">📭</div>
        <h3 className="font-extrabold text-ink-900 text-base md:text-lg mb-2">
          لا توجد QRs محفوظة
        </h3>
        <p className="text-xs md:text-sm text-ink-500 font-bold max-w-md mx-auto">
          بعد إنشاء QR على الخادم، سيظهر هنا للرجوع إليه لاحقاً
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
      {/* الرأس */}
      <div className="p-4 bg-gradient-to-l from-ink-50 to-brand-50 border-b border-ink-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-ink-900 text-sm md:text-base flex items-center gap-2">
              <Inbox className="w-4 h-4 text-brand-500" />
              QRs المحفوظة
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-black">
                {records.length}
              </span>
            </h3>
            <p className="text-[10px] md:text-xs text-ink-500 font-bold mt-0.5">
              آخر {records.length} QR — محفوظة محلياً
            </p>
          </div>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={disabled}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              حذف الكل
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600">
                تأكيد الحذف؟
              </span>
              <button
                onClick={handleClearAll}
                className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold"
              >
                نعم
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 rounded bg-ink-200 hover:bg-ink-300 text-ink-700 text-[10px] font-bold"
              >
                لا
              </button>
            </div>
          )}
        </div>
      </div>

      {/* القائمة */}
      <div className="divide-y divide-ink-100 max-h-96 overflow-y-auto">
        {records.map((record) => {
          const typeInfo = QR_TYPES.find((t) => t.id === record.type);

          return (
            <div key={record.id} className="p-3 hover:bg-brand-50/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* الأيقونة */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0 text-xl">
                  {typeInfo?.icon || '🔲'}
                </div>

                {/* المعلومات */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-extrabold text-ink-900 text-sm truncate">
                      {record.name}
                    </p>
                    {typeInfo && (
                      <span className="text-[9px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-black flex-shrink-0">
                        {typeInfo.name}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-ink-500 font-mono break-all" dir="ltr">
                    {record.url}
                  </p>

                  <div className="flex items-center gap-1 mt-1 text-[10px] text-ink-400 font-bold">
                    <Clock className="w-3 h-3" />
                    {formatDate(record.createdAt)}
                  </div>
                </div>
              </div>

              {/* الإجراءات */}
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                <button
                  onClick={() => handleCopy(record)}
                  disabled={disabled}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    copiedId === record.id
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-white hover:bg-ink-50 text-ink-700 border-ink-200'
                  } disabled:opacity-50`}
                  title="نسخ الرابط"
                >
                  {copiedId === record.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  نسخ
                </button>

                <a
                  href={record.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white hover:bg-ink-50 text-ink-700 border border-ink-200 text-[10px] font-bold transition-all"
                  title="فتح"
                >
                  <ExternalLink className="w-3 h-3" />
                  فتح
                </a>

                <button
                  onClick={() => onRestore(record)}
                  disabled={disabled}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-[10px] font-bold transition-all disabled:opacity-50"
                  title="استرجاع"
                >
                  <RotateCcw className="w-3 h-3" />
                  استرجاع
                </button>

                <button
                  onClick={() => handleDelete(record.id)}
                  disabled={disabled}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold transition-all disabled:opacity-50"
                  title="حذف"
                >
                  <X className="w-3 h-3" />
                  حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* تذييل */}
      <div className="p-3 bg-ink-50 border-t border-ink-200 flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-ink-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-ink-500 font-bold leading-relaxed">
          هذه السجلات محفوظة في متصفحك فقط (LocalStorage). إذا حذفت بيانات المتصفح، ستفقد السجلات — لكن QR نفسه يعمل على الخادم للأبد.
        </p>
      </div>
    </div>
  );
}
