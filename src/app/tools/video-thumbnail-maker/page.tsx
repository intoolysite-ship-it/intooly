"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  ImagePlus,
  Type,
  Download,
  Trash2,
  Plus,
  RotateCcw,
  Palette,
  Layers,
  Sparkles,
  Upload,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Move,
  Check,
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
};

type Template = {
  name: string;
  background: string;
  accent: string;
  title: string;
  subtitle: string;
};

const WIDTH = 1280;
const HEIGHT = 720;

const templates: Template[] = [
  {
    name: "شرح تعليمي",
    background: "#0f172a",
    accent: "#f59e0b",
    title: "شرح مبسط",
    subtitle: "كل ما تحتاج معرفته",
  },
  {
    name: "تقنية",
    background: "#111827",
    accent: "#38bdf8",
    title: "أسرار التقنية",
    subtitle: "اكتشف الجديد",
  },
  {
    name: "ألعاب",
    background: "#312e81",
    accent: "#fb7185",
    title: "تحدي الألعاب",
    subtitle: "هل تستطيع الفوز؟",
  },
  {
    name: "محتوى جذاب",
    background: "#7c2d12",
    accent: "#fbbf24",
    title: "لن تصدق النتيجة!",
    subtitle: "شاهد التفاصيل",
  },
];

function createLayer(text: string, id: number, y: number): TextLayer {
  return {
    id,
    text,
    x: WIDTH / 2,
    y,
    size: 76,
    color: "#ffffff",
    bold: true,
    stroke: true,
    shadow: true,
    align: "center",
  };
}

export default function VideoThumbnailMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ pointerId: number; layerId: number; startX: number; startY: number; layerX: number; layerY: number } | null>(null);

  const [background, setBackground] = useState("#0f172a");
  const [accent, setAccent] = useState("#f59e0b");
  const [gradient, setGradient] = useState(true);
  const [photoMode, setPhotoMode] = useState(false);
  const [layers, setLayers] = useState<TextLayer[]>([
    {
      ...createLayer("عنوان الفيديو", 1, 320),
      size: 82,
    },
    {
      ...createLayer("اكتب عنواناً جذاباً", 2, 420),
      size: 42,
      color: "#fbbf24",
      stroke: false,
    },
  ]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [nextId, setNextId] = useState(3);
  const [status, setStatus] = useState("");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(1);

  const selectedLayer =
    layers.find((layer) => layer.id === selectedId) ?? null;

  const updateSelected = useCallback(
    (changes: Partial<TextLayer>) => {
      setLayers((previous) =>
        previous.map((layer) =>
          layer.id === selectedId ? { ...layer, ...changes } : layer
        )
      );
    },
    [selectedId]
  );

  const drawCanvas = useCallback((includeSelection = true) => {
    const canvas = canvasRef.current;
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
      ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);

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

    // Accent strip
    ctx.fillStyle = accent;
    ctx.fillRect(0, HEIGHT - 14, WIDTH, 14);
    ctx.fillRect(0, 0, 18, HEIGHT);

    // Text layers
    layers.forEach((layer) => {
      ctx.save();
      ctx.font = `${layer.bold ? "900" : "500"} ${layer.size}px Arial, Tahoma, sans-serif`;
      ctx.textAlign = layer.align;
      ctx.textBaseline = "middle";
      ctx.direction = "rtl";

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

      // Selection indicator is not included in downloads.
      if (includeSelection && layer.id === selectedId) {
        ctx.shadowColor = "transparent";
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.strokeRect(
          Math.max(24, layer.x - 340),
          layer.y - layer.size * 0.7,
          Math.min(680, WIDTH - 48),
          layer.size * 1.4
        );
      }

      ctx.restore();
    });
  }, [accent, background, gradient, layers, photoMode, selectedId]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("يرجى اختيار ملف صورة صالح.");
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setStatus("حجم الصورة يتجاوز 20 ميجابايت.");
      event.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = url;
      imageRef.current = img;
      setPhotoMode(true);
      setStatus("تم تحميل الصورة بنجاح.");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setStatus("تعذر فتح الصورة. جرّب صورة أخرى.");
    };

    img.src = url;
    event.target.value = "";
  }

  function removeBackground() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    imageRef.current = null;
    setPhotoMode(false);
    setStatus("تم حذف صورة الخلفية. يمكنك اختيار صورة جديدة أو استخدام خلفية لونية.");
  }

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // البحث عن أقرب طبقة نصية من الأعلى إلى الأسفل.
    const hitLayer = [...layers].reverse().find((layer) => {
      ctx.font = `${layer.bold ? "900" : "500"} ${layer.size}px Arial, Tahoma, sans-serif`;
      const measured = ctx.measureText(layer.text).width;
      const halfWidth = Math.max(45, Math.min(measured / 2 + 24, 600));
      const halfHeight = Math.max(28, layer.size * 0.85);
      return (
        x >= layer.x - halfWidth &&
        x <= layer.x + halfWidth &&
        y >= layer.y - halfHeight &&
        y <= layer.y + halfHeight
      );
    });

    if (!hitLayer) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(hitLayer.id);

    dragRef.current = {
      pointerId: event.pointerId,
      layerId: hitLayer.id,
      startX: x,
      startY: y,
      layerX: hitLayer.x,
      layerY: hitLayer.y,
    };
  }

  function handleCanvasPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;

    if (!drag || !canvas || drag.pointerId !== event.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * HEIGHT;

    const nextX = Math.max(30, Math.min(WIDTH - 30, drag.layerX + x - drag.startX));
    const nextY = Math.max(30, Math.min(HEIGHT - 30, drag.layerY + y - drag.startY));

    setLayers((previous) =>
      previous.map((layer) =>
        layer.id === drag.layerId
          ? { ...layer, x: nextX, y: nextY }
          : layer
      )
    );
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  function addText() {
    const layer = createLayer("نص جديد", nextId, 520);
    setLayers((previous) => [...previous, layer]);
    setSelectedId(nextId);
    setNextId((value) => value + 1);
  }

  function removeSelected() {
    if (!selectedLayer) return;

    const remaining = layers.filter((layer) => layer.id !== selectedId);
    setLayers(remaining);

    if (remaining.length > 0) {
      setSelectedId(remaining[remaining.length - 1].id);
    } else {
      setSelectedId(-1);
    }
  }

  function applyTemplate(template: Template) {
    setBackground(template.background);
    setAccent(template.accent);
    setGradient(true);
    setPhotoMode(false);
    imageRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const first = {
      ...createLayer(template.title, nextId, 315),
      size: 82,
      color: "#ffffff",
    };
    const second = {
      ...createLayer(template.subtitle, nextId + 1, 420),
      size: 42,
      color: template.accent,
      stroke: false,
    };

    setLayers([first, second]);
    setSelectedId(nextId);
    setNextId((value) => value + 2);
    setStatus(`تم تطبيق قالب ${template.name}.`);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const format = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const quality = outputFormat === "jpeg" ? 0.94 : undefined;

    // إعادة الرسم دون إطار التحديد قبل أخذ نسخة التصدير.
    drawCanvas(false);

    canvas.toBlob(
      (blob) => {
        // إعادة المعاينة إلى وضع التحرير سواء نجح التصدير أم لا.
        drawCanvas(true);

        if (!blob) {
          setStatus("تعذر إنشاء الملف. حاول مرة أخرى.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          outputFormat === "jpeg"
            ? "intooly-video-thumbnail.jpg"
            : "intooly-video-thumbnail.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus("تم تنزيل الصورة بنجاح بمقاس 1280 × 720.");
      },
      format,
      quality
    );
  }

  function resetDesign() {
    setBackground("#0f172a");
    setAccent("#f59e0b");
    setGradient(true);
    setPhotoMode(false);
    imageRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLayers([
      createLayer("عنوان الفيديو", 1, 320),
      {
        ...createLayer("اكتب عنواناً جذاباً", 2, 420),
        size: 42,
        color: "#fbbf24",
        stroke: false,
      },
    ]);
    setSelectedId(1);
    setNextId(3);
    setStatus("تمت إعادة التصميم إلى الوضع الافتراضي.");
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="مسار التنقل"
          className="mb-5 text-sm text-slate-500"
        >
          <a
            href="/tools/video"
            className="font-medium transition hover:text-orange-600"
          >
            أدوات الفيديو
          </a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">إنشاء صور مصغّرة للفيديو</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Sparkles size={16} />
            أداة تصميم مجانية
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            إنشاء صور مصغّرة للفيديو مجانًا
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            صمّم صورة مصغّرة جذابة لفيديوهات YouTube بسهولة. أضف صورتك
            وعناوينك، وخصص الألوان والخطوط والخلفيات، ثم نزّل التصميم بجودة
            عالية بمقاس 1280×720 بكسل. تتم معالجة الصور داخل متصفحك دون رفعها
            إلى خادم.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "مجاني",
              "بدون تسجيل",
              "معالجة محلية",
              "مقاس YouTube",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                ✓ {item}
              </span>
            ))}
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-orange-100 p-2 text-orange-700">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">محرر الصورة المصغّرة</h2>
                <p className="text-xs text-slate-500">
                  مقاس التصميم 1280 × 720 بكسل
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-orange-400 hover:bg-orange-50"
              >
                <Upload size={16} />
                {photoMode ? "استبدال الصورة" : "رفع صورة"}
              </button>

              {photoMode && (
                <button
                  type="button"
                  onClick={removeBackground}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  حذف الخلفية
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                aria-label="اختر صورة للخلفية"
              />

              <button
                type="button"
                onClick={addText}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                <Plus size={17} />
                إضافة نص
              </button>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 bg-slate-100 p-4 sm:p-7 lg:sticky lg:top-24 lg:self-start">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <canvas
                  ref={canvasRef}
                  width={WIDTH}
                  height={HEIGHT}
                  aria-label="معاينة تصميم الصورة المصغرة. اسحب النص لتحريكه."
                  className="block h-auto w-full touch-none"
                  style={{ aspectRatio: "16 / 9", cursor: "grab" }}
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  onPointerCancel={handleCanvasPointerUp}
                  onLostPointerCapture={handleCanvasPointerUp}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>المقاس النهائي: 1280 × 720 بكسل</span>
                <span>النسبة: 16:9</span>
                <span className="w-full text-orange-700">يمكنك تحديد النص وسحبه مباشرة داخل المعاينة لتحريكه.</span>
              </div>

              {status && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
                >
                  {status}
                </p>
              )}
            </div>

            <aside className="space-y-6 border-t border-slate-200 p-5 lg:border-r lg:border-t-0">
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <Palette size={18} className="text-orange-600" />
                  الخلفية والألوان
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    <span className="mb-2 block text-slate-600">لون الخلفية</span>
                    <span className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => {
                          setBackground(e.target.value);
                          setPhotoMode(false);
                        }}
                        className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                        aria-label="لون الخلفية"
                      />
                      <span className="text-xs text-slate-500">{background}</span>
                    </span>
                  </label>

                  <label className="text-sm">
                    <span className="mb-2 block text-slate-600">اللون المميز</span>
                    <span className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                      <input
                        type="color"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                        aria-label="اللون المميز"
                      />
                      <span className="text-xs text-slate-500">{accent}</span>
                    </span>
                  </label>
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={gradient}
                    onChange={(e) => {
                      setGradient(e.target.checked);
                      setPhotoMode(false);
                    }}
                    className="accent-orange-600"
                  />
                  استخدام خلفية متدرجة
                </label>
              </section>

              <section>
                <h3 className="mb-3 flex items-center gap-2 font-bold">
                  <Type size={18} className="text-orange-600" />
                  النصوص
                </h3>

                {layers.length > 0 ? (
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <button
                        type="button"
                        key={layer.id}
                        onClick={() => setSelectedId(layer.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-right text-sm transition ${
                          layer.id === selectedId
                            ? "border-orange-400 bg-orange-50 text-orange-800"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="min-w-0 truncate">
                          {layer.text || "نص فارغ"}
                        </span>
                        {layer.id === selectedId && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    أضف نصًا لبدء التصميم.
                  </p>
                )}

                {selectedLayer && (
                  <div className="mt-4 space-y-4">
                    <label className="block text-sm">
                      <span className="mb-2 block font-medium text-slate-600">
                        محتوى النص
                      </span>
                      <textarea
                        value={selectedLayer.text}
                        onChange={(e) => updateSelected({ text: e.target.value })}
                        rows={2}
                        maxLength={140}
                        className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        placeholder="اكتب النص هنا"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-2 flex justify-between text-slate-600">
                        <span>حجم الخط</span>
                        <span>{selectedLayer.size}px</span>
                      </span>
                      <input
                        type="range"
                        min="20"
                        max="150"
                        value={selectedLayer.size}
                        onChange={(e) =>
                          updateSelected({ size: Number(e.target.value) })
                        }
                        className="w-full accent-orange-600"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-600">لون النص</span>
                      <input
                        type="color"
                        value={selectedLayer.color}
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
                        aria-label="لون النص"
                      />
                    </label>

                    <div>
                      <span className="mb-2 block text-sm text-slate-600">
                        محاذاة النص
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          ["right", AlignRight, "يمين"],
                          ["center", AlignCenter, "وسط"],
                          ["left", AlignLeft, "يسار"],
                        ] as const).map(([align, Icon, label]) => (
                          <button
                            type="button"
                            key={align}
                            onClick={() => updateSelected({ align })}
                            aria-label={`محاذاة ${label}`}
                            className={`flex items-center justify-center rounded-lg border p-2 transition ${
                              selectedLayer.align === align
                                ? "border-orange-400 bg-orange-50 text-orange-700"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Icon size={17} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedLayer.bold}
                          onChange={(e) =>
                            updateSelected({ bold: e.target.checked })
                          }
                          className="accent-orange-600"
                        />
                        خط عريض
                      </label>

                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedLayer.stroke}
                          onChange={(e) =>
                            updateSelected({ stroke: e.target.checked })
                          }
                          className="accent-orange-600"
                        />
                        حدود حول النص
                      </label>

                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedLayer.shadow}
                          onChange={(e) =>
                            updateSelected({ shadow: e.target.checked })
                          }
                          className="accent-orange-600"
                        />
                        ظل للنص
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs text-slate-600">
                        الموضع الأفقي
                        <input
                          type="range"
                          min="80"
                          max="1200"
                          value={selectedLayer.x}
                          onChange={(e) =>
                            updateSelected({ x: Number(e.target.value) })
                          }
                          className="mt-2 w-full accent-orange-600"
                        />
                      </label>
                      <label className="text-xs text-slate-600">
                        الموضع الرأسي
                        <input
                          type="range"
                          min="50"
                          max="670"
                          value={selectedLayer.y}
                          onChange={(e) =>
                            updateSelected({ y: Number(e.target.value) })
                          }
                          className="mt-2 w-full accent-orange-600"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelected}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      حذف النص المحدد
                    </button>
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-3 font-bold">قوالب جاهزة</h3>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      type="button"
                      key={template.name}
                      onClick={() => applyTemplate(template)}
                      className="group overflow-hidden rounded-xl border border-slate-200 text-right transition hover:border-orange-400 hover:shadow-md"
                    >
                      <span
                        className="flex aspect-video items-center justify-center px-2 text-center text-xs font-black text-white"
                        style={{
                          background: `linear-gradient(135deg, ${template.background}, ${template.accent})`,
                        }}
                      >
                        {template.title}
                      </span>
                      <span className="block px-2 py-2 text-xs font-medium text-slate-700">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-bold">تنزيل التصميم</h3>
                <label className="mb-3 block text-sm">
                  <span className="mb-2 block text-slate-600">صيغة الصورة</span>
                  <select
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(e.target.value as "png" | "jpeg")
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="png">PNG — جودة عالية</option>
                    <option value="jpeg">JPG — حجم أصغر</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={downloadImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  <Download size={19} />
                  تنزيل الصورة المصغّرة
                </button>

                <button
                  type="button"
                  onClick={resetDesign}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw size={16} />
                  إعادة التصميم
                </button>
              </section>
            </aside>
          </div>
        </section>

        <section className="mt-10 space-y-8 text-right">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ما أداة إنشاء الصور المصغّرة للفيديو؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              أداة إنشاء الصور المصغّرة للفيديو من Intooly هي محرر مجاني
              يساعدك على تصميم صورة معاينة لفيديوهات YouTube ومحتواك المرئي.
              يمكنك استخدام صورة من جهازك أو اختيار خلفية لونية، ثم إضافة
              العناوين وتعديل الخطوط والألوان والمواضع قبل تنزيل التصميم.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              كيف تصمم صورة مصغّرة جذابة؟
            </h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 leading-8 text-slate-600">
              <li>ارفع صورة مناسبة أو اختر أحد القوالب الجاهزة.</li>
              <li>عدّل عنوان الفيديو واجعله واضحًا وسهل القراءة.</li>
              <li>اختر ألوانًا متباينة تساعد على إبراز النص.</li>
              <li>اضبط حجم النص وموضعه حتى لا يتجاوز حدود التصميم.</li>
              <li>اختر PNG أو JPG ثم نزّل الصورة إلى جهازك.</li>
            </ol>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ما مقاس الصورة المصغّرة المناسب ليوتيوب؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              تستخدم هذه الأداة مساحة تصميم بدقة 1280×720 بكسل ونسبة أبعاد
              16:9، وهي نسبة شائعة للصور المصغّرة لفيديوهات YouTube. احرص على
              أن يكون العنوان واضحًا عند عرض الصورة على شاشة صغيرة، وتحقق من
              متطلبات المنصة الحالية قبل النشر.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              نصائح تصميم Thumbnail احترافي لليوتيوب
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              عند تصميم صورة مصغّرة لليوتيوب، اجعل الفكرة الأساسية واضحة من النظرة الأولى.
              استخدم عنوانًا قصيرًا ومقروءًا، واختر تباينًا مناسبًا بين لون النص والخلفية.
              تجنب ازدحام التصميم بالعناصر، واترك مساحات كافية حول الكلمات المهمة.
              جرّب معاينة التصميم بحجم صغير للتأكد من وضوحه على الهواتف.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              إنشاء غلاف فيديو وصورة معاينة أونلاين
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              يمكنك استخدام صانع الصور المصغّرة من Intooly لإنشاء غلاف فيديو أو صورة
              معاينة لمحتوى قناتك. أضف صورة من جهازك، واكتب عنوان الفيديو باللغة
              العربية أو الإنجليزية، ثم خصص الألوان وحجم الخط والمحاذاة والموضع.
              تتيح لك القوالب الجاهزة بدء التصميم بسرعة، كما يمكنك تنزيل النتيجة
              بصيغة PNG أو JPG دون تثبيت برنامج تصميم.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              الأسئلة الشائعة
            </h2>
            <div className="mt-4 space-y-4">
              {[
                {
                  q: "هل أداة إنشاء الصور المصغّرة مجانية؟",
                  a: "نعم، يمكنك استخدام أدوات التحرير المتاحة في الصفحة دون اشتراك مدفوع.",
                },
                {
                  q: "هل أحتاج إلى تثبيت برنامج؟",
                  a: "لا، تعمل الأداة في متصفح الويب على جهازك.",
                },
                {
                  q: "هل يمكن كتابة النص باللغة العربية؟",
                  a: "نعم، يمكنك إدخال النص العربي والإنجليزي وتعديل حجمه ولونه ومحاذاته.",
                },
                {
                  q: "هل يمكنني استخدام صورة من جهازي؟",
                  a: "نعم، يمكنك اختيار صورة محلية لتكون خلفية التصميم، وتتم معالجتها داخل المتصفح.",
                },
                {
                  q: "هل يمكن تنزيل الصورة بصيغة JPG؟",
                  a: "نعم، يمكنك اختيار PNG أو JPG قبل تنزيل التصميم.",
                },
                {
                  q: "هل أستطيع إنشاء صورة بمقاس 1280×720؟",
                  a: "نعم، تنتج الأداة تصميمًا بأبعاد 1280×720 بكسل ونسبة 16:9.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-xl text-orange-600 transition group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold text-slate-900">
            أدوات Intooly ذات صلة
          </h2>
          <p className="mt-3 leading-8 text-slate-600">
            اكتشف أدوات أخرى تساعدك في تجهيز محتوى الفيديو والصور قبل النشر.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/tools/video-converter" className="rounded-2xl border border-slate-200 p-4 transition hover:border-orange-400 hover:bg-orange-50">
              <span className="font-bold text-slate-900">تحويل صيغ الفيديو</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">حوّل ملفات الفيديو إلى صيغ مختلفة.</span>
            </a>
            <a href="/tools/video" className="rounded-2xl border border-slate-200 p-4 transition hover:border-orange-400 hover:bg-orange-50">
              <span className="font-bold text-slate-900">أدوات الفيديو</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">تصفح أدوات معالجة الفيديو المتاحة.</span>
            </a>
            <a href="/tools/images" className="rounded-2xl border border-slate-200 p-4 transition hover:border-orange-400 hover:bg-orange-50">
              <span className="font-bold text-slate-900">أدوات الصور</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">حرّر صورك وجهّزها للاستخدام.</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}