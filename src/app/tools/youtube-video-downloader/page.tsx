"use client";

import { useState } from "react";
import Link from "next/link";
import { Video, CheckCircle2, AlertTriangle, ExternalLink, Info, Shield, Download, Play } from "lucide-react";

const faqQuestions = [
  { q: "كيف يمكن تحميل فيديوهات اليوتيوب؟", a: "يمكن حفظ الفيديوهات التي تملكها أو لديك إذن بتنزيلها باستخدام الخيارات الرسمية المتاحة، مثل YouTube Studio للفيديوهات التي رفعتها بنفسك، أو ميزة التنزيل الرسمية للمشاهدة دون اتصال عندما تكون متاحة." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب مجانًا؟", a: "تتوفر بعض خيارات تنزيل الفيديوهات التي يملكها المستخدم من خلال أدوات YouTube الرسمية. أما التنزيل للمشاهدة دون اتصال فيعتمد على توفر الميزة وشروط الحساب والمنطقة والفيديو." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب بجودة HD؟", a: "تختلف الجودة المتاحة حسب الفيديو الأصلي والخيارات التي توفرها المنصة. قد تتوفر دقة HD أو Full HD أو 4K لبعض الفيديوهات، ولا تتوفر بالضرورة لجميعها." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب على الهاتف؟", a: "نعم، تتيح YouTube تنزيل بعض الفيديوهات للمشاهدة دون إنترنت من خلال التطبيق الرسمي في المناطق والحالات المدعومة." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب على الكمبيوتر؟", a: "تتيح YouTube تنزيل فيديوهات مؤهلة للمشاهدة دون اتصال لبعض مستخدمي Premium عبر متصفحات مدعومة، كما يمكن لصاحب الفيديو تنزيل فيديوهاته من YouTube Studio." },
  { q: "هل يمكن تحميل فيديوهات اليوتيوب بصيغة MP4؟", a: "يمكن الحصول على ملف MP4 عندما يكون تنزيل الفيديو كملف مستقل مسموحًا وتكون هذه الصيغة متاحة. لا ينبغي افتراض أن كل فيديو على YouTube يمكن حفظه بهذه الصيغة." },
  { q: "هل يمكن تحويل فيديوهات اليوتيوب إلى MP3؟", a: "يجب أن يكون استخراج الصوت مسموحًا لصاحب المحتوى أو بموجب إذن مناسب. ويمكنك استخدام أداة تحويل الفيديو إلى صوت من Intooly مع الملفات التي يحق لك معالجتها." },
  { q: "لماذا لا أجد زر تنزيل الفيديو؟", a: "قد لا يكون الفيديو مؤهلًا للتنزيل دون اتصال، أو قد لا تتوفر الميزة في منطقتك أو لحسابك. كما يمكن أن تختلف الخيارات حسب نوع الفيديو وحقوقه." },
  { q: "هل أحتاج إلى تثبيت برنامج لتحميل الفيديو؟", a: "تعتمد الإجابة على الطريقة المستخدمة. توفر YouTube خيارات رسمية عبر موقعها وتطبيقها، ويمكن استخدام YouTube Studio لتنزيل الفيديوهات التي رفعتها بنفسك." },
  { q: "هل تنزيل الفيديو يعني امتلاك حقوقه؟", a: "لا. تنزيل الفيديو أو حفظ نسخة منه لا يمنحك حقوق النشر أو حق إعادة نشره أو استخدامه تجاريًا. يجب الحصول على الإذن المناسب من صاحب الحقوق." }
];

export default function YouTubeVideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<{ title: string; thumbnail: string; author: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const extractVideoId = (inputUrl: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
    const match = inputUrl.match(regex);
    return match ? match[1] : null;
  };

  const handleCheck = async () => {
    setError("");
    setVideoInfo(null);
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      setError("رابط YouTube غير صالح. يرجى التأكد من نسخ الرابط بشكل صحيح.");
      return;
    }

    setLoading(true);
    try {
      // استخدام oEmbed API الرسمي من YouTube (مجاني ولا يحتاج مفتاح)
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        setVideoInfo({
          title: data.title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          author: data.author_name,
        });
      } else {
        setError("لم يتم العثور على الفيديو. قد يكون الفيديو خاصاً أو محذوفاً أو غير متاح في منطقتك.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/video" className="font-medium transition hover:text-orange-600">أدوات الفيديو</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">تحميل فيديوهات اليوتيوب</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Shield size={16} />
            أداة قانونية وآمنة 100% - تحترم حقوق المحتوى
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            تحميل فيديوهات اليوتيوب – احفظ الفيديوهات التي تملك حق تنزيلها
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            تتيح لك أداة تحميل فيديوهات اليوتيوب من Intooly الوصول بسهولة إلى خيارات حفظ الفيديوهات التي تملكها أو لديك تصريح واضح بتنزيلها، مع إرشادات واضحة حول الخيارات الرسمية المتاحة.
          </p>
        </header>

        {/* Video Checker Section */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900 flex items-center gap-2">
            <Video size={24} className="text-orange-600" />
            التحقق من رابط الفيديو
          </h2>
          <p className="mb-6 text-slate-600">
            الصق رابط فيديو YouTube للتحقق من صحته وعرض معلوماته الأساسية. هذه الخطوة تساعدك على التأكد من أن الرابط صحيح قبل اتباع خيارات التنزيل الرسمية.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="الصق رابط فيديو YouTube هنا (مثال: https://www.youtube.com/watch?v=...)"
                className="w-full rounded-xl border border-slate-300 px-4 py-4 pr-12 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
              <button
                onClick={() => navigator.clipboard.readText().then(setUrl).catch(() => {})}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                title="لصق من الحافظة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
            <button
              onClick={handleCheck}
              disabled={loading || !url}
              className="rounded-xl bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "جاري التحقق..." : "التحقق من الرابط"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="mt-1 text-sm">تأكد من أن الرابط صحيح وأن الفيديو متاح للعامة.</p>
              </div>
            </div>
          )}

          {videoInfo && (
            <div className="mt-6 rounded-2xl border-2 border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-32 h-24 object-cover rounded-lg border border-slate-200" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 mb-1">{videoInfo.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">القناة: {videoInfo.author}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-200 px-3 py-1 text-xs font-bold text-green-800">
                      <CheckCircle2 size={12} /> رابط صالح
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      <Info size={12} /> فيديو عام
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-green-100">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Download size={18} className="text-orange-600" />
                  خيارات التنزيل الرسمية المتاحة:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">إذا كان الفيديو من قناتك:</p>
                      <p className="text-sm text-slate-600 mt-1">استخدم <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-medium">YouTube Studio</a> لتنزيل الفيديو الأصلي الذي رفعته.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">للمشاهدة دون اتصال (Offline):</p>
                      <p className="text-sm text-slate-600 mt-1">إذا كان الفيديو مؤهلاً، استخدم ميزة التنزيل الرسمية في تطبيق YouTube أو المتصفح (يتطلب YouTube Premium في بعض المناطق).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">إذا كان الفيديو تحت رخصة Creative Commons:</p>
                      <p className="text-sm text-slate-600 mt-1">يمكن تنزيله عبر YouTube Studio إذا سمح صاحب المحتوى بذلك.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل فيديوهات اليوتيوب – احفظ الفيديوهات التي تملك حق تنزيلها</h2>
            <p className="mt-3 leading-8 text-slate-600">تتيح لك أداة تحميل فيديوهات اليوتيوب من Intooly الوصول بسهولة إلى خيارات حفظ الفيديوهات التي تملكها أو لديك تصريح واضح بتنزيلها. صُممت الصفحة لتقديم تجربة استخدام بسيطة ومنظمة، مع إرشادات واضحة حول خيارات التنزيل المتاحة، وجودة الفيديو، والصيغ المناسبة، سواء كنت تستخدم الهاتف أو الكمبيوتر.</p>
            <p className="mt-3 leading-8 text-slate-600">إذا كنت تبحث عن طريقة تحميل فيديوهات اليوتيوب أو تريد الاحتفاظ بنسخة من الفيديوهات التي أنشأتها بنفسك، فإن Intooly تساعدك على معرفة الطريقة المناسبة، والوصول إلى الخيارات المتاحة دون الحاجة إلى تثبيت برامج غير موثوقة.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة تحميل فيديوهات اليوتيوب؟</h2>
            <p className="mt-3 leading-8 text-slate-600">أداة تحميل فيديوهات اليوتيوب هي وسيلة تساعد المستخدم على حفظ الفيديوهات التي يملك حقوقها أو حصل على إذن بتنزيلها، وفقًا للخيارات المتاحة وشروط المنصة.</p>
            <p className="mt-3 leading-8 text-slate-600">تقدم صفحة Intooly تجربة منظمة للتعامل مع روابط YouTube، وتوضيح الخيارات المتاحة للمستخدم، مع الاهتمام بسهولة الاستخدام والخصوصية والتوافق مع مختلف الأجهزة.</p>
            <p className="mt-3 leading-8 text-slate-600">من المهم معرفة أن إمكانية مشاهدة الفيديو على YouTube لا تعني تلقائيًا امتلاك حق تنزيله كملف مستقل. لذلك يجب التأكد من امتلاك الفيديو أو الحصول على إذن صاحب الحقوق قبل تنزيله أو إعادة استخدامه.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية تحميل فيديوهات اليوتيوب بطريقة صحيحة</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك اتباع الخطوات التالية لحفظ الفيديوهات التي تملك حق تنزيلها:</p>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>افتح الفيديو المطلوب على YouTube.</li>
              <li>تحقق من أنك صاحب الفيديو أو لديك إذن بتنزيله.</li>
              <li>إذا كان الفيديو من قناتك، يمكنك استخدام خيارات التنزيل المتاحة في YouTube Studio.</li>
              <li>إذا كان الفيديو متاحًا للتنزيل عبر ميزة رسمية من YouTube، استخدم خيار التنزيل الرسمي.</li>
              <li>اختر الجودة المتاحة وفقًا للخيارات المسموح بها.</li>
              <li>احتفظ بالملف في جهازك واستخدمه وفقًا للأذونات الممنوحة لك.</li>
            </ol>
            <p className="mt-4 leading-8 text-slate-600">تساعدك Intooly على فهم خيارات حفظ الفيديوهات والتعامل معها بطريقة واضحة دون تقديم وعود بتنزيل محتوى غير متاح للتنزيل.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل فيديوهات اليوتيوب بجودة عالية</h2>
            <p className="mt-3 leading-8 text-slate-600">تختلف جودة الفيديو باختلاف الفيديو الأصلي وإعدادات الرفع والخيارات التي تتيحها المنصة. ومن أشهر درجات دقة الفيديو:</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-slate-600">
              {[
                { quality: "144p", desc: "جودة منخفضة جدًا" },
                { quality: "240p", desc: "مناسبة عند الحاجة إلى تقليل استهلاك البيانات" },
                { quality: "360p", desc: "جودة منخفضة مناسبة للشاشات الصغيرة" },
                { quality: "480p", desc: "جودة SD" },
                { quality: "720p", desc: "جودة HD" },
                { quality: "1080p", desc: "جودة Full HD" },
                { quality: "1440p", desc: "جودة 2K" },
                { quality: "2160p", desc: "جودة 4K" }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                  <span className="font-mono font-bold text-orange-600">{item.quality}:</span>
                  <span className="text-sm">{item.desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-8 text-slate-600">هذه درجات دقة شائعة وليست ضمانًا لتوفرها في كل فيديو. لا يمكن اختيار جودة أعلى من جودة المصدر أو من الخيارات التي يسمح بها YouTube.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل فيديوهات اليوتيوب على الهاتف</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك مشاهدة فيديوهات YouTube دون اتصال بالإنترنت باستخدام ميزة التنزيل الرسمية عندما تكون متاحة في بلدك وللفيديو الذي تريد مشاهدته. على الهواتف الذكية، تختلف خيارات التنزيل حسب الجهاز والحساب والمنطقة والفيديو نفسه. وقد تُحفظ التنزيلات الرسمية داخل تطبيق YouTube بدلًا من ظهورها كملفات فيديو مستقلة في معرض الصور.</p>
            <p className="mt-3 leading-8 text-slate-600">أما إذا كنت تريد حفظ فيديو أنشأته بنفسك، فيمكنك استخدام خيارات تنزيل الفيديو من YouTube Studio أو النسخة الأصلية الموجودة على جهازك.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">تحميل فيديوهات اليوتيوب على الكمبيوتر</h2>
            <p className="mt-3 leading-8 text-slate-600">يمكنك تنزيل الفيديوهات التي تملكها من خلال الأدوات الرسمية المتاحة في YouTube Studio. كما توفر YouTube لبعض مستخدمي Premium إمكانية تنزيل فيديوهات مؤهلة للمشاهدة دون اتصال من المتصفحات المدعومة. وتظل هذه التنزيلات مرتبطة بتجربة YouTube الرسمية وليست بالضرورة ملفات MP4 مستقلة.</p>
            <p className="mt-3 leading-8 text-slate-600">تساعدك معرفة الفرق بين التنزيل الرسمي وحفظ ملف الفيديو على اختيار الطريقة المناسبة دون فقدان الوقت مع مواقع غير موثوقة.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما الفرق بين تنزيل الفيديو ومشاهدته دون إنترنت؟</h2>
            <p className="mt-3 leading-8 text-slate-600">هناك فرق مهم بين حفظ فيديو كملف مستقل وبين تنزيله باستخدام ميزة المشاهدة دون اتصال.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900 flex items-center gap-2"><Play size={18} className="text-blue-600"/> المشاهدة دون إنترنت</h3>
                <p className="text-sm text-slate-600">تتيحها YouTube لبعض الفيديوهات والحسابات والمناطق، وتكون التنزيلات عادةً مرتبطة بتطبيق YouTube أو بيئة تشغيله.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900 flex items-center gap-2"><Download size={18} className="text-green-600"/> حفظ ملف فيديو</h3>
                <p className="text-sm text-slate-600">يعني امتلاك نسخة مستقلة على الجهاز، ويجب أن يكون ذلك مسموحًا من خلال المنصة أو بموافقة صاحب حقوق المحتوى.</p>
              </div>
            </div>
            <p className="mt-4 leading-8 text-slate-600">يساعدك فهم هذا الفرق على تجنب الالتباس عند البحث عن تحميل فيديوهات اليوتيوب.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">مميزات Intooly</h2>
            <p className="mt-3 leading-8 text-slate-600">تسعى Intooly إلى توفير تجربة استخدام سهلة وواضحة، مع التركيز على المميزات التالية:</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-slate-600">
              {[
                "واجهة عربية سهلة الاستخدام.",
                "تصميم متوافق مع الهاتف والكمبيوتر.",
                "إرشادات واضحة حول طرق تنزيل الفيديوهات المسموح بها.",
                "توضيح خيارات الجودة والصيغ عندما تكون متاحة.",
                "دعم الوصول إلى خيارات تنزيل الفيديوهات الخاصة بالمستخدم.",
                "روابط مباشرة إلى الأدوات الرسمية ذات الصلة.",
                "عدم طلب كلمة مرور حساب Google.",
                "عدم مطالبة المستخدم بتثبيت برامج مجهولة.",
                "توضيح أسباب عدم توفر خيار التنزيل.",
                "الاهتمام بالخصوصية وأمان المستخدم.",
                "سهولة الوصول إلى أدوات Intooly الأخرى لمعالجة الفيديوهات."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span> {item}</li>
              ))}
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">هل يمكن تنزيل جميع فيديوهات YouTube؟</h2>
            <p className="mt-3 leading-8 text-slate-600">لا، لا يمكن ضمان تنزيل جميع فيديوهات YouTube. تختلف إمكانية التنزيل حسب حقوق المحتوى وإعدادات الفيديو والبلد والحساب والخيارات التي توفرها المنصة. بعض الفيديوهات تكون متاحة للمشاهدة فقط، وبعضها يسمح بالتنزيل من خلال ميزات YouTube الرسمية، كما يمكن لصاحب الفيديو تنزيل المحتوى الذي رفعه وفقًا للخيارات المتاحة له.</p>
          </article>

          {/* Related Tools Section */}
          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-4">جرّب أدوات الفيديو الأخرى من Intooly</h2>
            <p className="mb-4 text-slate-600">بعد الحصول على ملف فيديو تملك حق استخدامه، يمكنك الاستفادة من أدوات Intooly الأخرى:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/video-compressor" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">ضاغط الفيديو</span>
                <span className="text-sm text-slate-600">تقليل حجم ملفات الفيديو</span>
              </Link>
              <Link href="/tools/video-converter" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">محول صيغ الفيديو</span>
                <span className="text-sm text-slate-600">تغيير صيغة الفيديو</span>
              </Link>
              <Link href="/tools/video-trimmer" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">قص الفيديو</span>
                <span className="text-sm text-slate-600">تحديد الجزء المطلوب من الفيديو</span>
              </Link>
              <Link href="/tools/video-to-audio" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">تحويل الفيديو إلى صوت</span>
                <span className="text-sm text-slate-600">استخراج الصوت المسموح باستخدامه</span>
              </Link>
              <Link href="/tools/video-thumbnail-maker" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">إنشاء صورة مصغرة للفيديو</span>
                <span className="text-sm text-slate-600">تصميم صور مصغرة احترافية</span>
              </Link>
              <Link href="/tools/video-to-gif" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md">
                <span className="font-bold block mb-1 text-slate-900">تحويل الفيديو إلى GIF</span>
                <span className="text-sm text-slate-600">إنشاء صور متحركة من الفيديو</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول تحميل فيديوهات اليوتيوب</h2>
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

          <article className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-extrabold text-blue-900 mb-3 flex items-center gap-2">
              <Shield size={20} />
              Intooly – أدوات فيديو مجانية وسهلة الاستخدام
            </h2>
            <p className="leading-8 text-slate-600">تساعدك أدوات Intooly على إنجاز مهامك الرقمية من مكان واحد، مع الالتزام الكامل بحقوق المحتوى والقوانين المعمول بها. نؤمن بأن التجربة الجيدة تبدأ من الشفافية والاحترام.</p>
          </article>
        </section>
      </div>
    </main>
  );
}