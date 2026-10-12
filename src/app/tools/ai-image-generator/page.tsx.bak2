'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  Trash2,
  WandSparkles,
  AlertTriangle,
  ShieldCheck,
  History,
} from 'lucide-react';

import { useImageGeneration } from '@/lib/ai-image-generator/use-image-generation';
import {
  STYLES,
  DIMENSIONS,
  MAX_HISTORY,
  HISTORY_STORAGE_KEY,
  DEFAULT_NEGATIVE_PROMPT,
} from '@/lib/ai-image-generator/constants';
import type { StyleKey, RatioKey, HistoryItem } from '@/lib/ai-image-generator/types';

function downloadImage(dataUrl: string, name: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function AIImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [style, setStyle] = useState<StyleKey>('realistic');
  const [ratio, setRatio] = useState<RatioKey>('1:1');
  const [steps, setSteps] = useState(20);
  const [seed, setSeed] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const { generate, isLoading, status, error, setError, engineReady } =
    useImageGeneration();

  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* تجاهل أخطاء التخزين */
    }
  }, []);

  const saveHistory = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      setError('مساحة التخزين المحلية ممتلئة. نزّل الصور المهمة ثم امسح السجل.');
    }
  }, [setError]);

  async function handleGenerate() {
    setResult(null);
    setError('');

    if (!prompt.trim()) {
      setError('اكتب وصفًا للصورة أولًا.');
      return;
    }

    const [width, height] = DIMENSIONS[ratio] ?? DIMENSIONS['1:1'];
    const fullPrompt = `${prompt.trim()}, ${STYLES[style] ?? STYLES.realistic}`;

    try {
      const dataUrl = await generate({
        prompt: fullPrompt,
        negativePrompt: negativePrompt.trim(),
        steps,
        width,
        height,
        seed,
      });

      setResult(dataUrl);
      saveHistory(
        [
          {
            id: crypto.randomUUID(),
            prompt: prompt.trim(),
            dataUrl,
            createdAt: Date.now(),
          },
          ...history,
        ].slice(0, MAX_HISTORY)
      );
    } catch {
      /* الخطأ معروض في الـ hook */
    }
  }

  function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('اختر ملف صورة صالحًا.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('الحد الأقصى لحجم الصورة 12 ميغابايت.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(String(reader.result));
      setError('');
    };
    reader.readAsDataURL(file);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-violet-100">
            <Sparkles className="h-4 w-4" /> Intooly AI Studio
          </span>
          <h1 className="flex flex-wrap items-center gap-3 text-3xl font-black tracking-tight sm:text-5xl">
            <WandSparkles className="h-10 w-10 text-violet-300 drop-shadow-[0_0_12px_rgba(196,181,253,0.7)]" />
            مولّد الصور بالذكاء الاصطناعي
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-indigo-100 sm:text-lg">
            حوّل أفكارك إلى صور فنية مباشرة في متصفحك. لا تحتاج إلى مفتاح API،
            وتبقى عملية التوليد على جهازك.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-indigo-100">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> معالجة محلية
            </span>
            <span>• تنزيل PNG</span>
            <span>• أنماط فنية متعددة</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="h-fit space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label htmlFor="prompt" className="mb-2 block text-sm font-bold">
              صف الصورة التي تريد إنشاءها
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="مثال: مدينة مستقبلية ليلًا بإضاءة نيون وتفاصيل سينمائية…"
              className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-7 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label htmlFor="negative" className="mb-2 block text-sm font-bold">
              عناصر لا تريدها (اختياري)
            </label>
            <input
              id="negative"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">النمط الفني</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleKey)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
            >
              <option value="realistic">واقعي</option>
              <option value="digital">فن رقمي</option>
              <option value="anime">أنمي</option>
              <option value="watercolor">ألوان مائية</option>
              <option value="oil">رسم زيتي</option>
              <option value="3d">ثلاثي الأبعاد</option>
              <option value="minimal">بسيط</option>
              <option value="fantasy">خيالي</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-bold">نسبة اللوحة</label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value as RatioKey)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">خطوات التوليد</label>
              <select
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value={10}>10 — أسرع</option>
                <option value={20}>20 — متوازن</option>
                <option value={30}>30 — أبطأ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Seed (اختياري)</label>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              inputMode="numeric"
              placeholder="اتركه فارغًا للتلقائي"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-3">
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-3 text-sm font-semibold text-violet-800 hover:bg-violet-100"
            >
              <ImagePlus className="h-4 w-4" /> رفع صورة للتعديل
            </button>
            {uploadPreview && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={uploadPreview}
                  alt="الصورة المرفوعة"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <p className="flex-1 text-xs leading-5 text-slate-600">
                  تم تحميل الصورة محليًا. التعديل التوليدي يحتاج نموذج
                  Image-to-Image منفصلًا.
                </p>
                <button
                  onClick={() => setUploadPreview(null)}
                  aria-label="إزالة الصورة"
                  className="rounded-lg p-2 hover:bg-violet-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800"
            >
              <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {status && (
            <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
              {status}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:brightness-110 disabled:opacity-60"
          >
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {isLoading ? 'جارٍ إنشاء الصورة…' : 'إنشاء الصورة'}
          </button>

          <p className="text-xs leading-6 text-slate-500">
            يتطلب المحرك متصفحًا يدعم WebGPU وذاكرة رسومية مناسبة. قد يستغرق
            التحميل الأول وقتًا طويلًا.
          </p>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-bold">معاينة الصورة</h2>
                <p className="mt-1 text-xs text-slate-500">
                  تظهر النتيجة هنا بعد اكتمال التوليد
                </p>
              </div>
              {engineReady && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  المحرك جاهز
                </span>
              )}
            </div>

            <div className="flex min-h-[360px] items-center justify-center bg-slate-100 p-5 sm:min-h-[540px]">
              {result ? (
                <div className="w-full max-w-3xl">
                  <img
                    src={result}
                    alt={prompt || 'صورة مولدة بالذكاء الاصطناعي'}
                    className="mx-auto max-h-[620px] max-w-full rounded-xl object-contain shadow-lg"
                  />
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() =>
                        downloadImage(
                          result,
                          `intooly-ai-image-${Date.now()}.png`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
                    >
                      <Download className="h-4 w-4" /> تنزيل PNG
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-sm">
                    <WandSparkles className="h-9 w-9" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    صورتك القادمة تبدأ من فكرة
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    اكتب وصفًا واضحًا واختر النمط الفني ثم اضغط «إنشاء الصورة».
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-violet-600" />
                <h2 className="font-bold">الصور الأخيرة</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {history.length}
                </span>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => saveHistory([])}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  مسح السجل
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                لا توجد صور محفوظة بعد. يحفظ المتصفح آخر النتائج محليًا.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <button
                      onClick={() => {
                        setResult(item.dataUrl);
                        setPrompt(item.prompt);
                      }}
                      className="block w-full"
                    >
                      <img
                        src={item.dataUrl}
                        alt={item.prompt}
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                    <div className="p-2">
                      <p className="line-clamp-2 min-h-9 text-xs text-slate-600">
                        {item.prompt}
                      </p>
                      <button
                        onClick={() =>
                          downloadImage(item.dataUrl, `intooly-${item.id}.png`)
                        }
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700"
                      >
                        <Download className="h-3 w-3" /> تنزيل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="border-t border-slate-200 bg-white">
        <article className="mx-auto max-w-4xl px-4 py-12 text-right">
          <h2 className="text-2xl font-black">
            ما هو مولّد الصور بالذكاء الاصطناعي؟
          </h2>
          <p className="mt-4 leading-8 text-slate-600">
            مولّد الصور بالذكاء الاصطناعي يحوّل الوصف النصي إلى صورة رقمية. يتيح
            لك Intooly تجربة أنماط مثل التصوير الواقعي والفن الرقمي والأنمي
            والألوان المائية. في هذا الإصدار التجريبي، يجري التوليد محليًا
            باستخدام WebGPU ولا يتطلب مفتاح API.
          </p>
          <h3 className="mt-8 text-xl font-bold">الخصوصية ومتطلبات التشغيل</h3>
          <p className="mt-3 leading-8 text-slate-600">
            تُنزّل ملفات النموذج إلى المتصفح عند الاستخدام الأول. لا تُرسل الصور
            إلى API توليد. يحتاج التشغيل إلى متصفح وجهاز متوافقين، وقد لا تعمل
            الأداة على الأجهزة القديمة أو الهواتف محدودة الذاكرة.
          </p>
        </article>
      </section>
      {/* قسم SEO */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="prose prose-slate prose-lg max-w-none text-right">
            <h2 className="text-3xl font-black text-slate-900 mb-6">
              مولّد الصور بالذكاء الاصطناعي المجاني — Intooly
            </h2>
            <p className="text-slate-700 leading-8 mb-6">
              أداة مولّد الصور بالذكاء الاصطناعي من Intooly تتيح لك تحويل أي وصف نصي إلى صورة احترافية عالية الجودة في ثوانٍ. اكتب وصفًا بالعربية أو الإنجليزية، واختر النمط الفني، واحصل على صورتك مباشرة.
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
              لماذا تختار أداة توليد الصور من Intooly؟
            </h3>
            <ul className="space-y-3 text-slate-700 leading-8">
              <li>✓ دعم كامل للغة العربية مع ترجمة تلقائية.</li>
              <li>✓ صور واقعية بجودة احترافية باستخدام نماذج FLUX.</li>
              <li>✓ مجاني بالكامل بدون حدود يومية أو مفتاح API.</li>
              <li>✓ أنماط فنية متعددة: واقعي، أنمي، ألوان مائية، زيتي، ثلاثي الأبعاد.</li>
              <li>✓ نسب مختلفة: 1:1، 4:3، 3:4، 16:9.</li>
            </ul>
            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
              كيف تستخدم مولّد الصور؟
            </h3>
            <ol className="space-y-3 text-slate-700 leading-8 list-decimal list-inside">
              <li>اكتب وصفًا واضحًا للصورة.</li>
              <li>اختر النمط الفني.</li>
              <li>حدّد نسبة اللوحة.</li>
              <li>اضغط زر "إنشاء الصورة".</li>
              <li>حمّل النتيجة بضغطة واحدة.</li>
            </ol>
            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
              أسئلة شائعة
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">هل الأداة مجانية؟</h4>
                <p className="text-slate-700 leading-8">نعم، مجانية بالكامل من جانب Intooly بدون تسجيل أو حدود يومية.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">هل يمكنني استخدام الوصف بالعربية؟</h4>
                <p className="text-slate-700 leading-8">نعم، يتم ترجمة وصفك تلقائيًا إلى الإنجليزية قبل التوليد.</p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">ما أفضل وصف للحصول على صورة واقعية؟</h4>
                <p className="text-slate-700 leading-8">كلما كان الوصف أكثر تفصيلًا، كانت النتيجة أفضل. اذكر الكاميرا، الإضاءة، والخلفية.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}