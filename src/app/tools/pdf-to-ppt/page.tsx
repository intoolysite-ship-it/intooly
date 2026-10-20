"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  X,
  Download,
  LoaderCircle,
  ArrowLeft,
  Shield,
  Zap,
  Lock,
  Trash2,
  Presentation,
} from "lucide-react";
import { convertPdfToPpt, type ConvertProgress } from "./engine";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PdfToPptPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ConvertProgress>({ percent: 0, message: "" });
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    setError("");
    setResultUrl(null);

    if (selectedFile.type !== "application/pdf") {
      setError("يُسمح فقط بملفات PDF.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("الملف أكبر من 50 ميغابايت.");
      return;
    }
    setFile(selectedFile);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResultUrl(null);
    setError("");
    setProgress({ percent: 0, message: "" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    setResultUrl(null);
    setProgress({ percent: 1, message: "جارٍ البدء…" });

    try {
      const blob = await convertPdfToPpt(file, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(file.name.replace(/\.pdf$/i, "") + ".pptx");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? "فشل التحويل: " + e.message : "فشل تحويل الملف.");
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/pdf"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات PDF
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <Presentation className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                تحويل PDF إلى PowerPoint أونلاين
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                حوّل صفحات PDF إلى شرائح PowerPoint قابلة للتحرير. أنشئ عروضًا تقديمية من مستنداتك — معالجة محلية 100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {!file && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragging ? "border-brand-500 bg-brand-50" : "border-ink-300 bg-white hover:border-brand-400"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <Upload className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">اختر ملف PDF</h2>
                <p className="mt-1 text-sm text-ink-600">أو اسحب الملف وأفلته هنا</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار ملف
                </button>
                <p className="mt-3 text-xs text-ink-500">PDF فقط — بحد أقصى 50 ميغابايت</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {file && !resultUrl && (
              <>
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
                      <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">{file.name}</p>
                      <p className="text-xs text-ink-500">{formatSize(file.size)}</p>
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

                {isLoading && progress.percent > 0 && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">{progress.message}</span>
                      <span className="font-bold text-brand-700">{progress.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: progress.percent + "%" }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التحويل…
                    </>
                  ) : (
                    <>
                      <Presentation className="h-5 w-5" />
                      تحويل إلى PowerPoint
                    </>
                  )}
                </button>
              </>
            )}

            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                    <Download className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-ink-900">تم التحويل بنجاح</h3>
                    <p className="text-xs text-ink-600">{resultName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={resultUrl}
                    download={resultName}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل PowerPoint
                  </a>
                  <button
                    onClick={removeFile}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
                  >
                    تحويل ملف آخر
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">لماذا Intooly؟</h3>
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

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">🔒 خصوصيتك محفوظة</h3>
              <p className="text-sm leading-7 text-ink-700">
                جميع الملفات تُعالج داخل متصفحك مباشرة. لا نرفع أي ملف إلى خوادمنا.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">💡 نصائح سريعة</h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• استخدم ملفات PDF نصية للحصول على أفضل نتيجة.</li>
                <li>• راجع ترتيب الشرائح بعد التحويل.</li>
                <li>• قد تحتاج إلى تعديل التصميم يدويًا.</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">
              ما هي أداة تحويل PDF إلى PowerPoint؟
            </h2>
            <p className="leading-8 text-ink-700 mb-4">
              تساعد هذه الأداة على تحويل صفحات مستند PDF إلى صيغة عرض تقديمي متوافقة مع PowerPoint، مثل PPTX. ويمكن استخدام النتيجة لعرض المعلومات أو تنظيمها في شرائح.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيفية تحويل PDF إلى PowerPoint</h3>
            <ol className="space-y-2 leading-8 text-ink-700 list-decimal list-inside mb-4">
              <li>افتح أداة التحويل.</li>
              <li>اختر ملف PDF من جهازك.</li>
              <li>ابدأ عملية التحويل.</li>
              <li>نزّل ملف العرض الناتج.</li>
              <li>افتحه في برنامج متوافق وراجع الشرائح.</li>
            </ol>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">لماذا تحوّل PDF إلى عرض تقديمي؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>عرض التقارير في الاجتماعات.</li>
              <li>استخدام المواد التعليمية في المحاضرات.</li>
              <li>تقديم ملخصات للمشروعات.</li>
              <li>مشاركة المعلومات في ورش العمل.</li>
              <li>إعادة تنظيم محتوى المستند في شرائح.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">هل تكون الشرائح قابلة للتحرير؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              يعتمد ذلك على طريقة التحويل. في هذه الأداة، يُستخرج النص من كل صفحة ويُوضع في شريحة مستقلة، مما يجعل النص قابلًا للتحرير. لكن التصميم الأصلي (الصور، الجداول، الألوان) لا يُنقل تلقائيًا.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيف تحافظ على جودة العرض؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              استخدم ملف PDF واضحًا، وافحص ترتيب الصفحات وحجم النصوص والصور بعد التحويل. وإذا كانت الشرائح تحتاج إلى تعديل، فتحقق من إمكانية تحرير عناصرها.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">استخدامات تحويل PDF إلى PowerPoint</h3>
            <p className="leading-8 text-ink-700 mb-4">
              تساعد هذه العملية في تجهيز عروض من التقارير والمذكرات التعليمية والوثائق التعريفية، لكنها لا تستبدل المراجعة اليدوية عند الحاجة إلى تصميم احترافي أو إعادة بناء الشرائح.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أحوّل PDF إلى PowerPoint؟</h4>
                <p className="mt-2 leading-8 text-ink-700">اختر ملف PDF، ابدأ التحويل، ثم نزّل ملف العرض الناتج.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن تحويل PDF إلى PPTX؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة تُنتج ملف PPTX قابل للتحرير.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن تعديل النصوص بعد التحويل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">يمكن ذلك إذا تحولت النصوص إلى عناصر قابلة للتحرير.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يحتفظ التحويل بالتصميم الأصلي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">قد يحافظ على المظهر العام، لكن يمكن أن تختلف الخطوط والأبعاد وتوزيعات العناصر.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن تحويل ملف PDF متعدد الصفحات؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، كل صفحة تتحول إلى شريحة مستقلة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يغني التحويل عن تصميم العرض؟</h4>
                <p className="mt-2 leading-8 text-ink-700">ليس دائمًا؛ فقد تحتاج إلى تعديل الشرائح وإعادة ترتيب المحتوى لتحسين سهولة القراءة.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات PDF ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/pdf-to-word" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل PDF إلى Word
              </Link>
              <Link href="/tools/pdf-to-excel" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل PDF إلى Excel
              </Link>
              <Link href="/tools/pdf-to-jpg" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل PDF إلى JPG
              </Link>
              <Link href="/tools/merge-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← دمج PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}