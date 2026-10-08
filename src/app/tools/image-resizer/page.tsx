'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Image as ImageIcon, Sparkles,
  ArrowLeft, FileImage, ChevronDown, Trash2, Layers,
  FileArchive, CheckCircle2,
  Maximize, Lock, Unlock, RefreshCw,
  AlertCircle, Loader2, Percent, Scissors
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type ResizedImage = {
  id: string;
  file: File;
  originalUrl: string;
  resizedUrl: string | null;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  resizedSize: number | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
};

export default function ImageResizerPage() {
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resizeMode, setResizeMode] = useState<'pixels' | 'percent'>('pixels');
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/jpeg');
  const [outputQuality, setOutputQuality] = useState(90);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const [targetWidth, setTargetWidth] = useState<number | ''>('');
  const [targetHeight, setTargetHeight] = useState<number | ''>('');
  const [targetPercent, setTargetPercent] = useState<number | ''>(100);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addImages(selectedFiles);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImages(droppedFiles);
  }, []);

  const addImages = (newFiles: File[]) => {
    const promises = newFiles.map(file => {
      return new Promise<ResizedImage>((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            file,
            originalUrl: url,
            resizedUrl: null,
            originalWidth: img.width,
            originalHeight: img.height,
            targetWidth: img.width,
            targetHeight: img.height,
            resizedSize: null,
            status: 'pending',
          });
        };
        img.onerror = () => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            file,
            originalUrl: url,
            resizedUrl: null,
            originalWidth: 0,
            originalHeight: 0,
            targetWidth: 0,
            targetHeight: 0,
            resizedSize: null,
            status: 'error',
            errorMessage: 'فشل في تحميل الصورة',
          });
        };
        img.src = url;
      });
    });

    Promise.all(promises).then(newImages => {
      setImages(prev => [...prev, ...newImages]);

      if (newImages.length > 0 && (targetWidth === '' || targetHeight === '')) {
        const first = newImages[0];
        if (resizeMode === 'pixels') {
          setTargetWidth(first.originalWidth);
          setTargetHeight(first.originalHeight);
        } else {
          setTargetPercent(100);
        }
      }
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.originalUrl);
        if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleWidthChange = (value: number | '') => {
    setTargetWidth(value);
    if (lockAspectRatio && images.length > 0 && value !== '') {
      const first = images[0];
      const ratio = first.originalHeight / first.originalWidth;
      setTargetHeight(Math.round(value * ratio));
    }
  };

  const handleHeightChange = (value: number | '') => {
    setTargetHeight(value);
    if (lockAspectRatio && images.length > 0 && value !== '') {
      const first = images[0];
      const ratio = first.originalWidth / first.originalHeight;
      setTargetWidth(Math.round(value * ratio));
    }
  };

  const handlePercentChange = (value: number | '') => {
    setTargetPercent(value);
    if (images.length > 0 && value !== '') {
      const first = images[0];
      setTargetWidth(Math.round(first.originalWidth * value / 100));
      setTargetHeight(Math.round(first.originalHeight * value / 100));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setResizeMode('pixels');
    setLockAspectRatio(false);
    setTargetWidth(w);
    setTargetHeight(h);

    setImages(prev => prev.map(img => ({
      ...img,
      targetWidth: w,
      targetHeight: h,
      resizedUrl: null,
      status: 'pending' as const,
    })));
  };

  const resizeSingleImage = async (img: ResizedImage): Promise<ResizedImage> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ ...img, status: 'error', errorMessage: 'فشل في إنشاء Canvas' });
        return;
      }

      canvas.width = img.targetWidth;
      canvas.height = img.targetHeight;

      const image = new window.Image();
      image.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(image, 0, 0, img.targetWidth, img.targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                ...img,
                resizedUrl: URL.createObjectURL(blob),
                resizedSize: blob.size,
                status: 'done',
              });
            } else {
              resolve({ ...img, status: 'error', errorMessage: 'فشل في إنشاء الصورة' });
            }
          },
          outputFormat,
          outputQuality / 100
        );
      };
      image.onerror = () => {
        resolve({ ...img, status: 'error', errorMessage: 'فشل في تحميل الصورة' });
      };
      image.src = img.originalUrl;
    });
  };

  const processAll = async () => {
    setIsProcessingAll(true);

    const updatedImages = images.map(img => {
      if (resizeMode === 'pixels') {
        if (lockAspectRatio) {
          const ratio = img.originalHeight / img.originalWidth;
          return {
            ...img,
            targetWidth: typeof targetWidth === 'number' ? targetWidth : img.originalWidth,
            targetHeight: typeof targetWidth === 'number' ? Math.round(targetWidth * ratio) : img.originalHeight,
          };
        } else {
          return {
            ...img,
            targetWidth: typeof targetWidth === 'number' ? targetWidth : img.originalWidth,
            targetHeight: typeof targetHeight === 'number' ? targetHeight : img.originalHeight,
          };
        }
      } else {
        const percent = typeof targetPercent === 'number' ? targetPercent : 100;
        return {
          ...img,
          targetWidth: Math.round(img.originalWidth * percent / 100),
          targetHeight: Math.round(img.originalHeight * percent / 100),
        };
      }
    });

    setImages(updatedImages);

    for (let i = 0; i < updatedImages.length; i++) {
      if (updatedImages[i].status === 'pending' || updatedImages[i].status === 'error') {
        setImages(prev => prev.map((img, idx) => idx === i ? { ...img, status: 'processing' } : img));
        const resized = await resizeSingleImage(updatedImages[i]);
        setImages(prev => prev.map((img, idx) => idx === i ? resized : img));
      }
    }

    setIsProcessingAll(false);
  };

  const downloadImage = (img: ResizedImage) => {
    if (!img.resizedUrl) return;
    const link = document.createElement('a');
    link.href = img.resizedUrl;
    const ext = outputFormat.split('/')[1];
    link.download = `resized_${img.file.name.split('.')[0]}.${ext}`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const doneImages = images.filter(img => img.status === 'done' && img.resizedUrl);
    const ext = outputFormat.split('/')[1];

    for (const img of doneImages) {
      const response = await fetch(img.resizedUrl!);
      const blob = await response.blob();
      zip.file(`resized_${img.file.name.split('.')[0]}.${ext}`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'intooly-resized-images.zip');
  };

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  const getGridCols = () => {
    if (images.length === 1) return 'grid-cols-1';
    if (images.length === 2) return 'grid-cols-1 md:grid-cols-2';
    if (images.length <= 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const getImageHeight = () => {
    if (images.length === 1) return 'h-64 md:h-96';
    if (images.length === 2) return 'h-48 md:h-72';
    if (images.length <= 4) return 'h-40 md:h-56';
    return 'h-32 md:h-48';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">

      {/* ================================================== */}
      {/* ✅ HERO BANNER — هوية intooly الموحّدة               */}
      {/* ================================================== */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20 text-ink-900"
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
                <Maximize className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                تغيير حجم الصور بالبكسل أو النسبة
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              بكسل أو نسبة • قفل النسبة • معالجة مجمعة • ZIP
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              مجاناً • بدون علامة مائية • بدون رفع للخادم
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FEATURES                                            */}
      {/* ================================================== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            {[
              { icon: Maximize, title: 'أبعاد دقيقة', desc: 'بالبكسل أو النسبة' },
              { icon: Lock, title: 'نسبة العرض', desc: 'حفاظ تلقائي' },
              { icon: Layers, title: 'معالجة مجمعة', desc: 'صور متعددة' },
              { icon: FileArchive, title: 'تحميل ZIP', desc: 'ملف واحد' },
            ].map((f, i) => (
              <div key={i} className={`${cardClass} border rounded-xl md:rounded-2xl p-4 md:p-5 text-center shadow-sm`}>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-100 text-brand-600 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <f.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="font-bold text-sm md:text-lg mb-1">{f.title}</h3>
                <p className={`text-xs md:text-sm ${textClass}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MAIN TOOL                                           */}
      {/* ================================================== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className={`${cardClass} border rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 max-w-7xl mx-auto`}>

            {images.length === 0 ? (
              <div className="text-center space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 md:border-3 border-dashed border-brand-300 bg-brand-50/50 rounded-xl md:rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group"
                >
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2">اسحب الصور هنا أو انقر للاختيار</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>يدعم JPG, PNG, WebP — حتى 50 صورة</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* عمود الصور */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 md:gap-4 bg-ink-900 text-white">
                    <div className="flex items-center gap-3">
                      <Layers className="w-6 h-6 md:w-8 md:h-8 text-brand-500" />
                      <div>
                        <p className="text-ink-400 text-xs">إجمالي الصور</p>
                        <p className="text-xl md:text-2xl font-black">{images.length}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setImages([]);
                          if(fileInputRef.current) fileInputRef.current.value = '';
                          setTargetWidth('');
                          setTargetHeight('');
                          setTargetPercent(100);
                        }}
                        className="px-4 py-2 rounded-lg font-bold text-sm bg-ink-200 hover:bg-ink-300 text-ink-900"
                      >
                        مسح الكل
                      </button>
                      <button
                        onClick={processAll}
                        disabled={isProcessingAll}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-ink-300 text-white font-bold rounded-lg text-sm flex items-center gap-2"
                      >
                        {isProcessingAll ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> جاري...</>
                        ) : (
                          <><Maximize className="w-4 h-4" /> تغيير الحجم</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={`grid ${getGridCols()} gap-4 max-h-[700px] overflow-y-auto p-2`}>
                    {images.map((img) => (
                      <div key={img.id} className={`${cardClass} border rounded-xl md:rounded-2xl overflow-hidden relative group`}>
                        <div className={`grid gap-1 p-2 bg-ink-100/50 ${images.length === 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          <div className="relative">
                            <div className="absolute top-1 right-1 bg-ink-900/80 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">الأصلية</div>
                            <img src={img.originalUrl} alt="original" className={`w-full ${getImageHeight()} object-contain rounded-lg bg-white`} />
                            <p className="text-[10px] md:text-xs text-center mt-1 font-semibold text-ink-600">
                              {img.originalWidth}×{img.originalHeight}
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute top-1 right-1 bg-brand-500/90 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                              {img.status === 'done' ? 'الجديدة' : img.status === 'processing' ? 'جاري...' : 'المتوقعة'}
                            </div>
                            {img.resizedUrl ? (
                              <>
                                <img src={img.resizedUrl} alt="resized" className={`w-full ${getImageHeight()} object-contain rounded-lg bg-white`} />
                                <p className="text-[10px] md:text-xs text-center mt-1 font-semibold text-green-600">
                                  {img.targetWidth}×{img.targetHeight}
                                </p>
                              </>
                            ) : (
                              <div className={`w-full ${getImageHeight()} flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200`}>
                                <div className="text-center">
                                  <Maximize className="w-6 h-6 md:w-8 md:h-8 text-brand-400 mx-auto mb-1" />
                                  <p className="text-[10px] md:text-xs text-brand-600 font-semibold">
                                    {img.status === 'processing' ? 'جاري...' : `${img.targetWidth}×${img.targetHeight}`}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 md:p-4">
                          <p className="font-bold text-xs md:text-sm truncate mb-2" title={img.file.name}>{img.file.name}</p>

                          {img.status === 'error' && (
                            <div className="mb-2 p-2 bg-red-100 text-red-700 text-xs rounded-lg flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> {img.errorMessage}
                            </div>
                          )}

                          {img.status === 'done' && img.resizedUrl && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className={textClass}>الحجم الجديد:</span>
                                <span className="font-bold text-green-600">
                                  {img.resizedSize ? formatFileSize(img.resizedSize) : '-'}
                                </span>
                              </div>
                              <button
                                onClick={() => downloadImage(img)}
                                className="w-full py-2 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-1"
                              >
                                <Download className="w-3 h-3" /> تحميل
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-2 left-2 w-7 h-7 md:w-8 md:h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {images.some(img => img.status === 'done') && (
                    <button
                      onClick={downloadAllAsZip}
                      className="w-full px-6 py-4 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <FileArchive className="w-5 h-5" /> تحميل الكل (ZIP)
                    </button>
                  )}
                </div>

                {/* عمود الإعدادات */}
                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl p-4 sticky top-4`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-brand-500" /> الإعدادات
                    </h3>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1">
                        <Maximize className="w-4 h-4 text-brand-500" /> وضع تغيير الحجم
                      </label>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => setResizeMode('pixels')}
                          className={`p-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            resizeMode === 'pixels' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'
                          }`}
                        >
                          <Maximize className="w-3 h-3" /> بكسل
                        </button>
                        <button
                          onClick={() => setResizeMode('percent')}
                          className={`p-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            resizeMode === 'percent' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'
                          }`}
                        >
                          <Percent className="w-3 h-3" /> نسبة مئوية
                        </button>
                      </div>
                    </div>

                    {resizeMode === 'pixels' ? (
                      <div className="mb-4">
                        <label className="text-sm font-bold mb-2 block">الأبعاد المستهدفة (بكسل)</label>

                        <div className="flex items-end gap-2 mb-3">
                          <div className="flex-1">
                            <label className="text-xs font-bold mb-1 block text-center">العرض</label>
                            <input
                              type="number"
                              value={targetWidth}
                              onChange={(e) => handleWidthChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                              placeholder="العرض"
                              className="w-full p-2 rounded-lg border text-sm text-center bg-ink-50 border-ink-200"
                            />
                          </div>

                          <button
                            onClick={() => setLockAspectRatio(!lockAspectRatio)}
                            className={`p-2.5 rounded-lg border-2 transition-all mb-0.5 ${
                              lockAspectRatio
                                ? 'border-brand-500 bg-brand-500 text-white'
                                : 'border-ink-300 bg-ink-100 text-ink-500'
                            }`}
                            title={lockAspectRatio ? 'القفل مفعّل - النسبة محفوظة' : 'القفل معطّل - أبعاد حرة'}
                          >
                            {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          <div className="flex-1">
                            <label className="text-xs font-bold mb-1 block text-center">الارتفاع</label>
                            <input
                              type="number"
                              value={targetHeight}
                              onChange={(e) => handleHeightChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                              placeholder="الارتفاع"
                              className="w-full p-2 rounded-lg border text-sm text-center bg-ink-50 border-ink-200"
                            />
                          </div>
                        </div>

                        <div className={`text-xs text-center p-1.5 rounded-lg ${
                          lockAspectRatio
                            ? 'bg-brand-50 text-brand-600'
                            : 'bg-ink-100 text-ink-500'
                        }`}>
                          {lockAspectRatio ? '🔒 القفل مفعّل - النسبة محفوظة تلقائياً' : '🔓 القفل معطّل - أبعاد حرة'}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="text-sm font-bold mb-2 block">النسبة المئوية</label>
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={targetPercent}
                            onChange={(e) => handlePercentChange(e.target.value === '' ? '' : parseInt(e.target.value))}
                            placeholder="100"
                            min="1"
                            max="1000"
                            className="w-full p-2 rounded-lg border text-sm bg-ink-50 border-ink-200"
                          />
                          <input
                            type="range"
                            min="1"
                            max="200"
                            value={typeof targetPercent === 'number' ? targetPercent : 100}
                            onChange={(e) => handlePercentChange(parseInt(e.target.value))}
                            className="w-full accent-brand-500"
                          />
                          <div className="flex justify-between text-xs text-ink-500">
                            <span>1%</span>
                            <span>100%</span>
                            <span>200%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1">
                        <FileImage className="w-4 h-4 text-brand-500" /> صيغة الإخراج
                      </label>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as any)}
                        className="w-full p-2 rounded-lg border text-sm bg-ink-50 border-ink-200"
                      >
                        <option value="image/jpeg">JPEG (صغير الحجم)</option>
                        <option value="image/png">PNG (جودة عالية + شفافية)</option>
                        <option value="image/webp">WebP (الأحدث والأصغر)</option>
                      </select>
                    </div>

                    {(outputFormat === 'image/jpeg' || outputFormat === 'image/webp') && (
                      <div className="mb-4">
                        <label className="text-sm font-bold mb-2 block">الجودة: {outputQuality}%</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={outputQuality}
                          onChange={(e) => setOutputQuality(parseInt(e.target.value))}
                          className="w-full accent-brand-500"
                        />
                        <div className="flex justify-between text-xs text-ink-500 mt-1">
                          <span>10%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4 border-t border-ink-200/20 pt-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-brand-500" /> أبعاد سريعة
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { w: 1920, h: 1080, label: 'Full HD' },
                          { w: 1280, h: 720, label: 'HD' },
                          { w: 1080, h: 1080, label: 'انستقرام' },
                          { w: 1200, h: 630, label: 'فيسبوك' },
                          { w: 1500, h: 500, label: 'تويتر' },
                          { w: 2560, h: 1440, label: '2K' },
                        ].map((preset, i) => (
                          <button
                            key={i}
                            onClick={() => applyPreset(preset.w, preset.h)}
                            className={`p-3 rounded-lg border-2 text-xs font-bold transition-all hover:scale-105 ${
                              targetWidth === preset.w && targetHeight === preset.h
                                ? 'border-brand-500 bg-brand-500 text-white'
                                : 'border-ink-200 hover:border-brand-300'
                            }`}
                          >
                            <div className="font-bold">{preset.label}</div>
                            <div className="text-[10px] opacity-75 mt-1">{preset.w}×{preset.h}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* ✅ SEO CONTENT — أسفل الأداة                         */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة تغيير حجم الصور؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              <strong>أداة تغيير حجم الصور</strong> هي أداة مجانية تعمل في المتصفح تتيح لك تصغير أو تكبير
              أبعاد صورك بالبكسل أو النسبة المئوية، مع الحفاظ على جودة عالية. تتم كل المعالجة
              <strong> محلياً في جهازك</strong> — لا يتم رفع أي صورة إلى أي خادم، مما يضمن
              <strong> خصوصية كاملة 100%</strong>. مثالية لصور إنستغرام، أمازون، نون، ومواقع الويب.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              على عكس البرامج التقليدية التي تتطلب تثبيتاً، تعمل الأداة <strong>مباشرة في متصفحك</strong>
              على أي جهاز — كمبيوتر، تابلت، أو جوال. وتدعم المعالجة المجمعة حتى <strong>50 صورة</strong>
              في وقت واحد، مع إمكانية التحميل كملف ZIP واحد.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              حالات استخدام تغيير حجم الصور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '📱', title: 'منصات التواصل', desc: 'إنستغرام (1080×1080)، فيسبوك (1200×630)، تويتر (1500×500)، واتساب (1600×1600)' },
                { icon: '🛒', title: 'المتاجر الإلكترونية', desc: 'أمازون (2000×2000)، نون (1200×1200)، شوبيفاي (2048×2048)، Etsy (2000×2000)' },
                { icon: '⚡', title: 'تحسين سرعة الموقع', desc: 'تصغير الصور الكبيرة يحسّن Core Web Vitals ويرفع ترتيبك في نتائج Google' },
                { icon: '📧', title: 'البريد الإلكتروني', desc: 'ضبط عرض الصور لتناسب عملاء البريد — Gmail، Outlook، وغيرها' },
                { icon: '🖨️', title: 'الطباعة', desc: 'ضبط الأبعاد لمقاسات A4، A3، أو أي مقاس طباعة مخصص' },
                { icon: '🎨', title: 'المصممون', desc: 'تحضير صور بأبعاد دقيقة للاستخدام في Figma، Photoshop، Canva' },
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
              كيف تغيّر حجم صورة في 3 خطوات؟
            </h2>
            <div className="space-y-4">
              {[
                { num: '1', title: 'حمّل الصورة', desc: 'اسحب الصورة إلى منطقة الرفع، أو انقر للاختيار من جهازك. يدعم JPG، PNG، WebP — حتى 50 صورة في وقت واحد.' },
                { num: '2', title: 'اختر الوضع والأبعاد', desc: 'اختر "بكسل" لأبعاد دقيقة، أو "نسبة مئوية" للتصغير السريع. فعّل القفل 🔒 للحفاظ على نسبة العرض إلى الارتفاع، أو استخدم أحد الأبعاد السريعة الجاهزة (Full HD، HD، انستقرام).' },
                { num: '3', title: 'حمّل النتيجة', desc: 'اضغط "تغيير الحجم" وانتظر ثوانٍ. حمّل كل صورة على حدة، أو استخدم ZIP لتحميل كل الصور دفعة واحدة.' },
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

        </div>
      </section>

      {/* ================================================== */}
      {/* FAQ — موسّع بـ 8 أسئلة                             */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-ink-900">
            ❓ الأسئلة الشائعة حول تغيير حجم الصور
          </h2>
          <div className="space-y-2 md:space-y-3">
            {[
              { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون حدود على عدد الصور. لا نطلب تسجيل دخول ولا نضع علامة مائية على النتائج.' },
              { q: 'هل صوري آمنة؟', a: 'نعم 100%. كل المعالجة تتم محلياً في متصفحك باستخدام Canvas API. لا يتم رفع أي صورة إلى أي خادم، مما يضمن خصوصية كاملة.' },
              { q: 'هل تغيير حجم الصورة يقلل الجودة؟', a: 'تصغير حجم الصورة عادةً لا يقلل الجودة بشكل ملحوظ. أما تكبير الصورة فوق أبعادها الأصلية فيؤدي إلى ضبابية. للحصول على أفضل نتيجة، استخدم WebP أو JPEG بجودة 85-95%.' },
              { q: 'ما الفرق بين JPEG و PNG و WebP؟', a: 'JPEG: أصغر حجماً، مناسب للصور العادية بدون شفافية. PNG: يحافظ على الشفافية والجودة العالية، لكن حجمه أكبر. WebP: الأحدث، أصغر بـ 25-35% من JPEG مع نفس الجودة.' },
              { q: 'كيف أحافظ على نسبة العرض إلى الارتفاع؟', a: 'فعّل زر القفل 🔒 بين حقلي العرض والارتفاع. عند تغيير أحد البعدين، يُحسَب الآخر تلقائياً للحفاظ على النسبة الأصلية. لعكس ذلك، اضغط على القفل لتعطيله.' },
              { q: 'هل يمكن تغيير حجم عدة صور دفعة واحدة؟', a: 'نعم، يمكنك رفع حتى 50 صورة ومعالجتها جميعاً بنفس الإعدادات في وقت واحد، ثم تحميلها كملف ZIP واحد.' },
              { q: 'ما هي أفضل أبعاد لصور إنستغرام؟', a: 'منشور مربع: 1080×1080 بكسل. ستوري: 1080×1920 بكسل. Reels: 1080×1920 بكسل. صورة البروفايل: 320×320 بكسل. استخدم زر "انستقرام" في الأبعاد السريعة.' },
              { q: 'هل الأداة تعمل على الجوال؟', a: 'نعم، الأداة متجاوبة 100% وتعمل على أي متصفح حديث — Chrome، Safari، Firefox، Edge — سواء على الكمبيوتر أو الجوال أو التابلت.' },
            ].map((faq, i) => (
              <details key={i} className={`${cardClass} border rounded-lg md:rounded-xl overflow-hidden group`}>
                <summary className="p-4 md:p-5 cursor-pointer font-bold text-sm md:text-base flex justify-between items-center text-ink-900">
                  {faq.q} <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-brand-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className={`px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-sm ${textClass} border-t border-ink-100 pt-3 leading-relaxed`}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* RELATED TOOLS                                       */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-ink-900">
            🛠️ أدوات ذات صلة قد تعجبك
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: FileImage, title: 'ضاغط الصور', href: '/tools/image-compressor' },
              { icon: Layers, title: 'إزالة الخلفية AI', href: '/tools/background-remover' },
              { icon: Scissors, title: 'قص الصور', href: '/tools/image-cropper' },
              { icon: RefreshCw, title: 'تحويل الصيغ', href: '/tools/image-converter' },
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className={`${cardClass} border p-4 md:p-5 rounded-xl md:rounded-2xl hover:shadow-lg hover:border-brand-400 transition-all group text-right cursor-pointer block`}
              >
                <tool.icon className="w-7 h-7 md:w-8 md:h-8 text-brand-500 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm md:text-base text-ink-900">{tool.title}</h3>
                <p className="text-xs text-brand-600 mt-2 flex items-center gap-1 font-bold">
                  جرّب الأداة <ArrowLeft className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* ✅ FAQ Schema Markup — لتحسين الظهور في Google       */}
      {/* ================================================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'هل تغيير حجم الصورة يقلل الجودة؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'تصغير حجم الصورة عادةً لا يقلل الجودة بشكل ملحوظ. أما تكبير الصورة فوق أبعادها الأصلية فيؤدي إلى ضبابية. للحصول على أفضل نتيجة، استخدم WebP أو JPEG بجودة 85-95%.',
                },
              },
              {
                '@type': 'Question',
                name: 'هل صوري آمنة مع أداة تغيير حجم الصور؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'نعم 100%. كل المعالجة تتم محلياً في متصفحك باستخدام Canvas API. لا يتم رفع أي صورة إلى أي خادم، مما يضمن خصوصية كاملة.',
                },
              },
              {
                '@type': 'Question',
                name: 'ما الفرق بين JPEG و PNG و WebP؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'JPEG: أصغر حجماً، مناسب للصور العادية بدون شفافية. PNG: يحافظ على الشفافية والجودة العالية، لكن حجمه أكبر. WebP: الأحدث، أصغر بـ 25-35% من JPEG مع نفس الجودة.',
                },
              },
              {
                '@type': 'Question',
                name: 'ما هي أفضل أبعاد لصور إنستغرام؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'منشور مربع: 1080×1080 بكسل. ستوري: 1080×1920 بكسل. Reels: 1080×1920 بكسل. صورة البروفايل: 320×320 بكسل.',
                },
              },
              {
                '@type': 'Question',
                name: 'هل يمكن تغيير حجم عدة صور دفعة واحدة؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'نعم، يمكنك رفع حتى 50 صورة ومعالجتها جميعاً بنفس الإعدادات، ثم تحميلها كملف ZIP واحد.',
                },
              },
              {
                '@type': 'Question',
                name: 'كيف أحافظ على نسبة العرض إلى الارتفاع؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'فعّل زر القفل بين حقلي العرض والارتفاع. عند تغيير أحد البعدين، يُحسَب الآخر تلقائياً للحفاظ على النسبة الأصلية.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}