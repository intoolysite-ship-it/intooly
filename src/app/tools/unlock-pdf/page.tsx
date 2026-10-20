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
  Unlock,
} from "lucide-react";
import { unlockPdf, type UnlockProgress } from "./engine";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UnlockProgress>({ percent: 0, message: "" });
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
    setPassword("");
    setProgress({ percent: 0, message: "" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleUnlock = useCallback(async () => {
    if (!file) return;
    if (password.length < 1) {
      setError("يرجى إدخال كلمة المرور الحالية.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResultUrl(null);
    setProgress({ percent: 1, message: "جارٍ البدء…" });

    try {
      const blob = await unlockPdf(file, password, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? "فشل فك الحماية: " + e.message : "فشل فك حماية الملف.");
    } finally {
      setIsLoading(false);
    }
  }, [file, password]);

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
              <Unlock className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                إزالة كلمة مرور PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أزل كلمة المرور من ملفات PDF التي تملك صلاحية الوصول إليها. افتح مستنداتك المقفلة بسهولة — معالجة محلية 100%.
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
                <h2 className="text-lg font-bold text-ink-900">اختر ملف PDF محمي</h2>
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

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">كلمة المرور الحالية</h3>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-ink-700">أدخل كلمة المرور التي تفتح بها الملف</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
                      placeholder="••••••••"
                    />
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
                  onClick={handleUnlock}
                  disabled={isLoading || !password}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ إزالة الحماية…
                    </>
                  ) : (
                    <>
                      <Unlock className="h-5 w-5" />
                      إزالة كلمة المرور
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
                    <h3 className="text-base font-bold text-ink-900">تمت إزالة الحماية بنجاح</h3>
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
                    تنزيل PDF غير المحمي
                  </a>
                  <button
                    onClick={removeFile}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
                  >
                    إزالة حماية ملف آخر
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
                  <span>فك تشفير فوري</span>
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
                <li>• استخدم الأداة فقط مع الملفات التي تملك صلاحية الوصول إليها.</li>
                <li>• احتفظ بنسخة أصلية قبل إزالة الحماية.</li>
                <li>• الأداة تدعم AES-256 و RC4 (وليس AES-128).</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">
              ما المقصود بإزالة كلمة مرور PDF؟
            </h2>
            <p className="leading-8 text-ink-700 mb-4">
              هي إزالة حماية معينة من ملف PDF لإنشاء نسخة يمكن فتحها دون إدخال كلمة المرور، إذا كانت الأداة تدعم ذلك وكانت لديك الصلاحية اللازمة. وتتطلب بعض الملفات كلمة المرور الحالية قبل تنفيذ العملية.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيفية إزالة كلمة مرور PDF</h3>
            <ol className="space-y-2 leading-8 text-ink-700 list-decimal list-inside mb-4">
              <li>افتح أداة إزالة كلمة مرور PDF.</li>
              <li>اختر الملف الذي تملك صلاحية الوصول إليه.</li>
              <li>أدخل كلمة المرور الحالية.</li>
              <li>ابدأ عملية إزالة الحماية.</li>
              <li>نزّل النسخة الناتجة واختبر فتحها.</li>
            </ol>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">متى تحتاج إلى إزالة حماية PDF؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>تقليل خطوات فتح المستندات التي تستخدمها باستمرار.</li>
              <li>تجهيز نسخة عمل من ملف تملك صلاحية تعديله.</li>
              <li>تسهيل أرشفة مستندات داخلية وفق سياسات العمل.</li>
              <li>مشاركة نسخة مناسبة مع مستلم مخوّل.</li>
              <li>التعامل مع ملفات لم تعد تحتاج إلى الحماية نفسها.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">هل يمكن إزالة كلمة المرور دون معرفتها؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              لا يمكن ضمان ذلك، وقد لا يكون ممكنًا بحسب نوع التشفير. إذا كان الملف محميًا ولا تملك كلمة المرور، فالأفضل التواصل مع مالكه أو الجهة التي أصدرته للحصول على وصول مصرح به.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الفرق بين كلمة مرور الفتح وقيود المستند</h3>
            <p className="leading-8 text-ink-700 mb-4">
              قد تتطلب بعض الملفات كلمة مرور لفتح المحتوى، بينما تضع ملفات أخرى قيودًا على الطباعة أو التعديل أو النسخ. تختلف طرق التعامل مع كل نوع، كما تعتمد النتيجة على نوع التشفير والبرنامج المستخدم.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيف تتأكد من نجاح إزالة الحماية؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              بعد تنزيل النسخة، افتحها باستخدام قارئ PDF متوافق وتحقق مما إذا كانت لا تزال تطلب كلمة مرور. راجع أيضًا الصفحات والنصوص والتنسيق للتأكد من أن الملف الناتج صالح للاستخدام المطلوب.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أزيل كلمة مرور PDF؟</h4>
                <p className="mt-2 leading-8 text-ink-700">اختر الملف وأدخل كلمة المرور الحالية، ثم نفّذ العملية ونزّل النسخة الناتجة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن إزالة كلمة المرور مجانًا؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة مجانية بالكامل بدون تسجيل.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن فتح PDF دون معرفة كلمة المرور؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا يمكن ضمان ذلك. اطلب كلمة المرور من مالك الملف أو الجهة المخولة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل إزالة كلمة المرور تحذف محتوى الملف؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا، النتيجة نسخة من المستند بدون كلمة مرور. تحقق من الملف الناتج بعد العملية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يجب الاحتفاظ بالنسخة الأصلية؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، يُفضّل الاحتفاظ بالنسخة الأصلية إلى أن تتأكد من سلامة النسخة الناتجة.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات PDF ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/protect-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← حماية PDF بكلمة مرور
              </Link>
              <Link href="/tools/sign-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← توقيع PDF
              </Link>
              <Link href="/tools/merge-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← دمج PDF
              </Link>
              <Link href="/tools/compress-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← ضغط PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}