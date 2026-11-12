"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Play, Pause, Scissors, Download, Music, AlertTriangle,
  CheckCircle2, RefreshCw, Volume2, Zap, Layers, Clock, GripVertical,
  Trash2, Eye, FileAudio, Package, Undo2, Redo2, RotateCcw, Save, Home
} from "lucide-react";
import Link from "next/link";
import ContentSections from "./ContentSections";

type Region = { id: string; start: number; end: number; label: string };
type Clip = { id: string; regionId: string; label: string; start: number; end: number; duration: number };

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function SongCutterPage() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeRegionId, setActiveRegionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [normalize, setNormalize] = useState(false);
  const [volume, setVolume] = useState(100);
  const [ringtoneMode, setRingtoneMode] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [zoom, setZoom] = useState(1);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [draggingHandle, setDraggingHandle] = useState<{regionId: string, handle: 'start' | 'end'} | null>(null);
  
  // Clips & Merge State
  const [clips, setClips] = useState<Clip[]>([]);
  const [processingClipId, setProcessingClipId] = useState<string | null>(null);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [multiDownloading, setMultiDownloading] = useState(false);
  
  // Edit Session State (المسودة المستقلة)
  const [editSession, setEditSession] = useState<{clipId: string, draftStart: number, draftEnd: number, handle: 'start'|'end'} | null>(null);
  const [soloClipId, setSoloClipId] = useState<string | null>(null);
  const [soloPlayhead, setSoloPlayhead] = useState<number>(-1);
  
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<any>(null);
  const originalAudioBufferRef = useRef<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soloSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const soloStartTimeRef = useRef<number>(0);
  const soloAnimFrameRef = useRef<number | null>(null);

  // Helper functions
  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00.00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Initialize AudioContext
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => { audioContextRef.current?.close(); };
  }, []);

  // Load FFmpeg
  const loadFFmpeg = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (ffmpegRef.current?.loaded) return;
    try {
      setProcessStep("جاري تحميل محرك المعالجة...");
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err: any) {
      setError("فشل تحميل محرك المعالجة. يرجى تعطيل Ad-blocker.");
    }
  }, []);

  // Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) { setError("الحجم يتجاوز 50 ميجابايت"); return; }
    setError(""); setDownloadUrl(""); setFile(selectedFile); setFileName(selectedFile.name);
    setRegions([]); setClips([]); setActiveRegionId(""); setFfmpegLoaded(false);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  // Audio Loaded Analysis
  const handleAudioLoaded = async () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    setDuration(dur);
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const res = await fetch(audioUrl);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      originalAudioBufferRef.current = audioBuffer;
      
      const rawData = audioBuffer.getChannelData(0);
      const samples = 800; // كثافة الموجة
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) sum += Math.abs(rawData[i * blockSize + j]);
        filteredData.push((sum / blockSize) * 255);
      }
      setWaveformData(filteredData);
      
      const newRegion: Region = { id: Date.now().toString(), start: 0, end: Math.min(30, dur), label: "مقطع 1" };
      setRegions([newRegion]);
      setActiveRegionId(newRegion.id);
      ctx.close();
    } catch (err) { setError("تعذر تحليل الملف"); }
  };

  // Draw Waveform
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || waveformData.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // رسم الموجة (برتقالي)
    const barWidth = Math.max(1, (width / waveformData.length) * zoom);
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * barWidth;
      const barHeight = (waveformData[i] / 255) * height * 0.7;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, "#f97316"); // برتقالي
      gradient.addColorStop(1, "#ea580c");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);
    }

    // رسم المقاطع
    regions.forEach((region) => {
      const startX = (region.start / duration) * width;
      const endX = (region.end / duration) * width;
      const isActive = region.id === activeRegionId;
      
      ctx.fillStyle = isActive ? "rgba(249, 115, 22, 0.2)" : "rgba(148, 163, 184, 0.2)";
      ctx.fillRect(startX, 0, endX - startX, height);
      
      ctx.strokeStyle = isActive ? "#f97316" : "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, 0, endX - startX, height);

      // المقابض
      ctx.fillStyle = isActive ? "#f97316" : "#64748b";
      ctx.beginPath(); ctx.arc(startX, height/2, 8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(endX, height/2, 8, 0, Math.PI*2); ctx.fill();
    });

    // الخط الماشي
    const playX = (currentTime / duration) * width;
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, height); ctx.stroke();
  }, [waveformData, regions, activeRegionId, currentTime, duration, zoom]);

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  // Playback Controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current || duration === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;
    audioRef.current.currentTime = clickTime;
    setCurrentTime(clickTime);
    audioRef.current.play();
    setIsPlaying(true);
  };

  // Region Logic
  const updateRegion = (id: string, field: "start" | "end", value: number) => {
    const clamped = Math.max(0, Math.min(value, duration));
    setRegions(prev => prev.map(r => r.id === id ? { ...r, [field]: clamped } : r));
  };

  // Solo Playback (للاستماع للمقطع أثناء التعديل)
  const stopSolo = useCallback(() => {
    if (soloSourceRef.current) { try { soloSourceRef.current.stop(); } catch {} soloSourceRef.current = null; }
    if (soloAnimFrameRef.current) cancelAnimationFrame(soloAnimFrameRef.current);
    setSoloClipId(null); setSoloPlayhead(-1);
  }, []);

  const playSolo = useCallback((start: number, end: number, clipId: string) => {
    stopSolo();
    if (!originalAudioBufferRef.current) return;
    const ctx = audioContextRef.current!;
    if (ctx.state === "suspended") ctx.resume();
    
    const sampleRate = originalAudioBufferRef.current.sampleRate;
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const length = endSample - startSample;
    if (length <= 0) return;

    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    const originalData = originalAudioBufferRef.current.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = originalData[startSample + i] || 0;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    soloSourceRef.current = source;
    soloStartTimeRef.current = ctx.currentTime;
    setSoloClipId(clipId);
    setSoloPlayhead(0);

    const update = () => {
      const elapsed = ctx.currentTime - soloStartTimeRef.current;
      if (elapsed >= (end - start)) { stopSolo(); return; }
      setSoloPlayhead(elapsed);
      soloAnimFrameRef.current = requestAnimationFrame(update);
    };
    update();
    source.onended = () => stopSolo();
  }, [stopSolo]);

  // Add Clip (القص والإضافة)
  const addClip = async (region: Region) => {
    if (!file) return;
    setIsProcessing(true);
    setProcessStep(`جاري قص ${region.label}...`);
    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      const ext = (file.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "input" + ext;
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const clipDuration = region.end - region.start;
      const outName = "out.mp3";
      let args = ["-i", inputName, "-ss", region.start.toString(), "-t", clipDuration.toString(), "-c:a", "libmp3lame", "-q:a", "2"];
      
      let filters = [];
      if (fadeIn) filters.push(`afade=t=in:st=0:d=2`);
      if (fadeOut && clipDuration > 4) filters.push(`afade=t=out:st=${Math.max(0, clipDuration - 2)}:d=2`);
      if (volume !== 100) filters.push(`volume=${volume / 100}`);
      if (normalize) filters.push(`loudnorm=I=-16:TP=-1.5:LRA=11`);
      if (filters.length > 0) args.push("-af", filters.join(","));
      args.push("-y", outName);

      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outName);
      const blob = new Blob([data as any], { type: "audio/mp3" });
      
      const newClip: Clip = {
        id: Date.now().toString() + Math.random(),
        regionId: region.id,
        label: region.label,
        start: region.start,
        end: region.end,
        duration: region.end - region.start
      };
      
      setClips(prev => [...prev, newClip]);
      showToast('success', `تم إضافة ${region.label}`);
      
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outName).catch(() => {});
    } catch (err: any) {
      showToast('error', 'فشل القص');
    } finally { setIsProcessing(false); }
  };

  // Confirm Edit
  const confirmEdit = () => {
    if (!editSession) return;
    const newClips = clips.map(c => {
      if (c.id === editSession.clipId) {
        return { ...c, start: editSession.draftStart, end: editSession.draftEnd, duration: editSession.draftEnd - editSession.draftStart };
      }
      return c;
    });
    setClips(newClips);
    setEditSession(null);
    stopSolo();
    showToast('success', 'تم تطبيق التعديل');
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-5 py-3 shadow-lg font-bold text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <header className="bg-orange-500 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Scissors size={28} />
          <h1 className="text-2xl font-bold">قص الاغاني أونلاين</h1>
        </div>
        <Link href="/" className="hover:bg-orange-600 p-2 rounded-lg transition"><Home size={24} /></Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        
        {/* Upload Area */}
        {!file && (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 transition">
            <Upload size={48} className="mx-auto text-orange-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">اسحب ملف MP3 هنا أو اختره من جهازك</h2>
            <p className="text-slate-500 mb-6 text-sm">الحد الأقصى 50 ميجابايت</p>
            <label className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-orange-600 transition shadow-lg">
              اختيار ملف
              <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {file && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <audio ref={audioRef} src={audioUrl} onLoadedMetadata={handleAudioLoaded} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onEnded={() => setIsPlaying(false)} className="hidden" />
            
            {/* Waveform Area */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 shadow-md">
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="font-mono text-sm bg-slate-100 px-3 py-1 rounded">{formatTime(currentTime)}</div>
                <div className="text-sm text-slate-500 truncate flex-1">{fileName}</div>
              </div>
              
              <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-32 cursor-pointer rounded-lg" />

              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-mono bg-orange-50 text-orange-700 px-2 py-1 rounded">{formatTime(regions[0]?.start || 0)}</span>
                <span className="text-sm font-mono bg-orange-50 text-orange-700 px-2 py-1 rounded">{formatTime(regions[0]?.end || 0)}</span>
              </div>
            </div>

            {/* Actions Area */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap gap-3 justify-center">
              <button onClick={() => setEditSession({ clipId: "temp", draftStart: regions[0].start, draftEnd: regions[0].end, handle: 'start' })} className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 shadow-sm">
                <RotateCcw size={18} /> تعديل البداية
              </button>
              <button onClick={() => setEditSession({ clipId: "temp", draftStart: regions[0].start, draftEnd: regions[0].end, handle: 'end' })} className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 shadow-sm">
                <RotateCcw size={18} /> تعديل النهاية
              </button>
              <button onClick={() => addClip(regions[0])} disabled={isProcessing} className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 shadow-md">
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Scissors size={18} />} قص وإضافة للدمج
              </button>
            </div>
          </div>
        )}

        {/* Clips List (منطقة الدمج) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2"><Music size={20} /> مقاطعك المحفوظة</h2>
            <span className="text-sm bg-orange-600 px-2 py-1 rounded">{clips.length} مقاطع</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {clips.length === 0 ? (
              <div className="p-8 text-center text-slate-400">لم تقم بقص أي مقاطع بعد</div>
            ) : (
              clips.map((clip, idx) => (
                <div key={clip.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{clip.label}</h4>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1"><Clock size={12}/> المدة: {formatTime(clip.duration)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => playSolo(clip.start, clip.end, clip.id)} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900"><Play size={16}/></button>
                    <button onClick={() => setEditSession({ clipId: clip.id, draftStart: clip.start, draftEnd: clip.end, handle: 'start' })} className="p-2 text-slate-400 hover:text-orange-500"><Scissors size={18}/></button>
                    <button className="p-2 text-slate-400 hover:text-blue-500"><Download size={18}/></button>
                    <button onClick={() => setClips(clips.filter(c => c.id !== clip.id))} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {clips.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-md w-full md:w-auto">دمج المقاطع وتنزيلها</button>
            </div>
          )}
        </div>
      </div>
      
      <ContentSections />
    </main>
  );
}