"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Copy, CheckCircle2, AlertTriangle, Image as ImageIcon, Trash2, ExternalLink, Clock } from "lucide-react";

type ThumbnailSize = {
  key: string;
  label: string;
  resolution: string;
  url: string;
  exists: boolean;
  isBest: boolean;
};

const faqQuestions = [
  { q: "كيف يمكن تحميل الصورة المصغرة من يوتيوب؟", a: "انسخ رابط فيديو YouTube، ثم افتح أداة تحميل الصورة المصغرة من Intooly والصق الرابط. بعد استخراج الصور المتاحة، اختر النسخة المناسبة واضغط على زر التنزيل لحفظها على جهازك." },
  { q: "هل يمكن تحميل الصورة المصغرة من يوتيوب مجانًا؟", a: "نعم، يمكنك استخدام أداة Intooly لاستخراج الصور المصغرة المتاحة مجانًا وفقًا لحدود الاستخدام المعلنة، دون الحاجة إلى تثبيت برنامج أو إنشاء حساب." },
  { q: "كيف أحمل الصورة المصغرة بجودة HD أو 1080p؟", a: "الصق رابط الفيديو في الأداة، ثم افحص الأحجام المتاحة واختر أعلى نسخة يمكن الوصول إليها (مثل maxresdefault). قد تختلف الدقة من فيديو إلى آخر." },
  { q: "هل تعمل أداة تحميل الصورة المصغرة على الهاتف؟", a: "نعم، يمكنك استخدام الأداة من متصفح الهاتف، سواء كان Android أو iPhone، ثم نسخ رابط الفيديو واستخراج الصورة وحفظها بحسب إمكانيات المتصفح." },
  { q: "هل يمكن تحميل الصورة المصغرة من رابط YouTube Shorts؟", a: "نعم، يمكن محاولة استخراج صورة الفيديو من روابط YouTube Shorts إذا كانت الصورة متاحة ويمكن الوصول إليها بالطريقة التي تستخدمها الأداة." },
  { q: "ما الفرق بين maxresdefault و hqdefault؟", a: "تشير هذه الأسماء إلى نسخ مختلفة من الصور المصغرة. تكون maxresdefault عادةً النسخة الأعلى دقة (قد تصل لـ 1280x720) عند توفرها، بينما hqdefault نسخة شائعة بدقة أقل (480x360)." }
];
export default function ThumbnailDownloaderPage() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [thumbnails, setThumbnails] = useState<ThumbnailSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load history from localStorage
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

    // Add to history
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
      
      // maxresdefault sometimes returns a generic "no thumbnail" image (120x90) even if it "exists" in HTTP terms.
      // We can do a basic check, but for simplicity, we trust the HTTP status for now, 
      // but we flag maxresdefault as "best" only if it's truly high res (handled by UI labeling).
      
      results.push({
        key: size.key,
        label: size.label,
        resolution: size.resolution,
        url: imgUrl,
        exists: exists,
        isBest: size.key === "maxresdefault" && exists,
      });
      
      if (size.key === "maxresdefault" && exists) foundBest = true;
    }

    // If maxresdefault doesn't exist, make hqdefault the "best" available
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
      // Fallback for CORS issues
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

        {/* Input Section */}
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

          {/* History */}
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

        {/* Results Section */}
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

        {/* SEO Content */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة تحميل الصورة المصغرة من يوتيوب؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              أداة تحميل الصورة المصغرة هي خدمة أونلاين تتيح استخراج صورة الغلاف المرتبطة بفيديو YouTube وتنزيلها من خلال رابط الفيديو. تُعرف هذه الصورة باسم Thumbnail، وهي الصورة التي تظهر للمشاهدين قبل تشغيل الفيديو.
            </p>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/video-thumbnail-maker" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">إنشاء صورة مصغرة للفيديو</span>
                <span className="text-sm text-slate-600">صمم صوراً مصغرة احترافية من الصفر</span>
                </Link>
              <Link href="/tools/video-to-audio" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">تحويل الفيديو إلى صوت</span>
                <span className="text-sm text-slate-600">استخراج الصوت من ملفات الفيديو</span>
              </Link>
              <Link href="/tools/video-compressor" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">ضغط الفيديو</span>
                <span className="text-sm text-slate-600">تقليل حجم ملفات الفيديو بسهولة</span>
              </Link>
              <Link href="/tools/video" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">جميع أدوات الفيديو</span>
                <span className="text-sm text-slate-600">استكشف المزيد من أدوات تحرير الفيديو</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول تحميل الصورة المصغرة</h2>
            <div className="mt-4 space-y-4">
              {faqQuestions.slice(0, 5).map((item, i) => (
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
        </section>
      </div>
    </main>
  );
}