'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ListPlus,
  RotateCcw,
  Users,
  ImagePlus,
} from 'lucide-react';
import type { WheelOption } from '@/lib/picker-wheel/types';
import {
  MAX_OPTIONS,
  MAX_WEIGHT,
  MIN_WEIGHT,
  WHEEL_COLORS,
} from '@/lib/picker-wheel/constants';

interface WheelOptionsProps {
  options: WheelOption[];
  onChange: (options: WheelOption[]) => void;
  disabled?: boolean;
  imageUrls?: Record<string, string>;
  onImageSelect?: (optionId: string, file: File | null) => void;
}

interface OptionDraft {
  label: string;
  color: string;
  weight: number;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `option-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export default function WheelOptions({
  options,
  onChange,
  disabled = false,
  imageUrls = {},
  onImageSelect,
}: WheelOptionsProps) {
  const [newLabel, setNewLabel] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<OptionDraft>({
    label: '',
    color: WHEEL_COLORS[0],
    weight: 1,
  });
  const [error, setError] = useState('');

  const totalWeight = useMemo(
    () => options.reduce((total, option) => total + option.weight, 0),
    [options],
  );

  const updateOption = (
    id: string,
    updates: Partial<WheelOption>,
  ) => {
    onChange(
      options.map((option) =>
        option.id === id ? { ...option, ...updates } : option,
      ),
    );
  };

  const addOption = () => {
    const label = newLabel.trim();

    if (!label) {
      setError('اكتب اسم الخيار أولاً.');
      return;
    }

    if (options.length >= MAX_OPTIONS) {
      setError(`الحد الأقصى هو ${MAX_OPTIONS} خياراً.`);
      return;
    }

    onChange([
      ...options,
      {
        id: createId(),
        label,
        color: WHEEL_COLORS[options.length % WHEEL_COLORS.length],
        weight: 1,
        winCount: 0,
      },
    ]);

    setNewLabel('');
    setError('');
  };

  const startEditing = (option: WheelOption) => {
    setEditingId(option.id);
    setDraft({
      label: option.label,
      color: option.color,
      weight: option.weight,
    });
    setError('');
  };

  const saveEditing = () => {
    if (!editingId) return;

    const label = draft.label.trim();
    const weight = Number(draft.weight);

    if (!label) {
      setError('اسم الخيار لا يمكن أن يكون فارغاً.');
      return;
    }

    if (
      !Number.isFinite(weight) ||
      weight < MIN_WEIGHT ||
      weight > MAX_WEIGHT
    ) {
      setError(`الوزن يجب أن يكون بين ${MIN_WEIGHT} و${MAX_WEIGHT}.`);
      return;
    }

    updateOption(editingId, {
      label,
      color: draft.color,
      weight,
    });

    setEditingId(null);
    setError('');
  };

  const deleteOption = (id: string) => {
    if (options.length <= 2) {
      setError('يجب الاحتفاظ بخيارين على الأقل.');
      return;
    }

    onChange(options.filter((option) => option.id !== id));

    if (editingId === id) {
      setEditingId(null);
    }

    setError('');
  };

  const addBulkOptions = () => {
    const labels = bulkText
      .split(/\r?\n/)
      .map((label) => label.trim())
      .filter(Boolean);

    if (labels.length === 0) {
      setError('أدخل خياراً واحداً على الأقل، كل خيار في سطر.');
      return;
    }

    const available = MAX_OPTIONS - options.length;

    if (available <= 0) {
      setError(`وصلت إلى الحد الأقصى وهو ${MAX_OPTIONS} خياراً.`);
      return;
    }

    const accepted = labels.slice(0, available);

    const added: WheelOption[] = accepted.map((label, index) => ({
      id: createId(),
      label,
      color: WHEEL_COLORS[(options.length + index) % WHEEL_COLORS.length],
      weight: 1,
      winCount: 0,
    }));

    onChange([...options, ...added]);
    setBulkText('');
    setBulkOpen(false);

    setError(
      labels.length > accepted.length
        ? `تمت إضافة ${accepted.length} خياراً فقط بسبب الحد الأقصى.`
        : '',
    );
  };

  const resetWinCounts = () => {
    onChange(
      options.map((option) => ({
        ...option,
        winCount: 0,
      })),
    );
  };

  return (
    <section
      dir="rtl"
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="h-5 w-5 text-orange-600" />
            خيارات العجلة
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            أضف المشاركين أو الخيارات التي تريد الاختيار بينها.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
          {options.length} من {MAX_OPTIONS}
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={newLabel}
          disabled={disabled || options.length >= MAX_OPTIONS}
          onChange={(event) => setNewLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addOption();
            }
          }}
          placeholder="اكتب اسماً أو خياراً جديداً..."
          maxLength={80}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={addOption}
          disabled={disabled || options.length >= MAX_OPTIONS}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          إضافة
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setBulkOpen((open) => !open);
            setError('');
          }}
          disabled={disabled || options.length >= MAX_OPTIONS}
          className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
        >
          <ListPlus className="h-4 w-4" />
          إضافة قائمة كاملة
        </button>

        <button
          type="button"
          onClick={resetWinCounts}
          disabled={disabled || !options.some((option) => option.winCount > 0)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          تصفير مرات الفوز
        </button>
      </div>

      {bulkOpen && (
        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50/50 p-3">
          <label className="mb-2 block text-sm font-bold text-slate-800">
            أدخل كل خيار في سطر مستقل
          </label>

          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            disabled={disabled}
            rows={5}
            placeholder={'أحمد\nمحمد\nعلي\nعمر'}
            className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <div className="mt-2 flex flex-wrap justify-between gap-2">
            <span className="text-xs text-slate-500">
              {bulkText.split(/\r?\n/).filter((line) => line.trim()).length} خيار
              جديد
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBulkOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={addBulkOptions}
                disabled={disabled}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                إضافة الخيارات
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>الخيار والوزن واللون</span>
        <span>عدد مرات الفوز</span>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const isEditing = editingId === option.id;

          return (
            <div
              key={option.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-orange-200"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={draft.label}
                    onChange={(event) =>
                      setDraft({ ...draft, label: event.target.value })
                    }
                    maxLength={80}
                    disabled={disabled}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                    aria-label="اسم الخيار"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      الوزن
                      <input
                        type="number"
                        min={MIN_WEIGHT}
                        max={MAX_WEIGHT}
                        step="0.1"
                        value={draft.weight}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            weight: Number(event.target.value),
                          })
                        }
                        disabled={disabled}
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      اللون
                      <input
                        type="color"
                        value={draft.color}
                        onChange={(event) =>
                          setDraft({ ...draft, color: event.target.value })
                        }
                        disabled={disabled}
                        className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
                      />
                    </label>

                    <div className="ms-auto flex gap-2">
                      <button
                        type="button"
                        onClick={saveEditing}
                        disabled={disabled}
                        aria-label="حفظ التعديلات"
                        className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setError('');
                        }}
                        aria-label="إلغاء التعديل"
                        className="rounded-lg bg-slate-200 p-2 text-slate-700 hover:bg-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-center text-xs text-slate-400">
                    {index + 1}
                  </span>

                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: option.color }}
                    aria-label="لون القطاع"
                  />

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
                    {option.label}
                  </span>

                  <span className="hidden shrink-0 rounded-md bg-white px-2 py-1 text-xs text-slate-500 sm:inline">
                    وزن {option.weight}
                  </span>

                  <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-bold tabular-nums text-slate-700">
                    {option.winCount} فوز
                  </span>

                  <button
                    type="button"
                    onClick={() => startEditing(option)}
                    disabled={disabled}
                    aria-label={`تعديل ${option.label}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-100 hover:text-orange-700 disabled:opacity-40"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteOption(option.id)}
                    disabled={disabled || options.length <= 2}
                    aria-label={`حذف ${option.label}`}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center gap-3 border-t border-slate-200/70 pt-3">
                {imageUrls[option.id] ? (
                  <img
                    src={imageUrls[option.id]}
                    alt={`صورة ${option.label}`}
                    className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                )}

                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
                  <ImagePlus className="h-4 w-4" />
                  {imageUrls[option.id] ? 'تغيير الصورة' : 'إضافة صورة'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={disabled}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onImageSelect?.(option.id, file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>

                {imageUrls[option.id] && (
                  <button
                    type="button"
                    onClick={() => onImageSelect?.(option.id, null)}
                    disabled={disabled}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          إجمالي الأوزان: {Number(totalWeight.toFixed(2))}
        </span>
        <span>يؤثر الوزن في مساحة القطاع واحتمال الفوز.</span>
      </div>
    </section>
  );
}




