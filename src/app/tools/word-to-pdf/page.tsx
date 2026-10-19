'use client';

import { useState, useCallback, useRef } from 'react';
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
  CheckCircle2,
} from 'lucide-react';

type ConvertedResult = {
  fileName: string;
  dataUrl: string;
  size: number;
  pages: number;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ConvertedResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    setError('');
    setResult(null);

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.docx')) {
      setError('يُسمح فقط بملفات Word بصيغة DOCX. صيغة DOC القديمة غير مدعومة.');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('الملف أكبر من 10 ميغابايت.');
      return;
    }

    setFile(selectedFile);
  }, []);

  const removeFile = useCallback(() => {
    setFile(null);
    setResult(null);
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const convertToPdf = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    setProgress(10);

    try {
      const mammoth = (await import('mammoth')).default;
      setProgress(30);

      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);

      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      setProgress(70);

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.cssText = 'position:absolute;left:-9999px;top:0;width:515pt;padding:40pt;background:#ffffff;color:#000000;font-family:Arial, sans-serif;font-size:12pt;line-height:1.6;direction:rtl;text-align:right;';
      document.body.appendChild(container);

      setProgress(85);

      await pdf.html(container, {
        x: 40,
        y: 40,
        width: 515,
        windowWidth: 515,
        autoPaging: 'text',
        margin: [40, 40, 40, 40],
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
      });

      document.body.removeChild(container);

      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      setResult({
        fileName: file.name.replace(/\.docx$/i, '') + '.pdf',
        dataUrl: blobUrl,
        size: pdfBlob.size,
        pages: pdf.getNumberOfPages(),
      });

      setProgress(100);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? 'فشل التحويل: ' + e.message : 'فشل تحويل الملف.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }, [file]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [result]);

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/documents"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات المستندات
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <FileText className="h-7 w-7 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تحويل Word إلى PDF
              </h1>
              <p className="mt-2 text-sm leading-7 text-ink-600 sm:text-base">
                حوّل مستندات Word (DOCX) إلى PDF داخل متصفحك. لا رفع، لا تسجيل، وملفاتك لا تغادر جهازك. اضغط على منطقة الرفع لاختيار ملف DOCX ثم حمّل النتيجة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {!file && !result && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => inputRef.current?.click()}
                className={'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ' + (dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-300 bg-white hover:border-brand-400')}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
                  <Upload className="h-8 w-8 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">اختر ملف Word (DOCX)</h2>
                <p className="mt-1 text-sm text-ink-600">أو اسحب الملف وأفلته هنا</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600"
                >
                  <Upload className="h-4 w-4" />
                  اختيار ملف
                </button>
                <p className="mt-3 text-xs text-ink-500">DOCX فقط — بحد أقصى 10 ميغابايت</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {file && !result && (
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

                {isLoading && progress > 0 && (
                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-900">جارٍ التحويل…</span>
                      <span className="font-bold text-brand-700">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                      <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: progress + '%' }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={convertToPdf}
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
                      <Download className="h-5 w-5" />
                      تحويل إلى PDF
                    </>
                  )}
                </button>
              </>
            )}

            {result && (
              <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-ink-900">تم التحويل بنجاح</h3>
                    <p className="text-xs text-ink-600">{result.fileName} • {result.pages} صفحة • {formatSize(result.size)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={downloadResult}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل PDF
                  </button>
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

            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">أدوات ذات صلة</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tools/jpg-to-word" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    JPG إلى Word
                  </Link>
                </li>
                <li>
                  <Link href="/tools/jpg-to-pdf" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    JPG إلى PDF
                  </Link>
                </li>
                <li>
                  <Link href="/tools/pdf-to-jpg" className="flex items-center gap-2 text-brand-600 hover:text-brand-700">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    PDF إلى JPG
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-ink-100 pt-10">
          <article className="mx-auto max-w-4xl text-right">
            <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
              تحويل Word إلى PDF أونلاين — حوّل مستنداتك بسهولة
            </h2>
            <p className="mt-4 leading-8 text-ink-700">
              إذا كان لديك مستند Word بصيغة DOCX وتريد مشاركته أو طباعته أو أرشفته، فإن تحويله إلى PDF هو الحل الأمثل لضمان ثبات التنسيق على جميع الأجهزة. أداة Intooly تحوّل ملفات Word إلى PDF داخل متصفحك مباشرة، دون رفع الملف إلى أي خادم خارجي، مما يحافظ على خصوصيتك ويضمن سرعة التحويل.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">ما معنى تحويل Word إلى PDF؟</h3>
            <p className="mt-3 leading-8 text-ink-700">
              تحويل Word إلى PDF هو تحويل مستند DOCX إلى ملف PDF ثابت العرض، بحيث يظهر بنفس الشكل على جميع الأجهزة والبرامج. هذا مفيد عندما تريد مشاركة مستند دون القلق من اختلاف التنسيق بين أجهزة مختلفة، أو عندما تحتاج إلى طباعة المستند بشكل احترافي.
            </p>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">حالات استخدام شائعة</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 leading-8 text-ink-700">
              <li>مشاركة السيرة الذاتية مع جهات التوظيف.</li>
              <li>إرسال العقود والفواتير للعملاء.</li>
              <li>أرشفة المستندات الرسمية بصيغة موحّدة.</li>
              <li>طباعة المستندات دون تغيير التنسيق.</li>
              <li>رفع المستندات على منصات تقبل PDF فقط.</li>
            </ul>

            <h3 className="mt-10 text-xl font-bold text-ink-900 md:text-2xl">أسئلة شائعة</h3>
            <div className="mt-4 space-y-6">
              <div>
                <h4 className="text-base font-bold text-ink-900">هل الأداة مجانية بالكامل؟</h4>
                <p className="mt-2 leading-8 text-ink-700">نعم، الأداة مجانية بالكامل بدون تسجيل وبدون علامات مائية.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل تُرفع ملفاتي إلى سيرفر؟</h4>
                <p className="mt-2 leading-8 text-ink-700">لا، جميع الملفات تُعالج داخل متصفحك ولا تُرفع إلى أي سيرفر خارجي.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما الصيغ المدعومة؟</h4>
                <p className="mt-2 leading-8 text-ink-700">ندعم صيغة DOCX (Word 2007 وما بعده). صيغة DOC القديمة غير مدعومة حالياً.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يتم الحفاظ على التنسيق الأصلي؟</h4>
                <p className="mt-2 leading-8 text-ink-700">يتم الحفاظ على التنسيق الأساسي (نصوص، عناوين، قوائم، فقرات). التنسيقات المعقدة (جداول متداخلة، خطوط مخصصة) قد تختلف قليلاً.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">ما الحد الأقصى لحجم الملف؟</h4>
                <p className="mt-2 leading-8 text-ink-700">الحد الأقصى 10 ميغابايت، وهو كافٍ لمعظم المستندات.</p>
              </div>
              <div>
                <h4 className="text-base font-bold text-ink-900">هل يمكنني تحويل عدة ملفات دفعة واحدة؟</h4>
                <p className="mt-2 leading-8 text-ink-700">حالياً نعالج ملفاً واحداً في كل مرة لضمان أفضل دقة.</p>
              </div>
            </div>

            <h3 className="mt-12 text-xl font-bold text-ink-900 md:text-2xl">أدوات ذات صلة</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/jpg-to-pdf" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل JPG إلى PDF
              </Link>
              <Link href="/tools/pdf-to-jpg" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل PDF إلى JPG
              </Link>
              <Link href="/tools/jpg-to-word" className="rounded-lg border border-ink-200 bg-white p-3 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-50">
                ← تحويل JPG إلى Word
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
