"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import JSZip from "jszip";
import {
  Image as ImageIcon,
  Upload,
  Download,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  X,
  Archive,
  ShieldCheck,
  Zap,
  Settings2,
  ArrowDown,
  RefreshCw,
  Files,
  HardDrive,
  Sparkles,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

type FileStatus = "waiting" | "processing" | "done" | "error";

interface ConversionItem {
  id: string;
  file: File;
  status: FileStatus;
  output?: Blob;
  outputUrl?: string;
  error?: string;
}

const MAX_FILE_SIZE = 40 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function getOutputName(name: string): string {
  return name.replace(/\.(heic|heif)$/i, "") + ".jpg";
}

export default function HeicToJpgPage() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [quality, setQuality] = useState(92);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputUrlsRef = useRef<string[]>([]);
  const stopRef = useRef(false);

  useEffect(() => {
    return () => {
      outputUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const selected = Array.from(fileList);
    const accepted: ConversionItem[] = [];
    const rejected: string[] = [];

    for (const file of selected) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const isHeic = extension === "heic" || extension === "heif";

      if (!isHeic) {
        rejected.push(`${file.name}: الملف ليس HEIC أو HEIF`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name}: حجم الملف أكبر من 40 ميجابايت`);
        continue;
      }

      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "waiting",
      });
    }

    if (accepted.length) {
      setItems((previous) => [...previous, ...accepted]);
      setMessage("");
    }

    if (rejected.length) {
      setMessage(rejected.slice(0, 3).join(" — "));
    }
  }, []);

  const removeItem = (id: string) => {
    setItems((previous) => {
      const target = previous.find((item) => item.id === id);
      if (target?.outputUrl) {
        URL.revokeObjectURL(target.outputUrl);
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    if (isConverting) return;
    items.forEach((item) => {
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setItems([]);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const convertAll = async () => {
    const pending = items.filter(
      (item) => item.status === "waiting" || item.status === "error"
    );
    if (!pending.length || isConverting) return;

    setIsConverting(true);
    setMessage("");
    stopRef.current = false;

    try {
      const module = await import("heic2any");
      const heic2any = module.default;

      for (const item of pending) {
        if (stopRef.current) break;

        setItems((previous) =>
          previous.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "processing", error: undefined }
              : entry
          )
        );

        try {
          const result = await heic2any({
            blob: item.file,
            toType: "image/jpeg",
            quality: quality / 100,
          });

          const outputBlob = Array.isArray(result) ? result[0] : result;

          if (!(outputBlob instanceof Blob) || outputBlob.size === 0) {
            throw new Error("لم يتم إنشاء صورة JPG صالحة.");
          }

          const outputUrl = URL.createObjectURL(outputBlob);
          outputUrlsRef.current.push(outputUrl);

          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "done", output: outputBlob, outputUrl, error: undefined }
                : entry
            )
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "تعذر تحويل هذا الملف.";
          setItems((previous) =>
            previous.map((entry) =>
              entry.id === item.id ? { ...entry, status: "error", error: errorMessage } : entry
            )
          );
        }
      }
    } catch {
      setMessage("تعذر تحميل مكتبة التحويل. تحقق من اتصال الإنترنت ثم أعد المحاولة.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadOne = (item: ConversionItem) => {
    if (!item.output) return;
    const url = item.outputUrl || URL.createObjectURL(item.output);
    const link = document.createElement("a");
    link.href = url;
    link.download = getOutputName(item.file.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadZip = async () => {
    const completed = items.filter((item) => item.status === "done" && item.output);
    if (!completed.length || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      completed.forEach((item) => {
        zip.file(getOutputName(item.file.name), item.output as Blob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "intooly-heic-to-jpg.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      setMessage("حدث خطأ أثناء إنشاء ملف ZIP. حاول مرة أخرى.");
    } finally {
      setIsZipping(false);
    }
  };

  const completedCount = items.filter((item) => item.status === "done").length;
  const errorCount = items.filter((item) => item.status === "error").length;

  return (
    <main dir="rtl" className="min-h-screen bg-ink-50 text-ink-900 transition-colors duration-300">
      
      {/* ================================================== */}
      {/* ✅ HERO BANNER (مطابق لهوية أدوات الصور) */}
      {/* ================================================== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link href="/tools/images" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع أدوات الصور
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <FileImage className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                تحويل HEIC إلى JPG مجانًا أونلاين
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                حوّل صور iPhone بصيغة HEIC وHEIF إلى JPG بسهولة وأمان. أضف صورة واحدة أو مجموعة صور، واختر جودة التحويل، ثم نزّل الصور مباشرة إلى جهازك دون تثبيت برامج.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* ✅ MAIN TOOL CARD */}
      {/* ================================================== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-ink-200 rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
            
            <div className="border-b border-ink-100 bg-gradient-to-l from-brand-50 via-white to-amber-50 px-5 py-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">محول صور HEIC إلى JPG</h2>
                    <p className="mt-0.5 text-xs text-ink-600">أضف الصور وابدأ التحويل في خطوات بسيطة</p>
                  </div>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  مجاني 100%
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={`group cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-all sm:py-14 ${
                  isDragging ? "border-brand-500 bg-brand-50" : "border-ink-300 bg-ink-50 hover:border-brand-400 hover:bg-brand-50/50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".heic,.heif,image/heic,image/heif"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                />
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 transition-transform group-hover:scale-105">
                  <Upload size={30} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink-900">اسحب صور HEIC وأفلتها هنا</h3>
                <p className="mb-5 text-sm text-ink-600">أو اضغط لاختيار الصور من جهازك</p>
                <span className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600">
                  <ImageIcon size={18} />
                  اختيار الصور
                </span>
                <p className="mt-5 text-xs text-ink-500">يدعم HEIC وHEIF — الحد الأقصى للملف الواحد 40 ميجابايت</p>
              </div>

              {/* Quality Slider */}
              <div className="mt-6 rounded-2xl border border-ink-200 bg-ink-50 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold text-ink-900">
                    <Settings2 size={19} className="text-brand-600" />
                    إعدادات جودة JPG
                  </div>
                  <span className="rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-bold text-brand-700">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="1"
                  value={quality}
                  disabled={isConverting}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-brand-500 disabled:cursor-not-allowed"
                />
                <div className="mt-2 flex justify-between text-xs text-ink-500">
                  <span>70% — حجم أصغر</span>
                  <span>85% — متوازن</span>
                  <span>100% — جودة أعلى</span>
                </div>
                <p className="mt-3 text-xs leading-6 text-ink-600">
                  رفع الجودة قد يزيد حجم الملف. صيغة JPG تستخدم ضغطًا مع فقدان بعض البيانات، لذلك لا تعني جودة 100% تحويلًا بلا فقدان.
                </p>
              </div>

              {/* Messages */}
              {message && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Files List */}
              {items.length > 0 && (
                <div className="mt-8">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink-900">الصور المضافة</h3>
                      <p className="mt-1 text-sm text-ink-600">
                        {items.length} ملف — {completedCount} تم تحويله
                        {errorCount > 0 ? ` — ${errorCount} تعذر تحويله` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearAll}
                      disabled={isConverting}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                      مسح الكل
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 overflow-hidden">
                          {item.outputUrl ? (
                            <img src={item.outputUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <FileImage size={27} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink-900">{item.file.name}</p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-600">
                            <span>{formatBytes(item.file.size)}</span>
                            <span>HEIC / HEIF</span>
                            {item.output && (
                              <>
                                <span>JPG: {formatBytes(item.output.size)}</span>
                                <span className="text-green-700 font-semibold">
                                  {item.output.size < item.file.size ? `توفير ${Math.round((1 - item.output.size / item.file.size) * 100)}%` : "تم التحويل"}
                                </span>
                              </>
                            )}
                          </div>
                          {item.status === "error" && <p className="mt-2 text-xs text-rose-600">{item.error}</p>}
                          {item.status === "processing" && (
                            <p className="mt-2 text-xs font-semibold text-brand-600 flex items-center gap-1">
                              <Loader2 size={14} className="animate-spin" /> جارٍ تحويل الصورة...
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="text-sm">
                            {item.status === "waiting" && <span className="text-ink-500">في الانتظار</span>}
                            {item.status === "processing" && <span className="text-brand-600">تحويل</span>}
                            {item.status === "done" && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-green-600">
                                <CheckCircle2 size={17} /> مكتمل
                              </span>
                            )}
                            {item.status === "error" && (
                              <span className="inline-flex items-center gap-1.5 text-rose-600">
                                <AlertCircle size={17} /> خطأ
                              </span>
                            )}
                          </div>

                          {item.status === "done" && (
                            <button
                              type="button"
                              onClick={() => downloadOne(item)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition hover:bg-brand-100"
                              title="تنزيل JPG"
                            >
                              <Download size={19} />
                            </button>
                          )}

                          {!isConverting && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                              title="حذف الملف"
                            >
                              <X size={19} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={convertAll}
                      disabled={isConverting || !items.some((item) => item.status === "waiting" || item.status === "error")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-4 font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isConverting ? (
                        <><Loader2 size={19} className="animate-spin" /> جارٍ تحويل الصور...</>
                      ) : (
                        <><RefreshCw size={19} /> تحويل الصور إلى JPG</>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={downloadZip}
                      disabled={completedCount === 0 || isZipping}
                      className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-4 font-bold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isZipping ? <Loader2 size={19} className="animate-spin" /> : <Archive size={19} />}
                      تنزيل الكل ZIP
                    </button>
                  </div>

                  {completedCount > 0 && (
                    <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 font-bold text-green-800">
                        <CheckCircle2 size={19} />
                        اكتمل تحويل {completedCount} صورة
                      </div>
                    </div>
                  )}
                </div>
              )}

              {items.length === 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-500">
                  <HardDrive size={15} />
                  <span>لا يتم رفع الصور إلى خادم الموقع أثناء التحويل (معالجة محلية)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* ✅ SEO CONTENT SECTION (مطابق لهوية الموقع) */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-white border-t border-ink-100">
        <div className="container mx-auto px-4 max-w-4xl text-right">
          
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900">
              ما هو تنسيق HEIC ولماذا نحوله إلى JPG؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700">
              HEIC هو تنسيق صور حديث تستخدمه أجهزة iPhone وأجهزة Apple الأخرى لحفظ الصور بكفاءة مع حجم ملف أقل مقارنة ببعض التنسيقات التقليدية. ومع ذلك، قد تواجه مشكلة عند مشاركة هذه الصور أو فتحها على أجهزة وبرامج لا تدعم HEIC بشكل مباشر.
            </p>
            <p className="text-base leading-relaxed text-ink-700">
              يساعد تحويل HEIC إلى JPG على جعل الصور أكثر توافقًا مع المتصفحات وبرامج تحرير الصور وأنظمة التشغيل ومواقع الويب المختلفة. صيغة JPG من أكثر صيغ الصور انتشارًا، ولذلك تكون مناسبة للمشاركة والاستخدام اليومي. باستخدام محول Intooly يمكنك تحويل ملفات HEIC وHEIF إلى صور JPEG من المتصفح مباشرة، دون الحاجة إلى تثبيت برنامج تحويل منفصل.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900">
              كيفية تحويل HEIC إلى JPG؟
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'أضف صور HEIC', desc: 'اسحب الصور إلى منطقة الرفع أو اختر ملفات HEIC وHEIF من جهازك.' },
                { num: 2, title: 'اختر جودة JPG', desc: 'حدد مستوى الجودة المناسب (من 70% إلى 100%)، ثم اضغط على زر تحويل الصور.' },
                { num: 3, title: 'نزّل الصور', desc: 'نزّل كل صورة منفردة أو اجمع الصور المكتملة في ملف ZIP واحد لتسهيل الحفظ.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-extrabold flex items-center justify-center shadow-lg">
                    {step.num}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-extrabold text-base mb-1 text-ink-900">{step.title}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900">
              الفرق بين HEIC وJPG
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
              <table className="w-full min-w-[520px] text-right text-sm">
                <thead className="bg-ink-50 text-ink-900">
                  <tr>
                    <th className="p-4 font-bold border-b border-ink-200">المقارنة</th>
                    <th className="p-4 font-bold border-b border-ink-200">HEIC / HEIF</th>
                    <th className="p-4 font-bold border-b border-ink-200">JPG / JPEG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 text-ink-700">
                  <tr>
                    <td className="p-4 font-semibold text-ink-900">التوافق</td>
                    <td className="p-4">قد يحتاج إلى دعم خاص أو برامج إضافية</td>
                    <td className="p-4">مدعوم على نطاق واسع في كل الأنظمة</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-ink-900">حجم الملف</td>
                    <td className="p-4">غالبًا أكثر كفاءة في التخزين (حجم أصغر)</td>
                    <td className="p-4">يعتمد على مستوى الجودة والضغط المختار</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-ink-900">الاستخدام الشائع</td>
                    <td className="p-4">شائع في أجهزة Apple (iPhone, iPad)</td>
                    <td className="p-4">المواقع الإلكترونية، المشاركة، والبرامج</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-ink-900">تقنية الضغط</td>
                    <td className="p-4">تقنية ضغط حديثة ومتقدمة</td>
                    <td className="p-4">ضغط JPEG تقليدي مع فقدان بعض البيانات</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="mb-12 rounded-2xl border border-brand-200 bg-brand-50/50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 shrink-0 text-brand-600" size={25} />
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">هل تحويل الصور آمن؟</h2>
                <p className="mt-3 text-sm leading-8 text-ink-700">
                  نعم، تماماً. تتم معالجة الصور باستخدام مكتبة التحويل داخل متصفحك مباشرة، ولا تتطلب الأداة إرسال ملفات الصور إلى خادم Intooly. تظل الملفات الأصلية على جهازك، ويمكنك تنزيل النسخ المحوّلة فوراً. يُرجى الانتباه إلى أن التحويل إلى JPG لا يحتفظ بالضرورة بجميع بيانات EXIF أو البيانات الوصفية الموجودة في الملف الأصلي.
                </p>
              </div>
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900">
              الأسئلة الشائعة حول تحويل HEIC إلى JPG
            </h2>
            <div className="space-y-3">
              {[
                { q: "كيف أحول HEIC إلى JPG مجانًا؟", a: "افتح أداة Intooly، وأضف ملفات HEIC أو HEIF، وحدد جودة JPG، ثم اضغط على تحويل الصور. بعد انتهاء التحويل يمكنك تنزيل الصور." },
                { q: "هل يمكن تحويل صور iPhone إلى JPG؟", a: "نعم، يمكنك إضافة الصور المحفوظة بصيغة HEIC أو HEIF من iPhone وتحويلها إلى JPG باستخدام الأداة." },
                { q: "هل يمكن تحويل عدة صور HEIC دفعة واحدة؟", a: "نعم، يمكنك اختيار عدة ملفات في المرة الواحدة، ثم تحويلها وتنزيل الصور المكتملة كل صورة على حدة أو في ملف ZIP." },
                { q: "هل يؤدي تحويل HEIC إلى JPG إلى فقدان الجودة؟", a: "صيغة JPG تستخدم ضغطًا مع فقدان بعض البيانات. يمكنك رفع إعداد الجودة للحصول على نتيجة أفضل، لكن التحويل لا يضمن الحفاظ على كل بيانات الصورة الأصلية." },
                { q: "هل أحتاج إلى تثبيت برنامج لتحويل HEIC؟", a: "لا، تعمل الأداة من خلال متصفح الويب ولا تحتاج إلى تثبيت برنامج تحويل منفصل." },
                { q: "هل يتم رفع صوري إلى خادم الموقع؟", a: "تتم عملية التحويل داخل متصفحك باستخدام مكتبة التحويل، ولا تتطلب الأداة رفع ملفات الصور إلى خادم Intooly." },
              ].map((faq, i) => (
                <details key={i} className="bg-white border-2 border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold flex justify-between items-center text-ink-900 hover:bg-brand-50 transition text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-brand-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 border-t border-ink-100 pt-3 leading-relaxed text-right">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900 text-right">
              أدوات صور أخرى من Intooly
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'ضغط الصور', desc: 'قلّل حجم الصور لتسهيل مشاركتها واستخدامها على الويب.', href: '/tools/image-compressor' },
                { title: 'إزالة خلفية الصور', desc: 'أزل خلفية الصورة باستخدام أداة المعالجة الذكية.', href: '/tools/background-remover' },
                { title: 'تغيير حجم الصور', desc: 'غيّر أبعاد الصور بالبكسل لتناسب المواقع والمنصات.', href: '/tools/image-resizer' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="flex flex-col gap-2 p-5 rounded-xl bg-white border-2 border-ink-200 text-right transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{tool.desc}</p>
                  <span className="text-xs text-brand-600 mt-2 flex items-center gap-1 font-bold">
                    جرّب الأداة <ArrowLeft className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </article>

        </div>
      </section>

      <footer className="py-8 bg-ink-900 text-center text-white">
        <h2 className="text-xl font-extrabold mb-2">حوّل صور iPhone إلى JPG بسهولة</h2>
        <p className="text-sm leading-7 text-ink-300 max-w-2xl mx-auto mb-4">
          استخدم محول HEIC إلى JPG المجاني من Intooly لتحويل صورك ومشاركتها بصيغة متوافقة مع معظم الأجهزة والتطبيقات.
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition hover:bg-brand-600"
        >
          <ArrowDown size={18} className="rotate-180" />
          ابدأ التحويل الآن
        </button>
        <p className="mt-8 text-xs leading-6 text-ink-400">
          Intooly — أدوات مجانية عبر الإنترنت لمعالجة الصور والملفات.
        </p>
      </footer>
    </main>
  );
}