'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Merge,
  Upload,
  X,
  Download,
  LoaderCircle,
  ArrowLeft,
  Trash2,
  FileText,
  Shield,
  Zap,
  Lock,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type PdfFile = {
  id: string;
  file: File;
  name: string;
  size: number;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    setError('');
    setResultUrl(null);

    const validFiles: PdfFile[] = [];
    for (const file of Array.from(newFiles)) {
      if (file.type !== 'application/pdf') {
        setError('يُسمح فقط بملفات PDF.');
        continue;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError(`الملف "${file.name}" أكبر من 100 ميغابايت.`);
        continue;
      }
      validFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultUrl(null);
  }, []);

  const moveFile = useCallback((id: string, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
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
    setFiles([]);
    setResultUrl(null);
    setError('');
  }, []);

  const mergePdfs = useCallback(async () => {
    if (files.length < 2) {
      setError('أضف ملفين على الأقل لدمجهما.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultSize(blob.size);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل الدمج: ' + e.message
          : 'فشل دمج الملفات. تحقق من صحة الملفات.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-merged-${Date.now()}.pdf`;
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
              <Merge className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                دمج ملفات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                اجمع عدة ملفات PDF في ملف واحد بسهولة. رتّب الملفات قبل
                الدمج، ثم نزّل النتيجة فورًا. كل شيء يعمل داخل متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-center transition-colors hover:border-brand-400">
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                <Upload className="h-8 w-8 text-brand-600" />
              </div>
              <h2 className="text-lg font-bold text-ink-900">
                اختر ملفات PDF
              </h2>
              <p className="mt-1 text-sm text-ink-600">
                أو اسحب الملفات وأفلتها هنا
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
              >
                <Upload className="h-4 w-4" />
                اختيار ملفات
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {files.length > 0 && (
              <div className="rounded-2xl border border-ink-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-ink-900">
                    الملفات ({files.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    مسح الكل
                  </button>
                </div>

                <ul className="space-y-2">
                  {files.map((item, idx) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3"
                    >
                      <GripVertical className="h-4 w-4 flex-shrink-0 text-ink-400" />
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
                        <FileText className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {idx + 1}. {item.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatSize(item.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveFile(item.id, 'up')}
                          disabled={idx === 0}
                          className="rounded p-1 text-ink-600 transition hover:bg-white disabled:opacity-30"
                          aria-label="تحريك لأعلى"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveFile(item.id, 'down')}
                          disabled={idx === files.length - 1}
                          className="rounded p-1 text-ink-600 transition hover:bg-white disabled:opacity-30"
                          aria-label="تحريك لأسفل"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFile(item.id)}
                          className="rounded p-1 text-rose-600 transition hover:bg-white"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={mergePdfs}
                  disabled={isLoading || files.length < 2}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ الدمج…
                    </>
                  ) : (
                    <>
                      <Merge className="h-5 w-5" />
                      دمج {files.length} ملفات
                    </>
                  )}
                </button>
              </div>
            )}

            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تم الدمج بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      الحجم النهائي: {formatSize(resultSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل الملف المدموج
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
                  <span>ملفاتك لا تغادر جهازك أبدًا</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>دمج فوري بدون انتظار</span>
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

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
              دمج ملفات PDF بسهولة — بدون تسجيل، بدون رفع للخادم
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت تبحث عن طريقة <strong>سهلة وسريعة لدمج ملفات PDF</strong>{' '}
              في ملف واحد، فأنت في المكان الصحيح. أداة Intooly تتيح لك
              دمج عدة مستندات PDF في ملف واحد{' '}
              <strong>داخل متصفحك مباشرة</strong>، دون الحاجة إلى تحميل
              برامج، أو إنشاء حساب، أو رفع ملفاتك إلى أي خادم خارجي. كل
              شيء يبقى على جهازك، بخصوصية كاملة وسرعة فورية.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى دمج PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              دمج PDF (Merge PDF) هو عملية تجميع ملفين أو أكثر من ملفات
              PDF في مستند واحد، مع الحفاظ على ترتيب الصفحات وجودة
              المحتوى الأصلي. هذه العملية مفيدة عندما يكون لديك عدة
              تقارير، أو فواتير، أو عقود، أو مستندات متفرقة، وتريد
              جمعها في ملف واحد لتسهيل المشاركة أو الطباعة أو الأرشفة.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              لماذا تختار أداة دمج PDF من Intooly؟
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🔒 خصوصية كاملة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  ملفاتك لا تُرفع إلى أي خادم. العملية كلها تتم داخل
                  متصفحك، فلا يمكن لأي طرف ثالث الوصول إلى مستنداتك.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ⚡ سرعة فورية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  لا انتظار لرفع الملفات أو تنزيلها من خادم. الدمج يحدث
                  في لحظة، والنتيجة جاهزة للتنزيل مباشرة.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  💰 مجاني بالكامل
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  بدون تسجيل، بدون حدود يومية، بدون علامات مائية، وبدون
                  رسوم خفية. الأداة مجانية للاستخدام الشخصي والتجاري.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🌍 دعم العربية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  واجهة عربية أصلية مع دعم كامل للنصوص العربية داخل
                  ملفات PDF، سواء كان الملف عربيًا أو إنجليزيًا.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تدمج ملفات PDF في 4 خطوات؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-3 leading-8 text-ink-700">
              <li>
                <strong>ارفع الملفات:</strong> اضغط على زر &quot;اختيار
                ملفات&quot; واختر ملفي PDF أو أكثر من جهازك. يمكنك أيضًا
                سحب الملفات وإفلاتها في المنطقة المخصصة.
              </li>
              <li>
                <strong>رتّب الملفات:</strong> استخدم أزرار التمرير
                لأعلى/لأسفل لترتيب الملفات بالترتيب الذي تريده في
                المستند النهائي.
              </li>
              <li>
                <strong>اضغط دمج:</strong> بمجرد ضغط زر &quot;دمج
                الملفات&quot;، سيتم تجميع جميع الصفحات في ملف واحد.
              </li>
              <li>
                <strong>نزّل النتيجة:</strong> اضغط على زر &quot;تنزيل
                الملف المدموج&quot; لتحفظ المستند النهائي على جهازك.
              </li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة لدمج PDF
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>الأعمال والمكاتب:</strong> دمج التقارير الشهرية
                أو الفواتير المتعددة في ملف واحد لتسهيل الأرشفة.
              </li>
              <li>
                <strong>الطلاب والباحثون:</strong> تجميع فصول البحث أو
                المراجع في مستند واحد للطباعة أو المراجعة.
              </li>
              <li>
                <strong>القانونيون:</strong> دمج العقود والملاحق في ملف
                واحد لتسهيل المشاركة مع العملاء.
              </li>
              <li>
                <strong>المصممون:</strong> جمع عروض التصميم أو ملفات
                العملاء في ملف واحد للتسليم.
              </li>
              <li>
                <strong>الاستخدام الشخصي:</strong> دمج الإيصالات أو
                المستندات الرسمية لحفظها بشكل منظم.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن دمج PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل أداة دمج PDF مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الأداة مجانية بالكامل. لا تطلب منك تسجيلًا، ولا
                  تفرض حدودًا يومية على عدد الملفات أو عدد عمليات الدمج.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة عند استخدام الأداة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الأمان مضمون. جميع العمليات تتم داخل متصفحك
                  مباشرة، ولا يتم رفع أي ملف إلى أي خادم. هذا يعني أن
                  ملفاتك تبقى على جهازك حتى بعد إغلاق الصفحة.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل هناك حد لعدد الملفات التي يمكن دمجها؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا يوجد حد رقمي لعدد الملفات، لكن الأداء يعتمد على
                  ذاكرة جهازك. يمكنك دمج 5 أو 10 أو حتى 20 ملفًا، شرط
                  ألا يتجاوز حجم كل ملف 100 ميغابايت.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني ترتيب الملفات قبل الدمج؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، يمكنك ترتيب الملفات بحرية قبل الدمج باستخدام
                  أزرار التمرير لأعلى/لأسفل بجانب كل ملف. الترتيب الذي
                  تختاره هو الترتيب الذي ستظهر به الصفحات في الملف
                  النهائي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الدمج يؤثر على جودة الملفات؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  لا، الدمج لا يؤثر على جودة الملفات الأصلية. النصوص
                  والصور والرسوم تبقى كما هي بدقة عالية. الأداة تحافظ
                  على بنية كل ملف أصلي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة تعمل على الجوال؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الأداة متوافقة مع الجوال والأجهزة اللوحية. يمكنك
                  استخدامها من أي متصفح حديث، دون الحاجة إلى تطبيق
                  منفصل.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني حذف بعض الصفحات بعد الدمج؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الأداة الحالية مخصصة للدمج فقط. إذا كنت تحتاج إلى حذف
                  صفحات بعد الدمج، يمكنك استخدام{' '}
                  <Link
                    href="/tools/delete-pdf-pages"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    أداة حذف صفحات PDF
                  </Link>{' '}
                  على Intooly.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  ما الفرق بين دمج PDF وضغط PDF؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  <strong>الدمج</strong> يجمع عدة ملفات في ملف واحد دون
                  تغيير حجمها الأصلي. <strong>الضغط</strong> يقلل من
                  حجم الملف الواحد عن طريق تحسين الصور والبيانات
                  الداخلية. للضغط، استخدم{' '}
                  <Link
                    href="/tools/compress-pdf"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    أداة ضغط PDF
                  </Link>
                  .
                </p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">
              أدوات PDF ذات صلة
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              استكشف باقي أدوات PDF المجانية على Intooly:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
