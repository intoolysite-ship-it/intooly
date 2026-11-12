'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Download, Video, Sparkles, ChevronDown, Trash2,
  CheckCircle2, Wand2, Loader2, AlertCircle, Film, Gauge, RotateCcw,
  ArrowRightLeft, Shield, Zap, Smartphone, Scissors, Crop, ImageIcon,
  FileVideo, Info, TrendingDown
} from 'lucide-react';
import { saveAs } from 'file-saver';
import {
  FORMATS, QUALITY_PRESETS, RESOLUTIONS,
  LOCAL_FFMPEG_BASE,
  type VideoFormat, type QualityPreset, type Resolution
} from './constants';
import { faqQuestions } from './faq-data';

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
// ✅ المكوّن الرئيسي
// ============================================================
export default function VideoConverterPage() {
  const [video, setVideo] = useState<VideoState>({
    file: null, originalUrl: null, convertedUrl: null, originalSize: 0,
    convertedSize: null, duration: null, width: null, height: null,
    originalFormat: null, status: 'idle', progress: 0,
  });

  const [targetFormat, setTargetFormat] = useState<VideoFormat>('mp4');
  const [quality, setQuality] = useState<QualityPreset>('medium');
  const [maxResolution, setMaxResolution] = useState<Resolution>(720);
  const [targetFps, setTargetFps] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({ message: '', visible: false, isError: false });
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================================
  // ✅ Preload FFmpeg في الخلفية عند دخول الصفحة
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // تحميل مسبق بعد 2 ثانية (لا يزعج فتح الصفحة)
    const timer = setTimeout(() => {
      if (!ffmpegRef.current && !ffmpegLoading) {
        loadFFmpeg().catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

  // ============================================================
  // ✅ تحميل FFmpeg (مع دعم الخيوط المتعددة)
  // ============================================================
  const loadFFmpeg = useCallback(async (signal?: AbortSignal) => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (ffmpegLoading) throw new Error('FFmpeg يُحمّل بالفعل...');
    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
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
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setFfmpegLoading(false);
      return ffmpeg;
    } catch (error) {
      setFfmpegLoading(false);
      throw new Error('فشل تحميل FFmpeg. تأكد من وجود الملفات في public/assets/ffmpeg/');
    }
  }, [ffmpegLoading]);

  // ============================================================
  // ✅ فحص الفيديو (probe)
  // ============================================================
  const probeVideo = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
        resolve({ duration: vid.duration, width: vid.videoWidth, height: vid.videoHeight });
        URL.revokeObjectURL(vid.src);
      };
      vid.onerror = () => reject(new Error('فشل قراءة بيانات الفيديو'));
      vid.src = URL.createObjectURL(file);
    });
  };

  // ============================================================
  // ✅ معالجة اختيار الملف (مع Drag & Drop)
  // ============================================================
  const processSelectedFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      showToast('❌ الملف ليس فيديو', true);
      return;
    }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    setVideo({
      file, originalUrl: URL.createObjectURL(file), convertedUrl: null, originalSize: file.size,
      convertedSize: null, duration: null, width: null, height: null, originalFormat: ext, status: 'idle', progress: 0,
    });
    try {
      const meta = await probeVideo(file);
      setVideo(prev => ({ ...prev, duration: meta.duration, width: meta.width, height: meta.height }));
      const fileSizeMB = file.size / (1024 * 1024);
      const pixels = meta.width * meta.height;
      if (pixels > 3840 * 2160 || fileSizeMB > 100) setMaxResolution(480);
      else if (pixels > 1920 * 1080 || fileSizeMB > 50) setMaxResolution(720);
      else setMaxResolution('original');
    } catch (e) { console.warn('Probe failed:', e); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
    e.target.value = ''; // لتفريغ الحقل بعد الاختيار
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // ============================================================
  // ✅ إعادة تعيين
  // ============================================================
  const loadNewVideo = useCallback(() => {
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);
    setVideo({ file: null, originalUrl: null, convertedUrl: null, originalSize: 0, convertedSize: null, duration: null, width: null, height: null, originalFormat: null, status: 'idle', progress: 0 });
    setTimeout(() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); } }, 100);
  }, [video]);

  // ============================================================
  // ✅ تحويل الفيديو (محسّن للسرعة والدقة)
  // ============================================================
  const convertVideo = async () => {
    if (!video.file) { showToast('❌ يرجى اختيار فيديو أولاً', true); return; }
    if (video.originalFormat === targetFormat) { showToast('⚠️ الفيديو بنفس الصيغة المطلوبة', true); return; }

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

      const qPreset = QUALITY_PRESETS.find(q => q.id === quality) || QUALITY_PRESETS[1];
      const crf = qPreset.crf;
      const encoderPreset = qPreset.preset;

      const args: string[] = ['-i', inputName];

      // ✅ فلتر الدقة
      if (maxResolution !== 'original') {
        args.push('-vf', `scale=-2:${maxResolution}`);
      }

      // ✅ فلتر FPS
      if (targetFps) {
        args.push('-r', String(targetFps));
      }

      // ✅ محاولة النسخ المباشر بدون إعادة ترميز (للمتوافقات)
      const canCopyStreams = (
        (video.originalFormat === 'mp4' && (targetFormat === 'mov' || targetFormat === 'mkv')) ||
        (video.originalFormat === 'mov' && (targetFormat === 'mp4' || targetFormat === 'mkv')) ||
        (video.originalFormat === 'mkv' && (targetFormat === 'mp4' || targetFormat === 'mov'))
      ) && maxResolution === 'original' && !targetFps;

      if (canCopyStreams && (targetFormat === 'mp4' || targetFormat === 'mov' || targetFormat === 'mkv')) {
        // ⚡ تحويل فوري: نسخ المسارات دون إعادة ترميز
        args.push('-c', 'copy');
        if (targetFormat === 'mp4') args.push('-movflags', '+faststart');
      } else if (targetFormat === 'mp4') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', encoderPreset, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-threads', '4');
      } else if (targetFormat === 'webm') {
        args.push('-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', '-b:a', '128k', '-threads', '4');
      } else if (targetFormat === 'mov' || targetFormat === 'mkv') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', encoderPreset, '-c:a', 'aac', '-b:a', '128k', '-threads', '4');
      } else if (targetFormat === 'avi') {
        args.push('-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame', '-b:a', '128k');
      } else if (targetFormat === 'gif') {
        args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', '-loop', '0');
      } else if (['mpeg', 'ts', 'vob'].includes(targetFormat)) {
        args.push('-c:v', 'mpeg2video', '-q:v', '5', '-c:a', 'mp2', '-b:a', '192k');
      } else if (targetFormat === 'flv') {
        args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', encoderPreset, '-c:a', 'aac', '-b:a', '128k', '-threads', '4');
      } else if (targetFormat === 'wmv') {
        args.push('-c:v', 'msmpeg4v2', '-q:v', '5', '-c:a', 'wmav2', '-b:a', '128k');
      }

      if (targetFormat === 'ts') args.push('-f', 'mpegts');
      args.push('-max_muxing_queue_size', '1024', outputName);

      await ffmpeg.exec(args);
      if (signal.aborted) return;

      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'video/mp4';
      const blob = new Blob([data.buffer], { type: mime });
      if (blob.size === 0) throw new Error('الملف الناتج فارغ. جرب إعدادات مختلفة.');

      if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);
      setVideo(prev => ({ ...prev, convertedUrl: URL.createObjectURL(blob), convertedSize: blob.size, status: 'done', progress: 100 }));
      showToast('✅ تم التحويل بنجاح!');
    } catch (error: any) {
      if (signal.aborted) return;
      let errorMessage = 'فشل التحويل';
      if (error.message?.includes('memory access out of bounds')) {
        ffmpegRef.current = null; setFfmpegLoaded(false);
        errorMessage = '❌ الذاكرة غير كافية. جرّب تقليل الدقة إلى 480p أو استخدام جودة منخفضة.';
      } else if (error.message) errorMessage = error.message;
      setVideo(prev => ({ ...prev, status: 'error', errorMessage }));
      showToast('❌ فشل تحويل الفيديو', true);
    } finally {
      // ✅ تنظيف الملفات المؤقتة
      try {
        const ffmpeg = ffmpegRef.current;
        if (ffmpeg) {
          const ext = video.file?.name.split('.').pop()?.toLowerCase() || 'mp4';
          await ffmpeg.deleteFile(`input.${ext}`).catch(() => {});
          await ffmpeg.deleteFile(`output.${targetFormat}`).catch(() => {});
        }
      } catch {}
      abortControllerRef.current = null;
    }
  };

  // ============================================================
  // ✅ تنزيل الفيديو
  // ============================================================
  const downloadVideo = async () => {
    if (!video.convertedUrl) return;
    try {
      const response = await fetch(video.convertedUrl);
      const blob = await response.blob();
      saveAs(blob, `converted_${video.file?.name.replace(/\.[^.]+$/, '')}_intooly.${targetFormat}`);
      showToast('✅ بدأ التنزيل');
    } catch (e) { showToast('❌ فشل التنزيل', true); }
  };

  // ============================================================
  // ✅ دوال مساعدة
  // ============================================================
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const savings = video.convertedSize && video.originalSize ? Math.round(((video.originalSize - video.convertedSize) / video.originalSize) * 100) : 0;


  // ============================================================
  // ✅ بداية الواجهة
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-2xl z-50 max-w-lg text-center ${toast.isError ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="container relative mx-auto px-4 py-10 md:py-14 max-w-6xl">
          <Link href="/tools/video" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700">
            <ArrowLeft className="h-4 w-4" /> جميع أدوات الفيديو
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100">
              <ArrowRightLeft className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl md:text-4xl">
                تحويل صيغ الفيديو أونلاين مجانًا – محول الفيديو
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                استخدم أداة تحويل صيغ الفيديو من Intooly لتحويل ملفات الفيديو من صيغة إلى أخرى بسهولة ومجانًا عبر الإنترنت. غيّر صيغة MP4 وMOV وMKV وWebM وAVI، وتحكم في جودة الفيديو ودقته دون تثبيت برامج أو رفع ملفاتك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8">

            {!video.file ? (
              <label htmlFor="video-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                
                className={`border-2 border-dashed rounded-2xl p-8 md:p-16 cursor-pointer transition-all text-center group ${
                  isDragging ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-orange-300 bg-orange-50/50 hover:bg-orange-50'
                }`}
              >
                <Upload className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 transition-transform ${isDragging ? 'text-orange-600 scale-110' : 'text-orange-500 group-hover:scale-110'}`} />
                <h2 className="text-xl md:text-2xl font-black mb-2 text-slate-900">
                  {isDragging ? 'أفلت الفيديو هنا' : 'اسحب الفيديو هنا أو انقر للاختيار'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  MP4, MOV, MKV, WebM, AVI, GIF + 5 صيغ إضافية
                </p>
                <input
                  id="video-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* عمود الفيديو */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1 text-slate-900">{video.file.name}</h3>
                      <button onClick={loadNewVideo} className="p-1.5 hover:bg-red-100 rounded-lg transition" title="حذف">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3">
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                          الأصلية {video.originalFormat?.toUpperCase()}
                        </div>
                        <video src={video.originalUrl || ''} controls className="w-full h-48 md:h-72 object-contain rounded-lg bg-slate-900" />
                      </div>
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                          {video.status === 'done' ? `المحوّلة ${targetFormat.toUpperCase()}` : 'جاري...'}
                        </div>
                        {video.convertedUrl ? (
                          <video src={video.convertedUrl} controls className="w-full h-48 md:h-72 object-contain rounded-lg bg-slate-900" />
                        ) : (
                          <div className="w-full h-48 md:h-72 flex items-center justify-center rounded-lg bg-orange-50 border-2 border-dashed border-orange-200">
                            {video.status === 'converting' || video.status === 'loading-ffmpeg' ?
                              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" /> :
                              <Film className="w-8 h-8 text-orange-400" />
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* معلومات الفيديو */}
                    <div className="px-3 pb-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-slate-500">المدة</div>
                        <div className="font-bold text-slate-900">{video.duration ? formatDuration(video.duration) : '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-slate-500">الأبعاد</div>
                        <div className="font-bold text-slate-900">{video.width && video.height ? `${video.width}×${video.height}` : '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-slate-500">الحجم</div>
                        <div className="font-bold text-slate-900">{formatFileSize(video.originalSize)}</div>
                      </div>
                    </div>

                    {video.status === 'error' && (
                      <div className="mx-3 mb-3 p-3 bg-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2 whitespace-pre-line">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {video.errorMessage}
                      </div>
                    )}

                    {video.status === 'converting' && (
                      <div className="px-3 pb-3">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-300" style={{ width: `${video.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-center mt-1 text-slate-600">{video.progress}%</p>
                      </div>
                    )}

                    {video.status === 'done' && video.convertedUrl && (
                      <div className="px-3 pb-3 space-y-2">
                        {savings !== 0 && (
                          <div className={`text-xs text-center font-bold flex items-center justify-center gap-1 ${savings > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                            <TrendingDown className="w-3 h-3" />
                            {savings > 0 ? `انخفض الحجم بنسبة ${savings}%` : `زاد الحجم بنسبة ${Math.abs(savings)}%`}
                          </div>
                        )}
                        <button onClick={downloadVideo} className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" /> تحميل الفيديو المحوّل
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* عمود الإعدادات */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900">
                        <Wand2 className="w-5 h-5 text-orange-500" /> إعدادات التحويل
                      </h3>
                      <button
                        onClick={() => { setQuality('medium'); setMaxResolution('original'); setTargetFormat('mp4'); setTargetFps(null); }}
                        className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-bold"
                      >
                        <RotateCcw className="w-3 h-3" /> إعادة تعيين
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* الصيغة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-slate-900">
                          <ArrowRightLeft className="w-4 h-4 text-orange-500" /> الصيغة الهدف
                        </label>
                        <select
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value as VideoFormat)}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-bold text-slate-900 bg-white transition-all cursor-pointer"
                        >
                          {FORMATS.map((f) => (
                            <option key={f.id} value={f.id} disabled={video.originalFormat === f.id}>
                              {f.icon} {f.name} — {f.desc}
                              {video.originalFormat === f.id ? ' (نفس صيغة الأصل)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* الجودة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-slate-900">
                          <Gauge className="w-4 h-4 text-orange-500" /> الجودة
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {QUALITY_PRESETS.map((q) => (
                            <button
                              key={q.id}
                              onClick={() => setQuality(q.id)}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${quality === q.id ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-200 hover:border-orange-300'}`}
                            >
                              <p className="text-xs font-bold text-slate-900">{q.name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{q.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* الدقة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-slate-900">
                          <Crop className="w-4 h-4 text-orange-500" /> أقصى دقة
                        </label>
                        <select
                          value={String(maxResolution)}
                          onChange={(e) => setMaxResolution(e.target.value === 'original' ? 'original' : Number(e.target.value) as Resolution)}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm font-bold text-slate-900 bg-white cursor-pointer"
                        >
                          {RESOLUTIONS.map((r) => (
                            <option key={String(r.value)} value={String(r.value)}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* FPS */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-slate-900">
                          <Film className="w-4 h-4 text-orange-500" /> معدل الإطارات (اختياري)
                        </label>
                        <select
                          value={targetFps || ''}
                          onChange={(e) => setTargetFps(e.target.value ? Number(e.target.value) : null)}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 outline-none text-sm font-bold text-slate-900 bg-white cursor-pointer"
                        >
                          <option value="">بلا تغيير (الأصلي)</option>
                          <option value="60">60 FPS</option>
                          <option value="30">30 FPS</option>
                          <option value="24">24 FPS</option>
                          <option value="15">15 FPS</option>
                        </select>
                      </div>

                      <button
                        onClick={convertVideo}
                        disabled={video.status === 'converting' || video.status === 'loading-ffmpeg' || video.originalFormat === targetFormat}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                      >
                        {video.status === 'loading-ffmpeg' ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ تحميل المحرك...</> :
                         video.status === 'converting' ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ التحويل... {video.progress}%</> :
                         <><Wand2 className="w-5 h-5" /> ابدأ تحويل صيغ الفيديو</>}
                      </button>

                      {video.status === 'idle' && !ffmpegLoaded && (
                        <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                          <Info className="w-3 h-3" />
                          {ffmpegLoading ? 'يُحمَّل المحرك في الخلفية...' : 'سيُحمَّل المحرك عند البدء'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ===== SEO CONTENT SECTION ===== */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl text-right">

          {/* المقدمة */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              تحويل صيغ الفيديو أونلاين مجانًا – محول الفيديو MP4 وMOV وMKV
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              استخدم أداة <strong>تحويل صيغ الفيديو</strong> من Intooly لتحويل ملفات الفيديو من صيغة إلى أخرى بسهولة ومجانًا عبر الإنترنت. تتيح لك الأداة تغيير صيغة الفيديو وتحويل تنسيقات الملفات المختلفة، مثل MP4 وMOV وMKV وWebM وAVI، بالإضافة إلى صيغ أخرى مدعومة، دون الحاجة إلى تثبيت برامج تحويل الفيديو على جهازك.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              إذا كنت تبحث عن طريقة لتحويل الفيديو إلى MP4 بدون برنامج، أو تريد تغيير صيغة الفيديو لتشغيله على هاتفك أو الكمبيوتر أو استخدامه في برامج تحرير الفيديو، فإن محول صيغ الفيديو من Intooly يوفر لك طريقة سهلة ومباشرة. اختر ملف الفيديو من جهازك، وحدد الصيغة التي تريد التحويل إليها، واضبط جودة الفيديو والدقة المناسبة، ثم ابدأ التحويل واحفظ الملف الناتج.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              تعتمد أداة تحويل صيغة الفيديو على تقنية FFmpeg.wasm لمعالجة ملفات الفيديو محليًا داخل المتصفح، دون الحاجة إلى رفع ملفاتك إلى خادم خارجي. يمكنك استخدام محول الفيديو مجانًا، دون تسجيل حساب أو تثبيت برنامج إضافي، مع التحكم في جودة ودقة الفيديو الناتج.
            </p>
            <p className="text-base leading-relaxed text-slate-700">
              سواء كنت تريد تحويل MOV إلى MP4، أو تحويل MKV إلى MP4، أو تحويل AVI إلى MP4، أو تغيير تنسيق الفيديو إلى WebM، تساعدك أداة Intooly على تحويل صيغ الفيديوهات بسهولة من المتصفح.
            </p>
          </article>

          {/* ما هي الأداة */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              ما هي أداة تحويل صيغ الفيديو من Intooly؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              أداة تحويل صيغ الفيديو هي محول فيديو أونلاين يساعدك على تغيير تنسيق ملفات الفيديو من صيغة إلى أخرى لتصبح مناسبة للتشغيل على الأجهزة المختلفة أو المشاركة عبر الإنترنت أو الاستخدام في برامج تحرير الفيديو.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              قد تواجه أحيانًا مشكلة عند تشغيل فيديو بسبب عدم توافق صيغته مع الجهاز أو البرنامج الذي تستخدمه. وقد تحتاج إلى تحويل ملف MOV إلى MP4، أو تغيير صيغة MKV إلى MP4، أو تحويل ملف AVI إلى تنسيق آخر يناسب استخدامك.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              بدلًا من تنزيل برنامج تحويل صيغ الفيديو وتثبيته، يمكنك استخدام موقع تحويل صيغ الفيديو من Intooly مباشرة من متصفحك.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900 mt-6">تتيح لك الأداة:</h3>
            <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-700 pr-2">
              <li>تحويل صيغ الفيديو المختلفة إلى التنسيق الذي تحتاج إليه.</li>
              <li>تحويل الفيديو إلى MP4 بسهولة.</li>
              <li>تحويل MOV إلى MP4.</li>
              <li>تحويل MKV إلى MP4.</li>
              <li>تحويل AVI إلى MP4.</li>
              <li>تحويل الفيديو إلى WebM.</li>
              <li>تحويل الفيديو إلى MOV أو MKV أو AVI.</li>
              <li>تحويل الفيديو إلى GIF عند اختيار الصيغة المدعومة.</li>
              <li>التعامل مع ملفات VOB والصيغ الأخرى المتاحة.</li>
              <li>اختيار مستوى جودة الفيديو.</li>
              <li>تحديد أقصى دقة للفيديو الناتج.</li>
              <li>تنزيل الفيديو بعد اكتمال عملية التحويل.</li>
            </ul>
            <p className="text-base leading-relaxed mt-4 text-slate-700">
              تدعم الأداة 11 صيغة، ويمكنك الاطلاع على قائمة صيغ الإدخال والإخراج المتاحة مباشرة من واجهة المحول.
            </p>
          </article>

          {/* المميزات */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              مميزات محول صيغ الفيديو أونلاين
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              يوفر محول صيغ الفيديو من Intooly مجموعة من الوظائف التي تساعدك على تغيير تنسيق الفيديو والتحكم في إعدادات الملف الناتج.
            </p>
            <div className="space-y-5">
              {[
                { title: '1. تحويل صيغ الفيديو بسهولة', desc: 'يمكنك تغيير صيغة الفيديو من تنسيق إلى آخر حسب احتياجاتك. اختر ملف الفيديو من جهازك، ثم حدد صيغة الإخراج المناسبة من قائمة الصيغ المدعومة.' },
                { title: '2. تحويل الفيديو إلى MP4 بدون برنامج', desc: 'إذا كنت تبحث عن تحويل الفيديو إلى mp4 بدون برنامج، يمكنك استخدام أداة Intooly مباشرة من المتصفح. حدد ملف الفيديو واختر MP4 كصيغة إخراج، ثم ابدأ التحويل دون الحاجة إلى تثبيت برنامج منفصل.' },
                { title: '3. تحويل MOV إلى MP4', desc: 'تُستخدم صيغة MOV في كثير من ملفات الفيديو، خصوصًا ضمن بيئة Apple وبعض الكاميرات وبرامج تحرير الفيديو. يمكنك تغيير صيغة MOV إلى MP4 عندما تحتاج إلى تنسيق أكثر ملاءمة للتشغيل والمشاركة على الأجهزة والمنصات المختلفة.' },
                { title: '4. تحويل MKV إلى MP4', desc: 'إذا كان لديك فيديو بصيغة MKV وتريد تشغيله على جهاز أو برنامج يفضل MP4، يمكنك اختيار ملف MKV وتحديد MP4 كصيغة مستهدفة.' },
                { title: '5. تحويل AVI إلى MP4', desc: 'تساعدك الأداة على تغيير تنسيق ملفات AVI إلى MP4 عند الحاجة إلى استخدام الفيديو في تطبيقات أو أجهزة تدعم MP4 بصورة أفضل.' },
                { title: '6. تحويل الفيديو إلى WebM', desc: 'يمكنك اختيار WebM عندما تحتاج إلى تنسيق فيديو مناسب لبعض تطبيقات الويب والمتصفحات التي تدعم هذه الصيغة.' },
                { title: '7. دعم صيغ فيديو متعددة', desc: 'تتيح الأداة الاختيار بين 11 صيغة مدعومة، وتشمل الصيغ الظاهرة في واجهة التحويل MP4 وMOV وMKV وWebM وAVI وGIF وVOB، بالإضافة إلى صيغ أخرى تظهر في قائمة الأداة.' },
                { title: '8. التحكم في جودة الفيديو', desc: 'يمكنك اختيار مستوى الجودة المناسب حسب احتياجاتك: جودة عالية (عندما تكون المحافظة على تفاصيل الفيديو مهمة)، جودة متوسطة (لتحقيق توازن بين جودة الصورة وحجم الملف)، جودة منخفضة (عندما تكون الأولوية لتقليل حجم الملف). تعتمد الجودة الفعلية على خصائص الفيديو الأصلي وإعدادات الترميز المستخدمة أثناء التحويل.' },
                { title: '9. التحكم في دقة الفيديو', desc: 'تتيح لك الأداة اختيار أقصى دقة للفيديو الناتج من الخيارات المتاحة، لمساعدتك على تجهيز الملف بما يناسب الجهاز أو المنصة التي ستستخدمه عليها.' },
                { title: '10. تحويل صيغة الفيديو أون لاين مجانًا', desc: 'لا تحتاج إلى شراء برنامج أو تثبيت تطبيق منفصل. افتح محول صيغ الفيديو من Intooly، واختر الملف، وحدد صيغة الإخراج، ثم ابدأ عملية التحويل.' },
                { title: '11. معالجة الفيديو محليًا داخل المتصفح', desc: 'تستخدم الأداة تقنية FFmpeg.wasm لمعالجة الفيديو على جهازك من خلال المتصفح، دون الحاجة إلى إرسال ملف الفيديو إلى خادم خارجي.' },
                { title: '12. بدون علامة مائية', desc: 'يمكنك تنزيل الفيديو الناتج دون إضافة علامة مائية من Intooly.' },
                { title: '13. يعمل على الهاتف والكمبيوتر', desc: 'يمكنك فتح موقع تحويل صيغة الفيديو من متصفح الكمبيوتر أو الهاتف واستخدام الأداة مباشرة، مع مراعاة أن سرعة المعالجة تعتمد على إمكانات الجهاز وحجم الفيديو.' },
              ].map((item, i) => (
                <div key={i}>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="leading-8 text-slate-700 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* كيفية التحويل */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              كيفية تحويل صيغة الفيديو أون لاين؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              يمكنك تغيير صيغة الفيديو باستخدام محول الفيديو من Intooly من خلال الخطوات التالية:
            </p>
            <ol className="list-decimal list-inside space-y-3 leading-8 text-slate-700 pr-2">
              <li><strong>الخطوة الأولى: اختيار ملف الفيديو</strong> — افتح أداة تحويل صيغ الفيديو، ثم اضغط على زر اختيار الملف وحدد الفيديو الذي تريد تغيير صيغته من جهازك.</li>
              <li><strong>الخطوة الثانية: اختيار صيغة الفيديو</strong> — بعد تحميل الملف داخل واجهة الأداة، اختر تنسيق الإخراج الذي تريده، مثل MP4 أو MOV أو MKV أو WebM أو AVI، وفق الصيغ المتاحة.</li>
              <li><strong>الخطوة الثالثة: تحديد الجودة والدقة</strong> — اختر مستوى جودة الفيديو المناسب، سواء عالية أو متوسطة أو منخفضة، ثم حدد أقصى دقة للفيديو الناتج من الخيارات المتاحة.</li>
              <li><strong>الخطوة الرابعة: بدء تحويل الفيديو</strong> — اضغط على زر التحويل وانتظر حتى تكتمل معالجة الملف. تختلف مدة التحويل حسب حجم الفيديو ودقته وطول المقطع وقوة جهازك.</li>
              <li><strong>الخطوة الخامسة: تنزيل الفيديو</strong> — بعد اكتمال التحويل، يمكنك تنزيل الفيديو بالصيغة الجديدة وحفظه على جهازك.</li>
            </ol>
          </article>

          {/* تحويل MP4 */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              تحويل الفيديو إلى MP4 بدون برنامج
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              تُعد MP4 من أكثر صيغ الفيديو انتشارًا، ولذلك يبحث كثير من المستخدمين عن طريقة تحويل الفيديو إلى MP4 بدون برنامج أو تطبيقات إضافية. باستخدام محول صيغ الفيديو من Intooly، يمكنك تحويل ملفات الفيديو المدعومة إلى MP4 مباشرة من المتصفح.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900">يمكنك الاستفادة من هذه العملية في الحالات التالية:</h3>
            <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-700 pr-2">
              <li>تحويل فيديو MOV إلى MP4.</li>
              <li>تحويل فيديو MKV إلى MP4.</li>
              <li>تحويل فيديو AVI إلى MP4.</li>
              <li>تحويل ملفات الفيديو القديمة إلى MP4.</li>
              <li>تجهيز فيديو للمشاركة عبر الإنترنت.</li>
              <li>تغيير تنسيق الفيديو ليتوافق مع بعض الأجهزة والبرامج.</li>
            </ul>
            <p className="text-base leading-relaxed mt-4 text-slate-700">
              اختر ملف الفيديو، وحدد MP4 من قائمة صيغ الإخراج، واضبط إعدادات الجودة والدقة، ثم ابدأ التحويل.
            </p>
          </article>

          {/* شرح الصيغ */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              شرح أشهر صيغ الفيديو
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              توجد صيغ فيديو متعددة، وتختلف فيما بينها من حيث التوافق وطريقة تخزين البيانات والترميزات المستخدمة. يساعدك فهم صيغ الفيديو على اختيار التنسيق المناسب لاحتياجاتك.
            </p>
            <div className="space-y-5">
              {[
                { title: 'صيغة MP4', desc: 'تُعد MP4 من أشهر صيغ الفيديو المستخدمة في الهواتف وأجهزة الكمبيوتر والمواقع الإلكترونية ومنصات مشاركة المحتوى. استخدم MP4 عندما تحتاج إلى صيغة شائعة ومتوافقة مع عدد كبير من الأجهزة والبرامج.' },
                { title: 'صيغة MOV', desc: 'MOV تنسيق فيديو مرتبط بتقنية QuickTime ويُستخدم في كثير من ملفات الفيديو ضمن بيئة Apple وبعض الكاميرات وبرامج التحرير. يمكنك تحويل MOV إلى MP4 عندما تحتاج إلى تنسيق مختلف يناسب طريقة استخدامك.' },
                { title: 'صيغة MKV', desc: 'MKV أو Matroska تنسيق حاوية مرن يمكنه احتواء مسارات متعددة للفيديو والصوت والترجمات. قد تحتاج إلى تحويل MKV إلى MP4 عندما يكون التوافق مع جهاز أو برنامج معين أكثر أهمية.' },
                { title: 'صيغة AVI', desc: 'AVI من تنسيقات الفيديو المعروفة، وما زالت بعض الملفات القديمة وبرامج التحرير تستخدمه. يمكنك تحويل AVI إلى MP4 أو إلى صيغة أخرى متاحة عند الحاجة.' },
                { title: 'صيغة WebM', desc: 'WebM تنسيق مخصص للاستخدام على الويب، ويُستخدم في بعض تطبيقات تشغيل الفيديو داخل المتصفحات. يمكن اختيار WebM عندما تكون هذه الصيغة مناسبة للمنصة أو الموقع المستهدف.' },
                { title: 'صيغة GIF', desc: 'GIF تنسيق للصور المتحركة، ويمكن استخدامه لعرض حركة قصيرة دون مشغل فيديو تقليدي. لا يحتفظ GIF بالصوت كما تفعل صيغ الفيديو المعتادة.' },
                { title: 'صيغة VOB', desc: 'VOB تنسيق مرتبط بأقراص DVD ويستخدم في تخزين بيانات الفيديو والصوت وبعض المعلومات المرتبطة بها. يمكنك تحويل ملفات VOB عندما تحتاج إلى استخدام الفيديو في تنسيق آخر مدعوم.' },
              ].map((item, i) => (
                <div key={i}>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="leading-8 text-slate-700 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* الفروقات */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              ما الفرق بين تحويل صيغ الفيديو وتغيير حجم الفيديو؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              تحويل صيغ الفيديو يعني تغيير تنسيق الملف، مثل تحويل MOV إلى MP4 أو MKV إلى MP4. أما تغيير حجم الفيديو فيشير عادة إلى تغيير أبعاد الصورة أو نسبة العرض والارتفاع، مثل تحويل الفيديو من أفقي 16:9 إلى عمودي 9:16.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              إذا كنت تريد تغيير تنسيق الملف، استخدم محول صيغ الفيديو. أما إذا كنت تريد تغيير أبعاد الفيديو ليناسب TikTok أو Instagram أو YouTube Shorts، فتحتاج إلى أداة تغيير حجم الفيديو.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              ما الفرق بين تحويل الفيديو وضغط الفيديو؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              تحويل الفيديو يغير صيغة الملف، بينما يهدف ضغط الفيديو إلى تقليل حجم الملف لتسهيل تخزينه أو مشاركته أو رفعه على الإنترنت.
            </p>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              قد يتغير حجم الملف أثناء تحويل الصيغة بسبب اختلاف الترميز وإعدادات الجودة، لكن التحويل لا يعني بالضرورة أن حجم الفيديو سينخفض. إذا كان هدفك تقليل حجم الملف، استخدم أداة ضغط الفيديو من Intooly.
            </p>
          </article>

          {/* الجودة */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              هل يؤثر تحويل صيغة الفيديو في الجودة؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              يعتمد تأثير تحويل الفيديو في الجودة على طريقة المعالجة وإعدادات الترميز. عند إعادة ترميز الفيديو قد يحدث فقدان لبعض التفاصيل، خصوصًا عند اختيار جودة منخفضة أو ضغط قوي. أما في الحالات التي تسمح بنقل مسارات الفيديو والصوت دون إعادة ترميز، فقد يمكن تغيير حاوية الملف دون فقدان ناتج عن إعادة الترميز.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900">للحصول على نتيجة مناسبة:</h3>
            <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-700 pr-2">
              <li>استخدم ملفًا أصليًا بجودة جيدة.</li>
              <li>اختر الجودة العالية عند أهمية المحافظة على التفاصيل.</li>
              <li>لا تخفض دقة الفيديو دون حاجة.</li>
              <li>تجنب إعادة تحويل الملف مرات متعددة.</li>
              <li>اختر صيغة متوافقة مع الجهاز أو البرنامج المستهدف.</li>
            </ul>
          </article>

          {/* الأمان */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              هل تحويل صيغ الفيديو أون لاين آمن؟
            </h2>
            <p className="text-base leading-relaxed text-slate-700">
              تعتمد أداة تحويل صيغ الفيديو من Intooly على FFmpeg.wasm، وتتم معالجة ملفات الفيديو محليًا داخل المتصفح على جهاز المستخدم، دون الحاجة إلى رفع الفيديو إلى خادم خارجي. يساعد ذلك على الحفاظ على خصوصية الملفات الشخصية أثناء التحويل. ومع ذلك، يُنصح باستخدام متصفح محدث، والاحتفاظ بنسخة من الفيديو الأصلي، وعدم مشاركة الملفات الناتجة مع جهات غير موثوقة.
            </p>
          </article>

          {/* الهاتف والكمبيوتر */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              تحويل صيغ الفيديو من الهاتف والكمبيوتر
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              يمكنك استخدام محول صيغ الفيديو من Intooly على الكمبيوتر والهاتف من خلال متصفح الإنترنت.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900">تحويل الفيديو من الكمبيوتر</h3>
            <p className="leading-8 text-slate-700 mb-4">
              افتح الأداة، واختر الفيديو من ملفات الكمبيوتر، ثم حدد الصيغة والجودة والدقة، وابدأ التحويل. بعد اكتمال العملية يمكنك تنزيل الملف الناتج.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900">تحويل الفيديو من الهاتف</h3>
            <p className="leading-8 text-slate-700">
              افتح أداة تحويل الفيديو من متصفح الهاتف، واختر الفيديو من ملفات الجهاز، وحدد صيغة الإخراج، ثم ابدأ المعالجة. قد تستغرق الملفات الكبيرة وقتًا أطول على الهواتف بسبب اختلاف قوة المعالج والذاكرة المتاحة.
            </p>
          </article>

          {/* لماذا Intooly */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-slate-900">
              لماذا تختار موقع تحويل صيغ الفيديو من Intooly؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-slate-700">
              يهدف Intooly إلى توفير أدوات مجانية وسهلة الاستخدام لإنجاز المهام اليومية مباشرة من المتصفح. وتوفر أداة تحويل صيغ الفيديو طريقة عملية لتغيير تنسيق الملفات دون الحاجة إلى برامج منفصلة.
            </p>
            <h3 className="text-lg font-bold mb-3 text-slate-900">أهم مزايا المحول:</h3>
            <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-700 pr-2">
              <li>تحويل صيغ الفيديو أونلاين.</li>
              <li>دعم 11 صيغة.</li>
              <li>تحويل الفيديو إلى MP4.</li>
              <li>تحويل MOV وMKV وAVI إلى تنسيقات أخرى مدعومة.</li>
              <li>التحكم في جودة الفيديو.</li>
              <li>اختيار أقصى دقة للفيديو.</li>
              <li>المعالجة محليًا داخل المتصفح.</li>
              <li>عدم الحاجة إلى رفع الملفات إلى خادم خارجي.</li>
              <li>لا يتطلب تسجيل حساب.</li>
              <li>لا يضيف علامة مائية.</li>
              <li>يعمل من متصفح الهاتف والكمبيوتر.</li>
            </ul>
          </article>

          {/* Internal Link - قص الفيديو */}
          <article className="mb-10 rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-black mb-3 text-orange-900">
              هل تريد قص الفيديو أو تقطيعه بدلًا من تغيير صيغته؟
            </h2>
            <p className="leading-8 text-orange-900 mb-4">
              إذا كان هدفك ليس تغيير صيغة الفيديو، بل حذف جزء من المقطع أو استخراج مشهد معين، يمكنك استخدام أداة قص الفيديو أونلاين من Intooly. تساعدك أداة قص الفيديو على تحديد بداية المقطع ونهايته واستخراج الجزء الذي تحتاج إليه، بينما تساعدك أداة تحويل صيغ الفيديو على تغيير تنسيق الملف.
            </p>
            <Link href="/tools/video-trimmer" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 font-bold text-white hover:bg-orange-700 transition">
              <Scissors size={16} /> جرّب أداة قص الفيديو
            </Link>
          </article>

          {/* CTA */}
          <article className="mb-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">ابدأ الآن في تحويل صيغ الفيديو</h2>
            <p className="leading-8 text-orange-50 mb-5 max-w-2xl mx-auto">
              لا تدع اختلاف صيغ الفيديو يمنعك من تشغيل ملفاتك أو مشاركتها. استخدم محول صيغ الفيديو من Intooly لتغيير تنسيق ملفاتك بسهولة، واختر الصيغة المناسبة والجودة والدقة التي تحتاج إليها.
            </p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 hover:bg-orange-50 transition shadow-lg">
              ⬆️ العودة إلى الأداة
            </a>
          </article>

          {/* FAQ */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-slate-900">
              الأسئلة الشائعة حول تحويل صيغ الفيديو
            </h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold text-slate-900 flex justify-between items-center text-sm md:text-base">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-orange-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

        </div>
      </section>

      {/* ===== RELATED TOOLS ===== */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-slate-900">🛠️ أدوات مجانية أخرى قد تحتاج إليها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'ضغط الفيديو', desc: 'قلّل حجم ملفات الفيديو.', href: '/tools/video-compressor' },
              { icon: Scissors, title: 'قص الفيديو', desc: 'احذف الأجزاء غير المرغوبة.', href: '/tools/video-trimmer' },
              { icon: Sparkles, title: 'إزالة الخلفية', desc: 'أزل خلفية الصور بالذكاء الاصطناعي.', href: '/tools/background-remover' },
              { icon: Smartphone, title: 'ضغط الصور', desc: 'قلّل حجم الصور بجودتها.', href: '/tools/image-compressor' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:shadow-lg hover:border-orange-400 transition-all group text-right block">
                <tool.icon className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-900 mb-2">{tool.title}</h3>
                <p className="text-xs text-slate-600">{tool.desc}</p>
                <p className="text-xs text-orange-600 mt-3 flex items-center gap-1 font-bold">جرّب الأداة <ArrowLeft className="w-3 h-3" /></p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
