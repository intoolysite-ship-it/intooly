'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Upload,
  Download,
  LoaderCircle,
  ArrowLeft,
  FileText,
  Shield,
  Zap,
  Lock,
  Trash2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type PageItem = {
  id: string;
  originalIndex: number;
  rotation: number;
  thumbnail: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function OrganizePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const generateThumbnails = useCallback(async (pdfFile: File) => {
    setIsLoadingThumbs(true);
    setThumbProgress(0);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const thumbnails: PageItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

        thumbnails.push({
          id: `page-${i}-${Date.now()}`,
          originalIndex: i - 1,
          rotation: 0,
          thumbnail: dataUrl,
        });

        setThumbProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(thumbnails);
    } catch (e) {
      console.error(e);
      setError('تعذر توليد معاينات الصفحات.');
    } finally {
      setIsLoadingThumbs(false);
      setThumbProgress(0);
    }
  }, []);

  const loadFile = useCallback(
    async (newFile: File | null) => {
      if (!newFile) return;
      setError('');
      setResultUrl(null);
      setPages([]);

      if (newFile.type !== 'application/pdf') {
        setError('يُسمح فقط بملفات PDF.');
        return;
      }
      if (newFile.size > 100 * 1024 * 1024) {
        setError('الملف أكبر من 100 ميغابايت.');
        return;
      }

      setFile(newFile);
      await generateThumbnails(newFile);
    },
    [generateThumbnails]
  );

  const removeFile = useCallback(() => {
    setFile(null);
    setPages([]);
    setResultUrl(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const rotatePage = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setResultUrl(null);
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setResultUrl(null);
  }, []);

  const movePage = useCallback(
    (id: string, direction: 'left' | 'right') => {
      setPages((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        const newIdx = direction === 'left' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        const copy = [...prev];
        [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
        return copy;
      });
      setResultUrl(null);
    },
    []
  );

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setPages((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === draggedId);
      const toIdx = prev.findIndex((p) => p.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;

      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
    setResultUrl(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const resetOrder = useCallback(() => {
    setPages((prev) =>
      [...prev]
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map((p) => ({ ...p, rotation: 0 }))
    );
    setResultUrl(null);
  }, []);

  const buildPdf = useCallback(async () => {
    if (!file || pages.length === 0) {
      setError('أضف ملف PDF أولاً.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const indices = pages.map((p) => p.originalIndex);
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);

      copiedPages.forEach((page, idx) => {
        const rotation = pages[idx].rotation;
        if (rotation !== 0) {
          const current = page.getRotation().angle;
          page.setRotation({ type: 'degrees', angle: (current + rotation) % 360 } as never);
        }
        newPdf.addPage(page);
      });

      const bytes = await newPdf.save();
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
          : 'فشل إنشاء الملف.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, pages]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-organized-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  const hasChanges = pages.some(
    (p, idx) => p.originalIndex !== idx || p.rotation !== 0
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-gradient-to-b from-ink-50 to-white"
    >
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
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <LayoutGrid className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                ترتيب صفحات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                رتّب صفحات PDF بالسحب والإفلات، مع إمكانية التدوير والحذف.
                كل شيء يعمل داخل متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
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
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
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
                        {formatSize(file.size)} • {pages.length} صفحة
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

                {isLoadingThumbs && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">
                        جارٍ توليد معاينات الصفحات…
                      </span>
                      <span className="font-bold text-brand-700">
                        {thumbProgress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${thumbProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {pages.length > 0 && !isLoadingThumbs && (
                  <>
                    <div className="rounded-2xl border border-ink-200 bg-white p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-ink-900">
                          اسحب الصفحات لترتيبها
                        </h3>
                        <button
                          onClick={resetOrder}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          إعادة الترتيب الأصلي
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {pages.map((page, idx) => (
                          <div
                            key={page.id}
                            draggable
                            onDragStart={() => handleDragStart(page.id)}
                            onDragOver={(e) => handleDragOver(e, page.id)}
                            onDragEnd={handleDragEnd}
                            className={`group relative cursor-grab rounded-xl border-2 bg-white transition-all active:cursor-grabbing ${
                              draggedId === page.id
                                ? 'border-brand-500 opacity-50'
                                : 'border-ink-200 hover:border-brand-300'
                            }`}
                          >
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white">
                              <GripVertical className="h-3 w-3" />
                              {idx + 1}
                            </div>

                            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rotatePage(page.id);
                                }}
                                className="rounded-md bg-white/90 p-1.5 text-ink-700 shadow-md hover:bg-white"
                                aria-label="تدوير"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePage(page.id);
                                }}
                                className="rounded-md bg-white/90 p-1.5 text-rose-600 shadow-md hover:bg-white"
                                aria-label="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-ink-50">
                              <img
                                src={page.thumbnail}
                                alt={`صفحة ${idx + 1}`}
                                className="h-full w-full object-contain transition-transform"
                                style={{
                                  transform: `rotate(${page.rotation}deg)`,
                                }}
                                draggable={false}
                              />
                            </div>

                            <div className="flex items-center justify-between gap-1 p-2">
                              <button
                                onClick={() =>
                                  movePage(page.id, 'right')
                                }
                                disabled={idx === pages.length - 1}
                                className="rounded-md bg-ink-100 p-1 text-ink-600 transition hover:bg-brand-100 disabled:opacity-30"
                                aria-label="تحريك يمين"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                              <span className="text-[10px] text-ink-500">
                                {page.rotation !== 0
                                  ? `${page.rotation}°`
                                  : `#${page.originalIndex + 1}`}
                              </span>
                              <button
                                onClick={() => movePage(page.id, 'left')}
                                disabled={idx === 0}
                                className="rounded-md bg-ink-100 p-1 text-ink-600 transition hover:bg-brand-100 disabled:opacity-30"
                                aria-label="تحريك يسار"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isLoading && (
                      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <LoaderCircle className="h-4 w-4 animate-spin text-brand-600" />
                          <span className="font-bold text-ink-900">
                            جارٍ حفظ الترتيب الجديد…
                          </span>
                        </div>
                      </div>
                    )}

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
                          <CheckCircle2 className="h-5 w-5" />
                          تطبيق الترتيب الجديد
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}

            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تم تطبيق الترتيب بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      {pages.length} صفحة • الحجم: {formatSize(resultSize)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadResult}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل الملف الجديد
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
                  <span>ملفاتك لا تغادر جهازك</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>سحب وإفلات سلس</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>بدون تسجيل أو رفع</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                🔒 خصوصيتك محفوظة
              </h3>
              <p className="text-sm leading-7 text-ink-700">
                جميع الملفات تُعالج داخل متصفحك مباشرة. لا نرفع أي ملف إلى خوادمنا، ولا نحتفظ بأي نسخة.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                💡 نصائح سريعة
              </h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• اسحب الصفحات وأفلتها لإعادة ترتيبها.</li>
                <li>• استخدم أدوات التدوير والحذف لضبط الاتجاه.</li>
                <li>• عاين النتيجة قبل التنزيل النهائي.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                أدوات PDF شائعة
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/tools/compress-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    ضغط PDF
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/extract-pdf-pages"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    استخراج صفحات PDF
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/watermark-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    علامة مائية PDF
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
              ترتيب صفحات PDF أونلاين — أعد تنظيم مستنداتك بسهولة
            </h2>

            <p className="mt-4 leading-8 text-ink-700">
              إذا كان لديك ملف PDF يحتوي على صفحات بترتيب خاطئ، أو كنت
              بحاجة إلى إعادة تنظيم الصفحات لترتيب منطقي أفضل، فإن أداة
              ترتيب صفحات PDF من Intooly هي الحل الأمثل. تعمل الأداة{' '}
              <strong>داخل متصفحك مباشرة</strong>، فلا حاجة لتحميل برامج،
              ولا لرفع ملفاتك إلى أي خادم خارجي.
            </p>

            <p className="mt-3 leading-8 text-ink-700">
              تعتمد الأداة على <strong>واجهة سحب وإفلات</strong> بسيطة
              وسريعة، مع عرض <strong>مصغرات لكل صفحة</strong> لتسهيل
              التنقل. يمكنك أيضاً <strong>تدوير الصفحات</strong> بشكل فردي
              أو <strong>حذف صفحات</strong> غير مرغوبة قبل الحفظ.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى ترتيب صفحات PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              ترتيب صفحات PDF هو إعادة تنظيم الصفحات بترتيب جديد يختلف عن
              الترتيب الأصلي. هذا مفيد عندما تكون الصفحات قد أُدرجت بترتيب
              خاطئ (مثلاً عند المسح الضوئي)، أو عندما تريد إعادة تنظيم
              المستند لترتيب منطقي أفضل.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما الذي تقدمه أداة Intooly؟
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🖱️ سحب وإفلات
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  اسحب أي صفحة وأفلتها في المكان الذي تريده. ترتيب فوري
                  بدون تعقيد.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  👁️ معاينة مصغرة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  شاهد كل صفحة كمصغرة قبل ترتيبها. لا حاجة لتخمين
                  الترتيب.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🔄 تدوير فردي
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  دوّر أي صفحة بمقدار 90 درجة على حدة، لتعديل اتجاهها.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🗑️ حذف صفحات
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  احذف الصفحات غير المرغوبة من الترتيب مباشرة قبل الحفظ.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>المستندات الممسوحة ضوئيًا:</strong> إعادة ترتيب
                الصفحات بعد المسح.
              </li>
              <li>
                <strong>الفصول الدراسية:</strong> تنظيم فصول كتاب أو بحث
                بترتيب منطقي.
              </li>
              <li>
                <strong>العروض التقديمية:</strong> إعادة ترتيب الشرائح قبل
                الطباعة.
              </li>
              <li>
                <strong>العقود والمستندات:</strong> ترتيب الصفحات حسب
                الأهمية.
              </li>
              <li>
                <strong>الأرشيف:</strong> دمج عدة مستندات بترتيب زمني
                صحيح.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تستخدم أداة ترتيب صفحات PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>
                <strong>ارفع الملف:</strong> اضغط على زر &quot;اختيار
                ملف&quot; واختر ملف PDF من جهازك.
              </li>
              <li>
                <strong>انتظر المصغرات:</strong> ستظهر معاينات لجميع
                الصفحات تلقائياً.
              </li>
              <li>
                <strong>اسحب وأفلت:</strong> رتّب الصفحات بالسحب
                والإفلات.
              </li>
              <li>
                <strong>عدّل إذا لزم:</strong> استخدم أزرار التدوير
                والحذف لكل صفحة.
              </li>
              <li>
                <strong>طبّق الترتيب:</strong> اضغط على زر &quot;تطبيق
                الترتيب الجديد&quot;.
              </li>
              <li>
                <strong>نزّل الملف:</strong> اضغط على زر &quot;تنزيل
                الملف الجديد&quot;.
              </li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن ترتيب صفحات PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني التراجع عن التعديلات؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، استخدم زر &quot;إعادة الترتيب الأصلي&quot; لإلغاء
                  كل التعديلات والرجوع إلى الترتيب الأصلي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يؤثر الترتيب على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الصفحات تحتفظ بجودتها الأصلية بكل النصوص والصور.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني حذف صفحات بعد الترتيب؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، كل صفحة لها زر حذف خاص. يمكنك حذف أي صفحة قبل
                  الحفظ.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، جميع العمليات تتم داخل متصفحك مباشرة، ولا يتم رفع
                  أي ملف إلى أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل. لا تطلب تسجيلاً، ولا تفرض حدوداً
                  يومية، ولا تضيف علامات مائية.
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
                href="/tools/delete-pdf-pages"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← حذف صفحات من PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
