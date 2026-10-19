'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

type PageSize = 'a4' | 'letter' | 'auto';
type Orientation = 'portrait' | 'landscape';

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadImageDimensions = (url: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });

  const handleFiles = useCallback(async (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    setError('');
    const files = Array.from(fileList);
    const validFiles = files.filter((f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE);
    if (validFiles.length === 0) {
      setError('يرجى اختيار صور بصيغة JPG أو PNG أو WEBP، بحجم أقل من 50 ميغابايت لكل صورة.');
      return;
    }
    const rejected = files.length - validFiles.length;
    if (rejected > 0) {
      setError('تم تجاهل ' + rejected + ' ملف/ملفات غير مدعومة أو أكبر من 50 ميغابايت.');
    }
    const newItems: ImageItem[] = [];
    for (const file of validFiles) {
      const previewUrl = URL.createObjectURL(file);
      try {
        const dims = await loadImageDimensions(previewUrl);
        newItems.push({
          id: file.name + '-' + file.size + '-' + Date.now() + '-' + Math.random().toString(36).slice(2),
          file,
          previewUrl,
          width: dims.width,
          height: dims.height,
        });
      } catch {
        URL.revokeObjectURL(previewUrl);
      }
    }
    setImages((prev) => [...prev, ...newItems]);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return [];
    });
    setError('');
    setProgress(0);
  }, []);

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const generatePdf = useCallback(async () => {
    if (images.length === 0) return;
    setIsLoading(true);
    setError('');
    setProgress(0);
    try {
      const { jsPDF } = await import('jspdf');
      const firstImg = images[0];
      let format: [number, number] | 'a4' | 'letter';
      if (pageSize === 'a4') format = 'a4';
      else if (pageSize === 'letter') format = 'letter';
      else format = [firstImg.width, firstImg.height];
      const pdf = new jsPDF({ unit: 'px', format, orientation, compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setProgress(Math.round(((i + 1) / images.length) * 100));
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });
        const ratio = Math.min(maxW / item.width, maxH / item.height);
        const w = item.width * ratio;
        const h = item.height * ratio;
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;
        if (i > 0) pdf.addPage();
        const fmt = item.file.type === 'image/png' ? 'PNG' : 'JPEG';
        pdf.addImage(dataUrl, fmt, x, y, w, h, undefined, 'FAST');
      }
      pdf.save('intooly-images-' + Date.now() + '.pdf');
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? 'فشل إنشاء PDF: ' + e.message : 'فشل إنشاء ملف PDF.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [images, pageSize, orientation]);

  const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);
  const openFilePicker = () => inputRef.current?.click();

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

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
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <FileText className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                تحويل JPG إلى PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                حوّل صور JPG و PNG و WEBP إلى ملف PDF واحد. أضف صورك، رتّبها، اختر حجم الصفحة، ثم نزّل ملف PDF النهائي. كل شيء يعمل داخل متصفحك دون رفع أي صورة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {images.length === 0 && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                onClick={openFilePicker}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-ink-300 bg-white p-8 text-center transition-colors hover:border-brand-400"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <Upload className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">اختر صور JPG أو PNG</h2>
                <p className="mt-1 text-sm text-ink-600">أو اسحب الصور وأفلتها هنا (يمكنك اختيار عدة صور)</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openFilePicker(); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار صور
                </button>
                <p className="mt-3 text-xs text-ink-500">JPG • PNG • WEBP — بحد أقصى 50 ميغابايت لكل صورة</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {images.length > 0 && (
              <>
                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-ink-900">الصور المضافة ({images.length})</h3>
                      <p className="mt-1 text-xs text-ink-500">إجمالي الحجم: {formatSize(totalSize)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={openFilePicker}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        إضافة المزيد
                      </button>
                      <button
                        onClick={clearAll}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف الكل
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((item, index) => (
                      <div key={item.id} className="group relative overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                        <img src={item.previewUrl} alt={item.file.name} className="aspect-square w-full object-cover" />
                        <div className="absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/60 to-transparent p-1.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-xs font-black text-white">
                            {index + 1}
                          </span>
                          <button
                            onClick={() => removeImage(item.id)}
                            className="rounded-md bg-rose-500/90 p-1 text-white transition hover:bg-rose-600"
                            aria-label="حذف"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-bold text-ink-900" title={item.file.name}>{item.file.name}</p>
                          <p className="text-[10px] text-ink-500">{formatSize(item.file.size)}</p>
                          <div className="mt-1.5 flex gap-1">
                            <button
                              onClick={() => moveImage(index, -1)}
                              disabled={index === 0}
                              className="flex-1 rounded-md border border-ink-200 bg-white p-1 text-ink-700 transition hover:bg-brand-50 disabled:opacity-30"
                              aria-label="تحريك لأعلى"
                            >
                              <ArrowUp className="mx-auto h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveImage(index, 1)}
                              disabled={index === images.length - 1}
                              className="flex-1 rounded-md border border-ink-200 bg-white p-1 text-ink-700 transition hover:bg-brand-50 disabled:opacity-30"
                              aria-label="تحريك لأسفل"
                            >
                              <ArrowDown className="mx-auto h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-ink-200 bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-ink-900">حجم الصفحة</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPageSize('a4')}
                      className={'rounded-xl border-2 p-3 text-right transition ' + (pageSize === 'a4' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-brand-300')}
                    >
                      <div className="mb-1 font-bold text-ink-900">A4</div>
                      <div className="text-xs text-ink-600">210 × 297 مم</div>
                    </button>
                    <button
                      onClick={() => setPageSize('letter')}
                      className={'rounded-xl border-2 p-3 text-right transition ' + (pageSize === 'letter' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-brand-300')}
                    >
                      <div className="mb-1 font-bold text-ink-900">Letter</div>
                      <div className="text-xs text-ink-600">216 × 279 مم</div>
                    </button>
                    <button
                      onClick={() => setPageSize('auto')}
                      className={'rounded-xl border-2 p-3 text-right transition ' + (pageSize === 'auto' ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-white hover:border-brand-300')}
                    >
                      <div className="mb-1 font-bold text-ink-900">حجم الصورة</div>
                      <div className="text-xs text-ink-600">بلا هوامش</div>
                    </button>
                  </div>

                  <h3 className="mb-4 mt-6 text-base font-bold text-ink-900">الاتجاه</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setOrientation('portrait')}
                      className={'flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition ' + (orientation === 'portrait' ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300')}
                    >
                      <span className="h-6 w-4 rounded border-2 border-current" />
                      <span className="text-sm font-bold">عمودي</span>
                    </button>
                    <button
                      onClick={() => setOrientation('landscape')}
                      className={'flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition ' + (orientation === 'landscape' ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300')}
                    >
                      <span className="h-4 w-6 rounded border-2 border-current" />
                      <span className="text-sm font-bold">أفقي</span>
                    </button>
                  </div>
                </div>

                {isLoading && progress > 0 && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">جارٍ إنشاء PDF…</span>
                      <span className="font-bold text-brand-700">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: progress + '%' }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={generatePdf}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                      جارٍ إنشاء PDF…
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      إنشاء PDF ({images.length} صورة)
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">لماذا Intooly؟</h3>
              <ul className="space-y-2.5 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
                  <span>صورك لا تغادر جهازك</span>
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
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                🔒 خصوصيتك محفوظة
              </h3>
              <p className="text-sm leading-7 text-ink-700">
                جميع الصور تُعالج داخل متصفحك مباشرة. لا نرفع أي صورة إلى خوادمنا، ولا نحتفظ بأي نسخة.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                💡 نصائح سريعة
              </h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li>• رتّب الصور قبل التحويل للحصول على الترتيب الصحيح.</li>
                <li>• اختر حجم A4 للمستندات الرسمية.</li>
                <li>• استخدم صورًا عالية الجودة للحصول على أفضل نتيجة.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">
                أدوات PDF شائعة
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tools/word-to-pdf" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Word إلى PDF
                  </Link>
                </li>
                <li>
                  <Link href="/tools/delete-pdf-pages" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    حذف صفحات PDF
                  </Link>
                </li>
                <li>
                  <Link href="/tools/watermark-pdf" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    علامة مائية PDF
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
              تحويل JPG إلى PDF أونلاين — اجمع صورك في ملف واحد
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كانت لديك مجموعة صور JPG أو PNG وتريد جمعها في ملف PDF واحد لمشاركتها أو أرشفتها أو طباعتها، فإن أداة تحويل JPG إلى PDF من Intooly هي الحل الأمثل. تعمل الأداة داخل متصفحك مباشرة، فلا حاجة لتثبيت برامج أو رفع صورك إلى أي خادم خارجي، مما يحافظ على خصوصيتك الكاملة.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">ما معنى تحويل JPG إلى PDF؟</h3>
            <p className="mt-3 leading-8 text-ink-700">
              تحويل JPG إلى PDF هو دمج مجموعة صور بصيغة JPG أو PNG أو WEBP في ملف PDF واحد، بحيث تظهر كل صورة في صفحة مستقلة داخل الملف. هذا مفيد عندما تريد مشاركة عدة صور في ملف واحد بدلًا من إرسالها منفصلة، أو عندما تحتاج إلى طباعتها أو أرشفتها بصيغة موحّدة.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">أحجام الصفحات المتوفرة</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">A4</h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">الحجم القياسي للطباعة والمستندات الرسمية.</p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">Letter</h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">الحجم الشائع في الولايات المتحدة وكندا.</p>
              </div>
              <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h4 className="text-base font-bold text-ink-900">حجم الصورة</h4>
                <p className="mt-2 text-sm leading-7 text-ink-700">كل صفحة بحجم الصورة نفسها، بلا هوامش.</p>
              </div>
            </div>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">حالات استخدام شائعة</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>جمع صور المستندات الممسوحة ضوئيًا في ملف PDF واحد.</li>
              <li>تحويل صور المنتجات إلى كتالوج PDF للعملاء.</li>
              <li>أرشفة صور العطلات أو الفعاليات في ملف واحد.</li>
              <li>إرسال عدة صور في بريد إلكتروني واحد بدلًا من مرفقات متعددة.</li>
              <li>تحويل صور الشهادات أو الوثائق لإرسالها رسميًا.</li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">أسئلة شائعة عن تحويل JPG إلى PDF</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">هل الأداة مجانية بالكامل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل تُرفع صوري إلى سيرفر؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا، جميع الصور تُعالج داخل متصفحك ولا تُرفع إلى أي سيرفر خارجي.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما الصيغ المدعومة؟</h4>
                <p className="mt-2 leading-8 text-ink-700">ندعم JPG و JPEG و PNG و WEBP.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني ترتيب الصور قبل التحويل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، يمكنك تحريك الصور أعلى وأسفل باستخدام الأسهم لتحديد ترتيبها في ملف PDF النهائي.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما الحد الأقصى لعدد الصور؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا يوجد حد رقمي، لكن الأداء يعتمد على ذاكرة المتصفح وحجم الصور. عادةً 50 صورة متوسطة الحجم تعمل بسلاسة.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني اختيار حجم الصفحة؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، يمكنك الاختيار بين A4 و Letter وحجم الصورة، مع اتجاه عمودي أو أفقي.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات PDF ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/pdf-to-jpg" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل PDF إلى JPG
              </Link>
              <Link href="/tools/merge-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← دمج PDF
              </Link>
              <Link href="/tools/split-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تقسيم PDF
              </Link>
              <Link href="/tools/extract-pdf-pages" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← استخراج صفحات PDF
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
