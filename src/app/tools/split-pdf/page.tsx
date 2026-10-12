'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Scissors,
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
  Trash2,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type SplitMode = 'range' | 'every' | 'extract';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<SplitMode>('range');
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [pagesPerFile, setPagesPerFile] = useState(1);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrls, setResultUrls] = useState<{ name: string; url: string; size: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (newFile: File | null) => {
    if (!newFile) return;
    setError('');
    setResultUrls([]);

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
      const count = pdf.getPageCount();

      setFile(newFile);
      setPageCount(count);
      setFromPage(1);
      setToPage(count);
      setSelectedPages(new Set());
    } catch (e) {
      setError('تعذر قراءة الملف. تأكد أنه ملف PDF صالح.');
      console.error(e);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setResultUrls([]);
    setError('');
    setSelectedPages(new Set());
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

  const selectAllPages = useCallback(() => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  }, [pageCount]);

  const clearSelection = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const splitPdf = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResultUrls([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const results: { name: string; url: string; size: number }[] = [];

      if (mode === 'range') {
        if (fromPage < 1 || toPage > pageCount || fromPage > toPage) {
          throw new Error(`نطاق الصفحات غير صحيح. يجب أن يكون بين 1 و ${pageCount}.`);
        }
        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: toPage - fromPage + 1 },
          (_, i) => fromPage - 1 + i
        );
        const copied = await newPdf.copyPages(sourcePdf, pageIndices);
        copied.forEach((p) => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        results.push({
          name: `pages-${fromPage}-to-${toPage}.pdf`,
          url: URL.createObjectURL(blob),
          size: blob.size,
        });
      } else if (mode === 'every') {
        if (pagesPerFile < 1 || pagesPerFile > pageCount) {
          throw new Error('عدد الصفحات لكل ملف غير صحيح.');
        }
        let startIdx = 0;
        let partNum = 1;
        while (startIdx < pageCount) {
          const endIdx = Math.min(startIdx + pagesPerFile, pageCount);
          const newPdf = await PDFDocument.create();
          const pageIndices = Array.from(
            { length: endIdx - startIdx },
            (_, i) => startIdx + i
          );
          const copied = await newPdf.copyPages(sourcePdf, pageIndices);
          copied.forEach((p) => newPdf.addPage(p));
          const bytes = await newPdf.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          results.push({
            name: `part-${partNum}.pdf`,
            url: URL.createObjectURL(blob),
            size: blob.size,
          });
          startIdx = endIdx;
          partNum++;
        }
      } else if (mode === 'extract') {
        if (selectedPages.size === 0) {
          throw new Error('اختر صفحة واحدة على الأقل لاستخراجها.');
        }
        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from(selectedPages)
          .sort((a, b) => a - b)
          .map((p) => p - 1);
        const copied = await newPdf.copyPages(sourcePdf, pageIndices);
        copied.forEach((p) => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        results.push({
          name: `extracted-pages.pdf`,
          url: URL.createObjectURL(blob),
          size: blob.size,
        });
      }

      setResultUrls(results);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'فشل التقسيم.');
    } finally {
      setIsLoading(false);
    }
  }, [file, mode, fromPage, toPage, pagesPerFile, selectedPages, pageCount]);

  const downloadAll = useCallback(() => {
    resultUrls.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = r.url;
        a.download = r.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 200);
    });
  }, [resultUrls]);

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
              <Scissors className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تقسيم PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                قسّم ملف PDF إلى عدة ملفات حسب نطاق الصفحات، أو كل عدد محدد
                من الصفحات، أو استخرج صفحات معينة. كل شيء يعمل داخل متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Upload */}
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
                {/* File info */}
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

                {/* Mode selector */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    اختر طريقة التقسيم
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setMode('range')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        mode === 'range'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">نطاق صفحات</div>
                      <div className="text-xs text-ink-600">
                        استخرج نطاقًا محددًا
                      </div>
                    </button>
                    <button
                      onClick={() => setMode('every')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        mode === 'every'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">كل N صفحات</div>
                      <div className="text-xs text-ink-600">
                        قسّم إلى ملفات متساوية
                      </div>
                    </button>
                    <button
                      onClick={() => setMode('extract')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        mode === 'extract'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">صفحات محددة</div>
                      <div className="text-xs text-ink-600">
                        اختر صفحات معينة
                      </div>
                    </button>
                  </div>
                </div>

                {/* Mode-specific options */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  {mode === 'range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-ink-900">
                          من الصفحة
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={fromPage}
                          onChange={(e) => setFromPage(Number(e.target.value))}
                          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-ink-900">
                          إلى الصفحة
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={toPage}
                          onChange={(e) => setToPage(Number(e.target.value))}
                          className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'every' && (
                    <div>
                      <label className="mb-2 block text-sm font-bold text-ink-900">
                        عدد الصفحات لكل ملف
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={pageCount}
                        value={pagesPerFile}
                        onChange={(e) => setPagesPerFile(Number(e.target.value))}
                        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                      />
                      <p className="mt-2 text-xs text-ink-500">
                        سيتم إنشاء {Math.ceil(pageCount / pagesPerFile)} ملف
                      </p>
                    </div>
                  )}

                  {mode === 'extract' && (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-ink-900">
                          اختر الصفحات ({selectedPages.size})
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllPages}
                            className="text-xs font-semibold text-brand-600 hover:underline"
                          >
                            تحديد الكل
                          </button>
                          <button
                            onClick={clearSelection}
                            className="text-xs font-semibold text-rose-600 hover:underline"
                          >
                            مسح
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            onClick={() => togglePage(num)}
                            className={`flex h-10 items-center justify-center rounded-lg border text-xs font-bold transition ${
                              selectedPages.has(num)
                                ? 'border-brand-500 bg-brand-500 text-white'
                                : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Split button */}
                <button
                  onClick={splitPdf}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التقسيم…
                    </>
                  ) : (
                    <>
                      <Scissors className="h-5 w-5" />
                      تقسيم الملف
                    </>
                  )}
                </button>
              </>
            )}

            {/* Results */}
            {resultUrls.length > 0 && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-ink-900">
                    الملفات الناتجة ({resultUrls.length})
                  </h3>
                  {resultUrls.length > 1 && (
                    <button
                      onClick={downloadAll}
                      className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
                    >
                      تنزيل الكل
                    </button>
                  )}
                </div>
                <ul className="space-y-2">
                  {resultUrls.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
                        <FileText className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {r.name}
                        </p>
                        <p className="text-xs text-ink-500">{formatSize(r.size)}</p>
                      </div>
                      <a
                        href={r.url}
                        download={r.name}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
                      >
                        <Download className="h-3 w-3" />
                        تنزيل
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                  <span>تقسيم فوري بدون انتظار</span>
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
                    href="/tools/delete-pdf-pages"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    حذف صفحات PDF
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
              تقسيم PDF أونلاين — قسّم ملفك إلى عدة ملفات بسهولة
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت بحاجة إلى <strong>تقسيم ملف PDF كبير</strong> إلى
              ملفات أصغر، أو استخراج صفحات محددة من مستند ضخم، فإن أداة
              تقسيم PDF من Intooly هي الحل الأمثل. تعمل الأداة{' '}
              <strong>داخل متصفحك مباشرة</strong>، فلا تحتاج إلى تحميل
              برامج، ولا إلى رفع ملفك إلى أي خادم خارجي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى تقسيم PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              تقسيم PDF هو عملية فصل ملف PDF واحد إلى عدة ملفات أصغر،
              حسب نطاق الصفحات أو بحسب عدد الصفحات المطلوب في كل ملف.
              هذه العملية مفيدة عندما يكون لديك تقرير ضخم تريد توزيعه
              على عدة أقسام، أو عندما تحتاج إلى استخراج صفحات معينة من
              كتاب أو بحث لإرسالها بشكل مستقل.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              3 طرق لتقسيم PDF على Intooly
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  📄 نطاق صفحات
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  استخرج نطاقًا محددًا من الصفحات (مثلًا: من 5 إلى 15)
                  في ملف واحد.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ✂️ كل N صفحات
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  قسّم الملف إلى عدة ملفات متساوية، كل ملف يحتوي على
                  عدد ثابت من الصفحات.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  📑 صفحات محددة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  اختر صفحات معينة لتجميعها في ملف جديد، مثل الصفحات 3
                  و7 و12.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>للطلاب:</strong> استخراج فصل معين من كتاب PDF
                لدراسته بمفرده.
              </li>
              <li>
                <strong>للموظفين:</strong> تقسيم تقرير ضخم إلى أجزاء
                لإرسالها عبر البريد.
              </li>
              <li>
                <strong>للمصممين:</strong> فصل صفحات مشروع إلى ملفات
                منفصلة لكل عميل.
              </li>
              <li>
                <strong>للمحامين:</strong> استخراج صفحات محددة من عقد
                لإرفاقها بمستند آخر.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن تقسيم PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل التقسيم يؤثر على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، التقسيم لا يؤثر على الجودة. الملفات الناتجة تحتفظ
                  بنفس النصوص والصور بدقة عالية.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني تقسيم ملف كبير الحجم؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الحد الأقصى 100 ميغابايت. الأداء يعتمد على ذاكرة
                  جهازك.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، جميع العمليات تتم داخل متصفحك مباشرة، ولا تُرفع
                  أي ملفات إلى خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني تقسيم ملف إلى ملفات بأجزاء متساوية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، اختر &quot;كل N صفحات&quot; وحدد عدد الصفحات لكل
                  ملف، وسيتم إنشاء ملفات متساوية تلقائيًا.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الأداة مجانية بالكامل، بدون تسجيل وبدون علامات
                  مائية.
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
                href="/tools/compress-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← ضغط PDF لتقليل الحجم
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
