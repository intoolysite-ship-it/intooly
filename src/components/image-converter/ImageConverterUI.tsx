'use client';

// ============================================================
// 🎨 مكونات واجهة محوّل الصور
// ============================================================

import { useState, useRef, useCallback, useMemo } from 'react';
import {
  Upload, X, Image as ImageIcon, Sparkles,
  AlertCircle, CheckCircle2, Info, Shield,
  ChevronDown, ChevronUp, Loader2, Trash2,
  Download, FileImage, Zap, Lock, Gauge,
  Maximize2, Minimize2, ArrowRight, Layers,
  RefreshCw, Sliders, Palette, Eye, EyeOff
} from 'lucide-react';

import type {
  ImageItem,
  ImageFormat,
  SmartPreset,
  QualityPreset,
  AnalysisRecommendation,
  ConversionSettings,
} from '@/lib/image-converter/types';

import {
  SUPPORTED_FORMATS,
  SMART_PRESETS,
  QUALITY_PRESETS,
  LIMITS,
  COMMON_BACKGROUND_COLORS,
  ACCEPTED_EXTENSIONS,
} from '@/lib/image-converter/constants';

import {
  formatBytes,
  formatPercentage,
  formatDuration,
  analyzeImage,
} from '@/lib/image-converter/utils';

// ============================================================
// 📤 مكوّن منطقة الرفع
// ============================================================

interface UploadZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  currentCount: number;
}

export function UploadZone({ onFiles, disabled, currentCount }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }, [disabled, onFiles]);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
    e.target.value = '';
  }, [onFiles]);

  const remaining = LIMITS.MAX_IMAGES - currentCount;

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 md:p-14 cursor-pointer
        transition-all duration-300 group text-center
        ${isDragging 
          ? 'border-amber-500 bg-amber-50 scale-[1.02] shadow-xl' 
          : 'border-slate-300 bg-gradient-to-br from-slate-50 to-amber-50/30 hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-lg'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label="منطقة رفع الصور"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.source}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`
          w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 
          flex items-center justify-center shadow-lg
          transition-transform duration-300
          ${isDragging ? 'scale-110 rotate-6' : 'group-hover:scale-110'}
        `}>
          <Upload className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
            {isDragging ? '✨ أفلت الصور الآن!' : 'اسحب صورك هنا'}
          </h3>
          <p className="text-sm md:text-base text-slate-600 mb-1">
            أو انقر للاختيار — <strong className="text-amber-600">حتى {remaining} صورة</strong>
          </p>
          <p className="text-xs text-slate-500 font-bold">
            📷 JPG · PNG · WebP · AVIF · HEIC · GIF · BMP · TIFF · ICO
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-2">
          {[
            { icon: Shield, label: 'محلي 100%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { icon: Zap, label: 'سريع جداً', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { icon: Layers, label: '9 صيغ', color: 'text-blue-600 bg-blue-50 border-blue-200' },
          ].map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${tag.color}`}
            >
              <tag.icon className="w-3.5 h-3.5" />
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🧠 مكوّن التحليل الذكي
// ============================================================

interface ImageAnalyzerProps {
  recommendations: AnalysisRecommendation[];
  onApplyAction?: (action: string) => void;
}

export function ImageAnalyzer({ recommendations, onApplyAction }: ImageAnalyzerProps) {
  const [expanded, setExpanded] = useState(true);

  if (recommendations.length === 0) return null;

  const severityStyles = {
    info: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    warning: { 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-800',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
    },
    critical: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
    success: { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-right">
            <h3 className="font-black text-slate-900 text-sm md:text-base">
              🤖 التحليل الذكي
            </h3>
            <p className="text-xs text-slate-500 font-bold">
              {recommendations.length} توصية
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {recommendations.map((rec, i) => {
            const style = severityStyles[rec.severity];
            const Icon = style.icon;

            return (
              <div
                key={i}
                className={`${style.bg} ${style.border} border rounded-xl p-3 flex items-start gap-3`}
              >
                <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-sm ${style.text} mb-1`}>
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rec.description}
                  </p>
                  {rec.action && onApplyAction && (
                    <button
                      onClick={() => onApplyAction(rec.action!)}
                      className="mt-2 text-xs font-black text-amber-600 hover:text-amber-700 underline"
                    >
                      → {rec.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 📌 استيراد المكونات من الأجزاء التالية
// ============================================================

// ============================================================
// 👁️ مكوّن المقارنة قبل/بعد
// ============================================================

interface ComparisonSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeSize?: number;
  afterSize?: number;
  aspectRatio?: number;
}

export function ComparisonSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'الأصلي',
  afterLabel = 'المحوّل',
  beforeSize,
  afterSize,
  aspectRatio = 1,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  // Event listeners
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(() => {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp, handleTouchMove]);
  }

  const savings = beforeSize && afterSize
    ? Math.round(((beforeSize - afterSize) / beforeSize) * 100)
    : 0;

  return (
    <div className="space-y-3">
      {/* الشريط العلوي */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-black">
          {beforeLabel} {beforeSize && `· ${formatBytes(beforeSize)}`}
        </span>
        {savings > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-white font-black flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            وفّرت {savings}%
          </span>
        )}
        <span className="px-3 py-1.5 rounded-full bg-amber-500 text-white font-black">
          {afterLabel} {afterSize && `· ${formatBytes(afterSize)}`}
        </span>
      </div>

      {/* المقارنة */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden select-none cursor-ew-resize bg-slate-900"
        style={{ aspectRatio }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* After (الصورة المحوّلة - الخلفية) */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />

        {/* Before (الصورة الأصلية - عليها clip) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* الشريط الذهبي */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 shadow-2xl pointer-events-none z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-white shadow-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">⇔</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs font-bold text-slate-500">
        💡 اسحب الشريط الذهبي لمقارنة النتيجة
      </p>
    </div>
  );
}

// ============================================================
// ⚙️ مكوّن لوحة الإعدادات
// ============================================================

interface SettingsPanelProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
  hasAlpha?: boolean;
}

export function SettingsPanel({ settings, onChange, hasAlpha }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...updates });
  };

  const updateResize = (updates: Partial<ConversionSettings['resize']>) => {
    onChange({
      ...settings,
      resize: { ...settings.resize, ...updates },
    });
  };

  const updateMultiFormat = (updates: Partial<ConversionSettings['multiFormat']>) => {
    onChange({
      ...settings,
      multiFormat: { ...settings.multiFormat, ...updates },
    });
  };

  const toggleMultiFormat = (format: ImageFormat) => {
    const formats = settings.multiFormat.formats.includes(format)
      ? settings.multiFormat.formats.filter(f => f !== format)
      : [...settings.multiFormat.formats, format];
    updateMultiFormat({ formats });
  };

  const currentFormatInfo = SUPPORTED_FORMATS.find(f => f.id === settings.format);

  return (
    <div className="space-y-4">
      {/* ============================================ */}
      {/* 1. الصيغة المستهدفة */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center gap-2 text-xs font-black text-slate-700 mb-2">
          <FileImage className="w-4 h-4 text-amber-500" />
          الصيغة المستهدفة
        </label>
        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_FORMATS.map((format) => {
            const isActive = settings.format === format.id;
            const wouldLoseAlpha = hasAlpha && !format.supportsAlpha;

            return (
              <button
                key={format.id}
                onClick={() => updateSettings({ format: format.id })}
                className={`
                  relative p-2.5 rounded-xl border-2 transition-all text-center
                  ${isActive
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                  }
                `}
                title={format.description}
              >
                <div className="text-xl mb-0.5">{format.icon}</div>
                <div className="text-xs font-black text-slate-900">{format.name}</div>
                {wouldLoseAlpha && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {currentFormatInfo && (
          <p className="mt-2 text-xs text-slate-500 font-bold leading-relaxed">
            {currentFormatInfo.description}
          </p>
        )}
        {hasAlpha && currentFormatInfo && !currentFormatInfo.supportsAlpha && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800">
              ستفقد الشفافية — سيُملأ الخلفية بلون مخصص
            </p>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* 2. الجودة */}
      {/* ============================================ */}
      {settings.format !== 'png' && settings.format !== 'bmp' && (
        <div>
          <label className="flex items-center justify-between text-xs font-black text-slate-700 mb-2">
            <span className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              الجودة
            </span>
            <span className="text-amber-600 text-sm">
              {Math.round(settings.quality * 100)}%
            </span>
          </label>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {(Object.keys(QUALITY_PRESETS) as QualityPreset[])
              .filter(k => k !== 'custom')
              .map((key) => {
                const preset = QUALITY_PRESETS[key];
                const isActive = settings.qualityPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => updateSettings({
                      qualityPreset: key,
                      quality: preset.value,
                    })}
                    className={`
                      p-2 rounded-lg border text-center transition-all
                      ${isActive
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-amber-300'
                      }
                    `}
                  >
                    <div className="text-xs font-black text-slate-900">
                      {preset.label}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Slider */}
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={Math.round(settings.quality * 100)}
            onChange={(e) => updateSettings({
              qualityPreset: 'custom',
              quality: parseInt(e.target.value) / 100,
            })}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-slate-200 to-amber-200 accent-amber-500"
          />

          <p className="text-xs text-slate-500 font-bold mt-1">
            {QUALITY_PRESETS[settings.qualityPreset as QualityPreset]?.description || 
             'جودة مخصصة'}
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* 3. تغيير الأبعاد */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-xs font-black text-slate-700">
            <Maximize2 className="w-4 h-4 text-amber-500" />
            الأبعاد
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.resize.enabled}
              onChange={(e) => updateResize({ enabled: e.target.checked })}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-xs font-bold text-slate-600">تفعيل</span>
          </label>
        </div>

        {settings.resize.enabled && (
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateResize({ mode: 'max-width' })}
                className={`
                  p-2 rounded-lg text-xs font-black transition-all
                  ${settings.resize.mode === 'max-width'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                  }
                `}
              >
                الحد الأقصى للعرض
              </button>
              <button
                onClick={() => updateResize({ mode: 'max-height' })}
                className={`
                  p-2 rounded-lg text-xs font-black transition-all
                  ${settings.resize.mode === 'max-height'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                  }
                `}
              >
                الحد الأقصى للطول
              </button>
            </div>

            {(settings.resize.mode === 'max-width' || settings.resize.mode === 'max-height') && (
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">
                  الحد الأقصى (بكسل)
                </label>
                <input
                  type="number"
                  min={100}
                  max={8000}
                  step={100}
                  value={
                    settings.resize.mode === 'max-width'
                      ? settings.resize.maxWidth || 1920
                      : settings.resize.maxHeight || 1080
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1000;
                    if (settings.resize.mode === 'max-width') {
                      updateResize({ maxWidth: val });
                    } else {
                      updateResize({ maxHeight: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-amber-500 outline-none text-sm font-bold"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* 4. لون الخلفية (إذا كانت الصيغة لا تدعم الشفافية) */}
      {/* ============================================ */}
      {currentFormatInfo && !currentFormatInfo.supportsAlpha && (
        <div>
          <label className="flex items-center gap-2 text-xs font-black text-slate-700 mb-2">
            <Palette className="w-4 h-4 text-amber-500" />
            لون الخلفية
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_BACKGROUND_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateSettings({ backgroundColor: color.value })}
                className={`
                  w-8 h-8 rounded-lg border-2 transition-all hover:scale-110
                  ${settings.backgroundColor === color.value
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-slate-300'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <label className="w-8 h-8 rounded-lg border-2 border-slate-300 cursor-pointer overflow-hidden relative">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div
                className="w-full h-full"
                style={{ backgroundColor: settings.backgroundColor }}
              />
            </label>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* 5. حماية الخصوصية */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center justify-between gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl cursor-pointer hover:border-amber-300 transition-colors">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">
                حذف بيانات EXIF
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                يحذف GPS وبيانات الكاميرا
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.stripExif}
            onChange={(e) => updateSettings({ stripExif: e.target.checked })}
            className="w-5 h-5 accent-emerald-500 flex-shrink-0"
          />
        </label>
      </div>

      {/* ============================================ */}
      {/* 6. تصدير متعدد الصيغ */}
      {/* ============================================ */}
      <div>
        <label className="flex items-center justify-between gap-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <div className="text-right">
              <div className="text-xs font-black text-slate-900">
                ✨ تصدير متعدد
              </div>
              <div className="text-[10px] text-slate-500 font-bold">
                صورة واحدة → عدة صيغ
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.multiFormat.enabled}
            onChange={(e) => updateMultiFormat({ enabled: e.target.checked })}
            className="w-5 h-5 accent-blue-500 flex-shrink-0"
          />
        </label>

        {settings.multiFormat.enabled && (
          <div className="mt-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-slate-600 mb-2">
              اختر الصيغ المطلوبة:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_FORMATS.slice(0, 6).map((format) => {
                const isSelected = settings.multiFormat.formats.includes(format.id);
                return (
                  <button
                    key={format.id}
                    onClick={() => toggleMultiFormat(format.id)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-black transition-all border-2
                      ${isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }
                    `}
                  >
                    {format.icon} {format.name}
                  </button>
                );
              })}
            </div>
            {settings.multiFormat.formats.length > 0 && (
              <p className="mt-2 text-[10px] text-blue-700 font-bold">
                ✅ ستحصل على {settings.multiFormat.formats.length} نسخ في ملف ZIP
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🎯 مكوّن الإعدادات المسبقة الذكية
// ============================================================

interface PresetButtonsProps {
  activePreset?: SmartPreset;
  onSelect: (preset: SmartPreset) => void;
  onClear: () => void;
}

export function PresetButtons({ activePreset, onSelect, onClear }: PresetButtonsProps) {
  const presets = Object.values(SMART_PRESETS);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-xs font-black text-slate-700">
          <Zap className="w-4 h-4 text-amber-500" />
          إعدادات سريعة
        </label>
        {activePreset && (
          <button
            onClick={onClear}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
          >
            مسح
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.id)}
              title={preset.description}
              className={`
                p-2.5 rounded-xl border-2 transition-all text-center
                ${isActive
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md'
                  : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 hover:-translate-y-0.5'
                }
              `}
            >
              <div className="text-2xl mb-0.5">{preset.icon}</div>
              <div className="text-[11px] font-black text-slate-900">
                {preset.name}
              </div>
            </button>
          );
        })}
      </div>

      {activePreset && (
        <p className="mt-2 text-xs text-amber-600 font-bold text-center">
          💡 {SMART_PRESETS[activePreset].description}
        </p>
      )}
    </div>
  );
}

// ============================================================
// 📊 مكوّن بطاقة النتيجة
// ============================================================

interface ResultCardProps {
  item: ImageItem;
  onDownload: () => void;
  onRemove: () => void;
  onReconvert?: () => void;
}

export function ResultCard({ item, onDownload, onRemove, onReconvert }: ResultCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  const hasResult = item.status === 'done' && item.convertedUrl;
  const savings = item.info && item.convertedSize
    ? Math.round(((item.info.size - item.convertedSize) / item.info.size) * 100)
    : 0;

  const formatInfo = item.convertedFormat
    ? SUPPORTED_FORMATS.find(f => f.id === item.convertedFormat)
    : null;

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-3 bg-gradient-to-l from-slate-50 to-amber-50/30 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            {formatInfo ? (
              <span className="text-lg">{formatInfo.icon}</span>
            ) : (
              <FileImage className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900 text-sm truncate" title={item.name}>
              {item.name}
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              {item.info && `${item.info.width}×${item.info.height}`}
              {item.info && ` · ${item.info.format.toUpperCase()}`}
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
          title="حذف"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 mb-3" style={{ aspectRatio: 1 }}>
          {showComparison && item.convertedUrl && item.originalUrl ? (
            <ComparisonSlider
              beforeUrl={item.originalUrl}
              afterUrl={item.convertedUrl}
              beforeSize={item.info?.size}
              afterSize={item.convertedSize}
              aspectRatio={1}
            />
          ) : (
            <>
              {/* المعاينة العادية */}
              <img
                src={item.convertedUrl || item.originalUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* زر تبديل المقارنة */}
              {hasResult && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-black flex items-center gap-1.5 hover:bg-black/80 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  مقارنة
                </button>
              )}

              {/* الحالة */}
              <div className="absolute top-2 right-2">
                {item.status === 'converting' && (
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
              <p className="text-[10px] font-black text-slate-500 mb-0.5">الحجم</p>
              <p className="text-xs font-black text-slate-900">
                {formatBytes(item.info?.size || 0)}
                <span className="text-slate-400 mx-1">→</span>
                <span className="text-emerald-600">
                  {formatBytes(item.convertedSize || 0)}
                </span>
              </p>
            </div>

            {/* التوفير */}
            {savings !== 0 && (
              <div className={`rounded-lg p-2.5 text-center ${
                savings > 0 ? 'bg-emerald-50' : 'bg-red-50'
              }`}>
                <p className={`text-[10px] font-black mb-0.5 ${
                  savings > 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {savings > 0 ? 'التوفير' : 'الزيادة'}
                </p>
                <p className={`text-xs font-black ${
                  savings > 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
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

        {/* الأزرار */}
        {hasResult ? (
          <button
            onClick={onDownload}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            تحميل الصورة
          </button>
        ) : item.status === 'error' && onReconvert ? (
          <button
            onClick={onReconvert}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ============================================================
// 🎯 تصدير جميع المكونات
// ============================================================

export default {
  UploadZone,
  ImageAnalyzer,
  ComparisonSlider,
  SettingsPanel,
  PresetButtons,
  ResultCard,
};