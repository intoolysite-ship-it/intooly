'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, Copy, Image as ImageIcon, 
  Trash2, ArrowLeft, Droplet, Check
} from 'lucide-react';

type ColorData = { hex: string; count: number; rgb: {r:number;g:number;b:number} };

export default function ImageColorPickerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<ColorData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل الصورة واستخراج الألوان تلقائياً
  useEffect(() => {
    if (imagePreview && canvasRef.current) {
      const img = new Image();
      // ❌ إزالة crossOrigin - لا نحتاجه للملفات المحلية
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // تحديد حجم معقول للـ canvas (لتسريع المعالجة)
        const maxSize = 400;
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = Math.floor(img.naturalWidth * scale);
        canvas.height = Math.floor(img.naturalHeight * scale);
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // استخراج الألوان بعد رسم الصورة
          setTimeout(() => extractColors(ctx, canvas.width, canvas.height), 50);
        }
      };
      img.onerror = () => {
        console.error('فشل تحميل الصورة');
      };
      img.src = imagePreview;
    }
  }, [imagePreview]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // حساب المسافة بين لونين (Euclidean distance)
  const colorDistance = (c1: {r:number;g:number;b:number}, c2: {r:number;g:number;b:number}) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) + 
      Math.pow(c1.g - c2.g, 2) + 
      Math.pow(c1.b - c2.b, 2)
    );
  };

  const extractColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    setIsProcessing(true);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // تجميع الألوان المتشابهة (bucketing)
    const colorMap = new Map<string, { hex: string; count: number; rgb: {r:number;g:number;b:number} }>();
    const bucketSize = 16; // دقة التجميع
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // تجاهل البكسلات الشفافة
      if (a < 128) continue;
      
      // تجميع الألوان المتقاربة
      const rb = Math.round(r / bucketSize) * bucketSize;
      const gb = Math.round(g / bucketSize) * bucketSize;
      const bb = Math.round(b / bucketSize) * bucketSize;
      
      const key = `${rb},${gb},${bb}`;
      const hex = rgbToHex(rb, gb, bb);
      
      if (colorMap.has(key)) {
        const existing = colorMap.get(key)!;
        existing.count++;
      } else {
        colorMap.set(key, { hex, count: 1, rgb: { r: rb, g: gb, b: bb } });
      }
    }

    // ترتيب حسب التكرار
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count);

    // اللون المهيمن (الأكثر تكراراً)
    if (sortedColors.length > 0) {
      setDominantColor(sortedColors[0]);
    }

    // بناء لوحة ألوان متنوعة (12 لون)
    const palette: ColorData[] = [];
    const minDistance = 50; // الحد الأدنى للمسافة بين الألوان
    
    for (const color of sortedColors) {
      if (palette.length >= 12) break;
      
      // التحقق من أن اللون مختلف بما يكفي عن الألوان المختارة
      const isDifferent = palette.every(existing => 
        colorDistance(color.rgb, existing.rgb) > minDistance
      );

      if (isDifferent) {
        palette.push(color);
      }
    }

    setColorPalette(palette);
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setDominantColor(null);
      setColorPalette([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const resetAll = () => {
    setImage(null);
    setImagePreview(null);
    setDominantColor(null);
    setColorPalette([]);
  };

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-b from-ink-50 to-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="container relative mx-auto px-4 py-8 md:py-10">
          <Link href="/tools/images" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-3 w-3" /> جميع أدوات الصور
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100">
              <Droplet className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-ink-900 sm:text-2xl md:text-3xl">
                استخراج الألوان من الصور مجانًا أونلاين
              </h1>
              <p className="mt-1 text-xs leading-6 text-brand-700 sm:text-sm">
                احصل على أكواد HEX بدقة عالية من أي صورة. أداة Image Color Picker من Intooly تعمل محلياً في متصفحك لضمان الخصوصية والسرعة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOOL SECTION ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-ink-200 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 max-w-4xl mx-auto overflow-hidden">
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-12 cursor-pointer hover:bg-brand-50 transition-all group text-center"
              >
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg md:text-xl font-black mb-2 text-ink-900">اسحب الصورة هنا أو انقر للاختيار</h3>
                <p className="text-xs text-ink-600">يدعم JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* الصورة */}
                <div className="bg-ink-50 border border-ink-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-ink-900 flex items-center gap-2 text-sm">
                      <ImageIcon className="w-4 h-4 text-brand-500" /> الصورة المصدر
                    </h3>
                  </div>
                  
                  <div className="relative w-full bg-white rounded-xl border border-ink-200 overflow-hidden flex items-center justify-center min-h-[200px]">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto block"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>

                {/* اللون الأكثر استخدامًا */}
                {dominantColor && (
                  <div className="text-center space-y-3">
                    <h3 className="text-sm font-bold text-ink-900">اللون الأكثر استخدامًا</h3>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm font-mono font-bold text-ink-900">{dominantColor.hex}</span>
                      <div 
                        className="w-32 h-12 rounded-lg border border-ink-200 shadow-sm"
                        style={{ backgroundColor: dominantColor.hex }}
                      ></div>
                      <button 
                        onClick={() => copyToClipboard(dominantColor.hex)}
                        className="p-2 hover:bg-ink-100 rounded-lg transition"
                        title="نسخ"
                      >
                        {copiedHex === dominantColor.hex ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-brand-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* لوحة الألوان */}
                {colorPalette.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-ink-900 text-center">لوحة الألوان</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {colorPalette.map((color, i) => (
                        <div key={i} className="flex items-center gap-2 bg-ink-50 p-2 rounded-lg">
                          <div 
                            className="w-12 h-10 rounded-lg border border-ink-200 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <span className="flex-1 text-xs font-mono font-bold text-ink-900 truncate">{color.hex}</span>
                          <button 
                            onClick={() => copyToClipboard(color.hex)}
                            className="p-1.5 hover:bg-ink-200 rounded-md transition"
                            title="نسخ"
                          >
                            {copiedHex === color.hex ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-brand-600" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* حالة المعالجة */}
                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-ink-600 mt-2">جارٍ استخراج الألوان...</p>
                  </div>
                )}

                {/* أزرار التحكم */}
                <div className="flex items-center justify-between pt-4 border-t border-ink-200">
                  <button 
                    onClick={resetAll}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" /> حذف الكل
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4" /> حدد الصورة
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT SECTION ===== */}
      <section className="py-10 md:py-12 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-8">
            <h2 className="text-xl md:text-2xl font-black mb-3 text-right text-ink-900">ما هي أداة استخراج الألوان من الصور؟</h2>
            <p className="text-sm leading-relaxed mb-3 text-ink-700 text-right">
              أداة استخراج الألوان من الصور من Intooly هي أداة مجانية عبر الإنترنت تساعدك على معرفة أكواد الألوان الموجودة داخل أي صورة بسهولة ودقة. يمكنك رفع صورة من جهازك، ثم تحديد أي نقطة فيها لمعرفة اللون المستخدم والحصول على كوده بصيغة HEX.
            </p>
          </article>

          <article className="mb-8">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-center text-ink-900">الأسئلة الشائعة</h2>
            <div className="space-y-3">
              {[
                { q: 'كيف أستخرج الألوان من الصور أونلاين؟', a: 'ارفع الصورة إلى الأداة، وستقوم تلقائياً باستخراج اللون المهيمن ولوحة من 12 لون مميز مع أكواد HEX.' },
                { q: 'هل تعمل الأداة على الهاتف؟', a: 'نعم، الأداة متوافقة تماماً مع متصفحات الهواتف الذكية.' },
                { q: 'هل الصور آمنة ولا يتم رفعها؟', a: 'نعم، تتم جميع العمليات محلياً داخل متصفحك، ولا يتم إرسال أي صورة إلى خوادمنا.' }
              ].map((faq, i) => (
                <details key={i} className="bg-white border border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-3 cursor-pointer font-bold text-ink-900 flex justify-between items-center text-sm">
                    {faq.q}
                    <span className="text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-3 text-xs text-ink-600 leading-relaxed border-t border-ink-100 pt-2">{faq.a}</div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">أدوات Intooly ذات الصلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/tools/image-compressor" className="bg-white border border-ink-200 rounded-xl p-3 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-sm">📉</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 text-sm">ضغط الصور أونلاين</h4>
                  <p className="text-[10px] text-ink-600">قلّل حجم الصور مع الحفاظ على جودتها.</p>
                </div>
              </Link>
              <Link href="/tools/background-remover" className="bg-white border border-ink-200 rounded-xl p-3 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-sm">✂️</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 text-sm">إزالة خلفية الصور</h4>
                  <p className="text-[10px] text-ink-600">احصل على صور بخلفية شفافة بضغطة زر.</p>
                </div>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}