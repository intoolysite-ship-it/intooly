'use client';

// ============================================================
// ⚙️ لوحة إعدادات القص
// ============================================================

import { Lock, Unlock, Ruler, Palette, Grid3x3, Maximize2 } from 'lucide-react';
import type { CropSettings, AspectRatioId, CropShape } from '@/lib/image-cropper/types';
import { ASPECT_RATIOS, LIMITS } from '@/lib/image-cropper/constants';

// ============================================================
// 📝 الأنواع
// ============================================================

interface CropControlsProps {
  settings: CropSettings;
  onChange: (settings: CropSettings) => void;
  originalWidth: number;
  originalHeight: number;
}

// ============================================================
// 🎨 المكوّن الرئيسي
// ============================================================

export default function CropControls({
  settings,
  onChange,
  originalWidth,
  originalHeight,
}: CropControlsProps) {
  // ============================================
  // 🔧 دوال التحديث
  // ============================================
  const updateSettings = (updates: Partial<CropSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateCustomRatio = (updates: Partial<CropSettings['customRatio']>) => {
    onChange({
      ...settings,
      customRatio: { ...settings.customRatio, ...updates },
    });
  };

  // ============================================
  // 📐 النسب الجاهزة
  // ============================================
  const handleAspectRatioClick = (id: AspectRatioId) => {
    updateSettings({ aspectRatio: id });
  };

  // ============================================
  // 🎨 الأنماط
  // ============================================
  const shapes: Array<{ id: CropShape; label: string; icon: string }> = [
    { id: 'rectangle', label: 'مستطيل', icon: '⬛' },
    { id: 'rounded', label: 'مدور', icon: '🔲' },
    { id: 'circle', label: 'دائرة', icon: '⚪' },
  ];

  const gridTypes: Array<{ id: CropSettings['gridType']; label: string; icon: string }> = [
    { id: 'none', label: 'بدون', icon: '⬜' },
    { id: 'thirds', label: 'الثلث', icon: '⊞' },
    { id: 'golden', label: 'ذهبي', icon: '⊞' },
    { id: 'grid', label: 'شبكة', icon: '⊞' },
    { id: 'center', label: 'مركز', icon: '⊹' },
  ];

  // ============================================
  // 🎨 الرسم
  // ============================================
  return (
    <div className="space-y-5">

      {/* ============================================ */}
      {/* 1. النسب الجاهزة */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-slate-700 mb-2">
          <Ruler className="w-4 h-4 text-amber-500" />
          نسبة القص
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {ASPECT_RATIOS.filter(r => r.id !== 'custom').map((ratio) => {
            const isActive = settings.aspectRatio === ratio.id;
            return (
              <button
                key={ratio.id}
                type="button"
                onClick={() => handleAspectRatioClick(ratio.id)}
                title={ratio.description}
                className={`
                  p-2 rounded-lg border-2 transition-all text-center
                  ${
                    isActive
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                  }
                `}
              >
                <div className="text-xs font-black text-slate-900">
                  {ratio.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* نسبة مخصصة */}
        <button
          type="button"
          onClick={() => handleAspectRatioClick('custom')}
          className={`
            w-full mt-2 p-2 rounded-lg border-2 transition-all text-xs font-black
            ${
              settings.aspectRatio === 'custom'
                ? 'border-amber-500 bg-amber-50 shadow-sm text-amber-700'
                : 'border-slate-200 bg-white hover:border-amber-300 text-slate-700'
            }
          `}
        >
          ⚙️ نسبة مخصصة
        </button>

        {/* حقول النسبة المخصصة */}
        {settings.aspectRatio === 'custom' && (
          <div className="mt-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-600 mb-1 block">
                  العرض
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.customRatio.width}
                  onChange={(e) =>
                    updateCustomRatio({ width: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border-2 border-slate-200 focus:border-amber-500 outline-none text-sm font-black text-center"
                />
              </div>
              <span className="text-amber-600 font-black mt-5">:</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-600 mb-1 block">
                  الطول
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.customRatio.height}
                  onChange={(e) =>
                    updateCustomRatio({ height: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border-2 border-slate-200 focus:border-amber-500 outline-none text-sm font-black text-center"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* 2. شكل القص */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-slate-700 mb-2">
          <Maximize2 className="w-4 h-4 text-amber-500" />
          شكل القص
        </label>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => {
            const isActive = settings.shape === shape.id;
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => updateSettings({ shape: shape.id })}
                className={`
                  p-2.5 rounded-lg border-2 transition-all text-center
                  ${
                    isActive
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }
                `}
              >
                <div className="text-lg mb-0.5">{shape.icon}</div>
                <div className="text-[10px] font-black text-slate-900">
                  {shape.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* نصف قطر الزوايا (إذا مدور) */}
        {settings.shape === 'rounded' && (
          <div className="mt-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
            <label className="text-[10px] font-black text-slate-600 mb-2 block">
              انحناء الزوايا: {settings.borderRadius}px
            </label>
            <input
              type="range"
              min={LIMITS.MIN_BORDER_RADIUS}
              max={LIMITS.MAX_BORDER_RADIUS}
              step={5}
              value={settings.borderRadius}
              onChange={(e) =>
                updateSettings({ borderRadius: parseInt(e.target.value) })
              }
              className="w-full accent-amber-500"
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* 3. شبكة القاعدة الذهبية */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-xs font-black text-slate-700">
            <Grid3x3 className="w-4 h-4 text-amber-500" />
            شبكة التوجيه
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showGrid}
              onChange={(e) => updateSettings({ showGrid: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-xs font-bold text-slate-600">تفعيل</span>
          </label>
        </div>

        {settings.showGrid && (
          <div className="grid grid-cols-5 gap-1.5">
            {gridTypes.map((type) => {
              const isActive = settings.gridType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => updateSettings({ gridType: type.id })}
                  title={type.label}
                  className={`
                    p-2 rounded-lg border-2 transition-all text-center
                    ${
                      isActive
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-amber-300'
                    }
                  `}
                >
                  <div className="text-base font-black text-slate-700">
                    {type.icon}
                  </div>
                  <div className="text-[9px] font-black text-slate-600 mt-0.5">
                    {type.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* 4. قفل النسبة */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center justify-between gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
          <div className="flex items-center gap-2">
            {settings.lockAspectRatio ? (
              <Lock className="w-4 h-4 text-amber-600" />
            ) : (
              <Unlock className="w-4 h-4 text-slate-400" />
            )}
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">
                قفل النسبة
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                {settings.lockAspectRatio
                  ? 'النسبة محفوظة'
                  : 'يمكن تعديل العرض والطول بحرية'}
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.lockAspectRatio}
            onChange={(e) => updateSettings({ lockAspectRatio: e.target.checked })}
            className="w-5 h-5 accent-amber-500 flex-shrink-0"
          />
        </label>
      </div>

    </div>
  );
}