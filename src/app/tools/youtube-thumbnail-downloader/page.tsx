"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Copy, CheckCircle2, AlertTriangle, Image as ImageIcon, Trash2, Clock } from "lucide-react";

const faqQuestions = [
  { q: "كيف يمكن تحميل الصورة المصغرة من يوتيوب؟", a: "انسخ رابط فيديو YouTube، ثم افتح أداة تحميل الصورة المصغرة من Intooly والصق الرابط. بعد استخراج الصور المتاحة، اختر النسخة المناسبة واضغط على زر التنزيل لحفظها على جهازك." },
  { q: "هل يمكن تحميل الصورة المصغرة من يوتيوب مجانًا؟", a: "نعم، يمكنك استخدام أداة Intooly لاستخراج الصور المصغرة المتاحة مجانًا وفقًا لحدود الاستخدام المعلنة، دون الحاجة إلى تثبيت برنامج أو إنشاء حساب." },
  { q: "كيف أحمل الصورة المصغرة بجودة HD؟", a: "الصق رابط الفيديو في الأداة، ثم افحص الأحجام المتاحة واختر أعلى نسخة يمكن الوصول إليها. قد تختلف الدقة من فيديو إلى آخر، ولا تتوفر أعلى نسخة لجميع الفيديوهات." },
  { q: "هل يمكن تحميل الصورة المصغرة بدقة 1080p؟", a: "يعتمد ذلك على الصورة المتاحة للفيديو. لا ينبغي افتراض أن كل فيديو يوفر صورة مصغرة بدقة 1080p؛ فالأداة تعرض أبعاد النسخ الفعلية التي تجدها." },
  { q: "هل يمكن تحميل الصورة المصغرة بدقة 4K؟", a: "لا يعني وجود فيديو بدقة 4K أن صورته المصغرة متوفرة بدقة 4K. تعتمد دقة الصورة على النسخة التي يوفرها يوتيوب، ويمكن للأداة عرض أعلى دقة متاحة فقط." },
  { q: "هل تعمل أداة تحميل الصورة المصغرة على الهاتف؟", a: "نعم، يمكنك استخدام الأداة من متصفح الهاتف، سواء كان Android أو iPhone، ثم نسخ رابط الفيديو واستخراج الصورة وحفظها بحسب إمكانيات المتصفح." },
  { q: "هل يمكن تحميل الصورة المصغرة من رابط Shorts؟", a: "يمكن محاولة استخراج صورة الفيديو من روابط YouTube Shorts إذا كانت الصورة متاحة ويمكن الوصول إليها بالطريقة التي تستخدمها الأداة." },
  { q: "هل أستطيع تحميل الصورة المصغرة لأي فيديو على يوتيوب؟", a: "يمكن استخراج الصور المصغرة للفيديوهات التي تتوفر صورها ويمكن الوصول إليها. وقد لا تعمل الأداة مع الفيديوهات الخاصة أو المحذوفة أو المقيدة." },
  { q: "ما الفرق بين maxresdefault وhqdefault؟", a: "تشير هذه الأسماء إلى نسخ مختلفة من الصور المصغرة التي قد يوفرها يوتيوب. وتكون maxresdefault عادةً النسخة الأعلى دقة عند توفرها، بينما hqdefault نسخة شائعة بدقة أقل. يجب التحقق من الأبعاد الفعلية بدل الاعتماد على الاسم وحده." },
  { q: "هل أحتاج إلى تثبيت برنامج لتحميل الصور المصغرة؟", a: "لا، يمكنك استخدام أداة Intooly مباشرة من المتصفح، دون الحاجة إلى تثبيت برنامج أو إضافة متصفح." },
  { q: "هل يمكن تحميل الصورة المصغرة بصيغة JPG؟", a: "تتوفر الصور المصغرة الشائعة في يوتيوب بصيغة JPG. ويمكن تنزيلها بصيغتها الأصلية دون تحويل غير ضروري." },
  { q: "لماذا لا تظهر الصورة المصغرة بعد لصق الرابط؟", a: "قد يكون الرابط غير صحيح، أو الفيديو غير متاح، أو أن الصورة بالحجم المطلوب غير موجودة. تحقق من الرابط وجرب استخراج الأحجام الأخرى المتاحة." },
  { q: "هل يمكن نسخ رابط الصورة المصغرة بدل تنزيلها؟", a: "يمكن توفير زر لنسخ رابط الصورة المباشر إذا كانت الصورة متاحة، بحيث يمكنك فتحها أو استخدامها في تطبيقات التصميم والمستندات." },
  { q: "هل يمكن استخدام الصورة المصغرة في تصميماتي؟", a: "يمكنك استخدام الصور التي تملك حقوقها أو حصلت على إذن باستخدامها. أما الصور الخاصة بفيديوهات الآخرين، فيجب احترام حقوق أصحابها وشروط الاستخدام قبل إعادة نشرها أو استخدامها تجاريًا." }
];

type ThumbnailSize = {
  key: string;
  label: string;
  resolution: string;
  url: string;
  exists: boolean;
  isBest: boolean;
};

export default function ThumbnailDownloaderPage() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [thumbnails, setThumbnails] = useState<ThumbnailSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("thumb_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const extractVideoId = (inputUrl: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = inputUrl.match(regex);
    return match ? match[1] : null;
  };

  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleExtract = async () => {
    setError("");
    setThumbnails([]);
    const id = extractVideoId(url);
    
    if (!id) {
      setError("رابط يوتيوب غير صالح. يرجى التأكد من نسخ الرابط بشكل صحيح.");
      return;
    }

    setVideoId(id);
    setLoading(true);

    const newHistory = [url, ...history.filter(h => h !== url)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("thumb_history", JSON.stringify(newHistory));

    const sizes = [
      { key: "maxresdefault", label: "أعلى دقة متاحة (Max Res)", resolution: "1280x720 (HD)" },
      { key: "sddefault", label: "دقة قياسية (SD)", resolution: "640x480" },
      { key: "hqdefault", label: "جودة عالية (HQ)", resolution: "480x360" },
      { key: "mqdefault", label: "جودة متوسطة (MQ)", resolution: "320x180" },
      { key: "default", label: "جودة افتراضية (Default)", resolution: "120x90" },
    ];

    const results: ThumbnailSize[] = [];
    let foundBest = false;

    for (const size of sizes) {
      const imgUrl = `https://img.youtube.com/vi/${id}/${size.key}.jpg`;
      const exists = await checkImageExists(imgUrl);
      results.push({ key: size.key, label: size.label, resolution: size.resolution, url: imgUrl, exists, isBest: size.key === "maxresdefault" && exists });
      if (size.key === "maxresdefault" && exists) foundBest = true;
    }

    if (!foundBest) {
      const hq = results.find(r => r.key === "hqdefault");
      if (hq) hq.isBest = true;
    }

    setThumbnails(results.filter(t => t.exists));
    setLoading(false);
  };

  const downloadImage = async (imgUrl: string, filename: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(imgUrl, "_blank");
    }
  };

  const copyLink = async (link: string, id: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("thumb_history");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/video" className="font-medium transition hover:text-orange-600">أدوات الفيديو</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">تحميل الصورة المصغرة</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <ImageIcon size={16} />
            أداة مجانية 100% - لا تتطلب تسجيل دخول
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            تحميل الصورة المصغرة من يوتيوب بجودة عالية
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم أداة تحميل الصورة المصغرة من Intooly لاستخراج صور فيديوهات يوتيوب وتنزيلها بجودات وأحجام مختلفة. الصق رابط الفيديو، واعرض الصورة واحفظها بسهولة مجانًا.
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="الصق رابط فيديو يوتيوب هنا (مثال: https://youtu.be/...)"
                className="w-full rounded-xl border border-slate-300 px-4 py-4 pr-12 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
              />
              <button
                onClick={() => navigator.clipboard.readText().then(setUrl).catch(() => {})}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                title="لصق من الحافظة"
              >
                <Copy size={20} />
              </button>
            </div>
            <button
              onClick={handleExtract}
              disabled={loading || !url}
              className="rounded-xl bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "جاري المعالجة..." : "استخراج الصورة"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} /> {error}
            </div>
          )}

          {history.length > 0 && !videoId && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Clock size={16}/> روابط حديثة</h3>
                <button onClick={clearHistory} className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"><Trash2 size={14}/> مسح</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setUrl(h); }} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg truncate max-w-[200px] transition">
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {thumbnails.length > 0 && (
          <section className="mb-10 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 text-right">الصور المصغرة المتاحة</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {thumbnails.map((thumb) => (
                <div key={thumb.key} className={`rounded-2xl border p-4 transition ${thumb.isBest ? "border-orange-400 bg-orange-50/30 ring-2 ring-orange-100" : "border-slate-200 bg-white"}`}>
                  {thumb.isBest && (
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-1 text-xs font-bold text-white">
                      <CheckCircle2 size={12} /> الأفضل متاح
                    </div>
                  )}
                  <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                    <img src={thumb.url} alt={thumb.label} className="w-full h-full object-cover" />
                  </div>
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900">{thumb.label}</h3>
                    <p className="text-sm text-slate-500 font-mono mt-1">{thumb.resolution}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadImage(thumb.url, `youtube-thumbnail-${thumb.key}.jpg`)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
                    >
                      <Download size={16} /> تنزيل
                    </button>
                    <button
                      onClick={() => copyLink(thumb.url, thumb.key)}
                      className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {copiedId === thumb.key ? <CheckCircle2 size={16} className="text-green-600"/> : <Copy size={16} />}
                      {copiedId === thumb.key ? "تم النسخ" : "نسخ الرابط"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEO Content Section - Updated with your exact text */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل الصورة المصغرة من يوتيوب بجودة عالية</h2>
            <p className="mt-3 leading-8 text-slate-600">هل تريد <strong>تحميل الصورة المصغرة</strong> لفيديو على YouTube والاحتفاظ بها بجودة عالية؟ توفر لك أداة تحميل الصورة المصغرة من Intooly طريقة سهلة لاستخراج صورة غلاف الفيديو وتنزيلها مباشرة من خلال رابط يوتيوب، دون الحاجة إلى تثبيت برامج أو استخدام أدوات معقدة.</p>
            <p className="mt-3 leading-8 text-slate-600">كل ما عليك فعله هو نسخ رابط الفيديو ولصقه في مربع الإدخال، وستحاول الأداة استخراج الصورة المصغرة وعرض الأحجام والجودات المتاحة. يمكنك معاينة الصورة قبل تنزيلها، واختيار النسخة المناسبة، ثم حفظها على هاتفك أو جهاز الكمبيوتر.</p>
            <p className="mt-3 leading-8 text-slate-600">سواء كنت صانع محتوى أو مصممًا أو صاحب قناة يوتيوب أو تحتاج إلى صورة الفيديو لاستخدامها في مشروعك، تساعدك أداة Intooly على الوصول إلى الصور المصغرة المتاحة بسهولة وسرعة.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة تحميل الصورة المصغرة من يوتيوب؟</h2>
            <p className="mt-3 leading-8 text-slate-600">أداة تحميل الصورة المصغرة هي خدمة أونلاين تتيح استخراج صورة الغلاف المرتبطة بفيديو YouTube وتنزيلها من خلال رابط الفيديو. تُعرف هذه الصورة باسم Thumbnail، وهي الصورة التي تظهر للمشاهدين قبل تشغيل الفيديو وتساعدهم على معرفة موضوعه وجذب انتباههم.</p>
            <p className="mt-3 leading-8 text-slate-600">بدلًا من التقاط لقطة شاشة من الفيديو أو البحث عن الصورة يدويًا، يمكنك استخدام أداة تحميل الصورة المصغرة من Intooly للحصول على الصورة المتاحة من مصدر الفيديو الأصلي.</p>
            <p className="mt-3 leading-8 text-slate-600">تتيح الأداة إدخال رابط يوتيوب، والتعرف على معرّف الفيديو، ثم محاولة عرض الصور المصغرة المتوفرة بمقاسات مختلفة. ويمكنك اختيار الصورة المناسبة وتنزيلها بالصيغة والجودة التي يوفرها المصدر.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية تحميل الصورة المصغرة من يوتيوب</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك تنزيل صورة مصغرة لأي فيديو متاح عبر الخطوات التالية:</p>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>افتح فيديو YouTube الذي تريد تحميل صورته المصغرة.</li>
              <li>انسخ رابط الفيديو من شريط العنوان أو من خيار المشاركة.</li>
              <li>افتح أداة تحميل الصورة المصغرة من Intooly.</li>
              <li>الصق رابط الفيديو في مربع الإدخال.</li>
              <li>اضغط على زر استخراج الصورة المصغرة.</li>
              <li>انتظر حتى يتم التعرف على الفيديو وجلب الصور المتاحة.</li>
              <li>شاهد معاينة الصورة واختر الحجم أو الجودة المناسبة.</li>
              <li>اضغط على زر تحميل الصورة المصغرة لحفظها على جهازك.</li>
            </ol>
            <p className="mt-4 leading-8 text-slate-600">لا تحتاج إلى تثبيت برنامج أو إضافة متصفح. يمكنك تنفيذ الخطوات مباشرة من متصفح الهاتف أو الكمبيوتر.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل الصورة المصغرة بجودات وأحجام مختلفة</h2>
            <p className="mt-3 leading-8 text-slate-600">لا توفر جميع فيديوهات يوتيوب الصور المصغرة بالأحجام نفسها؛ إذ تختلف الخيارات المتاحة حسب الفيديو ومصدر الصورة. لذلك من الأفضل أن تعرض الأداة جميع النسخ التي يمكن الوصول إليها بدلًا من افتراض وجود كل المقاسات.</p>
            <p className="mt-3 leading-8 text-slate-600">من أسماء الصور الشائعة التي يمكن فحصها:</p>
            <ul className="mt-4 list-disc list-inside space-y-2 leading-8 text-slate-600">
              <li><strong>maxresdefault.jpg:</strong> نسخة عالية الدقة عندما تكون متاحة للفيديو.</li>
              <li><strong>sddefault.jpg:</strong> نسخة قياسية أكبر من الصور المصغرة الصغيرة.</li>
              <li><strong>hqdefault.jpg:</strong> صورة مصغرة بجودة مرتفعة شائعة الاستخدام.</li>
              <li><strong>mqdefault.jpg:</strong> صورة مصغرة متوسطة الحجم.</li>
              <li><strong>default.jpg:</strong> النسخة الافتراضية ذات المقاس الأصغر.</li>
            </ul>
            <p className="mt-4 leading-8 text-slate-600">قد تختلف أبعاد الصورة الفعلية، وقد لا تتوفر بعض النسخ لكل فيديو. لذلك تعرض أداة Intooly الأحجام الموجودة فعلًا، وتوضح للمستخدم إذا كانت النسخة المطلوبة غير متاحة.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي الصورة المصغرة في يوتيوب؟</h2>
            <p className="mt-3 leading-8 text-slate-600">الصورة المصغرة أو YouTube Thumbnail هي الصورة التي تمثل الفيديو وتظهر بجوار عنوانه في نتائج البحث والصفحة الرئيسية والاقتراحات وقوائم التشغيل.</p>
            <p className="mt-3 leading-8 text-slate-600">تؤدي الصورة المصغرة دورًا مهمًا في جذب انتباه المشاهد وإعطائه فكرة سريعة عن محتوى الفيديو. ولهذا يهتم بها صناع المحتوى والمصممون وأصحاب القنوات، ويحتاجون أحيانًا إلى تحميل صور مصغرة من فيديوهات مختلفة لأغراض التصميم أو الدراسة أو الأرشفة.</p>
            <p className="mt-3 leading-8 text-slate-600">تكون الصورة المصغرة المخصصة عادةً من تصميم صاحب القناة، بينما قد يستخدم يوتيوب صورة تلقائية أو لقطة من الفيديو في بعض الحالات.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">مميزات أداة تحميل الصورة المصغرة من Intooly</h2>
            <p className="mt-3 leading-8 text-slate-600">تساعدك أداة Intooly على استخراج صور الفيديوهات من الروابط المدعومة دون الحاجة إلى البحث اليدوي عن ملفات الصور.</p>
            <p className="mt-3 leading-8 text-slate-600">ومن المزايا التي توفرها أو يمكن أن تتضمنها الأداة:</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-slate-600">
              {["استخراج الصورة المصغرة باستخدام رابط فيديو يوتيوب.", "عرض معاينة الصورة قبل التنزيل.", "فحص أحجام الصور المصغرة المتاحة.", "تنزيل أعلى نسخة متاحة من الصورة.", "اختيار الحجم المناسب حسب الاستخدام.", "عرض أبعاد الصورة قبل حفظها.", "نسخ رابط الصورة المباشر.", "فتح الصورة بحجمها الأصلي المتاح.", "تنزيل الصورة إلى الهاتف أو الكمبيوتر.", "دعم روابط يوتيوب العادية والقصيرة.", "دعم روابط Shorts عند توافقها مع طريقة استخراج الصورة.", "واجهة عربية سهلة الاستخدام.", "تصميم متوافق مع الهواتف والأجهزة اللوحية والكمبيوتر.", "عدم الحاجة إلى إنشاء حساب أو تثبيت برنامج.", "رسائل واضحة عند عدم العثور على صورة أو وجود رابط غير صحيح."].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> {item}</li>
              ))}
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل صورة مصغرة لفيديو يوتيوب من الهاتف</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك استخدام أداة تحميل الصورة المصغرة من Intooly على الهاتف دون الحاجة إلى تطبيق إضافي. افتح تطبيق YouTube أو موقعه من متصفح الهاتف، وانتقل إلى الفيديو المطلوب، ثم انسخ الرابط من خيار المشاركة. بعد ذلك افتح موقع Intooly والصق الرابط في أداة تحميل الصورة المصغرة.</p>
            <p className="mt-3 leading-8 text-slate-600">ستظهر الصورة المتاحة للمعاينة، ويمكنك اختيار النسخة المناسبة وحفظها في جهازك. تختلف طريقة الحفظ قليلًا حسب المتصفح ونظام التشغيل المستخدم.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل الصورة المصغرة من الكمبيوتر</h2>
            <p className="mt-3 leading-8 text-slate-600">إذا كنت تستخدم جهاز كمبيوتر أو لابتوب، يمكنك استخراج صورة الفيديو بسهولة من المتصفح. انسخ رابط الفيديو من YouTube، ثم انتقل إلى أداة Intooly والصق الرابط. بعد استخراج الصور المتاحة، اختر النسخة المناسبة واضغط على زر التنزيل لحفظها في مجلد التنزيلات أو الموقع الذي تحدده.</p>
            <p className="mt-3 leading-8 text-slate-600">تُعد هذه الطريقة مناسبة للمصممين وصناع المحتوى الذين يحتاجون إلى استخدام الصور المصغرة في أعمالهم أو تنظيمها ضمن ملفات مشاريعهم.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">لماذا يحتاج صناع المحتوى إلى تحميل الصور المصغرة؟</h2>
            <p className="mt-3 leading-8 text-slate-600">تساعد الصور المصغرة صناع المحتوى على دراسة أساليب التصميم وتحليل طريقة عرض الفيديوهات في قنوات مختلفة. ويمكن الاستفادة من الصور المتاحة في عدة استخدامات، منها:</p>
            <ul className="mt-4 list-disc list-inside space-y-2 leading-8 text-slate-600">
              <li>دراسة تصميم الصور المصغرة في القنوات المنافسة.</li>
              <li>تحليل الألوان والخطوط وتوزيع العناصر.</li>
              <li>جمع أمثلة مرجعية لتصميم صورة مصغرة جديدة.</li>
              <li>الاحتفاظ بصورة مصغرة لفيديو يملكه المستخدم.</li>
              <li>إعداد عروض تقديمية وتقارير عن المحتوى المرئي.</li>
              <li>تنظيم صور الفيديوهات ضمن مكتبة تصميم.</li>
              <li>مقارنة أساليب عرض الفيديوهات في مجال معين.</li>
            </ul>
            <p className="mt-4 leading-8 text-slate-600">يجب احترام حقوق أصحاب الصور والفيديوهات وعدم إعادة استخدام الصور أو نشرها تجاريًا دون امتلاك الحقوق أو الحصول على الإذن اللازم.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">هل يمكن تحميل الصورة المصغرة من رابط YouTube Shorts؟</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكن للأداة محاولة استخراج الصورة المصغرة من روابط YouTube Shorts عند توفر الصورة وإمكانية الوصول إليها بالطريقة المستخدمة. انسخ رابط Shorts والصقه في مربع الإدخال، ثم انتظر حتى يتم التعرف على الفيديو وعرض الصورة المتاحة. وقد تختلف الصور والأحجام المتوفرة عن الفيديوهات العادية.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">هل يمكن تحميل الصورة المصغرة من فيديو خاص أو محذوف؟</h2>
            <p className="mt-3 leading-8 text-slate-600">لا يمكن ضمان استخراج الصورة المصغرة من الفيديوهات الخاصة أو المحذوفة أو التي لا يمكن الوصول إلى بياناتها. وتعتمد إمكانية استخراج الصورة على توفرها وإمكانية الوصول إليها من مصدرها. إذا لم تتمكن الأداة من العثور على الصورة، فقد يكون الفيديو غير متاح أو أن الصورة المصغرة المطلوبة غير موجودة بالحجم المحدد.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الفرق بين تحميل الصورة المصغرة والتقاط لقطة شاشة من الفيديو</h2>
            <p className="mt-3 leading-8 text-slate-600">التقاط لقطة شاشة يعني حفظ إطار من الفيديو أثناء تشغيله، وقد لا تكون هذه اللقطة هي الصورة المصغرة الأصلية التي اختارها صاحب القناة. أما تحميل الصورة المصغرة فيتيح الحصول على صورة الغلاف المرتبطة بالفيديو نفسه، عندما تكون متاحة من المصدر. لذلك تكون أداة تحميل الصورة المصغرة أفضل عندما تريد الحصول على صورة الغلاف المستخدمة لتمثيل الفيديو بدلًا من اختيار إطار عشوائي منه.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">نصائح للحصول على أفضل صورة مصغرة</h2>
            <ul className="mt-4 list-disc list-inside space-y-2 leading-8 text-slate-600">
              <li>استخدم رابط الفيديو الصحيح.</li>
              <li>اختر أعلى دقة متاحة بدل افتراض وجود دقة ثابتة.</li>
              <li>افحص أبعاد الصورة قبل استخدامها في التصميم.</li>
              <li>تجنب تكبير الصور الصغيرة بشكل مبالغ فيه حتى لا تفقد وضوحها.</li>
              <li>احتفظ بنسخة من الصورة الأصلية عند استخدامها في مشروعك.</li>
              <li>احترم حقوق الملكية الفكرية وشروط استخدام الصور.</li>
              <li>إذا لم تظهر صورة، تحقق من أن الفيديو متاح وأن الرابط صحيح.</li>
            </ul>
          </article>

          {/* Related Tools Section - Placed at the bottom as requested */}
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-4">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/video-thumbnail-maker" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">إنشاء صورة مصغرة للفيديو</span>
                <span className="text-sm text-slate-600">صمم صوراً مصغرة احترافية وجذابة من الصفر</span>
              </Link>
              <Link href="/tools/video-to-audio" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">تحويل الفيديو إلى صوت</span>
                <span className="text-sm text-slate-600">استخراج الملفات الصوتية من مقاطع الفيديو</span>
              </Link>
              <Link href="/tools/video-compressor" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">ضغط الفيديو</span>
                <span className="text-sm text-slate-600">تقليل حجم ملفات الفيديو مع الحفاظ على الجودة</span>
              </Link>
              <Link href="/tools/video" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">جميع أدوات الفيديو</span>
                <span className="text-sm text-slate-600">استكشف المزيد من أدوات تحرير ومعالجة الفيديو</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول تحميل الصورة المصغرة</h2>
            <div className="mt-4 space-y-4">
              {faqQuestions.map((item, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-orange-200 open:bg-orange-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ابدأ تحميل الصورة المصغرة الآن</h2>
            <p className="mt-3 leading-8 text-slate-600">استخدم أداة تحميل الصورة المصغرة من Intooly لاستخراج صور فيديوهات يوتيوب بسهولة. الصق رابط الفيديو، وشاهد معاينة الصورة، واختر أعلى حجم متاح، ثم احفظ الصورة على جهازك خلال خطوات بسيطة.</p>
          </article>
        </section>
      </div>
    </main>
  );
}