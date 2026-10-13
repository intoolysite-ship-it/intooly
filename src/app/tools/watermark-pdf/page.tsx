'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Stamp,
  Upload,
  Download,
  LoaderCircle,
  ArrowLeft,
  FileText,
  Shield,
  Zap,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Type,
  Palette,
  RotateCw,
  Move,
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

type PositionKey =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom';

type ColorKey = 'black' | 'red' | 'blue' | 'gray' | 'green';

type SizeKey = 'small' | 'medium' | 'large';

type RotationKey = 0 | 45 | -45;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const COLORS: Record<ColorKey, { r: number; g: number; b: number; label: string }> = {
  black: { r: 0, g: 0, b: 0, label: 'أسود' },
  red: { r: 0.86, g: 0.15, b: 0.15, label: 'أحمر' },
  blue: { r: 0.15, g: 0.39, b: 0.92, label: 'أزرق' },
  gray: { r: 0.5, g: 0.5, b: 0.5, label: 'رمادي' },
  green: { r: 0.06, g: 0.65, b: 0.36, label: 'أخضر' },
};

const SIZES: Record<SizeKey, { size: number; label: string }> = {
  small: { size: 24, label: 'صغير' },
  medium: { size: 48, label: 'متوسط' },
  large: { size: 72, label: 'كبير' },
};

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('سري');
  const [position, setPosition] = useState<PositionKey>('center');
  const [color, setColor] = useState<ColorKey>('red');
  const [size, setSize] = useState<SizeKey>('medium');
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState<RotationKey>(45);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState(0);
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
    } catch (e) {
      setError('تعذر قراءة الملف. تأكد أنه ملف PDF صالح.');
      console.error(e);
    }
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResultUrl(null);
    setError('');
    setPageCount(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const applyWatermark = useCallback(async () => {
    if (!file) return;
    if (!text.trim()) {
      setError('اكتب نص العلامة المائية.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();

      const colorDef = COLORS[color];
      const sizeDef = SIZES[size];
      const textColor = rgb(colorDef.r, colorDef.g, colorDef.b);
      const fontSize = sizeDef.size;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      for (const page of pages) {
        const { width, height } = page.getSize();

        let x = 0;
        let y = 0;

        switch (position) {
          case 'center':
            x = (width - textWidth) / 2;
            y = (height - textHeight) / 2;
            break;
          case 'top-left':
            x = 40;
            y = height - textHeight - 40;
            break;
          case 'top-right':
            x = width - textWidth - 40;
            y = height - textHeight - 40;
            break;
          case 'bottom-left':
            x = 40;
            y = 40;
            break;
          case 'bottom-right':
            x = width - textWidth - 40;
            y = 40;
            break;
          case 'top':
            x = (width - textWidth) / 2;
            y = height - textHeight - 40;
            break;
          case 'bottom':
            x = (width - textWidth) / 2;
            y = 40;
            break;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
          opacity: opacity / 100,
          rotate: degrees(rotation),
        });
      }

      const bytes = await pdf.save();
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
          ? 'فشل الإضافة: ' + e.message
          : 'فشل إضافة العلامة المائية.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, text, position, color, size, opacity, rotation]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-watermarked-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-gradient-to-b from-ink-50 to-white"
    >
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
              <Stamp className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                إضافة علامة مائية إلى PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                أضف علامة مائية نصية إلى كل صفحات PDF. اختر النص، اللون،
                الحجم، الموضع، والشفافية. كل شيء يعمل داخل متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
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
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
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

                {/* نص العلامة */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <Type className="h-4 w-4 text-brand-500" />
                    نص العلامة المائية
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="مثال: سري، نسخة، Intooly"
                    className="w-full rounded-lg border border-ink-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none"
                    maxLength={50}
                  />
                  <p className="mt-2 text-xs text-ink-500">
                    حد أقصى 50 حرفاً
                  </p>
                </div>

                {/* الموضع */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <Move className="h-4 w-4 text-brand-500" />
                    الموضع
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {(
                      [
                        { key: 'center', label: 'الوسط' },
                        { key: 'top', label: 'أعلى الوسط' },
                        { key: 'bottom', label: 'أسفل الوسط' },
                        { key: 'top-left', label: 'أعلى يسار' },
                        { key: 'top-right', label: 'أعلى يمين' },
                        { key: 'bottom-left', label: 'أسفل يسار' },
                        { key: 'bottom-right', label: 'أسفل يمين' },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setPosition(p.key)}
                        className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                          position === p.key
                            ? 'border-brand-500 bg-brand-50 text-ink-900'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* اللون */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <Palette className="h-4 w-4 text-brand-500" />
                    اللون
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(COLORS) as ColorKey[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`rounded-lg border-2 p-3 transition ${
                          color === c
                            ? 'border-brand-500 ring-2 ring-brand-200'
                            : 'border-ink-200 hover:border-brand-300'
                        }`}
                        aria-label={COLORS[c].label}
                      >
                        <div
                          className="mx-auto h-6 w-6 rounded-full"
                          style={{
                            backgroundColor: `rgb(${COLORS[c].r * 255}, ${
                              COLORS[c].g * 255
                            }, ${COLORS[c].b * 255})`,
                          }}
                        />
                        <div className="mt-1 text-[10px] font-bold text-ink-600">
                          {COLORS[c].label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* الحجم */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 block text-sm font-bold text-ink-900">
                    الحجم
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(SIZES) as SizeKey[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`rounded-lg border-2 px-3 py-3 text-sm font-bold transition ${
                          size === s
                            ? 'border-brand-500 bg-brand-50 text-ink-900'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        }`}
                      >
                        {SIZES[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* الشفافية */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 flex items-center justify-between text-sm font-bold text-ink-900">
                    <span>الشفافية</span>
                    <span className="text-brand-600">{opacity}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                </div>

                {/* الدوران */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <label className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
                    <RotateCw className="h-4 w-4 text-brand-500" />
                    الدوران
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { val: 0 as RotationKey, label: 'بدون دوران' },
                        { val: 45 as RotationKey, label: '45°' },
                        { val: -45 as RotationKey, label: '-45°' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.val}
                        onClick={() => setRotation(r.val)}
                        className={`rounded-lg border-2 px-3 py-3 text-sm font-bold transition ${
                          rotation === r.val
                            ? 'border-brand-500 bg-brand-50 text-ink-900'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <LoaderCircle className="h-4 w-4 animate-spin text-brand-600" />
                      <span className="font-bold text-ink-900">
                        جارٍ إضافة العلامة المائية…
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={applyWatermark}
                  disabled={isLoading || !text.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ الإضافة…
                    </>
                  ) : (
                    <>
                      <Stamp className="h-5 w-5" />
                      إضافة العلامة المائية
                    </>
                  )}
                </button>
              </>
            )}

            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تمت الإضافة بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      {pageCount} صفحة • الحجم: {formatSize(resultSize)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadResult}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل الملف
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
                  <span>تخصيص كامل للعلامة</span>
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
                    href="/tools/organize-pdf"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    ترتيب الصفحات
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
              إضافة علامة مائية إلى PDF أونلاين — احمِ مستنداتك
            </h2>

            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت بحاجة إلى <strong>إضافة علامة مائية</strong> إلى ملف
              PDF لحماية حقوقك أو للإشارة إلى سرية المحتوى، فإن أداة
              Intooly هي الحل الأمثل. تعمل الأداة{' '}
              <strong>داخل متصفحك مباشرة</strong>، فلا حاجة لتحميل برامج،
              ولا لرفع ملفاتك إلى أي خادم خارجي.
            </p>

            <p className="mt-3 leading-8 text-ink-700">
              يمكنك تخصيص العلامة المائية بشكل كامل:{' '}
              <strong>النص</strong>، <strong>اللون</strong>،{' '}
              <strong>الحجم</strong>، <strong>الموضع</strong>،{' '}
              <strong>الشفافية</strong>، و<strong>الدوران</strong>. تُضاف
              العلامة تلقائياً إلى <strong>كل صفحات الملف</strong>.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى العلامة المائية؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              العلامة المائية (Watermark) هي نص أو صورة شفافة تُضاف فوق
              محتوى المستند. تُستخدم بشكل أساسي لـ:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>حماية الحقوق:</strong> الإشارة إلى أن المستند
                مملوك لجهة معينة.
              </li>
              <li>
                <strong>الإشارة إلى السرية:</strong> مثل &quot;سري&quot;
                أو &quot;داخلي&quot;.
              </li>
              <li>
                <strong>العلامة التجارية:</strong> إضافة اسم الشركة على
                المستندات.
              </li>
              <li>
                <strong>المسودات:</strong> الإشارة إلى أن المستند مسودة.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما الذي تقدمه أداة Intooly؟
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ✏️ نص مخصص
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  اكتب أي نص تريده (حتى 50 حرفاً) ليظهر على كل الصفحات.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🎨 5 ألوان جاهزة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  أسود، أحمر، أزرق، رمادي، أخضر — لتناسب كل الأذواق.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  📍 7 مواضع
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  الوسط، الزوايا الأربع، أعلى، أسفل — اختر ما يناسبك.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🔄 دوران وشفافية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  دوّر العلامة بـ 45° وحدّد شفافيتها من 10% إلى 100%.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>المستندات الرسمية:</strong> إضافة &quot;سري&quot;
                أو &quot;للاطلاع فقط&quot;.
              </li>
              <li>
                <strong>العقود:</strong> إضافة اسم الشركة أو التوقيع.
              </li>
              <li>
                <strong>المسودات:</strong> الإشارة إلى أن المستند مسودة.
              </li>
              <li>
                <strong>الأرشيف:</strong> إضافة تاريخ أو رقم مرجعي.
              </li>
              <li>
                <strong>الملكية الفكرية:</strong> وضع علامة © أو العلامة
                التجارية.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تستخدم أداة إضافة العلامة المائية؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>
                <strong>ارفع الملف:</strong> اضغط على زر &quot;اختيار
                ملف&quot; واختر ملف PDF من جهازك.
              </li>
              <li>
                <strong>اكتب النص:</strong> حدد نص العلامة المائية (مثل:
                سري، نسخة، اسم شركتك).
              </li>
              <li>
                <strong>خصّص المظهر:</strong> اختر الموضع، اللون، الحجم،
                الشفافية، والدوران.
              </li>
              <li>
                <strong>طبّق:</strong> اضغط على زر &quot;إضافة العلامة
                المائية&quot;.
              </li>
              <li>
                <strong>نزّل الملف:</strong> اضغط على زر &quot;تنزيل
                الملف&quot;.
              </li>
            </ol>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن العلامة المائية
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكن إزالة العلامة المائية لاحقاً؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، يمكن إزالتها يدوياً باستخدام برامج تحرير PDF
                  المتقدمة. لكن الأداة تدمجها مع المحتوى، فلا يمكن
                  إزالتها بسهولة.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكن إضافتها على صفحات محددة فقط؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الأداة الحالية تضيفها على كل الصفحات. لتحديد صفحات
                  معينة، استخدم{' '}
                  <Link
                    href="/tools/extract-pdf-pages"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    أداة استخراج صفحات PDF
                  </Link>{' '}
                  أولاً.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يدعم النصوص العربية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الأداة تدعم الحروف اللاتينية بشكل أساسي. للحصول على
                  نصوص عربية، قد تحتاج إلى استخدام خطوط عربية مدمجة في
                  المستند الأصلي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، جميع العمليات تتم داخل متصفحك مباشرة، ولا يتم رفع
                  أي ملف إلى أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل. لا تطلب تسجيلاً، ولا تفرض حدوداً
                  يومية، ولا تضيف علامات مائية على الملف الناتج.
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
                href="/tools/organize-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← ترتيب صفحات PDF
              </Link>
              <Link
                href="/tools/split-pdf"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تقسيم PDF إلى ملفات
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
