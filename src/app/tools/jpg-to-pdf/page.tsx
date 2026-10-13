'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ImagePlus,
  Upload,
  X,
  Download,
  LoaderCircle,
  ArrowLeft,
  FileText,
  Shield,
  Zap,
  Lock,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type ImageItem = {
  id: string;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
};

type PageSize = 'a4' | 'letter' | 'fit';
type Orientation = 'portrait' | 'landscape';
type Margin = 'none' | 'small' | 'medium';

const PAGE_SIZES: Record<PageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  fit: [0, 0],
};

const MARGINS: Record<Margin, number> = {
  none: 0,
  small: 20,
  medium: 40,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState<Margin>('small');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles) return;
    setError('');
    setResultUrl(null);

    const validItems: ImageItem[] = [];

    for (const file of Array.from(newFiles)) {
      if (!file.type.startsWith('image/')) {
        setError(`الملف "${file.name}" ليس صورة.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError(`الصورة "${file.name}" أكبر من 50 ميغابايت.`);
        continue;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('failed to read'));
        reader.readAsDataURL(file);
      });

      const dimensions = await new Promise<{ width: number; height: number }>(
        (resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = dataUrl;
        }
      );

      validItems.push({
        id: crypto.randomUUID(),
        file,
        dataUrl,
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
      });
    }

    setImages((prev) => [...prev, ...validItems]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setResultUrl(null);
  }, []);

  const moveImage = useCallback((id: string, direction: 'up' | 'down') => {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    setResultUrl(null);
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    setResultUrl(null);
    setError('');
  }, []);

  const buildPdf = useCallback(async () => {
    if (images.length === 0) {
      setError('أضف صورة واحدة على الأقل.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const pdf = await PDFDocument.create();
      const marginPt = MARGINS[margin];

      for (const item of images) {
        let img;

        // تضمين حسب النوع
        if (item.file.type === 'image/png') {
          const bytes = await item.file.arrayBuffer();
          img = await pdf.embedPng(bytes);
        } else if (
          item.file.type === 'image/jpeg' ||
          item.file.type === 'image/jpg'
        ) {
          const bytes = await item.file.arrayBuffer();
          img = await pdf.embedJpg(bytes);
        } else {
          // أنواع أخرى: نحولها إلى PNG عبر canvas
          const pngBytes = await convertToPng(item.dataUrl);
          img = await pdf.embedPng(pngBytes);
        }

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === 'fit') {
          pageWidth = img.width + marginPt * 2;
          pageHeight = img.height + marginPt * 2;
        } else {
          const [baseW, baseH] = PAGE_SIZES[pageSize];
          if (orientation === 'portrait') {
            pageWidth = baseW;
            pageHeight = baseH;
          } else {
            pageWidth = baseH;
            pageHeight = baseW;
          }
        }

        const page = pdf.addPage([pageWidth, pageHeight]);

        const availableWidth = pageWidth - marginPt * 2;
        const availableHeight = pageHeight - marginPt * 2;

        const imgRatio = img.width / img.height;
        const availRatio = availableWidth / availableHeight;

        let drawWidth: number;
        let drawHeight: number;

        if (imgRatio > availRatio) {
          drawWidth = availableWidth;
          drawHeight = availableWidth / imgRatio;
        } else {
          drawHeight = availableHeight;
          drawWidth = availableHeight * imgRatio;
        }

        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(img, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes).buffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل البناء: ' + e.message
          : 'فشل بناء ملف PDF.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [images, pageSize, orientation, margin]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-images-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/pdf"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات PDF
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <ImagePlus className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تحويل الصور إلى PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                حوّل صور JPG وPNG إلى ملف PDF واحد. رتّب الصور، واختر حجم
                الصفحة والهوامش. كل شيء يعمل داخل متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {images.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-center transition-colors hover:border-brand-400">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <ImagePlus className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">
                  اختر صورًا
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  JPG، PNG، WebP — أو اسحب الصور وأفلتها هنا
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار صور
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {images.length > 0 && (
              <>
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-ink-900">
                      الصور ({images.length})
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
                      >
                        + إضافة المزيد
                      </button>
                      <button
                        onClick={clearAll}
                        className="text-xs font-semibold text-rose-600 hover:underline"
                      >
                        مسح الكل
                      </button>
                    </div>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />

                  <ul className="space-y-2">
                    {images.map((item, idx) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3"
                      >
                        <GripVertical className="h-4 w-4 flex-shrink-0 text-ink-400" />
                        <img
                          src={item.dataUrl}
                          alt={item.file.name}
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {idx + 1}. {item.file.name}
                          </p>
                          <p className="text-xs text-ink-500">
                            {item.width}×{item.height} • {formatSize(item.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveImage(item.id, 'up')}
                            disabled={idx === 0}
                            className="rounded p-1 text-ink-600 transition hover:bg-white disabled:opacity-30"
                            aria-label="تحريك لأعلى"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveImage(item.id, 'down')}
                            disabled={idx === images.length - 1}
                            className="rounded p-1 text-ink-600 transition hover:bg-white disabled:opacity-30"
                            aria-label="تحريك لأسفل"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeImage(item.id)}
                            className="rounded p-1 text-rose-600 transition hover:bg-white"
                            aria-label="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* إعدادات */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    إعدادات الصفحة
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-ink-900">
                        حجم الصفحة
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['a4', 'letter', 'fit'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setPageSize(size)}
                            className={`rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition ${
                              pageSize === size
                                ? 'border-brand-500 bg-brand-50 text-ink-900'
                                : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                            }`}
                          >
                            {size === 'a4'
                              ? 'A4'
                              : size === 'letter'
                              ? 'Letter'
                              : 'حسب الصورة'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {pageSize !== 'fit' && (
                      <div>
                        <label className="mb-2 block text-sm font-bold text-ink-900">
                          اتجاه الصفحة
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['portrait', 'landscape'] as const).map((o) => (
                            <button
                              key={o}
                              onClick={() => setOrientation(o)}
                              className={`rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition ${
                                orientation === o
                                  ? 'border-brand-500 bg-brand-50 text-ink-900'
                                  : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                              }`}
                            >
                              {o === 'portrait' ? 'عمودي' : 'أفقي'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-bold text-ink-900">
                        الهوامش
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', 'small', 'medium'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMargin(m)}
                            className={`rounded-lg border-2 px-3 py-2.5 text-xs font-bold transition ${
                              margin === m
                                ? 'border-brand-500 bg-brand-50 text-ink-900'
                                : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                            }`}
                          >
                            {m === 'none'
                              ? 'بدون'
                              : m === 'small'
                              ? 'صغير'
                              : 'متوسط'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={buildPdf}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ البناء…
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      بناء PDF من {images.length} صورة
                    </>
                  )}
                </button>
              </>
            )}

            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تم بناء PDF بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      الحجم: {formatSize(resultSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل PDF
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                لماذا Intooly؟
              </h3>
              <ul className="space-y-2.5 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>صورك لا تغادر جهازك</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>تحويل فوري بدون انتظار</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>بدون تسجيل أو رفع</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                أدوات ذات صلة
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/tools/merge-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    دمج PDF
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/split-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    تقسيم PDF
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/rotate-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    تدوير PDF
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* SEO */}
        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
              تحويل JPG إلى PDF أونلاين — حوّل صورك إلى ملف PDF واحد
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت بحاجة إلى تجميع عدة صور JPG أو PNG في ملف PDF واحد،
              فإن أداة <strong>تحويل JPG إلى PDF</strong> من Intooly هي
              الحل الأسهل. تعمل الأداة <strong>داخل متصفحك مباشرة</strong>،
              فلا حاجة لتحميل برامج أو رفع صورك إلى أي خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى تحويل JPG إلى PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              تحويل JPG إلى PDF هو تجميع صورة أو عدة صور في مستند PDF
              واحد. هذا مفيد للأرشفة، للمشاركة، للطباعة، أو لتقديم
              المستندات عبر الإنترنت. الصور تبقى بجودتها الأصلية دون أي
              ضغط.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما الذي تقدمه أداة Intooly؟
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  📐 تحكم كامل بالتنسيق
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  اختر حجم الصفحة (A4, Letter)، الاتجاه (عمودي/أفقي)،
                  والهوامش.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🎨 ترتيب حر
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  رتّب الصور بالسحب أو أزرار التمرير قبل البناء.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🖼️ دعم صيغ متعددة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  JPG، JPEG، PNG، WebP — جميعها مدعومة.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ⚡ سرعة فورية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  لا انتظار — البناء يحدث في لحظة داخل المتصفح.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>الأرشفة:</strong> حفظ مجموعة صور في مستند PDF
                منظم.
              </li>
              <li>
                <strong>العمل:</strong> إعداد تقارير بصرية وإرسالها.
              </li>
              <li>
                <strong>التسويق:</strong> تحويل صور المنتجات إلى كتالوج
                PDF.
              </li>
              <li>
                <strong>الدراسة:</strong> تجميع صور المذكرات في ملف
                واحد.
              </li>
              <li>
                <strong>الحياة اليومية:</strong> تحويل إيصالات أو فواتير
                مصورة إلى PDF.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تحوّل صورك إلى PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>ارفع صورة أو أكثر من جهازك.</li>
              <li>رتّب الصور بالترتيب الذي تريده.</li>
              <li>اختر حجم الصفحة والاتجاه والهوامش.</li>
              <li>اضغط "بناء PDF".</li>
              <li>نزّل الملف الناتج.</li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن تحويل JPG إلى PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل التحويل يؤثر على جودة الصور؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الصور تبقى بجودتها الأصلية. الأداة لا تعيد ضغط
                  الصور.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  كم صورة يمكنني تحويلها في ملف واحد؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا يوجد حد رقمي، لكن الأداء يعتمد على ذاكرة جهازك. عادة
                  10-30 صورة تعمل بشكل ممتاز.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  ما هي الصيغ المدعومة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  JPG، JPEG، PNG، WebP، وأي صيغة صورة يدعمها متصفحك.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل صوري آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، جميع العمليات تتم داخل متصفحك، ولا تُرفع صورك إلى
                  أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل بدون تسجيل وبدون علامات مائية.
                </p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">
              أدوات PDF ذات صلة
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/tools/merge-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← دمج PDF في ملف واحد
              </Link>
              <Link
                href="/tools/split-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تقسيم PDF إلى ملفات أصغر
              </Link>
              <Link
                href="/tools/rotate-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تدوير صفحات PDF
              </Link>
              <Link
                href="/tools/compress-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← ضغط PDF لتقليل الحجم
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

// دالة مساعدة لتحويل أي صورة إلى PNG bytes
async function convertToPng(dataUrl: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('no canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('blob failed'));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = dataUrl;
  });
}
