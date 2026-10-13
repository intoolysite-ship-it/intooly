'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Upload,
  X,
  Download,
  LoaderCircle,
  ArrowLeft,
  FileText,
  Shield,
  Zap,
  Lock,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function DeletePdfPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [deletedCount, setDeletedCount] = useState<number>(0);
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

  const deletePages = useCallback(async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      setError('اختر صفحة واحدة على الأقل لحذفها.');
      return;
    }
    if (selectedPages.size === pageCount) {
      setError('لا يمكنك حذف جميع الصفحات. يجب أن يبقى صفحة واحدة على الأقل.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // احذف الصفحات بترتيب تنازلي (لتجنب مشاكل الفهرسة)
      const pagesToDelete = Array.from(selectedPages).sort((a, b) => b - a);
      for (const pageNum of pagesToDelete) {
        pdf.removePage(pageNum - 1);
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes).buffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
      setDeletedCount(pagesToDelete.length);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل الحذف: ' + e.message
          : 'فشل حذف الصفحات.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, selectedPages, pageCount]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-deleted-pages-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  const remainingCount = pageCount - selectedPages.size;

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
              <Trash2 className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                حذف صفحات من PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                احذف الصفحات غير المطلوبة من ملف PDF واحتفظ بالصفحات التي
                تحتاجها. معاينة مباشرة قبل التنزيل. كل شيء يعمل داخل
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
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-ink-900">
                        اختر الصفحات للحذف
                      </h3>
                      <p className="mt-1 text-xs text-ink-500">
                        الصفحات المحددة ({selectedPages.size}) ستُحذف.
                        المتبقي: {remainingCount}
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
                        إلغاء الكل
                      </button>
                    </div>
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
                              ? 'border-rose-500 bg-rose-50 text-rose-700 line-through'
                              : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                          }`}
                          aria-label={`صفحة ${num}`}
                        >
                          {num}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
                              ×
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedPages.size > 0 && selectedPages.size < pageCount && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      سيتم حذف <strong>{selectedPages.size} صفحة</strong> من
                      الملف. سيتبقى <strong>{remainingCount} صفحة</strong>.
                      لا يمكن التراجع بعد التنزيل.
                    </span>
                  </div>
                )}

                <button
                  onClick={deletePages}
                  disabled={
                    isLoading ||
                    selectedPages.size === 0 ||
                    selectedPages.size === pageCount
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ الحذف…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      حذف {selectedPages.size} صفحة
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
                      تم الحذف بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      حُذفت {deletedCount} صفحة • الحجم الجديد: {formatSize(resultSize)}
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
                  <span>حذف فوري بدون انتظار</span>
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
              حذف صفحات من PDF أونلاين — احذف الصفحات غير المطلوبة بسهولة
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كان لديك ملف PDF يحتوي على صفحات زائدة أو غير ضرورية،
              فإن أداة <strong>حذف صفحات PDF</strong> من Intooly تتيح لك
              التخلص منها بسهولة. تعمل الأداة{' '}
              <strong>داخل متصفحك مباشرة</strong>، فلا حاجة لتحميل برامج
              أو رفع ملفك إلى أي خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى حذف صفحات PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              حذف صفحات PDF هو إزالة صفحات محددة من ملف PDF مع الاحتفاظ
              بترتيب باقي الصفحات كما هو. هذه العملية مفيدة عندما يكون
              لديك مستند يحتوي على صفحات إعلانية أو صفحات فارغة أو صفحات
              لا تحتاجها.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>إزالة الصفحات الإعلانية:</strong> من الكتب
                والملفات المحمّلة من الإنترنت.
              </li>
              <li>
                <strong>حذف الصفحات الفارغة:</strong> التي تأتي أحيانًا
                من المسح الضوئي.
              </li>
              <li>
                <strong>اختيار أجزاء من المستند:</strong> لإرسال صفحة أو
                صفحات معينة فقط.
              </li>
              <li>
                <strong>تجهيز المستندات:</strong> قبل دمجها مع ملف آخر.
              </li>
              <li>
                <strong>تقليل حجم الملف:</strong> بحذف الصفحات
                غير الضرورية.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تحذف صفحات من PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>ارفع ملف PDF من جهازك.</li>
              <li>انقر على الصفحات التي تريد حذفها (ستظهر باللون الأحمر).</li>
              <li>راجع عدد الصفحات المتبقية قبل التأكيد.</li>
              <li>اضغط "حذف الصفحات".</li>
              <li>نزّل الملف الناتج.</li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن حذف صفحات PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني التراجع عن الحذف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  بعد تنزيل الملف، لا. لكن قبل التنزيل يمكنك إلغاء
                  التحديد وإعادة الاختيار.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يؤثر الحذف على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الصفحات المتبقية تحتفظ بجودتها الأصلية.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني حذف جميع الصفحات؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، يجب أن تبقى صفحة واحدة على الأقل. إذا احتجت ملفًا
                  فارغًا، استخدم أداة أخرى.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الحذف يتم داخل متصفحك، ولا تُرفع ملفاتك إلى أي
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
