'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Music, Sparkles, ChevronDown, Trash2,
  CheckCircle2, Wand2, Loader2, AlertCircle, Film, Gauge,
  Clock, RotateCcw, RefreshCw, Play, Pause, Volume2,
  FileAudio, Scissors, Layers, FileArchive,
} from 'lucide-react';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع
// ============================================================
type AudioFormat = 'mp3' | 'wav' | 'aac' | 'm4a' | 'ogg' | 'flac';
type QualityLevel = 64 | 128 | 192 | 320;

type VideoState = {
  file: File | null;
  originalUrl: string | null;
  audioUrl: string | null;
  originalSize: number;
  audioSize: number | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  originalFormat: string | null;
  status: 'idle' | 'loading-ffmpeg' | 'extracting' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
};

// ============================================================
// ✅ الثوابت
// ============================================================
const FORMATS: {
  id: AudioFormat;
  name: string;
  desc: string;
  icon: string;
  mime: string;
  lossless: boolean;
}[] = [
  { id: 'mp3', name: 'MP3', desc: 'الأشهر والأكثر توافقاً', icon: '🎵', mime: 'audio/mpeg', lossless: false },
  { id: 'wav', name: 'WAV', desc: 'بدون ضغط — جودة كاملة', icon: '🎼', mime: 'audio/wav', lossless: true },
  { id: 'aac', name: 'AAC', desc: 'جودة عالية بحجم صغير', icon: '🎧', mime: 'audio/aac', lossless: false },
  { id: 'm4a', name: 'M4A', desc: 'مناسب لآبل و iOS', icon: '🍎', mime: 'audio/mp4', lossless: false },
  { id: 'ogg', name: 'OGG', desc: 'مفتوح المصدر للويب', icon: '🌐', mime: 'audio/ogg', lossless: false },
  { id: 'flac', name: 'FLAC', desc: 'بدون ضياع — احترافي', icon: '💎', mime: 'audio/flac', lossless: true },
];

const QUALITIES: { value: QualityLevel; label: string; desc: string }[] = [
  { value: 64, label: 'منخفضة', desc: 'للكلام والبودكاست' },
  { value: 128, label: 'متوسطة', desc: 'للاستخدام العام' },
  { value: 192, label: 'عالية', desc: 'للموسيقى' },
  { value: 320, label: 'احترافية', desc: 'للمونتاج' },
];

const FFMPEG_CDNS = [
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.skypack.dev/@ffmpeg/core@0.12.6/dist/umd',
];

// ============================================================
// ✅ المكوّن الرئيسي
// ============================================================
export default function VideoToAudioPage() {
  const [video, setVideo] = useState<VideoState>({
    file: null,
    originalUrl: null,
    audioUrl: null,
    originalSize: 0,
    audioSize: null,
    duration: null,
    width: null,
    height: null,
    originalFormat: null,
    status: 'idle',
    progress: 0,
  });

  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [quality, setQuality] = useState<QualityLevel>(192);
  const [useSegment, setUseSegment] = useState(false);
  const [segmentStart, setSegmentStart] = useState<number>(0);
  const [segmentEnd, setSegmentEnd] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({
    message: '', visible: false, isError: false,
  });
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

  // ============================================================
  // ✅ تحميل FFmpeg (نفس منطق video-converter)
  // ============================================================
  const loadFFmpeg = useCallback(async (signal?: AbortSignal) => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (ffmpegLoading) throw new Error('FFmpeg يُحمّل بالفعل...');
    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      for (const baseUrl of FFMPEG_CDNS) {
        try {
          if (signal?.aborted) throw new Error('تم الإلغاء');
          const ffmpeg = new FFmpeg();
          ffmpeg.on('progress', ({ progress }: { progress: number }) => {
            setVideo(prev => ({ ...prev, progress: Math.round(progress * 100) }));
          });
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
          });
          ffmpegRef.current = ffmpeg;
          setFfmpegLoaded(true);
          setFfmpegLoading(false);
          return ffmpeg;
        } catch (error) {
          if (signal?.aborted) { setFfmpegLoading(false); throw new Error('تم الإلغاء'); }
        }
      }
      throw new Error('فشل تحميل FFmpeg من جميع الخوادم.');
    } catch (error) { setFfmpegLoading(false); throw error; }
  }, [ffmpegLoading]);

  // ============================================================
  // ✅ استخراج بيانات الفيديو
  // ============================================================
  const probeVideo = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        resolve({
          duration: vid.duration,
          width: vid.videoWidth,
          height: vid.videoHeight,
        });
        URL.revokeObjectURL(vid.src);
      };
      vid.onerror = () => reject(new Error('فشل قراءة بيانات الفيديو'));
      vid.src = URL.createObjectURL(file);
    });
  };

  // ============================================================
  // ✅ اختيار الفيديو
  // ============================================================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      showToast('❌ الملف ليس فيديو', true);
      return;
    }

    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.audioUrl) URL.revokeObjectURL(video.audioUrl);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    setVideo({
      file,
      originalUrl: URL.createObjectURL(file),
      audioUrl: null,
      originalSize: file.size,
      audioSize: null,
      duration: null,
      width: null,
      height: null,
      originalFormat: ext,
      status: 'idle',
      progress: 0,
    });

    try {
      const meta = await probeVideo(file);
      setVideo(prev => ({
        ...prev,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
      }));
      setSegmentStart(0);
      setSegmentEnd(meta.duration);
    } catch (e) {
      console.warn('Probe failed:', e);
    }

    e.target.value = '';
  };

  // ============================================================
  // ✅ تحميل فيديو جديد
  // ============================================================
  const loadNewVideo = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.audioUrl) URL.revokeObjectURL(video.audioUrl);

    setVideo({
      file: null, originalUrl: null, audioUrl: null,
      originalSize: 0, audioSize: null, duration: null,
      width: null, height: null, originalFormat: null,
      status: 'idle', progress: 0,
    });
    setUseSegment(false);
    setSegmentStart(0);
    setSegmentEnd(0);
    setIsPreviewPlaying(false);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 100);

    showToast('✅ جاهز لتحميل فيديو جديد');
  }, [video, showToast]);

  // ============================================================
  // ✅ استخراج الصوت
  // ============================================================
  const extractAudio = async () => {
    if (!video.file) {
      showToast('❌ يرجى اختيار فيديو أولاً', true);
      return;
    }

    if (useSegment) {
      if (segmentStart < 0 || segmentEnd <= segmentStart) {
        showToast('❌ وقت البداية يجب أن يكون أصغر من وقت النهاية', true);
        return;
      }
      if (video.duration && segmentEnd > video.duration) {
        showToast('❌ وقت النهاية أكبر من مدة الفيديو', true);
        return;
      }
    }

    const fileSizeMB = video.file.size / (1024 * 1024);
    if (fileSizeMB > 500) {
      const confirmed = confirm(
        `⚠️ الفيديو كبير جداً (${fileSizeMB.toFixed(1)} MB)\n\nقد يستغرق الاستخراج وقتاً طويلاً. هل تريد المتابعة؟`
      );
      if (!confirmed) return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setVideo(prev => ({ ...prev, status: 'loading-ffmpeg', progress: 0 }));

    try {
      const ffmpeg = await loadFFmpeg(signal);
      if (signal.aborted) return;

      const { fetchFile } = await import('@ffmpeg/util');

      setVideo(prev => ({ ...prev, status: 'extracting', progress: 5 }));

      const inputExt = video.file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${targetFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(video.file));

      const args: string[] = [];

      // ✅ استخراج من مقطع محدد
      if (useSegment) {
        args.push('-ss', segmentStart.toFixed(3));
        args.push('-i', inputName);
        args.push('-t', (segmentEnd - segmentStart).toFixed(3));
      } else {
        args.push('-i', inputName);
      }

      // ✅ تجاهل مسار الفيديو (استخراج الصوت فقط)
      args.push('-vn');

      // ✅ إعدادات الصيغة الهدف
      const isLossless = FORMATS.find(f => f.id === targetFormat)?.lossless;

      if (targetFormat === 'mp3') {
        args.push('-acodec', 'libmp3lame');
        args.push('-b:a', `${quality}k`);
      } else if (targetFormat === 'wav') {
        args.push('-acodec', 'pcm_s16le');
        args.push('-ar', '44100');
        args.push('-ac', '2');
      } else if (targetFormat === 'aac') {
        args.push('-acodec', 'aac');
        args.push('-b:a', `${quality}k`);
      } else if (targetFormat === 'm4a') {
        args.push('-acodec', 'aac');
        args.push('-b:a', `${quality}k`);
      } else if (targetFormat === 'ogg') {
        args.push('-acodec', 'libvorbis');
        args.push('-b:a', `${quality}k`);
      } else if (targetFormat === 'flac') {
        args.push('-acodec', 'flac');
        args.push('-compression_level', '5');
      }

      args.push('-threads', '1');
      args.push(outputName);

      console.log('[FFmpeg] الأمر:', args.join(' '));

      await ffmpeg.exec(args);

      if (signal.aborted) return;

      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
      const blob = new Blob([data.buffer], { type: mime });

      if (blob.size === 0) {
        throw new Error('الملف الناتج فارغ. جرب صيغة أو جودة مختلفة.');
      }

      if (video.audioUrl) URL.revokeObjectURL(video.audioUrl);

      setVideo(prev => ({
        ...prev,
        audioUrl: URL.createObjectURL(blob),
        audioSize: blob.size,
        status: 'done',
        progress: 100,
      }));

      showToast(`✅ تم استخراج الصوت بصيغة ${targetFormat.toUpperCase()}`);
    } catch (error) {
      if (signal.aborted) return;

      console.error('Extraction error:', error);

      let errorMessage = 'فشل استخراج الصوت';
      if (error instanceof Error) {
        if (error.message.includes('memory access out of bounds')) {
          try { ffmpegRef.current?.terminate?.(); } catch {}
          ffmpegRef.current = null;
          setFfmpegLoaded(false);
          errorMessage = '❌ الذاكرة غير كافية.\n\nالحلول:\n• استخدم WAV أو MP3\n• فيديو أصغر\n• تجربة صيغة أخرى';
        } else {
          errorMessage = error.message;
        }
      }

      setVideo(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
      }));
      showToast('❌ فشل استخراج الصوت', true);
    } finally {
      abortControllerRef.current = null;
    }
  };

  // ============================================================
  // ✅ التحميل
  // ============================================================
  const downloadAudio = async () => {
    if (!video.audioUrl || !video.file) return;
    try {
      const response = await fetch(video.audioUrl);
      const blob = await response.blob();
      saveAs(blob, `audio_${video.file.name.replace(/\.[^.]+$/, '')}_intoooly.${targetFormat}`);
      showToast('✅ بدأ التنزيل');
    } catch {
      showToast('❌ فشل التنزيل', true);
    }
  };

  const togglePreview = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // ============================================================
  // ✅ Helpers
  // ============================================================
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const savings = video.audioSize && video.originalSize
    ? Math.round(((video.originalSize - video.audioSize) / video.originalSize) * 100)
    : 0;

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-2xl z-50 max-w-lg text-center ${
          toast.isError ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20 text-ink-900"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <style jsx>{`
          @keyframes audio-hero-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.05); }
          }
          @keyframes audio-hero-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(234, 179, 8, 0); }
          }
          @keyframes audio-hero-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-6deg); }
            75% { transform: rotate(6deg); }
          }
          .audio-hero-icon {
            animation: audio-hero-float 3s ease-in-out infinite, audio-hero-glow 3s ease-in-out infinite;
          }
          .audio-hero-icon:hover .audio-hero-icon-svg {
            animation: audio-hero-wiggle 0.6s ease-in-out;
          }
        `}</style>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3" dir="rtl">
              <div className="audio-hero-icon w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Music className="audio-hero-icon-svg w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                استخراج الصوت من الفيديو
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              FFmpeg.wasm • 6 صيغ • محلياً 100% • بدون رفع
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              استخرج الصوت من أي فيديو بصيغة MP3، WAV، AAC، وغيرها
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🎵', title: '6 صيغ', desc: 'MP3, WAV, AAC, M4A, OGG, FLAC' },
              { icon: '🔒', title: 'محلي 100%', desc: 'فيديوهاتك لا ترفع' },
              { icon: '⚡', title: '4 جودات', desc: '64 → 320 kbps' },
              { icon: '✂️', title: 'مقطع محدد', desc: 'بداية ونهاية' },
            ].map((f, i) => (
              <div key={i} className={`${cardClass} border rounded-xl p-3 md:p-4 text-center shadow-sm`}>
                <div className="text-2xl md:text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5 text-ink-900">{f.title}</h3>
                <p className={`text-[10px] md:text-xs ${textClass}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className={`${cardClass} border rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto`}>

            {!video.file ? (
              <div className="text-center space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group"
                >
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اختر فيديو لاستخراج صوته</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, MKV, WebM, AVI — حتى 500 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*,audio/*" onChange={handleFileSelect} className="hidden" />

                <div className={`${cardClass} border rounded-xl p-3 md:p-4 max-w-2xl mx-auto`}>
                  <div className="flex items-start gap-3 text-right">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1 text-ink-900">⚡ معلومة سريعة</h4>
                      <p className={`text-xs ${textClass} leading-relaxed`}>
                        <span className="font-bold text-brand-600">أول استخدام:</span> 30-60 ثانية لتحميل FFmpeg (مرة واحدة فقط)
                        <br />
                        <span className="font-bold text-emerald-600">بعدها:</span> استخراج فوري بجميع الصيغ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* ========== LEFT: Settings ========== */}
                <div className="space-y-4 lg:order-2">
                  <div className={`${cardClass} border rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-ink-900">
                        <Sparkles className="w-5 h-5 text-brand-500" /> إعدادات الاستخراج
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        ⚡ فوري
                      </span>
                    </div>

                    {/* Format Selection */}
                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block text-ink-900">صيغة الصوت</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {FORMATS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setTargetFormat(f.id)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              targetFormat === f.id
                                ? 'border-brand-500 bg-brand-50 shadow-md'
                                : 'border-ink-200 hover:border-brand-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{f.icon}</div>
                            <p className="text-xs font-bold text-ink-900">{f.name}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{f.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality (only for lossy formats) */}
                    {!FORMATS.find(f => f.id === targetFormat)?.lossless && (
                      <div className="mb-4">
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <Gauge className="w-4 h-4 text-brand-500" /> جودة الصوت
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {QUALITIES.map((q) => (
                            <button
                              key={q.value}
                              onClick={() => setQuality(q.value)}
                              className={`p-2 rounded-lg border-2 text-center transition-all ${
                                quality === q.value
                                  ? 'border-brand-500 bg-brand-50'
                                  : 'border-ink-200 hover:border-brand-300'
                              }`}
                            >
                              <p className="text-xs font-bold text-ink-900">{q.label}</p>
                              <p className="text-[10px] text-ink-500 mt-0.5">{q.value}k</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Segment Selection */}
                    <div className="mb-4 border-t border-ink-200/50 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={useSegment}
                          onChange={(e) => setUseSegment(e.target.checked)}
                          className="w-4 h-4 accent-brand-500"
                        />
                        <span className="text-sm font-bold flex items-center gap-2 text-ink-900">
                          <Scissors className="w-4 h-4 text-brand-500" /> استخراج من مقطع محدد
                        </span>
                      </label>

                      {useSegment && video.duration && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-ink-50 rounded-lg">
                          <div>
                            <label className={`text-xs font-bold block mb-1 ${textClass}`}>من (ثانية)</label>
                            <input
                              type="number"
                              min={0}
                              max={video.duration}
                              step={0.1}
                              value={segmentStart}
                              onChange={(e) => setSegmentStart(parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300"
                            />
                            <p className="text-[10px] text-ink-500 mt-0.5">{formatDuration(segmentStart)}</p>
                          </div>
                          <div>
                            <label className={`text-xs font-bold block mb-1 ${textClass}`}>إلى (ثانية)</label>
                            <input
                              type="number"
                              min={0}
                              max={video.duration}
                              step={0.1}
                              value={segmentEnd}
                              onChange={(e) => setSegmentEnd(parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300"
                            />
                            <p className="text-[10px] text-ink-500 mt-0.5">{formatDuration(segmentEnd)}</p>
                          </div>
                          <p className={`col-span-2 text-[10px] ${textClass}`}>
                            ⏱️ المدة المستخرجة: {formatDuration(Math.max(0, segmentEnd - segmentStart))}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setTargetFormat('mp3');
                        setQuality(192);
                        setUseSegment(false);
                        setSegmentStart(0);
                        setSegmentEnd(video.duration || 0);
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 bg-ink-100 hover:bg-ink-200 text-ink-700"
                    >
                      <RotateCcw className="w-4 h-4" /> إعادة الإعدادات
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={extractAudio}
                      disabled={video.status === 'extracting' || video.status === 'loading-ffmpeg'}
                      className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
                    >
                      {video.status === 'loading-ffmpeg' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> تحميل FFmpeg...</>
                      ) : video.status === 'extracting' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> جاري الاستخراج... {video.progress}%</>
                      ) : video.status === 'done' ? (
                        <><CheckCircle2 className="w-5 h-5" /> تم الاستخراج — جرب صيغة أخرى</>
                      ) : (
                        <><Wand2 className="w-5 h-5" /> ابدأ استخراج الصوت</>
                      )}
                    </button>

                    <button
                      onClick={loadNewVideo}
                      className="w-full py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      تحميل فيديو جديد
                    </button>
                  </div>

                  {!ffmpegLoaded && !ffmpegLoading && (
                    <div className={`${cardClass} border rounded-xl p-3 text-xs ${textClass} flex items-start gap-2`}>
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-ink-900">ملاحظة:</strong> FFmpeg.wasm سيُحمّل عند أول استخراج (~30 MB).
                      </span>
                    </div>
                  )}

                  {ffmpegLoading && (
                    <div className={`${cardClass} border rounded-xl p-3 text-xs bg-blue-50 text-blue-700 flex items-center gap-2`}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تحميل FFmpeg (~30 MB)... انتظر قليلاً</span>
                    </div>
                  )}
                </div>

                {/* ========== RIGHT: Video Info + Audio Preview ========== */}
                <div className="space-y-4 lg:order-1 lg:sticky lg:top-4 lg:self-start">

                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="p-3 border-b border-ink-200/20 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1 text-ink-900 flex items-center gap-2">
                        <Film className="w-4 h-4 text-brand-500" />
                        {video.file.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={loadNewVideo}
                          className="p-1.5 hover:bg-brand-100 rounded-lg transition"
                          title="فيديو جديد"
                        >
                          <RefreshCw className="w-4 h-4 text-brand-500" />
                        </button>
                        <button
                          onClick={loadNewVideo}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Video Preview */}
                    <div className="p-3">
                      <video
                        src={video.originalUrl || ''}
                        controls
                        className="w-full h-48 md:h-64 object-contain rounded-lg bg-ink-900"
                      />
                    </div>

                    {/* Video Info */}
                    {(video.duration || video.width) && (
                      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                        {video.duration && (
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass} flex items-center justify-center gap-1`}>
                              <Clock className="w-3 h-3" /> المدة
                            </p>
                            <p className="text-xs font-bold">{formatDuration(video.duration)}</p>
                          </div>
                        )}
                        {video.width && video.height && (
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass} flex items-center justify-center gap-1`}>
                              <Layers className="w-3 h-3" /> الأبعاد
                            </p>
                            <p className="text-xs font-bold">{video.width}×{video.height}</p>
                          </div>
                        )}
                        <div className="bg-ink-50 rounded-lg p-2 text-center">
                          <p className={`text-[10px] ${textClass} flex items-center justify-center gap-1`}>
                            <FileAudio className="w-3 h-3" /> الحجم
                          </p>
                          <p className="text-xs font-bold">{formatFileSize(video.originalSize)}</p>
                        </div>
                      </div>
                    )}

                    {/* Progress */}
                    {video.status === 'extracting' && (
                      <div className="px-3 pb-3">
                        <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-center mt-1 text-ink-600">{video.progress}%</p>
                      </div>
                    )}

                    {/* Error */}
                    {video.status === 'error' && video.errorMessage && (
                      <div className="mx-3 mb-3 p-3 bg-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2 whitespace-pre-line">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {video.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Audio Result */}
                  {video.status === 'done' && video.audioUrl && (
                    <div className={`${cardClass} border rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-200`}>
                      <div className="p-3 border-b border-emerald-200 bg-emerald-50 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-sm text-emerald-800">تم استخراج الصوت بنجاح</h3>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Audio Player */}
                        <div className="flex items-center gap-3 bg-ink-50 rounded-xl p-3">
                          <button
                            onClick={togglePreview}
                            className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center shadow-lg transition flex-shrink-0"
                            aria-label={isPreviewPlaying ? 'إيقاف' : 'تشغيل'}
                          >
                            {isPreviewPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white mr-0.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Volume2 className="w-4 h-4 text-brand-500" />
                              <p className="text-xs font-bold text-ink-900 truncate">
                                معاينة الصوت ({targetFormat.toUpperCase()})
                              </p>
                            </div>
                            <audio
                              ref={audioRef}
                              src={video.audioUrl}
                              onPlay={() => setIsPreviewPlaying(true)}
                              onPause={() => setIsPreviewPlaying(false)}
                              onEnded={() => setIsPreviewPlaying(false)}
                              controls
                              className="w-full h-8"
                            />
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass}`}>الحجم الجديد</p>
                            <p className="text-xs font-bold text-emerald-700">
                              {video.audioSize ? formatFileSize(video.audioSize) : '—'}
                            </p>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-emerald-600">وفرت</p>
                            <p className="text-xs font-bold text-emerald-700">{savings}%</p>
                          </div>
                        </div>

                        {/* Download */}
                        <button
                          onClick={downloadAudio}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          تحميل الصوت ({targetFormat.toUpperCase()})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة استخراج الصوت من الفيديو؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              <strong>أداة استخراج الصوت من الفيديو</strong> من intooly هي أداة مجانية تعمل بالكامل في متصفحك
              باستخدام <strong>FFmpeg.wasm</strong>. تتيح لك <strong>سحب الصوت من أي فيديو</strong> وتحويله إلى
              صيغة صوتية منفصلة (MP3, WAV, AAC, M4A, OGG, FLAC) — <strong>بدون رفع فيديوهاتك إلى أي خادم</strong>
              وبدون تثبيت أي برنامج.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              مثالية لـ <strong>تفريغ المقابلات</strong>، <strong>استخراج الموسيقى</strong> من الفيديوهات،
              <strong> تحويل المحاضرات</strong> إلى بودكاست، و<strong> فصل الصوت</strong> لأغراض المونتاج.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الفرق بين صيغ الصوت
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-ink-300 rounded-lg text-right">
                <thead className="bg-brand-100">
                  <tr>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الصيغة</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الجودة</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الحجم</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الأفضل لـ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'MP3', q: 'جيدة', s: 'صغير', u: 'الاستخدام العام، البودكاست' },
                    { f: 'WAV', q: 'ممتازة', s: 'كبير جداً', u: 'المونتاج، التحرير الاحترافي' },
                    { f: 'AAC', q: 'ممتازة', s: 'صغير', u: 'الجودة العالية بحجم صغير' },
                    { f: 'M4A', q: 'ممتازة', s: 'صغير', u: 'آبل، iOS، iTunes' },
                    { f: 'OGG', q: 'جيدة', s: 'صغير', u: 'الويب مفتوح المصدر' },
                    { f: 'FLAC', q: 'بدون ضياع', s: 'كبير', u: 'الأرشفة الاحترافية' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm font-bold text-brand-600">{row.f}</td>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm">{row.q}</td>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm">{row.s}</td>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm">{row.u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              حالات استخدام استخراج الصوت
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '🎙️', title: 'لصنّاع البودكاست', desc: 'استخرج الصوت من مقابلات الفيديو لتحويلها إلى حلقات بودكاست.' },
                { icon: '🎬', title: 'للمونتاج', desc: 'افصل الصوت عن الفيديو لمعالجته بشكل منفصل في Adobe Audition أو Audacity.' },
                { icon: '📚', title: 'للطلاب', desc: 'حوّل محاضرات الفيديو إلى ملفات صوتية للاستماع أثناء التنقل.' },
                { icon: '🎵', title: 'للموسيقيين', desc: 'استخرج الموسيقى من الفيديوهات الموسيقية بجودة عالية.' },
                { icon: '📱', title: 'للمحتوى الطويل', desc: 'حوّل فيديوهات يوتيوب الطويلة إلى ملفات MP3 صغيرة.' },
                { icon: '🏢', title: 'للاجتماعات', desc: 'استخرج الصوت من تسجيلات الاجتماعات لتفريغها أو أرشفتها.' },
              ].map((use, i) => (
                <div key={i} className={`${cardClass} border rounded-2xl p-5 text-right hover:shadow-md transition-all`}>
                  <div className="text-3xl mb-3">{use.icon}</div>
                  <h3 className="font-bold text-base mb-2 text-ink-900">{use.title}</h3>
                  <p className={`text-sm ${textClass} leading-relaxed`}>{use.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيف تستخرج الصوت في 3 خطوات؟
            </h2>
            <div className="space-y-4">
              {[
                { num: '1', title: 'حمّل الفيديو', desc: 'اسحب الفيديو أو انقر للاختيار. يدعم MP4, MOV, MKV, WebM, AVI.' },
                { num: '2', title: 'اختر الصيغة والجودة', desc: 'اختر MP3 للاستخدام العام، أو WAV للمونتاج، أو FLAC للأرشفة. حدد الجودة (64 → 320 kbps).' },
                { num: '3', title: 'استخرج وحمّل', desc: 'اضغط "ابدأ الاستخراج" وانتظر. عاين الصوت ثم حمّله.' },
              ].map((step, i) => (
                <div key={i} className={`${cardClass} border rounded-xl p-5 text-right flex gap-4`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1 text-ink-900">{step.title}</h3>
                    <p className={`text-sm ${textClass} leading-relaxed`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون حدود على عدد الفيديوهات أو حجمها.' },
                { q: 'هل تُرفع ملفاتي إلى خادم؟', a: 'لا 100%. كل المعالجة تتم محلياً في متصفحك باستخدام FFmpeg.wasm. لا نرفع أي فيديو.' },
                { q: 'ما الصيغ المدعومة؟', a: '6 صيغ: MP3, WAV, AAC, M4A, OGG, FLAC. اختر الأنسب لاحتياجك.' },
                { q: 'ما أفضل صيغة للاستخدام العام؟', a: 'MP3 بجودة 192 kbps — توافق عالمي وحجم صغير.' },
                { q: 'ما الفرق بين 128 kbps و 320 kbps؟', a: '320 kbps يعني جودة أعلى وحجم أكبر (للموسيقى). 128 kbps مناسب للكلام والبودكاست.' },
                { q: 'هل يمكن استخراج الصوت من مقطع محدد فقط؟', a: 'نعم، فعّل خيار "استخراج من مقطع محدد" وحدد وقت البداية والنهاية.' },
                { q: 'لماذا أول استخراج يأخذ وقتاً؟', a: 'FFmpeg.wasm (~30 MB) يُحمّل مرة واحدة فقط. بعدها الاستخراج يبدأ فوراً.' },
                { q: 'هل يعمل على الجوال؟', a: 'نعم، الأداة متجاوبة 100% وتعمل على الجوال والتابلت والكمبيوتر.' },
              ].map((faq, i) => (
                <details key={i} className={`${cardClass} border rounded-xl overflow-hidden group`}>
                  <summary className="p-4 cursor-pointer font-bold flex justify-between items-center text-ink-900 hover:bg-brand-50 transition text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-brand-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className={`px-4 pb-4 text-sm ${textClass} border-t border-ink-100 pt-3 leading-relaxed text-right`}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Film, title: 'ضغط الفيديو', href: '/tools/video-compressor', desc: 'قلّل حجم الفيديو' },
                { icon: Scissors, title: 'قص الفيديو', href: '/tools/video-trimmer', desc: 'قص بدقة الإطار' },
                { icon: FileArchive, title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل حجم الصور' },
                { icon: Wand2, title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className={`${cardClass} border p-5 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block`}
                >
                  <tool.icon className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className={`text-xs ${textClass} mt-1`}>{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'هل أداة استخراج الصوت مجانية؟',
                acceptedAnswer: { '@type': 'Answer', text: 'نعم، مجانية 100% وبدون حدود على عدد الفيديوهات.' },
              },
              {
                '@type': 'Question',
                name: 'هل تُرفع فيديوهاتي إلى خادم؟',
                acceptedAnswer: { '@type': 'Answer', text: 'لا، كل المعالجة تتم محلياً في متصفحك باستخدام FFmpeg.wasm.' },
              },
              {
                '@type': 'Question',
                name: 'ما هي الصيغ المدعومة لاستخراج الصوت؟',
                acceptedAnswer: { '@type': 'Answer', text: 'ندعم 6 صيغ: MP3, WAV, AAC, M4A, OGG, FLAC.' },
              },
              {
                '@type': 'Question',
                name: 'ما أفضل صيغة للاستخدام العام؟',
                acceptedAnswer: { '@type': 'Answer', text: 'MP3 بجودة 192 kbps — توافق عالمي وحجم صغير.' },
              },
              {
                '@type': 'Question',
                name: 'هل يمكن استخراج الصوت من مقطع محدد؟',
                acceptedAnswer: { '@type': 'Answer', text: 'نعم، فعّل خيار "استخراج من مقطع محدد" وحدد وقت البداية والنهاية.' },
              },
              {
                '@type': 'Question',
                name: 'لماذا أول استخراج يأخذ وقتاً؟',
                acceptedAnswer: { '@type': 'Answer', text: 'FFmpeg.wasm (~30 MB) يُحمّل مرة واحدة فقط، بعدها الاستخراج يبدأ فوراً.' },
              },
            ],
          }),
        }}
      />
    </div>
  );
}