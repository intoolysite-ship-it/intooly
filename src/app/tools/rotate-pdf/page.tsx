'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  RotateCcw,
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
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

type RotationAngle = 0 | 90 | 180 | 270;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (newFile: File | null) => {
    if (!newFile) return;
    setError('');
    setResultUrl(null);

    if (newFile.type !== 'application/pdf') {
      setError('يُسمح فقط بملفات PDF.');
      return;
    }
    if (newFile.size > 100 * 1024 * 1024) {
      setError('الملف أكبر من 100 ميغابايت.');
      return;
    }

    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setFile(newFile);
      setPageCount(pdf.getPageCount());
      setPageRotations({});
    } catch (e) {
      setError('تعذر قراءة الملف. تأكد أنه ملف PDF صالح.');
      console.error(e);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setPageRotations({});
    setResultUrl(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const rotatePage = useCallback((pageNum: number, delta: number) => {
    setPageRotations((prev) => {
      const current = prev[pageNum] ?? 0;
      const next = ((current + delta) % 360 + 360) % 360;
      return { ...prev, [pageNum]: next };
    });
  }, []);

  const rotateAll = useCallback((delta: number) => {
    const newRotations: Record<number, number> = {};
    for (let i = 1; i <= pageCount; i++) {
      newRotations[i] = delta;
    }
    setPageRotations(newRotations);
  }, [pageCount]);

  const resetAll = useCallback(() => {
    setPageRotations({});
    setResultUrl(null);
  }, []);

  const applyRotation = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      pages.forEach((page, idx) => {
        const rotation = pageRotations[idx + 1] ?? 0;
        if (rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + rotation));
        }
      });

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes).buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل التدوير: ' + e.message
          : 'فشل تدوير الملف.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, pageRotations]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-rotated-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  const hasRotations = Object.values(pageRotations).some((r) => r !== 0);

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
              <RotateCw className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تدوير صفحات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                دوّر صفحات PDF إلى الاتجاه الصحيح. يمكنك تدوير صفحة واحدة
                أو عدة صفحات، أو كل الصفحات دفعة واحدة. كل شيء يعمل داخل
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

                {/* أدوات عامة */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    تدوير سريع
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <button
                      onClick={() => rotateAll(90)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-bold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <RotateCw className="h-4 w-4" />
                      90° الكل
                    </button>
                    <button
                      onClick={() => rotateAll(180)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-bold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <RotateCw className="h-4 w-4" />
                      180° الكل
                    </button>
                    <button
                      onClick={() => rotateAll(270)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-bold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                    >
                      <RotateCw className="h-4 w-4" />
                      270° الكل
                    </button>
                    <button
                      onClick={resetAll}
                      className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      إعادة تعيين
                    </button>
                  </div>
                </div>

                {/* صفحات للتدوير الفردي */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    تدوير صفحات فردية
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => {
                      const rotation = pageRotations[num] ?? 0;
                      return (
                        <div
                          key={num}
                          className={`rounded-xl border-2 p-3 text-center transition ${
                            rotation !== 0
                              ? 'border-brand-500 bg-brand-50'
                              : 'border-ink-200 bg-white'
                          }`}
                        >
                          <div className="mb-2 text-xs font-bold text-ink-600">
                            صفحة {num}
                          </div>
                          <div className="mb-2 text-lg font-black text-ink-900">
                            {rotation}°
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => rotatePage(num, -90)}
                              className="flex-1 rounded-md bg-ink-100 py-1 text-xs hover:bg-ink-200"
                              aria-label="تدوير يسار"
                            >
                              ↺
                            </button>
                            <button
                              onClick={() => rotatePage(num, 90)}
                              className="flex-1 rounded-md bg-brand-500 py-1 text-xs text-white hover:bg-brand-600"
                              aria-label="تدوير يمين"
                            >
                              ↻
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={applyRotation}
                  disabled={isLoading || !hasRotations}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التطبيق…
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-5 w-5" />
                      تطبيق التدوير
                    </>
                  )}
                </button>
              </>
            )}

            {/* Result */}
            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تم التدوير بنجاح
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
                  تنزيل الملف المدوّر
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
                  <span>تدوير فوري بدون انتظار</span>
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
                    href="/tools/compress-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    ضغط PDF
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
              تدوير صفحات PDF أونلاين — اضبط اتجاه الصفحات بسهولة
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كانت لديك صفحات PDF مقلوبة أو في اتجاه خاطئ، فإن أداة
              <strong> تدوير صفحات PDF</strong> من Intooly تتيح لك
              تعديلها بسهولة. تعمل الأداة <strong>داخل متصفحك مباشرة</strong>،
              فلا حاجة لتحميل برامج أو رفع ملفك إلى أي خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى تدوير PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              تدوير PDF هو تغيير اتجاه عرض الصفحة بمقدار 90° أو 180° أو
              270°. يفيد هذا في تصحيح المستندات الممسوحة ضوئيًا في
              اتجاه خاطئ، أو الصفحات التي تم إدراجها بالمقلوب.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              متى تحتاج إلى تدوير صفحات PDF؟
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>المستندات الممسوحة ضوئيًا:</strong> بعض الصفحات
                قد تكون ممسوحة بالمقلوب.
              </li>
              <li>
                <strong>الصور المدمجة:</strong> الصور قد تكون في الاتجاه
                الخاطئ.
              </li>
              <li>
                <strong>النصوص الأفقية:</strong> الجداول العريضة قد
                تحتاج تدويرًا للعرض.
              </li>
              <li>
                <strong>الطباعة:</strong> تصحيح الاتجاه قبل الطباعة.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تستخدم أداة تدوير PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>ارفع ملف PDF من جهازك.</li>
              <li>اختر: تدوير الكل، أو صفحة محددة.</li>
              <li>حدد مقدار التدوير (90°، 180°، 270°).</li>
              <li>اضغط "تطبيق التدوير".</li>
              <li>نزّل الملف الناتج.</li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن تدوير PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل التدوير يؤثر على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، التدوير لا يؤثر على الجودة. النصوص والصور تبقى كما
                  هي بدقة عالية.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني تدوير صفحات معينة فقط؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، يمكنك تدوير كل صفحة على حدة بالزاوية التي تريدها.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، جميع العمليات تتم داخل متصفحك، ولا تُرفع ملفاتك
                  إلى أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني التراجع عن التدوير؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، قبل حفظ الملف، استخدم زر "إعادة تعيين" لإلغاء كل
                  التدويرات.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل، بدون تسجيل وبدون علامات مائية.
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
                href="/tools/compress-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← ضغط PDF لتقليل الحجم
              </Link>
              <Link
                href="/tools/jpg-to-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تحويل JPG إلى PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
