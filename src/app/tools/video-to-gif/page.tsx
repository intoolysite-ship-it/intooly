'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Video, Sparkles,
  ChevronDown, Trash2, CheckCircle2, Wand2,
  Loader2, AlertCircle, FileArchive, Film,
  Gauge, Maximize2, RotateCcw, RefreshCw, Clock
} from 'lucide-react';

import { DEFAULT_SETTINGS } from '@/lib/video-to-gif/types';
import type {
  InputFile,
  GifSettings as GifSettingsType,
  GifResult,
  ProcessingStatus,
} from '@/lib/video-to-gif/types';
import { GIF_CONFIG, MESSAGES, FPS_PRESETS, SIZE_PRESETS } from '@/lib/video-to-gif/constants';
import {
  generateId,
  convertVideoToGif,
  getVideoDuration,
  getVideoDimensions,
  formatBytes,
} from '@/lib/video-to-gif/converter';

// ============================================================
// ✅ الأنواع
// ============================================================
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
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
};

export default function VideoToGifPage() {
  // ============================================
  // الحالة
  // ============================================
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

  const [settings, setSettings] = useState<GifSettingsType>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({
    message: '', visible: false, isError: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== Toast =====
  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

  // ============================================
  // اختيار الفيديو
  // ============================================
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('❌ الملف ليس فيديو', true);
      return;
    }

    if (file.size > GIF_CONFIG.MAX_VIDEO_SIZE) {
      showToast('❌ الملف كبير جداً (الحد: 100 ميجابايت)', true);
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
      const [dims, dur] = await Promise.all([
        getVideoDimensions(file),
        getVideoDuration(file),
      ]);
      
      setVideo(prev => ({
        ...prev,
        duration: dur,
        width: dims.width,
        height: dims.height,
      }));

      // تحديث الإعدادات بناءً على مدة الفيديو
      setSettings(prev => ({
        ...prev,
        startTime: 0,
        endTime: Math.min(dur, prev.duration),
      }));

    } catch (e) {
      console.warn('Probe failed:', e);
    }

    e.target.value = '';
  };

  // ============================================
  // تحميل فيديو جديد
  // ============================================
  const loadNewVideo = useCallback(() => {
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

    setSettings(DEFAULT_SETTINGS);

    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 100);

    showToast('✅ جاهز لتحميل فيديو جديد');
  }, [video, showToast]);

  // ============================================
  // تحويل الفيديو إلى GIF
  // ============================================
  const convertVideo = async () => {
    if (!video.file) {
      showToast('❌ يرجى اختيار فيديو أولاً', true);
      return;
    }

    setVideo(prev => ({ ...prev, status: 'loading-ffmpeg', progress: 0, errorMessage: undefined }));

    try {
      // توليد اسم الملف
      const outputName = `output-${Date.now()}.gif`;

      setVideo(prev => ({ ...prev, status: 'processing', progress: 5 }));

      const gifData = await convertVideoToGif(
        video.file,
        {
          outputName,
          fps: settings.fps,
          width: settings.width,
          startTime: settings.startTime,
          duration: settings.endTime - settings.startTime,
        },
        (p) => setVideo(prev => ({ ...prev, progress: p }))
      );

      const blob = new Blob([gifData as BlobPart], { type: 'image/gif' });

      if (blob.size === 0) {
        throw new Error('الملف الناتج فارغ. جرب إعدادات مختلفة.');
      }

      if (video.convertedUrl) URL.revokeObjectURL(video.convertedUrl);

      // حساب الأبعاد النهائية
      let resultWidth = settings.width;
      let resultHeight = settings.width;
      if (video.width && video.height) {
        resultHeight = Math.round((settings.width * video.height) / video.width);
      }

      setVideo(prev => ({
        ...prev,
        convertedUrl: URL.createObjectURL(blob),
        convertedSize: blob.size,
        status: 'success',
        progress: 100,
      }));

      showToast('✅ تم التحويل بنجاح!');
    } catch (error) {
      console.error('Conversion error:', error);

      let errorMessage = 'فشل التحويل';
      if (error instanceof Error) {
        if (error.message.includes('memory access out of bounds')) {
          errorMessage = '❌ الذاكرة غير كافية.\n\nالحلول:\n• اختر عرض أقل (320 أو 480)\n• قص مدة أقصر\n• استخدم فيديو أصغر';
        } else {
          errorMessage = error.message;
        }
      }

      setVideo(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
      }));
      showToast('❌ فشل التحويل', true);
    }
  };

  // ============================================
  // التحميل
  // ============================================
  const downloadGif = async () => {
    if (!video.convertedUrl) return;

    try {
      const response = await fetch(video.convertedUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `intooly-${Date.now()}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      showToast('✅ بدأ التنزيل');
    } catch (e) {
      console.error('Download error:', e);
      showToast('❌ فشل التنزيل', true);
    }
  };

  // ============================================
  // Helpers
  // ============================================
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  // ============================================
  // واجهة المستخدم
  // ============================================
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
                <Film className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                تحويل الفيديو إلى GIF
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              FFmpeg.wasm • محلياً 100% • بدون رفع
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              حوّل فيديوهاتك إلى صور GIF متحركة بجودة عالية
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🎬', title: 'تحويل احترافي', desc: 'FFmpeg.wasm' },
              { icon: '🔒', title: 'محلي 100%', desc: 'فيديوهاتك لا ترفع' },
              { icon: '⚡', title: 'تحكم كامل', desc: 'FPS، الأبعاد، القص' },
              { icon: '🎨', title: 'جودة عالية', desc: 'palettegen متقدم' },
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
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اختر فيديو لتحويله إلى GIF</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, MKV, WebM, AVI — حتى 100 MB</p>
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
                          className="p-1.5 hover:bg-red-100 rounded-lg transition"
                          title="حذف وتحميل جديد"
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
                          {formatBytes(video.originalSize)}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute top-2 right-2 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                          {video.status === 'success' ? 'GIF' : 'جاري...'}
                        </div>
                        {video.convertedUrl ? (
                          <>
                            <img src={video.convertedUrl} alt="GIF" className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-900" />
                            <p className="text-[10px] text-center mt-1 font-semibold text-green-600">
                              {video.convertedSize ? formatBytes(video.convertedSize) : '...'}
                            </p>
                          </>
                        ) : (
                          <div className="w-full h-48 md:h-80 flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200">
                            {video.status === 'processing' || video.status === 'loading-ffmpeg' ? (
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
                            <p className="text-[10px] text-green-600">حجم GIF</p>
                            <p className="text-xs font-bold text-green-700">{formatBytes(video.convertedSize)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {video.status === 'error' && (
                      <div className="mx-3 mb-3 p-3 bg-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2 whitespace-pre-line">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {video.errorMessage}
                      </div>
                    )}

                    {video.status === 'processing' && (
                      <div className="px-3 pb-3">
                        <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${video.progress}%` }} />
                        </div>
                        <p className="text-[10px] text-center mt-1 text-ink-600">{video.progress}%</p>
                      </div>
                    )}

                    {video.status === 'success' && video.convertedUrl && (
                      <div className="px-3 pb-3">
                        <button
                          onClick={downloadGif}
                          className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> تحميل GIF
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
                        <Sparkles className="w-5 h-5 text-brand-500" /> إعدادات GIF
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        ⚡ فوري
                      </span>
                    </div>

                    {/* FPS */}
                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                        <Gauge className="w-4 h-4 text-brand-500" /> معدل الإطارات (FPS): {settings.fps}
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {FPS_PRESETS.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setSettings(prev => ({ ...prev, fps: p.value }))}
                            className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${
                              settings.fps === p.value
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-ink-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="range"
                        min={GIF_CONFIG.MIN_FPS}
                        max={GIF_CONFIG.MAX_FPS}
                        value={settings.fps}
                        onChange={(e) => setSettings(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                        className="brand-slider w-full"
                      />
                    </div>

                    {/* الأبعاد */}
                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                        <Maximize2 className="w-4 h-4 text-brand-500" /> العرض (بكسل): {settings.width}px
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {SIZE_PRESETS.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => setSettings(prev => ({ ...prev, width: p.value }))}
                            className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${
                              settings.width === p.value
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-ink-200'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="range"
                        min={GIF_CONFIG.MIN_WIDTH}
                        max={GIF_CONFIG.MAX_WIDTH}
                        step={20}
                        value={settings.width}
                        onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="brand-slider w-full"
                      />
                    </div>

                    {/* القص الزمني */}
                    {video.duration && video.duration > 0 && (
                      <div className="mb-4">
                        <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                          <Clock className="w-4 h-4 text-brand-500" /> القص الزمني
                          <span className="text-xs text-ink-500">({settings.startTime.toFixed(1)}s → {settings.endTime.toFixed(1)}s)</span>
                        </label>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-ink-600 block mb-1">وقت البداية</label>
                            <input
                              type="range"
                              min={0}
                              max={Math.max(0, video.duration - 0.5)}
                              step={0.1}
                              value={settings.startTime}
                              onChange={(e) => {
                                const newStart = parseFloat(e.target.value);
                                setSettings(prev => ({
                                  ...prev,
                                  startTime: newStart,
                                  endTime: newStart >= prev.endTime ? Math.min(video.duration!, newStart + 1) : prev.endTime,
                                }));
                              }}
                              className="brand-slider w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-ink-600 block mb-1">وقت النهاية</label>
                            <input
                              type="range"
                              min={settings.startTime + 0.5}
                              max={Math.min(video.duration, settings.startTime + GIF_CONFIG.MAX_DURATION)}
                              step={0.1}
                              value={settings.endTime}
                              onChange={(e) => setSettings(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                              className="brand-slider w-full"
                            />
                          </div>
                          <p className="text-xs text-ink-500 font-bold">
                            💡 المدة: {(settings.endTime - settings.startTime).toFixed(1)} ثانية
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSettings(DEFAULT_SETTINGS)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 bg-ink-100 hover:bg-ink-200 text-ink-700"
                    >
                      <RotateCcw className="w-4 h-4" /> إعادة الإعدادات
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={convertVideo}
                      disabled={video.status === 'processing' || video.status === 'loading-ffmpeg'}
                      className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
                    >
                      {video.status === 'loading-ffmpeg' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> تحميل FFmpeg...</>
                      ) : video.status === 'processing' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحويل... {video.progress}%</>
                      ) : video.status === 'success' ? (
                        <><CheckCircle2 className="w-5 h-5" /> تم التحويل — جرب إعدادات أخرى</>
                      ) : (
                        <><Wand2 className="w-5 h-5" /> ابدأ التحويل</>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* المقدمة */}
          <article className="mb-12">
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              هل تريد تحويل مقطع فيديو إلى صورة GIF متحركة لمشاركتها على مواقع التواصل الاجتماعي أو استخدامها في الشروحات والمقالات؟ تتيح لك أداة <strong>تحويل الفيديو إلى GIF من Intooly</strong> إنشاء صور GIF متحركة من مقاطع الفيديو بسهولة، دون الحاجة إلى تثبيت برامج متخصصة.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              باستخدام هذه الأداة، يمكنك تجهيز مقاطع قصيرة متحركة من الفيديوهات المفضلة لديك، واختيار الجزء الذي تريد تحويله، وضبط الإعدادات المتاحة للحصول على ملف GIF يناسب احتياجاتك.
            </p>
          </article>

          {/* ما هي الأداة */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة تحويل الفيديو إلى GIF؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              أداة تحويل الفيديو إلى GIF هي أداة تساعدك على تحويل مقاطع الفيديو إلى صور متحركة بصيغة GIF، وهي صيغة شائعة لعرض الحركات القصيرة بشكل متكرر دون الحاجة إلى تشغيل الفيديو التقليدي.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              تُستخدم صور GIF في الرسائل والمحادثات، ومنشورات التواصل الاجتماعي، والشروحات التعليمية، والعروض التوضيحية، والمحتوى الرقمي.
            </p>
          </article>

          {/* كيفية التحويل */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيفية تحويل الفيديو إلى GIF
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'ارفع الفيديو', desc: 'اختر ملف الفيديو الذي تريد تحويله من جهازك.' },
                { num: 2, title: 'حدد المقطع', desc: 'اختر الجزء الذي تريد استخدامه لإنشاء صورة GIF باستخدام شريط القص الزمني.' },
                { num: 3, title: 'خصص الإعدادات', desc: 'اضبط الأبعاد ومعدل الإطارات للحصول على النتيجة المناسبة.' },
                { num: 4, title: 'ابدأ التحويل', desc: 'شغّل عملية تحويل الفيديو إلى GIF وانتظر حتى تكتمل.' },
                { num: 5, title: 'نزّل الملف', desc: 'احفظ صورة GIF الناتجة على جهازك واستخدمها أينما تريد.' },
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

          {/* المميزات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              مميزات تحويل الفيديو إلى GIF أونلاين
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '⚡', title: 'سهولة الاستخدام', desc: 'تحويل الفيديو إلى صورة متحركة بخطوات بسيطة.' },
                { icon: '⏱️', title: 'توفير الوقت', desc: 'إنشاء ملفات GIF دون تعلم برامج تحرير الفيديو.' },
                { icon: '✂️', title: 'تحديد المقطع المناسب', desc: 'استخراج لحظة محددة من الفيديو.' },
                { icon: '🎨', title: 'التحكم في الجودة', desc: 'ضبط الأبعاد ومعدل الإطارات.' },
                { icon: '🔒', title: 'خصوصية 100%', desc: 'فيديوهاتك لا ترفع إلى أي خادم.' },
                { icon: '📱', title: 'جميع الأجهزة', desc: 'جوال، تابلت، كمبيوتر.' },
              ].map((f, i) => (
                <div key={i} className={`${cardClass} border rounded-xl p-4 text-right`}>
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className={`text-xs ${textClass} leading-relaxed`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* لماذا تحول */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              لماذا تحوّل الفيديو إلى صورة GIF؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              تُعد صور GIF خيارًا عمليًا عندما تريد عرض حركة قصيرة بطريقة سهلة وسريعة. يمكنك استخدامها لشرح خطوة معينة، أو توضيح طريقة عمل ميزة في برنامج، أو مشاركة لحظة طريفة من مقطع فيديو، أو إنشاء محتوى مرئي بسيط للمواقع والمدونات.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              لكن تجدر الإشارة إلى أن ملفات GIF قد تكون أكبر حجمًا من بعض صيغ الفيديو الحديثة، خصوصًا عند تحويل المقاطع الطويلة أو ذات الأبعاد الكبيرة. لذلك يُفضّل اختيار مقطع قصير وضبط الأبعاد والإعدادات المناسبة لتقليل حجم الملف.
            </p>
          </article>

          {/* FAQ */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أسئلة شائعة حول تحويل الفيديو إلى GIF
            </h2>
            <div className="space-y-3">
              {[
                { q: 'كيف أحوّل الفيديو إلى GIF مجانًا؟', a: 'افتح أداة تحويل الفيديو إلى GIF على Intooly، وارفع ملف الفيديو، ثم اضبط الخيارات المتاحة وابدأ التحويل. بعد اكتمال العملية، يمكنك تنزيل الملف الناتج.' },
                { q: 'هل يمكن تحويل MP4 إلى GIF؟', a: 'نعم، يمكن تحويل ملفات MP4 إلى صور GIF باستخدام الأداة. كما تدعم الأداة صيغ WebM و MOV و AVI.' },
                { q: 'هل أحتاج إلى تثبيت برنامج لتحويل الفيديو إلى GIF؟', a: 'لا تحتاج إلى تثبيت برنامج. الأداة تعمل مباشرة من المتصفح باستخدام FFmpeg.wasm، وكل المعالجة تتم محلياً على جهازك.' },
                { q: 'كيف أحصل على ملف GIF بحجم صغير؟', a: 'استخدم مقطعًا قصيرًا، وقلّل أبعاد الصورة ومعدل الإطارات. يساعد ذلك على تقليل حجم الملف، مع مراعاة أن التخفيض المفرط قد يؤثر في جودة الحركة.' },
                { q: 'ما الفرق بين GIF والفيديو؟', a: 'GIF صيغة صور متحركة مناسبة للحركات القصيرة والتكرار المستمر، بينما توفر صيغ الفيديو الحديثة عادةً جودة أفضل وضغطًا أكثر كفاءة للصوت والصورة.' },
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، الأداة مجانية 100% وبدون حدود على عدد الفيديوهات، وبدون علامات مائية.' },
                { q: 'هل فيديوهاتي آمنة؟', a: 'نعم 100%. كل المعالجة تتم محلياً في متصفحك باستخدام FFmpeg.wasm. فيديوهاتك لا تُرفع إلى أي خادم.' },
                { q: 'هل يعمل على الجوال؟', a: 'نعم، لكن الأداء يعتمد على قوة الجهاز. Chrome و Edge هما الأفضل.' },
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

          {/* CTA */}
          <article className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900">
              ابدأ تحويل الفيديو إلى GIF الآن
            </h2>
            <p className={`text-base leading-relaxed mb-6 ${textClass}`}>
              جرّب أداة تحويل الفيديو إلى GIF، واختر الإعدادات المناسبة للحصول على النتيجة التي تحتاج إليها.
            </p>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => fileInputRef.current?.click(), 300);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black rounded-xl text-base shadow-lg shadow-brand-500/30 transition-all"
            >
              <Wand2 className="w-5 h-5" />
              ابدأ التحويل الآن
            </button>
          </article>

          {/* أدوات ذات صلة */}
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
