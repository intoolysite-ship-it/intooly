'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Download, Link as LinkIcon, Loader2, AlertCircle, CheckCircle2, 
  Music, FileVideo, Play, X, Sparkles, Clipboard, Copy, ArrowLeft
} from 'lucide-react';
import TiktokSeoContent from '@/components/tiktok-downloader/SeoContent';

type DownloadResult = {
  title: string;
  author: string;
  cover: string;
  duration: number;
  videoUrl: string;
  hdVideoUrl?: string;
  audioUrl: string;
  noWatermarkUrl: string;
};

export default function TiktokDownloaderPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
        if (videoRef.current) videoRef.current.pause();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPreview]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) { setError('يرجى إدخال رابط فيديو تيك توك صحيح'); return; }
    if (!url.includes('tiktok.com')) { setError('الرابط المدخل لا يبدو أنه رابط تيك توك صالح'); return; }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowPreview(false);

    try {
      const formData = new URLSearchParams();
      formData.append('url', url);
      formData.append('hd', '1');

      const response = await fetch('/api/tiktok', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.code === 0 && data.data) {
        setResult(data.data);
        setShowPreview(true);
        showToast('✅ تم العثور على الفيديو بنجاح!');
      } else {
        setError(data.msg || 'لم نتمكن من معالجة هذا الرابط');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const forceDownload = async (downloadUrl: string, filename: string) => {
    if (!downloadUrl || downloadUrl === '#') { showToast('❌ الرابط غير متاح', true); return; }
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('فشل الاتصال');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      showToast('✅ بدأ التنزيل بنجاح');
    } catch (err) {
      console.error('تنزيل Blob فشل:', err);
      window.open(downloadUrl, '_blank');
      showToast('💡 تم فتح الرابط في نافذة جديدة', false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setUrl(text); showToast('✅ تم اللصق'); }
    } catch { showToast('❌ يرجى السماح بالوصول للحافظة', true); }
  };

  const handleCopy = async () => {
    if (!url) { showToast('❌ لا يوجد رابط', true); return; }
    await navigator.clipboard.writeText(url);
    showToast('✅ تم نسخ الرابط');
  };

  const clearUrl = () => {
    setUrl(''); setResult(null); setError(null); setShowPreview(false);
  };

  return (
    <main className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-ink-100">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #1f2937 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        
        <div className="container relative mx-auto px-4 py-10 md:py-14 max-w-4xl">
          <Link href="/tools/video" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> أدوات الفيديو
          </Link>
          
          <div className="flex items-start gap-3 sm:gap-4 mb-8">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <Download className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">تنزيل فيديوهات تيك توك بدون علامة مائية</h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أداة مجانية وسريعة لتحميل فيديوهات تيك توك بجودة عالية HD أو استخراج الصوت MP3. بدون إعلانات، بدون تسجيل، وخصوصية تامة.
              </p>
            </div>
          </div>

          {/* Download Form */}
          <div className="bg-white border border-ink-200 rounded-2xl shadow-xl p-4 md:p-6 max-w-2xl mx-auto">
            <div className="relative mb-4">
              <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 w-5 h-5" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="الصق رابط الفيديو هنا..."
                className="w-full pr-12 pl-12 py-4 rounded-xl bg-ink-50 border-2 border-ink-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-ink-900 placeholder:text-ink-400 font-medium"
                disabled={isLoading}
                dir="ltr"
              />
              {url && (
                <button type="button" onClick={clearUrl} className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-ink-200 hover:bg-brand-500 hover:text-white text-ink-600 rounded-full flex items-center justify-center transition-all" title="مسح">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <button type="button" onClick={handlePaste} className="flex items-center gap-2 px-4 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-xl transition-all">
                <Clipboard className="w-4 h-4" /> لصق
              </button>
              <button type="button" onClick={handleCopy} className="flex items-center gap-2 px-4 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-xl transition-all">
                <Copy className="w-4 h-4" /> نسخ
              </button>
              <button type="button" onClick={handleDownload} disabled={isLoading || !url.trim()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg">
                {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...</>) : (<><Download className="w-5 h-5" /> جلب الفيديو</>)}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2 text-right">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Result Section */}
      {result && (
        <section className="py-10 md:py-14 container mx-auto px-4 max-w-4xl">
          <div className="bg-white border border-ink-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-ink-50 p-5 border-b border-ink-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-ink-900">تم جلب الفيديو بنجاح!</h3>
                  <p className="text-xs text-ink-600">اختر ما تريد تنزيله</p>
                </div>
              </div>
              <button onClick={clearUrl} className="text-sm text-ink-600 hover:text-red-600 font-bold flex items-center gap-1">
                <X className="w-4 h-4" /> فيديو جديد
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* Preview */}
              <div className="mb-8">
                <div className="relative rounded-2xl overflow-hidden bg-ink-900 aspect-video max-h-[400px] mx-auto border border-ink-200">
                  {showPreview ? (
                    <video ref={videoRef} src={result.noWatermarkUrl} poster={result.cover} controls autoPlay muted playsInline className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full relative cursor-pointer group" onClick={() => setShowPreview(true)}>
                      <img src={result.cover} alt={result.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-ink-900/40 flex items-center justify-center group-hover:bg-ink-900/60 transition-all">
                        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-brand-600 mr-[-4px]" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h4 className="font-bold text-ink-900 mb-1 line-clamp-2">{result.title}</h4>
                  <p className="text-sm text-ink-600">بواسطة: <span className="font-bold text-brand-600">{result.author}</span></p>
                </div>
              </div>

              {/* Download Boxes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-ink-50 border border-ink-200 rounded-xl p-4 hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                      <FileVideo className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-ink-900">تنزيل الفيديو كاملاً</h4>
                      <p className="text-xs text-ink-600">جودة عالية (HD) بدون علامة مائية • MP4</p>
                    </div>
                  </div>
                  <button onClick={() => forceDownload(result.hdVideoUrl || result.noWatermarkUrl, `tiktok_video_${Date.now()}.mp4`)} className="flex items-center gap-2 px-5 py-2.5 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl transition-all">
                    <Download className="w-4 h-4" /> حفظ الفيديو
                  </button>
                </div>

                <div className="flex items-center justify-between bg-ink-50 border border-ink-200 rounded-xl p-4 hover:border-brand-400 hover:bg-brand-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                      <Music className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-ink-900">تنزيل المقطع الصوتي</h4>
                      <p className="text-xs text-ink-600">الصوت الأصلي للفيديو • MP3</p>
                    </div>
                  </div>
                  <button onClick={() => forceDownload(result.audioUrl, `tiktok_audio_${Date.now()}.mp3`)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all">
                    <Download className="w-4 h-4" /> حفظ الصوت
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 transition-all ${toast.isError ? 'bg-red-600' : 'bg-ink-900'} text-white font-medium`}>
          {toast.message}
        </div>
      )}

      {/* SEO Content */}
      <TiktokSeoContent />
    </main>
  );
}
