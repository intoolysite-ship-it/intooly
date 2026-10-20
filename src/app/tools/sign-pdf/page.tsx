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
  PenTool,
} from "lucide-react";
import { signPdf } from "./engine";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function SignPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [xPercent, setXPercent] = useState(80);
  const [yPercent, setYPercent] = useState(15);
  const [widthPercent, setWidthPercent] = useState(20);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  const handlePdf = useCallback((f: File | null) => {
    if (!f) return;
    setError("");
    setResultUrl(null);
    if (f.type !== "application/pdf") {
      setError("يُسمح فقط بملفات PDF.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("الملف أكبر من 50 ميغابايت.");
      return;
    }
    setPdfFile(f);
  }, []);

  const handleSig = useCallback((f: File | null) => {
    if (!f) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/jpg"].includes(f.type)) {
      setError("صورة التوقيع يجب أن تكون PNG أو JPG.");
      return;
    }
    setSigFile(f);
    if (sigPreview) URL.revokeObjectURL(sigPreview);
    setSigPreview(URL.createObjectURL(f));
  }, [sigPreview]);

  const removeAll = useCallback(() => {
    setPdfFile(null);
    setSigFile(null);
    if (sigPreview) URL.revokeObjectURL(sigPreview);
    setSigPreview(null);
    setResultUrl(null);
    setError("");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (sigInputRef.current) sigInputRef.current.value = "";
  }, [sigPreview]);

  const handleSign = useCallback(async () => {
    if (!pdfFile || !sigFile) {
      setError("يرجى اختيار ملف PDF وصورة التوقيع أولًا.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResultUrl(null);

    try {
      const blob = await signPdf(pdfFile, sigFile, {
        pageIndex,
        xPercent,
        yPercent,
        widthPercent,
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? "فشل التوقيع: " + e.message : "فشل توقيع الملف.");
    } finally {
      setIsLoading(false);
    }
  }, [pdfFile, sigFile, pageIndex, xPercent, yPercent, widthPercent]);

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
              <PenTool className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                توقيع PDF أونلاين
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أضف توقيعك الإلكتروني إلى ملفات PDF. ارفع صورة توقيعك، حدّد موضعها وحجمها، ثم نزّل المستند الموقّع — معالجة محلية 100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* PDF Upload */}
            {!pdfFile && (
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-center transition-colors hover:border-brand-400"
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handlePdf(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <FileText className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">1. اختر ملف PDF</h2>
                <p className="mt-1 text-sm text-ink-600">أو اسحب الملف وأفلته هنا</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); pdfInputRef.current?.click(); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار PDF
                </button>
              </div>
            )}

            {pdfFile && (
              <>
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
                      <FileText className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink-900">{pdfFile.name}</p>
                      <p className="text-xs text-ink-500">{formatSize(pdfFile.size)}</p>
                    </div>
                    <button
                      onClick={removeAll}
                      className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Signature Upload */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-3 text-base font-bold text-ink-900">2. صورة التوقيع</h3>
                  <input
                    ref={sigInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleSig(e.target.files?.[0] ?? null)}
                  />
                  {!sigPreview ? (
                    <button
                      onClick={() => sigInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-ink-300 bg-white p-6 text-center transition hover:border-brand-400"
                    >
                      <Upload className="mx-auto mb-2 h-6 w-6 text-brand-600" />
                      <span className="text-sm font-bold text-ink-700">رفع صورة التوقيع (PNG أو JPG)</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-ink-200 bg-slate-50 p-3 text-center">
                        <img src={sigPreview} alt="معاينة التوقيع" className="mx-auto max-h-24" />
                      </div>
                      <button
                        onClick={() => sigInputRef.current?.click()}
                        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                      >
                        تغيير صورة التوقيع
                      </button>
                    </div>
                  )}
                </div>

                {/* Position Controls */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">3. موضع التوقيع</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">رقم الصفحة (0 = الأولى)</label>
                      <input
                        type="number"
                        min="0"
                        value={pageIndex}
                        onChange={(e) => setPageIndex(Number(e.target.value))}
                        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">الموضع الأفقي (X): {xPercent}%</label>
                      <input type="range" min="0" max="100" value={xPercent} onChange={(e) => setXPercent(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">الموضع الرأسي (Y): {yPercent}%</label>
                      <input type="range" min="0" max="100" value={yPercent} onChange={(e) => setYPercent(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-ink-700">عرض التوقيع: {widthPercent}%</label>
                      <input type="range" min="5" max="60" value={widthPercent} onChange={(e) => setWidthPercent(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSign}
                  disabled={isLoading || !sigFile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ التوقيع…
                    </>
                  ) : (
                    <>
                      <PenTool className="h-5 w-5" />
                      توقيع PDF
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
                    <h3 className="text-base font-bold text-ink-900">تم التوقيع بنجاح</h3>
                    <p className="text-xs text-ink-600">{pdfFile?.name.replace(/\.pdf$/i, "")}-signed.pdf</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={resultUrl}
                    download={`signed-${pdfFile?.name || "document.pdf"}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل PDF الموقّع
                  </a>
                  <button
                    onClick={removeAll}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
                  >
                    توقيع ملف آخر
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
                  <span>توقيع فوري بدون انتظار</span>
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
                <li>• استخدم صورة توقيع واضحة بخلفية شفافة (PNG) للحصول على أفضل نتيجة.</li>
                <li>• راجع موضع التوقيع قبل التنزيل.</li>
                <li>• هذا توقيع مرئي، وليس توقيعًا رقميًا موثقًا.</li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">
              ما المقصود بتوقيع PDF؟
            </h2>
            <p className="leading-8 text-ink-700 mb-4">
              توقيع PDF هو إضافة توقيع مرئي إلى صفحة من صفحات المستند. وقد يكون التوقيع مرسومًا أو صورة لتوقيع مكتوب بخط اليد. ولا تعني إضافة صورة التوقيع تلقائيًا وجود شهادة رقمية أو إثبات هوية موثّق.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيفية إضافة توقيع إلى PDF</h3>
            <ol className="space-y-2 leading-8 text-ink-700 list-decimal list-inside mb-4">
              <li>ارفع ملف PDF.</li>
              <li>ارفع صورة توقيعك (PNG أو JPG).</li>
              <li>حدّد رقم الصفحة، وموضع التوقيع (X و Y)، وعرضه.</li>
              <li>اضغط "توقيع PDF" ونزّل الملف.</li>
            </ol>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">متى تحتاج إلى توقيع ملف PDF؟</h3>
            <ul className="space-y-2 leading-8 text-ink-700 list-disc list-inside mb-4">
              <li>إضافة توقيع إلى النماذج الإدارية.</li>
              <li>تجهيز مستندات العمل للمراجعة.</li>
              <li>توقيع بعض المراسلات والوثائق.</li>
              <li>إضافة توقيع مرئي إلى نسخة من اتفاقية.</li>
              <li>تقليل الحاجة إلى الطباعة عند التعامل مع المستندات.</li>
            </ul>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">كيف تحصل على توقيع واضح؟</h3>
            <p className="leading-8 text-ink-700 mb-4">
              استخدم صورة واضحة، ويُفضل استخدام PNG بخلفية شفافة. اختر حجمًا مناسبًا، ولا تضع التوقيع فوق النصوص أو الحقول المهمة.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الفرق بين التوقيع المرئي والتوقيع الرقمي</h3>
            <p className="leading-8 text-ink-700 mb-4">
              التوقيع المرئي هو شكل يظهر داخل المستند. أما التوقيع الرقمي القائم على الشهادات فيمكن أن يوفر آليات للتحقق من هوية الموقّع وسلامة الملف. لا ينبغي اعتبار النوعين متكافئين من الناحية التقنية أو القانونية.
            </p>

            <h3 className="text-lg font-bold text-ink-900 mt-8 mb-3">الأسئلة الشائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">كيف أوقّع ملف PDF أونلاين؟</h4>
                <p className="mt-2 leading-8 text-ink-700">افتح الأداة، واختر الملف، وأضف التوقيع وفق الخيارات المتاحة، ثم نزّل المستند وراجعه.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني رسم توقيعي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">حاليًا، الأداة تتيح رفع صورة التوقيع. يمكنك رسم توقيعك على ورقة، ثم تصويره ورفعه.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكن رفع صورة توقيع؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، يمكنك رفع صورة توقيع (PNG أو JPG) وإضافتها إلى المستند.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل إضافة صورة توقيع تجعل المستند موثقًا رقميًا؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا، فإضافة صورة لا تنشئ وحدها شهادة توقيع رقمي أو تحققًا موثقًا من الهوية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل التوقيع الإلكتروني معترف به قانونيًا؟</h4>
                <p className="mt-2 leading-8 text-ink-700">يختلف الاعتراف القانوني حسب الدولة ونوع التوقيع والمستند ومتطلبات الجهة المعنية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني مراجعة موضع التوقيع قبل التنزيل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، يمكنك ضبط الموضع والحجم بدقة قبل التنزيل.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات PDF ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/protect-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← حماية PDF بكلمة مرور
              </Link>
              <Link href="/tools/unlock-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← إزالة كلمة مرور PDF
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