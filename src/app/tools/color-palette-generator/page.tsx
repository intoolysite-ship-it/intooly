'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Palette, Lock, Unlock, RefreshCw, Copy, Check, ArrowLeft, Image as ImageIcon,
  Share2, Sun, Moon, HelpCircle, Sparkles, Download, Heart, Trash2, Wand2,
  Contrast, Eye, Code2, History, Upload, SlidersHorizontal, ChevronDown
} from 'lucide-react';

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type HarmonyType = 'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic';
type ColorData = { hex: string; rgb: string; hsl: HSL; locked: boolean };
type Tab = 'palette' | 'image' | 'shades' | 'gradient' | 'contrast' | 'preview' | 'export';

const HARMONIES: { value: HarmonyType; label: string }[] = [
  { value: 'monochromatic', label: 'أحادي اللون' },
  { value: 'analogous', label: 'متجاور' },
  { value: 'complementary', label: 'مكمل' },
  { value: 'split-complementary', label: 'مكمل منشطر' },
  { value: 'triadic', label: 'ثلاثي' },
  { value: 'tetradic', label: 'رباعي' },
];
const DEFAULT_COLORS = ['#EA580C', '#F59E0B', '#0F172A', '#FDBA74', '#64748B'];

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map(x => x + x).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}
function rgbToHex({ r, g, b }: RGB) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > .5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360 / 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return { r: Math.round(hue(h + 1 / 3) * 255), g: Math.round(hue(h) * 255), b: Math.round(hue(h - 1 / 3) * 255) };
}
function makeColor(hex: string, locked = false): ColorData {
  const rgb = hexToRgb(hex);
  return { hex: rgbToHex(rgb), rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, hsl: rgbToHsl(rgb), locked };
}
function randomColor() { return rgbToHex(hslToRgb(Math.floor(Math.random() * 360), 55 + Math.random() * 40, 35 + Math.random() * 35)); }
function makeHarmony(baseHex: string, type: HarmonyType): string[] {
  const base = rgbToHsl(hexToRgb(baseHex));
  if (type === 'monochromatic') return [
    baseHex,
    rgbToHex(hslToRgb(base.h, base.s, clamp(base.l - 28, 8, 92))),
    rgbToHex(hslToRgb(base.h, base.s, clamp(base.l - 12, 8, 92))),
    rgbToHex(hslToRgb(base.h, base.s, clamp(base.l + 14, 8, 92))),
    rgbToHex(hslToRgb(base.h, clamp(base.s - 25, 0, 100), clamp(base.l + 28, 8, 95))),
  ];
  const offsets: Record<Exclude<HarmonyType, 'monochromatic'>, number[]> = {
    analogous: [0, 30, 60, -30, -60],
    complementary: [0, 180, 150, 210, 30],
    'split-complementary': [0, 150, 210, 30, -30],
    triadic: [0, 120, 240, 60, 180],
    tetradic: [0, 90, 180, 270, 45],
  };
  return offsets[type].map((offset, i) => {
    const light = i === 0 ? base.l : clamp(base.l + (i % 2 ? 5 : -5), 18, 82);
    return rgbToHex(hslToRgb(base.h + offset, base.s, light));
  });
}
function relativeLuminance(hex: string) {
  const c = [hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b].map(v => {
    const x = v / 255; return x <= .04045 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4);
  });
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
}
function contrastRatio(a: string, b: string) {
  const x = relativeLuminance(a), y = relativeLuminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
function downloadText(text: string, name: string, type = 'text/plain') {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), name);
}
function createAse(colors: ColorData[]) {
  const encoder = new TextEncoder();
  const blocks: Uint8Array[] = [];
  for (const color of colors) {
    const name = encoder.encode(color.hex);
    const nameBytes = new Uint8Array(2 + name.length * 2 + 2);
    const view = new DataView(nameBytes.buffer); view.setUint16(0, name.length + 1, false);
    for (let i = 0; i < name.length; i++) nameBytes[2 + i * 2 + 1] = name[i];
    const rgb = hexToRgb(color.hex);
    const body = new Uint8Array(nameBytes.length + 4 + 12 + 2);
    body.set(nameBytes, 0);
    const dv = new DataView(body.buffer);
    const offset = nameBytes.length;
    body[offset] = 82; body[offset + 1] = 71; body[offset + 2] = 66; body[offset + 3] = 32;
    dv.setFloat32(offset + 4, rgb.r / 255, false);
    dv.setFloat32(offset + 8, rgb.g / 255, false);
    dv.setFloat32(offset + 12, rgb.b / 255, false);
    dv.setUint16(offset + 16, 0, false);
    const block = new Uint8Array(6 + body.length); const bv = new DataView(block.buffer);
    bv.setUint16(0, 0x0001, false); bv.setUint32(2, body.length, false); block.set(body, 6);
    blocks.push(block);
  }
  const total = blocks.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(12 + total); const view = new DataView(out.buffer);
  out.set([65, 83, 69, 70], 0); view.setUint16(4, 1, false); view.setUint16(6, 0, false);
  view.setUint32(8, blocks.length, false);
  let p = 12; for (const b of blocks) { out.set(b, p); p += b.length; }
  return new Blob([out], { type: 'application/octet-stream' });
}

const faqItems = [
  { q: 'ما هو مولد لوحات الألوان؟', a: 'مولد لوحات الألوان هو أداة تساعدك على إنشاء مجموعة ألوان متناسقة لاستخدامها في تصميم المواقع والتطبيقات والهويات البصرية. يعتمد على قواعد عجلة الألوان لتكوين مجموعات متناغمة.' },
  { q: 'كيف أنشئ لوحة ألوان متناسقة؟', a: 'اختر قاعدة التناغم المناسبة، مثل الألوان المتكاملة أو المتجاورة أو الثلاثية، ثم أنشئ لوحة جديدة. يمكنك قفل الألوان التي تريد الاحتفاظ بها وإعادة توليد بقية الألوان.' },
  { q: 'ما الفرق بين HEX وRGB وHSL؟', a: 'HEX صيغة سداسية شائعة في CSS، وRGB يحدد اللون بمقادير الأحمر والأخضر والأزرق، بينما HSL يصف اللون من خلال درجة اللون والتشبع والإضاءة.' },
  { q: 'هل يمكن استخراج لوحة ألوان من صورة؟', a: 'نعم، يمكنك اختيار صورة من جهازك واستخراج مجموعة من الألوان الأكثر حضورًا فيها، ثم نسخها أو استخدامها في لوحة الألوان.' },
  { q: 'كيف أعرف أن لون النص واضح فوق الخلفية؟', a: 'استخدم فاحص التباين لمقارنة اللونين. يعرض نسبة التباين ونتائج إرشادات WCAG لمستويات AA وAAA للنص العادي والكبير.' },
  { q: 'هل يمكن تصدير الألوان إلى CSS وTailwind؟', a: 'نعم، يمكنك تنزيل متغيرات CSS أو إعدادات ألوان Tailwind أو ملف JSON، كما يمكنك تنزيل صورة PNG أو ملف ASE لبرامج التصميم المتوافقة.' },
  { q: 'هل مولد الألوان مجاني؟', a: 'نعم، يمكنك استخدام وظائف إنشاء اللوحات واستخراج الألوان وفحص التباين والتصدير مجانًا من المتصفح.' },
  { q: 'هل تُرفع صوري إلى خادم؟', a: 'تتم معالجة الصورة المختارة محليًا في المتصفح باستخدام Canvas، ولا تتطلب ميزة استخراج الألوان إرسال الصورة إلى خادم.' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'أدوات الصور', item: 'https://intooly.com/tools/images' },
    { '@type': 'ListItem', position: 3, name: 'مولد لوحات الألوان', item: 'https://intooly.com/tools/color-palette-generator' },
  ],
};
const webAppSchema = {
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name: 'مولد لوحات الألوان - Intooly', url: 'https://intooly.com/tools/color-palette-generator',
  applicationCategory: 'DesignApplication', operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'مولد ألوان مجاني لإنشاء لوحات متناسقة واستخراج الألوان من الصور وفحص التباين وإنشاء التدرجات وتصدير أكواد CSS وTailwind.',
  inLanguage: 'ar',
};
const faqSchema = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question', name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function ColorPaletteGenerator() {
  const [colors, setColors] = useState<ColorData[]>(DEFAULT_COLORS.map(c => makeColor(c)));
  const [harmony, setHarmony] = useState<HarmonyType>('complementary');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('palette');
  const [copied, setCopied] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCount, setImageCount] = useState(5);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientSecond, setGradientSecond] = useState('#F59E0B');
  const [contrastBg, setContrastBg] = useState('#FFFFFF');
  const [contrastFg, setContrastFg] = useState('#0F172A');
  const [history, setHistory] = useState<string[][]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<'light' | 'dark'>('light');
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentHexes = useMemo(() => colors.map(c => c.hex), [colors]);
  const gradientCss = `linear-gradient(${gradientAngle}deg, ${colors[0]?.hex || '#EA580C'}, ${gradientSecond})`;
  const ratio = useMemo(() => contrastRatio(contrastFg, contrastBg), [contrastFg, contrastBg]);
  const contrastStatus = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA للنص الكبير فقط' : 'غير مطابق';

  useEffect(() => {
    try {
      const h = localStorage.getItem('intooly-color-history');
      const f = localStorage.getItem('intooly-color-favorites');
      if (h) setHistory(JSON.parse(h));
      if (f) setFavorites(JSON.parse(f));
    } catch { /* تجاهل بيانات التخزين غير الصالحة */ }
  }, []);
  useEffect(() => { try { localStorage.setItem('intooly-color-history', JSON.stringify(history.slice(0, 20))); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem('intooly-color-favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);

  const rememberPalette = useCallback((list: ColorData[]) => {
    setHistory(prev => [list.map(c => c.hex), ...prev.filter(p => p.join(',') !== list.map(c => c.hex).join(','))].slice(0, 20));
  }, []);
  const generatePalette = useCallback(() => {
    setColors(prev => {
      const locked = prev.filter(c => c.locked);
      const base = locked[0]?.hex || randomColor();
      const harmonyColors = makeHarmony(base, harmony);
      const next = harmonyColors.map((hex, i) => {
        const old = prev[i];
        if (old?.locked) return old;
        const candidate = harmonyColors[i % harmonyColors.length];
        return makeColor(candidate);
      });
      const result = next.slice(0, 5);
      rememberPalette(result);
      return result;
    });
  }, [harmony, rememberPalette]);
  const copy = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key); window.setTimeout(() => setCopied(current => current === key ? null : current), 1400);
    } catch { window.prompt('انسخ القيمة يدويًا:', value); }
  }, []);
  const updateColor = (index: number, hex: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    setColors(prev => prev.map((c, i) => i === index ? makeColor(hex, c.locked) : c));
  };
  const toggleLock = (index: number) => setColors(prev => prev.map((c, i) => i === index ? { ...c, locked: !c.locked } : c));
  const loadPalette = (hexes: string[]) => {
    const next = hexes.slice(0, 10).map(h => makeColor(h));
    while (next.length < 5) next.push(makeColor(randomColor()));
    setColors(next); setActiveTab('palette');
  };

  const extractImageColors = () => {
    const img = imageRef.current;
    if (!img) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const scale = Math.min(1, 160 / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 16) {
      if (data[i + 3] < 180) continue;
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = rgbToHex({ r, g, b });
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const extracted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, imageCount).map(([hex]) => hex);
    if (extracted.length) loadPalette(extracted);
  };
  const onImageSelected = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('يرجى اختيار ملف صورة صالح.'); return; }
    if (file.size > 15 * 1024 * 1024) { window.alert('حجم الصورة يتجاوز 15 ميجابايت.'); return; }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  const cssExport = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
  const tailwindExport = `/** ألوان مولدة بواسطة Intooly */\nmodule.exports = {\n  theme: { extend: { colors: {\n${colors.map((c, i) => `      palette${i + 1}: '${c.hex}',`).join('\n')}\n  } } }\n};`;
  const jsonExport = JSON.stringify(colors.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl })), null, 2);

  const downloadPng = () => {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 420;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const width = canvas.width / colors.length;
    colors.forEach((c, i) => {
      ctx.fillStyle = c.hex; ctx.fillRect(i * width, 0, width, 320);
      ctx.fillStyle = '#111827'; ctx.fillRect(i * width, 320, width, 100);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
      ctx.fillText(c.hex, i * width + width / 2, 380);
    });
    canvas.toBlob(blob => { if (blob) downloadBlob(blob, 'intooly-color-palette.png'); }, 'image/png');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'palette', label: 'مولّد الألوان', icon: <Palette size={17} /> },
    { id: 'image', label: 'من صورة', icon: <ImageIcon size={17} /> },
    { id: 'shades', label: 'درجات الألوان', icon: <SlidersHorizontal size={17} /> },
    { id: 'gradient', label: 'التدرجات', icon: <Wand2 size={17} /> },
    { id: 'contrast', label: 'فاحص التباين', icon: <Contrast size={17} /> },
    { id: 'preview', label: 'معاينة التصميم', icon: <Eye size={17} /> },
    { id: 'export', label: 'تصدير وحفظ', icon: <Download size={17} /> },
  ];

  return (
    <main dir="rtl" className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-ink-900 text-ink-100' : 'bg-gradient-to-br from-brand-50 via-white to-ink-50 text-ink-900'}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-ink-900/90 border-ink-700' : 'bg-white/90 border-ink-200'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/tools/images" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
              <ArrowLeft className="h-4 w-4" /> جميع أدوات الصور
            </Link>
            <button type="button" onClick={() => setDarkMode(v => !v)} className={`rounded-lg p-2 ${darkMode ? 'bg-ink-800' : 'bg-ink-100'}`} aria-label="تبديل الوضع اللوني">
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
          <div className="py-4 text-center">
            <h1 className="mb-2 text-2xl font-black md:text-3xl">مولد لوحات الألوان مجانًا أونلاين</h1>
            <p className={`text-sm md:text-base ${darkMode ? 'text-ink-300' : 'text-ink-600'}`}>أنشئ لوحات ألوان متناسقة، استخرج الألوان من الصور، وافحص التباين وصدّر أكوادك بسهولة.</p>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-7">
        <nav aria-label="أقسام أداة الألوان" className={`mb-6 flex gap-2 overflow-x-auto rounded-2xl p-2 ${darkMode ? 'bg-ink-800' : 'bg-white shadow-sm'}`}>
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-brand-500 text-white shadow' : darkMode ? 'text-ink-300 hover:bg-ink-700' : 'text-ink-600 hover:bg-ink-100'}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'palette' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {colors.map((color, index) => (
                <div key={index} className="group overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-ink-800">
                  <div className="relative h-40 sm:h-52" style={{ backgroundColor: color.hex }}>
                    <div className="absolute inset-x-2 top-2 flex justify-between">
                      <button type="button" onClick={() => toggleLock(index)} className="rounded-lg bg-black/25 p-2 text-white" aria-label={color.locked ? 'إلغاء قفل اللون' : 'قفل اللون'}>
                        {color.locked ? <Lock size={17} /> : <Unlock size={17} />}
                      </button>
                      <input aria-label={`تغيير اللون ${index + 1}`} type="color" value={color.hex} onChange={e => updateColor(index, e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent" />
                    </div>
                    <button type="button" onClick={() => copy(color.hex, `palette-${index}`)} className="absolute bottom-3 left-3 rounded-lg bg-black/35 p-2 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100" aria-label={`نسخ ${color.hex}`}>
                      {copied === `palette-${index}` ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <div className="space-y-1 p-3 text-center">
                    <button type="button" onClick={() => copy(color.hex, `hex-${index}`)} className="font-mono text-sm font-black dark:text-ink-100">{color.hex} {copied === `hex-${index}` && <Check className="inline" size={14} />}</button>
                    <p dir="ltr" className="text-xs text-ink-500">{color.rgb}</p>
                    <p dir="ltr" className="text-xs text-ink-400">HSL {color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`rounded-2xl p-5 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-wrap items-center gap-3">
                  <Palette className="text-brand-500" />
                  <label htmlFor="harmony-select" className="font-bold dark:text-ink-100">قاعدة تناغم الألوان</label>
                  <select id="harmony-select" value={harmony} onChange={e => setHarmony(e.target.value as HarmonyType)} className={`rounded-lg border px-4 py-2 ${darkMode ? 'border-ink-600 bg-ink-700 text-ink-100' : 'border-ink-200 bg-ink-50 text-ink-900'}`}>
                    {HARMONIES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
                <button type="button" onClick={generatePalette} className="flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3 font-bold text-white shadow hover:bg-brand-600">
                  <RefreshCw size={19} /> توليد لوحة جديدة
                </button>
              </div>
              <p className={`mt-3 text-center text-xs ${darkMode ? 'text-ink-400' : 'text-ink-500'}`}>اضغط Space للتوليد السريع، أو اقفل الألوان التي تريد الاحتفاظ بها.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => { setFavorites(prev => [...new Set([...prev, ...currentHexes])]); }} className="inline-flex items-center gap-2 rounded-xl border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/30"><Heart size={16} /> حفظ ألوان اللوحة</button>
              <button onClick={() => rememberPalette(colors)} className="inline-flex items-center gap-2 rounded-xl border border-ink-300 px-4 py-2 text-sm font-bold hover:bg-ink-50 dark:border-ink-600 dark:text-ink-300 dark:hover:bg-ink-700"><History size={16} /> حفظ في السجل</button>
            </div>
          </div>
        )}

        {activeTab === 'image' && (
          <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
            <div className="mb-5 text-center"><ImageIcon className="mx-auto mb-2 text-brand-500" size={34} /><h2 className="text-xl font-black dark:text-ink-100">استخراج الألوان من الصور</h2><p className="mt-2 text-sm text-ink-500">اختر صورة من جهازك لاستخراج أبرز ألوانها محليًا داخل المتصفح.</p></div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => onImageSelected(e.target.files?.[0])} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="mx-auto flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-bold text-white hover:bg-brand-600"><Upload size={18} /> اختيار صورة</button>
            {imageUrl && <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700"><img ref={imageRef} src={imageUrl} alt="الصورة المختارة لاستخراج الألوان" onLoad={extractImageColors} className="max-h-80 w-full object-contain" /></div>
              <div className="space-y-4">
                <label className="block text-sm font-bold dark:text-ink-200">عدد الألوان المستخرجة</label>
                <select value={imageCount} onChange={e => setImageCount(Number(e.target.value))} className="w-full rounded-lg border border-ink-200 bg-white p-3 text-ink-900 dark:border-ink-600 dark:bg-ink-700 dark:text-ink-100"><option value={5}>5 ألوان</option><option value={8}>8 ألوان</option><option value={10}>10 ألوان</option></select>
                <button onClick={extractImageColors} className="w-full rounded-xl bg-brand-500 px-5 py-3 font-bold text-white hover:bg-brand-600">استخراج الألوان وتطبيقها</button>
                <p className="text-xs leading-6 text-ink-500">الحد الأقصى لحجم الصورة 15 ميجابايت. تتم قراءة الصورة على جهازك ولا يتم رفعها إلى خادم.</p>
              </div>
            </div>}
          </div>
        )}

        {activeTab === 'shades' && (
          <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
            <h2 className="mb-5 text-xl font-black dark:text-ink-100">درجات فاتحة وداكنة لكل لون</h2>
            <div className="space-y-5">{colors.map((c, i) => <div key={i}><div className="mb-2 flex items-center justify-between"><strong className="font-mono text-sm dark:text-ink-200">{c.hex}</strong><button onClick={() => copy(c.hex, `shade-${i}`)} className="text-ink-500 hover:text-brand-500"><Copy size={16} /></button></div><div className="grid grid-cols-5 overflow-hidden rounded-xl sm:grid-cols-9">{Array.from({ length: 9 }, (_, j) => {
              const l = 8 + j * 10.5; const hex = rgbToHex(hslToRgb(c.hsl.h, c.hsl.s, l));
              return <button key={j} title={hex} onClick={() => copy(hex, `shade-${i}-${j}`)} className="h-16 sm:h-20 transition hover:scale-105" style={{ backgroundColor: hex }} />;
            })}</div></div>)}</div>
          </div>
        )}

        {activeTab === 'gradient' && (
          <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
            <h2 className="mb-5 text-xl font-black dark:text-ink-100">منشئ التدرجات اللونية CSS Gradient</h2>
            <div className="mb-5 h-56 rounded-2xl shadow-inner border border-ink-200 dark:border-ink-700" style={{ background: gradientCss }} />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-bold dark:text-ink-200">اللون الأول<input type="color" value={colors[0]?.hex || '#EA580C'} onChange={e => updateColor(0, e.target.value)} className="block h-12 w-full cursor-pointer rounded-lg border border-ink-200 dark:border-ink-600" /></label>
              <label className="space-y-2 text-sm font-bold dark:text-ink-200">اللون الثاني<input type="color" value={gradientSecond} onChange={e => setGradientSecond(e.target.value)} className="block h-12 w-full cursor-pointer rounded-lg border border-ink-200 dark:border-ink-600" /></label>
              <label className="space-y-2 text-sm font-bold dark:text-ink-200">زاوية التدرج: {gradientAngle}°<input type="range" min="0" max="360" value={gradientAngle} onChange={e => setGradientAngle(Number(e.target.value))} className="block w-full accent-brand-500" /></label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row"><code dir="ltr" className="flex-1 overflow-x-auto rounded-lg bg-ink-900 p-3 text-left text-sm text-white font-mono">{`background: ${gradientCss};`}</code><button onClick={() => copy(`background: ${gradientCss};`, 'gradient')} className="rounded-xl bg-brand-500 px-5 py-3 font-bold text-white hover:bg-brand-600"><Copy className="inline" size={16} /> نسخ CSS</button></div>
          </div>
        )}

        {activeTab === 'contrast' && (
          <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
            <h2 className="mb-5 text-xl font-black dark:text-ink-100">فاحص تباين الألوان وإمكانية الوصول WCAG</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-bold dark:text-ink-200">لون النص<input type="color" value={contrastFg} onChange={e => setContrastFg(e.target.value)} className="block h-12 w-full cursor-pointer rounded-lg border border-ink-200 dark:border-ink-600" /><span dir="ltr" className="block font-mono text-xs text-ink-500">{contrastFg}</span></label>
              <label className="space-y-2 text-sm font-bold dark:text-ink-200">لون الخلفية<input type="color" value={contrastBg} onChange={e => setContrastBg(e.target.value)} className="block h-12 w-full cursor-pointer rounded-lg border border-ink-200 dark:border-ink-600" /><span dir="ltr" className="block font-mono text-xs text-ink-500">{contrastBg}</span></label>
            </div>
            <div className="mt-6 rounded-2xl p-8 text-center border border-ink-200 dark:border-ink-700" style={{ color: contrastFg, backgroundColor: contrastBg }}><p className="text-2xl font-black">مثال على وضوح النص</p><p className="mt-2">هذا نص تجريبي لمعاينة التباين بين لون الكتابة والخلفية.</p></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-ink-100 p-4 text-center text-ink-900 dark:bg-ink-700 dark:text-ink-100"><p className="text-xs">نسبة التباين</p><p className="text-3xl font-black">{ratio.toFixed(2)}:1</p></div>
              <div className="rounded-xl bg-ink-100 p-4 text-center text-ink-900 dark:bg-ink-700 dark:text-ink-100"><p className="text-xs">WCAG AA</p><p className="text-xl font-black">{ratio >= 4.5 ? 'ناجح للنص العادي' : ratio >= 3 ? 'للنص الكبير فقط' : 'غير مطابق'}</p></div>
              <div className="rounded-xl bg-ink-100 p-4 text-center text-ink-900 dark:bg-ink-700 dark:text-ink-100"><p className="text-xs">WCAG AAA</p><p className="text-xl font-black">{ratio >= 7 ? 'ناجح' : 'غير مطابق'}</p></div>
            </div>
            <p className="mt-3 text-center text-xs text-ink-500">النتيجة الحالية: {contrastStatus}. تعتمد النسب على إرشادات WCAG للتباين.</p>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black dark:text-ink-100">معاينة لوحة الألوان في واجهة موقع</h2><div className="flex gap-2"><button onClick={() => setPreviewTab('light')} className={`rounded-lg px-4 py-2 text-sm ${previewTab === 'light' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-900 dark:bg-ink-700 dark:text-ink-200'}`}>فاتح</button><button onClick={() => setPreviewTab('dark')} className={`rounded-lg px-4 py-2 text-sm ${previewTab === 'dark' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-900 dark:bg-ink-700 dark:text-ink-200'}`}>داكن</button></div></div>
            <div className="overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-700" style={{ backgroundColor: previewTab === 'light' ? '#FFFFFF' : '#111827', color: previewTab === 'light' ? '#111827' : '#F9FAFB' }}>
              <div className="flex items-center justify-between p-5" style={{ backgroundColor: colors[2]?.hex, color: '#FFFFFF' }}><strong>علامتك التجارية</strong><span className="text-sm hidden sm:inline">الرئيسية  الخدمات  تواصل معنا</span></div>
              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10"><div className="space-y-4"><span className="text-sm font-bold" style={{ color: colors[0]?.hex }}>اكتشف لوحة ألوانك</span><h3 className="text-3xl font-black">تصميم بسيط بألوان متناسقة</h3><p className="leading-8 opacity-75">استخدم هذه المعاينة لتقييم الانسجام بين اللون الأساسي والخلفية والنصوص والأزرار.</p><button className="rounded-xl px-6 py-3 font-bold text-white" style={{ backgroundColor: colors[0]?.hex }}>ابدأ الآن</button></div><div className="grid grid-cols-2 gap-3">{colors.slice(0, 4).map((c, i) => <div key={i} className="rounded-xl p-5 shadow-sm border border-ink-100 dark:border-ink-700" style={{ backgroundColor: c.hex, color: i === 2 || i === 0 ? '#FFFFFF' : '#111827' }}><strong>بطاقة {i + 1}</strong><p className="mt-2 text-xs opacity-80">نموذج استخدام اللون</p></div>)}</div></div>
              <div className="p-5 text-center text-sm" style={{ backgroundColor: colors[1]?.hex, color: '#111827' }}>تذييل تجريبي للصفحة</div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-5">
            <div className={`rounded-2xl p-6 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}>
              <h2 className="mb-4 text-xl font-black dark:text-ink-100">تصدير لوحة الألوان</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button onClick={() => downloadText(cssExport, 'intooly-palette.css', 'text/css')} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><Code2 className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">CSS Variables</strong><p className="text-xs text-ink-500">متغيرات CSS جاهزة</p></button>
                <button onClick={() => downloadText(tailwindExport, 'intooly-tailwind-colors.js', 'text/javascript')} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><Code2 className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">Tailwind</strong><p className="text-xs text-ink-500">إعداد ألوان Tailwind</p></button>
                <button onClick={() => downloadText(jsonExport, 'intooly-palette.json', 'application/json')} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><Download className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">JSON</strong><p className="text-xs text-ink-500">بيانات الألوان</p></button>
                <button onClick={downloadPng} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><ImageIcon className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">PNG</strong><p className="text-xs text-ink-500">صورة لوحة الألوان</p></button>
                <button onClick={() => downloadBlob(createAse(colors), 'intooly-palette.ase')} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><Palette className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">Adobe ASE</strong><p className="text-xs text-ink-500">ملف عينات ألوان</p></button>
                <button onClick={() => copy(colors.map(c => c.hex).join(', '), 'all-colors')} className="rounded-xl border border-ink-200 p-4 text-right hover:border-brand-400 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-ink-700 dark:hover:border-brand-500"><Copy className="mb-2 text-brand-500" /><strong className="block dark:text-ink-100">نسخ جميع HEX</strong><p className="text-xs text-ink-500">نسخ أكواد اللوحة</p></button>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className={`rounded-2xl p-5 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}><h3 className="mb-3 flex items-center gap-2 font-black dark:text-ink-100"><History size={18} /> سجل اللوحات المحفوظة</h3>{history.length ? <div className="space-y-2">{history.map((item, i) => <div key={i} className="flex items-center gap-2"><div className="flex flex-1 overflow-hidden rounded-lg border border-ink-200 dark:border-ink-700">{item.map(c => <span key={c} className="h-9 flex-1" style={{ backgroundColor: c }} />)}</div><button onClick={() => loadPalette(item)} className="rounded-lg bg-brand-100 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60">استعادة</button></div>)}</div> : <p className="text-sm text-ink-500">لا توجد لوحات في السجل بعد.</p>}</div>
              <div className={`rounded-2xl p-5 shadow ${darkMode ? 'bg-ink-800' : 'bg-white'}`}><div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-black dark:text-ink-100"><Heart size={18} /> الألوان المفضلة</h3><button onClick={() => setFavorites([])} className="text-xs text-red-500 hover:text-red-600"><Trash2 className="inline" size={14} /> مسح</button></div>{favorites.length ? <div className="flex flex-wrap gap-2">{favorites.map(c => <button key={c} onClick={() => copy(c, `fav-${c}`)} title={`نسخ ${c}`} className="h-12 w-12 rounded-lg shadow hover:scale-110 transition" style={{ backgroundColor: c }} />)}</div> : <p className="text-sm text-ink-500">احفظ ألوانك المفضلة من تبويب مولّد الألوان.</p>}</div>
            </div>
          </div>
        )}

        {/* ===== SEO CONTENT SECTION ===== */}
        <section className={`py-12 md:py-16 ${darkMode ? 'bg-ink-900/60' : 'bg-ink-50'}`}>
          <div className="container mx-auto max-w-4xl space-y-10 px-4">
            <article className="space-y-4">
              <h2 className="text-xl font-black md:text-2xl dark:text-ink-100">ما هو مولد لوحات الألوان Color Palette Generator؟</h2>
              <p className="text-sm leading-8 text-ink-600 dark:text-ink-300">مولد لوحات الألوان من Intooly هو أداة تصميم مجانية عبر الإنترنت تساعدك على إنشاء مجموعات ألوان متناسقة لاستخدامها في تصميم المواقع الإلكترونية وتطبيقات الهاتف والهويات البصرية والعروض التقديمية والمحتوى الرقمي. يمكنك توليد لوحة ألوان اعتمادًا على قواعد عجلة الألوان، واستخراج الألوان من صورة، وإنشاء درجات لونية وتدرجات CSS، وفحص التباين قبل اعتماد الألوان في مشروعك.</p>
              <p className="text-sm leading-8 text-ink-600 dark:text-ink-300">تعرض الأداة قيم كل لون بصيغ HEX وRGB وHSL، وتتيح نسخ الأكواد أو تصديرها إلى ملفات CSS وTailwind وJSON وPNG وASE. تتم معالجة الصور المختارة محليًا داخل المتصفح عند استخدام ميزة استخراج الألوان.</p>
            </article>
            <article className="space-y-4">
              <h2 className="text-xl font-black md:text-2xl dark:text-ink-100">أنواع تناغم الألوان وكيف تختار لوحة متناسقة</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['أحادي اللون Monochromatic', 'يعتمد على لون واحد مع تغيير الإضاءة والتشبع للحصول على درجات فاتحة وداكنة. يناسب التصاميم الهادئة والواجهات البسيطة.'],
                  ['الألوان المتجاورة Analogous', 'يجمع ألوانًا متقاربة على عجلة الألوان، ويمنح التصميم إحساسًا بالانسجام والترابط.'],
                  ['الألوان المتكاملة Complementary', 'يجمع لونين متقابلين على عجلة الألوان، ويُستخدم لإبراز الأزرار والعناصر المهمة مع ضرورة ضبط التباين.'],
                  ['المكمل المنشطر Split Complementary', 'يجمع اللون الأساسي مع لونين قريبين من اللون المقابل، ويوفر تنوعًا بصريًا مع توازن جيد.'],
                  ['الألوان الثلاثية Triadic', 'يستخدم ثلاثة ألوان متباعدة بالتساوي على عجلة الألوان، ويمنح التصميم حيوية وتنوعًا.'],
                  ['الألوان الرباعية Tetradic', 'يعتمد على أربعة ألوان موزعة على شكل زوجين متكاملين، ويمنح خيارات واسعة مع الحاجة إلى اختيار لون مهيمن.'],
                ].map(([title, desc]) => <div key={title} className={`rounded-xl border p-5 ${darkMode ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}><h3 className="mb-2 flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400"><Sparkles size={16} />{title}</h3><p className="text-sm leading-7 text-ink-600 dark:text-ink-300">{desc}</p></div>)}
              </div>
            </article>
            <article className="space-y-4">
              <h2 className="text-xl font-black md:text-2xl dark:text-ink-100">استخدام أكواد الألوان HEX وRGB وHSL</h2>
              <p className="text-sm leading-8 text-ink-600 dark:text-ink-300">يُستخدم كود HEX بكثرة في صفحات الويب وملفات CSS، مثل #EA580C. أما RGB فيمثل شدة الأحمر والأخضر والأزرق بقيم من 0 إلى 255، بينما HSL يصف اللون من خلال درجة اللون Hue والتشبع Saturation والإضاءة Lightness. توفر الأداة الصيغ الثلاث لتسهيل العمل بين المصممين ومطوري الواجهات.</p>
            </article>
            <article className="space-y-4">
              <h2 className="text-xl font-black md:text-2xl dark:text-ink-100">فحص تباين الألوان وفق معايير WCAG</h2>
              <p className="text-sm leading-8 text-ink-600 dark:text-ink-300">لا يكفي أن تكون ألوان الموقع جميلة؛ يجب أن يكون النص واضحًا وسهل القراءة. يساعدك فاحص التباين على قياس الفرق بين لون النص والخلفية. توصي إرشادات WCAG بنسبة 4.5:1 على الأقل للنص العادي في المستوى AA، و3:1 للنص الكبير، بينما يتطلب المستوى AAA نسبة 7:1 للنص العادي و4.5:1 للنص الكبير.</p>
            </article>
            <article>
              <h2 className="mb-5 flex items-center gap-2 text-xl font-black md:text-2xl dark:text-ink-100"><HelpCircle className="text-brand-500" /> الأسئلة الشائعة حول مولد الألوان</h2>
              <div className="space-y-3">{faqItems.map((faq, i) => <details key={i} className={`group overflow-hidden rounded-xl border ${darkMode ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}><summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold dark:text-ink-100"><span>{faq.q}</span><ChevronDown className="shrink-0 text-brand-500 transition group-open:rotate-180" size={18} /></summary><div className={`border-t px-4 py-4 text-sm leading-7 ${darkMode ? 'border-ink-700 text-ink-300' : 'border-ink-100 text-ink-600'}`}>{faq.a}</div></details>)}</div>
            </article>

            {/* ===== RELATED TOOLS SECTION (أسفل محتوى السيو) ===== */}
            <article className="pt-8 border-t border-ink-200 dark:border-ink-700">
              <h2 className="mb-6 text-xl font-black md:text-2xl text-center dark:text-ink-100">أدوات Intooly ذات الصلة</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/tools/image-color-picker" className={`rounded-2xl border-2 p-5 transition hover:scale-105 hover:border-brand-400 ${darkMode ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${darkMode ? 'bg-brand-900/30' : 'bg-brand-100'}`}><ImageIcon className={`h-8 w-8 ${darkMode ? 'text-brand-400' : 'text-brand-600'}`} /></div>
                    <div>
                      <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-ink-100' : 'text-ink-900'}`}>استخراج الألوان من الصور</h3>
                      <p className={`text-xs ${darkMode ? 'text-ink-400' : 'text-ink-600'}`}>التقط أكواد الألوان من الصور بدقة.</p>
                    </div>
                  </div>
                </Link>
                <Link href="/tools/image-compressor" className={`rounded-2xl border-2 p-5 transition hover:scale-105 hover:border-brand-400 ${darkMode ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${darkMode ? 'bg-brand-900/30' : 'bg-brand-100'}`}><Download className={`h-8 w-8 ${darkMode ? 'text-brand-400' : 'text-brand-600'}`} /></div>
                    <div>
                      <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-ink-100' : 'text-ink-900'}`}>ضغط الصور أونلاين</h3>
                      <p className={`text-xs ${darkMode ? 'text-ink-400' : 'text-ink-600'}`}>قلّل حجم الصور مع الحفاظ على جودتها.</p>
                    </div>
                  </div>
                </Link>
                <Link href="/tools/background-remover" className={`rounded-2xl border-2 p-5 transition hover:scale-105 hover:border-brand-400 ${darkMode ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-xl p-3 ${darkMode ? 'bg-brand-900/30' : 'bg-brand-100'}`}><Wand2 className={`h-8 w-8 ${darkMode ? 'text-brand-400' : 'text-brand-600'}`} /></div>
                    <div>
                      <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-ink-100' : 'text-ink-900'}`}>إزالة خلفية الصور</h3>
                      <p className={`text-xs ${darkMode ? 'text-ink-400' : 'text-ink-600'}`}>احصل على صور بخلفية شفافة بضغطة زر.</p>
                    </div>
                  </div>
                </Link>
              </div>
            </article>

          </div>
        </section>
      </section>
    </main>
  );
}