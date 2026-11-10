"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Upload, Play, Pause, Scissors, Download, ZoomIn, ZoomOut, Music, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const faqQuestions = [
  { q: "كيف يمكن قص الأغاني أونلاين؟", a: "افتح أداة قص الأغاني، وارفع الملف الصوتي، ثم حدد نقطة البداية والنهاية. استمع إلى المقطع، ثم قم بتصديره وحفظه." },
  { q: "لماذا لا تعمل الأداة؟", a: "تأكد من تعطيل مانع الإعلانات (Ad-blocker) وتحديث الصفحة. الأداة تتطلب متصفح حديث مثل Chrome أو Edge." }
];

export default function SongCutterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(50);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<any>(null);

  // تحليل الصوت وعرض الموجة
  const analyzeAudio = useCallback(async (url: string) => {
    if (!audioRef.current || !canvasRef.current) return;

    try {
      const audio = audioRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        setError("تعذر رسم الموجة الصوتية");
        return;
      }

      // إنشاء AudioContext لتحليل الصوت
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        if (!isLoaded) return;
        
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
          
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, "#f97316");
          gradient.addColorStop(1, "#c2410c");
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      };
      
      draw();
      setIsLoaded(true);
    } catch (err) {
      console.error("Audio analysis error:", err);
      setError("تعذر تحليل الملف الصوتي. يرجى التأكد من أنه ملف MP3 صالح.");
    }
  }, [isLoaded]);

  const loadFFmpeg = async () => {
    if (typeof window === "undefined") return;

    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      setProcessStep("جاري تحميل محرك المعالجة...");
      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
      } catch (err) {
        console.error("FFmpeg load error:", err);
        throw new Error("فشل تحميل محرك المعالجة. يرجى تعطيل مانع الإعلانات (Ad-blocker).");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("حجم الملف يتجاوز 50 ميجابايت.");
      return;
    }

    setError("");
    setDownloadUrl("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setIsLoaded(false);
    
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    
    // Reset times
    setStartTime(0);
    setEndTime(0);
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
      analyzeAudio(audioUrl);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00.0";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms}`;
  };

  const cutAudio = async () => {
    if (!file || startTime >= endTime) {
      setError("يرجى تحديد وقت بداية ونهاية صحيحين");
      return;
    }
    
    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      await loadFFmpeg();
      
      const ffmpeg = ffmpegRef.current;
      const ext = file.name.substring(file.name.lastIndexOf(".")) || ".mp3";
      const inputName = "input" + ext;
      const outputName = "output.mp3";

      setProcessStep("جاري معالجة الصوت...");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const clipDuration = endTime - startTime;
      
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-t", clipDuration.toString(),
        "-c:a", "libmp3lame",
        "-q:a", "2",
        "-y",
        outputName
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProcessStep("تم بنجاح!");

    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "حدث خطأ أثناء المعالجة");
    } finally {
      setIsProcessing(false);
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
            معالجة محلية 100%
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            قص الأغاني أونلاين مجانًا
          </h1>
          <p className="mt-4 text-slate-600">
            قص ملفات MP3 وتقطيع الصوت بسهولة مع معاينة مباشرة
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
              <Upload size={48} className="mb-4 text-slate-400" />
              <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملف الصوت للبدء</h3>
              <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A (الحد الأقصى 50 ميجابايت)</p>
              <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700">
                اختيار ملف
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{fileName}</h3>
                  <p className="text-sm text-slate-500">المدة: {formatTime(duration)}</p>
                </div>
                <button onClick={() => { setFile(null); setAudioUrl(""); setError(""); }} className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
                  <RefreshCw size={14} /> إزالة
                </button>
              </div>

              {/* Audio Element (Hidden) */}
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onLoadedMetadata={handleAudioLoaded}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Waveform Canvas */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={120}
                  className="w-full h-32 rounded-lg bg-white"
                />
                
                <div className="mt-4 flex items-center justify-between">
                  <button 
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-2 text-slate-600 hover:text-orange-600">
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-xs text-slate-500">تكبير</span>
                    <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-2 text-slate-600 hover:text-orange-600">
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">وقت البداية (ثانية)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min={0}
                    max={duration}
                    value={startTime.toFixed(1)}
                    onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value) || 0, endTime))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">وقت النهاية (ثانية)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min={0}
                    max={duration}
                    value={endTime.toFixed(1)}
                    onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value) || duration, startTime))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Cut Button */}
              <button 
                onClick={cutAudio}
                disabled={isProcessing || !isLoaded}
                className="w-full rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? <span className="animate-pulse">{processStep}</span> : <><Scissors size={20} /> قص وتنزيل</>}
              </button>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
                  <AlertTriangle size={20} /> 
                  <div>
                    <p className="font-semibold">{error}</p>
                    <p className="text-sm mt-1">💡 جرب تعطيل Ad-blocker أو استخدام Chrome/Edge</p>
                  </div>
                </div>
              )}

              {downloadUrl && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
                  <h3 className="mb-2 text-lg font-bold text-green-900">تم القص بنجاح!</h3>
                  <a href={downloadUrl} download={`cut-${fileName}`} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700">
                    <Download size={20} /> تنزيل MP3
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="mt-12 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة</h2>
          {faqQuestions.map((item, i) => (
            <details key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-bold text-slate-800">{item.q}</summary>
              <p className="mt-3 text-slate-600">{item.a}</p>
            </details>
          ))}
        </section>
      </div>
    </main>
  );
}