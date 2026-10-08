'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import * as ort from 'onnxruntime-web';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Upload, Download, Image as ImageIcon, Sparkles, Palette, Droplet,
  ChevronDown, Trash2, Layers, CheckCircle2, Scissors,
  Wand2, Loader2, AlertCircle, ShoppingBag, Star, FileArchive,
  Stamp, Square, ExternalLink, Plus, X, Camera
} from 'lucide-react';

// ============================================================
// ✅ الأنواع
// ============================================================
type ProcessingStatus = 'pending' | 'loading-model' | 'processing' | 'done' | 'error';

type ProcessedImage = {
  id: string;
  file: File;
  originalUrl: string;
  processedBlob: Blob | null;
  finalUrl: string | null;
  originalSize: number;
  processedSize: number | null;
  status: ProcessingStatus;
  progress: number;
  errorMessage?: string;
  originalWidth: number;
  originalHeight: number;
};

type TemplateId = 'amazon' | 'noon' | 'haraj' | 'instagram' | 'shopify' | 'web' | 'etsy' | 'aliexpress' | 'custom';

type Template = {
  id: TemplateId;
  name: string;
  size: number;
  width: number;
  height: number;
  icon: string;
  color: string;
  description: string;
};

type ShadowType = 'none' | 'drop' | 'reflection' | 'ground';
type BackgroundType = 'white' | 'transparent' | 'gradient' | 'color';
type WatermarkType = 'none' | 'text' | 'image';

// ============================================================
// ✅ الثوابت
// ============================================================
const TEMPLATES: Template[] = [
  { id: 'amazon', name: 'أمازون', size: 2000, width: 2000, height: 2000, icon: '🛒', color: 'from-orange-500 to-orange-600', description: '2000×2000' },
  { id: 'noon', name: 'نون', size: 1200, width: 1200, height: 1200, icon: '🏪', color: 'from-yellow-500 to-yellow-600', description: '1200×1200' },
  { id: 'haraj', name: 'حراج', size: 800, width: 800, height: 800, icon: '🚗', color: 'from-green-500 to-green-600', description: '800×800' },
  { id: 'instagram', name: 'إنستغرام', size: 1080, width: 1080, height: 1080, icon: '📱', color: 'from-pink-500 to-purple-600', description: '1080×1080' },
  { id: 'shopify', name: 'شوبيفاي', size: 2048, width: 2048, height: 2048, icon: '🛍️', color: 'from-emerald-500 to-emerald-600', description: '2048×2048' },
  { id: 'web', name: 'ويب', size: 1200, width: 1200, height: 1200, icon: '🌐', color: 'from-blue-500 to-blue-600', description: '1200×1200' },
  { id: 'etsy', name: 'Etsy', size: 2000, width: 2000, height: 2000, icon: '🎨', color: 'from-orange-400 to-red-500', description: '2000×2000' },
  { id: 'aliexpress', name: 'علي إكسبريس', size: 1000, width: 1000, height: 1000, icon: '📦', color: 'from-red-500 to-red-600', description: '1000×1000' },
  { id: 'custom', name: 'مخصص', size: 1500, width: 1500, height: 1500, icon: '⚙️', color: 'from-gray-500 to-gray-600', description: 'أي أبعاد' },
];

const GRADIENT_PRESETS = [
  { name: 'رمادي ناعم', from: '#f5f5f5', to: '#e5e7eb' },
  { name: 'أبيض دافئ', from: '#ffffff', to: '#fef3c7' },
  { name: 'أزرق ناعم', from: '#eff6ff', to: '#dbeafe' },
  { name: 'أخضر ناعم', from: '#f0fdf4', to: '#dcfce7' },
  { name: 'وردي ناعم', from: '#fdf2f8', to: '#fce7f3' },
  { name: 'بنفسجي', from: '#faf5ff', to: '#ede9fe' },
  { name: 'غروب', from: '#f093fb', to: '#f5576c' },
  { name: 'محيط', from: '#4facfe', to: '#00f2fe' },
];

const SHADOW_TYPES: { id: ShadowType; name: string; icon: string; description: string }[] = [
  { id: 'none', name: 'بدون ظل', icon: '🚫', description: 'منتج بدون ظل' },
  { id: 'drop', name: 'ظل عادي', icon: '💧', description: 'ظل خفيف تحت المنتج' },
  { id: 'reflection', name: 'انعكاس', icon: '🪞', description: 'انعكاس المنتج أسفله' },
  { id: 'ground', name: 'ظل أرضي', icon: '🌑', description: 'ظل أرضي واقعي' },
];

const RMBG_INPUT_SIZE = 1024;
const RMBG_MEAN = 0.5;
const RMBG_STD = 1.0;

const ORT_WASM_PATH = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.2/dist/';

const MODEL_URL_PRIMARY = 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model.onnx';
const MODEL_URL_FALLBACK = '/models/rmbg14.onnx';

const MAX_IMAGES = 50;
const MAX_CANVAS_PIXELS = 28_000_000;

// ============================================================
// ✅ المكوّن الرئيسي
// ============================================================
export default function SmartProductStudio() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'customize' | 'result'>('upload');
  const [activeTab, setActiveTab] = useState<'template' | 'background' | 'shadow' | 'watermark'>('template');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const modelLoadingPromiseRef = useRef<Promise<ort.InferenceSession> | null>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('amazon');
  const [customWidth, setCustomWidth] = useState(1500);
  const [customHeight, setCustomHeight] = useState(1500);
  const [padding, setPadding] = useState(10);

  const [bgType, setBgType] = useState<BackgroundType>('white');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gradientFrom, setGradientFrom] = useState('#f5f5f5');
  const [gradientTo, setGradientTo] = useState('#e5e7eb');

  const [shadowType, setShadowType] = useState<ShadowType>('drop');
  const [shadowIntensity, setShadowIntensity] = useState(40);
  const [shadowBlur, setShadowBlur] = useState(20);

  const [watermarkType, setWatermarkType] = useState<WatermarkType>('none');
  const [watermarkText, setWatermarkText] = useState('© intooly.com');
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkSize, setWatermarkSize] = useState(24);
  const [watermarkLogo, setWatermarkLogo] = useState<HTMLImageElement | null>(null);

  const selectedImage = images.find(img => img.id === selectedImageId);

  // ============================================================
  // ✅ MODEL LOADING
  // ============================================================
  const loadModel = useCallback(async (): Promise<ort.InferenceSession> => {
    if (sessionRef.current) return sessionRef.current;
    if (modelLoadingPromiseRef.current) return modelLoadingPromiseRef.current;

    modelLoadingPromiseRef.current = (async () => {
      try {
        if (typeof ort === 'undefined') throw new Error('ONNX Runtime غير محمّل');
        if (typeof WebAssembly === 'undefined') throw new Error('المتصفح لا يدعم WebAssembly');

        ort.env.wasm.wasmPaths = ORT_WASM_PATH;
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;
        ort.env.wasm.proxy = false;

        console.log('[Model] محاولة تحميل RMBG-1.4...');
        let session: ort.InferenceSession;

        try {
          session = await ort.InferenceSession.create(MODEL_URL_PRIMARY, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all',
          });
          console.log('[Model] ✅ تم التحميل من HuggingFace');
        } catch (primaryError) {
          console.warn('[Model] فشل HuggingFace، محاولة المسار المحلي...', primaryError);
          session = await ort.InferenceSession.create(MODEL_URL_FALLBACK, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all',
          });
          console.log('[Model] ✅ تم التحميل من المسار المحلي');
        }

        console.log('[Model] Inputs:', session.inputNames);
        console.log('[Model] Outputs:', session.outputNames);

        sessionRef.current = session;
        setIsModelLoaded(true);
        return session;
      } catch (e) {
        modelLoadingPromiseRef.current = null;
        console.error('[Model] فشل التحميل:', e);
        throw new Error('فشل تحميل النموذج: ' + (e instanceof Error ? e.message : 'unknown'));
      } finally {
        modelLoadingPromiseRef.current = null;
      }
    })();

    return modelLoadingPromiseRef.current;
  }, []);

  // ============================================================
  // ✅ BACKGROUND REMOVAL
  // ============================================================
  const removeBackground = useCallback(async (
    imageBitmap: ImageBitmap,
    onProgress?: (p: number) => void
  ): Promise<Blob> => {
    const session = await loadModel();
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
    if (!ctx) throw new Error('Canvas creation failed');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, inputSize, inputSize);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageBitmap, padX, padY, scaledW, scaledH);

    const imageData = ctx.getImageData(0, 0, inputSize, inputSize);

    const float32Data = new Float32Array(3 * inputSize * inputSize);
    const planeSize = inputSize * inputSize;
    for (let i = 0; i < planeSize; i++) {
      const r = imageData.data[i * 4] / 255.0;
      const g = imageData.data[i * 4 + 1] / 255.0;
      const b = imageData.data[i * 4 + 2] / 255.0;

      float32Data[i] = (r - RMBG_MEAN) / RMBG_STD;
      float32Data[planeSize + i] = (g - RMBG_MEAN) / RMBG_STD;
      float32Data[2 * planeSize + i] = (b - RMBG_MEAN) / RMBG_STD;
    }

    onProgress?.(30);

    const inputTensor = new ort.Tensor('float32', float32Data, [1, 3, inputSize, inputSize]);
    const feeds = { [session.inputNames[0]]: inputTensor };
    const results = await session.run(feeds);
    const outputTensor = results[session.outputNames[0]];
    const outputData = outputTensor.data as Float32Array;

    onProgress?.(70);

    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = inputSize;
    smallCanvas.height = inputSize;
    const smallCtx = smallCanvas.getContext('2d');
    if (!smallCtx) throw new Error('Small canvas failed');

    const maskImageData = smallCtx.createImageData(inputSize, inputSize);

    for (let i = 0; i < planeSize; i++) {
      const val = outputData[i];
      let alpha = Math.round(val * 255);

      if (alpha < 8) alpha = 0;
      else if (alpha > 245) alpha = 255;

      maskImageData.data[i * 4] = 255;
      maskImageData.data[i * 4 + 1] = 255;
      maskImageData.data[i * 4 + 2] = 255;
      maskImageData.data[i * 4 + 3] = alpha;
    }
    smallCtx.putImageData(maskImageData, 0, 0);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = originalWidth;
    maskCanvas.height = originalHeight;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Mask canvas failed');
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = 'high';

    maskCtx.drawImage(
      smallCanvas,
      padX, padY, scaledW, scaledH,
      0, 0, originalWidth, originalHeight
    );
    onProgress?.(85);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = originalWidth;
    finalCanvas.height = originalHeight;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) throw new Error('Final canvas failed');

    finalCtx.drawImage(imageBitmap, 0, 0);
    finalCtx.globalCompositeOperation = 'destination-in';
    finalCtx.drawImage(maskCanvas, 0, 0);
    finalCtx.globalCompositeOperation = 'source-over';

    onProgress?.(100);

    return new Promise<Blob>((resolve, reject) => {
      finalCanvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('toBlob failed')),
        'image/png'
      );
    });
  }, [loadModel]);

  // ============================================================
  // ✅ GET CURRENT TEMPLATE
  // ============================================================
  const getCurrentTemplate = useCallback((): Template => {
    const t = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
    if (t.id === 'custom') return {
      ...t,
      width: customWidth,
      height: customHeight,
      size: Math.max(customWidth, customHeight)
    };
    return t;
  }, [selectedTemplate, customWidth, customHeight]);

  // ============================================================
  // ✅ APPLY SETTINGS TO IMAGE
  // ============================================================
  const applySettingsToImage = useCallback(async (img: ProcessedImage): Promise<ProcessedImage> => {
    if (!img.processedBlob) return img;

    try {
      const template = getCurrentTemplate();
      const targetW = template.width;
      const targetH = template.height;

      if (targetW * targetH > MAX_CANVAS_PIXELS) {
        throw new Error('الأبعاد المختارة كبيرة جداً لهذا المتصفح');
      }

      const url = URL.createObjectURL(img.processedBlob);
      const processedImg = new Image();
      await new Promise<void>((resolve, reject) => {
        processedImg.onload = () => resolve();
        processedImg.onerror = () => reject(new Error('فشل تحميل الصورة المعالجة'));
        processedImg.src = url;
      });

      const analysisCanvas = document.createElement('canvas');
      analysisCanvas.width = processedImg.width;
      analysisCanvas.height = processedImg.height;
      const actx = analysisCanvas.getContext('2d', { willReadFrequently: true });
      if (!actx) { URL.revokeObjectURL(url); return img; }

      actx.drawImage(processedImg, 0, 0);
      const analysisData = actx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height).data;

      let minX = analysisCanvas.width, minY = analysisCanvas.height, maxX = -1, maxY = -1;
      const w = analysisCanvas.width;
      const h = analysisCanvas.height;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (analysisData[(y * w + x) * 4 + 3] > 20) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < 0) {
        minX = 0; minY = 0; maxX = w - 1; maxY = h - 1;
      }

      const bboxW = maxX - minX + 1;
      const bboxH = maxY - minY + 1;

      const paddingPx = Math.min(targetW, targetH) * (padding / 100);
      const availableW = targetW - paddingPx * 2;
      const availableH = targetH - paddingPx * 2;
      const scale = Math.min(availableW / bboxW, availableH / bboxH);
      const drawW = bboxW * scale;
      const drawH = bboxH * scale;
      const dx = (targetW - drawW) / 2;
      const dy = (targetH - drawH) / 2;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetW;
      finalCanvas.height = targetH;
      const fctx = finalCanvas.getContext('2d');
      if (!fctx) { URL.revokeObjectURL(url); return img; }

      fctx.imageSmoothingEnabled = true;
      fctx.imageSmoothingQuality = 'high';

      if (bgType === 'white') {
        fctx.fillStyle = '#ffffff';
        fctx.fillRect(0, 0, targetW, targetH);
      } else if (bgType === 'color') {
        fctx.fillStyle = bgColor;
        fctx.fillRect(0, 0, targetW, targetH);
      } else if (bgType === 'gradient') {
        const grad = fctx.createLinearGradient(0, 0, targetW, targetH);
        grad.addColorStop(0, gradientFrom);
        grad.addColorStop(1, gradientTo);
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, targetW, targetH);
      }

      const shouldDrawShadow = bgType !== 'transparent';

      if (shouldDrawShadow && shadowType === 'drop') {
        const blur = (shadowBlur / 100) * Math.min(targetW, targetH) * 0.1;
        const offset = Math.min(targetW, targetH) * 0.015;
        const alpha = shadowIntensity / 100;
        fctx.save();
        fctx.shadowColor = `rgba(0,0,0,${alpha * 0.6})`;
        fctx.shadowBlur = blur;
        fctx.shadowOffsetY = offset;
        fctx.drawImage(processedImg, minX, minY, bboxW, bboxH, dx, dy, drawW, drawH);
        fctx.restore();
      } else if (shouldDrawShadow && shadowType === 'ground') {
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = targetW;
        shadowCanvas.height = targetH;
        const sctx = shadowCanvas.getContext('2d');
        if (sctx) {
          sctx.save();
          sctx.filter = `blur(${Math.min(targetW, targetH) * 0.04}px)`;
          sctx.fillStyle = `rgba(0,0,0,${(shadowIntensity / 100) * 0.45})`;
          const ellipseW = drawW * 0.75;
          const ellipseH = Math.min(drawH * 0.1, 60);
          const ellipseCx = dx + drawW / 2;
          const ellipseCy = dy + drawH + Math.min(targetW, targetH) * 0.005;
          sctx.beginPath();
          sctx.ellipse(ellipseCx, ellipseCy, ellipseW, ellipseH, 0, 0, Math.PI * 2);
          sctx.fill();
          sctx.restore();
          fctx.drawImage(shadowCanvas, 0, 0);
        }
      }

      fctx.drawImage(processedImg, minX, minY, bboxW, bboxH, dx, dy, drawW, drawH);

      if (shouldDrawShadow && shadowType === 'reflection') {
        const reflectionCanvas = document.createElement('canvas');
        reflectionCanvas.width = Math.round(drawW);
        reflectionCanvas.height = Math.round(drawH * 0.6);
        const rctx = reflectionCanvas.getContext('2d');
        if (rctx) {
          rctx.save();
          rctx.translate(0, reflectionCanvas.height);
          rctx.scale(1, -1);
          rctx.drawImage(
            processedImg,
            minX, maxY - Math.round(bboxH * 0.6), bboxW, Math.round(bboxH * 0.6),
            0, 0, drawW, drawH * 0.6
          );
          rctx.restore();

          const grad = rctx.createLinearGradient(0, 0, 0, reflectionCanvas.height);
          grad.addColorStop(0, `rgba(0,0,0,${(shadowIntensity / 100) * 0.4})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          rctx.globalCompositeOperation = 'destination-in';
          rctx.fillStyle = grad;
          rctx.fillRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);

          fctx.drawImage(reflectionCanvas, dx, dy + drawH);
        }
      }

      if (watermarkType === 'text' && watermarkText.trim()) {
        const fontSize = (watermarkSize / 1000) * Math.min(targetW, targetH);
        fctx.save();
        fctx.font = `bold ${fontSize}px 'Cairo', sans-serif`;
        fctx.fillStyle = `rgba(0,0,0,${watermarkOpacity / 100})`;
        fctx.textBaseline = 'middle';
        const textW = fctx.measureText(watermarkText).width;
        const margin = Math.min(targetW, targetH) * 0.03;
        let tx = targetW - textW - margin;
        let ty = targetH - margin;
        if (watermarkPosition === 'bottom-left') { tx = margin; ty = targetH - margin; }
        else if (watermarkPosition === 'top-right') { tx = targetW - textW - margin; ty = margin; }
        else if (watermarkPosition === 'top-left') { tx = margin; ty = margin; }
        else if (watermarkPosition === 'center') { tx = (targetW - textW) / 2; ty = targetH / 2; }
        fctx.fillText(watermarkText, tx, ty);
        fctx.restore();
      } else if (watermarkType === 'image' && watermarkLogo) {
        const logoW = Math.min(targetW, targetH) * 0.15;
        const logoH = (watermarkLogo.height / watermarkLogo.width) * logoW;
        const margin = Math.min(targetW, targetH) * 0.03;
        let lx = targetW - logoW - margin;
        let ly = targetH - logoH - margin;
        if (watermarkPosition === 'bottom-left') { lx = margin; ly = targetH - logoH - margin; }
        else if (watermarkPosition === 'top-right') { lx = targetW - logoW - margin; ly = margin; }
        else if (watermarkPosition === 'top-left') { lx = margin; ly = margin; }
        else if (watermarkPosition === 'center') { lx = (targetW - logoW) / 2; ly = (targetH - logoH) / 2; }
        fctx.save();
        fctx.globalAlpha = watermarkOpacity / 100;
        fctx.drawImage(watermarkLogo, lx, ly, logoW, logoH);
        fctx.restore();
      }

      URL.revokeObjectURL(url);
      if (img.finalUrl) URL.revokeObjectURL(img.finalUrl);

      const finalBlob = await new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('toBlob failed')),
          'image/png'
        );
      });

      return {
        ...img,
        finalUrl: URL.createObjectURL(finalBlob),
        processedSize: finalBlob.size,
        status: 'done',
        progress: 100,
        errorMessage: undefined,
      };
    } catch (e) {
      console.error('Apply settings error:', e);
      return {
        ...img,
        status: 'error',
        errorMessage: e instanceof Error ? e.message : 'فشل تطبيق الإعدادات',
      };
    }
  }, [
    getCurrentTemplate, padding, bgType, bgColor, gradientFrom, gradientTo,
    shadowType, shadowIntensity, shadowBlur, watermarkType, watermarkText,
    watermarkPosition, watermarkOpacity, watermarkSize, watermarkLogo,
  ]);

  // ============================================================
  // ✅ PROCESS SINGLE IMAGE
  // ============================================================
  const processSingleImage = useCallback(async (img: ProcessedImage): Promise<ProcessedImage> => {
    try {
      if (!sessionRef.current) {
        setImages(prev => prev.map(i =>
          i.id === img.id ? { ...i, status: 'loading-model' as ProcessingStatus, progress: 0 } : i
        ));
        const interval = setInterval(() => {
          setImages(prev => prev.map(i => {
            if (i.id === img.id && i.status === 'loading-model' && i.progress < 90) {
              return { ...i, progress: i.progress + 3 };
            }
            return i;
          }));
        }, 500);
        try {
          await loadModel();
        } finally {
          clearInterval(interval);
        }
      }

      setImages(prev => prev.map(i =>
        i.id === img.id ? { ...i, status: 'processing' as ProcessingStatus, progress: 5 } : i
      ));

      const bitmap = await createImageBitmap(img.file);

      const blob = await removeBackground(bitmap, (p) => {
        const mapped = Math.round(p * 0.8);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, progress: mapped } : i));
      });

      bitmap.close();

      const updated: ProcessedImage = {
        ...img,
        processedBlob: blob,
        status: 'processing' as ProcessingStatus,
        progress: 85,
      };

      return await applySettingsToImage(updated);
    } catch (e) {
      console.error('Process error:', e);
      return {
        ...img,
        status: 'error' as ProcessingStatus,
        errorMessage: e instanceof Error ? e.message : 'خطأ في المعالجة',
      };
    }
  }, [loadModel, removeBackground, applySettingsToImage]);

  const applySettingsToAll = useCallback(async () => {
    const updated = await Promise.all(
      images.map(img => img.processedBlob ? applySettingsToImage(img) : Promise.resolve(img))
    );
    setImages(updated);
  }, [images, applySettingsToImage]);

  const processAll = async () => {
    if (images.length === 0) return;
    setIsProcessingAll(true);
    setCurrentStep('result');

    for (let i = 0; i < images.length; i++) {
      const currentImages = images;
      const img = currentImages[i];
      if (img.status === 'pending' || img.status === 'error') {
        const processed = await processSingleImage(img);
        setImages(prev => prev.map(x => x.id === img.id ? processed : x));
      }
    }
    setIsProcessingAll(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImages(files);
  }, []);

  const addImages = async (newFiles: File[]) => {
    const remaining = Math.max(0, MAX_IMAGES - images.length);
    const accepted = newFiles.slice(0, remaining);
    if (accepted.length === 0) {
      alert(`الحد الأقصى هو ${MAX_IMAGES} صورة`);
      return;
    }

    const newImages: ProcessedImage[] = [];
    for (const file of accepted) {
      const url = URL.createObjectURL(file);
      let w = 0, h = 0;
      try {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => { w = img.naturalWidth; h = img.naturalHeight; resolve(); };
          img.onerror = () => resolve();
          img.src = url;
        });
      } catch {}

      newImages.push({
        id: Math.random().toString(36).substring(2, 11),
        file,
        originalUrl: url,
        processedBlob: null,
        finalUrl: null,
        originalSize: file.size,
        processedSize: null,
        status: 'pending',
        progress: 0,
        originalWidth: w,
        originalHeight: h,
      });
    }

    setImages(prev => {
      const updated = [...prev, ...newImages];
      if (!selectedImageId && newImages.length > 0) setSelectedImageId(newImages[0].id);
      return updated;
    });
    setCurrentStep('customize');
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
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.finalUrl) URL.revokeObjectURL(img.finalUrl);
    });
    setImages([]);
    setSelectedImageId(null);
    setCurrentStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = async (img: ProcessedImage, format: 'png' | 'jpeg' | 'webp' = 'png') => {
    if (!img.finalUrl) return;
    try {
      if (format === 'png') {
        const link = document.createElement('a');
        link.href = img.finalUrl;
        link.download = `product_${img.file.name.replace(/\.[^.]+$/, '')}_${selectedTemplate}.png`;
        link.click();
      } else {
        const im = new Image();
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
        c.toBlob((b) => {
          if (!b) return;
          const u = URL.createObjectURL(b);
          const a = document.createElement('a');
          a.href = u;
          a.download = `product_${img.file.name.replace(/\.[^.]+$/, '')}_${selectedTemplate}.${format}`;
          a.click();
          URL.revokeObjectURL(u);
        }, `image/${format}`, 0.95);
      }
    } catch (e) { console.error('Download error:', e); }
  };

  const downloadAllAsZip = async () => {
    const done = images.filter(i => i.finalUrl && i.status === 'done');
    if (done.length === 0) { alert('لا توجد صور جاهزة'); return; }
    try {
      const zip = new JSZip();
      const folder = zip.folder(`intooly-${selectedTemplate}-${Date.now()}`);
      for (const img of done) {
        if (!img.finalUrl) continue;
        const res = await fetch(img.finalUrl);
        const blob = await res.blob();
        folder?.file(`product_${img.file.name.replace(/\.[^.]+$/, '')}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `intooly-products-${selectedTemplate}.zip`);
    } catch (e) { console.error('ZIP error:', e); alert('فشل إنشاء ZIP'); }
  };

  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => { setWatermarkLogo(img); setWatermarkType('image'); };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ===== Effects =====
  useEffect(() => {
    const saved = localStorage.getItem('intooly-studio-settings');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.selectedTemplate) setSelectedTemplate(s.selectedTemplate);
        if (s.padding !== undefined) setPadding(s.padding);
        if (s.bgType) setBgType(s.bgType);
        if (s.bgColor) setBgColor(s.bgColor);
        if (s.gradientFrom) setGradientFrom(s.gradientFrom);
        if (s.gradientTo) setGradientTo(s.gradientTo);
        if (s.shadowType) setShadowType(s.shadowType);
        if (s.shadowIntensity !== undefined) setShadowIntensity(s.shadowIntensity);
        if (s.watermarkType) setWatermarkType(s.watermarkType);
        if (s.watermarkText) setWatermarkText(s.watermarkText);
      } catch (e) { console.warn('Failed to load settings:', e); }
    }
  }, []);

  useEffect(() => {
    const settings = { selectedTemplate, padding, bgType, bgColor, gradientFrom, gradientTo, shadowType, shadowIntensity, watermarkType, watermarkText };
    localStorage.setItem('intooly-studio-settings', JSON.stringify(settings));
  }, [selectedTemplate, padding, bgType, bgColor, gradientFrom, gradientTo, shadowType, shadowIntensity, watermarkType, watermarkText]);

  useEffect(() => {
    if (images.some(img => img.processedBlob)) {
      const t = setTimeout(() => applySettingsToAll(), 400);
      return () => clearTimeout(t);
    }
  }, [
    selectedTemplate, padding, bgType, bgColor, gradientFrom, gradientTo,
    shadowType, shadowIntensity, shadowBlur, watermarkType, watermarkText,
    watermarkPosition, watermarkOpacity, watermarkSize, customWidth, customHeight
  ]);

  const template = getCurrentTemplate();
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
                <Camera className="hero-icon w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                استوديو صور المنتجات
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              RMBG-1.4 + 9 قوالب + 4 ظلال + علامة مائية
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              حوّل صور منتجاتك إلى صور احترافية جاهزة لأمازون، نون، حراج، شوبيفاي
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FEATURES                                            */}
      {/* ================================================== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, title: 'AI دقيق', desc: 'RMBG-1.4 (1024px)' },
              { icon: Square, title: '9 قوالب', desc: 'جاهزة للمتاجر' },
              { icon: Droplet, title: '4 ظلال', desc: 'عادي، انعكاس، أرضي' },
              { icon: Stamp, title: 'علامة مائية', desc: 'نص أو شعار' }
            ].map((f, i) => (
              <div key={i} className={`${cardClass} border rounded-xl p-3 md:p-4 text-center shadow-sm`}>
                <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5">{f.title}</h3>
                <p className={`text-[10px] md:text-xs ${textClass}`}>{f.desc}</p>
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
            {currentStep === 'upload' && (
              <div className="text-center space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 md:border-3 border-dashed border-brand-300 bg-brand-50/50 rounded-xl md:rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group"
                >
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2">اسحب صور المنتجات هنا</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>أو انقر للاختيار — حتى 50 صورة</p>
                  <p className={`text-xs ${textClass} mt-2`}>JPG, PNG, WebP</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            )}

            {(currentStep === 'customize' || currentStep === 'result') && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ========== MAIN PANEL (Images) ========== */}
                <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2">
                  <div className={`${cardClass} border rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-bold text-sm md:text-base">الصور المرفوعة</h2>
                        <p className={`text-xs ${textClass}`}>{images.length} صورة</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setCurrentStep('upload')} className="px-3 py-2 bg-ink-200 hover:bg-ink-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> إضافة
                      </button>
                      <button onClick={clearAll} className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> مسح
                      </button>
                    </div>
                  </div>

                  {selectedImage && (
                    <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                      <div className="p-3 border-b border-ink-200/20 flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-bold text-xs md:text-sm truncate flex-1">{selectedImage.file.name}</h3>
                        {selectedImage.status === 'done' && selectedImage.finalUrl && (
                          <div className="flex gap-1.5">
                            <button onClick={() => downloadImage(selectedImage, 'png')} className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                              <Download className="w-3 h-3" /> PNG
                            </button>
                            <button onClick={() => downloadImage(selectedImage, 'jpeg')} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                              <Download className="w-3 h-3" /> JPEG
                            </button>
                            <button onClick={() => downloadImage(selectedImage, 'webp')} className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                              <Download className="w-3 h-3" /> WebP
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 p-3">
                        <div className="relative">
                          <div className="absolute top-2 right-2 bg-ink-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">الأصلية</div>
                          <img src={selectedImage.originalUrl} alt="original" className="w-full h-48 md:h-80 object-contain rounded-lg bg-ink-100" />
                        </div>
                        <div className="relative">
                          <div className="absolute top-2 right-2 bg-brand-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10">
                            {selectedImage.status === 'done' ? '✓ ' + template.name : selectedImage.status === 'processing' ? 'جاري...' : 'النتيجة'}
                          </div>
                          {selectedImage.finalUrl ? (
                            <img
                              src={selectedImage.finalUrl}
                              alt="processed"
                              className="w-full h-48 md:h-80 object-contain rounded-lg"
                              style={{
                                backgroundImage: bgType === 'transparent'
                                  ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                                  : 'none',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 md:h-80 flex items-center justify-center rounded-lg bg-brand-50 border-2 border-dashed border-brand-200">
                              <div className="text-center">
                                <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                                <p className="text-xs text-brand-600 font-semibold">
                                  {selectedImage.status === 'loading-model' ? `تحميل النموذج ${selectedImage.progress}%` :
                                   selectedImage.status === 'processing' ? `معالجة ${selectedImage.progress}%` :
                                   selectedImage.status === 'error' ? 'خطأ' : 'في الانتظار'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedImage.status === 'error' && (
                        <div className="mx-3 mb-3 p-2 bg-red-100 text-red-700 text-xs rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {selectedImage.errorMessage}
                        </div>
                      )}

                      {selectedImage.status === 'done' && (
                        <div className="mx-3 mb-3 grid grid-cols-3 gap-2">
                          <div className="bg-ink-50 rounded-lg p-2 text-center">
                            <p className={`text-[10px] ${textClass} mb-0.5`}>الحجم الأصلي</p>
                            <p className="text-xs font-bold">{formatFileSize(selectedImage.originalSize)}</p>
                          </div>
                          <div className="bg-brand-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-brand-600 mb-0.5">الحجم النهائي</p>
                            <p className="text-xs font-bold text-brand-700">
                              {selectedImage.processedSize ? formatFileSize(selectedImage.processedSize) : '—'}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-[10px] text-blue-600 mb-0.5">المقاس</p>
                            <p className="text-xs font-bold text-blue-700">
                              {template.width}×{template.height}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className={`${cardClass} border rounded-2xl p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xs">كل الصور ({images.length})</h3>
                        {images.some(i => i.finalUrl) && (
                          <button onClick={downloadAllAsZip} className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            <FileArchive className="w-3 h-3" /> ZIP
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-5 md:grid-cols-8 gap-2 max-h-[180px] overflow-y-auto">
                        {images.map(img => (
                          <div
                            key={img.id}
                            onClick={() => setSelectedImageId(img.id)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square ${selectedImageId === img.id ? 'border-brand-500 ring-2 ring-brand-300' : 'border-transparent hover:border-brand-300'}`}
                          >
                            <img src={img.finalUrl || img.originalUrl} alt={img.file.name} className="w-full h-full object-cover" />
                            {img.status === 'processing' && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-3 h-3 text-white animate-spin" />
                              </div>
                            )}
                            {img.status === 'done' && (
                              <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                              className="absolute top-0.5 left-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={processAll}
                      disabled={isProcessingAll || images.every(i => i.status === 'done')}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all"
                    >
                      {isProcessingAll ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> جاري المعالجة...</>
                      ) : (
                        <><Wand2 className="w-4 h-4" /> ابدأ المعالجة ({images.length} صورة)</>
                      )}
                    </button>
                  </div>
                </div>

                {/* ========== SETTINGS PANEL ========== */}
                <div className="space-y-4">
                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="flex border-b border-ink-200/20 overflow-x-auto">
                      {[
                        { id: 'template' as const, icon: Square, label: 'القالب' },
                        { id: 'background' as const, icon: Palette, label: 'الخلفية' },
                        { id: 'shadow' as const, icon: Droplet, label: 'الظل' },
                        { id: 'watermark' as const, icon: Stamp, label: 'العلامة' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id)}
                          className={`flex-1 min-w-[70px] flex flex-col items-center gap-1 py-3 text-[10px] font-bold transition-all ${activeTab === t.id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50' : `${textClass} hover:text-brand-500`}`}
                        >
                          <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4">
                      {/* TEMPLATE TAB */}
                      {activeTab === 'template' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold mb-2 block">اختر قالب المتجر</label>
                            <div className="grid grid-cols-3 gap-2">
                              {TEMPLATES.map(t => (
                                <button
                                  key={t.id}
                                  onClick={() => setSelectedTemplate(t.id)}
                                  className={`p-2 rounded-lg border-2 transition-all text-center ${selectedTemplate === t.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200 hover:border-brand-300'}`}
                                >
                                  <div className="text-2xl mb-1">{t.icon}</div>
                                  <div className="text-[10px] font-bold mb-0.5">{t.name}</div>
                                  <div className={`text-[9px] ${textClass}`}>{t.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedTemplate === 'custom' && (
                            <div className="space-y-2 p-3 bg-brand-50 rounded-lg">
                              <label className="text-xs font-bold block">📐 المقاس المخصص</label>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className={`text-[10px] ${textClass}`}>العرض</label>
                                  <input
                                    type="number"
                                    value={customWidth}
                                    onChange={(e) => setCustomWidth(Math.max(100, Math.min(5000, parseInt(e.target.value) || 1500)))}
                                    min={100}
                                    max={5000}
                                    className="w-full px-2 py-1.5 text-xs rounded border bg-white border-ink-300"
                                  />
                                </div>
                                <div>
                                  <label className={`text-[10px] ${textClass}`}>الطول</label>
                                  <input
                                    type="number"
                                    value={customHeight}
                                    onChange={(e) => setCustomHeight(Math.max(100, Math.min(5000, parseInt(e.target.value) || 1500)))}
                                    min={100}
                                    max={5000}
                                    className="w-full px-2 py-1.5 text-xs rounded border bg-white border-ink-300"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-xs font-bold mb-2 block">
                              📏 الهوامش: <span className="text-brand-600">{padding}%</span>
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={25}
                              value={padding}
                              onChange={(e) => setPadding(parseInt(e.target.value))}
                              className="w-full accent-brand-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* BACKGROUND TAB */}
                      {activeTab === 'background' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold mb-2 block">نوع الخلفية</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'white' as const, label: 'أبيض نقي', icon: '⬜' },
                                { id: 'transparent' as const, label: 'شفاف', icon: '🔲' },
                                { id: 'gradient' as const, label: 'تدرج', icon: '🌈' },
                                { id: 'color' as const, label: 'لون', icon: '🎨' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => setBgType(opt.id)}
                                  className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${bgType === opt.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}
                                >
                                  <span className="mr-1">{opt.icon}</span> {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {bgType === 'color' && (
                            <div>
                              <label className="text-xs font-bold mb-2 block">اختر اللون</label>
                              <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-full h-12 rounded-lg border-2 border-ink-300 cursor-pointer"
                              />
                            </div>
                          )}

                          {bgType === 'gradient' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className={`text-[10px] ${textClass} block mb-1`}>من</label>
                                  <input
                                    type="color"
                                    value={gradientFrom}
                                    onChange={(e) => setGradientFrom(e.target.value)}
                                    className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer"
                                  />
                                </div>
                                <div>
                                  <label className={`text-[10px] ${textClass} block mb-1`}>إلى</label>
                                  <input
                                    type="color"
                                    value={gradientTo}
                                    onChange={(e) => setGradientTo(e.target.value)}
                                    className="w-full h-10 rounded-lg border-2 border-ink-300 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {GRADIENT_PRESETS.map((g, i) => (
                                  <button
                                    key={i}
                                    onClick={() => { setGradientFrom(g.from); setGradientTo(g.to); }}
                                    className="w-full aspect-square rounded-lg border-2 border-ink-300 hover:scale-110 transition-transform"
                                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                                    title={g.name}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SHADOW TAB */}
                      {activeTab === 'shadow' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold mb-2 block">نوع الظل</label>
                            <div className="grid grid-cols-2 gap-2">
                              {SHADOW_TYPES.map(st => (
                                <button
                                  key={st.id}
                                  onClick={() => setShadowType(st.id)}
                                  className={`p-2 rounded-lg border-2 transition-all text-center ${shadowType === st.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}
                                >
                                  <div className="text-2xl mb-1">{st.icon}</div>
                                  <div className="text-[10px] font-bold">{st.name}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {shadowType !== 'none' && (
                            <>
                              <div>
                                <label className="text-xs font-bold mb-2 block">
                                  💧 شدة الظل: <span className="text-brand-600">{shadowIntensity}%</span>
                                </label>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={shadowIntensity}
                                  onChange={(e) => setShadowIntensity(parseInt(e.target.value))}
                                  className="w-full accent-brand-500"
                                />
                              </div>

                              {shadowType === 'drop' && (
                                <div>
                                  <label className="text-xs font-bold mb-2 block">
                                    🌫️ نعومة الظل: <span className="text-brand-600">{shadowBlur}%</span>
                                  </label>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={shadowBlur}
                                    onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                                    className="w-full accent-brand-500"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* WATERMARK TAB */}
                      {activeTab === 'watermark' && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold mb-2 block">نوع العلامة</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'none' as const, label: 'بدون', icon: '🚫' },
                                { id: 'text' as const, label: 'نص', icon: '📝' },
                                { id: 'image' as const, label: 'شعار', icon: '🖼️' }
                              ].map(w => (
                                <button
                                  key={w.id}
                                  onClick={() => setWatermarkType(w.id)}
                                  className={`p-2 rounded-lg border-2 text-xs font-bold transition-all text-center ${watermarkType === w.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}
                                >
                                  <div className="text-xl mb-1">{w.icon}</div> {w.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {watermarkType === 'text' && (
                            <>
                              <div>
                                <label className="text-xs font-bold mb-2 block">📝 نص العلامة</label>
                                <input
                                  type="text"
                                  value={watermarkText}
                                  onChange={(e) => setWatermarkText(e.target.value)}
                                  placeholder="مثال: © intooly.com"
                                  className="w-full px-3 py-2 text-sm rounded-lg border bg-white border-ink-300"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold mb-2 block">
                                  📏 حجم النص: <span className="text-brand-600">{watermarkSize}</span>
                                </label>
                                <input
                                  type="range"
                                  min={10}
                                  max={80}
                                  value={watermarkSize}
                                  onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                                  className="w-full accent-brand-500"
                                />
                              </div>
                            </>
                          )}

                          {watermarkType === 'image' && (
                            <div>
                              <label className="text-xs font-bold mb-2 block">🖼️ شعارك</label>
                              <input
                                ref={watermarkInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleWatermarkLogoUpload}
                                className="hidden"
                              />
                              <button
                                onClick={() => watermarkInputRef.current?.click()}
                                className="w-full p-3 border-2 border-dashed border-brand-300 rounded-lg hover:bg-brand-50 transition-colors text-xs font-bold text-brand-600"
                              >
                                {watermarkLogo ? '✅ تغيير الشعار' : '📤 ارفع شعارك'}
                              </button>
                              {watermarkLogo && (
                                <div className="mt-2 p-2 bg-ink-50 rounded-lg">
                                  <img src={watermarkLogo.src} alt="logo" className="h-12 mx-auto object-contain" />
                                </div>
                              )}
                            </div>
                          )}

                          {watermarkType !== 'none' && (
                            <>
                              <div>
                                <label className="text-xs font-bold mb-2 block">📍 الموضع</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[
                                    { id: 'top-left' as const, label: '↖️' },
                                    { id: 'center' as const, label: '⏺️' },
                                    { id: 'top-right' as const, label: '↗️' },
                                    { id: 'bottom-left' as const, label: '↙️' },
                                    { id: 'bottom-right' as const, label: '↘️' }
                                  ].map(pos => (
                                    <button
                                      key={pos.id}
                                      onClick={() => setWatermarkPosition(pos.id)}
                                      className={`p-2 rounded-lg border-2 transition-all ${watermarkPosition === pos.id ? 'border-brand-500 bg-brand-50' : 'border-ink-200'}`}
                                    >
                                      {pos.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-bold mb-2 block">
                                  💧 الشفافية: <span className="text-brand-600">{watermarkOpacity}%</span>
                                </label>
                                <input
                                  type="range"
                                  min={10}
                                  max={100}
                                  value={watermarkOpacity}
                                  onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                                  className="w-full accent-brand-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-ink-100 bg-brand-50/50">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-brand-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        التغييرات تُطبق فورياً على كل الصور
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
      {/* STORE PREVIEW                                       */}
      {/* ================================================== */}
      {selectedImage?.finalUrl && selectedImage.status === 'done' && (
        <section className="py-8 md:py-12 bg-ink-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-black mb-2 text-ink-900">👁️ معاينة المتجر</h2>
              <p className={`text-xs md:text-sm ${textClass}`}>كيف ستظهر صورتك في المتجر</p>
            </div>
            <div className={`${cardClass} border rounded-2xl p-4 md:p-8 shadow-xl`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-1">
                  <img src={selectedImage.finalUrl} alt="product preview" className="w-full rounded-lg bg-white" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div className={`text-xs ${textClass}`}>اسم المنتج هنا</div>
                  <h3 className="font-bold text-lg text-ink-900">منتج رائع بجودة عالية</h3>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                    <span className={`text-xs ${textClass} ml-2`}>(2,347)</span>
                  </div>
                  <div className="text-2xl font-black text-brand-600">99.00 ر.س</div>
                  <div className={`text-xs ${textClass}`}>
                    <span className="text-brand-600 font-bold">✓ متوفر</span> — التوصيل خلال 2-3 أيام
                  </div>
                  <button className="w-full md:w-auto px-6 py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-colors">
                    🛒 أضف للسلة
                  </button>
                  <div className={`text-[10px] ${textClass} italic`}>
                    * معاينة توضيحية فقط — لن يتم عرض شعار أي متجر
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* WHY CHOOSE                                          */}
      {/* ================================================== */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-ink-900">💎 لماذا Smart Product Studio؟</h2>
            <p className={`${textClass} text-sm md:text-base`}>الميزات التي تجعله الأول عربياً</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔒', title: 'محلي 100%', desc: 'صورك لا تغادر جهازك أبداً' },
              { icon: '🎨', title: '9 قوالب', desc: 'أمازون، نون، حراج، شوبيفاي' },
              { icon: '💧', title: '4 أنواع ظل', desc: 'عادي، انعكاس، أرضي، بدون' },
              { icon: '🌈', title: 'تدرجات ذكية', desc: '8 تدرجات جاهزة + مخصص' },
              { icon: '📝', title: 'علامة مائية', desc: 'نص أو شعار بموقع مخصص' },
              { icon: '👁️', title: 'معاينة المتجر', desc: 'شاهد النتيجة قبل التحميل' },
              { icon: '📦', title: 'ZIP متعدد', desc: 'تحميل كل الصور دفعة واحدة' },
              { icon: '⚡', title: 'معالجة دفعية', desc: 'حتى 50 صورة في وقت واحد' },
              { icon: '💾', title: 'حفظ الإعدادات', desc: 'إعداداتك محفوظة تلقائياً' }
            ].map((f, i) => (
              <div key={i} className={`${cardClass} border rounded-xl p-4 hover:shadow-lg hover:border-brand-400 transition-all`}>
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                <p className={`text-xs ${textClass}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FAQ                                                 */}
      {/* ================================================== */}
      <section className="py-10 md:py-14 bg-ink-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-ink-900">❓ الأسئلة الشائعة</h2>
          <div className="space-y-2">
            {[
              { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% بدون قيود على عدد الصور، بدون علامات مائية من طرفنا، وبدون الحاجة للتسجيل.' },
              { q: 'هل صوري آمنة؟', a: 'نعم 100%. كل المعالجة تتم داخل متصفحك (WebAssembly + ONNX). لا نرفع أي صورة لأي خادم.' },
              { q: 'ما هو النموذج المستخدم؟', a: 'نستخدم RMBG-1.4 من BRIA AI — دقة 1024×1024، ممتاز للشعر والبورتريه والمنتجات المعقدة.' },
              { q: 'لماذا أول صورة تأخذ وقتاً؟', a: 'نموذج RMBG-1.4 يُحمّل مرة واحدة فقط (~44 MB، 30-60 ثانية)، بعدها المعالجة سريعة (2-4 ثواني/صورة).' },
              { q: 'هل يمكنني استخدام علامة مائية خاصة بي؟', a: 'نعم، يمكنك إضافة نص مخصص أو رفع شعارك كصورة، مع التحكم في الموقع والحجم والشفافية.' },
              { q: 'ما هي صيغة التحميل؟', a: 'PNG (شفاف أو بخلفية)، JPEG، WebP، أو ZIP لكل الصور دفعة واحدة.' }
            ].map((faq, i) => (
              <details key={i} className={`${cardClass} border rounded-xl overflow-hidden group`}>
                <summary className="p-4 cursor-pointer font-bold text-sm flex justify-between items-center text-ink-900">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-brand-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className={`px-4 pb-4 text-xs ${textClass} border-t border-ink-100 pt-3`}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* RELATED TOOLS — مُصلحة مع cursor-pointer و hover    */}
      {/* ================================================== */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-ink-900">🛠️ أدوات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: ImageIcon, title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق للشعر' },
              { icon: Layers, title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل الحجم بدون فقدان' },
              { icon: Scissors, title: 'تغيير الحجم', href: '/tools/image-resizer', desc: 'أبعاد دقيقة' },
              { icon: Palette, title: 'تحويل الصيغ', href: '/tools/image-converter', desc: 'JPG, PNG, WebP' }
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.href}
                className={`${cardClass} border p-4 rounded-xl hover:shadow-lg hover:border-brand-400 transition-all group text-right cursor-pointer block`}
              >
                <tool.icon className="w-7 h-7 text-brand-500 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-sm mb-1 text-ink-900">{tool.title}</h3>
                <p className={`text-xs ${textClass}`}>{tool.desc}</p>
                <p className="text-xs text-brand-600 mt-2 flex items-center gap-1 font-bold">
                  جرّب الأداة <ExternalLink className="w-3 h-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}