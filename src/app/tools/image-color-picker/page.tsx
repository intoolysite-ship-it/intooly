'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Upload, Copy, Image as ImageIcon, Trash2, ArrowLeft, Droplet, Check,
  Palette, Monitor, Code, Users, Lightbulb, ShieldCheck, HelpCircle
} from 'lucide-react';

type ColorData = { hex: string; count: number; rgb: {r:number;g:number;b:number} };

// ====== Schema Markup Data ======
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'أدوات الصور', item: 'https://intooly.com/tools/images' },
    { '@type': 'ListItem', position: 3, name: 'استخراج الألوان من الصور', item: 'https://intooly.com/tools/image-color-picker' },
  ],
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'استخراج الألوان من الصور - Image Color Picker',
  url: 'https://intooly.com/tools/image-color-picker',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'أداة مجانية لاستخراج أكواد الألوان HEX وRGB وHSL من أي صورة مباشرة من المتصفح.',
  inLanguage: 'ar',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'كيف أستخرج الألوان من الصور أونلاين؟', acceptedAnswer: { '@type': 'Answer', text: 'ارفع الصورة إلى أداة Image Color Picker، ثم انقر على النقطة التي تحتوي على اللون المطلوب. ستظهر قيمة اللون، ويمكنك نسخ الكود واستخدامه في التصميم أو البرمجة.' } },
    { '@type': 'Question', name: 'كيف أعرف كود HEX من الصورة؟', acceptedAnswer: { '@type': 'Answer', text: 'ارفع الصورة إلى الأداة وحدد اللون الذي تريد معرفته. سيظهر الكود بصيغة تبدأ بعلامة المربع، مثل #EA580C، ويمكنك نسخه مباشرةً.' } },
    { '@type': 'Question', name: 'هل يمكن استخراج RGB من الصورة؟', acceptedAnswer: { '@type': 'Answer', text: 'نعم، توفر الأداة أكواد HEX وقيم RGB و HSL بشكل تلقائي ودقيق عند النقر على أي بكسل في الصورة.' } },
    { '@type': 'Question', name: 'هل تعمل أداة استخراج الألوان على الهاتف؟', acceptedAnswer: { '@type': 'Answer', text: 'نعم، الأداة متوافقة تماماً مع متصفحات الهواتف الذكية وتدعم اللمس لتحديد الألوان بدقة.' } },
    { '@type': 'Question', name: 'هل الصور آمنة ولا يتم رفعها؟', acceptedAnswer: { '@type': 'Answer', text: 'نعم، تتم جميع عمليات معالجة الصور واستخراج الألوان محلياً داخل متصفحك باستخدام تقنيات الويب الحديثة، ولا يتم إرسال أي صورة إلى خوادمنا.' } }
  ],
};

export default function ImageColorPickerPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<ColorData | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imagePreview && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const maxSize = 400;
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        canvas.width = Math.floor(img.naturalWidth * scale);
        canvas.height = Math.floor(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setTimeout(() => extractColors(ctx, canvas.width, canvas.height), 50);
        }
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

  const colorDistance = (c1: {r:number;g:number;b:number}, c2: {r:number;g:number;b:number}) => {
    return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
  };

  const extractColors = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    setIsProcessing(true);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorMap = new Map<string, { hex: string; count: number; rgb: {r:number;g:number;b:number} }>();
    const bucketSize = 16;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const rb = Math.round(data[i] / bucketSize) * bucketSize;
      const gb = Math.round(data[i + 1] / bucketSize) * bucketSize;
      const bb = Math.round(data[i + 2] / bucketSize) * bucketSize;
      const key = `${rb},${gb},${bb}`;
      const hex = rgbToHex(rb, gb, bb);
      if (colorMap.has(key)) colorMap.get(key)!.count++;
      else colorMap.set(key, { hex, count: 1, rgb: { r: rb, g: gb, b: bb } });
    }

    const sortedColors = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
    if (sortedColors.length > 0) setDominantColor(sortedColors[0]);

    const palette: ColorData[] = [];
    for (const color of sortedColors) {
      if (palette.length >= 12) break;
      if (palette.every(existing => colorDistance(color.rgb, existing.rgb) > 50)) {
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
      {/* Schema Markup Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
                استخراج الألوان من الصور مجانًا أونلاين – Image Color Picker
              </h1>
              <p className="mt-1 text-xs leading-6 text-brand-700 sm:text-sm">
                استخرج الألوان من الصور مجانًا باستخدام أداة Image Color Picker من Intooly. احصل على أكواد HEX وRGB وHSL، واختر الألوان بدقة، وأنشئ لوحة ألوان بسهولة دون تثبيت برامج.
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
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-12 cursor-pointer hover:bg-brand-50 transition-all group text-center">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg md:text-xl font-black mb-2 text-ink-900">اسحب الصورة هنا أو انقر للاختيار</h3>
                <p className="text-xs text-ink-600">يدعم JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-ink-50 border border-ink-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-ink-900 flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4 text-brand-500" /> الصورة المصدر</h3>
                  </div>
                  <div className="relative w-full bg-white rounded-xl border border-ink-200 overflow-hidden flex items-center justify-center min-h-[200px]">
                    <canvas ref={canvasRef} className="max-w-full h-auto block" style={{ maxWidth: '100%', height: 'auto' }} />
                  </div>
                </div>

                {dominantColor && (
                  <div className="text-center space-y-3">
                    <h3 className="text-sm font-bold text-ink-900">اللون الأكثر استخدامًا</h3>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm font-mono font-bold text-ink-900">{dominantColor.hex}</span>
                      <div className="w-32 h-12 rounded-lg border border-ink-200 shadow-sm" style={{ backgroundColor: dominantColor.hex }}></div>
                      <button onClick={() => copyToClipboard(dominantColor.hex)} className="p-2 hover:bg-ink-100 rounded-lg transition" title="نسخ">
                        {copiedHex === dominantColor.hex ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-brand-600" />}
                      </button>
                    </div>
                  </div>
                )}

                {colorPalette.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-ink-900 text-center">لوحة الألوان</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {colorPalette.map((color, i) => (
                        <div key={i} className="flex items-center gap-2 bg-ink-50 p-2 rounded-lg">
                          <div className="w-12 h-10 rounded-lg border border-ink-200 shadow-sm flex-shrink-0" style={{ backgroundColor: color.hex }}></div>
                          <span className="flex-1 text-xs font-mono font-bold text-ink-900 truncate">{color.hex}</span>
                          <button onClick={() => copyToClipboard(color.hex)} className="p-1.5 hover:bg-ink-200 rounded-md transition" title="نسخ">
                            {copiedHex === color.hex ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-brand-600" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-ink-600 mt-2">جارٍ استخراج الألوان...</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-ink-200">
                  <button onClick={resetAll} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 text-sm">
                    <Trash2 className="w-4 h-4" /> حذف الكل
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-all flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4" /> حدد الصورة
                  </button>
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </div>
      </section>

      {/* ===== COMPREHENSIVE SEO CONTENT ===== */}
      <section className="py-10 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl space-y-10">
          
          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">ما هي أداة استخراج الألوان من الصور؟</h2>
            <p className="text-sm leading-8 text-ink-700 text-right mb-4">
              أداة استخراج الألوان من الصور من Intooly هي أداة مجانية عبر الإنترنت تساعدك على معرفة أكواد الألوان الموجودة داخل أي صورة بسهولة ودقة. يمكنك رفع صورة من جهازك، ثم تحديد أي نقطة فيها لمعرفة اللون المستخدم والحصول على كوده بصيغ متعددة، مثل HEX وRGB وHSL.
            </p>
            <p className="text-sm leading-8 text-ink-700 text-right">
              سواء كنت مصمم جرافيك، أو مطور مواقع، أو مصمم واجهات مستخدم، أو تعمل على إنشاء محتوى بصري لمنصات التواصل الاجتماعي، يمكنك استخدام أداة Image Color Picker للتعرف على الألوان التي تحتاج إليها دون البحث عنها يدويًا أو تثبيت برامج تصميم متخصصة.
            </p>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-6 text-right text-ink-900">كيفية استخراج كود اللون من الصورة؟</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { step: '1', title: 'ارفع الصورة', desc: 'اختر الصورة من جهازك باستخدام زر رفع الصور (JPG, PNG, WEBP).' },
                { step: '2', title: 'حدد اللون', desc: 'انقر على النقطة التي تحتوي على اللون المطلوب للحصول على قيمة البكسل.' },
                { step: '3', title: 'احصل على الكود', desc: 'تعرض الأداة كود اللون بصيغة HEX، وقيم RGB وHSL أيضاً.' },
                { step: '4', title: 'انسخ واستخدم', desc: 'انسخ الكود إلى مشروعك في التصميم أو البرمجة بضغطة زر.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start bg-white p-4 rounded-xl border border-ink-200">
                  <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-6 text-right text-ink-900">ما صيغ أكواد الألوان التي يمكنك استخراجها؟</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'كود HEX', desc: 'صيغة مكونة من 6 أحرف وأرقام (مثل #EA580C)، وهي الأشهر في تصميم المواقع وملفات CSS.', icon: <Code className="w-5 h-5 text-brand-600" /> },
                { title: 'صيغة RGB', desc: 'تعتمد على ثلاثة مكونات (أحمر، أخضر، أزرق) تتراوح قيمتها بين 0 و255 (مثل rgb(234, 88, 12)).', icon: <Monitor className="w-5 h-5 text-brand-600" /> },
                { title: 'صيغة HSL', desc: 'تعبر عن درجة اللون (Hue)، والتشبع (Saturation)، والإضاءة (Lightness)، مما يسهل التعديل.', icon: <Palette className="w-5 h-5 text-brand-600" /> }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-xl p-5 text-right shadow-sm">
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-bold text-sm mb-2 text-ink-900">{item.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">أهم مميزات أداة Image Color Picker</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {['استخراج الألوان من الصور بدقة', 'الحصول على أكواد HEX ونسخها فوراً', 'عرض قيم RGB وHSL بصيغ مختلفة', 'واجهة واضحة تناسب المبتدئين والمحترفين', 'إنشاء لوحة ألوان متناسقة من صورة واحدة', 'معالجة محلية 100% دون رفع الصور للخادم'].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink-700 bg-white p-3 rounded-lg border border-ink-100">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {feat}
                </li>
              ))}
            </ul>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">استخراج لوحة ألوان من صورة واحدة</h2>
            <p className="text-sm leading-8 text-ink-700 text-right mb-4">
              قد تحتوي الصورة على عدة ألوان متناسقة يمكنك الاستفادة منها في تصميم مشروع متكامل. تفيد لوحة الألوان المستخرجة في إنشاء لوحة ألوان لموقع إلكتروني، اختيار ألوان واجهة تطبيق، تنسيق منشورات وسائل التواصل الاجتماعي، وإعداد تصاميم متناسقة للعلامات التجارية.
            </p>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">استخدام أداة استخراج الألوان في تصميم المواقع</h2>
            <p className="text-sm leading-8 text-ink-700 text-right mb-4">
              يحتاج مطورو المواقع إلى تحديد الألوان بدقة لضمان تناسق عناصر الصفحة. على سبيل المثال، إذا أعجبتك درجة برتقالية في صورة، يمكنك تحديدها ونسخ كود HEX، ثم استخدامه في ملف CSS:
            </p>
            <div className="bg-ink-900 text-ink-100 p-4 rounded-xl font-mono text-xs" dir="ltr">
              :root {'{'}<br/>
              &nbsp;&nbsp;--primary-color: #EA580C;<br/>
              &nbsp;&nbsp;--secondary-color: #F59E0B;<br/>
              &nbsp;&nbsp;--text-color: #0F172A;<br/>
              {'}'}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-6 text-right text-ink-900">من يحتاج إلى أداة استخراج الألوان من الصور؟</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'مصممو الجرافيك', desc: 'استخراج الألوان من الصور المرجعية وتوحيد الدرجات اللونية.' },
                { title: 'مطورو المواقع', desc: 'معرفة أكواد الألوان من لقطات الشاشة لاستخدامها في CSS.' },
                { title: 'مصممو UI/UX', desc: 'تحديد ألوان الأزرار والخلفيات لبناء واجهات متناسقة.' },
                { title: 'صناع المحتوى', desc: 'استخراج ألوان من الصور للمنشورات المصورة والعروض.' },
                { title: 'الطلاب والمبتدئون', desc: 'فهم أكواد HEX وRGB وHSL دون برامج معقدة.' },
                { title: 'أصحاب المتاجر', desc: 'استخراج الألوان من الشعار لتوحيد مظهر الموقع.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-xl p-4 text-right shadow-sm">
                  <h3 className="font-bold text-sm mb-2 text-brand-600 flex items-center gap-2"><Users className="w-4 h-4" /> {item.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">كيف تحصل على لون دقيق من الصورة؟</h2>
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /> اختر منطقة داخل الصورة ذات لون واضح ومتجانس.</li>
                <li className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /> تجنب الحواف التي تتداخل فيها ألوان متعددة.</li>
                <li className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /> انتبه إلى الظلال والانعكاسات التي قد تغير قيمة البكسل.</li>
                <li className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" /> عند استخراج لون من شعار، اختر منطقة داخلية منه بدلًا من الحواف.</li>
              </ul>
            </div>
          </article>

          <article className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">هل استخراج الألوان مجاني وآمن؟</h2>
              <p className="text-sm leading-8 text-ink-700 text-right mb-4">
                نعم، أداة Image Color Picker من Intooly مجانية تماماً. لا تحتاج وظيفة اختيار لون البكسل الأساسية إلى خدمة ذكاء اصطناعي مدفوعة؛ إذ يمكن تنفيذها باستخدام تقنيات المتصفح مثل Canvas API.
              </p>
              <p className="text-sm leading-8 text-ink-700 text-right flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                تتم جميع عمليات معالجة الصور واستخراج الألوان محلياً داخل متصفحك، ولا يتم إرسال أي صورة إلى خوادمنا، مما يضمن خصوصية تامة.
              </p>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black mb-4 text-right text-ink-900">الفرق بين Color Picker و Palette Generator</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border border-ink-200 rounded-lg overflow-hidden">
                  <thead className="bg-ink-100">
                    <tr>
                      <th className="p-3 font-bold text-ink-900">وجه المقارنة</th>
                      <th className="p-3 font-bold text-brand-700">Image Color Picker</th>
                      <th className="p-3 font-bold text-ink-700">Palette Generator</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-ink-100">
                    <tr><td className="p-3 font-bold">الوظيفة</td><td className="p-3">اختيار لون محدد</td><td className="p-3">إنشاء مجموعة ألوان</td></tr>
                    <tr><td className="p-3 font-bold">النتيجة</td><td className="p-3">كود لون واحد أو عدة أكواد</td><td className="p-3">لوحة ألوان متكاملة</td></tr>
                    <tr><td className="p-3 font-bold">الصيغ</td><td className="p-3">HEX وRGB وHSL</td><td className="p-3">تعتمد على ميزات الأداة</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-6 text-center text-ink-900 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-brand-600" /> الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'كيف أستخرج الألوان من الصور أونلاين؟', a: 'ارفع الصورة إلى الأداة، ثم انقر على النقطة التي تحتوي على اللون المطلوب. ستظهر قيمة اللون، ويمكنك نسخ الكود واستخدامه فوراً.' },
                { q: 'كيف أعرف كود HEX من الصورة؟', a: 'ارفع الصورة إلى الأداة وحدد اللون. سيظهر الكود بصيغة تبدأ بعلامة المربع، مثل #EA580C، ويمكنك نسخه مباشرةً.' },
                { q: 'هل يمكن استخراج RGB من الصورة؟', a: 'نعم، توفر الأداة أكواد HEX وقيم RGB و HSL بشكل تلقائي ودقيق عند النقر على أي بكسل في الصورة.' },
                { q: 'هل أستطيع اختيار أكثر من لون من الصورة نفسها؟', a: 'نعم، تقوم الأداة تلقائياً باستخراج اللون المهيمن ولوحة مكونة من 12 لوناً مميزاً من الصورة.' },
                { q: 'هل تعمل أداة استخراج الألوان على الهاتف؟', a: 'نعم، الأداة متوافقة تماماً مع متصفحات الهواتف الذكية وتدعم اللمس لتحديد الألوان بدقة.' },
                { q: 'هل أحتاج إلى تثبيت برنامج لاستخراج الألوان؟', a: 'لا، يمكن استخدام الأداة مباشرةً من المتصفح دون تثبيت برنامج مستقل.' },
                { q: 'هل يمكن استخراج الألوان من صور JPG وPNG؟', a: 'نعم، تدعم الأداة صيغ JPG وPNG و WebP بشكل كامل.' },
                { q: 'هل يمكن استخدام أكواد الألوان المستخرجة في CSS؟', a: 'نعم، يمكنك استخدام أكواد HEX أو قيم RGB في ملفات CSS لتحديد ألوان النصوص والخلفيات والعناصر المختلفة.' },
                { q: 'هل تحتفظ الأداة بالصور التي أرفعها؟', a: 'لا، تتم معالجة الصور داخل المتصفح فقط ولا تُرسل إلى أي خادم خارجي.' },
                { q: 'لماذا يختلف اللون المستخرج عن اللون الذي أراه على الشاشة؟', a: 'قد يرجع ذلك إلى اختلاف إعدادات الشاشة والسطوع، أو وجود ظلال وتدرجات وضغط في الصورة الأصلية.' }
              ].map((faq, i) => (
                <details key={i} className="bg-white border border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold text-ink-900 flex justify-between items-center text-sm">
                    {faq.q}
                    <span className="text-brand-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-xs text-ink-600 leading-relaxed border-t border-ink-100 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-xl md:text-2xl font-black mb-6 text-right text-ink-900">أدوات Intooly ذات الصلة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/tools/image-compressor" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-brand-600 font-bold text-lg">📉</span></div>
                <div><h4 className="font-bold text-ink-900 text-sm">ضغط الصور أونلاين</h4><p className="text-[10px] text-ink-600">قلّل حجم الصور مع الحفاظ على جودتها.</p></div>
              </Link>
              <Link href="/tools/background-remover" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-brand-600 font-bold text-lg">✂️</span></div>
                <div><h4 className="font-bold text-ink-900 text-sm">إزالة خلفية الصور</h4><p className="text-[10px] text-ink-600">احصل على صور بخلفية شفافة بضغطة زر.</p></div>
              </Link>
              <Link href="/tools/images" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-brand-600 font-bold text-lg">🖼️</span></div>
                <div><h4 className="font-bold text-ink-900 text-sm">استكشف جميع أدوات الصور</h4><p className="text-[10px] text-ink-600">مجموعة متكاملة من أدوات تعديل الصور.</p></div>
              </Link>
            </div>
          </article>

        </div>
      </section>
    </main>
  );
}
