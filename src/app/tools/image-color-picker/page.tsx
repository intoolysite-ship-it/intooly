'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, Copy, Image as ImageIcon, 
  Trash2, ArrowLeft, Droplet, Palette
} from 'lucide-react';

type ColorData = { hex: string; count: number };

export default function ImageColorPickerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<ColorData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imagePreview && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            extractColors(ctx, canvas.width, canvas.height);
          }
        }
      };
      img.src = imagePreview;
    }
  }, [imagePreview]);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase();
  };

  const extractColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    setIsProcessing(true);
    
    // قراءة البكسلات (تخطي بعض البكسلات للسرعة)
    const step = Math.max(1, Math.floor(Math.min(width, height) / 200));
    const colorMap = new Map<string, number>();
    
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = Math.round(pixel[0] / 32) * 32;
        const g = Math.round(pixel[1] / 32) * 32;
        const b = Math.round(pixel[2] / 32) * 32;
        const hex = rgbToHex(r, g, b);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }

    // تحويل إلى مصفوفة وترتيب حسب التكرار
    const sortedColors = Array.from(colorMap.entries())
      .map(([hex, count]) => ({ hex, count }))
      .sort((a, b) => b.count - a.count);

    // اللون المهيمن
    if (sortedColors.length > 0) {
      setDominantColor(sortedColors[0]);
    }

    // لوحة الألوان - اختيار ألوان متنوعة
    const palette: ColorData[] = [];
    const usedColors = new Set<string>();
    
    for (const color of sortedColors) {
      if (palette.length >= 12) break;
      
      // التحقق من أن اللون مختلف بما يكفي
      const isDifferent = !Array.from(usedColors).some(existing => {
        const diff = Math.abs(parseInt(existing.slice(1, 3), 16) - parseInt(color.hex.slice(1, 3), 16)) +
                     Math.abs(parseInt(existing.slice(3, 5), 16) - parseInt(color.hex.slice(3, 5), 16)) +
                     Math.abs(parseInt(existing.slice(5, 7), 16) - parseInt(color.hex.slice(5, 7), 16));
        return diff < 60;
      });

      if (isDifferent) {
        palette.push(color);
        usedColors.add(color.hex);
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
                احصل على أكواد HEX وRGB وHSL بدقة عالية من أي صورة. أداة Image Color Picker من Intooly تعمل محلياً في متصفحك لضمان الخصوصية والسرعة.
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
                        <Copy className="w-5 h-5 text-brand-600" />
                      </button>
                    </div>
                  </div>
                )}

                {/* لوحة الألوان */}
                {colorPalette.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-ink-900 text-center">لوحة الألوان</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {colorPalette.map((color, i) => (
                        <div key={i} className="flex items-center gap-2 bg-ink-50 p-2 rounded-lg">
                          <span className="text-xs font-mono font-bold text-ink-900 w-16 truncate">{color.hex}</span>
                          <div 
                            className="flex-1 h-10 rounded-lg border border-ink-200 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <button 
                            onClick={() => copyToClipboard(color.hex)}
                            className="p-1.5 hover:bg-ink-200 rounded-md transition"
                            title="نسخ"
                          >
                            <Copy className="w-4 h-4 text-brand-600" />
                          </button>
                        </div>
                      ))}
                    </div>
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
              أداة استخراج الألوان من الصور من Intooly هي أداة مجانية عبر الإنترنت تساعدك على معرفة أكواد الألوان الموجودة داخل أي صورة بسهولة ودقة. يمكنك رفع صورة من جهازك، ثم تحديد أي نقطة فيها لمعرفة اللون المستخدم والحصول على كوده بصيغ متعددة، مثل HEX وRGB وHSL.
            </p>
            <p className="text-sm leading-relaxed text-ink-700 text-right">
              سواء كنت مصمم جرافيك، أو مطور مواقع، أو مصمم واجهات مستخدم، يمكنك استخدام أداة Image Color Picker للتعرف على الألوان التي تحتاج إليها دون البحث عنها يدويًا أو تثبيت برامج تصميم متخصصة.
            </p>
          </article>

          <article className="mb-8">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">كيفية استخراج كود اللون من الصورة؟</h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'ارفع الصورة', desc: 'اختر الصورة من جهازك باستخدام زر رفع الصور (JPG, PNG, WEBP).' },
                { step: '2', title: 'حدد اللون', desc: 'انقر على النقطة التي تحتوي على اللون المطلوب.' },
                { step: '3', title: 'احصل على الكود', desc: 'تعرض الأداة كود اللون بصيغة HEX وقيم RGB وHSL فوراً.' },
                { step: '4', title: 'انسخ واستخدم', desc: 'انسخ الكود إلى مشروعك، أو أضفه إلى لوحة الألوان لتصديره لاحقاً.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-xl border border-ink-200">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-ink-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-8">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">ما صيغ أكواد الألوان التي يمكنك استخراجها؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: 'كود HEX', desc: 'صيغة مكونة من 6 أحرف وأرقام (مثل #EA580C)، وهي الأشهر في تصميم المواقع وملفات CSS.' },
                { title: 'صيغة RGB', desc: 'تعتمد على ثلاثة مكونات (أحمر، أخضر، أزرق) تتراوح قيمتها بين 0 و255 (مثل rgb(234, 88, 12)).' },
                { title: 'صيغة HSL', desc: 'تعبر عن درجة اللون (Hue)، والتشبع (Saturation)، والإضاءة (Lightness)، مما يسهل تعديل درجات اللون.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-xl p-4 text-right shadow-sm">
                  <h3 className="font-bold text-sm mb-2 text-brand-600">{item.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-8">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-center text-ink-900">الأسئلة الشائعة حول استخراج الألوان</h2>
            <div className="space-y-3">
              {[
                { q: 'كيف أستخرج الألوان من الصور أونلاين؟', a: 'ارفع الصورة إلى الأداة، ثم انقر على النقطة التي تحتوي على اللون المطلوب. ستظهر قيمة اللون، ويمكنك نسخ الكود واستخدامه فوراً.' },
                { q: 'هل يمكن استخراج RGB و HEX من الصورة؟', a: 'نعم، توفر الأداة أكواد HEX وقيم RGB و HSL بشكل تلقائي ودقيق عند النقر على أي بكسل في الصورة.' },
                { q: 'هل تعمل الأداة على الهاتف؟', a: 'نعم، الأداة متوافقة تماماً مع متصفحات الهواتف الذكية وتدعم اللمس لتحديد الألوان بدقة.' },
                { q: 'هل الصور آمنة ولا يتم رفعها؟', a: 'نعم، تتم جميع عمليات معالجة الصور واستخراج الألوان محلياً داخل متصفحك باستخدام تقنيات الويب الحديثة، ولا يتم إرسال أي صورة إلى خوادمنا.' }
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