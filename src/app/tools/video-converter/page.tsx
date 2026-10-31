'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload, Download, Video, Sparkles,
  ChevronDown, Trash2, CheckCircle2, Wand2,
  Loader2, AlertCircle, FileArchive, Film, Gauge,
  Maximize2, RotateCcw, RefreshCw, ArrowRightLeft
} from 'lucide-react';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع
// ============================================================
type VideoFormat =
  | 'mp4' | 'webm' | 'mov' | 'mkv' | 'avi'
  | 'gif' | 'mpeg' | 'ts' | 'flv' | 'vob' | 'wmv';
type QualityPreset = 'high' | 'medium' | 'low';

type VideoState = {
  file: File | null;
  originalUrl: string | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number | null;
  duration: number | null;
  width: number | null;
  height: number | null;
  originalFormat: string | null;
  status: 'idle' | 'loading-ffmpeg' | 'converting' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
};

// ============================================================
// ✅ الثوابت
// ============================================================
const FORMATS: { id: VideoFormat; name: string; desc: string; icon: string; mime: string }[] = [
  { id: 'mp4',  name: 'MP4',  desc: 'الأكثر توافقاً', icon: '🎬', mime: 'video/mp4' },
  { id: 'webm', name: 'WebM', desc: 'للويب (VP8)',   icon: '🌐', mime: 'video/webm' },
  { id: 'mov',  name: 'MOV',  desc: 'لآبل',          icon: '🍎', mime: 'video/quicktime' },
  { id: 'mkv',  name: 'MKV',  desc: 'جودة عالية',   icon: '📦', mime: 'video/x-matroska' },
  { id: 'avi',  name: 'AVI',  desc: 'قديم',          icon: '📼', mime: 'video/x-msvideo' },
  { id: 'gif',  name: 'GIF',  desc: 'صور متحركة',   icon: '🎞️', mime: 'image/gif' },
  { id: 'mpeg', name: 'MPEG', desc: 'MPEG-2',        icon: '📹', mime: 'video/mpeg' },
  { id: 'ts',   name: 'TS',   desc: 'بث مباشر',     icon: '📡', mime: 'video/mp2t' },
  { id: 'flv',  name: 'FLV',  desc: 'Flash',         icon: '🔷', mime: 'video/x-flv' },
  { id: 'vob',  name: 'VOB',  desc: 'DVD',           icon: '💿', mime: 'video/dvd' },
  { id: 'wmv',  name: 'WMV',  desc: 'Windows Media', icon: '🪟', mime: 'video/x-ms-wmv' },
];

const QUALITY_PRESETS: { id: QualityPreset; name: string; desc: string; crf: number; icon: string }[] = [
  { id: 'high', name: 'عالية', desc: 'جودة ممتازة', crf: 20, icon: '💎' },
  { id: 'medium', name: 'متوسطة', desc: 'متوازنة', crf: 23, icon: '⚖️' },
  { id: 'low', name: 'منخفضة', desc: 'حجم أصغر', crf: 28, icon: '🗜️' },
];

const LOCAL_FFMPEG_BASE = '/assets/ffmpeg';

// ============================================================
// ✅ المكوّن الرئيسي
// ============================================================
export default function VideoConverterPage() {
  const [video, setVideo] = useState<VideoState>({
    file: null,
    originalUrl: null,
    convertedUrl: null,
    originalSize: 0,
    convertedSize: null,
    duration: null,
    width: null,
    height: null,
    originalFormat: null,
    status: 'idle',
    progress: 0,
  });

  const [targetFormat, setTargetFormat] = useState<VideoFormat>('mp4');
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [maxResolution, setMaxResolution] = useState<number | null>(720);
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({
    message: '', visible: false, isError: false,
  });
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

  // ============================================================
  // ✅ تحميل FFmpeg
  // ============================================================
  const loadFFmpeg = useCallback(async (signal?: AbortSignal) => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (ffmpegLoading) throw new Error('FFmpeg يُحمّل بالفعل...');

    setFfmpegLoading(true);

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      let lastError: Error | null = null;

      try {
        if (signal?.aborted) throw new Error('تم الإلغاء');
        console.log('[FFmpeg] تحميل من الملفات المحلية...');
        const ffmpeg = new FFmpeg();

        ffmpeg.on('progress', ({ progress }: { progress: number }) => {
          setVideo(prev => ({ ...prev, progress: Math.round(progress * 100) }));
        });

        const origin = typeof window !== 'undefined' ? window.location.origin : '';

        await ffmpeg.load({
          coreURL: `${origin}${LOCAL_FFMPEG_BASE}/ffmpeg-core.js`,
          wasmURL: `${origin}${LOCAL_FFMPEG_BASE}/ffmpeg-core.wasm`,
          classWorkerURL: `${origin}${LOCAL_FFMPEG_BASE}/worker.js`,
        });

        console.log('[FFmpeg] ✅ نجح التحميل');
        ffmpegRef.current = ffmpeg;
        setFfmpegLoaded(true);
        setFfmpegLoading(false);
        return ffmpeg;
      } catch (error) {
        if (signal?.aborted) {
          setFfmpegLoading(false);
          throw new Error('تم الإلغاء');
        }
        console.warn('[FFmpeg] ❌ فشل التحميل:', error);
        lastError = error as Error;
      }

      throw new Error(
        'فشل تحميل FFmpeg.\n' +
        'تأكد من وجود ملفات FFmpeg في public/assets/ffmpeg/\n' +
        'الخطأ: ' + (lastError?.message || 'غير معروف')
      );
    } catch (error) {
      setFfmpegLoading(false);
      console.error('FFmpeg load error:', error);
      throw error;
    }
  }, [ffmpegLoading]);

  // ============================================================
  // ✅ استخراج بيانات الفيديو
  // ============================================================
  const probeVideo = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => reject(new Error('فشل قراءة بيانات الفيديو'));
      video.src = URL.createObjectURL(file);
    });
  };

  // ============================================================
  // ✅ اختيار الفيديو
  // ============================================================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('❌ الملف ليس فيديو', true);
      return;
    }

    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    setVideo({
      file,
      originalUrl: URL.createObjectURL(file),
      convertedUrl: null,
      originalSize: file.size,
      convertedSize: null,
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

      const fileSizeMB = file.size / (1024 * 1024);
      const pixels = meta.width * meta.height;

      if (pixels > 3840 * 2160 || fileSizeMB > 100) {
        setMaxResolution(480);
      } else if (pixels > 1920 * 1080 || fileSizeMB > 50) {
        setMaxResolution(720);
      } else if (pixels > 1280 * 720 || fileSizeMB > 20) {
        setMaxResolution(1080);
      }
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
    if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);

    setVideo({
      file: null,
      originalUrl: null,
      convertedUrl: null,
      originalSize: 0,
      convertedSize: null,
      duration: null,
      width: null,
      height: null,
      originalFormat: null,
      status: 'idle',
      progress: 0,
    });

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 100);

    showToast('✅ جاهز لتحميل فيديو جديد');
  }, [video, showToast]);

  // ============================================================
  // ✅ تحويل الفيديو
  // ============================================================
  const convertVideo = async () => {
    if (!video.file) {
      showToast('❌ يرجى اختيار فيديو أولاً', true);
      return;
    }

    if (video.originalFormat === targetFormat) {
      showToast('⚠️ الفيديو بنفس الصيغة المطلوبة', true);
      return;
    }

    const fileSizeMB = video.file.size / (1024 * 1024);
    const pixels = (video.width || 0) * (video.height || 0);

    if (fileSizeMB > 100) {
      const confirmed = confirm(
        `⚠️ الفيديو كبير جداً (${fileSizeMB.toFixed(1)} MB)\n\n` +
        `قد يفشل التحويل أو يستغرق وقتاً طويلاً.\n\n` +
        `يُنصح بـ:\n` +
        `• اختيار "أقصى دقة 480p"\n` +
        `• جودة "منخفضة"\n` +
        `• تجربة MP4 بدل WebM\n\n` +
        `هل تريد المتابعة؟`
      );
      if (!confirmed) return;
    } else if (pixels > 1920 * 1080 && !maxResolution) {
      const confirmed = confirm(
        `⚠️ الفيديو بدقة عالية (${video.width}×${video.height})\n\n` +
        `قد يفشل التحويل بسبب نفاد ذاكرة FFmpeg.\n\n` +
        `يُنصح باختيار "أقصى دقة 1080p" أو أقل.\n\n` +
        `هل تريد المتابعة؟`
      );
      if (!confirmed) return;
    }

    if (!ffmpegRef.current && ffmpegLoaded) {
      console.log('[FFmpeg] إعادة تعيين...');
      setFfmpegLoaded(false);
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setVideo(prev => ({ ...prev, status: 'loading-ffmpeg', progress: 0 }));

    try {
      const ffmpeg = await loadFFmpeg(signal);
      if (signal.aborted) return;

      const { fetchFile } = await import('@ffmpeg/util');

      setVideo(prev => ({ ...prev, status: 'converting', progress: 5 }));

      const inputExt = video.file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${targetFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(video.file));

      const crf = QUALITY_PRESETS.find(q => q.id === quality)?.crf || 23;
      const args: string[] = ['-i', inputName];

      if (maxResolution) {
        args.push('-vf', `scale=-2:${maxResolution}`);
      }

      if (targetFormat === 'mp4') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast');
        args.push('-c:a', 'aac', '-b:a', '128k');
        args.push('-movflags', '+faststart');
      } else if (targetFormat === 'webm') {
        args.push('-c:v', 'libvpx', '-b:v', '1M', '-maxrate', '2M', '-bufsize', '4M');
        args.push('-deadline', 'realtime', '-cpu-used', '5');
        args.push('-c:a', 'libvorbis', '-b:a', '128k');
      } else if (targetFormat === 'mov') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast');
        args.push('-c:a', 'aac', '-b:a', '128k');
      } else if (targetFormat === 'mkv') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast');
        args.push('-c:a', 'aac', '-b:a', '128k');
      } else if (targetFormat === 'avi') {
        args.push('-c:v', 'mpeg4', '-q:v', '5');
        args.push('-c:a', 'libmp3lame', '-b:a', '128k');
      } else if (targetFormat === 'gif') {
        args.length = 0;
        args.push('-i', inputName);
        args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse');
        args.push('-loop', '0');
      } else if (targetFormat === 'mpeg') {
        args.push('-c:v', 'mpeg2video', '-q:v', '5');
        args.push('-c:a', 'mp2', '-b:a', '192k');
      } else if (targetFormat === 'ts') {
        args.push('-c:v', 'mpeg2video', '-q:v', '5');
        args.push('-c:a', 'mp2', '-b:a', '192k');
        args.push('-f', 'mpegts');
      } else if (targetFormat === 'flv') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast');
        args.push('-c:a', 'aac', '-b:a', '128k');
      } else if (targetFormat === 'vob') {
        args.push('-c:v', 'mpeg2video', '-q:v', '5');
        args.push('-c:a', 'mp2', '-b:a', '192k');
      } else if (targetFormat === 'wmv') {
        args.push('-c:v', 'msmpeg4v2', '-q:v', '5');
        args.push('-c:a', 'wmav2', '-b:a', '128k');
      }

      args.push('-threads', '1', '-max_muxing_queue_size', '1024');
      args.push(outputName);

      console.log('[FFmpeg] الأمر:', args.join(' '));
      await ffmpeg.exec(args);
      if (signal.aborted) return;

      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'video/mp4';
      const blob = new Blob([data.buffer], { type: mime });

      if (blob.size === 0) {
        throw new Error('الملف الناتج فارغ. جرب إعدادات مختلفة.');
      }

      if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);

      setVideo(prev => ({
        ...prev,
        convertedUrl: URL.createObjectURL(blob),
        convertedSize: blob.size,
        status: 'done',
        progress: 100,
      }));

      showToast('✅ تم التحويل بنجاح!');
    } catch (error) {
      if (signal.aborted) return;

      console.error('Conversion error:', error);

      let errorMessage = 'فشل التحويل';
      if (error instanceof Error) {
        if (error.message.includes('memory access out of bounds')) {
          try { ffmpegRef.current?.terminate?.(); } catch {}
          ffmpegRef.current = null;
          setFfmpegLoaded(false);
          errorMessage = '❌ الذاكرة غير كافية.\n\nالحلول:\n• اختر "أقصى دقة" 480p\n• جودة "منخفضة"\n• جرب MP4 بدل WebM\n• استخدم فيديو أصغر';
        } else if (error.message.includes('Aborted')) {
          errorMessage = 'تم إلغاء العملية';
        } else {
          errorMessage = error.message;
        }
      }

      setVideo(prev => ({ ...prev, status: 'error', errorMessage }));
      showToast('❌ فشل تحويل الفيديو', true);
    } finally {
      abortControllerRef.current = null;
    }
  };

  // ============================================================
  // ✅ التحميل
  // ============================================================
  const downloadVideo = async () => {
    if (!video.convertedUrl) return;
    try {
      const response = await fetch(video.convertedUrl);
      const blob = await response.blob();
      saveAs(blob, `converted_${video.file?.name.replace(/\.[^.]+$/, '')}_intooly.${targetFormat}`);
      showToast('✅ بدأ التنزيل');
    } catch (e) {
      console.error('Download error:', e);
      showToast('❌ فشل التنزيل', true);
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

  const savings = video.convertedSize && video.originalSize
    ? Math.round(((video.originalSize - video.convertedSize) / video.originalSize) * 100)
    : 0;

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-2xl z-50 max-w-lg text-center ${
          toast.isError ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/video"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات الفيديو
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <ArrowRightLeft className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                تحويل صيغ الفيديو
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                حوّل فيديوهاتك بين 11 صيغة — FFmpeg.wasm، محلياً 100%، بدون رفع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🔄', title: '11 صيغة', desc: 'MP4, WebM, MOV, MKV, AVI + 6' },
              { icon: '🔒', title: 'محلي 100%', desc: 'فيديوهاتك لا ترفع' },
              { icon: '🎬', title: 'FFmpeg.wasm', desc: 'تحويل احترافي' },
              { icon: '⚡', title: '3 جودات', desc: 'عالية، متوسطة، منخفضة' },
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
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اختر فيديو لتحويله</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, MKV, WebM, AVI + 6 صيغ إضافية — حتى 500 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

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
                        <span className="font-bold text-emerald-600">بعدها:</span> تحويل سريع حسب حجم الفيديو
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                <div className="space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="p-3 border-b border-ink-200/20 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1 text-ink-900">{video.file.name}</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={loadNewVideo} className="p-1.5 hover:bg-brand-100 rounded-lg transition" title="تحميل فيديو جديد">
                          <RefreshCw className="w-4 h-4 text-brand-500" />
                        </button>
                        <button onClick={loadNewVideo} className="p-1.5 hover:bg-red-100 rounded-lg transition" title="حذف">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3">
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                          الأصلية {video.originalFormat?.toUpperCase()}
                        </div>
                        <video src={video.originalUrl || ''} controls className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-900" />
                        <p className="text-[10px] text-center mt-1 font-semibold text-ink-600">
                          {formatFileSize(video.originalSize)}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                          {video.status === 'done' ? `المحوّلة ${targetFormat.toUpperCase()}` : 'جاري...'}
                        </div>
                        {video.convertedUrl ? (
                          <>
                            <video src={video.convertedUrl} controls className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-900" />
                            <p className="text-[10px] text-center mt-1 font-semibold text-green-600">
                              {video.convertedSize ? formatFileSize(video.convertedSize) : '...'}
                            </p>
                          </>
                        ) : (
                          <div className="w-full h-48 md:h-80 flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200">
                            {video.status === 'converting' || video.status === 'loading-ffmpeg' ? (
                              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                            ) : (
                              <Film className="w-8 h-8 text-brand-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {(video.duration || video.width) && (
                      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                        {video.duration && (
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass}`}>المدة</p>
                            <p className="text-xs font-bold">{formatDuration(video.duration)}</p>
                          </div>
                        )}
                        {video.width && video.height && (
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass}`}>الأبعاد</p>
                            <p className="text-xs font-bold">{video.width}×{video.height}</p>
                          </div>
                        )}
                        {video.convertedSize && (
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-green-600">وفرت</p>
                            <p className="text-xs font-bold text-green-700">{savings}%</p>
                          </div>
                        )}
                      </div>
                    )}

                    {video.status === 'error' && (
                      <div className="mx-3 mb-3 p-3 bg-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2 whitespace-pre-line">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {video.errorMessage}
                      </div>
                    )}

                    {video.status === 'converting' && (
                      <div className="px-3 pb-3">
                        <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${video.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-center mt-1 text-ink-600">{video.progress}%</p>
                      </div>
                    )}

                    {video.status === 'done' && video.convertedUrl && (
                      <div className="px-3 pb-3">
                        <button onClick={downloadVideo} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" /> تحميل الفيديو المحوّل ({targetFormat.toUpperCase()})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-ink-900">
                        <Wand2 className="w-5 h-5 text-brand-500" />
                        إعدادات التحويل
                      </h3>
                      <button 
                        onClick={() => {
                          setQuality('medium');
                          setMaxResolution(720);
                          setTargetFormat('mp4');
                          showToast('✅ تمت إعادة تعيين الإعدادات');
                        }}
                        className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 font-bold"
                      >
                        <RotateCcw className="w-3 h-3" /> إعادة تعيين
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* الصيغة الهدف */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <ArrowRightLeft className="w-4 h-4 text-brand-500" />
                          الصيغة الهدف
                        </label>
                        <select
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value as VideoFormat)}
                          className="w-full p-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-bold text-ink-900 bg-white transition-all cursor-pointer"
                        >
                          {FORMATS.map((f) => (
                            <option
                              key={f.id}
                              value={f.id}
                              disabled={video.originalFormat === f.id}
                            >
                              {f.icon} {f.name} — {f.desc}
                              {video.originalFormat === f.id ? ' (نفس صيغة الأصل)' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-ink-500 mt-1.5">
                          💡 الصيغة الحالية للفيديو: <strong>{video.originalFormat?.toUpperCase()}</strong>
                        </p>
                      </div>

                      {/* الجودة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <Gauge className="w-4 h-4 text-brand-500" />
                          الجودة
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {QUALITY_PRESETS.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => setQuality(q.id)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${
                                quality === q.id
                                  ? 'border-brand-500 bg-brand-50 shadow-md'
                                  : 'border-ink-200 hover:border-brand-300'
                              }`}
                            >
                              <div className="text-xl mb-1">{q.icon}</div>
                              <p className="text-xs font-bold text-ink-900">{q.name}</p>
                              <p className="text-[10px] text-ink-500 mt-0.5">{q.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الدقة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <Maximize2 className="w-4 h-4 text-brand-500" />
                          أقصى دقة
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { val: 1080, label: '1080p', desc: 'Full HD' },
                            { val: 720, label: '720p', desc: 'HD' },
                            { val: 480, label: '480p', desc: 'SD' },
                          ].map((res) => (
                            <button
                              key={res.val}
                              onClick={() => setMaxResolution(res.val)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${
                                maxResolution === res.val
                                  ? 'border-brand-500 bg-brand-50 shadow-md'
                                  : 'border-ink-200 hover:border-brand-300'
                              }`}
                            >
                              <p className="text-sm font-bold text-ink-900">{res.label}</p>
                              <p className="text-[10px] text-ink-500 mt-0.5">{res.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* زر التحويل */}
                      <button
                        onClick={convertVideo}
                        disabled={video.status === 'converting' || video.status === 'loading-ffmpeg' || video.originalFormat === targetFormat}
                        className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 text-lg"
                      >
                        {video.status === 'loading-ffmpeg' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جارٍ تحميل المحرك...
                          </>
                        ) : video.status === 'converting' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جارٍ التحويل... {video.progress}%
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            ابدأ التحويل
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة تحويل صيغ الفيديو؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              أداة <strong>تحويل صيغ الفيديو</strong> هي حل احترافي يعمل بالكامل داخل متصفحك باستخدام تقنية 
              <strong> WebAssembly</strong> ومكتبة <strong>FFmpeg.wasm</strong>. تتيح لك تحويل فيديوهاتك بين 
              <strong> 11 صيغة مختلفة</strong> (بما في ذلك MP4, WebM, MOV, MKV, AVI, GIF, MPEG, TS, FLV, VOB, WMV) 
              دون الحاجة لرفع الملفات إلى أي خادم خارجي، مما يضمن <strong>خصوصية وأماناً بنسبة 100%</strong>.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              لماذا تختار أداتنا؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'خصوصية تامة', desc: 'لا نرفع أي فيديو. كل المعالجة تتم على جهازك مباشرة.' },
                { title: '11 صيغة مدعومة', desc: 'من MP4 الشائع إلى GIF المتحرك و VOB الخاص بـ DVD.' },
                { title: 'تحكم كامل في الجودة', desc: 'اختر بين 3 مستويات جودة ودقة تصل إلى 1080p.' },
                { title: 'مجاني وبدون حدود', desc: 'لا علامات مائية، لا تسجيل، لا حدود على عدد التحويلات.' },
              ].map((item, i) => (
                <div key={i} className={`${cardClass} border rounded-2xl p-5 text-right`}>
                  <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-500" />
                    {item.title}
                  </h3>
                  <p className={`text-sm ${textClass} leading-relaxed`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-ink-900">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {[
              { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون أي حدود على عدد الفيديوهات.' },
              { q: 'هل فيديوهاتي آمنة؟', a: 'بالتأكيد. لا نرفع أي ملف إلى خوادمنا. كل شيء يحدث محلياً في متصفحك.' },
              { q: 'لماذا يستغرق التحويل وقتاً؟', a: 'يعتمد الوقت على حجم الفيديو ودقته وقوة جهازك. أول استخدام قد يأخذ 30 ثانية لتحميل محرك FFmpeg.' },
              { q: 'ما هي أفضل صيغة للتحويل؟', a: 'MP4 هي الأكثر توافقاً مع جميع الأجهزة. WebM ممتازة للويب. GIF للصور المتحركة.' },
              { q: 'هل يمكنني تحويل فيديو بدقة 4K؟', a: 'نعم، لكن قد يستغرق وقتاً أطول ويستهلك ذاكرة أكبر. ننصح بخفض الدقة إلى 1080p أو 720p للسرعة.' },
            ].map((faq, i) => (
              <details key={i} className={`${cardClass} border rounded-xl overflow-hidden group`}>
                <summary className="p-5 cursor-pointer font-bold text-ink-900 flex justify-between items-center">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-brand-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className={`px-5 pb-5 text-sm ${textClass} border-t border-ink-100 pt-3`}>{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RELATED TOOLS ===== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-ink-900">🛠️ أدوات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileArchive, title: 'ضغط الفيديو', href: '/tools/video-compressor' },
              { icon: Film, title: 'محول الفيديو', href: '/tools/video-converter' },
              { icon: Download, title: 'فيديو إلى صوت', href: '/tools/video-to-audio' },
              { icon: Sparkles, title: 'تحويل إلى GIF', href: '/tools/video-to-gif' },
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className={`${cardClass} border p-5 rounded-2xl hover:shadow-lg hover:border-brand-400 transition-all group text-right block`}
              >
                <tool.icon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-ink-900 mb-2">{tool.title}</h3>
                <p className="text-xs text-brand-600 flex items-center gap-1">
                  جرّب الأداة <ArrowLeft className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}