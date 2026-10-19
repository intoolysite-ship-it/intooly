'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  FileOutput,
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
  Layers,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function ExtractPdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
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
      setSelectedPages(new Set());
    } catch (e) {
      setError('تعذر قراءة الملف. تأكد أنه ملف PDF صالح.');
      console.error(e);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setSelectedPages(new Set());
    setResultUrl(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const togglePage = useCallback((pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
    setResultUrl(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
    setResultUrl(null);
  }, [pageCount]);

  const clearSelection = useCallback(() => {
    setSelectedPages(new Set());
    setResultUrl(null);
  }, []);

  const selectOddPages = useCallback(() => {
    const odd = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
      (n) => n % 2 === 1
    );
    setSelectedPages(new Set(odd));
    setResultUrl(null);
  }, [pageCount]);

  const selectEvenPages = useCallback(() => {
    const even = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
      (n) => n % 2 === 0
    );
    setSelectedPages(new Set(even));
    setResultUrl(null);
  }, [pageCount]);

  const extractPages = useCallback(async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      setError('اختر صفحة واحدة على الأقل لاستخراجها.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const pageIndices = Array.from(selectedPages)
        .sort((a, b) => a - b)
        .map((p) => p - 1);

      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

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
          ? 'فشل الاستخراج: ' + e.message
          : 'فشل استخراج الصفحات.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, selectedPages]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-extracted-pages-${Date.now()}.pdf`;
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
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <FileOutput className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                استخراج صفحات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                اختر صفحات محددة من ملف PDF واحفظها في مستند مستقل دون
                الحاجة إلى تقسيم الملف يدويًا. كل شيء يعمل داخل متصفحك.
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
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-ink-900">
                      اختر الصفحات للاستخراج
                    </h3>
                    <p className="mt-1 text-xs text-ink-500">
                      الصفحات المحددة ({selectedPages.size}) ستُجمع في ملف
                      PDF جديد.
                    </p>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <button
                      onClick={selectAll}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      تحديد الكل
                    </button>
                    <button
                      onClick={selectOddPages}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                    >
                      الصفحات الفردية
                    </button>
                    <button
                      onClick={selectEvenPages}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                    >
                      الصفحات الزوجية
                    </button>
                    <button
                      onClick={clearSelection}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                    >
                      <Square className="h-3.5 w-3.5" />
                      إلغاء الكل
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => {
                      const isSelected = selectedPages.has(num);
                      return (
                        <button
                          key={num}
                          onClick={() => togglePage(num)}
                          className={`relative flex h-14 items-center justify-center rounded-lg border-2 text-sm font-bold transition ${
                            isSelected
                              ? 'border-brand-500 bg-brand-100 text-brand-800'
                              : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                          }`}
                          aria-label={`صفحة ${num}`}
                        >
                          {num}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={extractPages}
                  disabled={isLoading || selectedPages.size === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ الاستخراج…
                    </>
                  ) : (
                    <>
                      <FileOutput className="h-5 w-5" />
                      استخراج {selectedPages.size} صفحة
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
                      تم الاستخراج بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      استُخرجت {selectedPages.size} صفحة • الحجم: {formatSize(resultSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل الملف المستخرج
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
                  <span>استخراج فوري بدون انتظار</span>
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
                <li>• أدخل أرقام الصفحات بدقة (مثال: 1-5, 8, 10).</li>
                <li>• عاين الصفحات قبل الاستخراج للتأكد من اختيارك.</li>
                <li>• استخدم أداة التقسيم لاستخراج نطاقات كبيرة.</li>
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
                    href="/tools/rotate-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    تدوير PDF
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
              استخراج صفحات محددة من PDF أونلاين
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت تحتاج إلى <strong>استخراج صفحات معينة</strong> من
              ملف PDF كبير، فإن أداة استخراج صفحات PDF من Intooly تتيح لك
              ذلك بسهولة. تعمل الأداة <strong>داخل متصفحك مباشرة</strong>،
              فلا حاجة لتحميل برامج أو رفع ملفك إلى أي خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى استخراج صفحات PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              استخراج صفحات PDF هو إنشاء ملف PDF جديد يحتوي على صفحات
              محددة من ملف آخر. هذا مختلف عن التقسيم، حيث أن التقسيم يقسم
              الملف إلى أجزاء متسلسلة، بينما الاستخراج يختار صفحات معينة
              بحرية.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              الفرق بين الاستخراج والتقسيم والحذف
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ✂️ تقسيم
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  يقسم الملف إلى أجزاء متسلسلة حسب النطاق.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🗑️ حذف
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  يحذف صفحات معينة ويحتفظ بالباقي في ملف واحد.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  📑 استخراج
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  يختار صفحات محددة لتجميعها في ملف جديد.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>الطلاب:</strong> استخراج فصل معين من كتاب للدراسة.
              </li>
              <li>
                <strong>الموظفون:</strong> استخراج صفحات محددة من تقرير
                لإرسالها.
              </li>
              <li>
                <strong>المحامون:</strong> استخراج صفحات عقد لمراجعتها.
              </li>
              <li>
                <strong>المصممون:</strong> استخراج صفحات أعمال لعرضها على
                العملاء.
              </li>
              <li>
                <strong>الباحثون:</strong> استخراج المراجع والجداول
                المهمة.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تستخرج صفحات PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>ارفع ملف PDF من جهازك.</li>
              <li>اختر الصفحات التي تريد استخراجها (ستُحاط بالذهبي).</li>
              <li>استخدم "الفردية" أو "الزوجية" لتسريع التحديد.</li>
              <li>اضغط "استخراج الصفحات".</li>
              <li>نزّل الملف الجديد.</li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن استخراج صفحات PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الاستخراج يؤثر على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الصفحات المستخرجة تحتفظ بجودتها الأصلية، بكل
                  النصوص والصور.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني استخراج صفحات غير متتالية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، يمكنك اختيار أي صفحات بغض النظر عن ترتيبها — مثلاً
                  الصفحات 3 و 7 و 15.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الملف الأصلي يتأثر؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الملف الأصلي يبقى كما هو. الأداة تنشئ ملفًا جديدًا
                  بالصفحات المختارة.
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
                href="/tools/split-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تقسيم PDF إلى ملفات
              </Link>
              <Link
                href="/tools/merge-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← دمج PDF في ملف واحد
              </Link>
              <Link
                href="/tools/delete-pdf-pages"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← حذف صفحات من PDF
              </Link>
              <Link
                href="/tools/rotate-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تدوير صفحات PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
