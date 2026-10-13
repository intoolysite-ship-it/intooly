'use client';

import JSZip from 'jszip';
import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  FileImage,
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
  CheckSquare,
  Square,
  FileArchive,
} from 'lucide-react';

type ConvertedImage = {
  pageNum: number;
  dataUrl: string;
  size: number;
};

type Quality = 'low' | 'medium' | 'high';

const QUALITY_SCALE: Record<Quality, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [quality, setQuality] = useState<Quality>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (newFile: File | null) => {
    if (!newFile) return;
    setError('');
    setImages([]);

    if (newFile.type !== 'application/pdf') {
      setError('يُسمح فقط بملفات PDF.');
      return;
    }
    if (newFile.size > 100 * 1024 * 1024) {
      setError('الملف أكبر من 100 ميغابايت.');
      return;
    }

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await newFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setFile(newFile);
      setPageCount(pdf.numPages);
      setSelectedPages(new Set());
      setProgress(0);
    } catch (e) {
      setError('تعذر قراءة الملف. تأكد أنه ملف PDF صالح.');
      console.error(e);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
    setImages([]);
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const togglePage = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  }, [pageCount]);

  const clearSelection = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const convertPdf = useCallback(async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      setError('اختر صفحة واحدة على الأقل.');
      return;
    }

    setIsLoading(true);
    setError('');
    setImages([]);
    setProgress(0);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const results: ConvertedImage[] = [];
      const pagesList = Array.from(selectedPages).sort((a, b) => a - b);
      const scale = QUALITY_SCALE[quality];

      for (let i = 0; i < pagesList.length; i++) {
        const pageNum = pagesList[i];
        setProgress(Math.round(((i + 1) / pagesList.length) * 100));

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        const base64 = dataUrl.split(',')[1] || '';
        const size = Math.round((base64.length * 3) / 4);

        results.push({ pageNum, dataUrl, size });
      }

      setImages(results);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل التحويل: ' + e.message
          : 'فشل تحويل الصفحات.'
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [file, selectedPages, quality]);

  const downloadImage = useCallback((img: ConvertedImage) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = `intooly-page-${img.pageNum}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const downloadAll = useCallback(() => {
    images.forEach((img, i) => {
      setTimeout(() => downloadImage(img), i * 300);
    });
  }, [images, downloadImage]);

  const downloadAsZip = useCallback(async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('intooly-pdf-pages');
      for (const img of images) {
        const base64 = img.dataUrl.split(',')[1];
        if (base64 && folder) {
          folder.file(`page-${img.pageNum}.jpg`, base64, { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intooly-pdf-pages-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError('فشل إنشاء ملف ZIP.');
    } finally {
      setIsZipping(false);
    }
  }, [images]);

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
              <FileImage className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تحويل PDF إلى JPG
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                حوّل صفحات PDF إلى صور JPG قابلة للتنزيل. اختر الصفحات
                المطلوبة، وجودة الصور، ثم نزّل النتيجة. كل شيء يعمل داخل
                متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {!file && (
              <div className="rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-center transition-colors hover:border-brand-400">
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => loadFile(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <Upload className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">
                  اختر ملف PDF
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  أو اسحب الملف وأفلته هنا
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار ملف
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {file && (
              <>
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
                      <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-ink-500">
                        {formatSize(file.size)} • {pageCount} صفحة
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    جودة الصور
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setQuality('low')}
                      className={`rounded-xl border-2 p-3 text-right transition ${
                        quality === 'low'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">منخفضة</div>
                      <div className="text-xs text-ink-600">~ 72 DPI</div>
                    </button>
                    <button
                      onClick={() => setQuality('medium')}
                      className={`rounded-xl border-2 p-3 text-right transition ${
                        quality === 'medium'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">متوسطة</div>
                      <div className="text-xs text-ink-600">~ 108 DPI</div>
                    </button>
                    <button
                      onClick={() => setQuality('high')}
                      className={`rounded-xl border-2 p-3 text-right transition ${
                        quality === 'high'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">عالية</div>
                      <div className="text-xs text-ink-600">~ 144 DPI</div>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-ink-900">
                        اختر الصفحات
                      </h3>
                      <p className="mt-1 text-xs text-ink-500">
                        المحددة: {selectedPages.size}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        تحديد الكل
                      </button>
                      <button
                        onClick={clearSelection}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                      >
                        <Square className="h-3.5 w-3.5" />
                        إلغاء
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => togglePage(num)}
                        className={`relative flex h-12 items-center justify-center rounded-lg border-2 text-sm font-bold transition ${
                          selectedPages.has(num)
                            ? 'border-brand-500 bg-brand-100 text-brand-800'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && progress > 0 && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">
                        جارٍ التحويل…
                      </span>
                      <span className="font-bold text-brand-700">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={convertPdf}
                  disabled={isLoading || selectedPages.size === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التحويل…
                    </>
                  ) : (
                    <>
                      <FileImage className="h-5 w-5" />
                      تحويل {selectedPages.size} صفحة إلى JPG
                    </>
                  )}
                </button>
              </>
            )}

            {images.length > 0 && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-ink-900">
                      تم التحويل بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      {images.length} صورة جاهزة
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAll}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      تنزيل الكل
                    </button>
                    <button
                      onClick={downloadAsZip}
                      disabled={isZipping}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
                    >
                      {isZipping ? (
                        <>
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                          جارٍ الضغط…
                        </>
                      ) : (
                        <>
                          <FileArchive className="h-3.5 w-3.5" />
                          تنزيل ZIP
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((img) => (
                    <div
                      key={img.pageNum}
                      className="overflow-hidden rounded-xl border border-ink-200 bg-white"
                    >
                      <img
                        src={img.dataUrl}
                        alt={`صفحة ${img.pageNum}`}
                        className="aspect-[3/4] w-full object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs font-bold text-ink-900">
                          صفحة {img.pageNum}
                        </p>
                        <p className="text-[10px] text-ink-500">
                          {formatSize(img.size)}
                        </p>
                        <button
                          onClick={() => downloadImage(img)}
                          className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand-500 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-brand-600"
                        >
                          <Download className="h-3 w-3" />
                          تنزيل
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span>ملفاتك لا تغادر جهازك</span>
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
                    href="/tools/jpg-to-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    JPG إلى PDF
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
                    href="/tools/extract-pdf-pages"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    استخراج صفحات
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
              تحويل PDF إلى JPG أونلاين — حوّل صفحات PDF إلى صور
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت بحاجة إلى تحويل صفحات PDF إلى صور JPG للاستخدام في
              العروض التقديمية أو المواقع أو وسائل التواصل، فإن أداة تحويل
              PDF إلى JPG من Intooly هي الحل الأمثل. تعمل الأداة داخل
              متصفحك مباشرة، فلا حاجة لتحميل برامج أو رفع ملفك إلى أي
              خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى تحويل PDF إلى JPG؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              تحويل PDF إلى JPG هو تحويل كل صفحة من صفحات PDF إلى صورة
              منفصلة بصيغة JPG. هذا مفيد عندما تحتاج إلى استخدام صفحة
              معينة كصورة، أو عندما تريد نشر محتوى PDF على منصات لا تدعم
              صيغة PDF.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              جودات الصور المتوفرة
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  منخفضة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  مناسبة للمعاينة السريعة، حجم صغير.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  متوسطة (موصى به)
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  توازن ممتاز بين الجودة والحجم للاستخدام اليومي.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  عالية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  للطباعة أو العرض بدقة عالية.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>مواقع التواصل: نشر صفحة من كتاب أو تقرير كصورة.</li>
              <li>العروض التقديمية: إدراج صفحة PDF في PowerPoint.</li>
              <li>المواقع الإلكترونية: عرض صفحة PDF كصورة في مقال.</li>
              <li>المشاركة: مشاركة صفحة كصورة أسهل من مشاركة PDF.</li>
              <li>الحفظ: حفظ صفحات معينة كصور للأرشيف.</li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن تحويل PDF إلى JPG
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل التحويل يؤثر على جودة الصور؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الجودة تعتمد على المستوى الذي تختاره. "عالية" تعطي أفضل
                  جودة (مناسبة للطباعة).
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني تحويل صفحات معينة فقط؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، اختر الصفحات التي تريدها فقط من الشبكة.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني تنزيل كل الصور دفعة واحدة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، استخدم "تنزيل الكل" للتنزيل المنفصل، أو "تنزيل ZIP"
                  لحزم كل الصور في ملف واحد.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، التحويل يتم داخل متصفحك، ولا تُرفع ملفاتك إلى أي
                  خادم.
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
                href="/tools/jpg-to-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تحويل JPG إلى PDF
              </Link>
              <Link
                href="/tools/split-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تقسيم PDF
              </Link>
              <Link
                href="/tools/extract-pdf-pages"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← استخراج صفحات PDF
              </Link>
              <Link
                href="/tools/merge-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← دمج PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
