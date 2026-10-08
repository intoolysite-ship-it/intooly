'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Video, Sparkles,
  ChevronDown, Trash2, CheckCircle2, Wand2,
  Loader2, AlertCircle, FileArchive, Film, Gauge,
  Maximize2, RotateCcw, RefreshCw, ArrowRightLeft
} from 'lucide-react';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع
// ============================================================
type VideoFormat = 'mp4' | 'webm' | 'mov' | 'mkv' | 'avi';
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
  { id: 'mp4', name: 'MP4', desc: 'الأكثر توافقاً', icon: '🎬', mime: 'video/mp4' },
  { id: 'webm', name: 'WebM', desc: 'للويب (VP8)', icon: '🌐', mime: 'video/webm' },
  { id: 'mov', name: 'MOV', desc: 'لآبل', icon: '🍎', mime: 'video/quicktime' },
  { id: 'mkv', name: 'MKV', desc: 'جودة عالية', icon: '📦', mime: 'video/x-matroska' },
  { id: 'avi', name: 'AVI', desc: 'قديم', icon: '📼', mime: 'video/x-msvideo' },
];

const QUALITY_PRESETS: { id: QualityPreset; name: string; desc: string; crf: number; icon: string }[] = [
  { id: 'high', name: 'عالية', desc: 'جودة ممتازة', crf: 20, icon: '💎' },
  { id: 'medium', name: 'متوسطة', desc: 'متوازنة', crf: 23, icon: '⚖️' },
  { id: 'low', name: 'منخفضة', desc: 'حجم أصغر', crf: 28, icon: '🗜️' },
];

const FFMPEG_CDNS = [
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.skypack.dev/@ffmpeg/core@0.12.6/dist/umd',
];

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

  // ===== Toast =====
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
      const { toBlobURL } = await import('@ffmpeg/util');

      let lastError: Error | null = null;

      for (const baseUrl of FFMPEG_CDNS) {
        try {
          if (signal?.aborted) throw new Error('تم الإلغاء');

          console.log(`[FFmpeg] محاولة ${baseUrl}...`);

          const ffmpeg = new FFmpeg();

          ffmpeg.on('progress', ({ progress }: { progress: number }) => {
            setVideo(prev => ({ ...prev, progress: Math.round(progress * 100) }));
          });

          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
          });

          console.log(`[FFmpeg] ✅ نجح التحميل من ${baseUrl}`);
          ffmpegRef.current = ffmpeg;
          setFfmpegLoaded(true);
          setFfmpegLoading(false);
          return ffmpeg;
        } catch (error) {
          if (signal?.aborted) {
            setFfmpegLoading(false);
            throw new Error('تم الإلغاء');
          }
          console.warn(`[FFmpeg] ❌ فشل ${baseUrl}:`, error);
          lastError = error as Error;
        }
      }

      throw new Error(
        'فشل تحميل FFmpeg من جميع الخوادم.\n' +
        'تأكد من:\n' +
        '1. إعدادات CORS في next.config.js\n' +
        '2. اتصال الإنترنت\n' +
        '3. عدم حجب CDN'
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
        args.push('-c:v', 'libx264');
        args.push('-crf', String(crf));
        args.push('-preset', 'fast');
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
        args.push('-movflags', '+faststart');
      } else if (targetFormat === 'webm') {
        args.push('-c:v', 'libvpx');
        args.push('-b:v', '1M');
        args.push('-maxrate', '2M');
        args.push('-bufsize', '4M');
        args.push('-deadline', 'realtime');
        args.push('-cpu-used', '5');
        args.push('-c:a', 'libvorbis');
        args.push('-b:a', '128k');
      } else if (targetFormat === 'mov') {
        args.push('-c:v', 'libx264');
        args.push('-crf', String(crf));
        args.push('-preset', 'fast');
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
      } else if (targetFormat === 'mkv') {
        args.push('-c:v', 'libx264');
        args.push('-crf', String(crf));
        args.push('-preset', 'fast');
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k');
      } else if (targetFormat === 'avi') {
        args.push('-c:v', 'mpeg4');
        args.push('-q:v', '5');
        args.push('-c:a', 'libmp3lame');
        args.push('-b:a', '128k');
      }

      args.push('-threads', '1');
      args.push('-max_muxing_queue_size', '1024');

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
          console.log('[FFmpeg] إعادة تعيين بعد نفاد الذاكرة...');
          try {
            ffmpegRef.current?.terminate?.();
          } catch {}
          ffmpegRef.current = null;
          setFfmpegLoaded(false);

          errorMessage = '❌ الذاكرة غير كافية.\n\nالحلول:\n• اختر "أقصى دقة" 480p\n• جودة "منخفضة"\n• جرب MP4 بدل WebM (أخف بكثير)\n• استخدم فيديو أصغر';
        } else if (error.message.includes('Aborted')) {
          errorMessage = 'تم إلغاء العملية';
        } else {
          errorMessage = error.message;
        }
      }

      setVideo(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
      }));
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
      saveAs(blob, `converted_${video.file?.name.replace(/\.[^.]+$/, '')}_intoooly.${targetFormat}`);
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
          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.05); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(234, 179, 8, 0); }
          }
          @keyframes icon-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-6deg); }
            75% { transform: rotate(6deg); }
          }
          .hero-icon-wrapper {
            animation: gentle-bounce 3s ease-in-out infinite, glow-pulse 3s ease-in-out infinite;
          }
          .hero-icon-wrapper:hover .hero-icon {
            animation: icon-wiggle 0.6s ease-in-out;
          }
        `}</style>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
              <div className="hero-icon-wrapper w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <ArrowRightLeft className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                تحويل صيغ الفيديو
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              FFmpeg.wasm • محلياً 100% • بدون رفع
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              حوّل فيديوهاتك بين MP4, WebM, MOV, MKV, AVI
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🔄', title: '5 صيغ', desc: 'MP4, WebM, MOV, MKV, AVI' },
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
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, MKV, WebM, AVI — حتى 500 MB</p>
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

                {/* ========== RIGHT: Video Preview ========== */}
                <div className="space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="p-3 border-b border-ink-200/20 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1 text-ink-900">{video.file.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={loadNewVideo}
                          className="p-1.5 hover:bg-brand-100 rounded-lg transition"
                          title="تحميل فيديو جديد"
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
                        <button
                          onClick={downloadVideo}
                          className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> تحميل الفيديو المحوّل ({targetFormat.toUpperCase()})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========== LEFT: Settings ========== */}
                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-ink-900">
                        <Sparkles className="w-5 h-5 text-brand-500" /> إعدادات التحويل
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        ⚡ فوري
                      </span>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block text-ink-900">الصيغة الهدف</label>
                      <div className="grid grid-cols-2 gap-2">
                        {FORMATS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setTargetFormat(f.id)}
                            disabled={video.originalFormat === f.id}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              targetFormat === f.id
                                ? 'border-brand-500 bg-brand-50 shadow-md'
                                : video.originalFormat === f.id
                                ? 'border-ink-200 opacity-50 cursor-not-allowed'
                                : 'border-ink-200'
                            }`}
                          >
                            <div className="text-2xl mb-1">{f.icon}</div>
                            <p className="text-xs font-bold text-ink-900">{f.name}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{f.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                        <Gauge className="w-4 h-4 text-brand-500" /> الجودة
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {QUALITY_PRESETS.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => setQuality(q.id)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              quality === q.id
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-ink-200'
                            }`}
                          >
                            <div className="text-xl mb-1">{q.icon}</div>
                            <p className="text-xs font-bold text-ink-900">{q.name}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{q.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                        <Maximize2 className="w-4 h-4 text-brand-500" /> أقصى دقة (اختياري)
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { val: null, label: 'أصلي' },
                          { val: 1080, label: '1080p' },
                          { val: 720, label: '720p' },
                          { val: 480, label: '480p' },
                        ].map((opt) => (
                          <button
                            key={String(opt.val)}
                            onClick={() => setMaxResolution(opt.val)}
                            className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${
                              maxResolution === opt.val
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-ink-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-ink-500 mt-1">
                        💡 إذا واجهت خطأ "memory out of bounds"، اختر 720p أو 480p
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setTargetFormat('mp4');
                        setQuality('medium');
                        setMaxResolution(720);
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 bg-ink-100 hover:bg-ink-200 text-ink-700"
                    >
                      <RotateCcw className="w-4 h-4" /> إعادة الإعدادات
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={convertVideo}
                      disabled={video.status === 'converting' || video.status === 'loading-ffmpeg' || video.originalFormat === targetFormat}
                      className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
                    >
                      {video.status === 'loading-ffmpeg' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> تحميل FFmpeg...</>
                      ) : video.status === 'converting' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحويل... {video.progress}%</>
                      ) : video.status === 'done' ? (
                        <><CheckCircle2 className="w-5 h-5" /> تم التحويل — جرب صيغة أخرى</>
                      ) : (
                        <><ArrowRightLeft className="w-5 h-5" /> ابدأ التحويل</>
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
                        <strong className="text-ink-900">ملاحظة:</strong> FFmpeg.wasm سيُحمّل عند أول تحويل (~30 MB). تأكد من إعدادات CORS في <code className="bg-ink-100 px-1 rounded">next.config.js</code>.
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
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة تحويل صيغ الفيديو؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              <strong>أداة تحويل صيغ الفيديو</strong> من intooly هي حل احترافي يعمل بالكامل في متصفحك
              باستخدام <strong>FFmpeg.wasm</strong> — نسخة كاملة من FFmpeg مُترجمة إلى WebAssembly.
              هذا يعني أن <strong>فيديوهاتك لا تُرفع إلى أي خادم</strong>، بل تُحوّل محلياً على جهازك.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              تدعم الأداة التحويل بين <strong>MP4</strong>، <strong>WebM</strong>، <strong>MOV</strong>،
              <strong> MKV</strong>، و<strong> AVI</strong> — أشهر صيغ الفيديو في العالم.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الفرق بين صيغ الفيديو
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-ink-300 rounded-lg text-right">
                <thead className="bg-brand-100">
                  <tr>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الصيغة</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">التوافق</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الحجم</th>
                    <th className="border border-ink-300 p-3 text-xs md:text-sm font-bold">الأفضل لـ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { f: 'MP4', c: 'عالمي', s: 'صغير', u: 'الويب، السوشيال ميديا' },
                    { f: 'WebM', c: 'المتصفحات', s: 'صغير جداً', u: 'تضمين الويب' },
                    { f: 'MOV', c: 'آبل', s: 'كبير', u: 'التحرير' },
                    { f: 'MKV', c: 'سطح المكتب', s: 'متغير', u: 'الأرشفة' },
                    { f: 'AVI', c: 'ويندوز قديم', s: 'كبير جداً', u: 'الأنظمة القديمة' },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm font-bold text-brand-600">{row.f}</td>
                      <td className="border border-ink-300 p-3 text-xs md:text-sm">{row.c}</td>
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
              الميزات الاحترافية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🔄', title: '5 صيغ مدعومة', desc: 'MP4, WebM, MOV, MKV, AVI' },
                { icon: '🔒', title: 'خصوصية كاملة 100%', desc: 'فيديوهاتك لا تترك جهازك' },
                { icon: '🎬', title: 'FFmpeg.wasm', desc: 'نفس FFmpeg الأصلي' },
                { icon: '⚙️', title: '3 مستويات جودة', desc: 'عالية، متوسطة، منخفضة' },
                { icon: '⚡', title: 'سريع', desc: 'يعمل محلياً بدون انتظار' },
                { icon: '📱', title: 'جميع الأجهزة', desc: 'جوال، تابلت، كمبيوتر' },
              ].map((f, i) => (
                <div key={i} className={`${cardClass} border rounded-xl p-4 text-right`}>
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className={`text-xs ${textClass} leading-relaxed`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيفية تحويل صيغة الفيديو — 4 خطوات
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'اختر الفيديو', desc: 'اسحب الفيديو أو انقر للاختيار. يدعم MP4, MOV, MKV, WebM, AVI.' },
                { num: 2, title: 'اختر الصيغة الهدف', desc: 'MP4 للتوافق، WebM للويب، MOV لآبل، MKV للأرشفة، AVI للأنظمة القديمة.' },
                { num: 3, title: 'اضبط الجودة والأبعاد', desc: 'اختر الجودة وأقصى دقة (للأداء الأفضل).' },
                { num: 4, title: 'حمّل الفيديو', desc: 'حمّل الفيديو المحوّل بالصيغة المطلوبة.' },
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
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون حدود على عدد الفيديوهات.' },
                { q: 'هل فيديوهاتي آمنة؟', a: 'نعم 100%. كل المعالجة تتم محلياً في متصفحك باستخدام FFmpeg.wasm.' },
                { q: 'ما الصيغ المدعومة؟', a: 'ندعم التحويل بين MP4، WebM، MOV، MKV، AVI.' },
                { q: 'ما أفضل صيغة للتوافق؟', a: 'MP4 (H.264) — تعمل على جميع الأجهزة والمتصفحات والهواتف.' },
                { q: 'ما الفرق بين MKV و MP4؟', a: 'MKV يدعم تعدد المسارات والجودة العالية، لكن توافقه أقل. MP4 أكثر توافقاً.' },
                { q: 'لماذا أول تحويل يأخذ وقتاً؟', a: 'FFmpeg.wasm (~30 MB) يُحمّل مرة واحدة فقط.' },
                { q: 'ظهر خطأ "memory out of bounds" — ما الحل؟', a: 'الذاكرة غير كافية. اختر "أقصى دقة" 720p أو 480p، وجودة "منخفضة". أو جرب MP4 بدل WebM.' },
                { q: 'هل يعمل على الجوال؟', a: 'نعم، لكن الأداء يعتمد على قوة الجهاز. Chrome و Edge أفضل.' },
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
                { icon: Video, title: 'قص الفيديو', href: '/tools/video-trimmer', desc: 'قص بداية أو نهاية' },
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
    </div>
  );
}