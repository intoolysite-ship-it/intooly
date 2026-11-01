'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic, MicOff, Upload, FileAudio, Copy, Download, Trash2,
  ArrowLeft, AlertCircle, Loader2, Languages, CheckCircle2,
  Volume2, ChevronDown, FileText, Shield, Zap, Clock, Headphones
} from 'lucide-react';

// ============================================================
// ✅ Types & Helpers
// ============================================================
type Language = "auto" | "arabic" | "english";
type ToolStatus = "idle" | "loading" | "transcribing" | "recording" | "success" | "error";

type ProgressEvent = { status?: string; progress?: number; file?: string };
type SpeechResult = { isFinal: boolean; [index: number]: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type SpeechErrorEvent = { error: string };

interface SpeechRecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null; onstart: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechConstructor = new () => SpeechRecognitionLike;
type AudioFileResult = { text: string };

const MODEL_ID = "onnx-community/whisper-small";
const TARGET_SAMPLE_RATE = 16000;
const MAX_FILE_SIZE = 500 * 1024 * 1024;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSpeechConstructor(): SpeechConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & { SpeechRecognition?: SpeechConstructor; webkitSpeechRecognition?: SpeechConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

async function decodeAudioFile(file: File): Promise<Float32Array> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) throw new Error("متصفحك لا يدعم فك ترميز الملفات الصوتية/المرئية.");

  const context = new AudioContextClass();
  try {
    const buffer = await file.arrayBuffer();
    const decoded = await context.decodeAudioData(buffer);
    if (!decoded.length || decoded.duration <= 0) throw new Error("الملف الصوتي فارغ أو غير صالح.");

    const frameCount = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE);
    const offlineContext = new OfflineAudioContext(1, frameCount, TARGET_SAMPLE_RATE);
    const monoBuffer = offlineContext.createBuffer(1, decoded.length, decoded.sampleRate);
    const monoChannel = monoBuffer.getChannelData(0);

    for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
      const channelData = decoded.getChannelData(channel);
      for (let i = 0; i < decoded.length; i++) monoChannel[i] += channelData[i] / decoded.numberOfChannels;
    }

    const source = offlineContext.createBufferSource();
    source.buffer = monoBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const rendered = await offlineContext.startRendering();
    return new Float32Array(rendered.getChannelData(0));
  } finally {
    await context.close().catch(() => undefined);
  }
}

// ============================================================
// ✅ Main Component
// ============================================================
export default function AudioToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("auto");
  const [text, setText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [status, setStatus] = useState<ToolStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptionBusyRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldRestartRef = useRef(false);

  const isBusy = status === "loading" || status === "transcribing";

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechConstructor()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setErrorMessage("");
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage("حجم الملف أكبر من الحد المسموح به وهو 500 ميجابايت.");
      e.target.value = "";
      return;
    }
    if (selectedFile.size === 0) {
      setErrorMessage("الملف المحدد فارغ.");
      e.target.value = "";
      return;
    }

    if (fileUrl) URL.revokeObjectURL(fileUrl);
    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setFileUrl(url);
    setText("");
    setInterimText("");
    setProgress(0);
    setStatus("idle");
    setStatusMessage("تم اختيار الملف بنجاح. اضغط على 'تحويل الصوت الى نص' للبدء.");
  }, [fileUrl]);

  const clearFile = useCallback(() => {
    if (isBusy) return;
    setFile(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setText("");
    setInterimText("");
    setProgress(0);
    setStatus("idle");
    setStatusMessage("");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }, [isBusy, fileUrl]);

  const transcribeFile = useCallback(async () => {
    if (!file || transcriptionBusyRef.current) return;
    transcriptionBusyRef.current = true;

    setErrorMessage("");
    setText("");
    setInterimText("");
    setProgress(0);
    setStatus("loading");
    setStatusMessage("جارٍ تجهيز محرك تحويل الصوت الى نص...");

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try { await audioRef.current.play(); } catch {}
    }

    try {
      if (!navigator.onLine) throw new Error("يلزم الاتصال بالإنترنت لتحميل نموذج المعالجة لأول مرة.");

      setStatusMessage("جارٍ تحميل النموذج. قد يستغرق بضع ثوانٍ في المرة الأولى...");
      const { pipeline } = await import("@huggingface/transformers");

      const transcriber = await pipeline("automatic-speech-recognition", MODEL_ID, {
        progress_callback: (event: ProgressEvent) => {
          if (typeof event.progress === "number") setProgress(Math.min(100, Math.max(0, event.progress)));
          if (event.status === "downloading") setStatusMessage(`جارٍ تنزيل: ${event.file || "ملفات النموذج"}...`);
          else if (event.status === "loading") setStatusMessage("جارٍ تجهيز النموذج داخل المتصفح...");
          else if (event.status === "ready") setStatusMessage("المحرك جاهز. جارٍ تحليل الصوت...");
        },
      });

      setStatus("transcribing");
      setProgress(100);
      setStatusMessage("جارٍ استخراج النص. يرجى الانتظار...");

      const audio = await decodeAudioFile(file);
      const options: { task: string; language?: string } = { task: "transcribe" };
      if (language !== "auto") options.language = language === "arabic" ? "ar" : "en";

      const result = (await transcriber(audio, options)) as AudioFileResult;

      if (!result || typeof result.text !== "string") throw new Error("لم يتمكن النموذج من إنتاج نص صالح.");
      const output = result.text.trim();
      if (!output) throw new Error("لم يتم اكتشاف كلام واضح في التسجيل.");

      setText(output);
      setStatus("success");
      setStatusMessage("اكتمل تحويل الصوت الى نص بنجاح!");
      
      if (audioRef.current) audioRef.current.pause();
    } catch (error) {
      console.error("Transcription error:", error);
      setStatus("error");
      setErrorMessage(getErrorMessage(error));
      setStatusMessage("تعذر إكمال عملية تحويل الصوت الى نص.");
      if (audioRef.current) audioRef.current.pause();
    } finally {
      transcriptionBusyRef.current = false;
    }
  }, [file, language]);

  const startRecording = useCallback(() => {
    const SpeechRecognition = getSpeechConstructor();
    if (!SpeechRecognition) {
      setErrorMessage("التسجيل المباشر غير مدعوم في هذا المتصفح. جرّب Chrome.");
      return;
    }
    recognitionRef.current?.abort();
    setErrorMessage("");
    setInterimText("");
    setStatusMessage("جارٍ الاستماع... تحدث الآن");
    setStatus("recording");
    shouldRestartRef.current = true;

    const recognition = new SpeechRecognition();
    recognition.lang = language === "english" ? "en-US" : "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechEvent) => {
      let finalText = "", interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0]?.transcript ?? "";
        else interim += res[0]?.transcript ?? "";
      }
      if (finalText) setText((prev) => (prev ? `${prev.trim()} ${finalText.trim()}` : finalText.trim()));
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechErrorEvent) => {
      if (event.error !== "no-speech" || !shouldRestartRef.current) {
        setErrorMessage(`خطأ في التسجيل: ${event.error}`);
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatus("error");
        shouldRestartRef.current = false;
      }
    };

    recognition.onend = () => {
      setInterimText("");
      if (shouldRestartRef.current && recognitionRef.current === recognition) {
        try { recognition.start(); return; } catch {}
      }
      shouldRestartRef.current = false;
      recognitionRef.current = null;
      if (status === "recording") setStatus("success");
      setStatusMessage("انتهى التسجيل.");
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { 
      recognitionRef.current = null; 
      shouldRestartRef.current = false; 
      setStatus("error"); 
      setErrorMessage(getErrorMessage(e)); 
    }
  }, [language, status]);

  const stopRecording = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterimText("");
    setStatusMessage("تم إيقاف التسجيل.");
  }, []);

  const copyText = useCallback(async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setStatusMessage("تم نسخ النص بنجاح!");
    setTimeout(() => { setCopied(false); setStatusMessage(""); }, 2000);
  }, [text]);

  const downloadText = useCallback(() => {
    if (!text.trim()) return;
    const blob = new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intooly-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  return (
    <main dir="rtl" className="min-h-screen bg-ink-50 text-ink-900 transition-colors duration-300">
      
      {/* ================================================== */}
      {/* ✅ HERO BANNER (مطابق لهوية Intooly) */}
      {/* ================================================== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link href="/tools" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع الأدوات
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <Headphones className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                تحويل الصوت الى نص مجانًا بالذكاء الاصطناعي
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أداة تحويل الصوت الى نص احترافية ومجانية. فرّغ التسجيلات والمحاضرات بدقة عالية باستخدام الذكاء الاصطناعي محليًا داخل متصفحك دون رفع الملفات لأي سيرفر.
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
          <div className="bg-white border border-ink-200 rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
            
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Controls */}
              <div className="lg:col-span-1 space-y-5">
                <div className="bg-ink-50 border border-ink-200 rounded-xl p-4">
                  <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                    <Languages className="w-4 h-4 text-brand-500" /> لغة التسجيل
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    disabled={isBusy || status === "recording"}
                    className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
                  >
                    <option value="auto">اكتشاف اللغة تلقائيًا</option>
                    <option value="arabic">العربية</option>
                    <option value="english">الإنجليزية</option>
                  </select>
                </div>

                <div 
                  onClick={() => !isBusy && inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    file ? 'border-brand-500 bg-brand-50' : 'border-ink-300 bg-ink-50 hover:border-brand-400 hover:bg-brand-50'
                  } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input ref={inputRef} type="file" accept="audio/*,video/mp4,video/webm" onChange={handleFileChange} className="hidden" />
                  <Upload className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-ink-900">اختر ملف صوتي أو مرئي</p>
                  <p className="text-[10px] text-ink-500 mt-1">MP3, WAV, M4A, MP4, WebM (حتى 500MB)</p>
                </div>

                {file && fileUrl && (
                  <div className="bg-ink-50 p-3 rounded-xl border border-ink-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileAudio className="h-5 w-5 text-brand-600 flex-shrink-0" />
                        <p className="text-xs font-bold text-ink-900 truncate">{file.name}</p>
                      </div>
                      <button onClick={clearFile} disabled={isBusy} className="text-rose-500 hover:text-rose-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {file.type.startsWith('video') ? (
                      <video ref={audioRef as any} src={fileUrl} controls className="w-full rounded-lg h-32 bg-black" />
                    ) : (
                      <audio ref={audioRef} src={fileUrl} controls className="w-full h-10 rounded-lg" />
                    )}
                  </div>
                )}

                <button 
                  onClick={transcribeFile} 
                  disabled={!file || isBusy || status === "recording"}
                  className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:bg-ink-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                  {isBusy ? `جارٍ المعالجة... ${progress}%` : 'تحويل الصوت الى نص'}
                </button>

                <div className="border-t border-ink-200 pt-4">
                  <p className="text-xs font-bold text-ink-700 mb-3 text-center">أو سجّل صوتك مباشرة</p>
                  {status !== "recording" ? (
                    <button onClick={startRecording} disabled={!speechSupported || isBusy} className="w-full py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-800 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition">
                      <Mic className="h-4 w-4" /> بدء التسجيل
                    </button>
                  ) : (
                    <button onClick={stopRecording} className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 animate-pulse transition">
                      <MicOff className="h-4 w-4" /> إيقاف التسجيل
                    </button>
                  )}
                  {!speechSupported && <p className="text-[10px] text-rose-500 mt-2 text-center">متصفحك لا يدعم التسجيل المباشر.</p>}
                </div>
              </div>

              {/* Right: Output */}
              <div className="lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg text-ink-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" /> النص المستخرج
                  </h3>
                  <span className="rounded-lg bg-ink-100 px-3 py-1 text-xs text-ink-600 font-bold">قابل للتعديل</span>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="سيظهر النص المحوّل هنا... يمكنك التعديل عليه يدويًا."
                  className="min-h-[400px] w-full flex-1 resize-y rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm leading-8 text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />

                {interimText && (
                  <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
                    <p className="text-xs font-bold text-brand-700 mb-1">جارٍ التعرف:</p>
                    <p className="text-sm leading-7 text-ink-700 italic">{interimText}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500 border-t border-ink-100 pt-3">
                  <div className="flex gap-4">
                    <span>الكلمات: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
                    <span>الأحرف: {text.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyText} disabled={!text.trim()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ink-200 bg-white hover:bg-ink-50 disabled:opacity-40 transition font-bold text-ink-700">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'تم النسخ' : 'نسخ النص'}
                    </button>
                    <button onClick={downloadText} disabled={!text.trim()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-40 transition font-bold">
                      <Download className="h-4 w-4" /> تنزيل TXT
                    </button>
                  </div>
                </div>

                {(statusMessage || errorMessage) && (
                  <div className={`mt-4 p-3 rounded-xl flex items-start gap-3 text-sm ${errorMessage ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-brand-50 text-brand-700 border border-brand-200'}`}>
                    {errorMessage ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <Loader2 className="h-5 w-5 flex-shrink-0 mt-0.5 animate-spin" />}
                    <div>
                      <p className="font-bold">{errorMessage ? 'تنبيه' : 'حالة المعالجة'}</p>
                      <p>{statusMessage || errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* ✅ SEO CONTENT SECTION (مطابق لهوية Intooly والكلمة المفتاحية تماماً) */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-white border-t border-ink-100">
        <div className="container mx-auto px-4 max-w-4xl text-right">
          
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900">
              ما هي أداة تحويل الصوت الى نص؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700">
              <strong>تحويل الصوت الى نص</strong> هو عملية تقنية متقدمة تتيح لك تفريغ التسجيلات الصوتية وملفات الفيديو والمحاضرات إلى نص مكتوب بدقة عالية. أداة Intooly تقدم حلاً شاملاً ومجانيًا لـ <strong>تحويل الصوت الى نص</strong> باستخدام نماذج الذكاء الاصطناعي (Whisper) التي تعمل محليًا داخل متصفحك، مما يضمن خصوصية تامة لبياناتك دون رفع أي ملفات إلى خوادم خارجية.
            </p>
            <p className="text-base leading-relaxed text-ink-700">
              سواء كنت تبحث عن <strong>تحويل الصوت الى نص</strong> عربي أو إنجليزي، فإن أداتنا تدعم الاكتشاف التلقائي للغة، وتتيح لك تعديل النص الناتج، ونسخه، أو تنزيله بصيغة TXT جاهزة للاستخدام في أي برنامج معالجة نصوص.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900">
              كيفية تحويل الصوت الى نص مكتوب بدقة
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'ارفع الملف أو سجّل صوتك', desc: 'اختر ملفًا صوتيًا أو مرئيًا من جهازك، أو استخدم ميزة التسجيل المباشر من الميكروفون.' },
                { num: 2, title: 'حدد لغة التسجيل', desc: 'اختر العربية أو الإنجليزية، أو اترك النظام يكتشف اللغة تلقائيًا لضمان دقة تحويل الصوت الى نص.' },
                { num: 3, title: 'ابدأ عملية التحويل', desc: 'اضغط على زر التحويل، وسيقوم الذكاء الاصطناعي بمعالجة الملف محليًا وعرض النص فورًا.' },
                { num: 4, title: 'راجع وصدّر النص', desc: 'عدّل النص في المربع المخصص، ثم انسخه أو نزّله كملف TXT لحفظه أو مشاركته.' },
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
              مميزات أداة تحويل الصوت الى نص من Intooly
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'خصوصية تامة (معالجة محلية)', desc: 'تتم عملية تحويل الصوت الى نص داخل متصفحك فقط، ولا يتم رفع ملفاتك لأي خادم.' },
                { icon: Zap, title: 'دعم العربية والإنجليزية', desc: 'نموذج ذكاء اصطناعي متقدم يفهم اللهجات ويدعم الاكتشاف التلقائي للغة بدقة عالية.' },
                { icon: Clock, title: 'تشغيل الملف أثناء المعالجة', desc: 'استمع إلى الملف الصوتي أو المرئي أثناء قيام الأداة باستخراج النص منه.' },
                { icon: FileText, title: 'تصدير مرن وسهل', desc: 'انسخ النص بضغطة زر أو نزّله كملف TXT منسق وجاهز للاستخدام الفوري.' },
              ].map((f, i) => (
                <div key={i} className="border rounded-xl p-5 bg-ink-50 border-ink-200 text-right">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-ink-900">{f.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900">
              الأسئلة الشائعة حول تحويل الصوت الى نص
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل يمكنني تحويل الصوت الى نص مجانًا؟', a: 'نعم، أداة تحويل الصوت الى نص من Intooly مجانية بالكامل ولا تتطلب أي اشتراكات.' },
                { q: 'هل تدعم الأداة تحويل الفيديو الى نص؟', a: 'نعم، يمكنك رفع ملفات فيديو (MP4, WebM) وسيقوم النظام باستخراج المسار الصوتي وتحويله الى نص تلقائيًا.' },
                { q: 'هل يتم حفظ التسجيلات على خوادمكم؟', a: 'لا على الإطلاق. عند استخدام ميزة تحويل الملفات، تتم المعالجة محليًا داخل جهازك ولا تغادر الملفات متصفحك.' },
                { q: 'لماذا يتوقف التسجيل المباشر أحيانًا؟', a: 'يعتمد التسجيل المباشر على Web Speech API المدمج في المتصفح، وقد يتوقف تلقائيًا بعد فترات الصمت، لكن الأداة تعيد التشغيل تلقائيًا لاستمرار التسجيل.' },
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
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FileAudio, title: 'استخراج الألوان من الصور', href: '/tools/image-color-picker' },
                { icon: FileText, title: 'عداد الكلمات والأحرف', href: '/tools/word-counter' },
                { icon: Headphones, title: 'ضغط الملفات الصوتية', href: '/tools/audio-compressor' }, // رابط افتراضي
                { icon: Zap, title: 'مولد لوحات الألوان', href: '/tools/color-palette-generator' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white border-2 border-ink-200 text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <tool.icon className="w-8 h-8 text-brand-500" />
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-brand-600 mt-1 flex items-center gap-1 font-bold">
                    جرّب الأداة <ArrowLeft className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </article>

        </div>
      </section>
    </main>
  );
}