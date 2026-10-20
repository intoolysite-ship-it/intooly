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
  KeyRound,
} from "lucide-react";
import { protectPdf, type ProtectProgress } from "./engine";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProtectProgress>({ percent: 0, message: "" });
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
    setConfirmPassword("");
    setProgress({ percent: 0, message: "" });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleProtect = useCallback(async () => {
    if (!file) return;
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResultUrl(null);
    setProgress({ percent: 1, message: "جارٍ البدء…" });

    try {
      const blob = await protectPdf(file, password, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setResultName(file.name.replace(/\.pdf$/i, "") + "-protected.pdf");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? "فشل التشفير: " + e.message : "فشل تشفير الملف.");
    } finally {
      setIsLoading(false);
    }
  }, [file, password, confirmPassword]);

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
              <KeyRound className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                حماية PDF بكلمة مرور
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                احمِ ملفات PDF الحساسة بكلمة مرور قوية. شفّر مستنداتك باستخدام AES-256 داخل متصفحك — بدون رفع إلى أي سيرفر.
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

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">كلمة المرور</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">كلمة المرور (6 أحرف على الأقل)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">تأكيد كلمة المرور</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
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
                  onClick={handleProtect}
                  disabled={isLoading || !password || !confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التشفير…
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-5 w-5" />
                      تشفير الملف
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
                    <h3 className="text-base font-bold text-ink-900">تم التشفير بنجاح</h3>
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
                    تنزيل PDF المشفّر
                  </a>
                  <button
                    onClick={removeFile}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
                  >
                    تشفير ملف آخر
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
                  <span>تشفير AES-256 قوي</span>
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
                جميع الملفات تُعالج داخل متصفحك مباشرة باستخدام Web Crypto API. لا نرفع أي ملف إلى خوادمنا.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">💡 نصائح سريعة</h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• استخدم كلمة مرور طويلة (12+ حرفًا).</li>
                <li>• لا تشارك كلمة المرور في نفس قناة إرسال الملف.</li>
                <li>• احتفظ بنسخة أصلية آمنة من الملف.</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">
              ما معنى حماية PDF بكلمة مرور؟
            </h2>
            <p className="leading-8 text-ink-700 mb-4">
              تعني حماية PDF استخدام إعدادات أمان تمنع فتح المستند أو تقيّد بعض العمليات إلا وفق الصلاحيات المحددة. ويختلف طلب كلمة المرور عند فتح الملف عن القيود التي تتحكم في الطباعة أو النسخ أو التعديل.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيفية حماية ملف PDF</h3>
            <ol className="space-y-2 leading-8 text-ink-700 list-decimal list-inside mb-4">
              <li>افتح أداة حماية PDF.</li>
              <li>اختر الملف الذي تريد حمايته.</li>
              <li>أدخل كلمة المرور في الحقل المخصص.</li>
              <li>نفّذ عملية الحماية.</li>
              <li>نزّل الملف واختبر فتحه بكلمة المرور قبل مشاركته.</li>
            </ol>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">متى تحتاج إلى حماية مستندات PDF؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>مشاركة تقارير تحتوي على بيانات غير عامة.</li>
              <li>حفظ مستندات مالية.</li>
              <li>إرسال مستندات عمل إلى مستلمين محددين.</li>
              <li>حماية نسخ من الوثائق الشخصية.</li>
              <li>تقليل الوصول غير المقصود إلى محتوى المستند.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيف تختار كلمة مرور قوية؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              استخدم كلمة مرور طويلة يصعب تخمينها، وتجنب الأسماء والتواريخ الشائعة. لا تعِد استخدام كلمة المرور نفسها في حساباتك المهمة، وشارك كلمة المرور مع المستلم عبر قناة منفصلة عند الحاجة.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">هل كل أنواع حماية PDF متساوية؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              لا. تختلف صيغ التشفير وإصداراتها ومستويات الأمان. هذه الأداة تستخدم تشفير AES-256 (أقوى معيار حالي)، مع Web Crypto API الذي يعمل محليًا في متصفحك.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">ما الذي يجب فعله بعد تشفير الملف؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              احتفظ بكلمة المرور في مكان آمن، واختبر النسخة الناتجة، وتأكد من أن المستلم يستطيع فتحها. كما يفضل الاحتفاظ بنسخة أصلية آمنة إذا كانت سياسة العمل أو متطلبات الأرشفة تستدعي ذلك.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أضع كلمة مرور على PDF؟</h4>
                <p className="mt-2 leading-8 text-ink-700">اختر الملف وأدخل كلمة المرور في الأداة، ثم نفّذ الحماية ونزّل الملف.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن حماية PDF مجانًا؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة مجانية بالكامل بدون تسجيل.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل تمنع كلمة المرور فتح الملف؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، سيحتاج المستخدم إلى كلمة المرور للوصول إلى المحتوى عبر البرامج المتوافقة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني اختيار كلمة المرور بنفسي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، أنت من يختار كلمة المرور. يُفضل اختيار كلمة مرور قوية وفريدة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ماذا يحدث إذا نسيت كلمة المرور؟</h4>
                <p className="mt-2 leading-8 text-ink-700">قد يصبح الوصول إلى المستند صعبًا أو غير ممكن. احتفظ بكلمة المرور بأمان قبل حماية الملفات المهمة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل التشفير يحمي الملف بعد إرساله؟</h4>
                <p className="mt-2 leading-8 text-ink-700">يساعد تشفير الملف على حماية محتواه، لكن أمانه يتأثر بقوة كلمة المرور وطريقة مشاركتها.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات PDF ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/unlock-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← إزالة كلمة مرور PDF
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