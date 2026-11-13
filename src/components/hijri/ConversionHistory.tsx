'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, Trash2, Copy, Check, ArrowRight } from 'lucide-react';
import { HIJRI_MONTHS, GREGORIAN_MONTHS } from '@/lib/hijri/convert';

export interface HistoryEntry {
  id: string;
  direction: 'hijri-to-gregorian' | 'gregorian-to-hijri';
  hijriText: string;
  gregorianText: string;
  timestamp: number;
}

const STORAGE_KEY = 'intooly-hijri-history';
const MAX_ENTRIES = 10;

export default function ConversionHistory({
  onSelect,
}: {
  onSelect?: (entry: HistoryEntry) => void;
}) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // تحميل السجل من localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reload = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setEntries(JSON.parse(saved));
      } catch (e) { console.warn(e); }
    };
    window.addEventListener('hijri-history-updated', reload);
    return () => window.removeEventListener('hijri-history-updated', reload);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('فشل تحميل السجل:', e);
    }
    setLoaded(true);
  }, []);

  // حفظ السجل عند التغيير
  const saveHistory = useCallback((newEntries: HistoryEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.warn('فشل حفظ السجل:', e);
    }
  }, []);

  const clearHistory = () => {
    if (confirm('هل تريد حذف كل سجل التحويلات؟')) {
      saveHistory([]);
    }
  };

  const removeEntry = (id: string) => {
    saveHistory(entries.filter(e => e.id !== id));
  };

  const copyEntry = (entry: HistoryEntry) => {
    const text = `${entry.hijriText} = ${entry.gregorianText}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-purple-900">
          <History size={18} className="text-purple-600" />
          <h3 className="font-bold text-sm">سجل آخر التحويلات</h3>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full font-bold">{entries.length}</span>
        </div>
        {entries.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
          >
            <Trash2 size={12} /> مسح الكل
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          لا توجد تحويلات محفوظة بعد. سيتم حفظ آخر 10 تحويلات تلقائياً.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl p-3 border border-purple-100 hover:border-purple-300 transition group"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-slate-400 font-mono">{formatTime(entry.timestamp)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => copyEntry(entry)}
                    className="p-1 rounded hover:bg-purple-100 text-purple-600"
                    title="نسخ"
                  >
                    {copiedId === entry.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(entry)}
                      className="p-1 rounded hover:bg-purple-100 text-purple-600"
                      title="استخدام هذا التاريخ"
                    >
                      <ArrowRight size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="حذف"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold">{entry.hijriText}</span>
                <span className="mx-1 text-slate-400">=</span>
                <span className="font-bold">{entry.gregorianText}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// دالة مساعدة لحفظ تحويل جديد (تُستخدم من الصفحة الرئيسية)
export function saveConversion(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const existing: HistoryEntry[] = saved ? JSON.parse(saved) : [];
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // إطلاق حدث ليتمكن المكون من التحديث
    window.dispatchEvent(new CustomEvent('hijri-history-updated'));
  } catch (e) {
    console.warn('فشل حفظ التحويل:', e);
  }
}