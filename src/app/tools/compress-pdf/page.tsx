'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Minimize2,
  Upload,
  Download,
  LoaderCircle,
  ArrowLeft,
  FileText,
  Shield,
  Zap,
  Lock,
  Trash2,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { PDFDocument, PDFName, PDFRef, PDFStream } from 'pdf-lib';

type CompressionLevel = 'low' | 'medium' | 'high' | 'extreme';

type CompressionStats = {
  originalSize: number;
  compressedSize: number;
  percentageSaved: number;
  imagesCompressed: number;
  imagesConverted: number;
  totalPages: number;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const PRESETS: Record<
  CompressionLevel,
  {
    title: string;
    description: string;
    quality: number;
    scale: number;
    expected: string;
  }
> = {
  low: {
    title: 'ضغط خفيف',
    description: 'جودة عالية جداً - الحفاظ على التفاصيل',
    quality: 0.82,
    scale: 0.9,
    expected: '25-45% توفير',
  },
  medium: {
    title: 'متوازن (موصى به)',
    description: 'أفضل توازن بين الجودة والحجم',
    quality: 0.6,
    scale: 0.75,
    expected: '50-75% توفير',
  },
  high: {
    title: 'ضغط عالي',
    description: 'توفير كبير مع جودة مقبولة',
    quality: 0.4,
    scale: 0.6,
    expected: '70-88% توفير',
  },
  extreme: {
    title: 'ضغط أقصى',
    description: 'أقصى توفير - جودة منخفضة للصور',
    quality: 0.2,
    scale: 0.45,
    expected: '85-95% توفير',
  },
};

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((newFile: File | null) => {
    if (!newFile) return;
    setError('');
    setResultUrl(null);
    setStats(null);
    setProgress(0);

    if (newFile.type !== 'application/pdf') {
      setError('يُسمح فقط بملفات PDF.');
      return;
    }
    if (newFile.size > 100 * 1024 * 1024) {
      setError('الملف أكبر من 100 ميغابايت.');
      return;
    }

    setFile(newFile);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResultUrl(null);
    setStats(null);
    setError('');
    setStatus('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const compressImage = async (
    imageData: Uint8Array,
    quality: number,
    scale: number,
    mimeType: string = 'image/jpeg'
  ): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([new Uint8Array(imageData).buffer], {
        type: mimeType,
      });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('فشل في إنشاء Canvas'));
          return;
        }

        const newWidth = Math.max(1, Math.floor(img.width * scale));
        const newHeight = Math.max(1, Math.floor(img.height * scale));

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error('فشل في ضغط الصورة'));
              return;
            }
            blob.arrayBuffer().then((buffer) => {
              resolve(new Uint8Array(buffer));
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('فشل في تحميل الصورة'));
      };

      img.src = url;
    });
  };

  const compressPdf = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setStatus('جارٍ قراءة الملف...');
    setResultUrl(null);
    setStats(null);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const preset = PRESETS[level];

      setStatus('جارٍ تحميل PDF...');
      setProgress(5);

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false,
      });

      setStatus('جارٍ البحث عن الصور...');
      setProgress(10);

      let imagesCompressed = 0;
      let imagesConverted = 0;

      const objects = pdfDoc.context.enumerateIndirectObjects();
      const imageObjects: Array<{ ref: PDFRef; stream: PDFStream }> = [];

      for (const [ref, obj] of objects) {
        if (obj instanceof PDFStream) {
          const dict = obj.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          if (subtype instanceof PDFName && subtype.toString() === '/Image') {
            imageObjects.push({ ref, stream: obj });
          }
        }
      }

      setStatus(`تم العثور على ${imageObjects.length} صورة`);
      setProgress(15);

      for (let i = 0; i < imageObjects.length; i++) {
        const { ref, stream } = imageObjects[i];
        const dict = stream.dict;

        setStatus(`معالجة الصورة ${i + 1} من ${imageObjects.length}...`);

        try {
          const widthObj = dict.get(PDFName.of('Width'));
          const heightObj = dict.get(PDFName.of('Height'));
          const filterObj = dict.get(PDFName.of('Filter'));
          const bitsPerComponent = dict.get(PDFName.of('BitsPerComponent'));

          const width = Number(widthObj);
          const height = Number(heightObj);

          if (isNaN(width) || isNaN(height) || width < 30 || height < 30) {
            continue;
          }

          if (bitsPerComponent && Number(bitsPerComponent) === 1) {
            continue;
          }

          const imageData = stream.getContents();

          if (imageData.length < 2000) {
            continue;
          }

          const isPng =
            filterObj instanceof PDFName &&
            (filterObj.toString() === '/FlateDecode' ||
              filterObj.toString() === '/Fl');

          const mimeType = isPng ? 'image/png' : 'image/jpeg';

          const compressedData = await compressImage(
            imageData,
            preset.quality,
            preset.scale,
            mimeType
          );

          if (compressedData.length < imageData.length * 0.95) {
            const newWidth = Math.round(width * preset.scale);
            const newHeight = Math.round(height * preset.scale);

            pdfDoc.context.assign(
              ref,
              pdfDoc.context.stream(compressedData, {
                Length: compressedData.length,
                BitsPerComponent: 8,
                ColorSpace: PDFName.of('DeviceRGB'),
                Filter: PDFName.of('DCTDecode'),
                Width: newWidth,
                Height: newHeight,
              })
            );

            if (isPng) {
              imagesConverted++;
            } else {
              imagesCompressed++;
            }
          }

          const progressPercent = 15 + ((i + 1) / imageObjects.length) * 70;
          setProgress(progressPercent);
        } catch (e) {
          console.warn(`فشل ضغط الصورة ${i + 1}:`, e);
        }
      }

      setStatus('جارٍ تحسين بنية PDF...');
      setProgress(88);

      try {
        pdfDoc.setTitle('');
      } catch {}
      try {
        pdfDoc.setAuthor('');
      } catch {}
      try {
        pdfDoc.setSubject('');
      } catch {}
      try {
        pdfDoc.setKeywords([]);
      } catch {}
      try {
        pdfDoc.setProducer('Intooly PDF Compressor');
      } catch {}
      try {
        pdfDoc.setCreator('Intooly');
      } catch {}

      setStatus('جارٍ حفظ الملف النهائي...');
      setProgress(95);

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([new Uint8Array(compressedBytes).buffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);

      const compressedSize = compressedBytes.byteLength;
      const percentageSaved =
        ((file.size - compressedSize) / file.size) * 100;

      setStats({
        originalSize: file.size,
        compressedSize: compressedSize,
        percentageSaved: Math.max(0, percentageSaved),
        imagesCompressed: imagesCompressed,
        imagesConverted: imagesConverted,
        totalPages: pdfDoc.getPageCount(),
      });

      setStatus('تم الضغط بنجاح!');
      setProgress(100);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? 'فشل الضغط: ' + e.message
          : 'فشل ضغط الملف. تأكد أنه ملف PDF صالح.'
      );
      setStatus('');
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
              <Minimize2 className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                ضغط ملفات PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                قلّل حجم ملفات PDF حتى 95% مع الحفاظ على النصوص والرموز
                قابلة للنسخ والتحديد. كل شيء يعمل داخل متصفحك.
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

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">
                    مستوى الضغط
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(['low', 'medium', 'high', 'extreme'] as const).map(
                      (preset) => {
                        const info = PRESETS[preset];
                        const isActive = level === preset;
                        return (
                          <button
                            key={preset}
                            onClick={() => setLevel(preset)}
                            className={`rounded-xl border-2 p-4 text-right transition ${
                              isActive
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-ink-200 bg-white hover:border-brand-300'
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-bold text-ink-900">
                                {info.title}
                              </span>
                              {isActive && (
                                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                              )}
                            </div>
                            <div className="text-xs leading-5 text-ink-600">
                              {info.description}
                            </div>
                            <div className="mt-2 text-xs font-bold text-brand-700">
                              {info.expected}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                    <p className="text-xs text-brand-800">
                      <strong>ملاحظة مهمة:</strong> هذه الأداة تحافظ على
                      النصوص والرموز قابلة للنسخ والتحديد. يتم ضغط الصور
                      فقط مع الحفاظ على بنية النص الأصلية.
                    </p>
                  </div>
                </div>

                {isLoading && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">{status}</span>
                      <span className="font-bold text-brand-700">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div
                        className="h-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

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

            {resultUrl && stats && (
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
                      الحجم الأصلي: {formatSize(stats.originalSize)} • الحجم
                      الجديد: {formatSize(stats.compressedSize)}
                    </p>
                    <p className="text-xs text-ink-600">
                      الصور المضغوطة: {stats.imagesCompressed} • المحولة:{' '}
                      {stats.imagesConverted} • الصفحات: {stats.totalPages}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-white p-3 text-center">
                  <div className="text-3xl font-black text-brand-600">
                    {stats.percentageSaved > 0
                      ? stats.percentageSaved.toFixed(1)
                      : '0'}
                    %
                  </div>
                  <div className="text-xs text-ink-600">نسبة التوفير</div>
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
                  <span>ضغط حقيقي حتى 95%</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>بدون تسجيل أو رفع</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>النصوص والرموز تبقى قابلة للنسخ</span>
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
                    href="/tools/pdf-to-jpg"
                    className="flex items-center gap-2 text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    PDF إلى JPG
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
              ضغط PDF أونلاين مجانًا — قلّل حجم ملفاتك حتى 95%
            </h2>

            <p className="mt-4 leading-8 text-ink-700">
              إذا كنت بحاجة إلى <strong>تقليل حجم ملف PDF</strong> لإرساله
              عبر البريد الإلكتروني، أو لرفعه على موقع، أو لأرشفته على
              جهازك، فإن أداة ضغط PDF من Intooly هي الحل الأمثل. تعمل
              الأداة <strong>داخل متصفحك مباشرة</strong>، فلا حاجة لتحميل
              برامج، ولا لرفع ملفاتك إلى أي خادم خارجي.
            </p>

            <p className="mt-3 leading-8 text-ink-700">
              تعتمد الأداة على تقنية <strong>متقدمة لضغط الصور</strong>{' '}
              باستخدام <strong>Canvas API</strong> ومكتبة{' '}
              <strong>pdf-lib</strong>، مما يتيح تقليل الحجم مع الحفاظ على{' '}
              <strong>جودة الصور</strong> و<strong>قابلية النص للنسخ</strong>.
              على عكس الأدوات الأخرى التي تحوّل الصفحات إلى صور، تحافظ
              أداتنا على <strong>بنية النص الأصلية</strong>.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              ما معنى ضغط PDF؟
            </h3>
            <p className="mt-3 leading-8 text-ink-700">
              ضغط PDF هو عملية تقليل حجم ملف PDF عن طريق{' '}
              <strong>إعادة ضغط الصور المدمجة</strong> وإزالة{' '}
              <strong>البيانات الوصفية</strong> غير الضرورية. تعتمد النتيجة
              على <strong>نوع محتوى الملف</strong>:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>
                <strong>الملفات بصور كثيرة:</strong> تحقق توفيرًا كبيرًا
                (50-95%).
              </li>
              <li>
                <strong>الملفات النصية:</strong> تحقق توفيرًا محدودًا
                (10-30%) لأن النص مضغوط أصلًا.
              </li>
              <li>
                <strong>الملفات بصور SVG/Vector:</strong> توفير قليل (5-15%)
                لأن الرسومات المتجهية لا تُضغط.
              </li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              مستويات الضغط الأربعة
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ضغط خفيف
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  جودة الصور: 82% • التصغير: 90%. يحافظ على الجودة العالية
                  مع توفير 25-45%. مثالي للملفات الرسمية.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  متوازن (موصى به)
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  جودة الصور: 60% • التصغير: 75%. توازن ممتاز بين الجودة
                  والحجم مع توفير 50-75%.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ضغط عالي
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  جودة الصور: 40% • التصغير: 60%. توفير كبير (70-88%) مع
                  جودة مقبولة.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  ضغط أقصى
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  جودة الصور: 20% • التصغير: 45%. أقصى توفير (85-95%) مع
                  جودة منخفضة.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              لماذا تختار أداة ضغط PDF من Intooly؟
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  خصوصية كاملة
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  ملفاتك لا تُرفع إلى أي خادم. العملية كلها تتم داخل
                  متصفحك.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  النصوص تبقى قابلة للنسخ
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  لا نحوّل الصفحات إلى صور. النصوص تبقى قابلة للنسخ،
                  البحث، والتحديد.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  سرعة فورية
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  لا انتظار لرفع الملفات أو تنزيلها من خادم. الضغط يبدأ
                  مباشرة.
                </p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">
                  مجاني بالكامل
                </h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">
                  بدون تسجيل، بدون حدود يومية، بدون علامات مائية.
                </p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تستخدم أداة ضغط PDF؟
            </h3>
            <ol className="mt-4 list-inside list-decimal space-y-2 leading-8 text-ink-700">
              <li>
                <strong>ارفع الملف:</strong> اضغط على زر &quot;اختيار
                ملف&quot; واختر ملف PDF من جهازك.
              </li>
              <li>
                <strong>اختر المستوى:</strong> حدد مستوى الضغط المناسب.
              </li>
              <li>
                <strong>اضغط ضغط:</strong> ستبدأ الأداة بمعالجة كل صورة
                داخل الملف.
              </li>
              <li>
                <strong>راقب التقدم:</strong> ستظهر نسبة التقدم وعدد
                الصور المعالجة.
              </li>
              <li>
                <strong>نزّل النتيجة:</strong> اضغط على زر &quot;تنزيل
                الملف المضغوط&quot;.
              </li>
            </ol>

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
                <strong>الأرشفة:</strong> حفظ مستندات بحجم أصغر على
                جهازك.
              </li>
              <li>
                <strong>المشاركة:</strong> إرسال ملفات PDF بسرعة عبر
                تطبيقات المراسلة.
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
                  هل ضغط PDF يؤثر على جودة الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  يعتمد على المستوى المختار. &quot;ضغط خفيف&quot; يحافظ
                  على الجودة بنسبة 95%+. &quot;ضغط أقصى&quot; يقلل
                  الجودة بشكل ملحوظ لكن يوفر 85-95% من الحجم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  كم يمكنني أن أوفر في الحجم؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  يعتمد على محتوى الملف: الملفات بصور كبيرة 60-95%،
                  بصور متوسطة 30-60%، نصية 10-30%.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل النصوص تبقى قابلة للنسخ بعد الضغط؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم! هذه الأداة تحافظ على بنية النص الأصلية. يمكنك
                  نسخ النصوص، البحث فيها، وتحديدها تمامًا كما في الملف
                  الأصلي.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل ملفاتي آمنة؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، الأمان مضمون. جميع العمليات تتم داخل متصفحك
                  مباشرة، ولا يتم رفع أي ملف إلى أي خادم.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل هناك حد لحجم الملف؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  الحد الأقصى 100 ميغابايت لكل ملف. لكن الأداء يعتمد
                  على ذاكرة جهازك.
                </p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">
                  هل الأداة مجانية؟
                </h4>
                <p className="mt-2 leading-8 text-ink-700">
                  نعم، مجانية بالكامل. لا تطلب تسجيلًا، ولا تفرض حدودًا
                  يومية، ولا تضيف علامات مائية.
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
                href="/tools/pdf-to-jpg"
                className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                ← تحويل PDF إلى JPG
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
