'use client';

// ============================================================
// 🎨 محوّل الصور الاحترافي — الصفحة الرئيسية
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles, Image as ImageIcon, Download, Trash2,
  Loader2, AlertCircle, CheckCircle2, Package,
  RefreshCw, FileArchive, Zap, Shield, Layers,
  ChevronDown, ChevronUp, X, Info, Play, ArrowDown,
} from 'lucide-react';

import type {
  ImageItem,
  ImageFormat,
  ConversionSettings,
  SmartPreset,
  AnalysisRecommendation,
} from '@/lib/image-converter/types';

import {
  SUPPORTED_FORMATS,
  SMART_PRESETS,
  DEFAULT_SETTINGS,
  LIMITS,
  STORAGE_KEY,
  TRANSPARENT_VALUE,
} from '@/lib/image-converter/constants';

import {
  generateId,
  formatBytes,
  isValidImageFile,
  getImageInfo,
  analyzeImage,
  downloadBlob,
  downloadUrl,
  getFileBasename,
  getFormatInfo,
  loadFromStorage,
  saveToStorage,
  calculateETA,
  formatDuration,
} from '@/lib/image-converter/utils';

import {
  convertImage,
  convertToMultipleFormats,
  applyPreset,
  unapplyPreset,
} from '@/lib/image-converter/converter';

import {
  UploadZone,
  ImageAnalyzer,
  ComparisonSlider,
  SettingsPanel,
  PresetButtons,
  ResultCard,
} from '@/components/image-converter/ImageConverterUI';

// ============================================================
// 🎛️ المكوّن الرئيسي
// ============================================================

export default function ImageConverterPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ConversionSettings>(() => {
    const saved = loadFromStorage<Partial<ConversionSettings>>(STORAGE_KEY, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  });
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    startTime: 0,
    eta: 0,
  });
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    isError: boolean;
  }>({
    message: '',
    visible: false,
    isError: false,
  });
  const [showStats, setShowStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsKeyRef = useRef<string>('');

  const activeItem = items.find(i => i.id === activeId) || null;

  const recommendations: AnalysisRecommendation[] = activeItem?.info
    ? analyzeImage(activeItem.info, activeItem.name, settings.format).recommendations
    : [];

  // ============================================
  // 💾 حفظ الإعدادات
  // ============================================
  useEffect(() => {
    saveToStorage(STORAGE_KEY, settings);
  }, [settings]);

  // ============================================
  // ✅ إلغاء نتائج التحويل عند تغيير الإعدادات
  // ============================================
  useEffect(() => {
    const currentKey = JSON.stringify({
      format: settings.format,
      quality: settings.quality,
      bg: settings.backgroundColor,
      resize: settings.resize,
      stripExif: settings.stripExif,
      multiFormat: settings.multiFormat.enabled,
    });

    if (settingsKeyRef.current === '') {
      settingsKeyRef.current = currentKey;
      return;
    }

    if (settingsKeyRef.current === currentKey) return;
    settingsKeyRef.current = currentKey;

    const hasConvertedItems = items.some(i => 
      i.status === 'done' || i.status === 'converting'
    );
    if (!hasConvertedItems) return;

    setItems(prev => prev.map(item => {
      if (item.status !== 'done' && item.status !== 'converting') {
        return item;
      }
      
      if (item.convertedUrl) {
        URL.revokeObjectURL(item.convertedUrl);
      }
      
      return {
        ...item,
        status: 'ready' as const,
        convertedUrl: undefined,
        convertedBlob: undefined,
        convertedSize: undefined,
        convertedFormat: undefined,
        multiFormatBlobs: undefined,
        name: item.file.name,
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.format,
    settings.quality,
    settings.backgroundColor,
    settings.resize.enabled,
    settings.resize.width,
    settings.resize.height,
    settings.resize.keepAspectRatio,
    settings.stripExif,
    settings.multiFormat.enabled,
  ]);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  // ============================================
  // 📥 إضافة ملفات
  // ============================================
  const handleFiles = useCallback(async (files: File[]) => {
    const remaining = LIMITS.MAX_IMAGES - items.length;
    if (remaining <= 0) {
      showToast(`وصلت للحد الأقصى ${LIMITS.MAX_IMAGES} صورة`, true);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files.slice(0, remaining)) {
      const validation = isValidImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        console.warn(`❌ ${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length === 0) {
      showToast('لم يتم قبول أي ملف صالح', true);
      return;
    }

    const newItems: ImageItem[] = validFiles.map(file => ({
      id: generateId(),
      file,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      info: null,
      status: 'analyzing',
    }));

    setItems(prev => [...prev, ...newItems]);
    if (!activeId && newItems[0]) {
      setActiveId(newItems[0].id);
    }

    showToast(`✅ تم إضافة ${validFiles.length} صورة`);
    
    setTimeout(async () => {
      for (const item of newItems) {
        try {
          const info = await getImageInfo(item.file);
          setItems(prev => prev.map(i => 
            i.id === item.id 
              ? { ...i, info, status: 'ready' }
              : i
          ));
        } catch (error) {
          console.error('Failed to read image info:', error);
          setItems(prev => prev.map(i => 
            i.id === item.id 
              ? { 
                  ...i, 
                  status: 'error', 
                  errorMessage: 'فشل قراءة الصورة' 
                }
              : i
          ));
        }
      }
    }, 100);
  }, [items.length, activeId, showToast]);

  const handleRemove = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
      }
      return prev.filter(i => i.id !== id);
    });
    
    if (activeId === id) {
      const remaining = items.filter(i => i.id !== id);
      setActiveId(remaining[0]?.id || null);
    }
  }, [activeId, items]);

  const handleClearAll = useCallback(() => {
    if (!confirm('هل تريد حذف جميع الصور؟')) return;
    
    items.forEach(item => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    
    setItems([]);
    setActiveId(null);
    showToast('🗑️ تم حذف جميع الصور');
  }, [items, showToast]);

  const handlePresetSelect = useCallback((preset: SmartPreset) => {
    setSettings(prev => applyPreset(preset, prev));
    showToast(`✨ تم تطبيق: ${SMART_PRESETS[preset].name}`);
  }, [showToast]);

  const handlePresetClear = useCallback(() => {
    setSettings(prev => unapplyPreset(prev));
  }, []);

  // ============================================
  // 🚀 التحويل
  // ============================================
  const handleConvert = useCallback(async () => {
    if (items.length === 0) return;
    
    const readyItems = items.filter(i => i.status === 'ready');
    if (readyItems.length === 0) {
      showToast('لا توجد صور جاهزة للتحويل', true);
      return;
    }

    setIsConverting(true);
    setProgress({
      current: 0,
      total: readyItems.length,
      startTime: performance.now(),
      eta: 0,
    });

    const formatInfo = getFormatInfo(settings.format);
    if (!formatInfo) {
      showToast('الصيغة غير مدعومة', true);
      setIsConverting(false);
      return;
    }

    for (let i = 0; i < readyItems.length; i++) {
      const item = readyItems[i];
      
      setItems(prev => prev.map(it => 
        it.id === item.id 
          ? { ...it, status: 'converting' }
          : it
      ));

      try {
        const result = await convertImage(item.file, settings);
        
        if (result.success && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          const ext = formatInfo.extension;
          const newName = `${getFileBasename(item.name)}.${ext}`;
          
          let multiFormatBlobs: Partial<Record<ImageFormat, Blob>> | undefined;
          if (settings.multiFormat.enabled && settings.multiFormat.formats.length > 0) {
            multiFormatBlobs = await convertToMultipleFormats(item.file, settings);
          }
          
          setItems(prev => prev.map(it => 
            it.id === item.id 
              ? {
                  ...it,
                  status: 'done',
                  convertedUrl: blobUrl,
                  convertedBlob: result.blob,
                  convertedSize: result.blob!.size,
                  convertedFormat: settings.format,
                  name: newName,
                  multiFormatBlobs,
                }
              : it
          ));
        } else {
          setItems(prev => prev.map(it => 
            it.id === item.id 
              ? {
                  ...it,
                  status: 'error',
                  errorMessage: result.error || 'فشل التحويل',
                }
              : it
          ));
        }
      } catch (error) {
        setItems(prev => prev.map(it => 
          it.id === item.id 
            ? {
                ...it,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'خطأ غير معروف',
              }
            : it
        ));
      }

      const current = i + 1;
      const elapsed = performance.now() - progress.startTime;
      const eta = calculateETA(current, readyItems.length, elapsed);
      
      setProgress({
        current,
        total: readyItems.length,
        startTime: progress.startTime,
        eta: eta || 0,
      });

      await new Promise(r => setTimeout(r, 50));
    }

    setIsConverting(false);
    showToast(`✅ تم تحويل ${readyItems.length} صورة`);
  }, [items, settings, progress.startTime, showToast]);

  const handleDownload = useCallback((item: ImageItem) => {
    if (item.convertedUrl && item.convertedBlob) {
      downloadUrl(item.convertedUrl, item.name);
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    const doneItems = items.filter(i => i.status === 'done' && i.convertedBlob);
    if (doneItems.length === 0) {
      showToast('لا توجد صور للتحميل', true);
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('intooly-converted');
      
      for (const item of doneItems) {
        if (item.convertedBlob) {
          folder?.file(item.name, item.convertedBlob);
        }
        
        if (item.multiFormatBlobs) {
          for (const [format, blob] of Object.entries(item.multiFormatBlobs)) {
            if (blob) {
              const baseName = getFileBasename(item.name);
              const formatInfo = getFormatInfo(format as ImageFormat);
              folder?.file(`${baseName}.${formatInfo?.extension || format}`, blob);
            }
          }
        }
      }
      
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      
      downloadBlob(content, `intooly-images-${Date.now()}.zip`);
      showToast(`📦 تم تحميل ${doneItems.length} صورة`);
    } catch (error) {
      console.error('ZIP error:', error);
      showToast('فشل إنشاء ملف ZIP', true);
    }
  }, [items, showToast]);

  // ============================================
  // 📊 إحصائيات
  // ============================================
  const stats = {
    total: items.length,
    done: items.filter(i => i.status === 'done').length,
    ready: items.filter(i => i.status === 'ready').length,
    totalOriginal: items.reduce((sum, i) => sum + (i.info?.size || 0), 0),
    totalConverted: items
      .filter(i => i.status === 'done')
      .reduce((sum, i) => sum + (i.convertedSize || 0), 0),
  };

  const totalSavings = stats.totalOriginal > 0 
    ? stats.totalOriginal - stats.totalConverted 
    : 0;
  const savingsPercent = stats.totalOriginal > 0
    ? (totalSavings / stats.totalOriginal) * 100
    : 0;

  // ============================================
  // 🎨 الواجهة
  // ============================================
  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Toast */}
      {toast.visible && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
            px-6 py-3 rounded-full font-black shadow-2xl
            max-w-[90vw] text-center text-sm
            ${toast.isError 
              ? 'bg-red-600 text-white' 
              : 'bg-slate-900 text-white'
            }
          `}
        >
          {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-8 md:py-12 overflow-hidden border-b border-slate-200">
        <div
          className="absolute inset-0 opacity-20 text-slate-900"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <ImageIcon className="w-8 h-8 md:w-9 md:h-9 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900">
                محوّل الصور
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-black mb-4">
              <Sparkles className="w-4 h-4" />
              محلي 100% · 9 صيغ · بدون رفع
            </div>

            <p className="text-base md:text-lg text-slate-600 font-bold mb-6 max-w-2xl mx-auto">
              حوّل صورك بين <span className="text-amber-600">JPG, PNG, WebP, AVIF, HEIC</span> وأكثر — بجودة احترافية وسرعة فائقة
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[
                { icon: Shield, label: 'خصوصية كاملة', color: 'bg-emerald-100 text-emerald-700' },
                { icon: Zap, label: 'سريع جداً', color: 'bg-amber-100 text-amber-700' },
                { icon: Layers, label: '9 صيغ', color: 'bg-blue-100 text-blue-700' },
              ].map((badge, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${badge.color}`}
                >
                  <badge.icon className="w-3.5 h-3.5" />
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* الأداة الرئيسية */}
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* حالة: لا توجد صور */}
          {items.length === 0 && (
            <div className="space-y-6">
              <UploadZone onFiles={handleFiles} currentCount={0} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                {[
                  { icon: '🍎', title: 'دعم HEIC', desc: 'صور iPhone' },
                  { icon: '⚡', title: 'AVIF', desc: 'أصغر 70%' },
                  { icon: '📦', title: 'دفعي', desc: 'حتى 100 صورة' },
                  { icon: '🔒', title: 'حذف EXIF', desc: 'حماية خصوصية' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="bg-white border-2 border-slate-200 rounded-xl p-4 text-center hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-3xl mb-2">{f.icon}</div>
                    <h3 className="font-black text-sm text-slate-900 mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-500 font-bold">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-right">
                    <h4 className="font-black text-sm text-slate-900 mb-1">
                      💡 معلومة سريعة
                    </h4>
                    <p className="text-xs text-slate-700 font-bold leading-relaxed">
                      جميع المعالجة تحدث <strong className="text-amber-600">محلياً في متصفحك</strong>. لا تُرفع أي صورة لأي خادم — خصوصيتك مضمونة 100%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* حالة: توجد صور */}
          {items.length > 0 && (
            <div className="space-y-6">

              {/* Header الإجراءات */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-right">
                    <h2 className="font-black text-slate-900 text-sm md:text-base">
                      {items.length} صورة
                    </h2>
                    <p className="text-xs text-slate-500 font-bold">
                      {stats.done > 0 && `${stats.done} جاهزة · `}
                      {stats.ready > 0 && `${stats.ready} في الانتظار · `}
                      {stats.totalOriginal > 0 && `${formatBytes(stats.totalOriginal)}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {stats.done > 0 && (
                    <button
                      onClick={() => setShowStats(!showStats)}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      📊 إحصائيات
                    </button>
                  )}

                  <button
                    onClick={handleClearAll}
                    className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف الكل
                  </button>
                </div>
              </div>

              {/* الإحصائيات */}
              {showStats && stats.done > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-slate-500 mb-1">إجمالي الأصلي</p>
                      <p className="text-lg font-black text-slate-900">
                        {formatBytes(stats.totalOriginal)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-slate-500 mb-1">بعد التحويل</p>
                      <p className="text-lg font-black text-slate-900">
                        {formatBytes(stats.totalConverted)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-slate-500 mb-1">التوفير</p>
                      <p className="text-lg font-black text-emerald-600">
                        ↓ {Math.round(savingsPercent)}%
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-slate-500 mb-1">عدد الصور</p>
                      <p className="text-lg font-black text-amber-600">
                        {stats.done}/{stats.total}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Grid الرئيسي — بدون Sticky */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ✅ العمود الأيسر: الصورة + النتيجة + النتائج */}
                <div className="space-y-4">
                  {activeItem && activeItem.info && (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">

                      {activeItem.status === 'done' && activeItem.convertedUrl ? (
                        <div className="space-y-3">
                          {/* ✅ الأصلية فوق */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-black text-slate-600 text-center bg-slate-100 rounded-md py-1">
                              📷 الأصلية · {formatBytes(activeItem.info.size)}
                            </div>
                            <div
                              className="relative rounded-lg overflow-hidden"
                              style={{
                                aspectRatio: 1,
                                maxHeight: '300px',
                                backgroundColor: '#f8fafc',
                                backgroundImage: `
                                  linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                                  linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                                  linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                                  linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                                `,
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                              }}
                            >
                              <img
                                src={activeItem.originalUrl}
                                alt="الأصلية"
                                className="absolute inset-0 w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 text-center">
                              {activeItem.info.width}×{activeItem.info.height} · {activeItem.info.format.toUpperCase()}
                            </div>
                          </div>

                          {/* ✅ سهم صغير للأسفل */}
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
                              <ArrowDown className="w-3 h-3 text-amber-700" />
                              <span className="text-[10px] font-black text-amber-700">النتيجة</span>
                            </div>
                          </div>

                          {/* ✅ المحوّلة تحت */}
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-black text-white text-center bg-emerald-500 rounded-md py-1">
                              ✨ المحوّلة · {formatBytes(activeItem.convertedSize || 0)}
                            </div>
                            <div
                              className="relative rounded-lg overflow-hidden"
                              style={{
                                aspectRatio: 1,
                                maxHeight: '300px',
                                backgroundColor:
                                  settings.backgroundColor === TRANSPARENT_VALUE
                                    ? '#f8fafc'
                                    : settings.backgroundColor,
                                backgroundImage:
                                  settings.backgroundColor === TRANSPARENT_VALUE
                                    ? `linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                                       linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                                       linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                                       linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)`
                                    : undefined,
                                backgroundSize:
                                  settings.backgroundColor === TRANSPARENT_VALUE ? '20px 20px' : undefined,
                                backgroundPosition:
                                  settings.backgroundColor === TRANSPARENT_VALUE
                                    ? '0 0, 0 10px, 10px -10px, -10px 0px'
                                    : undefined,
                              }}
                            >
                              <img
                                src={activeItem.convertedUrl}
                                alt="المحوّلة"
                                className="absolute inset-0 w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 text-center">
                              {activeItem.convertedFormat?.toUpperCase()}
                            </div>
                          </div>

                          {/* المقارنة التفاعلية */}
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] font-black text-slate-500 mb-2 text-center">
                              👁️ المقارنة التفاعلية
                            </p>
                            <ComparisonSlider
                              beforeUrl={activeItem.originalUrl}
                              afterUrl={activeItem.convertedUrl}
                              beforeSize={activeItem.info.size}
                              afterSize={activeItem.convertedSize}
                              aspectRatio={1}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden bg-slate-900" style={{ aspectRatio: 1 }}>
                          <img
                            src={activeItem.originalUrl}
                            alt={activeItem.name}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                          <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-black">
                            {activeItem.info.width}×{activeItem.info.height}
                          </div>
                          <div className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-black">
                            {formatBytes(activeItem.info.size)}
                          </div>

                          {activeItem.status === 'ready' && (
                            <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-lg bg-amber-500/95 backdrop-blur-sm text-white text-[10px] font-black text-center">
                              ⏳ اضغط "ابدأ التحويل" لرؤية النتيجة
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* التحليل الذكي */}
                  {recommendations.length > 0 && (
                    <ImageAnalyzer recommendations={recommendations} />
                  )}

                  {/* شريط الصور */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black text-xs text-slate-700">
                        الصور ({items.length})
                      </h3>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-black text-amber-600 hover:text-amber-700"
                      >
                        + إضافة
                      </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveId(item.id)}
                          className={`
                            relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                            ${activeId === item.id
                              ? 'border-amber-500 ring-2 ring-amber-200'
                              : 'border-slate-200 hover:border-amber-300'
                            }
                          `}
                        >
                          <img
                            src={item.convertedUrl || item.originalUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.status === 'done' && (
                            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          {item.status === 'converting' && (
                            <div className="absolute inset-0 bg-blue-500/60 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                          {item.status === 'error' && (
                            <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                              <AlertCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {item.status === 'ready' && (
                            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                              <span className="text-[8px] text-white font-black">⏳</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ النتائج داخل العمود الأيسر */}
                  {stats.done > 0 && (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                      <h3 className="font-black text-xs text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-base">✨</span>
                        النتائج ({stats.done})
                      </h3>
                      <div className="space-y-3">
                        {items
                          .filter(i => i.status === 'done')
                          .map((item) => (
                            <ResultCard
                              key={item.id}
                              item={item}
                              onDownload={() => handleDownload(item)}
                              onRemove={() => handleRemove(item.id)}
                              onReconvert={handleConvert}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* العمود الأيمن: الإعدادات */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                    <PresetButtons
                      activePreset={settings.smartPreset}
                      onSelect={handlePresetSelect}
                      onClear={handlePresetClear}
                    />

                    <div className="my-4 h-px bg-slate-200" />

                    <SettingsPanel
                      settings={settings}
                      onChange={setSettings}
                      hasAlpha={activeItem?.info?.hasAlpha}
                      originalDimensions={
                        activeItem?.info 
                          ? { 
                              width: activeItem.info.width, 
                              height: activeItem.info.height 
                            }
                          : undefined
                      }
                    />
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={isConverting || items.every(i => i.status !== 'ready')}
                    className={`
                      w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all
                      ${isConverting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                      }
                      text-white
                    `}
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحويل {progress.current}/{progress.total}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        ابدأ التحويل ({items.filter(i => i.status === 'ready').length})
                      </>
                    )}
                  </button>

                  {isConverting && (
                    <div className="bg-white border-2 border-amber-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-700">
                          جاري المعالجة...
                        </span>
                        <span className="text-xs font-black text-amber-600">
                          {Math.round((progress.current / progress.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                      {progress.eta > 0 && (
                        <p className="mt-2 text-xs text-slate-500 font-bold text-center">
                          متبقٍ: {formatDuration(progress.eta)}
                        </p>
                      )}
                    </div>
                  )}

                  {stats.done > 1 && (
                    <button
                      onClick={handleDownloadAll}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <FileArchive className="w-5 h-5" />
                      تحميل الكل (ZIP) — {stats.done} صورة
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* SEO Section */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              ما هو محوّل الصور؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              <strong>محوّل الصور</strong> من intooly هو أداة احترافية تعمل بالكامل في متصفحك، تتيح لك التحويل بين <strong>9 صيغ مختلفة</strong> من الصور بجودة عالية.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              كل شيء يحدث <strong className="text-amber-600">محلياً 100%</strong> — لا تُرفع صورك إلى أي خادم خارجي.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-slate-900">
              المميزات الاحترافية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🍎', title: 'دعم HEIC', desc: 'حوّل صور iPhone إلى JPG أو WebP' },
                { icon: '⚡', title: 'AVIF الحديثة', desc: 'أصغر 70% من JPG' },
                { icon: '📦', title: 'معالجة دفعية', desc: 'حتى 100 صورة' },
                { icon: '🔒', title: 'حذف EXIF', desc: 'حماية خصوصيتك' },
                { icon: '👁️', title: 'مقارنة قبل/بعد', desc: 'شريط تفاعلي' },
                { icon: '🎨', title: '9 صيغ', desc: 'JPG, PNG, WebP, AVIF, HEIC...' },
                { icon: '✨', title: 'تصدير متعدد', desc: 'صورة → عدة صيغ' },
                { icon: '⚙️', title: '6 إعدادات سريعة', desc: 'واتساب، إنستغرام...' },
                { icon: '🔍', title: 'تحليل ذكي', desc: 'توصيات تلقائية' },
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 hover:border-amber-400 transition-colors">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-black text-sm text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-slate-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { 
                  q: 'كيف أحوّل صورة HEIC من iPhone إلى JPG؟', 
                  a: 'ارفع صورة HEIC وسيقوم المتصفح بتحويلها تلقائياً. اختر "JPG" كصيغة نهائية واضغط "ابدأ التحويل".' 
                },
                { 
                  q: 'ما هي أفضل صيغة للصور على الويب؟', 
                  a: 'WebP هي الأفضل — توفر 30-50% من حجم JPG. AVIF أفضل لكن دعمها أقل.' 
                },
                { 
                  q: 'هل صوري آمنة؟', 
                  a: 'نعم 100%. كل المعالجة تحدث في متصفحك. لا نرفع صورك لأي خادم.' 
                },
                { 
                  q: 'كيف أقلل حجم الصورة؟', 
                  a: 'استخدم WebP بجودة 85%، أو اختر preset "ويب" أو "بريد".' 
                },
                { 
                  q: 'ما هو حذف EXIF؟', 
                  a: 'EXIF هي بيانات مخفية تحتوي على معلومات الكاميرا وGPS. حذفها يحمي خصوصيتك.' 
                },
                { 
                  q: 'هل يمكن تحويل عدة صور دفعة واحدة؟', 
                  a: 'نعم، حتى 100 صورة. يمكنك تحميلها كملف ZIP واحد.' 
                },
              ].map((faq, i) => (
                <details key={i} className="bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-black text-slate-900 flex justify-between items-center hover:bg-slate-100 transition-colors text-sm">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-amber-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-200 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article className="mt-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-slate-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '🗜️', title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل حجم الصور' },
                { icon: '📏', title: 'تغيير الحجم', href: '/tools/image-resizer', desc: 'غيّر الأبعاد' },
                { icon: '✂️', title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
                { icon: '🎨', title: 'استوديو المنتجات', href: '/tools/product-photo-studio', desc: 'صور احترافية' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-center hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="text-3xl mb-2">{tool.icon}</div>
                  <h3 className="font-black text-sm text-slate-900">{tool.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* input مخفي */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.heic,.heif"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) handleFiles(files);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}