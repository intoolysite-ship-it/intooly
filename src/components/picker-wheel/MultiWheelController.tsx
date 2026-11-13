'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Pencil, Check } from 'lucide-react';
import type { WheelOption, SavedWheel, WheelSettings } from '@/lib/picker-wheel/types';
import { DEFAULT_OPTIONS, DEFAULT_WHEEL_SETTINGS } from '@/lib/picker-wheel/constants';
import { getAllWheels, saveWheel, deleteWheel } from '@/lib/picker-wheel/storage';
import WheelController from './WheelController';

interface WheelTab {
  id: string;
  name: string;
  options: WheelOption[];
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `wheel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const createNewWheel = (name: string): WheelTab => ({
  id: createId(),
  name,
  options: DEFAULT_OPTIONS.map((opt, i) => ({ ...opt, id: `${createId()}-${i}` })),
});

export default function MultiWheelController() {
  const [wheels, setWheels] = useState<WheelTab[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // تحميل العجلات من IndexedDB عند البدء
  useEffect(() => {
    if (typeof window === 'undefined') return;
    getAllWheels()
      .then((saved) => {
        if (saved.length > 0) {
          const tabs: WheelTab[] = saved.map((w) => ({
            id: w.id,
            name: w.name,
            options: w.options && w.options.length >= 2 ? w.options : DEFAULT_OPTIONS,
          }));
          setWheels(tabs);
          setActiveId(tabs[0].id);
        } else {
          // إنشاء عجلة افتراضية
          const first = createNewWheel('العجلة 1');
          setWheels([first]);
          setActiveId(first.id);
        }
      })
      .catch(() => {
        const first = createNewWheel('العجلة 1');
        setWheels([first]);
        setActiveId(first.id);
      })
      .finally(() => setLoaded(true));
  }, []);

  // حفظ العجلة النشطة عند التغيير
  const persistWheel = useCallback(async (tab: WheelTab) => {
    try {
      const settings: WheelSettings = { ...DEFAULT_WHEEL_SETTINGS };
      const saved: SavedWheel = {
        id: tab.id,
        name: tab.name,
        options: tab.options,
        settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveWheel(saved);
    } catch (e) {
      console.warn('فشل حفظ العجلة', e);
    }
  }, []);

  // تحديث خيارات العجلة النشطة
  const handleOptionsChange = useCallback((options: WheelOption[]) => {
    setWheels((prev) => {
      const updated = prev.map((w) => (w.id === activeId ? { ...w, options } : w));
      // حفظ تلقائي
      const current = updated.find((w) => w.id === activeId);
      if (current) {
        persistWheel(current);
      }
      return updated;
    });
  }, [activeId, persistWheel]);

  // إضافة عجلة جديدة
  const addWheel = () => {
    if (wheels.length >= 5) {
      showToast('الحد الأقصى 5 عجلات', 'error');
      return;
    }
    const newWheel = createNewWheel(`العجلة ${wheels.length + 1}`);
    setWheels((prev) => [...prev, newWheel]);
    setActiveId(newWheel.id);
    showToast(`✅ تم إنشاء "${newWheel.name}"`, 'success');
  };

  // حذف عجلة
  const removeWheel = async (id: string) => {
    if (wheels.length <= 1) {
      showToast('يجب الاحتفاظ بعجلة واحدة على الأقل', 'error');
      return;
    }
    const removed = wheels.find((w) => w.id === id);
    setWheels((prev) => prev.filter((w) => w.id !== id));
    if (activeId === id) {
      const remaining = wheels.filter((w) => w.id !== id);
      setActiveId(remaining[0].id);
    }
    try { await deleteWheel(id); } catch {}
    if (removed) showToast(`تم حذف "${removed.name}"`, 'info');
  };

  // بدء إعادة التسمية
  const startRename = (tab: WheelTab) => {
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  // حفظ إعادة التسمية
  const saveRename = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      showToast('اسم العجلة لا يمكن أن يكون فارغاً', 'error');
      return;
    }
    setWheels((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, name: trimmed } : w));
      const current = updated.find((w) => w.id === id);
      if (current) persistWheel(current);
      return updated;
    });
    setEditingTabId(null);
    showToast('✅ تم حفظ الاسم', 'success');
  };

  // العجلة النشطة
  const activeWheel = wheels.find((w) => w.id === activeId);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">جاري تحميل العجلات...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط التبويبات */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {wheels.map((tab, index) => {
            const isActive = tab.id === activeId;
            const isEditing = editingTabId === tab.id;
            return (
              <div
                key={tab.id}
                className={`group flex items-center gap-1 rounded-xl border-2 px-3 py-2 transition ${
                  isActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(tab.id);
                        if (e.key === 'Escape') setEditingTabId(null);
                      }}
                      className="w-28 rounded-md border border-orange-300 px-2 py-1 text-sm outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveRename(tab.id)}
                      className="rounded-md bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTabId(null)}
                      className="rounded-md bg-slate-300 p-1 text-white hover:bg-slate-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveId(tab.id)}
                      onDoubleClick={() => startRename(tab)}
                      className={`flex items-center gap-1 text-sm font-bold ${
                        isActive ? 'text-orange-700' : 'text-slate-700'
                      }`}
                      title="نقر مزدوج لإعادة التسمية"
                    >
                      {index + 1}. {tab.name}
                      <span className="text-xs font-normal text-slate-400">
                        ({tab.options.length})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startRename(tab)}
                      className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-white hover:text-orange-600 group-hover:opacity-100"
                      title="إعادة تسمية"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWheel(tab.id)}
                      className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                      title="حذف العجلة"
                      disabled={wheels.length <= 1}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {/* زر إضافة عجلة */}
          <button
            type="button"
            onClick={addWheel}
            disabled={wheels.length >= 5}
            className="flex items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-orange-400 hover:text-orange-600 disabled:opacity-40"
            title="إضافة عجلة جديدة"
          >
            <Plus className="h-4 w-4" />
            عجلة جديدة
          </button>

          <span className="ml-auto text-xs text-slate-500">
            {wheels.length} / 5 عجلات
          </span>
        </div>
      </div>

      {/* العجلة النشطة */}
      {activeWheel && (
        <WheelController
          key={activeWheel.id}
          wheelId={activeWheel.id}
          initialOptions={activeWheel.options}
          onOptionsChange={handleOptionsChange}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] rounded-full px-6 py-3 font-bold shadow-2xl text-sm text-white ${
          toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}