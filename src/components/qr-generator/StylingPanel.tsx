'use client';

import { Palette, Maximize2, Frame, Shield, Info } from 'lucide-react';
import { COLOR_TEMPLATES, QR_CONFIG, ERROR_CORRECTION_INFO, type ErrorCorrectionLevel } from '@/lib/qr-generator/constants';
import type { QRSettings } from '@/lib/qr-generator/types';

interface StylingPanelProps {
  settings: QRSettings;
  onChange: (settings: QRSettings) => void;
  disabled?: boolean;
}

const SIZE_PRESETS = [
  { value: 256, label: '256' },
  { value: 512, label: '512' },
  { value: 1024, label: '1024' },
  { value: 2048, label: '2048' },
];

const MARGIN_PRESETS = [
  { value: 0, label: '0' },
  { value: 2, label: '2' },
  { value: 4, label: '4' },
  { value: 8, label: '8' },
];

export default function StylingPanel({
  settings,
  onChange,
  disabled = false,
}: StylingPanelProps) {
  const update = <K extends keyof QRSettings>(key: K, value: QRSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 md:p-6 space-y-5">
      {/* العنوان */}
      <div>
        <h3 className="font-extrabold text-ink-900 text-base md:text-lg flex items-center gap-2">
          🎨 تخصيص التصميم
        </h3>
        <p className="text-xs md:text-sm text-ink-500 font-bold mt-1">
          خصّص الألوان والحجم
        </p>
      </div>

      {/* الألوان */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-ink-700">
          <Palette className="w-4 h-4 text-brand-500" />
          الألوان
        </div>

        {/* قوالب الألوان */}
        <div className="grid grid-cols-6 gap-2">
          {COLOR_TEMPLATES.map((template) => {
            const isActive =
              settings.foreground === template.foreground &&
              settings.background === template.background;

            return (
              <button
                key={template.id}
                onClick={() => {
                  update('foreground', template.foreground);
                  update('background', template.background);
                }}
                disabled={disabled}
                title={template.name}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all
                  ${isActive ? 'border-brand-500 scale-110 shadow-md' : 'border-ink-200 hover:border-brand-300'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                  background: `linear-gradient(135deg, ${template.foreground} 50%, ${template.background} 50%)`,
                }}
              >
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* منتقي الألوان المخصص */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-extrabold text-ink-600 mb-1.5">
              اللون الأمامي
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.foreground}
                onChange={(e) => update('foreground', e.target.value)}
                disabled={disabled}
                className="w-10 h-10 rounded-lg border-2 border-ink-200 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={settings.foreground}
                onChange={(e) => update('foreground', e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1.5 rounded-lg border-2 border-ink-200 text-xs font-mono font-bold focus:outline-none focus:border-brand-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-ink-600 mb-1.5">
              اللون الخلفي
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.background}
                onChange={(e) => update('background', e.target.value)}
                disabled={disabled}
                className="w-10 h-10 rounded-lg border-2 border-ink-200 cursor-pointer disabled:opacity-50"
              />
              <input
                type="text"
                value={settings.background}
                onChange={(e) => update('background', e.target.value)}
                disabled={disabled}
                className="flex-1 px-2 py-1.5 rounded-lg border-2 border-ink-200 text-xs font-mono font-bold focus:outline-none focus:border-brand-400 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* الحجم */}
      <div className="space-y-3 pt-4 border-t border-ink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-ink-700">
            <Maximize2 className="w-4 h-4 text-brand-500" />
            الحجم (بكسل)
          </div>
          <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
            {settings.size}×{settings.size}
          </span>
        </div>

        {/* قوالب الحجم */}
        <div className="grid grid-cols-4 gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => update('size', preset.value)}
              disabled={disabled}
              className={`
                py-2 rounded-lg text-xs font-black transition-all border-2
                ${
                  settings.size === preset.value
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* شريط التمرير */}
        <input
          type="range"
          min={QR_CONFIG.MIN_SIZE}
          max={QR_CONFIG.MAX_SIZE}
          step={64}
          value={settings.size}
          onChange={(e) => update('size', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full accent-brand-500"
        />

        <div className="flex justify-between text-[10px] text-ink-500 font-bold">
          <span>{QR_CONFIG.MIN_SIZE}</span>
          <span>{QR_CONFIG.MAX_SIZE}</span>
        </div>
      </div>

      {/* الهوامش */}
      <div className="space-y-3 pt-4 border-t border-ink-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-ink-700">
            <Frame className="w-4 h-4 text-brand-500" />
            الهوامش
          </div>
          <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
            {settings.margin}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {MARGIN_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => update('margin', preset.value)}
              disabled={disabled}
              className={`
                py-2 rounded-lg text-xs font-black transition-all border-2
                ${
                  settings.margin === preset.value
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                    : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={QR_CONFIG.MIN_MARGIN}
          max={QR_CONFIG.MAX_MARGIN}
          step={1}
          value={settings.margin}
          onChange={(e) => update('margin', parseInt(e.target.value))}
          disabled={disabled}
          className="w-full accent-brand-500"
        />
      </div>

      {/* تصحيح الأخطاء */}
      <div className="space-y-3 pt-4 border-t border-ink-100">
        <div className="flex items-center gap-2 text-xs font-extrabold text-ink-700">
          <Shield className="w-4 h-4 text-brand-500" />
          تصحيح الأخطاء
        </div>

        <div className="grid grid-cols-4 gap-2">
          {QR_CONFIG.ERROR_CORRECTIONS.map((level) => {
            const info = ERROR_CORRECTION_INFO[level];
            const isActive = settings.errorCorrection === level;

            return (
              <button
                key={level}
                onClick={() => update('errorCorrection', level as ErrorCorrectionLevel)}
                disabled={disabled}
                className={`
                  py-2.5 rounded-lg text-center transition-all border-2
                  ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                      : 'bg-white text-ink-700 border-ink-200 hover:border-brand-300'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-sm font-black">{level}</div>
                <div className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-ink-500'}`}>
                  {info.percentage}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-ink-500 font-bold flex items-start gap-1">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          كلما زاد مستوى التصحيح، زادت مقاومة QR للتلف — لكن يزيد تعقيد الرمز
        </p>
      </div>
    </div>
  );
}
