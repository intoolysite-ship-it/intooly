'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, Copy, Download, Palette, ZoomIn, Image as ImageIcon, 
  Check, Trash2, ArrowLeft, FileCode, FileText, Droplet 
} from 'lucide-react';

type ColorData = { hex: string; rgb: string; hsl: string };

export default function ImageColorPickerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
  const [colorHistory, setColorHistory] = useState<ColorData[]>([]);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setSelectedColor(null);
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const getPixelColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0], g = pixel[1], b = pixel[2];
    
    const newColor = {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b)
    };
    
    setSelectedColor(newColor);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowMagnifier(true);
  };

  const addToHistory = () => {
    if (selectedColor && !colorHistory.some(c => c.hex === selectedColor.hex)) {
      setColorHistory(prev => [selectedColor, ...prev].slice(0, 12));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // يمكن إضافة toast هنا، لكن سنكتفي بتغيير مؤقت أو alert بسيط
  };

  const exportCSS = () => {
    const css = colorHistory.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    const blob = new Blob([`:root {\n${css}\n}`], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'palette.css'; a.click();
  };

  const exportTXT = () => {
    const txt = colorHistory.map(c => c.hex).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'palette.txt'; a.click();
  };

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-b from-ink-50 to-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link href="/tools/images" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع أدوات الصور
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <Droplet className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                استخراج الألوان من الصور مجانًا أونلاين
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                احصل على أكواد HEX وRGB وHSL بدقة عالية من أي صورة. أداة Image Color Picker من Intooly تعمل محلياً في متصفحك لضمان الخصوصية والسرعة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOOL SECTION ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-ink-200 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 max-w-6xl mx-auto overflow-hidden">
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group text-center"
              >
                <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اسحب الصورة هنا أو انقر للاختيار</h3>
                <p className="text-xs md:text-sm text-ink-600">يدعم JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* العمود الأيمن: الصورة */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-ink-50 border border-ink-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-ink-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-500" /> الصورة المصدر
                      </h3>
                      <button onClick={() => { setImage(null); setImagePreview(null); setSelectedColor(null); setColorHistory([]); }} className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> إزالة الصورة
                      </button>
                    </div>
                    
                    <div className="relative inline-block max-w-full">
                      <img 
                        ref={imgRef}
                        src={imagePreview!} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded-xl border border-ink-200 hidden"
                        onLoad={(e) => {
                          if (canvasRef.current && imgRef.current) {
                            canvasRef.current.width = imgRef.current.naturalWidth;
                            canvasRef.current.height = imgRef.current.naturalHeight;
                            const ctx = canvasRef.current.getContext('2d');
                            ctx?.drawImage(imgRef.current, 0, 0);
                          }
                        }}
                      />
                      <canvas
                        ref={canvasRef}
                        onClick={getPixelColor}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setShowMagnifier(false)}
                        className="max-w-full h-auto rounded-xl border border-ink-200 cursor-crosshair touch-none block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                      
                      {/* Magnifier */}
                      {showMagnifier && (
                        <div 
                          className="absolute pointer-events-none border-2 border-brand-500 rounded-full shadow-xl overflow-hidden bg-white"
                          style={{
                            width: '80px', height: '80px',
                            left: `${cursorPos.x - 40}px`, top: `${cursorPos.y - 40}px`,
                            backgroundImage: `url(${imagePreview})`,
                            backgroundSize: `${(canvasRef.current?.width || 800) * 2}px ${(canvasRef.current?.height || 800) * 2}px`,
                            backgroundPosition: `-${cursorPos.x * 2 - 40}px -${cursorPos.y * 2 - 40}px`,
                            display: 'block'
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1 h-1 bg-red-500 rounded-full border border-white"></div>
                          </div>
                        </div>
                      )}
                    a
                    </div>
                  </div>
                </div>

                {/* العمود الأيسر: النتائج ولوحة الألوان */}
                <div className="space-y-4">
                  {/* اللون المحدد */}
                  <div className="bg-white border border-ink-200 rounded-2xl p-4">
                    <h3 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-brand-500" /> اللون المحدد
                    </h3>
                    {selectedColor ? (
                      <div className="space-y-3">
                        <div className="w-full h-24 rounded-xl border border-ink-200 shadow-inner" style={{ backgroundColor: selectedColor.hex }}></div>
                        
                        {[
                          { label: 'HEX', value: selectedColor.hex },
                          { label: 'RGB', value: selectedColor.rgb },
                          { label: 'HSL', value: selectedColor.hsl }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 bg-ink-50 p-2 rounded-lg">
                            <span className="text-xs font-bold text-ink-500 w-10">{item.label}</span>
                            <span className="flex-1 text-sm font-mono font-bold text-ink-900">{item.value}</span>
                            <button onClick={() => copyToClipboard(item.value)} className="p-1.5 hover:bg-ink-200 rounded-md transition" title="نسخ">
                              <Copy className="w-4 h-4 text-ink-600" />
                            </button>
                          </div>
                        ))}
                        <button onClick={addToHistory} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" /> إضافة إلى لوحة الألوان
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-ink-500 text-sm">
                        انقر على أي نقطة في الصورة لاستخراج لونها
                      </div>
                    )}
                  </div>

                  {/* لوحة الألوان */}
                  {colorHistory.length > 0 && (
                    <div className="bg-white border border-ink-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-ink-900 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-brand-500" /> لوحة الألوان ({colorHistory.length})
                        </h3>
                        <button onClick={() => setColorHistory([])} className="text-xs text-rose-600 hover:text-rose-700 font-bold">مسح</button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {colorHistory.map((c, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setSelectedColor(c); }}
                            className="aspect-square rounded-lg border border-ink-200 shadow-sm hover:scale-105 transition-transform relative group"
                            style={{ backgroundColor: c.hex }}
                            title={c.hex}
                          >
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white text-[10px] font-bold rounded-lg">
                              <Copy className="w-3 h-3" />
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={exportCSS} className="py-2 bg-ink-100 hover:bg-ink-200 text-ink-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                          <FileCode className="w-3 h-3" /> تصدير CSS
                        </button>
                        <button onClick={exportTXT} className="py-2 bg-ink-100 hover:bg-ink-200 text-ink-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" /> تصدير TXT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== SEO CONTENT SECTION ===== */}
      <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">ما هي أداة استخراج الألوان من الصور؟</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              أداة استخراج الألوان من الصور من Intooly هي أداة مجانية عبر الإنترنت تساعدك على معرفة أكواد الألوان الموجودة داخل أي صورة بسهولة ودقة. يمكنك رفع صورة من جهازك، ثم تحديد أي نقطة فيها لمعرفة اللون المستخدم والحصول على كوده بصيغ متعددة، مثل HEX وRGB وHSL.
            </p>
            <p className="text-base leading-relaxed text-ink-700 text-right">
              سواء كنت مصمم جرافيك، أو مطور مواقع، أو مصمم واجهات مستخدم، يمكنك استخدام أداة Image Color Picker للتعرف على الألوان التي تحتاج إليها دون البحث عنها يدويًا أو تثبيت برامج تصميم متخصصة.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">كيفية استخراج كود اللون من الصورة؟</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'ارفع الصورة', desc: 'اختر الصورة من جهازك باستخدام زر رفع الصور (JPG, PNG, WEBP).' },
                { step: '2', title: 'حدد اللون', desc: 'انقر على النقطة التي تحتوي على اللون المطلوب. استخدم العدسة المكبرة للدقة.' },
                { step: '3', title: 'احصل على الكود', desc: 'تعرض الأداة كود اللون بصيغة HEX وقيم RGB وHSL فوراً.' },
                { step: '4', title: 'انسخ واستخدم', desc: 'انسخ الكود إلى مشروعك، أو أضفه إلى لوحة الألوان لتصديره لاحقاً.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-ink-200">
                  <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-ink-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">ما صيغ أكواد الألوان التي يمكنك استخراجها؟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'كود HEX', desc: 'صيغة مكونة من 6 أحرف وأرقام (مثل #EA580C)، وهي الأشهر في تصميم المواقع وملفات CSS.' },
                { title: 'صيغة RGB', desc: 'تعتمد على ثلاثة مكونات (أحمر، أخضر، أزرق) تتراوح قيمتها بين 0 و255 (مثل rgb(234, 88, 12)).' },
                { title: 'صيغة HSL', desc: 'تعبر عن درجة اللون (Hue)، والتشبع (Saturation)، والإضاءة (Lightness)، مما يسهل تعديل درجات اللون.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-2xl p-5 text-right shadow-sm">
                  <h3 className="font-bold text-base mb-2 text-brand-600">{item.title}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-center text-ink-900">الأسئلة الشائعة حول استخراج الألوان</h2>
            <div className="space-y-3">
              {[
                { q: 'كيف أستخرج الألوان من الصور أونلاين؟', a: 'ارفع الصورة إلى الأداة، ثم انقر على النقطة التي تحتوي على اللون المطلوب. ستظهر قيمة اللون، ويمكنك نسخ الكود واستخدامه فوراً.' },
                { q: 'هل يمكن استخراج RGB و HEX من الصورة؟', a: 'نعم، توفر الأداة أكواد HEX وقيم RGB و HSL بشكل تلقائي ودقيق عند النقر على أي بكسل في الصورة.' },
                { q: 'هل تعمل الأداة على الهاتف؟', a: 'نعم، الأداة متوافقة تماماً مع متصفحات الهواتف الذكية وتدعم اللمس لتحديد الألوان بدقة.' },
                { q: 'هل الصور آمنة ولا يتم رفعها؟', a: 'نعم، تتم جميع عمليات معالجة الصور واستخراج الألوان محلياً داخل متصفحك باستخدام تقنيات الويب الحديثة، ولا يتم إرسال أي صورة إلى خوادمنا.' }
              ].map((faq, i) => (
                <details key={i} className="bg-white border border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold text-ink-900 flex justify-between items-center text-sm md:text-base">
                    {faq.q}
                    <span className="text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 leading-relaxed border-t border-ink-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">أدوات Intooly ذات الصلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/tools/image-compressor" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-lg">📉</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">ضغط الصور أونلاين</h4>
                  <p className="text-xs text-ink-600">قلّل حجم الصور مع الحفاظ على جودتها.</p>
                </div>
              </Link>
              <Link href="/tools/background-remover" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-lg">✂️</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">إزالة خلفية الصور</h4>
                  <p className="text-xs text-ink-600">احصل على صور بخلفية شفافة بضغطة زر.</p>
                </div>
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
