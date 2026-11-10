"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Upload, Play, Pause, Scissors, Download, ZoomIn, ZoomOut, Music, AlertTriangle, CheckCircle2 } from "lucide-react";

const faqQuestions = [
  { q: "كيف يمكن قص الأغاني أونلاين؟", a: "افتح أداة قص الأغاني، وارفع الملف الصوتي، ثم حدد نقطة البداية والنهاية من الموجة الصوتية. استمع إلى المقطع، وبعد التأكد من النتيجة قم بتصديره وحفظه." },
  { q: "كيف أقص أغنية بصيغة MP3؟", a: "ارفع ملف MP3 إلى الأداة، وحدد الجزء الذي تريد الاحتفاظ به، ثم عاين المقطع واختر تصدير الملف بالصيغ المتاحة." },
  { q: "هل يمكن قص الأغاني مجانًا؟", a: "نعم، يمكنك استخدام أداة قص الأغاني من Intooly مجانًا وفق حدود حجم الملف (حتى 50 ميجابايت لضمان أداء المتصفح) ومدة المعالجة." },
  { q: "هل يمكن قص الأغاني من الهاتف؟", a: "نعم، يمكن استخدام الأداة من متصفح الهاتف لرفع الملفات الصوتية وتحديد المقاطع ومعاينتها وحفظها، مع مراعاة توافق المتصفح والجهاز." },
  { q: "كيف أحول جزءًا من أغنية إلى نغمة رنين؟", a: "ارفع الأغنية، وحدد الجزء الذي تريد استخدامه كنغمة رنين (يفضل 30 ثانية)، ثم عاينه واحفظه بصيغة MP3 أو M4A المناسبة للهاتف." },
  { q: "هل يؤثر قص الأغنية على جودة الصوت؟", a: "لا يؤدي تحديد جزء من الملف بالضرورة إلى تقليل الجودة، لكن إعادة ترميز الصوت بصيغة مضغوطة مثل MP3 قد تسبب فقدًا طفيفًا. الأداة تحاول الحفاظ على أعلى جودة ممكنة." }
];

export default function SongCutterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  
  // تهيئة المرجع كـ null لتجنب التنفيذ أثناء بناء الخادم (SSR)
  const ffmpegRef = useRef<any>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (typeof window === "undefined" || !waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#f97316",
      progressColor: "#c2410c",
      cursorColor: "#1e293b",
      barWidth: 2,
      barGap: 1,
      height: 120,
      normalize: true,
      minPxPerSec: zoom,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    regions.on("region-updated", (region: any) => {
      setStartTime(region.start);
      setEndTime(region.end);
    });

    regions.on("region-clicked", (region: any, e: MouseEvent) => {
      e.stopPropagation();
      region.play();
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, []);

  useEffect(() => {
    if (wavesurferRef.current && typeof window !== "undefined") {
      wavesurferRef.current.zoom(zoom);
    }
  }, [zoom]);

  const loadFFmpeg = async () => {
    // حماية صارمة: التأكد من أن الكود يعمل في المتصفح فقط
    if (typeof window === "undefined") return;

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      setProcessStep("جاري تحميل محرك المعالجة...");
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("حجم الملف يتجاوز 50 ميجابايت. يرجى اختيار ملف أصغر لضمان أداء المتصفح.");
      return;
    }

    setError("");
    setDownloadUrl("");
    setFile(selectedFile);
    setFileName(selectedFile.name);

    const url = URL.createObjectURL(selectedFile);
    if (wavesurferRef.current) {
      wavesurferRef.current.load(url);
      
      wavesurferRef.current.on("ready", () => {
        const duration = wavesurferRef.current?.getDuration() || 0;
        setEndTime(duration);
        
        regionsRef.current?.clearRegions();
        const regionEnd = Math.min(30, duration);
        regionsRef.current?.addRegion({
          start: 0,
          end: regionEnd,
          color: "rgba(249, 115, 22, 0.3)",
          drag: true,
          resize: true,
        });
        setStartTime(0);
        setEndTime(regionEnd);
      });
    }
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const playSelection = () => {
    const regions = regionsRef.current?.getRegions();
    if (regions && regions.length > 0) {
      regions[0].play();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms}`;
  };

  const handleTimeChange = (type: "start" | "end", value: string) => {
    const time = parseFloat(value);
    if (isNaN(time)) return;

    const regions = regionsRef.current?.getRegions();
    if (regions && regions.length > 0) {
      const region = regions[0];
      if (type === "start") {
        region.setOptions({ start: time });
        setStartTime(time);
      } else {
        region.setOptions({ end: time });
        setEndTime(time);
      }
    }
  };

  const cutAudio = async () => {
    if (!file || !wavesurferRef.current) return;
    
    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      setProcessStep("جاري قراءة الملف...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setProcessStep("جاري معالجة الصوت...");
      const duration = endTime - startTime;
      
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-c:a", "libmp3lame",
        "-q:a", "2",
        outputName
      ]);

      setProcessStep("جاري تحضير الملف للتنزيل...");
      const data = await ffmpeg.readFile(outputName);
      const uint8Array = new Uint8Array(data as Uint8Array);
      const blob = new Blob([uint8Array], { type: "audio/mp3" });
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء معالجة الملف. يرجى التأكد من أن الملف بصيغة مدعومة (MP3, WAV, M4A).");
    } finally {
      setIsProcessing(false);
      setProcessStep("");
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/audio" className="font-medium transition hover:text-orange-600">أدوات الصوت</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">قص الأغاني</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Music size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            قص الأغاني أونلاين مجانًا – قص ملفات MP3 وتقطيع الصوت بسهولة
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم أداة قص الأغاني من Intooly لقص ملفات MP3 وتقطيع الأغاني بدقة، وتحديد المقاطع ومعاينتها وإنشاء نغمات رنين، وتنزيلها بسهولة مجانًا.
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Upload size={48} className="mb-4 text-slate-400" />
              <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملف الصوت للبدء</h3>
              <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, OGG (الحد الأقصى 50 ميجابايت)</p>
              <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700">
                اختيار ملف
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{fileName}</h3>
                  <p className="text-sm text-slate-500">
                    المدة الإجمالية: {formatTime(wavesurferRef.current?.getDuration() || 0)}
                  </p>
                </div>
                <button 
                  onClick={() => { setFile(null); setDownloadUrl(""); setError(""); }}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  إزالة الملف
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div ref={waveformRef} className="w-full"></div>
                
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={togglePlay}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-orange-700"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button 
                      onClick={playSelection}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      معاينة المقطع
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-2 text-slate-600 hover:text-orange-600" title="تصغير">
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-xs text-slate-500">تكبير</span>
                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 text-slate-600 hover:text-orange-600" title="تكبير">
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">وقت البداية (ثانية)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={startTime.toFixed(1)} 
                    onChange={(e) => handleTimeChange("start", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">وقت النهاية (ثانية)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={endTime.toFixed(1)} 
                    onChange={(e) => handleTimeChange("end", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={cutAudio}
                  disabled={isProcessing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
                >
                  {isProcessing ? <span className="animate-pulse">{processStep}</span> : <><Scissors size={20} /> قص الجزء المحدد وتنزيله</>}
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
                  <AlertTriangle size={20} /> {error}
                </div>
              )}

              {downloadUrl && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
                  <h3 className="mb-2 text-lg font-bold text-green-900">تم قص الأغنية بنجاح!</h3>
                  <a 
                    href={downloadUrl} 
                    download={`cut-${fileName}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
                  >
                    <Download size={20} /> تنزيل الملف MP3
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة قص الأغاني أونلاين؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              أداة قص الأغاني هي أداة مجانية عبر الإنترنت تتيح لك تحديد جزء معين من الملف الصوتي وحفظه كملف مستقل، بدلًا من الاحتفاظ بالتسجيل كاملًا. تساعدك أداة قص الأغاني من Intooly على التحكم في بداية ونهاية المقطع، والاستماع إلى الجزء المحدد، وتعديله قبل التصدير.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية قص الأغاني باستخدام Intooly</h2>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>افتح أداة قص الأغاني من Intooly.</li>
              <li>اضغط على زر رفع ملف صوتي أو اسحب الملف إلى منطقة الرفع.</li>
              <li>انتظر حتى تتم معالجة الملف وعرض الموجة الصوتية.</li>
              <li>حدد نقطة بداية المقطع الذي تريد الاحتفاظ به ونقطة النهاية.</li>
              <li>استمع إلى الجزء المحدد للتأكد من النتيجة.</li>
              <li>اضغط على زر "قص الجزء المحدد وتنزيله" لحفظ الملف بصيغة MP3.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/video-to-audio" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تحويل الفيديو إلى صوت</span>
                <span className="text-sm text-slate-600">استخراج الصوت من ملفات الفيديو</span>
              </Link>
              <Link href="/tools/audio-to-text" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تحويل الصوت إلى نص</span>
                <span className="text-sm text-slate-600">تحويل التسجيلات الصوتية إلى نصوص مكتوبة</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول قص الأغاني</h2>
            <div className="mt-4 space-y-4">
              {faqQuestions.map((item: any, i: number) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-orange-200 open:bg-orange-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}