'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { createWorker, OEM } from 'tesseract.js';
import {
  AlignmentType,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
type OcrLanguage = 'ara' | 'eng' | 'ara+eng';
type ExportMode = 'text' | 'image';
type Notice = { type: 'error' | 'success' | 'info'; text: string } | null;

const languageOptions: { value: OcrLanguage; label: string; description: string }[] = [
  { value: 'ara', label: 'العربية', description: 'للنصوص العربية' },
  { value: 'eng', label: 'English', description: 'For English text' },
  { value: 'ara+eng', label: 'العربية + English', description: 'للنصوص المختلطة' },
];

function safeFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '-').trim();
  return (base || 'intooly-image').slice(0, 80);
}

function containsArabic(value: string) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function JpgToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [language, setLanguage] = useState<OcrLanguage>('ara+eng');
  const [exportMode, setExportMode] = useState<ExportMode>('text');
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string>('');
  const operationRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const setSelectedFile = useCallback((nextFile: File | null) => {
    if (!nextFile) return;
    setNotice(null);

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setNotice({ type: 'error', text: 'يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG فقط.' });
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setNotice({ type: 'error', text: 'حجم الصورة يتجاوز الحد الأقصى البالغ 10 MB. اختر صورة أصغر.' });
      return;
    }
    if (nextFile.size === 0) {
      setNotice({ type: 'error', text: 'الملف فارغ أو غير صالح. اختر صورة أخرى.' });
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextUrl = URL.createObjectURL(nextFile);
    previewRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setFile(nextFile);
    setExtractedText('');
    setProgress(0);
    setStatusText('');
    setNotice({ type: 'success', text: 'تمت إضافة الصورة. اختر اللغة ثم ابدأ استخراج النص.' });
  }, []);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) setSelectedFile(selected);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setSelectedFile(dropped);
  };

  const extractText = async () => {
    if (!file || operationRef.current) return;
    operationRef.current = true;
    setIsProcessing(true);
    setProgress(1);
    setStatusText('تهيئة محرك OCR…');
    setNotice({ type: 'info', text: 'تتم معالجة الصورة داخل المتصفح. قد تستغرق العملية وقتًا حسب الجهاز وحجم الصورة.' });

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker(language, OEM.LSTM_ONLY, {
        logger: (message) => {
          if (typeof message.progress === 'number') {
            setProgress(Math.min(94, Math.max(8, Math.round(8 + message.progress * 86))));
          }
          if (message.status) {
            const translated: Record<string, string> = {
              'loading tesseract core': 'تحميل محرك OCR…',
              'initializing tesseract': 'تهيئة محرك OCR…',
              'loading language traineddata': 'تحميل بيانات اللغة…',
              'initializing api': 'إعداد التعرف على النص…',
              'recognizing text': 'استخراج النص من الصورة…',
            };
            setStatusText(translated[message.status] || 'معالجة الصورة…');
          }
        },
      });
      await worker.setParameters({ preserve_interword_spaces: '1' });
      const result = await worker.recognize(file);
      const text = (result.data.text || '').replace(/\r\n/g, '\n').trim();
      setExtractedText(text);
      setProgress(100);
      setStatusText('اكتمل استخراج النص');
      if (!text) {
        setNotice({
          type: 'error',
          text: 'لم يتم العثور على نص واضح. جرّب صورة أوضح، بإضاءة جيدة ونص أكبر وتباين أعلى.',
        });
      } else {
        setNotice({
          type: 'success',
          text: 'اكتمل استخراج النص. راجعه وعدّله قبل تنزيل ملف Word، فقد تظهر أخطاء في بعض الحروف أو ترتيب النص العربي.',
        });
      }
    } catch (error) {
      console.error('JPG to Word OCR error:', error);
      setNotice({
        type: 'error',
        text: 'تعذر تشغيل OCR. تحقق من اتصال الإنترنت لتحميل موارد المحرك، ثم أعد المحاولة أو استخدم صورة أخرى.',
      });
      setStatusText('تعذر إكمال العملية');
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (error) {
          console.warn('Could not terminate OCR worker cleanly:', error);
        }
      }
      setIsProcessing(false);
      operationRef.current = false;
    }
  };

  const downloadDocx = async () => {
    if (!file || isExporting) return;
    if (exportMode === 'text' && !extractedText.trim()) {
      setNotice({ type: 'error', text: 'استخرج النص أولًا، ثم راجعه قبل إنشاء مستند Word.' });
      return;
    }

    setIsExporting(true);
    setNotice(null);
    try {
      let children: Paragraph[];

      if (exportMode === 'image') {
        const imageBuffer = await file.arrayBuffer();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image();
          const imageUrl = URL.createObjectURL(file);
          image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
          };
          image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error('Unable to read image dimensions'));
          };
          image.src = imageUrl;
        });
        const maxWidth = 600;
        const maxHeight = 760;
        const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height, 1);
        const type = file.type === 'image/png' ? 'png' : 'jpg';
        children = [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imageBuffer,
                type,
                transformation: {
                  width: Math.max(1, Math.round(dimensions.width * scale)),
                  height: Math.max(1, Math.round(dimensions.height * scale)),
                },
              }),
            ],
          }),
        ];
      } else {
        const lines = extractedText.split('\n');
        children = lines.map((line) => {
          const rtl = containsArabic(line);
          return new Paragraph({
            bidirectional: rtl,
            alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
            spacing: { after: 120 },
            children: [new TextRun({ text: line || ' ' })],
          });
        });
      }

      const document = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 900, right: 900, bottom: 900, left: 900 },
              },
            },
            children,
          },
        ],
      });

      // ✅ إنشاء DOCX عبر Base64 (يضمن ملفًا صحيحًا)
      const base64 = await Packer.toBase64String(document);
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeFilename(file.name)}-${exportMode === 'text' ? 'editable-text' : 'original-image'}.docx`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setNotice({
        type: 'success',
        text: exportMode === 'text'
          ? 'تم إنشاء ملف Word بالنص المستخرج. راجع المستند بعد فتحه للتأكد من اتجاه النص وتنسيقه.'
          : 'تم إنشاء ملف Word يحتوي على الصورة الأصلية. الصورة ليست نصًا قابلًا للتحرير.',
      });
    } catch (error) {
      console.error('DOCX generation error:', error);
      setNotice({ type: 'error', text: 'تعذر إنشاء ملف Word. أعد المحاولة، وإذا استمرت المشكلة جرّب صورة أخرى.' });
    } finally {
      setIsExporting(false);
    }
  };

  const resetTool = () => {
    if (isProcessing || isExporting) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = '';
    setPreviewUrl('');
    setFile(null);
    setExtractedText('');
    setProgress(0);
    setStatusText('');
    setNotice(null);
    setExportMode('text');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-orange-100 px-5 py-8 sm:px-9 sm:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#f59e0b 0.8px, transparent 0.8px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-amber-800">
              <Sparkles className="h-4 w-4" /> أداة مجانية من Intooly
            </div>
            <h1 className="mb-4 flex flex-wrap items-center gap-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/25">
                <FileText className="h-7 w-7" />
              </span>
              تحويل JPG إلى Word
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              استخرج النص من صور JPG وPNG باستخدام OCR، ثم راجعه وعدّله وحمّله في ملف Word. يمكنك أيضًا إنشاء مستند Word يحتوي على الصورة الأصلية.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-slate-600">
              <span className="rounded-full bg-white/90 px-3 py-1.5">يدعم العربية والإنجليزية</span>
              <span className="rounded-full bg-white/90 px-3 py-1.5">حتى 10 MB</span>
              <span className="rounded-full bg-white/90 px-3 py-1.5">المعالجة داخل المتصفح</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* Upload and settings */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">1. ارفع الصورة</h2>
                <p className="mt-1 text-sm text-slate-500">JPG أو JPEG أو PNG — بحد أقصى 10 MB</p>
              </div>
              {file && !isProcessing && !isExporting && (
                <button type="button" onClick={resetTool} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                  <RotateCcw className="h-4 w-4" /> إعادة ضبط
                </button>
              )}
            </div>

            {!file ? (
              <div
                onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50'}`}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="text-base font-bold text-slate-800">اسحب الصورة وأفلتها هنا</p>
                <p className="mt-1 text-sm text-slate-500">أو اختر ملفًا من جهازك</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-3 font-bold text-white shadow-md shadow-amber-500/20 transition hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-amber-200">
                  <FileImage className="h-5 w-5" /> اختيار صورة
                </button>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={onInputChange} className="hidden" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm"><ImageIcon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)} · {file.type.toUpperCase().replace('IMAGE/', '')}</p>
                  </div>
                  {!isProcessing && !isExporting && <button type="button" onClick={resetTool} aria-label="حذف الصورة" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"><X className="h-4 w-4" /></button>}
                </div>
                <div className="flex max-h-[360px] min-h-[190px] items-center justify-center bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="معاينة الصورة المراد تحويلها إلى Word" className="max-h-[330px] max-w-full rounded-lg object-contain shadow-sm" />
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-3 text-base font-extrabold text-slate-900">2. اختر لغة النص</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {languageOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => setLanguage(option.value)} disabled={isProcessing} className={`rounded-xl border p-3 text-right transition disabled:cursor-not-allowed disabled:opacity-60 ${language === option.value ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-slate-50'}`}>
                    <span className="block text-sm font-bold text-slate-800">{option.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={extractText} disabled={!file || isProcessing || isExporting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-3.5 font-extrabold text-white shadow-md shadow-amber-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none">
              {isProcessing ? <><LoaderCircle className="h-5 w-5 animate-spin" /> جارٍ استخراج النص…</> : <><Sparkles className="h-5 w-5" /> استخراج النص باستخدام OCR</>}
            </button>

            {(isProcessing || progress > 0) && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4" aria-live="polite">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">{statusText || 'جاهز'}</span>
                  <span className="font-bold tabular-nums text-amber-700">{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm leading-6 text-sky-900">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>تتم معالجة الصورة في المتصفح ولا نرفعها إلى خادم Intooly. قد يحتاج المحرك إلى تنزيل ملفات اللغة عند أول استخدام؛ لا ترسل الأداة الصورة نفسها إلى خدمة OCR خارجية.</p>
            </div>
          </section>

          {/* Text editor and export */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">3. راجع النص وأنشئ Word</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">يمكنك تعديل النص المستخرج قبل تنزيل المستند.</p>
            </div>
            <label htmlFor="ocr-result" className="mb-2 block text-sm font-bold text-slate-700">النص المستخرج</label>
            <textarea
              id="ocr-result"
              value={extractedText}
              onChange={(event) => setExtractedText(event.target.value)}
              dir="auto"
              placeholder="سيظهر النص المستخرج هنا بعد تشغيل OCR… ويمكنك الكتابة أو التصحيح يدويًا."
              className="min-h-[260px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              spellCheck
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>عدد الأحرف: {extractedText.length.toLocaleString('ar-EG')}</span>
              <span>النص قابل للتعديل</span>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-base font-extrabold text-slate-900">4. اختر محتوى ملف Word</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setExportMode('text')} className={`rounded-2xl border p-4 text-right transition ${exportMode === 'text' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50'}`}>
                  <FileText className={`mb-3 h-6 w-6 ${exportMode === 'text' ? 'text-amber-700' : 'text-slate-500'}`} />
                  <span className="block font-extrabold text-slate-900">نص قابل للتحرير</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">يُنشئ مستند DOCX من النص الذي راجعته.</span>
                </button>
                <button type="button" onClick={() => setExportMode('image')} className={`rounded-2xl border p-4 text-right transition ${exportMode === 'image' ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50'}`}>
                  <FileImage className={`mb-3 h-6 w-6 ${exportMode === 'image' ? 'text-amber-700' : 'text-slate-500'}`} />
                  <span className="block font-extrabold text-slate-900">الصورة الأصلية</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">يضع الصورة داخل Word كما هي؛ لن تصبح حروفها قابلة للتحرير.</span>
                </button>
              </div>
            </div>

            <button type="button" onClick={downloadDocx} disabled={!file || isProcessing || isExporting || (exportMode === 'text' && !extractedText.trim())} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45">
              {isExporting ? <><LoaderCircle className="h-5 w-5 animate-spin" /> جارٍ إنشاء ملف Word…</> : <><Download className="h-5 w-5" /> تنزيل ملف Word (.docx)</>}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">قبل تنزيل النص، راجع الأخطاء المحتملة في الحروف واتجاه الكتابة والتنسيق.</p>
          </section>
        </div>

        {notice && (
          <div role={notice.type === 'error' ? 'alert' : 'status'} className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-7 ${notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
            {notice.type === 'error' ? <AlertCircle className="mt-1 h-5 w-5 shrink-0" /> : notice.type === 'success' ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" /> : <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />}
            <p>{notice.text}</p>
          </div>
        )}

        {/* Accuracy warning */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
            <div>
              <h2 className="font-extrabold text-amber-950">تنبيه مهم بشأن دقة OCR العربي</h2>
              <p className="mt-2 text-sm leading-7 text-amber-950/90">قد لا تكون نتيجة التعرف على النص مثالية، خصوصًا في الصور منخفضة الجودة أو الخطوط الصغيرة أو النصوص العربية المختلطة بالأرقام والإنجليزية. يُرجى مراجعة النص المستخرج وتصحيحه قبل تنزيل ملف Word. لا تضمن الأداة الحفاظ على تخطيط الصورة الأصلي.</p>
            </div>
          </div>
        </section>

        {/* SEO content */}
        <section className="mt-10 space-y-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">كيفية تحويل صورة JPG إلى Word</h2>
            <p className="mt-3 leading-8 text-slate-600">تساعدك أداة JPG to Word من Intooly على استخراج النص الظاهر في الصور باستخدام تقنية التعرف الضوئي على الحروف (OCR)، ثم تحرير النص وتصديره إلى مستند Word بصيغة DOCX. اختر صورة واضحة، وحدد لغة النص، ثم ابدأ الاستخراج وراجع النتيجة قبل تنزيلها.</p>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">تحويل الصور إلى Word باللغة العربية والإنجليزية</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك اختيار العربية أو الإنجليزية أو الجمع بينهما إذا كانت الصورة تحتوي على لغتين. قد يختلف أداء OCR حسب جودة الصورة ونوع الخط ووضوح الحروف واتجاه النص. في المستندات العربية، تحقق خصوصًا من ترتيب الكلمات والأرقام وعلامات الترقيم.</p>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">هل يتم رفع الصور إلى خادم؟</h2>
            <p className="mt-3 leading-8 text-slate-600">تنفذ الأداة التعرف على النص داخل متصفحك، ولا ترسل الصورة إلى خادم Intooly. قد يتطلب التشغيل تنزيل ملفات المحرك واللغة من مصدر الموارد الذي تضبطه الأداة. تجنب استخدام صور تحتوي على معلومات حساسة على جهاز لا تثق به.</p>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">نصائح للحصول على نتيجة أفضل</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 leading-7 text-slate-600">
              <li>استخدم صورة واضحة ومضاءة جيدًا، وتجنب الاهتزاز والظلال.</li>
              <li>تأكد من أن النص ليس صغيرًا جدًا أو مائلًا بشدة.</li>
              <li>قص الحواف غير الضرورية قبل رفع الصورة إذا كانت تشوش على النص.</li>
              <li>اختر لغة OCR المناسبة، ثم صحح النص يدويًا قبل التصدير.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">أدوات أخرى قد تحتاج إليها</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/tools/pdf" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50">أدوات PDF</Link>
              <Link href="/tools/image-converter" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50">محوّل الصور</Link>
              <Link href="/tools/word-counter" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50">عداد الكلمات</Link>
            </div>
            <p className="mt-2 text-xs text-slate-500">تحقق من أن المسارات أعلاه موجودة في مشروعك قبل النشر، وعدّل الروابط إذا كانت مسارات الأدوات مختلفة.</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
          <h2 className="text-2xl font-black text-slate-900">الأسئلة الشائعة</h2>
          <div className="mt-5 divide-y divide-slate-100">
            <details className="group py-4" open>
              <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden">هل أستطيع تحويل JPG إلى Word مجانًا؟</summary>
              <p className="mt-3 leading-7 text-slate-600">نعم، يمكنك استخدام الأداة لاستخراج النص وإنشاء ملف DOCX دون دفع رسوم للأداة نفسها. قد يلزم تنزيل ملفات محرك OCR عند أول تشغيل.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-slate-800">هل تدعم الأداة اللغة العربية؟</summary>
              <p className="mt-3 leading-7 text-slate-600">نعم، تتوفر العربية والإنجليزية ووضع يجمع اللغتين. راجع النص الناتج لأن بعض الحروف أو ترتيب النص قد يحتاج إلى تصحيح.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-slate-800">هل يمكن تعديل النص داخل Word؟</summary>
              <p className="mt-3 leading-7 text-slate-600">نعم عند اختيار وضع النص المستخرج؛ ينشئ هذا الوضع فقرات نصية قابلة للتحرير. أما وضع الصورة الأصلية فيدرج الصورة داخل المستند ولا يحول الحروف الموجودة فيها إلى نص.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-slate-800">هل تحافظ الأداة على تنسيق الصورة الأصلي؟</summary>
              <p className="mt-3 leading-7 text-slate-600">لا يمكن ضمان الحفاظ على التنسيق الأصلي عند استخراج النص. قد تتغير الأعمدة والجداول والمسافات وترتيب الفقرات، لذلك راجع المستند بعد إنشائه.</p>
            </details>
            <details className="group py-4">
              <summary className="cursor-pointer list-none font-bold text-slate-800">ما الحد الأقصى لحجم الصورة؟</summary>
              <p className="mt-3 leading-7 text-slate-600">الحد الأقصى المسموح به هو 10 MB للصورة الواحدة. الصور ذات الأبعاد الكبيرة جدًا قد تستهلك ذاكرة إضافية حتى لو كان حجم الملف أقل من الحد.</p>
            </details>
          </div>
        </section>

        <p className="mt-8 text-center text-xs leading-6 text-slate-500">Intooly — أدوات مجانية عبر الإنترنت. نتائج OCR تعتمد على جودة الصورة وإعدادات اللغة والجهاز المستخدم.</p>
      </div>
    </main>
  );
}