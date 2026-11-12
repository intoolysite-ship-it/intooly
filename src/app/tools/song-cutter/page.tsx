"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload, Play, Pause, Scissors, Download, Music, AlertTriangle,
  CheckCircle2, RefreshCw, Volume2, Zap, Layers, Clock, GripVertical,
  Trash2, Eye, FileAudio, Package, Info, Undo2, Redo2, Sparkles,
} from "lucide-react";
import ContentSections from "./ContentSections";

type Region = { id: string; start: number; end: number; label: string };
type Clip = { id: string; regionId: string; label: string; start: number; end: number; duration: number };
type HistoryItem = { clips: Clip[]; regions: Region[] };

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const STORAGE_KEY = "intooly-song-cutter-v2";

export default function SongCutterPage() {
  // ============ State الأساسي ============
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
  const [ffmpegProgress, setFfmpegProgress] = useState(0);
  const [draggingHandle, setDraggingHandle] = useState<{regionId: string, handle: 'start' | 'end'} | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [processingClipId, setProcessingClipId] = useState<string | null>(null);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [isMergedPlaying, setIsMergedPlaying] = useState(false);
  const [mergedCurrentTime, setMergedCurrentTime] = useState(0);
  const [mergedWaveformData, setMergedWaveformData] = useState<number[]>([]);
  const [mergedDuration, setMergedDuration] = useState(0);
  const [multiDownloading, setMultiDownloading] = useState(false);
  // 🆕 حالة تحرير المقاطع في الموجة المدمجة
  const [editingClip, setEditingClip] = useState<{clipId: string, handle: 'start' | 'end'} | null>(null);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'info', msg: string} | null>(null);
  // 🆕 تخزين Blobs المقصوصة (clipId -> Blob)
  const [clippedBlobs, setClippedBlobs] = useState<Map<string, Blob>>(new Map());
  // 🆕 حالة السحب النشط مع تلميح
  const [dragHint, setDragHint] = useState<{clipLabel: string, handle: 'start'|'end', newTime: number, duration: number} | null>(null);
  // 🆕 المقبض النشط للتعديل (يُختار بالضغط أولاً)
  const [armedHandle, setArmedHandle] = useState<{clipId: string, handle: 'start' | 'end'} | null>(null);
  // 🆕 Playhead حي للموجة المدمجة
  const [mergedPlayheadRef] = useState<{current: number}>({current: 0});
  // 🆕 تشغيل مقطع منفرد للتعديل
  const [soloClipPlayhead, setSoloClipPlayhead] = useState<number>(-1);
  const soloSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const soloStartTimeRef = useRef<number>(0);
  const soloAnimFrameRef = useRef<number | null>(null);
  const [soloClipId, setSoloClipId] = useState<string | null>(null);
  // 🆕 وضع التحرير المستقل (مسودة)
  const [editSession, setEditSession] = useState<{
    clipId: string;
    draftStart: number;
    draftEnd: number;
  } | null>(null);

  // 🆕 إشعار مؤقت
  const showToast = useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ============ Undo/Redo ============
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ============ Refs ============
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mergedCanvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<any>(null);
  const originalAudioBufferRef = useRef<AudioBuffer | null>(null);
  const mergedAudioBufferRef = useRef<AudioBuffer | null>(null);
  const mergedSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const mergedAudioContextRef = useRef<AudioContext | null>(null);
  const mergedStartTimeRef = useRef<number>(0);
  const mergedAnimFrameRef = useRef<number | null>(null);

  // ============ AudioContext للمعاينة المدمجة ============
  useEffect(() => {
    if (typeof window !== "undefined" && !mergedAudioContextRef.current) {
      mergedAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      mergedAudioContextRef.current?.close();
    };
  }, []);

  // ============ Undo/Redo Helper ============
  const pushHistory = useCallback((newClips: Clip[], newRegions: Region[]) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, { clips: newClips, regions: newRegions }].slice(-20);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const item = history[historyIndex - 1];
    setClips(item.clips);
    setRegions(item.regions);
    setHistoryIndex(historyIndex - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const item = history[historyIndex + 1];
    setClips(item.clips);
    setRegions(item.regions);
    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex]);

  // ============ تحميل FFmpeg ============
  const loadFFmpeg = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (ffmpegRef.current?.loaded) return;
    try {
      setProcessStep("جاري تحميل محرك المعالجة...");
      setFfmpegProgress(20);
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();

      setFfmpegProgress(40);
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setFfmpegProgress(100);
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
    } catch (err: any) {
      console.error("FFmpeg load error:", err);
      setError("فشل تحميل محرك المعالجة. يرجى تعطيل Ad-blocker أو استخدام Chrome/Edge.");
      setFfmpegProgress(0);
    }
  }, []);

  // ============ Utility ============
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00.00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const minutes = parseFloat(parts[0]) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseFloat(timeStr) || 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ============ اختصارات لوحة المفاتيح ============
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && audioRef.current) {
        e.preventDefault();
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
      }
      if (e.code === "ArrowRight" && audioRef.current) {
        e.preventDefault();
        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
      }
      if (e.code === "ArrowLeft" && audioRef.current) {
        e.preventDefault();
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [duration, isPlaying, undo, redo]);

  // ============ حفظ تلقائي ============
  useEffect(() => {
    try {
      if (clips.length > 0 && fileName) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ fileName, clips, savedAt: Date.now() }));
      }
    } catch {}
  }, [clips, fileName]);


  // ============ رفع الملف ============
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("حجم الملف يتجاوز 50 ميجابايت.");
      return;
    }
    setError("");
    setDownloadUrl("");
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setRegions([]);
    setActiveRegionId("");
    setFfmpegLoaded(false);
    setFfmpegProgress(0);
    setClips([]);
    setMergedWaveformData([]);
    setMergedDuration(0);
    setHistory([]);
    setHistoryIndex(-1);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  // ============ تحليل الملف عند التحميل ============
  const handleAudioLoaded = async () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    setDuration(dur);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      originalAudioBufferRef.current = audioBuffer;
      const rawData = audioBuffer.getChannelData(0);
      const samples = 500;
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
        label: "مقطع 1",
      };
      setRegions([newRegion]);
      setActiveRegionId(newRegion.id);
      audioContext.close();
    } catch (err) {
      console.error("Audio analysis error:", err);
      setError("تعذر تحليل الملف الصوتي.");
    }
  };

  // ============ رسم الموجة الأساسية ============
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
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
    const barWidth = Math.max(1, (width / waveformData.length) * zoom);
    const gap = 1;
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * (barWidth + gap);
      if (x > width) break;
      const barHeight = (waveformData[i] / 255) * height * 0.8;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, "#f97316");
      gradient.addColorStop(1, "#c2410c");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, Math.max(1, barWidth), barHeight);
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
      const handleWidth = 8;
      const handleHeight = 40;
      const handleY = (height - handleHeight) / 2;
      ctx.fillStyle = isActive ? "#f97316" : "#64748b";
      ctx.fillRect(startX - handleWidth / 2, handleY, handleWidth, handleHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(startX - 1, handleY + 10, 2, 20);
      ctx.fillStyle = isActive ? "#f97316" : "#64748b";
      ctx.fillRect(endX - handleWidth / 2, handleY, handleWidth, handleHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(endX - 1, handleY + 10, 2, 20);
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

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  // ============ رسم الموجة المدمجة (مع المقابض) ============
  const drawMergedWaveform = useCallback(() => {
    if (!mergedCanvasRef.current || mergedWaveformData.length === 0) return;
    const canvas = mergedCanvasRef.current;
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
    ctx.fillStyle = "#f0f9ff";
    ctx.fillRect(0, 0, width, height);
    const barWidth = Math.max(1, width / mergedWaveformData.length);
    const gap = 1;
    let currentSample = 0;
    const colors = [
      { start: "#6366f1", end: "#4f46e5" },
      { start: "#8b5cf6", end: "#7c3aed" },
      { start: "#ec4899", end: "#db2777" },
      { start: "#f59e0b", end: "#d97706" },
      { start: "#10b981", end: "#059669" },
      { start: "#06b6d4", end: "#0891b2" },
    ];
    clips.forEach((clip, clipIndex) => {
      const clipSamples = Math.floor((clip.duration / mergedDuration) * mergedWaveformData.length);
      const color = colors[clipIndex % colors.length];
      for (let i = 0; i < clipSamples && currentSample < mergedWaveformData.length; i++) {
        const x = currentSample * (barWidth + gap);
        if (x > width) break;
        const barHeight = (mergedWaveformData[currentSample] / 255) * height * 0.8;
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, Math.max(1, barWidth), barHeight);
        currentSample++;
      }
      if (clipIndex < clips.length - 1) {
        const separatorX = (currentSample / mergedWaveformData.length) * width;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(separatorX, 0);
        ctx.lineTo(separatorX, height);
        ctx.stroke();
      }
    });
    // 🆕 ترقيم كل مقطع + رسم مقابض المقطع النشط
    let clipStartInMerged = 0;
    clips.forEach((clip, idx) => {
      const startX = (clipStartInMerged / mergedDuration) * width;
      const endX = ((clipStartInMerged + clip.duration) / mergedDuration) * width;
      const clipWidth = endX - startX;
      clipStartInMerged += clip.duration;

      // 🆕 رقم المقطع في المنتصف العلوي
      if (clipWidth > 14) {
        const badgeSize = Math.min(22, clipWidth - 4);
        const badgeX = startX + clipWidth / 2 - badgeSize / 2;
        const badgeY = 4;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.floor(badgeSize * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(idx + 1), badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);
      }

      // 🆕 عرض المسودة أثناء جلسة التعديل
      const isInEditSession = editSession?.clipId === clip.id;
      if (isInEditSession) {
        // المقطع الأصلي (باهت) — يبقى مكانه في الموجة المدمجة
        ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
        ctx.fillRect(startX, 0, endX - startX, height);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(startX, 0, endX - startX, height);
        ctx.setLineDash([]);

        // نطاق المسودة (شفاف فوقه) — يوضح ما سيكون عليه المقطع
        // نحسب موضع المسودة داخل الموجة المدمجة بناءً على بداية المقطع الأصلي
        const draftStartRel = (editSession.draftStart - clip.start) / clip.duration;
        const draftEndRel = (editSession.draftEnd - clip.start) / clip.duration;
        const draftStartX = startX + draftStartRel * (endX - startX);
        const draftEndX = startX + draftEndRel * (endX - startX);

        // تظليل المنطقة المحذوفة من البداية (أحمر شفاف)
        if (draftStartRel > 0) {
          ctx.fillStyle = "rgba(220, 38, 38, 0.25)";
          ctx.fillRect(startX, 0, draftStartX - startX, height);
        }
        // تظليل المنطقة المحذوفة من النهاية (أزرق شفاف)
        if (draftEndRel < 1) {
          ctx.fillStyle = "rgba(37, 99, 235, 0.25)";
          ctx.fillRect(draftEndX, 0, endX - draftEndX, height);
        }

        // الإطار الأخضر للمسودة النهائية
        ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
        ctx.fillRect(draftStartX, 0, draftEndX - draftStartX, height);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 3;
        ctx.strokeRect(draftStartX, 0, draftEndX - draftStartX, height);

        // مقابض المسودة
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(draftStartX - 6, 0, 12, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(draftStartX - 1, height / 2 - 15, 2, 30);

        ctx.fillStyle = "#2563eb";
        ctx.fillRect(draftEndX - 6, 0, 12, height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(draftEndX - 1, height / 2 - 15, 2, 30);
      } else {
        // مقابض المقطع النشط (خارج جلسة التعديل)
        const activeId = editingClip?.clipId || hoveredClipId || armedHandle?.clipId;
        if (clip.id === activeId) {
          ctx.fillStyle = "rgba(249, 115, 22, 0.2)";
          ctx.fillRect(startX, 0, endX - startX, height);

          const isStartArmed = armedHandle?.clipId === clip.id && armedHandle.handle === 'start';
          const isEndArmed = armedHandle?.clipId === clip.id && armedHandle.handle === 'end';

          ctx.fillStyle = isStartArmed ? "#dc2626" : "#f97316";
          ctx.fillRect(startX - 6, 0, 12, height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(startX - 1, height / 2 - 15, 2, 30);

          ctx.fillStyle = isEndArmed ? "#2563eb" : "#f97316";
          ctx.fillRect(endX - 6, 0, 12, height);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(endX - 1, height / 2 - 15, 2, 30);
        }
      }
    });

    // 🆕 Playhead أسود يتحرك مع المقطع المنفرد (أثناء التعديل)
    if (soloClipPlayhead >= 0 && soloClipId) {
      const clipIndex = clips.findIndex(c => c.id === soloClipId);
      if (clipIndex !== -1) {
        let clipStartInMerged = 0;
        for (let i = 0; i < clipIndex; i++) {
          clipStartInMerged += clips[i].duration;
        }
        const playX = ((clipStartInMerged + soloClipPlayhead) / mergedDuration) * width;
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(playX, 0);
        ctx.lineTo(playX, height);
        ctx.stroke();
        // رأس المؤشر (سهم أسود)
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.moveTo(playX - 5, 0);
        ctx.lineTo(playX + 5, 0);
        ctx.lineTo(playX, 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 🆕 Playhead أحمر يتحرك مع الدمج الكلي (عند تشغيل الكل)
    if (mergedDuration > 0 && mergedCurrentTime >= 0 && !soloClipId) {
      const playX = (mergedCurrentTime / mergedDuration) * width;
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(playX, 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (mergedDuration > 0 && mergedCurrentTime > 0) {
      const currentX = (mergedCurrentTime / mergedDuration) * width;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
  }, [mergedWaveformData, mergedDuration, mergedCurrentTime, clips, hoveredClipId, editingClip, armedHandle, soloClipPlayhead, soloClipId, editSession]);

  useEffect(() => { drawMergedWaveform(); }, [drawMergedWaveform]);

  // ============ حساب الموجة المدمجة ============
  const updateMergedWaveform = useCallback(() => {
    if (!originalAudioBufferRef.current || clips.length === 0) {
      setMergedWaveformData([]);
      setMergedDuration(0);
      return;
    }
    const audioBuffer = originalAudioBufferRef.current;
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
    setMergedDuration(totalDuration);
    const samplesPerClip = 200;
    const mergedData: number[] = [];
    clips.forEach((clip) => {
      const startSample = Math.floor(clip.start * sampleRate);
      const endSample = Math.floor(clip.end * sampleRate);
      const clipLength = endSample - startSample;
      const blockSize = Math.floor(clipLength / samplesPerClip);
      for (let i = 0; i < samplesPerClip; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          const idx = startSample + i * blockSize + j;
          if (idx < rawData.length) sum += Math.abs(rawData[idx]);
        }
        mergedData.push((sum / blockSize) * 255);
      }
    });
    setMergedWaveformData(mergedData);
  }, [clips]);

  useEffect(() => { updateMergedWaveform(); }, [updateMergedWaveform]);

  // ============ التحكم في التشغيل ============
  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
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

  // ============ إدارة المقاطع ============
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
    const newRegions = regions.filter(r => r.id !== id);
    const newClips = clips.filter(c => c.regionId !== id);
    setRegions(newRegions);
    setClips(newClips);
    if (activeRegionId === id) setActiveRegionId(newRegions[0]?.id || "");
    pushHistory(newClips, newRegions);
  };

  const updateRegion = (id: string, field: "start" | "end", value: number) => {
    const clamped = Math.max(0, Math.min(value, duration));
    const newRegions = regions.map(r => r.id === id ? { ...r, [field]: clamped } : r);
    setRegions(newRegions);
    setClips(prev => prev.map(c => {
      if (c.regionId !== id) return c;
      const r = newRegions.find(r => r.id === id);
      if (!r) return c;
      return { ...c, start: r.start, end: r.end, duration: r.end - r.start };
    }));
  };

  // ============ تفاعل الموجة ============
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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || regions.length === 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;
    const activeRegion = regions.find(r => r.id === activeRegionId);
    if (activeRegion) {
      const startX = (activeRegion.start / duration) * rect.width;
      const endX = (activeRegion.end / duration) * rect.width;
      if (Math.abs(x - startX) < 10) { setDraggingHandle({ regionId: activeRegion.id, handle: 'start' }); return; }
      if (Math.abs(x - endX) < 10) { setDraggingHandle({ regionId: activeRegion.id, handle: 'end' }); return; }
    }
    const clickedRegion = regions.find(r => clickTime >= r.start && clickTime <= r.end);
    if (clickedRegion) {
      setActiveRegionId(clickedRegion.id);
      const distToStart = Math.abs(clickTime - clickedRegion.start);
      const distToEnd = Math.abs(clickTime - clickedRegion.end);
      if (distToStart < 2) setDraggingHandle({ regionId: clickedRegion.id, handle: 'start' });
      else if (distToEnd < 2) setDraggingHandle({ regionId: clickedRegion.id, handle: 'end' });
      else if (audioRef.current) { audioRef.current.currentTime = clickTime; setCurrentTime(clickTime); audioRef.current.play(); setIsPlaying(true); }
    } else if (audioRef.current) { audioRef.current.currentTime = clickTime; setCurrentTime(clickTime); audioRef.current.play(); setIsPlaying(true); }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingHandle || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const time = (x / rect.width) * duration;
    const region = regions.find(r => r.id === draggingHandle.regionId);
    if (!region) return;
    if (draggingHandle.handle === 'start') updateRegion(region.id, 'start', Math.min(time, region.end - 0.1));
    else updateRegion(region.id, 'end', Math.max(time, region.start + 0.1));
  };

  const handleCanvasMouseUp = () => { setDraggingHandle(null); };

  // ============ 🆕 قص المقطع وإضافته فوراً للدمج ============
  const saveClip = async (region: Region) => {
    if (clips.find(c => c.regionId === region.id)) {
      showToast('info', 'هذا المقطع موجود بالفعل في منطقة الدمج');
      return;
    }
    if (!file) return;
    if (region.end - region.start < 0.1) {
      showToast('error', 'المقطع قصير جداً (أقل من 0.1 ثانية)');
      return;
    }

    setIsProcessing(true);
    setProcessStep(`جاري قص "${region.label}"...`);
    setError("");

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");

      const ext = (file.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "add_input" + ext;
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const clipDuration = region.end - region.start;
      const outName = "add_output.mp3";
      const args = ["-i", inputName, "-ss", region.start.toString(), "-t", clipDuration.toString(), "-c:a", "libmp3lame", "-q:a", "2"];
      const filters: string[] = [];
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
        duration: region.end - region.start,
      };
      const newClips = [...clips, newClip];
      setClips(newClips);
      pushHistory(newClips, regions);
      setClippedBlobs(prev => {
        const m = new Map(prev);
        m.set(newClip.id, blob);
        return m;
      });
      showToast('success', `✅ تم قص "${region.label}" وإضافته للدمج`);

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outName).catch(() => {});
    } catch (err: any) {
      console.error("Add clip error:", err);
      showToast('error', err.message || 'فشل قص المقطع');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeClip = (clipId: string) => {
    if (soloClipId === clipId) stopSoloClip();
    if (editSession?.clipId === clipId) setEditSession(null);
    if (armedHandle?.clipId === clipId) setArmedHandle(null);
    const newClips = clips.filter(c => c.id !== clipId);
    setClips(newClips);
    pushHistory(newClips, regions);
    setClippedBlobs(prev => {
      const m = new Map(prev);
      m.delete(clipId);
      return m;
    });
  };

  // ============ Drag & Drop ============
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, clipId: string) => {
    setDraggedClipId(clipId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetClipId: string) => {
    e.preventDefault();
    if (!draggedClipId || draggedClipId === targetClipId) return;
    const draggedIndex = clips.findIndex(c => c.id === draggedClipId);
    const targetIndex = clips.findIndex(c => c.id === targetClipId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newClips = [...clips];
    const [draggedClip] = newClips.splice(draggedIndex, 1);
    newClips.splice(targetIndex, 0, draggedClip);
    setClips(newClips);
    pushHistory(newClips, regions);
    setDraggedClipId(null);
  };
  const handleDragEnd = () => setDraggedClipId(null);

  // ============ 🆕 تشغيل مقطع منفرد (للتعديل) ============
  const stopSoloClip = useCallback(() => {
    if (soloSourceRef.current) {
      try { soloSourceRef.current.stop(); } catch {}
      soloSourceRef.current = null;
    }
    if (soloAnimFrameRef.current) {
      cancelAnimationFrame(soloAnimFrameRef.current);
      soloAnimFrameRef.current = null;
    }
    setSoloClipPlayhead(-1);
    setSoloClipId(null);
  }, []);

  const playSoloClip = useCallback((clip: Clip) => {
    stopSoloClip();
    if (!originalAudioBufferRef.current) return;
    const originalBuffer = originalAudioBufferRef.current;
    const sampleRate = originalBuffer.sampleRate;
    const startSample = Math.floor(clip.start * sampleRate);
    const endSample = Math.floor(clip.end * sampleRate);
    const clipLength = endSample - startSample;
    if (clipLength <= 0) return;

    const ctx = mergedAudioContextRef.current!;
    if (ctx.state === "suspended") ctx.resume();

    const clipBuffer = ctx.createBuffer(1, clipLength, sampleRate);
    const clipData = clipBuffer.getChannelData(0);
    const originalData = originalBuffer.getChannelData(0);
    for (let i = 0; i < clipLength; i++) {
      clipData[i] = originalData[startSample + i] || 0;
    }

    const source = ctx.createBufferSource();
    source.buffer = clipBuffer;
    source.connect(ctx.destination);
    source.start(0);
    soloSourceRef.current = source;
    soloStartTimeRef.current = ctx.currentTime;
    setSoloClipId(clip.id);
    setSoloClipPlayhead(0);

    const updateTime = () => {
      const elapsed = ctx.currentTime - soloStartTimeRef.current;
      if (elapsed >= clip.duration) {
        stopSoloClip();
        return;
      }
      setSoloClipPlayhead(elapsed);
      soloAnimFrameRef.current = requestAnimationFrame(updateTime);
    };
    updateTime();

    source.onended = () => stopSoloClip();
  }, [stopSoloClip]);

  // ============ 🆕 جلسة تحرير مستقلة ============
  const startEditSession = useCallback((clip: Clip, handle: 'start' | 'end') => {
    setEditSession({ clipId: clip.id, draftStart: clip.start, draftEnd: clip.end });
    setArmedHandle({ clipId: clip.id, handle });
    playSoloClip(clip);
  }, [playSoloClip]);

  const confirmEdit = useCallback(() => {
    if (!editSession) return;
    const clipIndex = clips.findIndex(c => c.id === editSession.clipId);
    if (clipIndex === -1) { setEditSession(null); return; }
    const newClips = [...clips];
    const clip = { ...newClips[clipIndex] };
    clip.start = editSession.draftStart;
    clip.end = editSession.draftEnd;
    clip.duration = editSession.draftEnd - editSession.draftStart;
    newClips[clipIndex] = clip;
    setClips(newClips);
    mergedAudioBufferRef.current = null;
    pushHistory(newClips, regions);
    showToast('success', `✅ تم تطبيق التعديل على "${clip.label}" → مدة ${formatTime(clip.duration)}`);
    stopSoloClip();
    setEditSession(null);
    setArmedHandle(null);
  }, [editSession, clips, regions, pushHistory, stopSoloClip]);

  const cancelEdit = useCallback(() => {
    stopSoloClip();
    setEditSession(null);
    setArmedHandle(null);
    showToast('info', 'تم إلغاء التعديل');
  }, [stopSoloClip]);

  // ============ 🆕 تحرير المقطع في الموجة المدمجة ============
  const findClipAtX = (x: number): { clip: Clip, index: number, startPct: number, endPct: number } | null => {
    if (mergedDuration === 0) return null;
    let clipStart = 0;
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipEnd = clipStart + clip.duration;
      const startPct = clipStart / mergedDuration;
      const endPct = clipEnd / mergedDuration;
      if (x >= startPct && x <= endPct) {
        return { clip, index: i, startPct, endPct };
      }
      clipStart = clipEnd;
    }
    return null;
  };

  const handleClipMouseDown = (e: React.MouseEvent, clipId: string, handle: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    setEditingClip({ clipId, handle });
  };

  const handleMergedMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mergedCanvasRef.current || mergedDuration === 0) return;
    const rect = mergedCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const xPct = x / rect.width;
    const time = xPct * mergedDuration;

    // تحديث المؤشر عند عدم السحب
    if (!editingClip) {
      const found = findClipAtX(xPct);
      if (found) {
        setHoveredClipId(found.clip.id);
        const threshold = 0.03; // 🆕 منطقة إمساك أوسع
        const nearStart = Math.abs(xPct - found.startPct) < threshold;
        const nearEnd = Math.abs(xPct - found.endPct) < threshold;
        const canvas = mergedCanvasRef.current;
        if (nearStart || nearEnd) {
          canvas.style.cursor = 'ew-resize';
        } else {
          canvas.style.cursor = 'pointer';
        }
      } else {
        setHoveredClipId(null);
        if (mergedCanvasRef.current) mergedCanvasRef.current.style.cursor = 'pointer';
      }
      return;
    }

    // أثناء السحب
    const clipIndex = clips.findIndex(c => c.id === editingClip.clipId);
    if (clipIndex === -1) return;

    let clipStartInMerged = 0;
    for (let i = 0; i < clipIndex; i++) {
      clipStartInMerged += clips[i].duration;
    }

    const offsetInClip = time - clipStartInMerged;
    const originalTime = clips[clipIndex].start + offsetInClip;

    const newClips = [...clips];
    const clip = { ...newClips[clipIndex] };

    if (editingClip.handle === 'start') {
      const newStart = Math.max(0, Math.min(originalTime, clip.end - 0.1));
      clip.start = newStart;
    } else {
      const newEnd = Math.min(duration, Math.max(originalTime, clip.start + 0.1));
      clip.end = newEnd;
    }
    clip.duration = clip.end - clip.start;
    newClips[clipIndex] = clip;
    setClips(newClips);
    mergedAudioBufferRef.current = null;

    // 🆕 تلميح أثناء السحب
    setDragHint({
      clipLabel: clip.label,
      handle: editingClip.handle,
      newTime: editingClip.handle === 'start' ? clip.start : clip.end,
      duration: clip.duration,
    });
  };

  const handleMergedMouseUp = () => {
    if (editingClip) {
      const clip = clips.find(c => c.id === editingClip.clipId);
      if (clip) {
        showToast('success', `تم تعديل "${clip.label}" → مدة ${formatTime(clip.duration)}`);
      }
      pushHistory(clips, regions);
    }
    setEditingClip(null);
    setDragHint(null);
  };

  // ============ معاينة الموجة المدمجة ============
  const playMergedPreview = useCallback(() => {
    if (!mergedAudioBufferRef.current && originalAudioBufferRef.current) {
      const originalBuffer = originalAudioBufferRef.current;
      const sampleRate = originalBuffer.sampleRate;
      const totalSamples = Math.floor(mergedDuration * sampleRate);
      if (totalSamples === 0) return;
      const ctx = mergedAudioContextRef.current!;
      const mergedBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
      const mergedData = mergedBuffer.getChannelData(0);
      let currentOffset = 0;
      clips.forEach((clip) => {
        const startSample = Math.floor(clip.start * sampleRate);
        const endSample = Math.floor(clip.end * sampleRate);
        const originalData = originalBuffer.getChannelData(0);
        const clipLength = endSample - startSample;
        for (let i = 0; i < clipLength && currentOffset + i < totalSamples; i++) {
          mergedData[currentOffset + i] = originalData[startSample + i] || 0;
        }
        currentOffset += clipLength;
      });
      mergedAudioBufferRef.current = mergedBuffer;
    }
    if (!mergedAudioBufferRef.current) return;
    if (isMergedPlaying) {
      mergedSourceRef.current?.stop();
      setIsMergedPlaying(false);
      if (mergedAnimFrameRef.current) cancelAnimationFrame(mergedAnimFrameRef.current);
      return;
    }
    const ctx = mergedAudioContextRef.current!;
    const source = ctx.createBufferSource();
    source.buffer = mergedAudioBufferRef.current;
    source.connect(ctx.destination);
    source.start(0);
    mergedSourceRef.current = source;
    mergedStartTimeRef.current = ctx.currentTime;
    setIsMergedPlaying(true);
    const updateTime = () => {
      const elapsed = ctx.currentTime - mergedStartTimeRef.current;
      if (elapsed >= mergedDuration) { setIsMergedPlaying(false); setMergedCurrentTime(0); return; }
      setMergedCurrentTime(elapsed);
      mergedAnimFrameRef.current = requestAnimationFrame(updateTime);
    };
    updateTime();
    source.onended = () => { setIsMergedPlaying(false); setMergedCurrentTime(0); };
  }, [isMergedPlaying, mergedDuration, clips]);

  const handleMergedCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mergedCanvasRef.current || mergedDuration === 0) return;
    if (editingClip) return; // لا تشغّل أثناء التحرير
    const rect = mergedCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let clickTime = (x / rect.width) * mergedDuration;

    // 🆕 إذا ضغط على مقطع، ابدأ من بدايته
    let clipStartInMerged = 0;
    for (const clip of clips) {
      const clipEnd = clipStartInMerged + clip.duration;
      if (clickTime >= clipStartInMerged && clickTime <= clipEnd) {
        clickTime = clipStartInMerged;
        break;
      }
      clipStartInMerged = clipEnd;
    }
    if (mergedSourceRef.current) {
      mergedSourceRef.current.stop();
      if (mergedAnimFrameRef.current) cancelAnimationFrame(mergedAnimFrameRef.current);
    }
    const originalBuffer = originalAudioBufferRef.current;
    if (!originalBuffer) return;
    const sampleRate = originalBuffer.sampleRate;
    const totalSamples = Math.floor(mergedDuration * sampleRate);
    const ctx = mergedAudioContextRef.current!;
    const mergedBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const mergedData = mergedBuffer.getChannelData(0);
    let currentOffset = 0;
    clips.forEach((clip) => {
      const startSample = Math.floor(clip.start * sampleRate);
      const endSample = Math.floor(clip.end * sampleRate);
      const originalData = originalBuffer.getChannelData(0);
      const clipLength = endSample - startSample;
      for (let i = 0; i < clipLength && currentOffset + i < totalSamples; i++) {
        mergedData[currentOffset + i] = originalData[startSample + i] || 0;
      }
      currentOffset += clipLength;
    });
    mergedAudioBufferRef.current = mergedBuffer;
    const source = ctx.createBufferSource();
    source.buffer = mergedBuffer;
    source.connect(ctx.destination);
    source.start(0, clickTime);
    mergedSourceRef.current = source;
    mergedStartTimeRef.current = ctx.currentTime - clickTime;
    setIsMergedPlaying(true);
    setMergedCurrentTime(clickTime);
    const updateTime = () => {
      const elapsed = ctx.currentTime - mergedStartTimeRef.current;
      if (elapsed >= mergedDuration) { setIsMergedPlaying(false); setMergedCurrentTime(0); return; }
      setMergedCurrentTime(elapsed);
      mergedAnimFrameRef.current = requestAnimationFrame(updateTime);
    };
    updateTime();
    source.onended = () => { setIsMergedPlaying(false); setMergedCurrentTime(0); };
  };

  // ============ تنزيل مقطع واحد (يستخدم Blob الجاهز إن وُجد) ============
  const cutSingleClip = async (clip: Clip) => {
    setProcessingClipId(clip.id);
    try {
      // إذا كان المقطع مقصوصاً مسبقاً (مضاف عبر "قص وإضافة للدمج") → استخدمه مباشرة
      const cached = clippedBlobs.get(clip.id);
      if (cached) {
        const url = URL.createObjectURL(cached);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${clip.label}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', `تم تنزيل "${clip.label}"`);
        return;
      }
      // وإلا → اقصه الآن (للمقاطع القديمة المحفوظة قبل التحديث)
      if (!file) return;
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");
      const ext = (file.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "input_single" + ext;
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const clipDuration = clip.end - clip.start;
      await ffmpeg.exec([
        "-i", inputName, "-ss", clip.start.toString(), "-t", clipDuration.toString(),
        "-c:a", "libmp3lame", "-q:a", "2", "-y", "single_output.mp3"
      ]);
      const data = await ffmpeg.readFile("single_output.mp3");
      const blob = new Blob([data as any], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clip.label}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile("single_output.mp3").catch(() => {});
      showToast('success', `تم تنزيل "${clip.label}"`);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تنزيل المقطع.");
    } finally {
      setProcessingClipId(null);
    }
  };

  // ============ قص المقطع الأساسي (زر قص وتنزيل) ============
  const cutAudio = async () => {
    if (regions.length === 0) { setError("يرجى إضافة مقطع واحد على الأقل"); return; }
    setIsProcessing(true);
    setError("");
    setDownloadUrl("");
    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");
      const ext = (file!.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "input" + ext;
      setProcessStep("جاري قراءة الملف...");
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      setProcessStep("جاري معالجة الصوت...");
      const region = regions[0];
      const clipDuration = region.end - region.start;
      const args = ["-i", inputName, "-ss", region.start.toString(), "-t", clipDuration.toString(), "-c:a", "libmp3lame", "-q:a", "2"];
      const filters: string[] = [];
      if (fadeIn) filters.push(`afade=t=in:st=0:d=2`);
      if (fadeOut && clipDuration > 4) filters.push(`afade=t=out:st=${Math.max(0, clipDuration - 2)}:d=2`);
      if (volume !== 100) filters.push(`volume=${volume / 100}`);
      if (normalize) filters.push(`loudnorm=I=-16:TP=-1.5:LRA=11`);
      if (filters.length > 0) args.push("-af", filters.join(","));
      args.push("-y", "output.mp3");
      await ffmpeg.exec(args);
      setProcessStep("جاري تحضير الملف...");
      const data = await ffmpeg.readFile("output.mp3");
      const blob = new Blob([data as any], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProcessStep("تم بنجاح!");
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile("output.mp3").catch(() => {});
    } catch (err: any) {
      console.error("Processing error:", err);
      setError(err.message || "حدث خطأ أثناء المعالجة.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ دمج المقاطع ============
  const mergeAllClips = async () => {
    if (clips.length === 0) { setError("لا توجد مقاطع للدمج. احفظ بعض المقاطع أولاً."); return; }
    setIsProcessing(true);
    setError("");
    setDownloadUrl("");
    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");
      const ext = (file!.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "input_merge" + ext;
      setProcessStep("جاري قراءة الملف...");
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      setProcessStep("جاري قص المقاطع...");
      const outputFiles: string[] = [];
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const tempOutput = `merge_temp${i}.mp3`;
        const clipDuration = clip.end - clip.start;
        await ffmpeg.exec(["-i", inputName, "-ss", clip.start.toString(), "-t", clipDuration.toString(), "-c:a", "libmp3lame", "-q:a", "2", "-y", tempOutput]);
        outputFiles.push(tempOutput);
      }
      setProcessStep("جاري دمج المقاطع...");
      const concatContent = outputFiles.map(f => `file '${f}'`).join("\n");
      await ffmpeg.writeFile("merge_concat.txt", concatContent);
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "merge_concat.txt", "-c:a", "libmp3lame", "-q:a", "2", "-y", "merged_output.mp3"]);
      setProcessStep("جاري تحضير الملف...");
      const data = await ffmpeg.readFile("merged_output.mp3");
      const blob = new Blob([data as any], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProcessStep("تم الدمج بنجاح!");
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile("merged_output.mp3").catch(() => {});
      for (let i = 0; i < outputFiles.length; i++) await ffmpeg.deleteFile(outputFiles[i]).catch(() => {});
      await ffmpeg.deleteFile("merge_concat.txt").catch(() => {});
    } catch (err: any) {
      console.error("Merge error:", err);
      setError(err.message || "حدث خطأ أثناء الدمج.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ============ تنزيل الكل ZIP ============
  const downloadAllAsZip = async () => {
    if (clips.length === 0 || !file) return;
    setMultiDownloading(true);
    setError("");
    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("محرك المعالجة غير متاح");
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const ext = (file.name.match(/\.[0-9a-z]+$/i) || [".mp3"])[0].toLowerCase();
      const inputName = "zip_input" + ext;
      const { fetchFile } = await import("@ffmpeg/util");
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        setProcessStep(`جاري قص المقطع ${i + 1} من ${clips.length}...`);
        const tempOutput = `zip_temp${i}.mp3`;
        const clipDuration = clip.end - clip.start;
        await ffmpeg.exec(["-i", inputName, "-ss", clip.start.toString(), "-t", clipDuration.toString(), "-c:a", "libmp3lame", "-q:a", "2", "-y", tempOutput]);
        const data = await ffmpeg.readFile(tempOutput);
        zip.file(`${String(i + 1).padStart(2, "0")}_${clip.label}.mp3`, data as any);
        await ffmpeg.deleteFile(tempOutput).catch(() => {});
      }
      setProcessStep("جاري إنشاء ملف ZIP...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^.]+$/, "")}_clips.zip`;
      a.click();
      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile(inputName).catch(() => {});
      setProcessStep("تم التنزيل!");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء ZIP.");
    } finally {
      setMultiDownloading(false);
    }
  };

  // ============ إعدادات نغمة الرنين ============
  const enableRingtoneMode = () => {
    setRingtoneMode(true);
    setFadeOut(true);
    if (regions.length > 0) {
      const newEnd = Math.min(regions[0].start + 30, duration);
      updateRegion(regions[0].id, "end", newEnd);
    }
  };

  // ============ تنظيف ============
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (mergedAnimFrameRef.current) cancelAnimationFrame(mergedAnimFrameRef.current);
    };
  }, [audioUrl, downloadUrl]);


  // ============ بداية الواجهة ============
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-5 py-3 shadow-lg font-semibold text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          'bg-slate-800 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-5 text-sm text-slate-500">
          <a href="/tools/audio" className="font-medium transition hover:text-orange-600">أدوات الصوت</a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">قص الاغاني</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Music size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            قص الاغاني أونلاين مجانًا – قص ملفات MP3 وتقطيع الموسيقى
          </h1>
          <p className="mt-4 text-slate-600">
            أداة متكاملة لقص الاغاني وإنشاء نغمات الرنين وتقطيع الملفات الصوتية ودمج المقاطع والتحكم في الصوت
          </p>
        </header>

        {/* ============ الأداة ============ */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
              <Upload size={48} className="mb-4 text-slate-400" />
              <h2 className="mb-2 text-xl font-bold text-slate-700">ارفع ملف الصوت للبدء</h2>
              <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, AAC, OGG, FLAC (الحد الأقصى 50 ميجابايت)</p>
              <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors">
                اختيار ملف
                <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">

              {/* معلومات الملف */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <FileAudio size={28} className="text-orange-600 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate max-w-md">{fileName}</h3>
                    <p className="text-sm text-slate-500">
                      المدة: {formatTime(duration)} • الحجم: {file.size ? formatFileSize(file.size) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ffmpegLoaded ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">✓ المحرك جاهز</span>
                  ) : ffmpegProgress > 0 ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-semibold">⏳ {ffmpegProgress}%</span>
                  ) : null}
                  <button
                    onClick={() => {
                      stopSoloClip();
                      setArmedHandle(null);
                      setEditSession(null);
                      setFile(null); setAudioUrl(""); setError(""); setRegions([]);
                      setFfmpegLoaded(false); setClips([]); setMergedWaveformData([]);
                      setHistory([]); setHistoryIndex(-1);
                    }}
                    className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={14} /> إزالة
                  </button>
                </div>
              </div>

              {/* مشغل الصوت */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={handleAudioLoaded}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />

              {/* الموجة الرئيسية */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 rounded-lg bg-white cursor-pointer select-none"
                  onClick={handleCanvasClick}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                      title="تراجع (Ctrl+Z)"
                    >
                      <Undo2 size={16} /> تراجع
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                      title="إعادة (Ctrl+Shift+Z)"
                    >
                      <Redo2 size={16} /> إعادة
                    </button>
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                      تصغير
                    </button>
                    <span className="text-xs text-slate-500 font-mono">{zoom}x</span>
                    <button onClick={() => setZoom(Math.min(3, zoom + 0.5))} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                      تكبير
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 انقر على أي مكان في الموجة لبدء التشغيل، أو اسحب المقابض لتعديل المقطع • اختصارات: Space تشغيل، ←/→ تنقل، Ctrl+Z تراجع
                </p>
              </div>

              {/* المقاطع النشطة */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={20} /> المقاطع النشطة ({regions.length})
                  </h3>
                  <button onClick={addRegion} className="text-sm bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 font-semibold transition-colors">
                    + إضافة مقطع
                  </button>
                </div>
                {regions.map((region) => {
                  const isSaved = clips.some(c => c.regionId === region.id);
                  return (
                    <div key={region.id} className={`rounded-lg border p-4 transition-all ${region.id === activeRegionId ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <button onClick={() => setActiveRegionId(region.id)} className="font-bold text-slate-900 hover:text-orange-600 transition-colors">
                          {region.label}
                          {isSaved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mr-2">✓ محفوظ</span>}
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => playRegion(region)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 font-semibold flex items-center gap-1 transition-colors">
                            <Play size={12} /> معاينة
                          </button>
                          <button
                            onClick={() => saveClip(region)}
                            disabled={isSaved}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 disabled:opacity-50 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Scissors size={12} /> {isSaved ? 'في الدمج' : 'قص وإضافة للدمج'}
                          </button>
                          <button onClick={() => removeRegion(region.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 font-semibold transition-colors">
                            حذف
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                            <Clock size={12} /> البداية
                          </label>
                          <input
                            type="text"
                            value={formatTime(region.start)}
                            onChange={(e) => updateRegion(region.id, "start", parseTime(e.target.value))}
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="0:00.00"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                            <Clock size={12} /> النهاية
                          </label>
                          <input
                            type="text"
                            value={formatTime(region.end)}
                            onChange={(e) => updateRegion(region.id, "end", parseTime(e.target.value))}
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            placeholder="0:30.00"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-mono">المدة: {formatTime(region.end - region.start)}</p>
                    </div>
                  );
                })}
              </div>

              {/* المقاطع المحفوظة */}
              {clips.length > 0 && (
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                      <Layers size={20} /> المقاطع المحفوظة ({clips.length})
                    </h3>
                    <span className="text-xs text-indigo-700 bg-white px-2 py-1 rounded">
                      المدة الإجمالية: {formatTime(clips.reduce((sum, c) => sum + c.duration, 0))}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {clips.map((clip, index) => (
                      <div
                        key={clip.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, clip.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, clip.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-lg border-2 p-3 transition-all cursor-move ${
                          draggedClipId === clip.id ? 'border-indigo-500 opacity-50 scale-95' : 'border-indigo-200 hover:shadow-md hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{clip.label}</p>
                            <p className="text-xs text-slate-500 font-mono">
                              {formatTime(clip.start)} → {formatTime(clip.end)}
                            </p>
                          </div>
                          <GripVertical size={16} className="text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-600 mb-3">المدة: {formatTime(clip.duration)}</p>
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => startEditSession(clip, 'start')}
                            className={`flex-1 text-xs px-2 py-1.5 rounded font-semibold transition-colors ${
                              armedHandle?.clipId === clip.id && armedHandle.handle === 'start'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title="اختر هذا الزر ثم اضغط على الموجة لتحديد بداية جديدة"
                          >
                            ⇤ تعديل البداية
                          </button>
                          <button
                            onClick={() => startEditSession(clip, 'end')}
                            className={`flex-1 text-xs px-2 py-1.5 rounded font-semibold transition-colors ${
                              armedHandle?.clipId === clip.id && armedHandle.handle === 'end'
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                            title="اختر هذا الزر ثم اضغط على الموجة لتحديد نهاية جديدة"
                          >
                            تعديل النهاية ⇥
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = clip.start;
                                audioRef.current.play();
                                setIsPlaying(true);
                                const checkEnd = () => {
                                  if (audioRef.current && audioRef.current.currentTime >= clip.end) {
                                    audioRef.current.pause();
                                    setIsPlaying(false);
                                    audioRef.current.removeEventListener("timeupdate", checkEnd);
                                  }
                                };
                                audioRef.current.addEventListener("timeupdate", checkEnd);
                              }
                            }}
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded px-2 py-1.5 text-xs font-semibold transition-colors"
                          >
                            <Play size={12} /> تشغيل
                          </button>
                          <button
                            onClick={() => cutSingleClip(clip)}
                            disabled={processingClipId === clip.id}
                            className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 rounded px-2 py-1.5 text-xs font-semibold transition-colors"
                          >
                            {processingClipId === clip.id ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                            تنزيل
                          </button>
                          <button
                            onClick={() => removeClip(clip.id)}
                            className="flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded px-2 py-1.5 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-700 mt-3 text-center">💡 اسحب المقاطع لإعادة ترتيبها • استخدم Ctrl+Z للتراجع</p>
                </div>
              )}

              {/* معاينة الموجة المدمجة */}
              {clips.length > 0 && mergedDuration > 0 && (
                <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                      <Eye size={20} /> معاينة الدمج النهائي
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-700 bg-white px-2 py-1 rounded font-mono">
                        {formatTime(mergedCurrentTime)} / {formatTime(mergedDuration)}
                      </span>
                      <span className="text-xs text-emerald-700 bg-white px-2 py-1 rounded">
                        {clips.length} مقاطع
                      </span>
                    </div>
                  </div>
                  {editSession && (
                    <div className="mb-3 rounded-lg border-2 border-emerald-400 bg-emerald-50 p-3 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm font-bold text-emerald-900">
                          ✏️ وضع التعديل المستقل — {clips.find(c => c.id === editSession.clipId)?.label || ''}
                          <span className="mr-2 text-xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded">
                            {armedHandle?.handle === 'start' ? '🔴 تعديل البداية' : '🔵 تعديل النهاية'}
                          </span>
                        </div>
                        {soloClipId && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-white px-2 py-1 rounded font-mono font-bold">
                              {formatTime(soloClipPlayhead)} / {formatTime(editSession.draftEnd - editSession.draftStart)}
                            </span>
                            <button
                              onClick={stopSoloClip}
                              className="text-xs bg-white px-2 py-1 rounded hover:bg-slate-50 font-bold border border-slate-300"
                            >
                              ⏸ إيقاف
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-xs text-emerald-800">
                          <span className="font-mono bg-white px-2 py-0.5 rounded">
                            {formatTime(editSession.draftStart)} → {formatTime(editSession.draftEnd)}
                          </span>
                          <span className="mr-2 text-slate-500">
                            المدة: {formatTime(editSession.draftEnd - editSession.draftStart)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmEdit}
                            className="text-sm bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 font-bold shadow-sm"
                          >
                            ✅ تأكيد التعديل
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-sm bg-white text-slate-700 border border-slate-300 px-4 py-1.5 rounded-lg hover:bg-slate-50 font-bold"
                          >
                            ❌ إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <canvas
                      ref={mergedCanvasRef}
                      className={`w-full h-32 rounded-lg bg-white select-none border border-emerald-200 ${editingClip ? 'cursor-ew-resize' : 'cursor-pointer'}`}
                      onClick={handleMergedCanvasClick}
                      onMouseDown={(e) => {
                        if (!mergedCanvasRef.current) return;
                        const rect = mergedCanvasRef.current.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const clickTime = x * mergedDuration;
                        let clipStart = 0;
                        for (const clip of clips) {
                          const clipEnd = clipStart + clip.duration;
                          if (clickTime >= clipStart && clickTime <= clipEnd) {
                            const startPct = clipStart / mergedDuration;
                            const endPct = clipEnd / mergedDuration;
                            const threshold = 0.015;
                            if (Math.abs(x - startPct) < threshold) {
                              handleClipMouseDown(e, clip.id, 'start');
                            } else if (Math.abs(x - endPct) < threshold) {
                              handleClipMouseDown(e, clip.id, 'end');
                            }
                            break;
                          }
                          clipStart = clipEnd;
                        }
                      }}
                      onMouseMove={handleMergedMouseMove}
                      onMouseUp={handleMergedMouseUp}
                      onMouseLeave={handleMergedMouseUp}
                      onMouseOver={(e) => {
                        if (!mergedCanvasRef.current) return;
                        const rect = mergedCanvasRef.current.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const clickTime = x * mergedDuration;
                        let clipStart = 0;
                        for (const clip of clips) {
                          if (clickTime >= clipStart && clickTime <= clipStart + clip.duration) {
                            setHoveredClipId(clip.id);
                            break;
                          }
                          clipStart += clip.duration;
                        }
                      }}
                      onMouseOut={() => setHoveredClipId(null)}
                    />
                    {dragHint && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-lg bg-slate-900 text-white text-xs px-3 py-1.5 shadow-lg pointer-events-none z-10">
                        <span className="font-bold">{dragHint.clipLabel}</span>
                        <span className="mx-2">•</span>
                        <span className="font-mono">{formatTime(dragHint.newTime)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-slate-300">المدة: {formatTime(dragHint.duration)}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {clips.map((clip, index) => {
                        const colors = ["bg-indigo-500", "bg-violet-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-cyan-500"];
                        return (
                          <div key={clip.id} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border border-slate-200">
                            <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`}></div>
                            <span className="font-semibold">{index + 1}. {clip.label}</span>
                            <span className="text-slate-500 font-mono">({formatTime(clip.duration)})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={playMergedPreview}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-md"
                    >
                      {isMergedPlaying ? <Pause size={18} /> : <Play size={18} />}
                      {isMergedPlaying ? 'إيقاف المعاينة' : 'معاينة الدمج'}
                    </button>
                    <p className="text-xs text-emerald-700 flex-1">💡 اضغط "تعديل البداية/النهاية" على أي مقطع، ثم اضغط على الموجة لتحديد الموضع • يمكنك تشغيل الصوت واستخدام الزر ⏸ للتوقف في اللحظة المناسبة</p>
                  </div>
                </div>
              )}

              {/* أزرار الدمج والتنزيل الجماعي */}
              {clips.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={mergeAllClips}
                    disabled={isProcessing || multiDownloading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    {isProcessing ? (
                      <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
                    ) : (
                      <><GripVertical size={20} /> دمج {clips.length} مقاطع في ملف واحد</>
                    )}
                  </button>
                  <button
                    onClick={downloadAllAsZip}
                    disabled={isProcessing || multiDownloading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    {multiDownloading ? (
                      <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
                    ) : (
                      <><Package size={20} /> تنزيل الكل كـ ZIP</>
                    )}
                  </button>
                </div>
              )}

              {/* خيارات متقدمة */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Zap size={20} /> خيارات متقدمة
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                    <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                    <span className="text-sm font-medium">تلاشي في البداية (Fade In)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                    <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                    <span className="text-sm font-medium">تلاشي في النهاية (Fade Out)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                    <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                    <span className="text-sm font-medium">تطبيع مستوى الصوت (Normalize)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors">
                    <input type="checkbox" checked={ringtoneMode} onChange={(e) => setRingtoneMode(e.target.checked)} className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500" />
                    <span className="text-sm font-medium">وضع نغمة الرنين (30 ثانية)</span>
                  </label>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                    <Volume2 size={16} /> مستوى الصوت: {volume}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                </div>
                {ringtoneMode && (
                  <button onClick={enableRingtoneMode} className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 font-bold transition-colors">
                    تطبيق إعدادات نغمة الرنين تلقائياً
                  </button>
                )}
              </div>

              {/* زر القص الرئيسي */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={cutAudio}
                  disabled={isProcessing || regions.length === 0}
                  className="flex-1 rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200"
                >
                  {isProcessing ? (
                    <span className="animate-pulse flex items-center gap-2"><RefreshCw className="animate-spin" size={20} /> {processStep}</span>
                  ) : (
                    <><Scissors size={20} /> قص وتنزيل</>
                  )}
                </button>
              </div>

              {/* رسالة خطأ */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{error}</p>
                    <p className="text-sm mt-1 opacity-80">💡 تأكد من تعطيل Ad-blocker واستخدام Chrome أو Edge.</p>
                  </div>
                </div>
              )}

              {/* نتيجة التنزيل */}
              {downloadUrl && (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-3 text-green-600" />
                  <h3 className="mb-2 text-lg font-bold text-green-900">تم بنجاح!</h3>
                  <audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg border border-green-300 bg-white" />
                  <a
                    href={downloadUrl}
                    download={`${fileName.replace(/\.[^.]+$/, "")}_cut.mp3`}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                  >
                    <Download size={20} /> تنزيل الملف
                  </a>
                </div>
              )}

            </div>
          )}
        </section>

        {/* ============ المحتوى النصي (SEO + FAQ + أدوات ذات صلة) ============ */}
        <ContentSections />

      </div>
    </main>
  );
}
