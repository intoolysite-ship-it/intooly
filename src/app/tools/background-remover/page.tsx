'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import * as ort from 'onnxruntime-web';
import {
  Upload, Download, Image as ImageIcon, Zap, Shield,
  ArrowLeft, FileImage, ChevronDown, Trash2, Layers,
  Droplet, FileArchive, Sparkles, CheckCircle2,
  Scissors, Palette, Wand2, User, ShoppingBag, Loader2, AlertCircle,
  Brush, Eraser, RotateCcw, Circle, ZoomIn, ZoomOut, Move, Maximize2
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع
// ============================================================
type ProcessedImage = {
  id: string;
  file: File;
  originalUrl: string;
  processedBlob: Blob | null;
  finalUrl: string | null;
  originalSize: number;
  processedSize: number | null;
  status: 'pending' | 'loading-model' | 'processing' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
};

type BgPreset = {
  name: string;
  type: 'color' | 'gradient';
  value: string;
  value2?: string;
};

// ============================================================
// ✅ ثوابت
// ============================================================
const RMBG_INPUT_SIZE = 1024;
const RMBG_MODEL_URL = 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx';
const RMBG_MODEL_URL_FALLBACK = '/models/rmbg14.onnx';
const ORT_WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/';

const IDB_NAME = 'intooly-rmbg-cache-v2';
const IDB_VERSION = 2;
const IDB_STORE = 'models';
const IDB_MODEL_KEY = 'rmbg14-v1';

// ============================================================
// ✅ IndexedDB
// ============================================================
async function openModelDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB غير مدعوم'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

async function getCachedModel(): Promise<Blob | null> {
  try {
    const db = await openModelDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const request = store.get(IDB_MODEL_KEY);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) { resolve(null); return; }
        if (result instanceof Blob) { resolve(result); return; }
        if (result instanceof ArrayBuffer) { resolve(new Blob([result])); return; }
        if (result instanceof Uint8Array) { resolve(new Blob([result as any])); return; }
        resolve(null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('[IndexedDB] خطأ:', e);
    return null;
  }
}

async function saveModelToCache(data: ArrayBuffer): Promise<void> {
  try {
    const db = await openModelDB();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const request = store.put(blob, IDB_MODEL_KEY);
      request.onsuccess = () => { console.log('[IndexedDB] ✅ تم الحفظ'); resolve(); };
      request.onerror = () => reject(request.error);
    });
  } catch (e) { console.error('[IndexedDB] خطأ الحفظ:', e); }
}

async function clearCachedModel(): Promise<void> {
  try {
    const db = await openModelDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const request = store.delete(IDB_MODEL_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) { console.warn(e); }
}

async function hasCachedModel(): Promise<boolean> {
  const data = await getCachedModel();
  return data !== null;
}

// ============================================================
// ✅ المكوّن الرئيسي
// ============================================================
export default function BackgroundRemoverPage() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const modelLoadingPromiseRef = useRef<Promise<ort.InferenceSession> | null>(null);
  const processingRef = useRef<Set<string>>(new Set());

  const [modelCached, setModelCached] = useState<boolean | null>(null);
  const [showFirstSuccess, setShowFirstSuccess] = useState(false);

  // ===== إعدادات عامة =====
  const [globalMode, setGlobalMode] = useState<'auto' | 'portrait' | 'product'>('auto');
  const [globalBgType, setGlobalBgType] = useState<'transparent' | 'color' | 'gradient'>('transparent');
  const [globalBgColor, setGlobalBgColor] = useState('#ffffff');
  const [globalGradientFrom, setGlobalGradientFrom] = useState('#667eea');
  const [globalGradientTo, setGlobalGradientTo] = useState('#764ba2');
  const [globalShadowEnabled, setGlobalShadowEnabled] = useState(false);
  const [globalShadowDirection, setGlobalShadowDirection] = useState<'bottom' | 'bottom-right' | 'right' | 'top-right' | 'top' | 'top-left' | 'left' | 'bottom-left'>('bottom');
  const [globalShadowIntensity, setGlobalShadowIntensity] = useState(50);
  const [globalFeathering, setGlobalFeathering] = useState(0);
  const [globalEdgeRefinement, setGlobalEdgeRefinement] = useState(1);

  // ===== أدوات الرسم =====
  const [brushTool, setBrushTool] = useState<'brush' | 'eraser'>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ===== التحريك والتكبير =====
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<'draw' | 'pan'>('draw');

  const selectedImage = images.find(img => img.id === selectedImageId);

  const lastAppliedSettingsRef = useRef<string>('');
  const liveUpdateTimerRef = useRef<number | null>(null);
  const lastAppliedModeRef = useRef<string>('auto');

  useEffect(() => {
    hasCachedModel().then(cached => setModelCached(cached));
  }, []);

  // ============================================================
  // ✅ عجلة الفأرة على Canvas
  // ============================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (selectedImage?.status !== 'done') return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.1, Math.min(8, prev * delta)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [selectedImage?.status, selectedImage?.finalUrl]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    if (selectedImage?.status !== 'done') return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.1, Math.min(8, prev * delta)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [selectedImage?.status, selectedImage?.finalUrl]);

  const bgPresets: BgPreset[] = [
    { name: 'أبيض', type: 'color', value: '#ffffff' },
    { name: 'أسود', type: 'color', value: '#000000' },
    { name: 'رمادي', type: 'color', value: '#e5e7eb' },
    { name: 'أزرق فاتح', type: 'color', value: '#dbeafe' },
    { name: 'أخضر فاتح', type: 'color', value: '#dcfce7' },
    { name: 'غروب', type: 'gradient', value: '#f093fb', value2: '#f5576c' },
    { name: 'محيط', type: 'gradient', value: '#4facfe', value2: '#00f2fe' },
    { name: 'بنفسجي', type: 'gradient', value: '#667eea', value2: '#764ba2' },
  ];

  // ============================================================
  // ✅ تحميل النموذج
  // ============================================================
  const loadModel = useCallback(async (): Promise<ort.InferenceSession> => {
    if (sessionRef.current) return sessionRef.current;
    if (modelLoadingPromiseRef.current) return modelLoadingPromiseRef.current;

    modelLoadingPromiseRef.current = (async () => {
      try {
        if (typeof ort === 'undefined') throw new Error('ONNX Runtime غير محمّل');
        if (typeof WebAssembly === 'undefined') throw new Error('WebAssembly غير مدعوم');

        ort.env.wasm.wasmPaths = ORT_WASM_PATH;
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;
        ort.env.wasm.proxy = false;

        let modelBuffer: ArrayBuffer | null = null;

        console.log('[Model] فحص IndexedDB...');
        const cachedBlob = await getCachedModel();

        if (cachedBlob && cachedBlob.size > 0) {
          console.log(`[Model] ⚡ نموذج محفوظ (${cachedBlob.size} bytes)`);
          modelBuffer = await cachedBlob.arrayBuffer();
          setModelCached(true);
        }

        if (!modelBuffer) {
          console.log('[Model] تحميل من الإنترنت...');
          try {
            const response = await fetch(RMBG_MODEL_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            modelBuffer = await response.arrayBuffer();
            console.log('[Model] ✅ من HuggingFace');
          } catch (e) {
            console.warn('[Model] محاولة المسار المحلي...', e);
            const response = await fetch(RMBG_MODEL_URL_FALLBACK);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            modelBuffer = await response.arrayBuffer();
            console.log('[Model] ✅ من المسار المحلي');
          }

          if (modelBuffer && modelBuffer.byteLength > 0) {
            saveModelToCache(modelBuffer).then(() => setModelCached(true)).catch(console.error);
          }
        }

        if (!modelBuffer || modelBuffer.byteLength === 0) {
          throw new Error('بيانات النموذج فارغة');
        }

        const session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ['wasm'],
          graphOptimizationLevel: 'all',
        });

        console.log('[Model] Inputs:', session.inputNames, 'Outputs:', session.outputNames);
        sessionRef.current = session;
        return session;
      } catch (e) {
        modelLoadingPromiseRef.current = null;
        throw new Error('فشل تحميل النموذج: ' + (e instanceof Error ? e.message : 'unknown'));
      } finally {
        modelLoadingPromiseRef.current = null;
      }
    })();

    return modelLoadingPromiseRef.current;
  }, []);

  const handleClearCache = async () => {
    if (!confirm('سيتم حذف النموذج المحفوظ. سيُعاد تحميله في المرة القادمة. متابعة؟')) return;
    await clearCachedModel();
    setModelCached(false);
    sessionRef.current = null;
    setIsModelLoaded(false);
    alert('✅ تم مسح النموذج المحفوظ');
  };

  // ============================================================
  // ✅ تحسين الحواف
  // ============================================================
  const refineEdges = useCallback(async (blob: Blob, level: number): Promise<Blob> => {
    if (level === 0) return blob;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); resolve(blob); return; }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        const blurRadius = Math.min(level, 2);
        const blendFactor = 0.5 + (level * 0.15);
        const alphaCopy = new Uint8ClampedArray(width * height);
        for (let i = 0; i < width * height; i++) alphaCopy[i] = data[i * 4 + 3];
        const blurredAlpha = new Uint8ClampedArray(width * height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const originalAlpha = alphaCopy[idx];
            if (originalAlpha > 10 && originalAlpha < 245) {
              let sum = 0, count = 0;
              for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                  const nx = x + dx, ny = y + dy;
                  if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    sum += alphaCopy[ny * width + nx];
                    count++;
                  }
                }
              }
              blurredAlpha[idx] = sum / count;
            } else {
              blurredAlpha[idx] = originalAlpha;
            }
          }
        }
        for (let i = 0; i < width * height; i++) {
          const originalAlpha = alphaCopy[i];
          if (originalAlpha > 10 && originalAlpha < 245) {
            data[i * 4 + 3] = Math.round(originalAlpha * (1 - blendFactor) + blurredAlpha[i] * blendFactor);
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((b) => resolve(b!), 'image/png');
      };
      img.onerror = () => resolve(blob);
      img.src = url;
    });
  }, []);

  // ============================================================
  // ✅ تطبيق الإعدادات على صورة
  // ============================================================
  const applySettingsToImage = useCallback(async (
    img: ProcessedImage,
    settings: {
      bgType: 'transparent' | 'color' | 'gradient';
      bgColor: string;
      gradientFrom: string;
      gradientTo: string;
      shadowEnabled: boolean;
      shadowDirection: string;
      shadowIntensity: number;
      feathering: number;
      edgeRefinement: number;
    }
  ): Promise<ProcessedImage> => {
    if (!img.processedBlob) return img;
    try {
      const refinedBlob = await refineEdges(img.processedBlob, settings.edgeRefinement);
      const processedUrl = URL.createObjectURL(refinedBlob);
      const processedImg = new window.Image();
      await new Promise<void>((resolve, reject) => {
        processedImg.onload = () => resolve();
        processedImg.onerror = reject;
        processedImg.src = processedUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = processedImg.width;
      canvas.height = processedImg.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(processedUrl); return img; }

      if (settings.bgType === 'color') {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (settings.bgType === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, settings.gradientFrom);
        gradient.addColorStop(1, settings.gradientTo);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (settings.feathering > 0) ctx.filter = `blur(${settings.feathering}px)`;
      ctx.drawImage(processedImg, 0, 0);
      ctx.filter = 'none';

      const shouldDrawShadow = settings.bgType !== 'transparent';

      if (shouldDrawShadow && settings.shadowEnabled) {
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = canvas.width + 40;
        shadowCanvas.height = canvas.height + 40;
        const shadowCtx = shadowCanvas.getContext('2d');
        if (shadowCtx) {
          const shadowBlur = (settings.shadowIntensity / 100) * 25;
          const shadowOffset = (settings.shadowIntensity / 100) * 12;
          let offsetX = 20, offsetY = 20;
          switch (settings.shadowDirection) {
            case 'bottom': offsetY += shadowOffset; break;
            case 'bottom-right': offsetX += shadowOffset; offsetY += shadowOffset; break;
            case 'right': offsetX += shadowOffset; break;
            case 'top-right': offsetX += shadowOffset; offsetY -= shadowOffset; break;
            case 'top': offsetY -= shadowOffset; break;
            case 'top-left': offsetX -= shadowOffset; offsetY -= shadowOffset; break;
            case 'left': offsetX -= shadowOffset; break;
            case 'bottom-left': offsetX -= shadowOffset; offsetY += shadowOffset; break;
          }
          shadowCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          shadowCtx.shadowBlur = shadowBlur;
          shadowCtx.shadowOffsetX = offsetX - 20;
          shadowCtx.shadowOffsetY = offsetY - 20;
          shadowCtx.drawImage(processedImg, 20, 20);
          URL.revokeObjectURL(processedUrl);
          if (img.finalUrl) URL.revokeObjectURL(img.finalUrl);
          const finalBlob = await new Promise<Blob>((resolve) => {
            shadowCanvas.toBlob((b) => resolve(b!), 'image/png');
          });
          return { ...img, finalUrl: URL.createObjectURL(finalBlob), processedSize: finalBlob.size, status: 'done', progress: 100 };
        }
      }

      URL.revokeObjectURL(processedUrl);
      if (img.finalUrl) URL.revokeObjectURL(img.finalUrl);
      const finalBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      return { ...img, finalUrl: URL.createObjectURL(finalBlob), processedSize: finalBlob.size, status: 'done', progress: 100 };
    } catch (error) {
      console.error('Error applying settings:', error);
      return img;
    }
  }, [refineEdges]);

  // ============================================================
  // ✅ التطبيق الحي
  // ============================================================
  const applyLiveSettings = useCallback(async () => {
    if (isProcessingAll) return;

    const processedImages = images.filter(img => img.processedBlob && img.status === 'done');
    if (processedImages.length === 0) return;

    const settingsKey = JSON.stringify({
      bgType: globalBgType,
      bgColor: globalBgColor,
      gradientFrom: globalGradientFrom,
      gradientTo: globalGradientTo,
      shadowEnabled: globalShadowEnabled,
      shadowDirection: globalShadowDirection,
      shadowIntensity: globalShadowIntensity,
      feathering: globalFeathering,
      edgeRefinement: globalEdgeRefinement,
    });

    if (settingsKey === lastAppliedSettingsRef.current) return;
    lastAppliedSettingsRef.current = settingsKey;

    console.log('[Live] تطبيق الإعدادات على', processedImages.length, 'صورة');

    const settings = {
      bgType: globalBgType,
      bgColor: globalBgColor,
      gradientFrom: globalGradientFrom,
      gradientTo: globalGradientTo,
      shadowEnabled: globalShadowEnabled,
      shadowDirection: globalShadowDirection,
      shadowIntensity: globalShadowIntensity,
      feathering: globalFeathering,
      edgeRefinement: globalEdgeRefinement,
    };

    const updated = await Promise.all(
      processedImages.map(img => applySettingsToImage(img, settings))
    );

    setImages(prev => prev.map(img => {
      const updatedImg = updated.find(u => u.id === img.id);
      return updatedImg || img;
    }));
  }, [
    images,
    isProcessingAll,
    globalBgType, globalBgColor, globalGradientFrom, globalGradientTo,
    globalShadowEnabled, globalShadowDirection, globalShadowIntensity,
    globalFeathering, globalEdgeRefinement,
    applySettingsToImage,
  ]);

  useEffect(() => {
    if (isProcessingAll) return;
    if (!images.some(img => img.processedBlob && img.status === 'done')) return;

    if (liveUpdateTimerRef.current) {
      window.clearTimeout(liveUpdateTimerRef.current);
    }

    liveUpdateTimerRef.current = window.setTimeout(() => {
      applyLiveSettings();
    }, 150);

    return () => {
      if (liveUpdateTimerRef.current) {
        window.clearTimeout(liveUpdateTimerRef.current);
      }
    };
  }, [
    globalBgType, globalBgColor, globalGradientFrom, globalGradientTo,
    globalShadowEnabled, globalShadowDirection, globalShadowIntensity,
    globalFeathering, globalEdgeRefinement,
  ]);

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
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImages(droppedFiles);
  }, []);

  const addImages = (newFiles: File[]) => {
    const newImages: ProcessedImage[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      originalUrl: URL.createObjectURL(file),
      processedBlob: null,
      finalUrl: null,
      originalSize: file.size,
      processedSize: null,
      status: 'pending',
      progress: 0,
    }));
    setImages(prev => {
      const updated = [...prev, ...newImages];
      if (!selectedImageId && newImages.length > 0) setSelectedImageId(newImages[0].id);
      return updated;
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.originalUrl);
        if (img.finalUrl) URL.revokeObjectURL(img.finalUrl);
      }
      const filtered = prev.filter(i => i.id !== id);
      if (selectedImageId === id) setSelectedImageId(filtered.length > 0 ? filtered[0].id : null);
      return filtered;
    });
    processingRef.current.delete(id);
  };

  // ============================================================
  // ✅ معالجة صورة واحدة
  // ============================================================
  const processSingleImage = async (img: ProcessedImage): Promise<ProcessedImage> => {
    if (processingRef.current.has(img.id)) {
      return img;
    }

    processingRef.current.add(img.id);

    try {
      if (!sessionRef.current) {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'loading-model', progress: 0 } : i));
        const interval = setInterval(() => {
          setImages(prev => prev.map(i => {
            if (i.id === img.id && i.status === 'loading-model' && i.progress < 90) {
              return { ...i, progress: i.progress + 3 };
            }
            return i;
          }));
        }, 500);

        try { await loadModel(); } finally { clearInterval(interval); }
        setIsModelLoaded(true);
      }

      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'processing', progress: 10 } : i));

      const imageBitmap = await createImageBitmap(img.file);
      const originalWidth = imageBitmap.width;
      const originalHeight = imageBitmap.height;

      const inputSize = RMBG_INPUT_SIZE;
      const scale = Math.min(inputSize / originalWidth, inputSize / originalHeight);
      const scaledW = Math.round(originalWidth * scale);
      const scaledH = Math.round(originalHeight * scale);
      const padX = Math.floor((inputSize - scaledW) / 2);
      const padY = Math.floor((inputSize - scaledH) / 2);

      const canvas = document.createElement('canvas');
      canvas.width = inputSize;
      canvas.height = inputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas failed');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, inputSize, inputSize);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imageBitmap, padX, padY, scaledW, scaledH);

      const imageData = ctx.getImageData(0, 0, inputSize, inputSize);
      const planeSize = inputSize * inputSize;
      const float32Data = new Float32Array(3 * planeSize);
      for (let i = 0; i < planeSize; i++) {
        float32Data[i] = (imageData.data[i * 4] / 255.0) - 0.5;
        float32Data[planeSize + i] = (imageData.data[i * 4 + 1] / 255.0) - 0.5;
        float32Data[2 * planeSize + i] = (imageData.data[i * 4 + 2] / 255.0) - 0.5;
      }

      const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, inputSize, inputSize]);
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, progress: 50 } : i));

      const feeds = { [sessionRef.current!.inputNames[0]]: inputTensor };
      const results = await sessionRef.current!.run(feeds);
      const outputTensor = results[sessionRef.current!.outputNames[0]];
      const outputData = outputTensor.data as Float32Array;

      setImages(prev => prev.map(i => i.id === img.id ? { ...i, progress: 70 } : i));

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = originalWidth;
      maskCanvas.height = originalHeight;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error('Mask canvas failed');
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.imageSmoothingQuality = 'high';

      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = inputSize;
      smallCanvas.height = inputSize;
      const smallCtx = smallCanvas.getContext('2d');
      if (!smallCtx) throw new Error('Small canvas failed');

      let lowThreshold = 8;
      let highThreshold = 245;
      let featherPower = 1.0;

      if (globalMode === 'portrait') {
        lowThreshold = 3;
        highThreshold = 252;
        featherPower = 0.9;
      } else if (globalMode === 'product') {
        lowThreshold = 15;
        highThreshold = 240;
        featherPower = 1.1;
      }

      const maskImageData = smallCtx.createImageData(inputSize, inputSize);
      for (let i = 0; i < planeSize; i++) {
        let raw = outputData[i];

        if (featherPower !== 1.0 && raw > 0 && raw < 1) {
          raw = Math.pow(raw, featherPower);
        }

        let alpha = Math.round(raw * 255);
        if (alpha < lowThreshold) alpha = 0;
        else if (alpha > highThreshold) alpha = 255;

        maskImageData.data[i * 4] = 255;
        maskImageData.data[i * 4 + 1] = 255;
        maskImageData.data[i * 4 + 2] = 255;
        maskImageData.data[i * 4 + 3] = alpha;
      }
      smallCtx.putImageData(maskImageData, 0, 0);

      maskCtx.drawImage(smallCanvas, padX, padY, scaledW, scaledH, 0, 0, originalWidth, originalHeight);

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = originalWidth;
      finalCanvas.height = originalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Final canvas failed');

      finalCtx.drawImage(imageBitmap, 0, 0);
      finalCtx.globalCompositeOperation = 'destination-in';
      finalCtx.drawImage(maskCanvas, 0, 0);
      finalCtx.globalCompositeOperation = 'source-over';

      imageBitmap.close();

      setImages(prev => prev.map(i => i.id === img.id ? { ...i, progress: 90 } : i));

      const blob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
      });

      const updatedImg: ProcessedImage = {
        ...img,
        processedBlob: blob,
        finalUrl: URL.createObjectURL(blob),
        status: 'done',
        progress: 100
      };

      lastAppliedSettingsRef.current = '';
      lastAppliedModeRef.current = globalMode;
      setImages(prev => prev.map(i => i.id === img.id ? updatedImg : i));

      setTimeout(() => applyLiveSettings(), 100);

      if (!localStorage.getItem('rmbg-first-success')) {
        setShowFirstSuccess(true);
        localStorage.setItem('rmbg-first-success', 'true');
      }

      processingRef.current.delete(img.id);
      return updatedImg;

    } catch (error) {
      processingRef.current.delete(img.id);
      console.error('Error:', error);
      return {
        ...img,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'خطأ غير معروف',
      };
    }
  };

  const processAll = async () => {
    if (isProcessingAll) return;

    setIsProcessingAll(true);
    try {
      const pending = images.filter(i => i.status === 'pending' || i.status === 'error');

      for (const img of pending) {
        const processed = await processSingleImage(img);
        setImages(prev => prev.map(item => item.id === processed.id ? processed : item));
      }
    } finally {
      setIsProcessingAll(false);
    }
  };

  useEffect(() => {
    if (!isModelLoaded) return;
    if (globalMode === lastAppliedModeRef.current) return;

    const processedImages = images.filter(img => img.processedBlob && img.status === 'done');
    if (processedImages.length === 0) return;

    lastAppliedModeRef.current = globalMode;

    setImages(prev => prev.map(i =>
      processedImages.find(p => p.id === i.id)
        ? { ...i, status: 'pending', processedBlob: null, progress: 0 }
        : i
    ));

    setTimeout(() => processAll(), 200);
  }, [globalMode, isModelLoaded]);

  const downloadImage = async (img: ProcessedImage, format: 'png' | 'jpeg' | 'webp') => {
    if (!img.finalUrl) return;
    try {
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = img.finalUrl;
        link.download = `removed-bg_${img.file.name.split('.')[0]}.png`;
        link.click();
      } else {
        const im = new window.Image();
        await new Promise<void>((resolve, reject) => {
          im.onload = () => resolve();
          im.onerror = reject;
          im.src = img.finalUrl!;
        });
        const c = document.createElement('canvas');
        c.width = im.width;
        c.height = im.height;
        const cx = c.getContext('2d');
        if (!cx) return;
        if (format === 'jpeg') {
          cx.fillStyle = '#ffffff';
          cx.fillRect(0, 0, c.width, c.height);
        }
        cx.drawImage(im, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) => {
          c.toBlob((b) => resolve(b), `image/${format}`, 0.95);
        });
        if (!blob) return;
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u;
        a.download = `removed-bg_${img.file.name.split('.')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(u);
      }
    } catch (e) { console.error(e); }
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();
    const done = images.filter(i => i.status === 'done' && i.finalUrl);
    for (const img of done) {
      if (!img.finalUrl) continue;
      const res = await fetch(img.finalUrl);
      const blob = await res.blob();
      zip.file(`removed-bg_${img.file.name.split('.')[0]}.png`, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'intooly-background-removed.zip');
  };

  // ===== Canvas =====
  const initCanvas = () => {
    if (!canvasRef.current || !selectedImage?.finalUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setCanvasHistory([imageData]);
      setHistoryIndex(0);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    };
    img.src = selectedImage.finalUrl;
  };

  useEffect(() => {
    if (selectedImage?.status === 'done' && selectedImage.finalUrl) {
      initCanvas();
    }
  }, [selectedImage?.finalUrl, selectedImage?.status]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (brushTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPanX(e.clientX - panStart.x);
      setPanY(e.clientY - panStart.y);
      return;
    }
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isPanning) { setIsPanning(false); return; }
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const zoomIn = () => setZoom(prev => Math.min(8, prev * 1.2));
  const zoomOut = () => setZoom(prev => Math.max(0.1, prev / 1.2));
  const resetView = () => { setZoom(1); setPanX(0); setPanY(0); };

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(canvasHistory[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const saveCanvasEdits = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage) return;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
    const updatedImg = { ...selectedImage, processedBlob: blob, finalUrl: URL.createObjectURL(blob) };
    setImages(prev => prev.map(img => img.id === selectedImage.id ? updatedImg : img));
    lastAppliedSettingsRef.current = '';
    setTimeout(() => applyLiveSettings(), 100);
  };

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">

      {/* ================================================== */}
      {/* ✅ HERO BANNER                                       */}
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
                <Scissors className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                إزالة الخلفية بالذكاء الاصطناعي
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              نموذج RMBG-1.4 • معالجة محلية 100%
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              أزل خلفية أي صورة بدقة احترافية في ثوانٍ
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MODEL STATUS BAR                                    */}
      {/* ================================================== */}
      {modelCached !== null && (
        <section className="py-3">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${modelCached ? 'bg-emerald-50 border-emerald-200' : 'bg-brand-50 border-brand-200'}`}>
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <div className={`w-2 h-2 rounded-full ${modelCached ? 'bg-emerald-500 animate-pulse' : 'bg-brand-500'}`}></div>
                <span className={`font-bold ${modelCached ? 'text-emerald-700' : 'text-brand-700'}`}>
                  {modelCached ? '⚡ النموذج محفوظ محلياً — معالجة فورية' : '🟡 أول استخدام — سيتم تحميل النموذج (30-60 ثانية)'}
                </span>
              </div>
              {modelCached && (
                <button onClick={handleClearCache} className="text-[10px] md:text-xs text-ink-600 hover:text-red-600 underline">
                  مسح
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* FEATURES BAR                                        */}
      {/* ================================================== */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            {[
              { icon: Wand2, title: 'AI فائق', desc: 'نموذج RMBG-1.4' },
              { icon: Zap, title: 'تعديلات حية', desc: 'كل تغيير فوري' },
              { icon: Palette, title: 'خلفيات', desc: 'ألوان وتدرجات' },
              { icon: Droplet, title: 'ظلال', desc: '8 اتجاهات' },
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
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="border-2 md:border-3 border-dashed border-brand-300 bg-brand-50/50 rounded-xl md:rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group">
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2">اسحب الصور هنا أو انقر للاختيار</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>يدعم JPG, PNG, WebP — حتى 50 صورة</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

                <div className={`${cardClass} border rounded-xl p-3 md:p-4 max-w-2xl mx-auto`}>
                  <div className="flex items-start gap-3 text-right">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">⚡ معلومة سريعة</h4>
                      <p className={`text-xs ${textClass} leading-relaxed`}>
                        <span className="font-bold text-brand-600">أول استخدام:</span> 30-60 ثانية لتحميل النموذج (مرة واحدة فقط)
                        <br />
                        <span className="font-bold text-emerald-600">بعدها:</span> معالجة فورية + تعديلات حية ⚡
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ========== RIGHT: Images (Sticky) ========== */}
                <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">

                  {selectedImage && (
                    <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                      <div className="p-4 border-b border-ink-200/20 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-bold text-sm md:text-base truncate flex-1">{selectedImage.file.name}</h3>
                        {selectedImage.status === 'done' && selectedImage.finalUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-600 ml-2 hidden md:inline">تحميل:</span>
                            <button onClick={() => downloadImage(selectedImage, 'png')} className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700">
                              <Download className="w-3 h-3" /> PNG
                            </button>
                            <button onClick={() => downloadImage(selectedImage, 'jpeg')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                              <Download className="w-3 h-3" /> JPEG
                            </button>
                            <button onClick={() => downloadImage(selectedImage, 'webp')} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">
                              <Download className="w-3 h-3" /> WebP
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-4">
                        <div className="relative">
                          <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">الأصلية</div>
                          <img src={selectedImage.originalUrl} alt="original" className="w-full h-64 md:h-96 object-contain rounded-lg bg-white" />
                        </div>
                        <div className="relative">
                          <div className="absolute top-2 right-2 bg-brand-500/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm z-10">
                            {selectedImage.status === 'done' ? 'النتيجة' : selectedImage.status === 'processing' ? 'جاري...' : 'المتوقعة'}
                          </div>
                          {selectedImage.finalUrl ? (
                            <img src={selectedImage.finalUrl} alt="processed" className="w-full h-64 md:h-96 object-contain rounded-lg" style={{ backgroundImage: globalBgType === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }} />
                          ) : (
                            <div className="w-full h-64 md:h-96 flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200">
                              <div className="text-center px-4">
                                <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-2" />
                                {selectedImage.status === 'loading-model' ? (
                                  <div className="space-y-1">
                                    <p className="text-sm text-brand-600 font-semibold">⏳ تحميل النموذج {selectedImage.progress}%</p>
                                    <p className="text-[10px] text-brand-500/80">{modelCached ? '⚡ من الذاكرة' : 'المرة الأولى: 30-60 ثانية'}</p>
                                  </div>
                                ) : selectedImage.status === 'processing' ? (
                                  <p className="text-sm text-brand-600 font-semibold">معالجة {selectedImage.progress}%</p>
                                ) : selectedImage.status === 'error' ? (
                                  <p className="text-sm text-red-500 font-semibold">خطأ</p>
                                ) : (
                                  <p className="text-sm text-brand-600 font-semibold">في الانتظار</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedImage.status === 'error' && (
                        <div className="mx-4 mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> {selectedImage.errorMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedImage?.status === 'done' && selectedImage.finalUrl && (
                    <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                      <div className="p-4 border-b border-ink-200/20 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                          <Brush className="w-4 h-4 text-brand-500" />
                          محرر الفرشاة
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={undo} disabled={historyIndex <= 0} className="flex items-center gap-1 px-3 py-1.5 bg-ink-600 text-white text-xs font-bold rounded-lg hover:bg-ink-700 disabled:bg-ink-300">
                            <RotateCcw className="w-3 h-3" /> تراجع
                          </button>
                          <button onClick={saveCanvasEdits} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">
                            <CheckCircle2 className="w-3 h-3" /> حفظ
                          </button>
                        </div>
                      </div>

                      <div className="p-3 border-b border-ink-200/20 flex flex-wrap items-center gap-2 bg-ink-50">
                        <div className="flex items-center gap-1">
                          <button onClick={zoomOut} className="p-1.5 bg-white rounded-lg hover:bg-ink-100 border border-ink-200" title="تصغير">
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                          <button onClick={zoomIn} className="p-1.5 bg-white rounded-lg hover:bg-ink-100 border border-ink-200" title="تكبير">
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button onClick={resetView} className="p-1.5 bg-white rounded-lg hover:bg-ink-100 border border-ink-200" title="إعادة ضبط">
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mr-2">
                          <button onClick={() => setActiveTool('draw')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'draw' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200'}`}>
                            <Brush className="w-3 h-3" /> رسم
                          </button>
                          <button onClick={() => setActiveTool('pan')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTool === 'pan' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200'}`}>
                            <Move className="w-3 h-3" /> تحريك
                          </button>
                        </div>
                        <p className="text-xs text-ink-600 mr-auto hidden md:block">🖱️ عجلة الفأرة = تكبير/تصغير • اسحب = تحريك</p>
                      </div>

                      <div
                        ref={canvasContainerRef}
                        className="p-4 overflow-hidden relative bg-ink-100"
                        style={{
                          backgroundImage: globalBgType === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          height: '500px',
                          cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair',
                          touchAction: 'none',
                        }}
                      >
                        <div
                          style={{
                            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                            transformOrigin: 'center center',
                            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            className="shadow-lg"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className={`${cardClass} border rounded-2xl p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm">الصور ({images.length})</h3>
                        <div className="flex gap-2">
                          <button onClick={() => { setImages([]); setSelectedImageId(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="px-3 py-1.5 rounded-lg font-bold text-xs bg-ink-200 hover:bg-ink-300">مسح الكل</button>
                          <button onClick={processAll} disabled={isProcessingAll || images.every(img => img.status === 'done')} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                            {isProcessingAll ? <><Loader2 className="w-3 h-3 animate-spin" /> جاري...</> : <><Wand2 className="w-3 h-3" /> إزالة الكل</>}
                          </button>
                          {images.some(img => img.status === 'done') && (
                            <button onClick={downloadAllAsZip} className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-lg text-xs flex items-center gap-1">
                              <FileArchive className="w-3 h-3" /> ZIP
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
                        {images.map((img) => (
                          <div key={img.id} onClick={() => setSelectedImageId(img.id)} className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedImageId === img.id ? 'border-brand-500 ring-2 ring-brand-300' : 'border-transparent hover:border-brand-300'}`}>
                            <img src={img.finalUrl || img.originalUrl} alt={img.file.name} className="w-full aspect-square object-cover" />
                            {img.status === 'processing' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              </div>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }} className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {images.length === 1 && (
                    <div className="flex gap-2">
                      <button onClick={() => { setImages([]); setSelectedImageId(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-ink-200 hover:bg-ink-300">مسح</button>
                      <button onClick={processAll} disabled={isProcessingAll || images.every(img => img.status === 'done')} className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                        {isProcessingAll ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري...</> : <><Wand2 className="w-4 h-4" /> إزالة الخلفية</>}
                      </button>
                    </div>
                  )}
                </div>

                {/* ========== LEFT: Settings ========== */}
                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" /> الإعدادات الحية
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">⚡ فوري</span>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1"><Wand2 className="w-4 h-4 text-brand-500" /> وضع المعالجة</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[{ mode: 'auto' as const, icon: Sparkles, label: 'تلقائي' }, { mode: 'portrait' as const, icon: User, label: 'بورتريه' }, { mode: 'product' as const, icon: ShoppingBag, label: 'منتج' }].map((item) => (
                          <button key={item.mode} onClick={() => setGlobalMode(item.mode)} className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${globalMode === item.mode ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
                            <item.icon className="w-4 h-4 mx-auto mb-1 text-brand-500" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <p className={`text-[10px] ${textClass} mt-1`}>⚠️ تغيير الوضع يُعيد المعالجة</p>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1"><Palette className="w-4 h-4 text-brand-500" /> الخلفية</label>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        {[{ type: 'transparent' as const, label: 'شفاف' }, { type: 'color' as const, label: 'لون' }, { type: 'gradient' as const, label: 'تدرج' }].map((item) => (
                          <button key={item.type} onClick={() => setGlobalBgType(item.type)} className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${globalBgType === item.type ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>{item.label}</button>
                        ))}
                      </div>
                      {globalBgType === 'color' && (
                        <div className="space-y-2">
                          <input type="color" value={globalBgColor} onChange={(e) => setGlobalBgColor(e.target.value)} className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer" />
                          <div className="grid grid-cols-4 gap-1">
                            {bgPresets.filter(p => p.type === 'color').map((preset, i) => (
                              <button key={i} onClick={() => setGlobalBgColor(preset.value)} className="w-full aspect-square rounded-lg border-2 border-ink-300 hover:scale-110 transition-transform" style={{ backgroundColor: preset.value }} title={preset.name} />
                            ))}
                          </div>
                        </div>
                      )}
                      {globalBgType === 'gradient' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="color" value={globalGradientFrom} onChange={(e) => setGlobalGradientFrom(e.target.value)} className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer" />
                            <input type="color" value={globalGradientTo} onChange={(e) => setGlobalGradientTo(e.target.value)} className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer" />
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {bgPresets.filter(p => p.type === 'gradient').map((preset, i) => (
                              <button key={i} onClick={() => { setGlobalGradientFrom(preset.value); setGlobalGradientTo(preset.value2 || preset.value); }} className="w-full aspect-square rounded-lg border-2 border-ink-300 hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${preset.value}, ${preset.value2 || preset.value})` }} title={preset.name} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1"><Scissors className="w-4 h-4 text-brand-500" /> تحسين حواف الشعر</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[{ level: 0, label: 'بدون' }, { level: 1, label: 'خفيف' }, { level: 2, label: 'متوسط' }, { level: 3, label: 'قوي' }].map((item) => (
                          <button key={item.level} onClick={() => setGlobalEdgeRefinement(item.level)} className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${globalEdgeRefinement === item.level ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>{item.label}</button>
                        ))}
                      </div>
                      <p className={`text-xs ${textClass} mt-1`}>ينعّم حواف الشعر ويزيل البقايا</p>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-bold mb-2 block">تنعيم إضافي: {globalFeathering}px</label>
                      <input type="range" min="0" max="10" value={globalFeathering} onChange={(e) => setGlobalFeathering(parseInt(e.target.value))} className="w-full accent-brand-500" />
                    </div>

                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={globalShadowEnabled} onChange={(e) => setGlobalShadowEnabled(e.target.checked)} className="w-4 h-4 accent-brand-500" />
                        <span className="text-sm font-bold flex items-center gap-1"><Droplet className="w-4 h-4 text-brand-500" /> تفعيل الظل</span>
                      </label>
                      {globalShadowEnabled && globalBgType !== 'transparent' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 gap-1">
                            {(['bottom', 'bottom-right', 'right', 'top-right', 'top', 'top-left', 'left', 'bottom-left'] as const).map((dir) => (
                              <button key={dir} onClick={() => setGlobalShadowDirection(dir)} className={`p-1.5 rounded-lg border-2 text-xs transition-all ${globalShadowDirection === dir ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
                                {dir === 'bottom' && '⬇️'}{dir === 'bottom-right' && '↘️'}{dir === 'right' && '➡️'}{dir === 'top-right' && '↗️'}{dir === 'top' && '⬆️'}{dir === 'top-left' && '↖️'}{dir === 'left' && '⬅️'}{dir === 'bottom-left' && '↙️'}
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="text-xs font-bold mb-1 block">الشدة: {globalShadowIntensity}%</label>
                            <input type="range" min="0" max="100" value={globalShadowIntensity} onChange={(e) => setGlobalShadowIntensity(parseInt(e.target.value))} className="w-full accent-brand-500" />
                          </div>
                        </div>
                      )}
                      {globalShadowEnabled && globalBgType === 'transparent' && (
                        <p className="text-xs text-brand-600 mt-1">⚠️ الظل غير متاح مع الخلفية الشفافة</p>
                      )}
                    </div>

                    <div className="mb-4 border-t border-ink-200/20 pt-4">
                      <label className="text-sm font-bold mb-2 block flex items-center gap-1"><Brush className="w-4 h-4 text-brand-500" /> أدوات التعديل اليدوي</label>
                      <div className="grid grid-cols-2 gap-1 mb-3">
                        <button onClick={() => { setBrushTool('brush'); setActiveTool('draw'); }} className={`p-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${brushTool === 'brush' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
                          <Brush className="w-3 h-3" /> فرشاة
                        </button>
                        <button onClick={() => { setBrushTool('eraser'); setActiveTool('draw'); }} className={`p-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${brushTool === 'eraser' ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}>
                          <Eraser className="w-3 h-3" /> ممحاة
                        </button>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs font-bold mb-1 block flex items-center gap-1">
                          <Circle className="w-3 h-3" /> حجم الفرشاة: {brushSize}px
                        </label>
                        <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full accent-brand-500" />
                      </div>
                      {brushTool === 'brush' && (
                        <div className="mb-3">
                          <label className="text-xs font-bold mb-1 block">لون الفرشاة</label>
                          <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* SEO CONTENT                                         */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هي أداة حذف خلفية الصور؟
            </h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              <strong>أداة حذف خلفية الصور</strong> هي برنامج ذكي يعتمد على <strong>الذكاء الاصطناعي</strong> لفصل
              العنصر الرئيسي في الصورة (شخص، منتج، حيوان) عن الخلفية تلقائياً، وإنتاج صورة جديدة بخلفية
              <strong> شفافة</strong> أو بلون/تدرج مخصص. تعتمد أداتنا على نموذج <strong>RMBG-1.4</strong> من
              BRIA AI — أحد أدق النماذج المتاحة حالياً، بدقة <strong>1024×1024 بكسل</strong>.
            </p>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              على عكس الأدوات التقليدية التي تحتاج إلى تحديد يدوي للحدود، تعمل <strong>حذف خلفية الصور</strong> في
              <strong> 2-4 ثواني</strong> فقط، مع الحفاظ على أدق التفاصيل مثل <strong>الشعر المتطاير</strong>،
              حواف الملابس، والانعكاسات الدقيقة. النتيجة: صورة احترافية جاهزة للاستخدام التجاري أو الشخصي.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              لماذا تختار أداتنا لحذف خلفية الصور؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-3 text-2xl">🔒</div>
                <h3 className="font-bold text-base mb-2">خصوصية كاملة 100%</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  صورك لا تترك جهازك أبداً. تتم كل المعالجة في متصفحك باستخدام تقنية WebAssembly —
                  لا نرفع أي صورة إلى أي خادم.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-3 text-2xl">⚡</div>
                <h3 className="font-bold text-base mb-2">دقة عالية بنموذج RMBG-1.4</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  أحدث نموذج ذكاء اصطناعي بدقة 1024×1024 لضمان أفضل نتيجة، حتى مع الشعر المعقد
                  والتفاصيل الدقيقة.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-3 text-2xl">🎨</div>
                <h3 className="font-bold text-base mb-2">تعديلات حية فورية</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  غيّر الخلفية، أضف ظلالاً، أو حسّن الحواف — كل التعديلات تُطبَّق فوراً دون إعادة المعالجة.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-3 text-2xl">💯</div>
                <h3 className="font-bold text-base mb-2">مجاني بالكامل</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  بدون علامة مائية، بدون تسجيل، بدون حدود على عدد الصور. مجاني للأبد.
                </p>
              </div>
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيفية حذف خلفية الصور — 4 خطوات سهلة
            </h2>
            <div className="space-y-4">
              {[
                { num: '1', title: 'ارفع صورتك', desc: 'اسحب الصورة أو انقر للاختيار. يدعم JPG، PNG، WebP — حتى 50 صورة في وقت واحد.' },
                { num: '2', title: 'اختر وضع المعالجة', desc: 'اختر "بورتريه" للصور الشخصية (يحافظ على الشعر)، أو "منتج" لصور المنتجات (حواف حادة)، أو "تلقائي".' },
                { num: '3', title: 'عاين وعدّل', desc: 'استخدم الأدوات الحية لتغيير الخلفية، إضافة ظل، أو تعديل الحواف. يمكنك أيضاً استخدام الفرشاة للتحرير اليدوي.' },
                { num: '4', title: 'حمّل النتيجة', desc: 'حمّل بصيغة PNG (بخلفية شفافة)، JPEG، WebP، أو ZIP لكل الصور دفعة واحدة.' }
              ].map((step, i) => (
                <div key={i} className={`${cardClass} border rounded-xl p-4 text-right flex gap-4`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1">{step.title}</h3>
                    <p className={`text-sm ${textClass} leading-relaxed`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              استخدامات حذف خلفية الصور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="text-3xl mb-3">🛒</div>
                <h3 className="text-lg font-bold mb-2">للمتاجر الإلكترونية</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  أنشئ صور منتجات احترافية جاهزة لأمازون، نون، حراج، شوبيفاي، و Etsy.
                  قوالب جاهزة بمقاسات <strong>2000×2000</strong>، <strong>1200×1200</strong>،
                  و <strong>800×800</strong> — مطابقة لمتطلبات كل متجر.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="text-3xl mb-3">📸</div>
                <h3 className="text-lg font-bold mb-2">للمصورين</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  أزل خلفية صور البورتريه بضغطة واحدة. احتفظ بالشعر المتطاير والتفاصيل الدقيقة بجودة
                  احترافية. مثالي لجلسات التصوير والصور الشخصية.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-bold mb-2">للمصممين</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  احصل على صور PNG شفافة عالية الجودة لتصاميمك. استخدمها في الفوتوشوب، Canva، Figma،
                  أو أي برنامج تصميم. وفّر ساعات من العمل اليدوي.
                </p>
              </div>
              <div className={`${cardClass} border rounded-2xl p-5 text-right`}>
                <div className="text-3xl mb-3">📱</div>
                <h3 className="text-lg font-bold mb-2">لصنّاع المحتوى</h3>
                <p className={`text-sm ${textClass} leading-relaxed`}>
                  أنشئ صوراً مميزة لإنستغرام، تيك توك، يوتيوب، وتويتر. صور مصغرة احترافية،
                  صور بروفايل، ومنشورات بجودة عالية.
                </p>
              </div>
            </div>
          </article>

          <article className={`${cardClass} border rounded-2xl p-6 md:p-8 text-right`}>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-ink-900">
              📚 اقرأ أيضاً: دليل شامل لحذف خلفية الصور
            </h2>
            <p className={`text-sm md:text-base ${textClass} mb-6 leading-relaxed`}>
              تريد تعلم المزيد عن <strong>حذف خلفية الصور</strong>؟
              اقرأ دليلنا الشامل الذي يشرح:
            </p>
            <ul className={`space-y-2 text-sm ${textClass} mb-6`}>
              <li className="flex gap-2 items-start">
                <span className="text-brand-500 font-bold">✓</span>
                <span>أنواع حذف خلفية الصور (يدوي، تلقائي، AI)</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-500 font-bold">✓</span>
                <span>أفضل 7 أدوات لحذف خلفية الصور في 2026</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-500 font-bold">✓</span>
                <span>10 نصائح احترافية لحذف خلفية مثالية</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-500 font-bold">✓</span>
                <span>أخطاء شائعة يجب تجنبها</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-brand-500 font-bold">✓</span>
                <span>مستقبل حذف خلفية الصور والتقنيات الناشئة</span>
              </li>
            </ul>
            <a
              href="https://blog.intooly.com/%d8%ad%d8%b0%d9%81-%d8%ae%d9%84%d9%81%d9%8a%d8%a9-%d8%a7%d9%84%d8%b5%d9%88%d8%b1/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              📖 اقرأ الدليل الشامل
              <span className="text-lg">←</span>
            </a>
          </article>

        </div>
      </section>

      {/* ================================================== */}
      {/* FAQ SECTION                                         */}
      {/* ================================================== */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-ink-900">الأسئلة الشائعة</h2>
          <div className="space-y-2 md:space-y-3">
            {[
              { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون حدود على عدد الصور.' },
              { q: 'هل صوري آمنة؟', a: 'نعم، كل المعالجة تتم في متصفحك ولا نرفع أي صورة لأي خادم.' },
              { q: 'ما هو النموذج المستخدم؟', a: 'نستخدم RMBG-1.4 من BRIA AI — دقة 1024×1024، ممتاز للشعر والبورتريه.' },
              { q: 'لماذا أول صورة تأخذ وقتاً؟', a: 'المرة الأولى فقط: يُحمّل النموذج (44 MB) ويُحفظ في متصفحك. بعدها، كل المعالجات فورية مع تعديلات حية!' },
              { q: 'كيف تعمل التعديلات الحية؟', a: 'بعد حذف الخلفية، أي تغيير في الخلفية/الظل/تحسين الحواف يُطبَّق فوراً.' },
              { q: 'كيف أُكبّر الصورة؟', a: 'عجلة الفأرة (Scroll) فوق منطقة التحرير، أو أزرار Zoom. وضع "تحريك" للسحب.' },
              { q: 'ما فرق أوضاع المعالجة؟', a: 'تلقائي: متوازن. بورتريه: يحافظ على الشعر. منتج: حواف حادة.' },
            ].map((faq, i) => (
              <details key={i} className={`${cardClass} border rounded-lg md:rounded-xl overflow-hidden group`}>
                <summary className="p-4 md:p-5 cursor-pointer font-bold text-sm md:text-base flex justify-between items-center text-ink-900">{faq.q} <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-brand-500 group-open:rotate-180 transition-transform" /></summary>
                <div className={`px-4 md:px-5 pb-4 md:pb-5 text-xs md:text-sm ${textClass} border-t border-ink-100 pt-3`}>{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* RELATED TOOLS — مُصلحة مع cursor-pointer و hover    */}
      {/* ================================================== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-ink-900">🛠️ أدوات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: FileImage, title: 'ضاغط الصور', href: '/tools/image-compressor' },
              { icon: Layers, title: 'تغيير حجم الصور', href: '/tools/image-resizer' },
              { icon: Scissors, title: 'قص الصور', href: '/tools/image-cropper' },
              { icon: Palette, title: 'تحويل الصيغ', href: '/tools/image-converter' },
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className={`${cardClass} border p-4 md:p-5 rounded-xl md:rounded-2xl hover:shadow-lg hover:border-brand-400 transition-all group text-right cursor-pointer block`}
              >
                <tool.icon className="w-7 h-7 md:w-8 md:h-8 text-brand-500 mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm md:text-base text-ink-900">{tool.title}</h3>
                <p className="text-xs text-brand-600 mt-2 flex items-center gap-1">
                  جرّب الأداة <ArrowLeft className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FIRST SUCCESS NOTIFICATION                          */}
      {/* ================================================== */}
      {showFirstSuccess && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-xl shadow-2xl z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">🎉 تم تحميل النموذج بنجاح!</h4>
              <p className="text-xs opacity-90 leading-relaxed">
                من الآن فصاعداً، المعالجة والتعديلات <strong>حية وفورية</strong>. جرّب تغيير الخلفية أو الظل!
              </p>
              <button onClick={() => setShowFirstSuccess(false)} className="mt-2 text-xs font-bold underline hover:no-underline">
                فهمت ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}