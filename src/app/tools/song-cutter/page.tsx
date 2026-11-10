"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Upload, Play, Pause, Scissors, Download, Music, AlertTriangle, CheckCircle2, RefreshCw, Volume2, Zap, Layers } from "lucide-react";

type Region = {
  id: string;
  start: number;
  end: number;
  label: string;
};

const faqQuestions = [
  { q: "كيف يمكن قص الأغاني أونلاين؟", a: "افتح أداة قص الأغاني، وارفع الملف الصوتي، ثم حدد نقطة البداية والنهاية من الموجة الصوتية. استمع إلى المقطع، وبعد التأكد من النتيجة قم بتصديره وحفظه." },
  { q: "كيف أقص أغنية بصيغة MP3؟", a: "ارفع ملف MP3 إلى الأداة، وحدد الجزء الذي تريد الاحتفاظ به، ثم عاين المقطع واختر تصدير الملف بالصيغ المتاحة." },
  { q: "هل يمكن قص الأغاني مجانًا؟", a: "نعم، يمكنك استخدام أداة قص الأغاني من Intooly مجانًا وفق حدود حجم الملف (حتى 50 ميجابايت) ومدة المعالجة." },
  { q: "هل يمكن قص الأغاني من الهاتف؟", a: "نعم، يمكن استخدام الأداة من متصفح الهاتف لرفع الملفات الصوتية وتحديد المقاطع ومعاينتها وحفظها." },
  { q: "كيف أحول جزءًا من أغنية إلى نغمة رنين؟", a: "ارفع الأغنية، وحدد الجزء الذي تريد استخدامه كنغمة رنين (يفضل 30 ثانية)، ثم فعّل وضع نغمة الرنين لإضافة التلاشي التدريجي واحفظه بصيغة MP3." },
  { q: "هل يؤثر قص الأغنية على جودة الصوت؟", a: "لا يؤدي تحديد جزء من الملف بالضرورة إلى تقليل الجودة، لكن إعادة ترميز الصوت بصيغة مضغوطة مثل MP3 قد تسبب فقدًا طفيفًا." },
  { q: "ما صيغ الملفات التي يمكن قصها؟", a: "تعتمد الصيغ المدعومة على المتصفح. من الصيغ الشائعة MP3 وWAV وM4A وAAC وOGG وFLAC." },
  { q: "هل يمكن قص أكثر من مقطع من الأغنية نفسها؟", a: "نعم، يمكن إضافة عدة مقاطع واستخراجها كملفات منفصلة أو دمجها في ملف واحد." },
  { q: "هل يمكن دمج مقطعين صوتيين بعد القص؟", a: "نعم، يمكن إضافة وظيفة دمج المقاطع الصوتية، بحيث يحدد المستخدم ترتيب الأجزاء ويستمع إلى النتيجة." },
  { q: "هل يمكن قص الأغاني دون رفعها إلى الإنترنت؟", a: "نعم، تتم معالجة الملفات داخل المتصفح مباشرة دون إرسالها إلى أي خادم." }
];

export default function SongCutterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [volume, setVolume] = useState(100);
  const [ringtoneMode, setRingtoneMode] = useState(false);
  const [mergeClips, setMergeClips] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [zoom, setZoom] = useState(1);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<any>(null);

  // Load FFmpeg
  const loadFFmpeg = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (ffmpegRef.current && ffmpegLoaded) return;

    try {
      setProcessStep("جاري تحميل محرك المعالجة...");
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      
      const ffmpeg = new FFmpeg();
      
      // تحميل من CDN موثوق
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      console.log("FFmpeg loaded successfully");
    } catch (err: any) {
      console.error("FFmpeg load error:", err);
      throw new Error("فشل تحميل محرك المعالجة. يرجى تعطيل مانع الإعلانات (Ad-blocker) وتحديث الصفحة. الخطأ: " + err.message);
    }
  }, [ffmpegLoaded]);

  // Draw waveform
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || waveformData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = Math.max(2, (width / waveformData.length) * zoom);
    const gap = 1;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < waveformData.length; i++) {
      const x = i * (barWidth + gap);
      if (x > width) break;
      
      const barHeight = (waveformData[i] / 255) * height * 0.8;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, "#f97316");
      gradient.addColorStop(1, "#c2410c");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    }

    regions.forEach((region) => {
      const startX = (region.start / duration) * width;
      const endX = (region.end / duration) * width;
      const isActive = region.id === activeRegionId;
      
      ctx.fillStyle = isActive ? "rgba(249, 115, 22, 0.3)" : "rgba(148, 163, 184, 0.3)";
      ctx.fillRect(startX, 0, endX - startX, height);
      
      ctx.strokeStyle = isActive ? "#f97316" : "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, 0, endX - startX, height);
    });

    if (duration > 0) {
      const currentX = (currentTime / duration) * width;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
  }, [waveformData, regions, activeRegionId, currentTime, duration, zoom]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("حجم الملف يتجاوز 50 ميجابايت. يرجى اختيار ملف أصغر.");
      return;
    }

    setError("");
    setDownloadUrl("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setRegions([]);
    setActiveRegionId("");
    setFfmpegLoaded(false);
    
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  const handleAudioLoaded = async () => {
    if (!audioRef.current) return;
    
    const dur = audioRef.current.duration;
    setDuration(dur);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[i * blockSize + j]);
        }
        filteredData.push((sum / blockSize) * 255);
      }
      
      setWaveformData(filteredData);
      
      const regionEnd = Math.min(30, dur);
      const newRegion: Region = {
        id: Date.now().toString(),
        start: 0,
        end: regionEnd,
        label: `مقطع 1`,
      };
      setRegions([newRegion]);
      setActiveRegionId(newRegion.id);
      
      audioContext.close();
    } catch (err) {
      console.error("Audio analysis error:", err);
      setError("تعذر تحليل الملف الصوتي. يرجى التأكد من أنه ملف صالح.");
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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

  const playRegion = (region: Region) => {
    if (audioRef.current) {
      audioRef.current.currentTime = region.start;
      audioRef.current.play();
      setIsPlaying(true);
      
      const checkEnd = () => {
        if (audioRef.current && audioRef.current.currentTime >= region.end) {
          audioRef.current.pause();
          setIsPlaying(false);
          audioRef.current.removeEventListener("timeupdate", checkEnd);
        }
      };
      
      audioRef.current.addEventListener("timeupdate", checkEnd);
    }
  };

  const addRegion = () => {
    const newRegion: Region = {
      id: Date.now().toString(),
      start: currentTime,
      end: Math.min(currentTime + 10, duration),
      label: `مقطع ${regions.length + 1}`,
    };
    setRegions([...regions, newRegion]);
    setActiveRegionId(newRegion.id);
  };

  const removeRegion = (id: string) => {
    setRegions(regions.filter(r => r.id !== id));
    if (activeRegionId === id) {
      setActiveRegionId(regions[0]?.id || "");
    }
  };

  const updateRegion = (id: string, field: "start" | "end", value: number) => {
    setRegions(regions.map(r => 
      r.id === id ? { ...r, [field]: Math.max(0, Math.min(value, duration)) } : r
    ));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00.0";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms}`;
  };

  const cutAudio = async () => {
    if (regions.length === 0) {
      setError("يرجى إضافة مقطع واحد على الأقل");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");

      const ext = file!.name.substring(file!.name.lastIndexOf(".")) || ".mp3";
      const inputName = "input" + ext;

      setProcessStep("جاري قراءة الملف...");
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file!));

      if (mergeClips && regions.length > 1) {
        setProcessStep("جاري دمج المقاطع...");
        const outputFiles: string[] = [];
        
        for (let i = 0; i < regions.length; i++) {
          const region = regions[i];
          const tempOutput = `temp${i}.mp3`;
          const clipDuration = region.end - region.start;
          
          await ffmpeg.exec([
            "-i", inputName,
            "-ss", region.start.toString(),
            "-t", clipDuration.toString(),
            "-c:a", "libmp3lame",
            "-q:a", "2",
            "-y",
            tempOutput
          ]);
          outputFiles.push(tempOutput);
        }

        const concatContent = outputFiles.map(f => `file '${f}'`).join("\n");
        await ffmpeg.writeFile("concat.txt", concatContent);

        await ffmpeg.exec([
          "-f", "concat",
          "-safe", "0",
          "-i", "concat.txt",
          "-c:a", "libmp3lame",
          "-q:a", "2",
          "-y",
          "output.mp3"
        ]);
      } else {
        setProcessStep("جاري معالجة الصوت...");
        const region = regions[0];
        const clipDuration = region.end - region.start;
        
        const args = [
          "-i", inputName,
          "-ss", region.start.toString(),
          "-t", clipDuration.toString(),
          "-c:a", "libmp3lame",
          "-q:a", "2",
        ];

        // إضافة الفلاتر
        const filters: string[] = [];
        if (fadeIn) filters.push(`afade=t=in:st=0:d=2`);
        if (fadeOut && clipDuration > 4) filters.push(`afade=t=out:st=${clipDuration - 2}:d=2`);
        if (volume !== 100) filters.push(`volume=${volume / 100}`);

        if (filters.length > 0) {
          args.push("-af", filters.join(","));
        }

        args.push("-y", "output.mp3");

        console.log("FFmpeg args:", args);
        await ffmpeg.exec(args);
      }

      setProcessStep("جاري تحضير الملف...");
      const data = await ffmpeg.readFile("output.mp3");
      
      // تحويل صحيح للبيانات
      const uint8Array = new Uint8Array(data.buffer);
      const blob = new Blob([uint8Array], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProcessStep("تم بنجاح!");

    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "حدث خطأ أثناء المعالجة. يرجى تجربة ملف آخر.");
    } finally {
      setIsProcessing(false);
    }
  };

  const enableRingtoneMode = () => {
    setRingtoneMode(true);
    setFadeOut(true);
    if (regions.length > 0) {
      const newEnd = Math.min(regions[0].start + 30, duration);
      updateRegion(regions[0].id, "end", newEnd);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [audioUrl, downloadUrl]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            قص الأغاني أونلاين مجانًا – قص ملفات MP3 وتقطيع الصوت بسهولة
          </h1>
          <p className="mt-4 text-slate-600">
            أداة متكاملة لقص الأغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية ودمج المقاطع والتحكم في الصوت
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
              <Upload size={48} className="mb-4 text-slate-400" />
              <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملف الصوت للبدء</h3>
              <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, AAC, OGG, FLAC (الحد الأقصى 50 ميجابايت)</p>
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
                <button onClick={() => { setFile(null); setAudioUrl(""); setError(""); setRegions([]); setFfmpegLoaded(false); }} className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
                  <RefreshCw size={14} /> إزالة
                </button>
              </div>

              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onLoadedMetadata={handleAudioLoaded}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <canvas 
                  ref={canvasRef} 
                  width={1200} 
                  height={200}
                  className="w-full h-48 rounded-lg bg-white cursor-crosshair"
                />
                
                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                  <button 
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg">
                      تصغير
                    </button>
                    <span className="text-xs text-slate-500">تكبير: {zoom}x</span>
                    <button onClick={() => setZoom(Math.min(3, zoom + 0.5))} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg">
                      تكبير
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={20} /> المقاطع ({regions.length})
                  </h3>
                  <button onClick={addRegion} className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 font-semibold">
                    + إضافة مقطع
                  </button>
                </div>

                {regions.map((region) => (
                  <div key={region.id} className={`rounded-lg border p-3 ${region.id === activeRegionId ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setActiveRegionId(region.id)} className="font-semibold text-slate-900">
                        {region.label}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => playRegion(region)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                          <Play size={12} className="inline" /> معاينة
                        </button>
                        <button onClick={() => removeRegion(region.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-600">البداية (ثانية)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={region.start.toFixed(1)}
                          onChange={(e) => updateRegion(region.id, "start", parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">النهاية (ثانية)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={region.end.toFixed(1)}
                          onChange={(e) => updateRegion(region.id, "end", parseFloat(e.target.value) || duration)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">المدة: {formatTime(region.end - region.start)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={20} /> خيارات متقدمة
                </h3>
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="rounded" />
                    <span className="text-sm">تلاشي تدريجي في البداية (Fade In)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="rounded" />
                    <span className="text-sm">تلاشي تدريجي في النهاية (Fade Out)</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mergeClips} onChange={(e) => setMergeClips(e.target.checked)} className="rounded" />
                    <span className="text-sm">دمج المقاطع في ملف واحد</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={ringtoneMode} onChange={(e) => setRingtoneMode(e.target.checked)} className="rounded" />
                    <span className="text-sm">وضع نغمة الرنين (30 ثانية)</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Volume2 size={16} /> مستوى الصوت: {volume}%
                  </label>
                  <input 
                    type="range" 
                    min={0} 
                    max={200} 
                    value={volume} 
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {ringtoneMode && (
                  <button onClick={enableRingtoneMode} className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 font-semibold">
                    تطبيق إعدادات نغمة الرنين
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={cutAudio}
                  disabled={isProcessing || regions.length === 0}
                  className="flex-1 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? <span className="animate-pulse">{processStep}</span> : <><Scissors size={20} /> قص وتنزيل</>}
                </button>
              </div>

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

        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">قص الأغاني أونلاين مجانًا – قص ملفات MP3 وتقطيع الصوت بسهولة</h2>
            <p className="mt-3 leading-8 text-slate-600">هل تريد قص الأغاني أو استخراج مقطع معين من أغنية طويلة؟ مع أداة <strong>قص الأغاني من Intooly</strong> يمكنك تحديد الجزء الذي تريده من الملف الصوتي بدقة، والاستماع إليه قبل حفظه، وإنشاء نغمات رنين للهاتف، وتقطيع ملفات MP3 وغيرها من الصيغ الصوتية المدعومة بسهولة.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة قص الأغاني أونلاين؟</h2>
            <p className="mt-3 leading-8 text-slate-600">أداة قص الأغاني هي أداة مجانية عبر الإنترنت تتيح لك تحديد جزء معين من الملف الصوتي وحفظه كملف مستقل، بدلًا من الاحتفاظ بالتسجيل كاملًا.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية قص الأغاني باستخدام Intooly</h2>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>افتح أداة قص الأغاني من Intooly.</li>
              <li>اضغط على زر رفع ملف صوتي أو اسحب الملف إلى منطقة الرفع.</li>
              <li>انتظر حتى تتم معالجة الملف وعرض الموجة الصوتية.</li>
              <li>حدد نقطة بداية المقطع الذي تريد الاحتفاظ به.</li>
              <li>حدد نقطة نهاية المقطع باستخدام مقابض التحديد.</li>
              <li>استمع إلى الجزء المحدد للتأكد من النتيجة.</li>
              <li>عدّل نقاط البداية والنهاية إذا احتجت إلى ذلك.</li>
              <li>اختر صيغة التصدير المتاحة.</li>
              <li>اضغط على زر قص الأغنية وتنزيل المقطع.</li>
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
                <span className="text-sm text-slate-600">تحويل التسجيلات الصوتية إلى نصوص</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول قص الأغاني</h2>
            <div className="mt-4 space-y-4">
              {faqQuestions.map((item, i) => (
                <details key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer font-bold text-slate-800">{item.q}</summary>
                  <p className="mt-3 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}