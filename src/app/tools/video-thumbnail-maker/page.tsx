"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ImagePlus, Type, Download, Trash2, Plus, RotateCcw, Palette, Layers,
  Sparkles, Film, AlignRight, AlignCenter, AlignLeft, Check, Undo2, Redo2,
  Copy, Lock, Unlock, ChevronUp, ChevronDown, Eye, EyeOff,
  Save, AlertCircle, CheckCircle2, Lightbulb, Monitor, Scissors, X,
  SlidersHorizontal, RotateCw, FlipHorizontal2, FlipVertical2,
} from "lucide-react";

type TextLayer = {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  bold: boolean;
  stroke: boolean;
  shadow: boolean;
  align: CanvasTextAlign;
  locked: boolean;
  visible: boolean;
  fontFamily: string;
  rotation: number;
};

type Template = {
  name: string;
  background: string;
  accent: string;
  title: string;
  subtitle: string;
  category: string;
};

type HistoryState = {
  layers: TextLayer[];
  background: string;
  accent: string;
  gradient: boolean;
};

type ChannelIdentity = {
  name: string;
  primaryColor: string;
  accentColor: string;
};

type DesignAnalysis = {
  score: number;
  issues: string[];
  tips: string[];
};

const WIDTH = 1280;
const HEIGHT = 720;
const STORAGE_KEY_IDENTITY = "intooly-thumbnail-identity";

const ARABIC_FONTS = ["Tajawal", "Cairo", "Arial", "Tahoma"];

const templates: Template[] = [
  { name: "شرح تعليمي", background: "#0f172a", accent: "#f59e0b", title: "شرح مبسط", subtitle: "كل ما تحتاج معرفته", category: "تعليم" },
  { name: "تقنية", background: "#111827", accent: "#38bdf8", title: "أسرار التقنية", subtitle: "اكتشف الجديد", category: "تقنية" },
  { name: "ألعاب", background: "#312e81", accent: "#fb7185", title: "تحدي الألعاب", subtitle: "هل تستطيع الفوز؟", category: "ألعاب" },
  { name: "محتوى جذاب", background: "#7c2d12", accent: "#fbbf24", title: "لن تصدق النتيجة!", subtitle: "شاهد التفاصيل", category: "ترفيه" },
  { name: "أخبار عاجلة", background: "#991b1b", accent: "#fde047", title: "عاجل الآن", subtitle: "آخر التطورات", category: "أخبار" },
  { name: "طبخ", background: "#78350f", accent: "#fcd34d", title: "وصفة سهلة", subtitle: "في 10 دقائق فقط", category: "طبخ" },
  { name: "مالية", background: "#064e3b", accent: "#6ee7b7", title: "كيف تربح؟", subtitle: "استراتيجيات ذكية", category: "مالية" },
  { name: "رياضة", background: "#1e3a8a", accent: "#fbbf24", title: "أهداف لا تُنسى", subtitle: "أفضل اللقطات", category: "رياضة" },
];

const viralTitleTemplates = [
  "لن تصدق {keyword}!",
  "أسرار {keyword} التي يخفيها الجميع",
  "{keyword}: الدليل الشامل 2026",
  "جربت {keyword} لمدة 30 يومًا",
  "5 أخطاء في {keyword} يجب تجنبها",
  "كيف تتقن {keyword} في 7 أيام",
  "{keyword} للمبتدئين والمحترفين",
  "الحقيقة الكاملة عن {keyword}",
  "{keyword}: ما لم يخبرك به أحد",
  "أفضل {keyword} في العالم العربي",
];

function createLayer(text: string, id: number, y: number): TextLayer {
  return {
    id, text, x: WIDTH / 2, y, size: 76, color: "#ffffff",
    bold: true, stroke: true, shadow: true, align: "center",
    locked: false, visible: true, fontFamily: "Tajawal", rotation: 0,
  };
}

function analyzeContrast(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const [rs, gs, bs] = [r, g, b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export default function VideoThumbnailMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ pointerId: number; layerId: number; startX: number; startY: number; layerX: number; layerY: number } | null>(null);
  const cropDragRef = useRef<{ startX: number; startY: number; startRect: { x: number; y: number; width: number; height: number } } | null>(null);

  const [background, setBackground] = useState("#0f172a");
  const [accent, setAccent] = useState("#f59e0b");
  const [gradient, setGradient] = useState(true);
  const [photoMode, setPhotoMode] = useState(false);
  const [layers, setLayers] = useState<TextLayer[]>([
    { ...createLayer("عنوان الفيديو", 1, 320), size: 82 },
    { ...createLayer("اكتب عنواناً جذاباً", 2, 420), size: 42, color: "#fbbf24", stroke: false },
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [nextId, setNextId] = useState(3);
  const [status, setStatus] = useState("");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");

  // Video extraction
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Image filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);

  // Image transforms
  const [imageRotation, setImageRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  // Crop
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // History (Undo/Redo)
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Channel Identity
  const [identity, setIdentity] = useState<ChannelIdentity>({
    name: "", primaryColor: "#f59e0b", accentColor: "#0f172a",
  });
  const [showIdentityPanel, setShowIdentityPanel] = useState(false);

  // AI Assistant
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);

  const selectedLayer = layers.find((layer) => layer.id === selectedId) ?? null;

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      layers: JSON.parse(JSON.stringify(layers)),
      background, accent, gradient,
    };
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(newState);
      return next.slice(-30);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 29));
  }, [layers, background, accent, gradient, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setLayers(prevState.layers);
      setBackground(prevState.background);
      setAccent(prevState.accent);
      setGradient(prevState.gradient);
      setHistoryIndex((prev) => prev - 1);
      setStatus("تم التراجع ✓");
      setTimeout(() => setStatus(""), 1500);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setLayers(nextState.layers);
      setBackground(nextState.background);
      setAccent(nextState.accent);
      setGradient(nextState.gradient);
      setHistoryIndex((prev) => prev + 1);
      setStatus("تمت الإعادة ✓");
      setTimeout(() => setStatus(""), 1500);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    if (history.length === 0) saveToHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IDENTITY);
      if (saved) setIdentity(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_IDENTITY, JSON.stringify(identity)); } catch {}
  }, [identity]);

  const updateSelected = useCallback((changes: Partial<TextLayer>) => {
    setLayers((previous) =>
      previous.map((layer) => (layer.id === selectedId ? { ...layer, ...changes } : layer))
    );
  }, [selectedId]);

  const addText = () => {
    const layer = createLayer("نص جديد", nextId, 520);
    setLayers((prev) => [...prev, layer]);
    setSelectedId(nextId);
    setNextId((v) => v + 1);
    setTimeout(() => saveToHistory(), 0);
  };

  const duplicateLayer = () => {
    if (!selectedLayer) return;
    const newLayer = { ...selectedLayer, id: nextId, x: selectedLayer.x + 30, y: selectedLayer.y + 30, text: selectedLayer.text + " (نسخة)" };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(nextId);
    setNextId((v) => v + 1);
    setTimeout(() => saveToHistory(), 0);
  };

  const toggleLock = () => {
    if (!selectedLayer) return;
    updateSelected({ locked: !selectedLayer.locked });
    saveToHistory();
  };

  const toggleVisibility = () => {
    if (!selectedLayer) return;
    updateSelected({ visible: !selectedLayer.visible });
    saveToHistory();
  };

  const moveLayerUp = () => {
    if (!selectedLayer) return;
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === selectedId);
      if (idx < prev.length - 1) {
        const newLayers = [...prev];
        [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
        return newLayers;
      }
      return prev;
    });
    saveToHistory();
  };

  const moveLayerDown = () => {
    if (!selectedLayer) return;
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === selectedId);
      if (idx > 0) {
        const newLayers = [...prev];
        [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
        return newLayers;
      }
      return prev;
    });
    saveToHistory();
  };

  const removeSelected = () => {
    if (!selectedLayer) return;
    const remaining = layers.filter((l) => l.id !== selectedId);
    setLayers(remaining);
    setSelectedId(remaining.length > 0 ? remaining[remaining.length - 1].id : -1);
    saveToHistory();
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setBlur(0);
    setGrayscale(0);
    setStatus("✓ تم إعادة تعيين الفلاتر.");
  };

  const resetTransforms = () => {
    setImageRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setStatus("✓ تم إعادة تعيين التحويلات.");
  };

  const startCrop = () => {
    setIsCropMode(true);
    setCropRect({ x: 200, y: 100, width: 880, height: 520 });
    setStatus("اسحب منطقة القص لتعديلها، ثم اضغط 'تطبيق القص'.");
  };

  const applyCrop = () => {
    if (!cropRect || !imageRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = cropRect.width;
    canvas.height = cropRect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    const imageScale = Math.max(WIDTH / img.width, HEIGHT / img.height);
    const w = img.width * imageScale;
    const h = img.height * imageScale;
    const offsetX = (WIDTH - w) / 2;
    const offsetY = (HEIGHT - h) / 2;

    ctx.drawImage(
      img,
      (cropRect.x - offsetX) / imageScale,
      (cropRect.y - offsetY) / imageScale,
      cropRect.width / imageScale,
      cropRect.height / imageScale,
      0, 0, cropRect.width, cropRect.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const newImg = new Image();
    newImg.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = dataUrl;
      imageRef.current = newImg;
      setIsCropMode(false);
      setCropRect(null);
      setStatus("✓ تم قص الصورة بنجاح.");
    };
    newImg.src = dataUrl;
  };

  const cancelCrop = () => {
    setIsCropMode(false);
    setCropRect(null);
    setStatus("تم إلغاء عملية القص.");
  };

  const drawCanvas = useCallback((targetCanvas?: HTMLCanvasElement, includeSelection = true) => {
    const canvas = targetCanvas || canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    if (photoMode && imageRef.current) {
      const img = imageRef.current;
      const imageScale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const w = img.width * imageScale;
      const h = img.height * imageScale;

      // Apply filters
      const hasFilters = brightness !== 100 || contrast !== 100 || saturate !== 100 || blur > 0 || grayscale > 0;
      if (hasFilters) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px) grayscale(${grayscale}%)`;
      }

      // Apply transforms
      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT / 2);
      if (imageRotation !== 0) {
        ctx.rotate((imageRotation * Math.PI) / 180);
      }
      if (flipHorizontal) ctx.scale(-1, 1);
      if (flipVertical) ctx.scale(1, -1);
      ctx.translate(-WIDTH / 2, -HEIGHT / 2);

      ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
      ctx.restore();

      if (hasFilters) {
        ctx.filter = "none";
      }

      ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else {
      if (gradient) {
        const g = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        g.addColorStop(0, background);
        g.addColorStop(1, accent);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = background;
      }
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    // Decorative shapes
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(1100, 110, 230, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 650, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Accent strips
    ctx.fillStyle = accent;
    ctx.fillRect(0, HEIGHT - 14, WIDTH, 14);
    ctx.fillRect(0, 0, 18, HEIGHT);

    // Crop rectangle overlay
    if (isCropMode && cropRect) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, WIDTH, cropRect.y);
      ctx.fillRect(0, cropRect.y + cropRect.height, WIDTH, HEIGHT - cropRect.y - cropRect.height);
      ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.height);
      ctx.fillRect(cropRect.x + cropRect.width, cropRect.y, WIDTH - cropRect.x - cropRect.width, cropRect.height);

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

      ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
      ctx.fillRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
      ctx.restore();
    }

    // Text layers
    layers.forEach((layer) => {
      if (!layer.visible) return;
      ctx.save();
      ctx.font = `${layer.bold ? "900" : "500"} ${layer.size}px '${layer.fontFamily}', Arial, Tahoma, sans-serif`;
      ctx.textAlign = layer.align;
      ctx.textBaseline = "middle";
      ctx.direction = "rtl";

      if (layer.rotation !== 0) {
        ctx.translate(layer.x, layer.y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-layer.x, -layer.y);
      }

      if (layer.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.65)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 5;
      }
      if (layer.stroke) {
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(4, layer.size * 0.075);
        ctx.strokeStyle = "#111827";
        ctx.strokeText(layer.text, layer.x, layer.y, WIDTH - 100);
      }
      ctx.fillStyle = layer.color;
      ctx.fillText(layer.text, layer.x, layer.y, WIDTH - 100);

      if (includeSelection && layer.id === selectedId) {
        ctx.shadowColor = "transparent";
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.strokeRect(Math.max(24, layer.x - 340), layer.y - layer.size * 0.7, Math.min(680, WIDTH - 48), layer.size * 1.4);
      }
      ctx.restore();
    });
  }, [accent, background, gradient, layers, photoMode, selectedId, brightness, contrast, saturate, blur, grayscale, imageRotation, flipHorizontal, flipVertical, isCropMode, cropRect]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  useEffect(() => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;
    const tempCanvas = document.createElement("canvas");
    drawCanvas(tempCanvas, false);
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;
    previewCanvas.width = 320;
    previewCanvas.height = 180;
    ctx.drawImage(tempCanvas, 0, 0, 320, 180);
  }, [drawCanvas, layers, background, accent, photoMode]);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("يرجى اختيار ملف صورة صالح.");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      imageRef.current = img;
      setPhotoMode(true);
      setVideoUrl(null);
      setStatus("تم تحميل الصورة بنجاح.");
    };
    img.onerror = () => { URL.revokeObjectURL(url); setStatus("تعذر فتح الصورة."); };
    img.src = url;
    event.target.value = "";
  }

  function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setStatus("يرجى اختيار ملف فيديو صالح (MP4, WebM).");
      event.target.value = "";
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setPhotoMode(false);
    setStatus("تم تحميل الفيديو. حرك الشريط لاختيار اللقطة المثالية.");
    event.target.value = "";
  }

  function handleVideoTimeUpdate() {
    if (hiddenVideoRef.current) setVideoTime(hiddenVideoRef.current.currentTime);
  }

  function handleVideoLoadedMetadata() {
    if (hiddenVideoRef.current) setVideoDuration(hiddenVideoRef.current.duration);
  }

  function captureFrame() {
    if (!hiddenVideoRef.current) return;
    const video = hiddenVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const scale = Math.max(WIDTH / vWidth, HEIGHT / vHeight);
    const x = (WIDTH / 2) - (vWidth / 2) * scale;
    const y = (HEIGHT / 2) - (vHeight / 2) * scale;
    ctx.drawImage(video, x, y, vWidth * scale, vHeight * scale);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const img = new Image();
    img.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = dataUrl;
      imageRef.current = img;
      setPhotoMode(true);
      setVideoUrl(null);
      setStatus("تم التقاط الإطار بنجاح! يمكنك الآن إضافة النصوص.");
    };
    img.src = dataUrl;
  }

  function generateTitles() {
    if (!aiKeyword.trim()) {
      setStatus("اكتب كلمة مفتاحية أولاً.");
      return;
    }
    const suggestions = viralTitleTemplates
      .map(t => t.replace("{keyword}", aiKeyword))
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setAiSuggestions(suggestions);
  }

  function analyzeDesign() {
    const issues: string[] = [];
    const tips: string[] = [];
    let score = 100;

    const contrastRatio = analyzeContrast(background, layers[0]?.color || "#ffffff");
    if (contrastRatio < 3) {
      issues.push("تباين منخفض بين النص والخلفية");
      score -= 20;
    }

    layers.forEach(l => {
      if (l.size < 40) {
        issues.push(`النص "${l.text.slice(0, 20)}" صغير جداً`);
        score -= 10;
      }
      if (l.text.length > 60) {
        tips.push(`النص "${l.text.slice(0, 20)}..." طويل. اجعله أقصر.`);
        score -= 5;
      }
    });

    if (layers.length > 5) {
      tips.push("عدد النصوص كبير. قلل الازدحام.");
      score -= 10;
    }

    const hasStroke = layers.some(l => l.stroke);
    if (!hasStroke && photoMode) {
      tips.push("أضف حدوداً للنص لتحسين القراءة فوق الصورة.");
    }

    if (issues.length === 0 && tips.length === 0) {
      tips.push("التصميم ممتاز! جاهز للنشر.");
    }

    setAnalysis({ score: Math.max(0, score), issues, tips });
  }

  function generateVersions() {
    const versions = [
      { bg: "#0f172a", accent: "#f59e0b" },
      { bg: "#7c2d12", accent: "#fbbf24" },
      { bg: "#1e3a8a", accent: "#fde047" },
    ];

    const originalBg = background;
    const originalAccent = accent;

    versions.forEach((v, i) => {
      setTimeout(() => {
        setBackground(v.bg);
        setAccent(v.accent);

        setTimeout(() => {
          const tempCanvas = document.createElement("canvas");
          drawCanvas(tempCanvas, false);
          tempCanvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `thumbnail-version-${i + 1}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          });
        }, 200);
      }, i * 500);
    });

    setTimeout(() => {
      setBackground(originalBg);
      setAccent(originalAccent);
      setStatus("تم تنزيل 3 نسخ بألوان مختلفة.");
    }, versions.length * 500 + 500);
  }

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;

    // Crop mode dragging
    if (isCropMode && cropRect) {
      const inCropArea = x >= cropRect.x && x <= cropRect.x + cropRect.width &&
                         y >= cropRect.y && y <= cropRect.y + cropRect.height;
      if (inCropArea) {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        cropDragRef.current = { startX: x, startY: y, startRect: { ...cropRect } };
        return;
      }
    }

    const hitLayer = [...layers].reverse().find((layer) => {
      if (layer.locked || !layer.visible) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      ctx.font = `${layer.bold ? "900" : "500"} ${layer.size}px '${layer.fontFamily}', Arial, sans-serif`;
      const measured = ctx.measureText(layer.text).width;
      const halfWidth = Math.max(45, Math.min(measured / 2 + 24, 600));
      const halfHeight = Math.max(28, layer.size * 0.85);
      return x >= layer.x - halfWidth && x <= layer.x + halfWidth && y >= layer.y - halfHeight && y <= layer.y + halfHeight;
    });

    if (!hitLayer) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(hitLayer.id);
    dragRef.current = {
      pointerId: event.pointerId, layerId: hitLayer.id,
      startX: x, startY: y, layerX: hitLayer.x, layerY: hitLayer.y,
    };
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    // Crop mode dragging
    if (cropDragRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
      const dx = x - cropDragRef.current.startX;
      const dy = y - cropDragRef.current.startY;
      const newRect = {
        x: Math.max(0, Math.min(WIDTH - cropDragRef.current.startRect.width, cropDragRef.current.startRect.x + dx)),
        y: Math.max(0, Math.min(HEIGHT - cropDragRef.current.startRect.height, cropDragRef.current.startRect.y + dy)),
        width: cropDragRef.current.startRect.width,
        height: cropDragRef.current.startRect.height,
      };
      setCropRect(newRect);
      return;
    }

    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas || drag.pointerId !== event.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    const nextX = Math.max(30, Math.min(WIDTH - 30, drag.layerX + x - drag.startX));
    const nextY = Math.max(30, Math.min(HEIGHT - 30, drag.layerY + y - drag.startY));
    setLayers((prev) => prev.map((l) => l.id === drag.layerId ? { ...l, x: nextX, y: nextY } : l));
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (cropDragRef.current) {
      cropDragRef.current = null;
      return;
    }
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      saveToHistory();
    }
  }

  function applyTemplate(template: Template) {
    setBackground(template.background);
    setAccent(template.accent);
    setGradient(true);
    setPhotoMode(false);
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    imageRef.current = null;
    const first = { ...createLayer(template.title, nextId, 315), size: 82, color: "#ffffff" };
    const second = { ...createLayer(template.subtitle, nextId + 1, 420), size: 42, color: template.accent, stroke: false };
    setLayers([first, second]);
    setSelectedId(nextId);
    setNextId((v) => v + 2);
    setStatus(`تم تطبيق قالب "${template.name}".`);
    setTimeout(() => saveToHistory(), 0);
  }

  function resetDesign() {
    setBackground("#0f172a");
    setAccent("#f59e0b");
    setGradient(true);
    setPhotoMode(false);
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    imageRef.current = null;
    setVideoUrl(null);
    resetFilters();
    resetTransforms();
    setIsCropMode(false);
    setCropRect(null);
    setLayers([
      { ...createLayer("عنوان الفيديو", 1, 320), size: 82 },
      { ...createLayer("اكتب عنواناً جذاباً", 2, 420), size: 42, color: "#fbbf24", stroke: false },
    ]);
    setSelectedId(1);
    setNextId(3);
    setStatus("تمت إعادة التصميم.");
    setTimeout(() => saveToHistory(), 0);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const format = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const quality = outputFormat === "jpeg" ? 0.94 : undefined;
    drawCanvas(canvas, false);
    canvas.toBlob((blob) => {
      drawCanvas(canvas, true);
      if (!blob) { setStatus("تعذر إنشاء الملف."); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outputFormat === "jpeg" ? "intooly-thumbnail.jpg" : "intooly-thumbnail.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("تم التنزيل بنجاح ✓");
    }, format, quality);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-ink-50 text-ink-900 transition-colors duration-300">
      <video ref={hiddenVideoRef} src={videoUrl || undefined} className="hidden" crossOrigin="anonymous"
        onTimeUpdate={handleVideoTimeUpdate} onLoadedMetadata={handleVideoLoadedMetadata} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-ink-500">
          <a href="/tools/video" className="font-medium transition hover:text-brand-600">أدوات الفيديو</a>
          <span className="mx-2">/</span>
          <span className="text-ink-700">إنشاء صور مصغّرة للفيديو</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
            <Sparkles size={16} />
            أداة احترافية مجانية ومحلية 100%
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            إنشاء صور مصغّرة للفيديو مجانًا
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
            صمّم صوراً مصغّرة احترافية لفيديوهات YouTube. <strong>استخرج لقطات مباشرة من الفيديو</strong>، أضف عناوين عربية جذابة، وخصص كل شيء. كل المعالجة تتم داخل متصفحك.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["مجاني", "بدون تسجيل", "معالجة محلية 100%", "استخراج من فيديو", "قص الصور", "تدوير الصور", "فلاتر الصور", "Undo/Redo"].map((item) => (
              <span key={item} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600">
                ✓ {item}
              </span>
            ))}
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-5 py-4 bg-gradient-to-l from-brand-50 via-white to-amber-50">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-brand-100 p-2 text-brand-600">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="font-bold text-ink-900">محرر الصور المصغّرة المتقدم</h2>
                <p className="text-xs text-ink-500">مقاس 1280 × 720 بكسل • Ctrl+Z للتراجع • Ctrl+Y للإعادة</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={undo} disabled={historyIndex <= 0} title="تراجع (Ctrl+Z)"
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:bg-ink-50 disabled:opacity-40">
                <Undo2 size={16} /> تراجع
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} title="إعادة (Ctrl+Y)"
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:bg-ink-50 disabled:opacity-40">
                <Redo2 size={16} /> إعادة
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50">
                <ImagePlus size={16} /> صورة
              </button>
              <button onClick={() => videoInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50">
                <Film size={16} /> فيديو
              </button>
              {photoMode && !isCropMode && (
                <button onClick={startCrop}
                  className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50">
                  <Scissors size={16} /> قص
                </button>
              )}
              {isCropMode && (
                <>
                  <button onClick={applyCrop}
                    className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-green-700">
                    <Check size={16} /> تطبيق
                  </button>
                  <button onClick={cancelCrop}
                    className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:bg-ink-50">
                    <X size={16} /> إلغاء
                  </button>
                </>
              )}
              <button onClick={() => setShowIdentityPanel(!showIdentityPanel)}
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50">
                <Save size={16} /> هوية القناة
              </button>
              <button onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50">
                <Lightbulb size={16} /> مساعد AI
              </button>
              <button onClick={addText}
                className="inline-flex items-center gap-1 rounded-xl bg-brand-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-brand-600">
                <Plus size={17} /> نص
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="hidden" />
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 bg-ink-50 p-4 sm:p-6 lg:sticky lg:top-24 lg:self-start">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lg">
                <canvas ref={canvasRef} width={WIDTH} height={HEIGHT}
                  className="block h-auto w-full touch-none" style={{ aspectRatio: "16 / 9", cursor: "grab" }}
                  onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp} onPointerCancel={handleCanvasPointerUp}
                  onLostPointerCapture={handleCanvasPointerUp} />
              </div>

              {videoUrl && (
                <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2">
                      <Film size={16} /> استخراج إطار من الفيديو
                    </h4>
                    <span className="text-xs text-brand-600">{videoTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
                  </div>
                  <input type="range" min="0" max={videoDuration || 100} step="0.1" value={videoTime}
                    onChange={(e) => { const t = parseFloat(e.target.value); setVideoTime(t); if (hiddenVideoRef.current) hiddenVideoRef.current.currentTime = t; }}
                    className="w-full accent-brand-600 mb-3" />
                  <button onClick={captureFrame}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                    <Check size={18} /> التقاط هذه اللقطة كخلفية
                  </button>
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-4">
                <h4 className="text-sm font-bold text-ink-900 mb-2 flex items-center gap-2">
                  <Monitor size={16} /> معاينة YouTube (كيف ستبدو فعلياً)
                </h4>
                <div className="bg-ink-900 rounded-xl p-3">
                  <canvas ref={previewCanvasRef} className="w-full rounded-lg" style={{ aspectRatio: "16/9" }} />
                  <div className="mt-2 text-xs text-ink-300">
                    <p className="font-bold text-white truncate">{selectedLayer?.text || "عنوان الفيديو"}</p>
                    <p className="text-ink-400">Intooly Channel • 10K views • 2 days ago</p>
                  </div>
                </div>
              </div>

              {status && (
                <div className={`mt-4 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${status.includes("✓") ? "bg-green-50 text-green-800 border border-green-200" : "bg-brand-50 text-brand-800 border border-brand-200"}`}>
                  {status.includes("✓") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status}
                </div>
              )}
            </div>

            <aside className="space-y-5 border-t border-ink-200 p-5 lg:border-r lg:border-t-0 overflow-y-auto max-h-[calc(100vh-120px)]">

              {showIdentityPanel && (
                <section className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-brand-800">
                    <Save size={18} /> هوية القناة (محفوظة محلياً)
                  </h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="اسم القناة" value={identity.name}
                      onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                      className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs">
                        <span className="block mb-1">اللون الأساسي</span>
                        <input type="color" value={identity.primaryColor}
                          onChange={(e) => setIdentity({ ...identity, primaryColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer" />
                      </label>
                      <label className="text-xs">
                        <span className="block mb-1">اللون المميز</span>
                        <input type="color" value={identity.accentColor}
                          onChange={(e) => setIdentity({ ...identity, accentColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer" />
                      </label>
                    </div>
                    <p className="text-xs text-brand-700">✓ يتم الحفظ تلقائياً في متصفحك</p>
                  </div>
                </section>
              )}

              {showAIAssistant && (
                <section className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-purple-800">
                    <Lightbulb size={18} /> مساعد الذكاء الاصطناعي
                  </h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="كلمة مفتاحية (مثال: الربح من الإنترنت)"
                      value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)}
                      className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm" />
                    <button onClick={generateTitles}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-sm transition">
                      اقتراح عناوين فيرال
                    </button>
                    {aiSuggestions.length > 0 && (
                      <div className="space-y-2">
                        {aiSuggestions.map((s, i) => (
                          <button key={i} onClick={() => { if (selectedLayer) updateSelected({ text: s }); }}
                            className="w-full text-right text-xs bg-white border border-purple-200 rounded-lg p-2 hover:bg-purple-100 transition">
                            💡 {s}
                          </button>
                        ))}
                      </div>
                    )}
                    <button onClick={analyzeDesign}
                      className="w-full py-2 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> تحليل التصميم
                    </button>
                    {analysis && (
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">النتيجة:</span>
                          <span className={`text-lg font-black ${analysis.score >= 80 ? "text-green-600" : analysis.score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {analysis.score}/100
                          </span>
                        </div>
                        {analysis.issues.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-red-700 mb-1">⚠️ مشاكل:</p>
                            <ul className="text-xs text-red-600 space-y-1">
                              {analysis.issues.map((i, idx) => <li key={idx}>• {i}</li>)}
                            </ul>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-green-700 mb-1">💡 نصائح:</p>
                          <ul className="text-xs text-green-700 space-y-1">
                            {analysis.tips.map((t, idx) => <li key={idx}>• {t}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <Palette size={18} className="text-brand-600" /> الخلفية والألوان
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className="mb-1 block text-ink-600 text-xs">الخلفية</span>
                    <input type="color" value={background} onChange={(e) => { setBackground(e.target.value); setPhotoMode(false); }}
                      className="h-9 w-full cursor-pointer rounded border border-ink-200" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-ink-600 text-xs">المميز</span>
                    <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
                      className="h-9 w-full cursor-pointer rounded border border-ink-200" />
                  </label>
                </div>
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-ink-700">
                  <input type="checkbox" checked={gradient} onChange={(e) => { setGradient(e.target.checked); setPhotoMode(false); }} className="accent-brand-500" />
                  خلفية متدرجة
                </label>
              </section>

              {photoMode && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 font-bold">
                    <RotateCw size={18} className="text-brand-600" />
                    تدوير وقلب الصورة
                  </h3>
                  <div className="space-y-3">
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>🔄 التدوير</span>
                        <span>{imageRotation}°</span>
                      </span>
                      <input type="range" min="-180" max="180" value={imageRotation}
                        onChange={(e) => setImageRotation(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setFlipHorizontal(!flipHorizontal)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1 ${flipHorizontal ? 'bg-brand-500 text-white border-brand-500' : 'text-ink-700 border-ink-200 hover:bg-ink-50'}`}>
                        <FlipHorizontal2 size={14} /> قلب أفقي
                      </button>
                      <button type="button" onClick={() => setFlipVertical(!flipVertical)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition flex items-center justify-center gap-1 ${flipVertical ? 'bg-brand-500 text-white border-brand-500' : 'text-ink-700 border-ink-200 hover:bg-ink-50'}`}>
                        <FlipVertical2 size={14} /> قلب رأسي
                      </button>
                    </div>
                    <button type="button" onClick={resetTransforms}
                      className="w-full py-2 text-xs font-semibold text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-50 transition">
                      ↺ إعادة تعيين التحويلات
                    </button>
                  </div>
                </section>
              )}

              {photoMode && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 font-bold">
                    <SlidersHorizontal size={18} className="text-brand-600" />
                    فلاتر الصورة
                  </h3>
                  <div className="space-y-3">
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>☀️ السطوع</span>
                        <span>{brightness}%</span>
                      </span>
                      <input type="range" min="0" max="200" value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>◐ التباين</span>
                        <span>{contrast}%</span>
                      </span>
                      <input type="range" min="0" max="200" value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>🎨 التشبع</span>
                        <span>{saturate}%</span>
                      </span>
                      <input type="range" min="0" max="200" value={saturate}
                        onChange={(e) => setSaturate(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>💧 الضبابية</span>
                        <span>{blur}px</span>
                      </span>
                      <input type="range" min="0" max="20" value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <label className="block text-xs">
                      <span className="mb-1 flex justify-between text-ink-600">
                        <span>⚫ التدرج الرمادي</span>
                        <span>{grayscale}%</span>
                      </span>
                      <input type="range" min="0" max="100" value={grayscale}
                        onChange={(e) => setGrayscale(Number(e.target.value))}
                        className="w-full accent-brand-500" />
                    </label>
                    <button type="button" onClick={resetFilters}
                      className="w-full py-2 text-xs font-semibold text-ink-700 border border-ink-200 rounded-lg hover:bg-ink-50 transition">
                      ↺ إعادة تعيين الفلاتر
                    </button>
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <Layers size={18} className="text-brand-600" /> الطبقات ({layers.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...layers].reverse().map((layer) => (
                    <button key={layer.id} onClick={() => setSelectedId(layer.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-right text-xs transition ${
                        layer.id === selectedId ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:bg-ink-50"
                      }`}>
                      <span className="min-w-0 truncate flex-1">{layer.text || "نص فارغ"}</span>
                      <div className="flex gap-1">
                        {layer.locked && <Lock size={12} className="text-amber-600" />}
                        {!layer.visible && <EyeOff size={12} className="text-ink-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {selectedLayer && (
                <section className="rounded-xl border border-ink-200 bg-ink-50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold">تعديل الطبقة</h4>
                    <div className="flex gap-1">
                      <button onClick={toggleLock} title={selectedLayer.locked ? "فتح" : "قفل"}
                        className="p-1.5 rounded hover:bg-ink-200 transition">
                        {selectedLayer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      <button onClick={toggleVisibility} title="إظهار/إخفاء"
                        className="p-1.5 rounded hover:bg-ink-200 transition">
                        {selectedLayer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={duplicateLayer} title="نسخ"
                        className="p-1.5 rounded hover:bg-ink-200 transition">
                        <Copy size={14} />
                      </button>
                      <button onClick={moveLayerUp} title="لأعلى"
                        className="p-1.5 rounded hover:bg-ink-200 transition">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={moveLayerDown} title="لأسفل"
                        className="p-1.5 rounded hover:bg-ink-200 transition">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea value={selectedLayer.text} onChange={(e) => updateSelected({ text: e.target.value })}
                    rows={2} maxLength={140}
                    className="w-full resize-y rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-sm" />
                  <div>
                    <span className="text-xs text-ink-600">الحجم: {selectedLayer.size}px</span>
                    <input type="range" min="20" max="150" value={selectedLayer.size}
                      onChange={(e) => updateSelected({ size: Number(e.target.value) })}
                      className="w-full accent-brand-500" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-600">الدوران: {selectedLayer.rotation}°</span>
                    <input type="range" min="-45" max="45" value={selectedLayer.rotation}
                      onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                      className="w-full accent-brand-500" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-600 block mb-1">الخط</span>
                    <select value={selectedLayer.fontFamily}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="w-full rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-sm">
                      {ARABIC_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-600">اللون</span>
                    <input type="color" value={selectedLayer.color} onChange={(e) => updateSelected({ color: e.target.value })}
                      className="h-7 w-10 cursor-pointer rounded border-0" />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["right", "center", "left"] as const).map((align) => {
                      const Icon = align === "right" ? AlignRight : align === "center" ? AlignCenter : AlignLeft;
                      return (
                        <button key={align} onClick={() => updateSelected({ align })}
                          className={`p-1.5 rounded border transition ${selectedLayer.align === align ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:bg-ink-50"}`}>
                          <Icon size={14} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={selectedLayer.bold} onChange={(e) => updateSelected({ bold: e.target.checked })} className="accent-brand-500" />
                      عريض
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={selectedLayer.stroke} onChange={(e) => updateSelected({ stroke: e.target.checked })} className="accent-brand-500" />
                      حدود
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={selectedLayer.shadow} onChange={(e) => updateSelected({ shadow: e.target.checked })} className="accent-brand-500" />
                      ظل
                    </label>
                  </div>
                  <button onClick={removeSelected}
                    className="w-full py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition flex items-center justify-center gap-1">
                    <Trash2 size={12} /> حذف
                  </button>
                </section>
              )}

              <section>
                <h3 className="mb-3 font-bold text-sm">قوالب جاهزة</h3>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {templates.map((t) => (
                    <button key={t.name} onClick={() => applyTemplate(t)}
                      className="group overflow-hidden rounded-lg border border-ink-200 text-right transition hover:border-brand-400 hover:shadow-md bg-white">
                      <span className="flex aspect-video items-center justify-center px-1 text-center text-[10px] font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${t.background}, ${t.accent})` }}>
                        {t.title}
                      </span>
                      <span className="block px-1 py-1 text-[10px] font-medium text-ink-700">{t.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-bold text-sm">التصدير</h3>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as "png" | "jpeg")}
                  className="w-full mb-2 rounded-lg border border-ink-200 bg-white px-2 py-2 text-sm">
                  <option value="png">PNG — جودة عالية</option>
                  <option value="jpeg">JPG — حجم أصغر</option>
                </select>
                <button onClick={downloadImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600">
                  <Download size={18} /> تنزيل الصورة
                </button>
                <button onClick={generateVersions}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
                  <Copy size={14} /> توليد 3 نسخ بألوان مختلفة
                </button>
                <button onClick={resetDesign}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
                  <RotateCcw size={14} /> إعادة التصميم
                </button>
              </section>
            </aside>
          </div>
        </section>

        <section className="mt-12 space-y-8 text-right max-w-4xl mx-auto">
          <article>
            <h2 className="text-2xl font-extrabold text-ink-900">ما أداة إنشاء الصور المصغّرة للفيديو من Intooly؟</h2>
            <p className="mt-3 leading-8 text-ink-700">
              أداة إنشاء الصور المصغّرة للفيديو من Intooly هي محرر احترافي متكامل يساعدك على تصميم صور معاينة لفيديوهات YouTube ومحتواك المرئي. تتميز الأداة بقدرات متقدمة: <strong>استخراج لقطات مباشرة من الفيديو</strong>، <strong>فلاتر صور احترافية</strong>، <strong>قص وتدوير الصور</strong>، <strong>نظام طبقات متقدم</strong> مع Undo/Redo، ومساعد ذكي لاقتراح العناوين الفيرال وتحليل تصميمك.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-ink-900">الميزات الاحترافية</h2>
            <div className="grid gap-3 md:grid-cols-2 mt-4">
              {[
                { icon: "🎬", title: "استخراج من الفيديو", desc: "ارفع فيديو واختر اللقطة المثالية مباشرة" },
                { icon: "✂️", title: "قص الصور", desc: "اختر منطقة محددة من الخلفية وقصها" },
                { icon: "🔄", title: "تدوير وقلب", desc: "تدوير الخلفية بأي زاوية وقلب أفقي/رأسي" },
                { icon: "🎨", title: "فلاتر الصور", desc: "السطوع، التباين، التشبع، الضبابية، والتدرج الرمادي" },
                { icon: "↩️", title: "Undo/Redo", desc: "تراجع وإعادة مع اختصارات لوحة المفاتيح" },
                { icon: "🔒", title: "قفل الطبقات", desc: "اقفل النصوص لمنع تحريكها بالخطأ" },
                { icon: "📺", title: "معاينة YouTube", desc: "شاهد كيف ستبدو على YouTube فعلياً" },
                { icon: "💡", title: "مولد عناوين AI", desc: "اقتراحات عناوين فيرال محلية" },
                { icon: "📊", title: "تحليل التصميم", desc: "فحص التباين والوضوح والازدحام" },
                { icon: "🎨", title: "هوية القناة", desc: "احفظ ألوانك محلياً" },
              ].map((f, i) => (
                <div key={i} className="border rounded-xl p-3 bg-ink-50 border-ink-200 text-right">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6">
            <h2 className="text-xl font-extrabold text-ink-900 mb-3">🔒 الخصوصية والأمان</h2>
            <p className="text-sm leading-8 text-ink-700">
              جميع عمليات المعالجة تتم <strong>محلياً داخل متصفحك</strong>. لا يتم رفع صورك أو فيديوهاتك إلى أي خادم خارجي. هوية قناتك تُحفظ محلياً في متصفحك فقط.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-ink-900">الأسئلة الشائعة</h2>
            <div className="mt-4 space-y-3">
              {[
                { q: "هل يمكن استخراج صورة من فيديو لاستخدامها كخلفية؟", a: "نعم، هذه ميزة حصرية. ارفع الفيديو، استخدم الشريط الزمني للوصول للقطة المطلوبة، واضغط 'التقاط' لتحويلها فوراً إلى خلفية قابلة للتحرير." },
                { q: "هل يمكن قص الخلفية؟", a: "نعم، اضغط على زر 'قص' عند وجود خلفية، اسحب منطقة القص لتعديلها، ثم اضغط 'تطبيق'." },
                { q: "هل يمكن تطبيق فلاتر على الخلفية؟", a: "نعم، يمكنك تعديل السطوع، التباين، التشبع، الضبابية، والتدرج الرمادي للخلفية لتحسين مظهرها قبل إضافة النصوص." },
                { q: "هل الأداة مجانية بالكامل؟", a: "نعم، جميع الميزات متاحة مجاناً بدون علامات مائية أو قيود." },
                { q: "هل تعمل على الهاتف؟", a: "نعم، الأداة متجاوبة 100% وتعمل على الهواتف والأجهزة اللوحية." },
              ].map((item, i) => (
                <details key={i} className="group rounded-xl border border-ink-200 bg-white p-4 open:border-brand-200 open:bg-brand-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-ink-900 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-brand-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-ink-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}