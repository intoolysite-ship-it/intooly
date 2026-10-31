'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, Download, Video, Sparkles,
  ChevronDown, Trash2, CheckCircle2, Wand2,
  Loader2, AlertCircle, Film, Gauge, Maximize2, 
  RotateCcw, RefreshCw, ArrowRightLeft, Shield, Zap, Smartphone
} from 'lucide-react';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع والثوابت
// ============================================================
type VideoFormat = 'mp4' | 'webm' | 'mov' | 'mkv' | 'avi' | 'gif' | 'mpeg' | 'ts' | 'flv' | 'vob' | 'wmv';
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

const QUALITY_PRESETS: { id: QualityPreset; name: string; desc: string; crf: number }[] = [
  { id: 'high', name: 'عالية', desc: 'جودة ممتازة', crf: 20 },
  { id: 'medium', name: 'متوسطة', desc: 'متوازنة', crf: 23 },
  { id: 'low', name: 'منخفضة', desc: 'حجم أصغر', crf: 28 },
];

const LOCAL_FFMPEG_BASE = '/assets/ffmpeg';

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
  const [maxResolution, setMaxResolution] = useState<number | null>(720);
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({ message: '', visible: false, isError: false });
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) {
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
      else setMaxResolution(1080);
    } catch (e) { console.warn('Probe failed:', e); }
    e.target.value = '';
  };

  const loadNewVideo = useCallback(() => {
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);
    setVideo({ file: null, originalUrl: null, convertedUrl: null, originalSize: 0, convertedSize: null, duration: null, width: null, height: null, originalFormat: null, status: 'idle', progress: 0 });
    setTimeout(() => { if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); } }, 100);
  }, [video]);

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

      const crf = QUALITY_PRESETS.find(q => q.id === quality)?.crf || 23;
      const args: string[] = ['-i', inputName];
      if (maxResolution) args.push('-vf', `scale=-2:${maxResolution}`);

      if (targetFormat === 'mp4') args.push('-c:v', 'libx264', '-crf', String(crf), '-preset', 'fast', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart');
      else if (targetFormat === 'webm') args.push('-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', '-b:a', '128k');
      else if (targetFormat === 'mov' || targetFormat === 'mkv') args.push('-c:v', 'libx264', '-crf', String(crf), '-c:a', 'aac', '-b:a', '128k');
      else if (targetFormat === 'avi') args.push('-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame', '-b:a', '128k');
      else if (targetFormat === 'gif') args.push('-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse', '-loop', '0');
      else if (['mpeg', 'ts', 'vob'].includes(targetFormat)) args.push('-c:v', 'mpeg2video', '-q:v', '5', '-c:a', 'mp2', '-b:a', '192k');
      else if (targetFormat === 'flv') args.push('-c:v', 'libx264', '-crf', String(crf), '-c:a', 'aac', '-b:a', '128k');
      else if (targetFormat === 'wmv') args.push('-c:v', 'msmpeg4v2', '-q:v', '5', '-c:a', 'wmav2', '-b:a', '128k');

      if (targetFormat === 'ts') args.push('-f', 'mpegts');
      args.push('-threads', '1', '-max_muxing_queue_size', '1024', outputName);

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
      abortControllerRef.current = null;
    }
  };

  const downloadVideo = async () => {
    if (!video.convertedUrl) return;
    try {
      const response = await fetch(video.convertedUrl);
      const blob = await response.blob();
      saveAs(blob, `converted_${video.file?.name.replace(/\.[^.]+$/, '')}_intooly.${targetFormat}`);
      showToast('✅ بدأ التنزيل');
    } catch (e) { showToast('❌ فشل التنزيل', true); }
  };

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
  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">
      {/* JSON-LD Schema for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "تحويل صيغ الفيديو - Intooly",
        "url": "https://intooly.com/tools/video-converter",
        "description": "أداة تحويل صيغ الفيديو أونلاين مجاناً بين MP4 وWebM وMOV وMKV وAVI مباشرة من المتصفح.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}} />

      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-2xl z-50 max-w-lg text-center ${toast.isError ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link href="/tools/video" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع أدوات الفيديو
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <ArrowRightLeft className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              {/* ✅ العنوان الرئيسي H1 كما طلبت */}
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تحويل صيغ الفيديو
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أداة تحويل صيغ الفيديو أونلاين مجاناً. غيّر تنسيق الفيديو بين 11 صيغة مختلفة مباشرة من المتصفح بدون رفع الملفات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className={`${cardClass} border rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto`}>
            {!video.file ? (
              <div className="text-center space-y-4">
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group">
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اختر فيديو لتحويله</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, MKV, WebM, AVI + 6 صيغ إضافية</p>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="p-3 border-b border-ink-200/20 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1 text-ink-900">{video.file.name}</h3>
                      <button onClick={loadNewVideo} className="p-1.5 hover:bg-red-100 rounded-lg transition" title="حذف"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3">
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">الأصلية {video.originalFormat?.toUpperCase()}</div>
                        <video src={video.originalUrl || ''} controls className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-900" />
                      </div>
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">{video.status === 'done' ? `المحوّلة ${targetFormat.toUpperCase()}` : 'جاري...'}</div>
                        {video.convertedUrl ? (
                          <video src={video.convertedUrl} controls className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-900" />
                        ) : (
                          <div className="w-full h-48 md:h-80 flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200">
                            {video.status === 'converting' || video.status === 'loading-ffmpeg' ? <Loader2 className="w-8 h-8 text-brand-500 animate-spin" /> : <Film className="w-8 h-8 text-brand-400" />}
                          </div>
                        )}
                      </div>
                    </div>
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
                          <Download className="w-4 h-4" /> تحميل الفيديو المحوّل
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2 text-ink-900"><Wand2 className="w-5 h-5 text-brand-500" /> إعدادات تحويل صيغ الفيديو</h3>
                      <button onClick={() => { setQuality('medium'); setMaxResolution(720); setTargetFormat('mp4'); }} className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 font-bold">
                        <RotateCcw className="w-3 h-3" /> إعادة تعيين
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* ✅ القائمة المنسدلة المصححة */}
                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <ArrowRightLeft className="w-4 h-4 text-brand-500" /> الصيغة الهدف
                        </label>
                        <select
                          value={targetFormat}
                          onChange={(e) => setTargetFormat(e.target.value as VideoFormat)}
                          className="w-full p-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-bold text-ink-900 bg-white transition-all cursor-pointer"
                        >
                          {FORMATS.map((f) => (
                            <option key={f.id} value={f.id} disabled={video.originalFormat === f.id}>
                              {f.icon} {f.name} — {f.desc}
                              {video.originalFormat === f.id ? ' (نفس صيغة الأصل)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900"><Gauge className="w-4 h-4 text-brand-500" /> الجودة</label>
                        <div className="grid grid-cols-3 gap-2">
                          {QUALITY_PRESETS.map((q) => (
                            <button key={q.id} onClick={() => setQuality(q.id)} className={`p-3 rounded-xl border-2 text-center transition-all ${quality === q.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-300'}`}>
                              <p className="text-xs font-bold text-ink-900">{q.name}</p>
                              <p className="text-[10px] text-ink-500 mt-0.5">{q.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={convertVideo} disabled={video.status === 'converting' || video.status === 'loading-ffmpeg' || video.originalFormat === targetFormat} className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                        {video.status === 'loading-ffmpeg' ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ تحميل المحرك...</> :
                         video.status === 'converting' ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ التحويل... {video.progress}%</> :
                         <><Wand2 className="w-5 h-5" /> ابدأ تحويل صيغ الفيديو</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT SECTION ===== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* ✅ العنوان الرئيسي H2 كما طلبت */}
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة تحويل صيغ الفيديو؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              أداة <strong>تحويل صيغ الفيديو</strong> من Intooly هي أداة مجانية عبر الإنترنت تتيح لك تغيير تنسيق ملفات الفيديو بسهولة، وتحويلها من صيغة إلى أخرى دون الحاجة إلى تثبيت برامج إضافية على جهازك. تعتمد الأداة على تقنية FFmpeg.wasm، مما يعني أن معالجة الفيديو تتم <strong>محلياً على جهازك</strong>، دون الحاجة إلى رفع ملف الفيديو إلى خادم خارجي، مما يضمن خصوصية وأماناً بنسبة 100%.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              مميزات أداة تحويل صيغ الفيديو من Intooly
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'خصوصية وأمان 100%', desc: 'لا نرفع ملفاتك. كل عملية تحويل تتم على جهازك مباشرة.' },
                { icon: Video, title: 'دعم 11 صيغة فيديو', desc: 'من MP4 و MOV الشائعة، إلى GIF المتحرك و VOB الخاص بـ DVD.' },
                { icon: Gauge, title: 'تحكم كامل في الجودة', desc: 'اختر بين 3 مستويات للجودة وتحكم في أقصى دقة للفيديو.' },
                { icon: Zap, title: 'مجاني تماماً وبدون حدود', desc: 'لا علامات مائية، لا حاجة للتسجيل، ولا حدود على عدد التحويلات.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-2xl p-5 text-right shadow-sm">
                  <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-ink-900">
                    <item.icon className="w-5 h-5 text-brand-500" /> {item.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيفية تحويل صيغ الفيديو أونلاين مجاناً؟
            </h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'اختر ملف الفيديو', desc: 'اسحب ملف الفيديو وأفلته في المربع المخصص، أو انقر لاختياره من جهازك.' },
                { step: '2', title: 'حدد صيغة الفيديو المطلوبة', desc: 'اختر التنسيق الذي تريد التحويل إليه (مثل MP4 أو WebM أو GIF) من القائمة.' },
                { step: '3', title: 'اضبط الجودة والدقة', desc: 'اختر مستوى الجودة المناسب (عالية، متوسطة، منخفضة) وأقصى دقة للفيديو.' },
                { step: '4', title: 'ابدأ التحويل وحمّل الفيديو', desc: 'اضغط على زر التحويل، وبمجرد الانتهاء، يمكنك تحميل الفيديو الجديد مباشرة.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-ink-200">
                  <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-ink-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* الأسئلة الشائعة FAQ */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-ink-900">الأسئلة الشائعة حول تحويل صيغ الفيديو</h2>
            <div className="space-y-3">
              {[
                { q: 'هل أداة تحويل صيغ الفيديو من Intooly مجانية بالكامل؟', a: 'نعم، يمكنك استخدام الأداة مجاناً من المتصفح، دون الحاجة إلى تثبيت برنامج أو إنشاء حساب.' },
                { q: 'هل يتم رفع فيديوهاتي إلى خوادم Intooly؟', a: 'لا، تعتمد الأداة على تقنية FFmpeg.wasm لمعالجة ملفات الفيديو محلياً داخل المتصفح، ولا يتم إرسال أي ملفات إلى خادم خارجي.' },
                { q: 'كيف أحول الفيديو إلى MP4؟', a: 'افتح الأداة، اختر الملف من جهازك، حدد MP4 كصيغة إخراج، واضبط الجودة، ثم ابدأ التحويل ونزّل الملف الناتج.' },
                { q: 'هل يؤدي تحويل الفيديو إلى فقدان الجودة؟', a: 'قد يحدث فقدان طفيف في الجودة عند إعادة الترميز، لكن يمكنك اختيار "جودة عالية" للحفاظ على التفاصيل بأفضل شكل ممكن.' },
                { q: 'هل يعمل محول الفيديو على الهواتف؟', a: 'نعم، يمكن استخدام الأداة من متصفحات الهواتف، لكن أداء التحويل يعتمد على قوة الجهاز والذاكرة المتاحة.' }
              ].map((faq, i) => (
                <details key={i} className="bg-white border border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold text-ink-900 flex justify-between items-center text-sm md:text-base">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-brand-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ===== RELATED TOOLS ===== */}
      <section className="py-12 md:py-16 bg-white border-t border-ink-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-ink-900">🛠️ أدوات مجانية أخرى قد تحتاج إليها</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'ضغط الفيديو أونلاين', href: '/tools/video-compressor', desc: 'قلّل حجم ملفات الفيديو لتسهيل مشاركتها.' },
              { icon: ArrowRightLeft, title: 'قص الفيديو أونلاين', href: '/tools/video-trimmer', desc: 'احذف الأجزاء غير المرغوبة من الفيديو.' },
              { icon: Sparkles, title: 'إزالة خلفية الصور', href: '/tools/background-remover', desc: 'أزل خلفية الصور بالذكاء الاصطناعي مجاناً.' },
              { icon: Smartphone, title: 'ضغط الصور أونلاين', href: '/tools/image-compressor', desc: 'قلّل حجم الصور مع الحفاظ على جودتها.' }
            ].map((tool, i) => (
              <Link key={i} href={tool.href} className="bg-ink-50 border border-ink-200 p-5 rounded-2xl hover:shadow-lg hover:border-brand-400 transition-all group text-right block">
                <tool.icon className="w-8 h-8 text-brand-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-ink-900 mb-2">{tool.title}</h3>
                <p className="text-xs text-ink-600">{tool.desc}</p>
                <p className="text-xs text-brand-600 mt-3 flex items-center gap-1 font-bold">جرّب الأداة <ArrowLeft className="w-3 h-3" /></p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}