"use client";

import { useState } from "react";
import { 
  Search, Link2, AlertTriangle, CheckCircle2, ArrowRightLeft, 
  Download, Filter, Globe, Home, ExternalLink, Loader2, 
  FileText, ShieldCheck, Zap, HelpCircle
} from "lucide-react";

type LinkResult = {
  targetUrl: string;
  anchorText: string;
  sourceUrl: string;
  type: "داخلي" | "خارجي";
  httpCode: number;
  statusMessage: string;
  finalUrl: string | null;
  category: "valid" | "broken" | "redirect";
};

type Stats = {
  total: number;
  valid: number;
  broken: number;
  redirect: number;
};

export default function BrokenLinkCheckerPage() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [results, setResults] = useState<LinkResult[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "broken" | "redirect" | "internal" | "external">("all");

  const handleCheck = async () => {
    if (!url) return;
    setIsLoading(true);
    setError("");
    setStats(null);
    setResults([]);
    setProgress(10);

    try {
      // محاكاة تقدم وهمي لتحسين تجربة المستخدم أثناء انتظار الخادم
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 500);

      const response = await fetch("/api/check-links.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "حدث خطأ أثناء فحص الروابط");
      }

      setStats(data.stats);
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const filteredResults = results.filter((r) => {
    if (filter === "all") return true;
    if (filter === "broken") return r.category === "broken";
    if (filter === "redirect") return r.category === "redirect";
    if (filter === "internal") return r.type === "داخلي";
    if (filter === "external") return r.type === "خارجي";
    return true;
  });

  const exportToCSV = () => {
    if (results.length === 0) return;
    const headers = ["الرابط المستهدف", "نص الرابط", "صفحة المصدر", "النوع", "كود HTTP", "الحالة", "الرابط النهائي"];
    const rows = filteredResults.map((r) => [
      r.targetUrl,
      `"${r.anchorText.replace(/"/g, '""')}"`,
      r.sourceUrl,
      r.type,
      r.httpCode,
      r.statusMessage,
      r.finalUrl || "-",
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `broken-links-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-green-600 bg-green-50 border-green-200";
    if (code === 301 || code === 302) return "text-blue-600 bg-blue-50 border-blue-200";
    if (code === 403 || code === 429) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-slate-500">
          <a href="/tools/seo" className="font-medium transition hover:text-orange-600">أدوات SEO</a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">فاحص الروابط المعطلة</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <ShieldCheck size={16} />
            أداة فحص تقنية متقدمة
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            فاحص الروابط المعطلة – Broken Link Checker
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            اكتشف الروابط المعطلة والتالفة داخل صفحات موقعك بسهولة. تحقق من أخطاء 404، التحويلات، والروابط الخارجية المعطلة، واحصل على تقرير مفصل لمكان كل رابط وكيفية إصلاحه.
          </p>
        </header>

        {/* Input Section */}
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">أدخل رابط الصفحة أو الموقع للفحص</label>
              <div className="relative">
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-300 py-3 pr-10 pl-4 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">عدد الصفحات</label>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 py-3 px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={isLoading}
              >
                <option value={1}>1 (الصفحة الحالية)</option>
                <option value={10}>حتى 10 صفحات</option>
                <option value={25}>حتى 25 صفحة</option>
                <option value={50}>حتى 50 صفحة</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2">
              <button
                onClick={handleCheck}
                disabled={isLoading || !url}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                {isLoading ? "جاري الفحص..." : "ابدأ الفحص"}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
                <span>جاري تحليل الروابط وفحص حالتها...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-orange-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                ملاحظة: قد يستغرق الفحص بضع ثوانٍ حسب عدد الروابط واستجابة الخادم المستهدف.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Results Dashboard */}
        {stats && !isLoading && (
          <section className="mb-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-sm font-medium text-slate-500">إجمالي الروابط</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-sm font-medium text-green-700">روابط سليمة</p>
                <p className="mt-2 text-3xl font-black text-green-600">{stats.valid}</p>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                <p className="text-sm font-medium text-red-700">روابط معطلة</p>
                <p className="mt-2 text-3xl font-black text-red-600">{stats.broken}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
                <p className="text-sm font-medium text-blue-700">تحويلات</p>
                <p className="mt-2 text-3xl font-black text-blue-600">{stats.redirect}</p>
              </div>
            </div>

            {/* Filters & Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 text-sm font-medium text-slate-600">
                  <Filter size={16} /> تصفية:
                </span>
                {[
                  { id: "all", label: "الكل" },
                  { id: "broken", label: "معطلة فقط" },
                  { id: "redirect", label: "تحويلات" },
                  { id: "internal", label: "داخلية" },
                  { id: "external", label: "خارجية" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      filter === f.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download size={16} /> تصدير CSV
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-bold">الرابط المستهدف</th>
                      <th className="px-4 py-3 font-bold">نص الرابط</th>
                      <th className="px-4 py-3 font-bold">النوع</th>
                      <th className="px-4 py-3 font-bold">الكود</th>
                      <th className="px-4 py-3 font-bold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          لا توجد نتائج تطابق الفلتر المحدد.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <a href={r.targetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-orange-600 hover:underline">
                              {r.targetUrl.length > 50 ? r.targetUrl.substring(0, 50) + "..." : r.targetUrl}
                              <ExternalLink size={12} />
                            </a>
                            {r.finalUrl && r.finalUrl !== r.targetUrl && (
                              <p className="mt-1 text-xs text-slate-500">
                                <ArrowRightLeft size={12} className="inline" /> يحول إلى: {r.finalUrl}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={r.anchorText}>
                            {r.anchorText}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                              r.type === "داخلي" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}>
                              {r.type === "داخلي" ? <Home size={12} /> : <Globe size={12} />}
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block rounded border px-2 py-1 text-xs font-bold ${getStatusColor(r.httpCode)}`}>
                              {r.httpCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{r.statusMessage}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* SEO Content Section */}
        <section className="mt-12 space-y-8 text-right max-w-4xl mx-auto">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هو فاحص الروابط المعطلة Broken Link Checker؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              فاحص الروابط المعطلة (Broken Link Checker) هو أداة تساعد أصحاب المواقع ومشرفي الويب على اكتشاف الروابط التي لم تعد تعمل أو التي تؤدي إلى صفحات غير متاحة. تحدث الروابط المعطلة عندما يتم حذف صفحة ويب أو تغيير عنوان URL الخاص بها دون تحديث الروابط المرتبطة بها، أو عندما يتوقف الموقع المستهدف عن العمل.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية فحص الروابط المعطلة باستخدام Intooly؟</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 leading-8 text-slate-600">
              <li>أدخل رابط صفحة الويب التي تريد فحصها في الحقل أعلاه.</li>
              <li>اختر نطاق الفحص (الصفحة الحالية أو تتبع روابط داخلية محدودة).</li>
              <li>ابدأ عملية فحص الروابط وانتظر حتى تكتمل.</li>
              <li>استعرض نتائج الفحص في الجدول لمعرفة حالة كل رابط (سليم، معطل، أو تحويل).</li>
              <li>استخدم خيارات التصفية لعرض الروابط المعطلة فقط أو تصدير التقرير كملف CSV.</li>
            </ol>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما أنواع الروابط التي يمكن فحصها؟</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                  <Home size={18} className="text-orange-600" /> الروابط الداخلية (Internal Links)
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  الروابط التي تربط صفحات الموقع بعضها ببعض. يساعد فحصها على اكتشاف الصفحات المحذوفة أو عناوين URL القديمة التي تؤدي إلى أخطاء 404 داخل الموقع نفسه.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                  <Globe size={18} className="text-orange-600" /> الروابط الخارجية (External Links)
                </h3>
                <p className="text-sm leading-7 text-slate-600">
                  الروابط التي تشير إلى مواقع إلكترونية أخرى (مثل المصادر والمراجع). قد تتوقف هذه الروابط عن العمل بسبب حذف الصفحة المستهدفة أو تغيير عنوانها.
                </p>
              </div>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيف تؤثر الروابط المعطلة على SEO؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              تُعد الروابط المعطلة من المشكلات التي تستحق المراجعة ضمن أعمال تحسين محركات البحث SEO. عندما ينقر الزائر على رابط لا يعمل، قد لا يتمكن من الوصول إلى المعلومات التي يبحث عنها، مما يسبب تجربة تصفح غير جيدة. كما أن الروابط الخارجية التي تشير إلى مصادر محذوفة قد تقلل من فائدة بعض المقالات. معالجة هذه المشكلات تعد ممارسة جيدة لإدارة المواقع وتحسين جودتها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية إصلاح الروابط المعطلة؟</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 leading-8 text-slate-600">
              <li>تأكد من أن عنوان URL مكتوب بصورة صحيحة.</li>
              <li>إذا تم تغيير عنوان الصفحة، حدّث الرابط إلى العنوان الجديد.</li>
              <li>إذا تم نقل الصفحة نهائيًا، استخدم إعادة توجيه 301 (Redirect) عند وجود صفحة بديلة مناسبة.</li>
              <li>إذا كان الرابط الخارجي لا يعمل، ابحث عن المصدر الأصلي أو استبدله بمصدر موثوق.</li>
              <li>احذف الروابط التي لم تعد مفيدة ولا يوجد لها بديل مناسب.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول فاحص الروابط المعطلة</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "ما هو فاحص الروابط المعطلة؟", a: "هو أداة تستخدم للتحقق من صلاحية روابط صفحات الويب واكتشاف الروابط التي تؤدي إلى صفحات غير موجودة أو لا يمكن الوصول إليها." },
                { q: "كيف أفحص الروابط المعطلة في موقعي؟", a: "أدخل رابط الصفحة التي تريد فحصها في الأداة، ثم ابدأ الفحص واستعرض الروابط التي تم التحقق منها لمعرفة حالتها." },
                { q: "ما هو خطأ 404 في الروابط؟", a: "هو رمز استجابة HTTP يشير إلى أن الصفحة المطلوبة غير موجودة على الخادم، وغالبًا يحدث بسبب حذف الصفحة أو تغيير عنوانها." },
                { q: "هل تؤثر الروابط المعطلة على ترتيب الموقع في Google؟", a: "قد تؤثر بصورة غير مباشرة على جودة تجربة المستخدم، لكن وجود رابط معطل لا يعني تلقائيًا تعرض الموقع لعقوبة من Google." },
                { q: "ما الفرق بين الروابط الداخلية والخارجية؟", a: "الروابط الداخلية تربط صفحات الموقع الواحد، أما الروابط الخارجية فتشير إلى صفحات موجودة على مواقع ونطاقات أخرى." },
                { q: "هل فحص الروابط المعطلة مجاني؟", a: "نعم، يمكنك استخدام أداة فاحص الروابط المعطلة من Intooly مجانًا مباشرة من المتصفح." },
              ].map((item, i) => (
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

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3 flex items-center gap-2">
              <HelpCircle size={20} /> ملاحظة هامة حول دقة الفحص
            </h2>
            <p className="text-sm leading-8 text-orange-800">
              قد يتعذر التحقق من بعض الروابط بسبب قيود الوصول (مثل حظر Cloudflare أو Jailed hosting)، أو إعدادات الحماية، أو مشكلات الاتصال المؤقتة (مثل خطأ 429 Too Many Requests). لذلك يجب مراجعة حالة الرابط وسياق الاستجابة قبل اعتباره معطلًا بشكل نهائي.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}