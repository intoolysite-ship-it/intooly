'use client';

import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  Image as ImageIcon, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Wand2,
  Palette
} from 'lucide-react';

export default function AIImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');

  // هنا يتم استدعاء دالة التوليد الفعلية (التي تستخدم نموذج AI)
  // يمكنك استبدال هذا الجزء بالكود الفعلي للأداة
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('يرجى كتابة وصف للصورة أولاً.');
      return;
    }
    setError('');
    setIsGenerating(true);
    
    // محاكاة عملية التوليد (استبدلها بالكود الحقيقي)
    setTimeout(() => {
      setGeneratedImage('https://placehold.co/800x600/e2e8f0/94a3b8?text=Generated+Image');
      setIsGenerating(false);
    }, 2000);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'intooly-ai-image.jpg';
    link.click();
  };

  return (
    <main dir="rtl" className="min-h-screen bg-ink-50 text-ink-900 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Hero - متطابق مع هوية Intooly */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-brand-600" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-ink-900">
              مولّد الصور بالذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-ink-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            حوّل أفكارك إلى صور فنية مباشرة في متصفحك. لا تحتاج إلى مفتاح API، وتبقى عملية التوليد على جهازك.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4 text-sm">
            <span className="bg-white border border-ink-200 px-3 py-1 rounded-full text-ink-700">معالجة محلية</span>
            <span className="bg-white border border-ink-200 px-3 py-1 rounded-full text-ink-700">تنزيل JPEG</span>
            <span className="bg-white border border-ink-200 px-3 py-1 rounded-full text-ink-700">أنماط فنية متعددة</span>
            <span className="bg-white border border-ink-200 px-3 py-1 rounded-full text-ink-700">مقاسات مخصصة</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* لوحة الإعدادات (يمين) */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-brand-600" />
              إعدادات التوليد
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">وصف الصورة</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="مثال: قطة لطيفة تجلس على القمر، إضاءة ليلية، ألوان زاهية..."
                  className="w-full h-32 p-3 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">النمط الفني</label>
                <div className="grid grid-cols-3 gap-2">
                  {['واقعي', 'أنمي', 'زيتي'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`py-2 px-3 rounded-lg border text-sm font-semibold transition ${
                        style === s ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">نسبة العرض</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1:1', '4:3', '3:4', '16:9'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`py-2 px-2 rounded-lg border text-sm font-semibold transition ${
                        aspectRatio === r ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-ink-200 text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateImage}
                disabled={isGenerating}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> جاري التوليد...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> إنشاء الصورة</>
                )}
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* لوحة المعاينة (يسار) */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-600" />
              معاينة الصورة
            </h2>
            
            <div className="flex-1 min-h-[300px] bg-ink-50 rounded-xl border border-dashed border-ink-300 flex items-center justify-center p-4 relative overflow-hidden">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated" className="max-h-full max-w-full object-contain rounded-lg shadow-md" />
              ) : (
                <div className="text-center text-ink-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>ستظهر النتيجة هنا بعد اكتمال التوليد</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={downloadImage}
                  className="flex-1 bg-ink-900 hover:bg-ink-800 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> تنزيل الصورة
                </button>
                <button
                  onClick={generateImage}
                  className="bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 font-bold py-2.5 px-4 rounded-xl transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content - بنفس هوية الموقع */}
        <div className="mt-16 space-y-8">
          <section className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">لماذا تختار أداة توليد الصور من Intooly؟</h2>
            <ul className="space-y-2 text-ink-600">
              <li className="flex items-start gap-2">✓ دعم كامل للغة العربية مع ترجمة تلقائية.</li>
              <li className="flex items-start gap-2">✓ صور واقعية بجودة احترافية باستخدام نماذج FLUX.</li>
              <li className="flex items-start gap-2">✓ مجاني بالكامل بدون حدود يومية أو مفتاح API.</li>
              <li className="flex items-start gap-2">✓ أنماط فنية متعددة: واقعي، أنمي، ألوان مائية، زيتي، ثلاثي الأبعاد.</li>
              <li className="flex items-start gap-2">✓ نسب مختلفة: 1:1، 4:3، 3:4، 16:9، وأبعاد مخصصة.</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">كيف تستخدم مولّد الصور؟</h2>
            <ol className="list-decimal list-inside space-y-2 text-ink-600">
              <li>اكتب وصفًا واضحًا للصورة.</li>
              <li>اختر النمط الفني.</li>
              <li>حدّد نسبة اللوحة أو استخدم المقاس المخصص.</li>
              <li>اضغط زر "إنشاء الصورة".</li>
              <li>حمّل النتيجة بضغطة واحدة.</li>
            </ol>
          </section>
        </div>

      </div>
    </main>
  );
}