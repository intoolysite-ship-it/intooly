'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Image as ImageIcon, Zap, Shield,
  ArrowLeft, FileImage, ChevronDown, Trash2, Layers, Target,
  FileArchive, RotateCw, RotateCcw, RefreshCw, Sun, Contrast,
  Scissors, FileType, Maximize, Crop, Eye, Sparkles,
  CheckCircle2, Loader2, Wand2, Clipboard, BarChart3,
  FileSpreadsheet, Share2, Save, ArrowRightLeft, X
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ Types
// ============================================================
type ImageFile = {
  id: string;
  file: File;
  originalUrl: string;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number | null;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number | null;
  compressedHeight: number | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  renamedName?: string;
};

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type Mode = 'quick' | 'expert';
type Scenario = 'whatsapp' | 'web' | 'document' | 'email' | 'thumbnail' | null;

type Settings = {
  format: OutputFormat;
  quality: number;
  maxWidth: number | null;
  maxHeight: number | null;
  rotate: number;
  brightness: number;
  contrast: number;
  addWatermark: boolean;
  watermarkText: string;
  renamePrefix: string;
  renameSuffix: string;
};

type SessionStats = {
  totalOriginal: number;
  totalCompressed: number;
  totalFilesProcessed: number;
  totalSaved: number;
  avgSavings: number;
  sessionStart: number;
};

// ============================================================
// ✅ Constants
// ============================================================
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const CONCURRENCY = 3;
const SETTINGS_KEY = 'intooly-compressor-settings';
const STATS_KEY = 'intooly-compressor-stats';
const MODE_KEY = 'intooly-compressor-mode';

const DEFAULT_SETTINGS: Settings = {
  format: 'image/webp',
  quality: 80,
  maxWidth: null,
  maxHeight: null,
  rotate: 0,
  brightness: 100,
  contrast: 100,
  addWatermark: false,
  watermarkText: 'intooly.com',
  renamePrefix: '',
  renameSuffix: '',
};

const SCENARIOS: { id: Scenario; name: string; icon: string; desc: string; settings: Partial<Settings> }[] = [
  { id: 'whatsapp', name: 'واتساب', icon: '📱', desc: 'حجم صغير', settings: { format: 'image/jpeg', quality: 75, maxWidth: 1600, maxHeight: 1600 } },
  { id: 'web', name: 'ويب', icon: '🌐', desc: 'للمواقع', settings: { format: 'image/webp', quality: 80, maxWidth: 1920, maxHeight: 1920 } },
  { id: 'document', name: 'مستند', icon: '📄', desc: 'للطباعة', settings: { format: 'image/jpeg', quality: 90, maxWidth: 2400, maxHeight: 2400, brightness: 105, contrast: 115 } },
  { id: 'email', name: 'بريد', icon: '📧', desc: 'للإرسال', settings: { format: 'image/jpeg', quality: 70, maxWidth: 1280, maxHeight: 1280 } },
  { id: 'thumbnail', name: 'مصغّرة', icon: '🖼️', desc: 'صغيرة', settings: { format: 'image/webp', quality: 75, maxWidth: 400, maxHeight: 400 } },
];

// ============================================================
// ✅ Main Component
// ============================================================
export default function ImageCompressorPage() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [mode, setMode] = useState<Mode>('quick');
  const [showComparison, setShowComparison] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [activeScenario, setActiveScenario] = useState<Scenario>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveTimerRef = useRef<number | null>(null);

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalOriginal: 0,
    totalCompressed: 0,
    totalFilesProcessed: 0,
    totalSaved: 0,
    avgSavings: 0,
    sessionStart: Date.now(),
  });

  // ============================================================
  // ✅ Load from localStorage
  // ============================================================
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      const savedMode = localStorage.getItem(MODE_KEY);
      if (savedMode === 'expert') setMode('expert');
      const savedStats = localStorage.getItem(STATS_KEY);
      if (savedStats) setSessionStats(JSON.parse(savedStats));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(sessionStats)); } catch {}
  }, [sessionStats]);

  // ============================================================
  // ✅ Paste from Clipboard
  // ============================================================
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) addFiles(pastedFiles);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

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

  const getSavings = (file: ImageFile): number => {
    if (!file.compressedSize) return 0;
    return Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // ============================================================
  // ✅ Apply Smart Optimization
  // ============================================================
  const applySmartOptimization = () => {
    if (files.length === 0) return;
    const avgOriginalSize = files.reduce((a, f) => a + f.originalSize, 0) / files.length;
    const avgWidth = files.reduce((a, f) => a + f.originalWidth, 0) / files.length;

    let newFormat: OutputFormat = 'image/webp';
    let newQuality = 80;
    let newMaxWidth: number | null = null;

    if (avgWidth > 3000) { newMaxWidth = 1920; newQuality = 78; }
    else if (avgWidth > 1920) { newMaxWidth = 1920; newQuality = 80; }
    if (avgOriginalSize > 3 * 1024 * 1024) { newQuality = Math.min(newQuality, 72); }

    setSettings(prev => ({
      ...prev,
      format: newFormat,
      quality: newQuality,
      maxWidth: newMaxWidth,
      maxHeight: newMaxWidth,
    }));
  };

  const applyScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    const s = SCENARIOS.find(x => x.id === scenario);
    if (s) setSettings(prev => ({ ...prev, ...s.settings }));
  };

  // ============================================================
  // ✅ Process Single Image
  // ============================================================
  const processSingleImage = useCallback(async (imgFile: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve({ ...imgFile, status: 'error' });

        const isRotated90 = settings.rotate === 90 || settings.rotate === 270;
        let baseWidth = isRotated90 ? img.height : img.width;
        let baseHeight = isRotated90 ? img.width : img.height;

        let scale = 1;
        if (settings.maxWidth && baseWidth > settings.maxWidth) {
          scale = Math.min(scale, settings.maxWidth / baseWidth);
        }
        if (settings.maxHeight && baseHeight > settings.maxHeight) {
          scale = Math.min(scale, settings.maxHeight / baseHeight);
        }

        canvas.width = Math.round(baseWidth * scale);
        canvas.height = Math.round(baseHeight * scale);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.rotate * Math.PI) / 180);
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
        ctx.drawImage(
          img,
          -(img.width * scale) / 2,
          -(img.height * scale) / 2,
          img.width * scale,
          img.height * scale
        );
        ctx.filter = 'none';

        if (settings.addWatermark && settings.watermarkText) {
          ctx.save();
          ctx.rotate(-(settings.rotate * Math.PI) / 180);
          const fontSize = Math.max(20, Math.min(canvas.width, canvas.height) / 20);
          ctx.font = `bold ${fontSize}px Cairo, Arial, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.lineWidth = Math.max(3, fontSize / 8);
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          const x = canvas.width / 2 - 20;
          const y = canvas.height / 2 - 20;
          ctx.strokeText(settings.watermarkText, x, y);
          ctx.fillText(settings.watermarkText, x, y);
          ctx.restore();
        }

        const blob = await new Promise<Blob | null>((r) =>
          canvas.toBlob(r, settings.format, settings.quality / 100)
        );

        if (blob) {
          if (imgFile.compressedUrl) URL.revokeObjectURL(imgFile.compressedUrl);
          resolve({
            ...imgFile,
            compressedUrl: URL.createObjectURL(blob),
            compressedSize: blob.size,
            compressedWidth: canvas.width,
            compressedHeight: canvas.height,
            status: 'done',
          });
        } else {
          resolve({ ...imgFile, status: 'error' });
        }
      };
      img.onerror = () => resolve({ ...imgFile, status: 'error' });
      img.src = imgFile.originalUrl;
    });
  }, [settings]);

  // ============================================================
  // ✅ Live Settings
  // ============================================================
  const applyLiveSettings = useCallback(async () => {
    const doneFiles = files.filter(f => f.status === 'done' || f.status === 'pending');
    if (doneFiles.length === 0) return;

    for (let i = 0; i < doneFiles.length; i += CONCURRENCY) {
      const batch = doneFiles.slice(i, i + CONCURRENCY);
      const processed = await Promise.all(batch.map(f => processSingleImage(f)));
      setFiles(prev => {
        const newFiles = [...prev];
        processed.forEach(p => {
          const idx = newFiles.findIndex(f => f.id === p.id);
          if (idx !== -1) newFiles[idx] = p;
        });
        return newFiles;
      });
    }
  }, [files, processSingleImage]);

  useEffect(() => {
    if (files.length === 0) return;
    if (!files.some(f => f.status === 'done')) return;

    if (liveTimerRef.current) window.clearTimeout(liveTimerRef.current);
    liveTimerRef.current = window.setTimeout(() => applyLiveSettings(), 300);
    return () => {
      if (liveTimerRef.current) window.clearTimeout(liveTimerRef.current);
    };
  }, [
    settings.format, settings.quality, settings.rotate,
    settings.brightness, settings.contrast,
    settings.maxWidth, settings.maxHeight,
    settings.addWatermark, settings.watermarkText,
  ]);

  // ============================================================
  // ✅ File Handling
  // ============================================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(droppedFiles);
  }, []);

  const addFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => {
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
    if (validFiles.length === 0) return;

    const newImageFiles: ImageFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const dims = await getImageDimensions(file);
        return {
          id: Math.random().toString(36).substring(2, 11),
          file,
          originalUrl: URL.createObjectURL(file),
          compressedUrl: null,
          originalSize: file.size,
          compressedSize: null,
          originalWidth: dims.width,
          originalHeight: dims.height,
          compressedWidth: null,
          compressedHeight: null,
          status: 'pending' as const,
        };
      })
    );

    setFiles(prev => [...prev, ...newImageFiles]);

    for (let i = 0; i < newImageFiles.length; i += CONCURRENCY) {
      const batch = newImageFiles.slice(i, i + CONCURRENCY);
      const processed = await Promise.all(batch.map(f => processSingleImage(f)));
      setFiles(prev => {
        const newFiles = [...prev];
        processed.forEach(p => {
          const idx = newFiles.findIndex(f => f.id === p.id);
          if (idx !== -1) newFiles[idx] = p;
        });
        return newFiles;
      });
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.originalUrl);
        if (file.compressedUrl) URL.revokeObjectURL(file.compressedUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      URL.revokeObjectURL(f.originalUrl);
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
    });
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyRename = () => {
    setFiles(prev => prev.map((f) => {
      const ext = f.file.name.split('.').pop() || 'jpg';
      const baseName = f.file.name.replace(/\.[^.]+$/, '');
      const newName = `${settings.renamePrefix}${baseName}${settings.renameSuffix}.${ext}`;
      return { ...f, renamedName: newName };
    }));
    setShowRename(false);
  };

  // ============================================================
  // ✅ Download
  // ============================================================
  const downloadSingle = (file: ImageFile) => {
    if (!file.compressedUrl) return;
    const ext = settings.format.split('/')[1];
    const baseName = file.renamedName || `compressed_${file.file.name.split('.')[0]}.${ext}`;
    const a = document.createElement('a');
    a.href = file.compressedUrl;
    a.download = baseName;
    a.click();

    if (file.compressedSize) {
      setSessionStats(prev => {
        const saved = file.originalSize - file.compressedSize!;
        const newOriginal = prev.totalOriginal + file.originalSize;
        const newCompressed = prev.totalCompressed + file.compressedSize!;
        const newSaved = prev.totalSaved + saved;
        return {
          ...prev,
          totalFilesProcessed: prev.totalFilesProcessed + 1,
          totalOriginal: newOriginal,
          totalCompressed: newCompressed,
          totalSaved: newSaved,
          avgSavings: Math.round((newSaved / newOriginal) * 100),
        };
      });
    }
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const doneFiles = files.filter(f => f.status === 'done' && f.compressedUrl);
    const ext = settings.format.split('/')[1];

    for (const f of doneFiles) {
      const response = await fetch(f.compressedUrl!);
      const blob = await response.blob();
      const baseName = f.renamedName || `compressed_${f.file.name.split('.')[0]}.${ext}`;
      zip.file(baseName, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `intooly-compressed-${Date.now()}.zip`);
  };

  const exportCSV = () => {
    const rows = [
      ['الاسم', 'الحجم الأصلي (KB)', 'الحجم المضغوط (KB)', 'التوفير %', 'الأبعاد', 'الصيغة'],
      ...files.filter(f => f.status === 'done').map(f => [
        f.renamedName || f.file.name,
        (f.originalSize / 1024).toFixed(2),
        ((f.compressedSize || 0) / 1024).toFixed(2),
        getSavings(f).toString(),
        `${f.compressedWidth}×${f.compressedHeight}`,
        settings.format,
      ]),
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `intooly-report-${Date.now()}.csv`);
  };

  const shareFast = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.compressedUrl);
    if (doneFiles.length === 0) return;
    try {
      const firstFile = doneFiles[0];
      const response = await fetch(firstFile.compressedUrl!);
      const blob = await response.blob();
      const ext = settings.format.split('/')[1];
      const shareFile = new File([blob], `compressed.${ext}`, { type: settings.format });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title: 'صورة مضغوطة', text: 'بواسطة intooly.com' });
      }
    } catch (e) { console.error(e); }
  };

  // ============================================================
  // ✅ Stats
  // ============================================================
  const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0);
  const totalCompressedSize = files.reduce((acc, f) => acc + (f.compressedSize || 0), 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const savePercentage = totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  const getImageAreaClass = () => {
    if (files.length === 1) return 'grid-cols-1';
    if (files.length <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (files.length <= 9) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const getImageSizeClass = () => {
    if (files.length === 1) return 'h-64 md:h-96';
    if (files.length <= 4) return 'h-40 md:h-56';
    return 'h-24 md:h-32';
  };

  // ============================================================
  // ✅ Render
  // ============================================================
  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">

      {/* ================================================== */}
      {/* ✅ HERO BANNER */}
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
                <ImageIcon className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>

              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                ضغط وتغيير حجم الصور
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              20+ ميزة احترافية • بدون تسجيل
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              اضغط، غيّر الحجم، وحرّر صورك بجودة عالية
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MAIN TOOL                                           */}
      {/* ================================================== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className={`${cardClass} border rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto`}>

            {files.length === 0 ? (
              <div className="text-center space-y-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-12 lg:p-16 cursor-pointer hover:bg-brand-50 transition-all group"
                >
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg md:text-2xl font-black mb-2">اسحب الصور هنا أو انقر للاختيار</h3>
                  <p className={`text-sm md:text-base ${textClass}`}>يدعم JPG, PNG, WebP — حتى 50 صورة</p>
                  <p className={`text-xs md:text-sm ${textClass} mt-2 flex items-center justify-center gap-1`}>
                    <Clipboard className="w-3 h-3" />
                    أو الصق صورة بـ <kbd className="px-2 py-0.5 bg-ink-200 rounded text-xs">Ctrl+V</kbd>
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                  {[
                    { icon: Zap, title: 'أسرع 3x', desc: 'معالجة متوازية' },
                    { icon: Target, title: 'حد أقصى للأبعاد', desc: 'تحكم دقيق' },
                    { icon: Save, title: 'حفظ الإعدادات', desc: 'تفضيلاتك محفوظة' },
                    { icon: Shield, title: 'آمن 100%', desc: 'محلياً في متصفحك' },
                  ].map((f, i) => (
                    <div key={i} className="p-3 md:p-4 rounded-xl border border-ink-200 bg-white text-center">
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mx-auto mb-2">
                        <f.icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <p className="font-bold text-xs md:text-sm">{f.title}</p>
                      <p className={`text-[10px] md:text-xs ${textClass}`}>{f.desc}</p>
                    </div>
                  ))}
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                {/* ========== LEFT: Settings ========== */}
                <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                  <div className={`${cardClass} border rounded-2xl p-5 md:p-6`}>

                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-ink-200">
                      <h3 className="font-black text-lg md:text-xl flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" />
                        الإعدادات الحية
                      </h3>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        ⚡ فوري
                      </span>
                    </div>

                    <div className="mb-5 flex gap-2 p-1 bg-ink-100 rounded-xl">
                      <button
                        onClick={() => setMode('quick')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${
                          mode === 'quick' ? 'bg-brand-500 text-white shadow-md' : 'text-ink-600'
                        }`}
                      >
                        ⚡ سريع
                      </button>
                      <button
                        onClick={() => setMode('expert')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${
                          mode === 'expert' ? 'bg-brand-500 text-white shadow-md' : 'text-ink-600'
                        }`}
                      >
                        🔧 خبير
                      </button>
                    </div>

                    {mode === 'quick' && (
                      <>
                        <div className="mb-5">
                          <label className="text-sm font-bold mb-3 block">🎯 اختر السيناريو</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {SCENARIOS.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => applyScenario(s.id)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                  activeScenario === s.id
                                    ? 'border-brand-500 bg-brand-50 shadow-md'
                                    : 'border-ink-200 hover:border-brand-300'
                                }`}
                              >
                                <div className="text-2xl mb-1">{s.icon}</div>
                                <p className="text-xs font-bold">{s.name}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={applySmartOptimization}
                          className="w-full py-3 mb-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <Wand2 className="w-5 h-5" />
                          تحسين تلقائي ذكي
                        </button>
                      </>
                    )}

                    <div className="mb-6">
                      <label className="text-sm md:text-base font-bold mb-3 flex items-center gap-2">
                        <FileType className="w-4 h-4 text-brand-500" />
                        الصيغة
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'image/webp' as OutputFormat, label: 'WebP', desc: 'الأصغر' },
                          { val: 'image/jpeg' as OutputFormat, label: 'JPEG', desc: 'متوافق' },
                          { val: 'image/png' as OutputFormat, label: 'PNG', desc: 'شفاف' },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => updateSetting('format', opt.val)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              settings.format === opt.val
                                ? 'border-brand-500 bg-brand-50 shadow-md'
                                : 'border-ink-200 hover:border-brand-300'
                            }`}
                          >
                            <p className="text-sm font-bold">{opt.label}</p>
                            <p className="text-[10px] text-ink-500 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm font-bold mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-brand-500" />
                          الجودة
                        </span>
                        <span className="text-brand-600 font-black text-base">{settings.quality}%</span>
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={settings.quality}
                        onChange={(e) => updateSetting('quality', parseInt(e.target.value))}
                        className="w-full accent-brand-500 h-2.5 cursor-pointer"
                      />
                    </div>

                    {mode === 'expert' && (
                      <>
                        <div className="mb-6 grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold mb-1 block">أقصى عرض (px)</label>
                            <input
                              type="number"
                              placeholder="تلقائي"
                              value={settings.maxWidth || ''}
                              onChange={(e) => updateSetting('maxWidth', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full p-2.5 rounded-lg border text-sm bg-ink-50 border-ink-200"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold mb-1 block">أقصى ارتفاع (px)</label>
                            <input
                              type="number"
                              placeholder="تلقائي"
                              value={settings.maxHeight || ''}
                              onChange={(e) => updateSetting('maxHeight', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full p-2.5 rounded-lg border text-sm bg-ink-50 border-ink-200"
                            />
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-sm font-bold mb-3 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-brand-500" />
                            التدوير
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { val: (settings.rotate - 90 + 360) % 360, icon: RotateCcw, label: '-90°' },
                              { val: 0, icon: RefreshCw, label: '0°' },
                              { val: 180, icon: RefreshCw, label: '180°' },
                              { val: 90, icon: RotateCw, label: '+90°' },
                            ].map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => updateSetting('rotate', opt.val)}
                                className={`p-3 rounded-xl border-2 text-xs transition-all ${
                                  settings.rotate === opt.val
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-ink-200 hover:bg-ink-100'
                                } flex flex-col items-center justify-center gap-1`}
                              >
                                <opt.icon className="w-4 h-4" />
                                <span className="font-bold">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="text-sm font-bold mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Sun className="w-4 h-4 text-brand-500" />
                              السطوع
                            </span>
                            <span className="text-brand-600 font-black">{settings.brightness}%</span>
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={settings.brightness}
                            onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                            className="w-full accent-brand-500 h-2.5"
                          />
                        </div>

                        <div className="mb-6">
                          <label className="text-sm font-bold mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Contrast className="w-4 h-4 text-brand-500" />
                              التباين
                            </span>
                            <span className="text-brand-600 font-black">{settings.contrast}%</span>
                          </label>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={settings.contrast}
                            onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                            className="w-full accent-brand-500 h-2.5"
                          />
                        </div>

                        <div className="mb-6">
                          <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input
                              type="checkbox"
                              checked={settings.addWatermark}
                              onChange={(e) => updateSetting('addWatermark', e.target.checked)}
                              className="w-4 h-4 accent-brand-500"
                            />
                            <span className="text-sm font-bold">إضافة علامة مائية</span>
                          </label>
                          {settings.addWatermark && (
                            <input
                              type="text"
                              value={settings.watermarkText}
                              onChange={(e) => updateSetting('watermarkText', e.target.value)}
                              placeholder="نص العلامة"
                              className="w-full p-2.5 rounded-lg border text-sm bg-ink-50 border-ink-200"
                            />
                          )}
                        </div>

                        <div className="mb-6">
                          <button
                            onClick={() => setShowRename(!showRename)}
                            className="w-full py-2.5 rounded-lg text-sm font-bold bg-ink-100 hover:bg-ink-200"
                          >
                            📝 إعادة تسمية دفعة
                          </button>
                          {showRename && (
                            <div className="mt-3 space-y-2 p-3 rounded-lg bg-ink-50 border border-ink-200">
                              <input
                                type="text"
                                placeholder="بادئة (prefix)"
                                value={settings.renamePrefix}
                                onChange={(e) => updateSetting('renamePrefix', e.target.value)}
                                className="w-full p-2 rounded border text-sm bg-white border-ink-200"
                              />
                              <input
                                type="text"
                                placeholder="لاحقة (suffix)"
                                value={settings.renameSuffix}
                                onChange={(e) => updateSetting('renameSuffix', e.target.value)}
                                className="w-full p-2 rounded border text-sm bg-white border-ink-200"
                              />
                              <button
                                onClick={applyRename}
                                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded text-sm font-bold"
                              >
                                تطبيق على الكل
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => setSettings(DEFAULT_SETTINGS)}
                      className="w-full py-3 rounded-xl text-sm font-bold transition bg-ink-100 hover:bg-ink-200 text-ink-700"
                    >
                      🔄 إعادة الإعدادات
                    </button>
                  </div>

                  {sessionStats.totalFilesProcessed > 0 && (
                    <div className={`${cardClass} border rounded-2xl p-4 md:p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-brand-500" />
                          إحصائيات الجلسة
                        </h4>
                        <button
                          onClick={() => setShowStats(!showStats)}
                          className="text-xs text-brand-600 font-bold"
                        >
                          {showStats ? 'إخفاء' : 'عرض'}
                        </button>
                      </div>
                      {showStats && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-ink-50">
                            <p className={textClass}>صور معالَجة</p>
                            <p className="font-bold text-base">{sessionStats.totalFilesProcessed}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-ink-50">
                            <p className={textClass}>متوسط التوفير</p>
                            <p className="font-bold text-base text-green-600">{sessionStats.avgSavings}%</p>
                          </div>
                          <div className="p-2 rounded-lg bg-ink-50">
                            <p className={textClass}>إجمالي وفر</p>
                            <p className="font-bold text-base text-green-600">{formatFileSize(sessionStats.totalSaved)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-ink-50">
                            <p className={textClass}>مدة الجلسة</p>
                            <p className="font-bold text-base">
                              {Math.round((Date.now() - sessionStats.sessionStart) / 60000)} د
                            </p>
                          </div>
                          <button
                            onClick={exportCSV}
                            className="col-span-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            تصدير CSV
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ========== RIGHT: Images ========== */}
                <div className="space-y-4">

                  <div className="rounded-xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 bg-ink-900 text-white">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-500" />
                      <div>
                        <p className="text-ink-400 text-xs">إجمالي الصور</p>
                        <p className="text-xl font-black">{files.length}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-ink-400 text-xs">الأصلي</p>
                      <p className="text-base font-bold">{formatFileSize(totalOriginalSize)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-ink-400 text-xs">المضغوط</p>
                      <p className="text-base font-bold text-brand-400">{formatFileSize(totalCompressedSize)}</p>
                    </div>
                    {savePercentage > 0 && (
                      <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30 text-center">
                        <p className="font-bold text-sm">وفرت {savePercentage}%</p>
                        <p className="text-xs opacity-80">{formatFileSize(totalSaved)}</p>
                      </div>
                    )}
                  </div>

                  <div className={`grid gap-3 max-h-[75vh] overflow-y-auto p-1 ${getImageAreaClass()}`}>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`${cardClass} border rounded-xl overflow-hidden relative group transition-all`}
                      >
                        <div className="grid grid-cols-2 gap-1 p-2 bg-ink-100/50">
                          <div className="relative">
                            <div className="absolute top-1 right-1 bg-ink-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                              الأصلية
                            </div>
                            <img
                              src={file.originalUrl}
                              alt="original"
                              className={`w-full object-contain rounded-lg bg-white ${getImageSizeClass()}`}
                            />
                            <p className="text-[10px] text-center mt-1 font-semibold text-ink-600">
                              {formatFileSize(file.originalSize)}
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute top-1 right-1 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                              {file.status === 'done' ? 'المضغوطة' : 'جاري...'}
                            </div>
                            {file.compressedUrl ? (
                              <img
                                src={file.compressedUrl}
                                alt="compressed"
                                className={`w-full object-contain rounded-lg bg-white ${getImageSizeClass()}`}
                                style={{ transform: `rotate(${settings.rotate}deg)` }}
                              />
                            ) : (
                              <div className={`w-full flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200 ${getImageSizeClass()}`}>
                                {file.status === 'processing' ? (
                                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                                ) : (
                                  <Eye className="w-6 h-6 text-brand-400" />
                                )}
                              </div>
                            )}
                            <p className="text-[10px] text-center mt-1 font-semibold text-green-600">
                              {file.compressedSize ? formatFileSize(file.compressedSize) : '...'}
                            </p>
                          </div>
                        </div>

                        {file.status === 'done' && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            ↓ {getSavings(file)}%
                          </div>
                        )}

                        <div className="p-2 md:p-3">
                          <p className="font-bold text-xs truncate mb-2" title={file.renamedName || file.file.name}>
                            {file.renamedName || file.file.name}
                          </p>
                          {file.status === 'done' && file.compressedUrl && (
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => downloadSingle(file)}
                                className="py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                تحميل
                              </button>
                              <button
                                onClick={() => setShowComparison(file.id)}
                                className="py-1.5 bg-ink-700 hover:bg-ink-600 text-white text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                مقارنة
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeFile(file.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="حذف"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-ink-200/20">
                    <button
                      onClick={clearAll}
                      className="px-4 py-3 rounded-xl font-bold text-sm bg-ink-200 hover:bg-ink-300"
                    >
                      مسح الكل
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-4 py-3 bg-ink-700 hover:bg-ink-600 text-white font-bold rounded-xl text-sm"
                    >
                      + إضافة صور
                    </button>
                    {files.some(f => f.status === 'done') && (
                      <>
                        <button
                          onClick={downloadAllAsZip}
                          className="px-4 py-3 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                          <FileArchive className="w-4 h-4" />
                          ZIP
                        </button>
                        <button
                          onClick={shareFast}
                          className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          مشاركة
                        </button>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* COMPARISON MODAL                                    */}
      {/* ================================================== */}
      {showComparison && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowComparison(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">مقارنة قبل / بعد</h3>
              <button onClick={() => setShowComparison(null)} className="p-2 hover:bg-ink-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const file = files.find(f => f.id === showComparison);
              if (!file) return null;
              return (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-center font-bold mb-2 text-sm">الأصلية ({formatFileSize(file.originalSize)})</p>
                    <img src={file.originalUrl} alt="original" className="w-full rounded-lg" />
                  </div>
                  <div>
                    <p className="text-center font-bold mb-2 text-sm text-green-600">
                      المضغوطة ({file.compressedSize ? formatFileSize(file.compressedSize) : '-'})
                    </p>
                    {file.compressedUrl && <img src={file.compressedUrl} alt="compressed" className="w-full rounded-lg" />}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SEO CONTENT                                         */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900 text-right">
              ما هي أداة ضغط وتغيير حجم الصور؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              <strong>أداة ضغط وتغيير حجم الصور</strong> الاحترافية من intooly هي الحل الشامل لتصغير حجم ملفات الصور
              مع الحفاظ على أعلى جودة. تعمل <strong>محلياً 100%</strong> في متصفحك باستخدام تقنية Canvas API الحديثة.
            </p>
            <p className="text-base leading-relaxed text-ink-700 text-right">
              تقدم الأداة <strong>20+ ميزة احترافية</strong>: معالجة متوازية أسرع 3x، إعدادات حية فورية، سيناريوهات
              جاهزة، تحسين تلقائي ذكي، مقارنة قبل/بعد، إحصائيات مفصلة، وتصدير تقرير CSV.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900 text-right">
              الميزات الاحترافية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '⚡', title: 'معالجة متوازية', desc: '3 صور معاً لأسرع 3x' },
                { icon: '📐', title: 'حد أقصى للأبعاد', desc: 'تحكم كامل بالأبعاد' },
                { icon: '🎯', title: 'سيناريوهات جاهزة', desc: 'واتساب، ويب، مستند' },
                { icon: '🧠', title: 'تحسين ذكي', desc: 'اختيار تلقائي لأفضل إعدادات' },
                { icon: '🔍', title: 'مقارنة قبل/بعد', desc: 'شاهد الفرق فوراً' },
                { icon: '💾', title: 'حفظ الإعدادات', desc: 'تفضيلاتك محفوظة' },
                { icon: '📋', title: 'لصق سريع', desc: 'Ctrl+V للصق مباشرة' },
                { icon: '📊', title: 'إحصائيات مفصلة', desc: 'تتبع الاستخدام' },
                { icon: '📁', title: 'تصدير CSV', desc: 'تقرير لكل الصور' },
              ].map((f, i) => (
                <div key={i} className="border rounded-xl p-4 bg-ink-50 border-ink-200 text-right">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900 text-right">
              كيفية استخدام الأداة
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'ارفع صورك', desc: 'اسحب، انقر، أو الصق (Ctrl+V). يدعم حتى 50 صورة بحجم 50MB.' },
                { num: 2, title: 'اختر الإعدادات', desc: 'استخدم السيناريوهات الجاهزة أو التحسين الذكي، أو اضبط يدوياً.' },
                { num: 3, title: 'شاهد النتيجة فوراً', desc: 'الإعدادات حية — كل تغيير يُطبَّق مباشرة.' },
                { num: 4, title: 'حمّل النتائج', desc: 'تحميل فردي، ZIP دفعة، أو مشاركة سريعة.' },
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
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900 text-right">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% بدون حدود على عدد الصور.' },
                { q: 'هل صوري آمنة؟', a: 'نعم 100%. كل المعالجة محلياً في متصفحك.' },
                { q: 'ما الفرق بين الوضع السريع والخبير؟', a: 'السريع: سيناريوهات جاهزة. الخبير: تحكم كامل بكل الإعدادات.' },
                { q: 'ما هي أفضل صيغة للصور؟', a: 'WebP هي الأصغر حجماً، JPEG للتوافق، PNG للشفافية.' },
                { q: 'كم يمكن أن يوفر الضغط؟', a: 'من 50% إلى 90% حسب الصورة.' },
                { q: 'هل الإعدادات حية؟', a: 'نعم، أي تغيير يُطبَّق فوراً.' },
                { q: 'هل تعمل على الجوال؟', a: 'نعم، متجاوبة 100%.' },
                { q: 'هل يمكن تصدير تقرير؟', a: 'نعم، تصدير CSV بكل التفاصيل.' },
              ].map((faq, i) => (
                <details key={i} className="bg-white border-2 border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold flex justify-between items-center text-ink-900 hover:bg-brand-50 transition text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-brand-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 border-t border-ink-100 pt-3 leading-relaxed text-right">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-ink-900 text-right">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Maximize, title: 'تغيير حجم الصور', href: '/tools/image-resizer' },
                { icon: FileType, title: 'تحويل صيغ الصور', href: '/tools/image-converter' },
                { icon: Scissors, title: 'إزالة الخلفية AI', href: '/tools/background-remover' },
                { icon: Crop, title: 'قص الصور', href: '/tools/image-cropper' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white border-2 border-ink-200 text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                >
                  <tool.icon className="w-8 h-8 text-brand-500" />
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-brand-600 mt-1 flex items-center gap-1 font-bold">
                    جرّب الأداة <ArrowLeft className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </article>

        </div>
      </section>
    </div>
  );
}