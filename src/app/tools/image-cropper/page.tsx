'use client';

// ============================================================
// ✂️ أداة قص الصور الاحترافية — الصفحة الرئيسية
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles, Scissors, Trash2, Loader2, AlertCircle,
  CheckCircle2, FileArchive, Zap, Shield, Layers,
  ChevronDown, Info, Play, Image as ImageIcon,
  Package,
} from 'lucide-react';

import type {
  ImageItem,
  CropArea,
  CropSettings,
  PresetTemplate,
  AspectRatioId,
} from '@/lib/image-cropper/types';

import {
  ASPECT_RATIOS,
  PRESET_TEMPLATES,
  LIMITS,
  STORAGE_KEY,
  OUTPUT_FORMATS,
  DEFAULT_SETTINGS,
} from '@/lib/image-cropper/constants';

import {
  getImageInfo,
  getDefaultCropArea,
  cropImage,
  downloadBlob,
  generateId,
  formatBytes,
} from '@/lib/image-cropper/cropper';

import CropCanvas from '@/components/image-cropper/CropCanvas';
import CropControls from '@/components/image-cropper/CropControls';
import PresetTemplates from '@/components/image-cropper/PresetTemplates';
import ResultCard from '@/components/image-cropper/ResultCard';

// ============================================================
// 🎛️ المكوّن الرئيسي
// ============================================================

export default function ImageCropperPage() {
  // ============================================
  // 📊 الحالة
  // ============================================
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    aspectRatio: 'free',
    customRatio: { width: 1, height: 1 },
    shape: 'rectangle',
    borderRadius: 0,
    area: { x: 0, y: 0, width: 0, height: 0 },
    lockAspectRatio: false,
    showGrid: true,
    gridType: 'thirds',
  });
  const [activeTemplateId, setActiveTemplateId] = useState<string>('custom-size');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    isError: boolean;
  }>({ message: '', visible: false, isError: false });
  const [showStats, setShowStats] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // 📌 الصورة النشطة
  // ============================================
  const activeItem = items.find((i) => i.id === activeId) || null;

  // ============================================
  // 🔔 Toast
  // ============================================
  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  // ============================================
  // 🔄 تحديث منطقة القص عند تغيير الصورة النشطة
  // ============================================
  useEffect(() => {
    if (!activeItem?.info) return;

    // إذا كانت الصورة لها إعدادات محفوظة
    if (activeItem.settings) {
      setCropSettings(activeItem.settings);
      return;
    }

    // إعدادات افتراضية
    const defaultArea = getDefaultCropArea(
      activeItem.info.width,
      activeItem.info.height,
      'free'
    );

    const newSettings: CropSettings = {
      ...cropSettings,
      area: defaultArea,
    };

    setCropSettings(newSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, activeItem?.info]);

  // ============================================
  // 📥 إضافة ملفات
  // ============================================
  const handleFiles = useCallback(
    async (files: File[]) => {
      const remaining = LIMITS.MAX_IMAGES - items.length;
      if (remaining <= 0) {
        showToast(`وصلت للحد الأقصى ${LIMITS.MAX_IMAGES} صورة`, true);
        return;
      }

      const validFiles: File[] = [];
      for (const file of files.slice(0, remaining)) {
        if (file.size === 0) continue;
        if (file.size > LIMITS.MAX_FILE_SIZE) {
          showToast(`الملف ${file.name} يتجاوز 25 MB`, true);
          continue;
        }
        if (
          !file.type.startsWith('image/') &&
          !/\.(jpg|jpeg|png|webp|avif|heic|heif|gif|bmp|tiff|tif|ico|jfif)$/i.test(file.name)
        ) {
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        showToast('لم يتم قبول أي ملف صالح', true);
        return;
      }

      const newItems: ImageItem[] = validFiles.map((file) => ({
        id: generateId(),
        file,
        name: file.name,
        originalUrl: URL.createObjectURL(file),
        info: null,
        status: 'analyzing',
      }));

      setItems((prev) => [...prev, ...newItems]);
      if (!activeId && newItems[0]) {
        setActiveId(newItems[0].id);
      }

      showToast(`✅ تم إضافة ${validFiles.length} صورة`);

      // قراءة معلومات الصور
      setTimeout(async () => {
        for (const item of newItems) {
          try {
            const info = await getImageInfo(item.file);
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, info, status: 'ready' } : i
              )
            );
          } catch (error) {
            console.error('Failed to read image info:', error);
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      status: 'error',
                      errorMessage: 'فشل قراءة الصورة',
                    }
                  : i
              )
            );
          }
        }
      }, 100);
    },
    [items.length, activeId, showToast]
  );

  // ============================================
  // 🗑️ حذف صورة
  // ============================================
  const handleRemove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) {
          URL.revokeObjectURL(item.originalUrl);
          if (item.croppedUrl) URL.revokeObjectURL(item.croppedUrl);
        }
        return prev.filter((i) => i.id !== id);
      });

      if (activeId === id) {
        const remaining = items.filter((i) => i.id !== id);
        setActiveId(remaining[0]?.id || null);
      }
    },
    [activeId, items]
  );

  // ============================================
  // 🧹 حذف الكل
  // ============================================
  const handleClearAll = useCallback(() => {
    if (!confirm('هل تريد حذف جميع الصور؟')) return;

    items.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.croppedUrl) URL.revokeObjectURL(item.croppedUrl);
    });

    setItems([]);
    setActiveId(null);
    showToast('🗑️ تم حذف جميع الصور');
  }, [items, showToast]);

  // ============================================
  // 🎯 اختيار قالب جاهز
  // ============================================
  const handleTemplateSelect = useCallback(
    (template: PresetTemplate) => {
      if (template.id === 'custom-size') return;

      setActiveTemplateId(template.id);

      // حساب النسبة من الأبعاد
      const ratio = template.width / template.height;

      // تحديث الإعدادات
      const newSettings: CropSettings = {
        ...cropSettings,
        aspectRatio: 'custom',
        customRatio: {
          width: template.width,
          height: template.height,
        },
        lockAspectRatio: true,
      };

      // حساب منطقة القص
      if (activeItem?.info) {
        const area = getDefaultCropArea(
          activeItem.info.width,
          activeItem.info.height,
          'custom',
          { width: template.width, height: template.height }
        );
        newSettings.area = area;
      }

      setCropSettings(newSettings);
      showToast(`✅ تم تطبيق: ${template.name}`);
    },
    [cropSettings, activeItem, showToast]
  );

  // ============================================
  // 🎨 تحديث إعدادات القص
  // ============================================
  const handleCropChange = useCallback((area: CropArea) => {
    setCropSettings((prev) => ({ ...prev, area }));
  }, []);

  const handleSettingsChange = useCallback(
    (newSettings: CropSettings) => {
      // إعادة حساب منطقة القص إذا تغيرت النسبة
      if (
        activeItem?.info &&
        newSettings.aspectRatio !== cropSettings.aspectRatio
      ) {
        const area = getDefaultCropArea(
          activeItem.info.width,
          activeItem.info.height,
          newSettings.aspectRatio,
          newSettings.customRatio
        );
        newSettings.area = area;
      }

      setCropSettings(newSettings);

      // إلغاء تفعيل القالب عند التعديل اليدوي
      if (newSettings.aspectRatio !== 'custom') {
        setActiveTemplateId('');
      }
    },
    [activeItem, cropSettings.aspectRatio]
  );

  // ============================================
  // ✂️ تنفيذ القص
  // ============================================
  const handleCrop = useCallback(async () => {
    if (!activeItem || !activeItem.info) return;

    if (cropSettings.area.width < 10 || cropSettings.area.height < 10) {
      showToast('منطقة القص صغيرة جدًا', true);
      return;
    }

    setIsProcessing(true);

    setItems((prev) =>
      prev.map((i) =>
        i.id === activeItem.id ? { ...i, status: 'cropping' } : i
      )
    );

    try {
      const result = await cropImage(
        activeItem.originalUrl,
        cropSettings.area,
        cropSettings,
        'jpeg',
        0.92
      );

      if (result.success && result.blob && result.url) {
        const newName = `${activeItem.name.replace(/\.[^.]+$/, '')}-cropped.jpg`;

        setItems((prev) =>
          prev.map((i) =>
            i.id === activeItem.id
              ? {
                  ...i,
                  status: 'done',
                  croppedUrl: result.url,
                  croppedBlob: result.blob,
                  croppedSize: result.blob!.size,
                  name: newName,
                  settings: { ...cropSettings },
                }
              : i
          )
        );

        showToast('✅ تم القص بنجاح');
      } else {
        throw new Error(result.error || 'فشل القص');
      }
    } catch (error) {
      console.error('Crop error:', error);
      setItems((prev) =>
        prev.map((i) =>
          i.id === activeItem.id
            ? {
                ...i,
                status: 'error',
                errorMessage:
                  error instanceof Error ? error.message : 'خطأ غير معروف',
              }
            : i
        )
      );
      showToast('❌ فشل القص', true);
    } finally {
      setIsProcessing(false);
    }
  }, [activeItem, cropSettings, showToast]);

  // ============================================
  // 📥 تحميل صورة
  // ============================================
  const handleDownload = useCallback((item: ImageItem) => {
    if (item.croppedBlob) {
      downloadBlob(item.croppedBlob, item.name);
      showToast('⬇️ بدأ التحميل');
    }
  }, [showToast]);

  // ============================================
  // 📦 تحميل الكل (ZIP)
  // ============================================
  const handleDownloadAll = useCallback(async () => {
    const doneItems = items.filter(
      (i) => i.status === 'done' && i.croppedBlob
    );
    if (doneItems.length === 0) {
      showToast('لا توجد صور للتحميل', true);
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('intooly-cropped');

      for (const item of doneItems) {
        if (item.croppedBlob) {
          folder?.file(item.name, item.croppedBlob);
        }
      }

      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      downloadBlob(content, `intooly-cropped-${Date.now()}.zip`);
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
    done: items.filter((i) => i.status === 'done').length,
    ready: items.filter((i) => i.status === 'ready').length,
    totalOriginal: items.reduce((sum, i) => sum + (i.info?.size || 0), 0),
    totalCropped: items
      .filter((i) => i.status === 'done')
      .reduce((sum, i) => sum + (i.croppedSize || 0), 0),
  };

  const savingsPercent =
    stats.totalOriginal > 0
      ? Math.round(
          ((stats.totalOriginal - stats.totalCropped) / stats.totalOriginal) *
            100
        )
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
            ${toast.isError ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}
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
                <Scissors className="w-8 h-8 md:w-9 md:h-9 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900">
                اقتصّ صورك
              </h1>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-black mb-4">
              <Sparkles className="w-4 h-4" />
              محلي 100% · قوالب جاهزة · بدون رفع
            </div>

            <p className="text-base md:text-lg text-slate-600 font-bold mb-6 max-w-2xl mx-auto">
              اقتصّ صورك بأي نسبة أو قالب جاهز — سوشيال ميديا، ماركت بليس، وطباعة
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[
                { icon: Shield, label: 'خصوصية كاملة', color: 'bg-emerald-100 text-emerald-700' },
                { icon: Zap, label: 'سريع جداً', color: 'bg-amber-100 text-amber-700' },
                { icon: Layers, label: 'قوالب جاهزة', color: 'bg-blue-100 text-blue-700' },
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
              {/* Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl p-8 md:p-14 cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-lg transition-all text-center group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) handleFiles(files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Scissors className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                      اسحب صورك هنا للقص
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 mb-1">
                      أو انقر للاختيار — <strong className="text-amber-600">حتى {LIMITS.MAX_IMAGES} صورة</strong>
                    </p>
                    <p className="text-xs text-slate-500 font-bold">
                      📷 JPG · PNG · WebP · AVIF · HEIC · GIF · BMP · TIFF
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-2">
                    {[
                      { icon: Shield, label: 'محلي 100%', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                      { icon: Zap, label: 'سريع جداً', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                      { icon: Layers, label: '20+ قالب', color: 'text-blue-600 bg-blue-50 border-blue-200' },
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

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                {[
                  { icon: '📱', title: 'سوشيال ميديا', desc: '8 قوالب' },
                  { icon: '🛒', title: 'ماركت بليس', desc: '5 قوالب' },
                  { icon: '🖨️', title: 'طباعة', desc: '4 قوالب' },
                  { icon: '⚙️', title: 'مخصص', desc: 'حر تمامًا' },
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

              {/* Info */}
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

              {/* Header */}
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
                      {stats.done > 0 && `${stats.done} مقصوصة · `}
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

              {/* Stats */}
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
                      <p className="text-xs font-black text-slate-500 mb-1">بعد القص</p>
                      <p className="text-lg font-black text-slate-900">
                        {formatBytes(stats.totalCropped)}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                      <p className="text-xs font-black text-slate-500 mb-1">التوفير</p>
                      <p className="text-lg font-black text-emerald-600">
                        ↓ {Math.abs(savingsPercent)}%
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

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* العمود الأيسر: Canvas + النتائج */}
                <div className="space-y-4">
                  {activeItem && activeItem.info && (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                      <div className="relative rounded-xl overflow-hidden bg-slate-100 mb-3" style={{ minHeight: '400px' }}>
                        <CropCanvas
                          imageUrl={activeItem.originalUrl}
                          imageWidth={activeItem.info.width}
                          imageHeight={activeItem.info.height}
                          cropArea={cropSettings.area}
                          settings={cropSettings}
                          onCropChange={handleCropChange}
                        />
                      </div>

                      <button
                        onClick={handleCrop}
                        disabled={isProcessing || activeItem.status === 'cropping'}
                        className={`
                          w-full py-3 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all
                          ${isProcessing || activeItem.status === 'cropping'
                            ? 'bg-slate-400 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-white'
                          }
                        `}
                      >
                        {isProcessing || activeItem.status === 'cropping' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري القص...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            اقتصّ الصورة
                          </>
                        )}
                      </button>
                    </div>
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
                            src={item.croppedUrl || item.originalUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.status === 'done' && (
                            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          {item.status === 'cropping' && (
                            <div className="absolute inset-0 bg-blue-500/60 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
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

                  {/* النتائج */}
                  {stats.done > 0 && (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                      <h3 className="font-black text-xs text-slate-700 mb-3 flex items-center gap-2">
                        <span className="text-base">✨</span>
                        النتائج ({stats.done})
                      </h3>
                      <div className="space-y-3">
                        {items
                          .filter((i) => i.status === 'done')
                          .map((item) => (
                            <ResultCard
                              key={item.id}
                              item={item}
                              onDownload={() => handleDownload(item)}
                              onRemove={() => handleRemove(item.id)}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* العمود الأيمن: الإعدادات */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                    <PresetTemplates
                      onSelect={handleTemplateSelect}
                      activeTemplateId={activeTemplateId}
                      onCustomSelect={() => setActiveTemplateId('custom-size')}
                    />

                    <div className="my-4 h-px bg-slate-200" />

                    <CropControls
                      settings={cropSettings}
                      onChange={handleSettingsChange}
                      originalWidth={activeItem?.info?.width || 0}
                      originalHeight={activeItem?.info?.height || 0}
                    />
                  </div>

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
              ما هو اقتصاص الصور؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              <strong>أداة قص الصور</strong> من intooly هي أداة احترافية تتيح لك اقتصاص صورك بأي نسبة أو قالب جاهز. مثالية للمصممين، أصحاب المتاجر، وصناع المحتوى.
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
                { icon: '📐', title: '9 نسب جاهزة', desc: '1:1، 4:3، 16:9، 9:16...' },
                { icon: '🎨', title: '20+ قالب', desc: 'سوشيال + ماركت بليس + طباعة' },
                { icon: '⚪', title: 'قص دائري', desc: 'للصور الشخصية والبروفايل' },
                { icon: '📏', title: 'شبكة ذهبية', desc: 'للقاعدة الذهبية والتثليث' },
                { icon: '🔒', title: 'قفل النسبة', desc: 'حافظ على الأبعاد' },
                { icon: '📦', title: 'تحميل ZIP', desc: 'حمّل كل الصور دفعة واحدة' },
                { icon: '👁️', title: 'مقارنة قبل/بعد', desc: 'شريط تفاعلي' },
                { icon: '⚡', title: 'سريع جداً', desc: 'Canvas API محلي' },
                { icon: '🔒', title: 'خصوصية 100%', desc: 'صورك لا تغادر جهازك' },
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
                { q: 'كيف أقص صورة لمقاس إنستغرام؟', a: 'اختر قالب "إنستغرام مربع" من قائمة القوالب، وستُطبَّق نسبة 1:1 تلقائيًا (1080×1080).' },
                { q: 'ما هي أفضل نسبة لصور المنتجات؟', a: '1:1 (مربعة) هي الأفضل لأمازون ونون وحراج. يمكنك استخدام قالب "أمازون" مباشرة.' },
                { q: 'هل صوري آمنة؟', a: 'نعم 100%. كل المعالجة تحدث في متصفحك. لا نرفع صورك لأي خادم.' },
                { q: 'هل يمكنني القص دائريًا؟', a: 'نعم، اختر "دائرة" من قسم شكل القص.' },
                { q: 'ما هو الخط الذهبي؟', a: 'شبكة التوجيه الذهبية تساعدك على تقسيم الصورة بالنسب الجمالية المثالية (38.2% و 61.8%).' },
                { q: 'هل يمكن قص عدة صور دفعة واحدة؟', a: 'نعم، حتى 50 صورة. يمكنك تحميلها كملف ZIP واحد.' },
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
                { icon: '🎨', title: 'محوّل الصور', href: '/tools/image-converter', desc: '9 صيغ' },
                { icon: '🗜️', title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل الحجم' },
                { icon: '📏', title: 'تغيير الحجم', href: '/tools/image-resizer', desc: 'غيّر الأبعاد' },
                { icon: '✂️', title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
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
    </div>
  );
}