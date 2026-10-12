'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Minimize2,
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
  TrendingDown,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type CompressionLevel = 'low' | 'medium' | 'high';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((newFile: File | null) => {
    if (!newFile) return;
    setError('');
    setResultUrl(null);
    setResultSize(0);

    if (newFile.type !== 'application/pdf') {
      setError('يُسمح فقط بملفات PDF.');
      return;
    }
    if (newFile.size > 100 * 1024 * 1024) {
      setError('الملف أكبر من 100 ميغابايت.');
      return;
    }

    setFile(newFile);
    setOriginalSize(newFile.size);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResultUrl(null);
    setResultSize(0);
    setOriginalSize(0);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const compressPdf = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResultUrl(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
      });

      // إزالة البيانات الوصفية (metadata) حسب مستوى الضغط
      if (level === 'medium' || level === 'high') {
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setKeywords([]);
        pdf.setProducer('');
        pdf.setCreator('');
      }

      // حفظ الملف مع تحسين البنية
      const saveOptions: { useObjectStreams: boolean; addDefaultPage: boolean } = {
        useObjectStreams: level !== 'low',
        addDefaultPage: false,
      };

      const compressedBytes = await pdf.save(saveOptions);
      const blob = new Blob([new Uint8Array(compressedBytes).buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      setResultSize(blob.size);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل الضغط: ' + e.message
          : 'فشل ضغط الملف. تأكد أنه ملف PDF صالح.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, level]);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `intooly-compressed-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [resultUrl]);

  const savings = originalSize > 0 && resultSize > 0
    ? Math.round(((originalSize - resultSize) / originalSize) * 100)
    : 0;

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
              <Minimize2 className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                ضغط ملفات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                قلّل حجم ملفات PDF عن طريق إزالة البيانات الوصفية وتحسين
                بنية الملف. كل شيء يعمل داخل متصفحك — بدون رفع، بدون
                تسجيل.
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
                        {formatSize(file.size)}
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

                {/* مستوى الضغط */}
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    مستوى الضغط
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => setLevel('low')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        level === 'low'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">
                        منخفض
                      </div>
                      <div className="text-xs text-ink-600">
                        ضغط خفيف — حفاظ كامل على الجودة
                      </div>
                    </button>
                    <button
                      onClick={() => setLevel('medium')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        level === 'medium'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">
                        متوسط
                      </div>
                      <div className="text-xs text-ink-600">
                        متوازن — ضغط معقول
                      </div>
                    </button>
                    <button
                      onClick={() => setLevel('high')}
                      className={`rounded-xl border-2 p-4 text-right transition ${
                        level === 'high'
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-ink-200 bg-white hover:border-brand-300'
                      }`}
                    >
                      <div className="mb-1 font-bold text-ink-900">
                        عالي
                      </div>
                      <div className="text-xs text-ink-600">
                        أقصى ضغط — إزالة كل البيانات الوصفية
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={compressPdf}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ الضغط…
                    </>
                  ) : (
                    <>
                      <Minimize2 className="h-5 w-5" />
                      ضغط الملف
                    </>
                  )}
                </button>
              </>
            )}

            {/* Result */}
            {resultUrl && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500">
                    <TrendingDown className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-ink-900">
                      تم الضغط بنجاح
                    </h3>
                    <p className="text-xs text-ink-600">
                      الحجم الأصلي: {formatSize(originalSize)} • الحجم
                      الجديد: {formatSize(resultSize)}
                      {savings > 0 && (
                        <span className="mr-1 font-bold text-green-600">
                          (توفير {savings}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadResult}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Download className="h-4 w-4" />
                  تنزيل الملف المضغوط
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
                  <span>ضغط فوري بدون انتظار</span>
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
              ضغط PDF أونلاين — قلّل حجم ملفك دون فقدان الجودة
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كان لديك ملف PDF بحجم كبير يصعب إرساله عبر البريد أو
              رفعه على الإنترنت، فإن أداة <strong>ضغط PDF</strong> من
              Intooly تساعدك على تقليل حجمه بسهولة. تعمل الأداة{' '}
              <strong>داخل متصفحك مباشرة</strong>، فلا تحتاج إلى تحميل
              برامج أو رفع ملفك إلى أي خادم.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تعمل أداة ضغط PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              تعتمد الأداة على تقنيات <strong>pdf-lib</strong> لتحسين
              بنية ملف PDF عن طريق:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>إزالة البيانات الوصفية (metadata) مثل العنوان، المؤلف، الكلمات المفتاحية.</li>
              <li>ضغط كائنات الملف الداخلية باستخدام object streams.</li>
              <li>إزالة العناصر غير المستخدمة من بنية الملف.</li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              مستويات الضغط
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🟢 منخفض
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  ضغط خفيف — يحافظ على كل شيء، حجم أصغر قليلًا.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🟡 متوسط
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  إزالة البيانات الوصفية + ضغط object streams. الأفضل
                  توازنًا.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  🔴 عالي
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  إزالة كاملة للبيانات الوصفية وأقصى ضغط للبنية.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>البريد الإلكتروني:</strong> ضغط المرفقات الكبيرة
                قبل إرسالها.
              </li>
              <li>
                <strong>الرفع على الإنترنت:</strong> تقليل حجم الملفات
                لتلبية متطلبات المواقع.
              </li>
              <li>
                <strong>الأرشفة:</strong> حفظ مستندات بحجم أصغر.
              </li>
              <li>
                <strong>الطباعة:</strong> تسريع إرسال الملفات إلى
                الطابعة.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              أسئلة شائعة عن ضغط PDF
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يقلل الضغط من جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الأداة لا تعيد ضغط الصور أو تغيّر دقتها. الضغط يعتمد
                  على تحسين البنية وإزالة البيانات الوصفية. جودة المحتوى
                  تبقى كما هي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  ما مقدار التوفير المتوقع في الحجم؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  يعتمد على الملف نفسه. الملفات التي تحتوي على بيانات
                  وصفية كبيرة قد توفر 5-20%، بينما الملفات البسيطة قد
                  توفر أقل.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الضغط يتم داخل متصفحك بالكامل، ولا تُرفع ملفاتك
                  إلى أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل يمكنني ضغط ملفات كبيرة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الحد الأقصى 100 ميغابايت. الأداء يعتمد على ذاكرة
                  جهازك.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل، بدون تسجيل وبدون علامات مائية.
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
