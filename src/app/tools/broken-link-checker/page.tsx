"use client";

import { useState } from "react";
import { 
  Search, Link2, AlertTriangle, Download, Filter, Globe, Home, 
  ExternalLink, Loader2, ShieldCheck, HelpCircle, ArrowRightLeft
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

// CORS Proxies (fallback)
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
];

async function fetchWithProxy(url: string): Promise<string | null> {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        return await response.text();
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

async function checkLinkStatus(url: string): Promise<{ code: number; finalUrl: string }> {
  try {
    const proxyUrl = CORS_PROXIES[0] + encodeURIComponent(url);
    const response = await fetch(proxyUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    
    // allorigins يعيد 200 دائماً، لذا نحاول جلب المحتوى للتحقق
    if (response.ok) {
      const text = await response.text();
      if (text.includes("404") && text.length < 1000) {
        return { code: 404, finalUrl: url };
      }
      return { code: 200, finalUrl: url };
    }
    return { code: response.status, finalUrl: url };
  } catch (e) {
    return { code: 0, finalUrl: url };
  }
}

export default function BrokenLinkCheckerPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
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
    setProgress(0);

    try {
      setProgressText("جاري جلب محتوى الصفحة...");
      setProgress(10);
      
      const html = await fetchWithProxy(url);
      if (!html) {
        throw new Error("تعذر جلب محتوى الصفحة. تأكد من أن الرابط صحيح ويمكن الوصول إليه.");
      }

      setProgressText("جاري استخراج الروابط...");
      setProgress(30);

      // تحليل HTML واستخراج الروابط
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const anchors = doc.querySelectorAll("a[href]");

      const parsedUrl = new URL(url);
      const baseUrl = parsedUrl.origin;
      const linksToCheck: { targetUrl: string; anchorText: string; type: "داخلي" | "خارجي" }[] = [];
      const seenUrls = new Set<string>();

      anchors.forEach((a) => {
        const href = a.getAttribute("href");
        const anchorText = (a.textContent || "").trim() || "(بدون نص)";

        if (!href || href.startsWith("javascript:") || href.startsWith("#") || href.startsWith("mailto:")) {
          return;
        }

        let fullUrl = href;
        if (href.startsWith("/")) {
          fullUrl = baseUrl + href;
        } else if (!href.startsWith("http")) {
          fullUrl = url.endsWith("/") ? url + href : url + "/" + href;
        }

        fullUrl = fullUrl.split("#")[0];

        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          const isInternal = fullUrl.startsWith(baseUrl);
          linksToCheck.push({
            targetUrl: fullUrl,
            anchorText,
            type: isInternal ? "داخلي" : "خارجي",
          });
        }
      });

      setProgressText(`جاري فحص ${linksToCheck.length} رابط...`);
      setProgress(40);

      // فحص الروابط بشكل متوازي (batch)
      const results: LinkResult[] = [];
      const batchSize = 5;
      const stats = { total: linksToCheck.length, valid: 0, broken: 0, redirect: 0 };

      for (let i = 0; i < linksToCheck.length; i += batchSize) {
        const batch = linksToCheck.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (link) => {
            const status = await checkLinkStatus(link.targetUrl);
            const code = status.code;

            let category: "valid" | "broken" | "redirect" = "valid";
            let statusMessage = "سليم (OK)";

            if (code >= 200 && code < 300) {
              category = "valid";
              statusMessage = "سليم (OK)";
              stats.valid++;
            } else if (code === 301 || code === 302) {
              category = "redirect";
              statusMessage = code === 301 ? "تحويل دائم (301)" : "تحويل مؤقت (302)";
              stats.redirect++;
            } else if (code === 404) {
              category = "broken";
              statusMessage = "غير موجود (404)";
              stats.broken++;
            } else if (code === 403) {
              category = "broken";
              statusMessage = "ممنوع الوصول (403)";
              stats.broken++;
            } else if (code === 0) {
              category = "broken";
              statusMessage = "فشل الاتصال أو انتهت المهلة";
              stats.broken++;
            } else {
              category = "broken";
              statusMessage = `حالة غير معروفة (${code})`;
              stats.broken++;
            }

            return {
              targetUrl: link.targetUrl,
              anchorText: link.anchorText,
              sourceUrl: url,
              type: link.type,
              httpCode: code || 200,
              statusMessage,
              finalUrl: status.finalUrl !== link.targetUrl ? status.finalUrl : null,
              category,
            };
          })
        );

        results.push(...batchResults);
        const progressPercent = 40 + ((i + batchSize) / linksToCheck.length) * 60;
        setProgress(Math.min(95, progressPercent));
        setProgressText(`جاري فحص الروابط... (${Math.min(i + batchSize, linksToCheck.length)}/${linksToCheck.length})`);
      }

      // ترتيب النتائج: المعطلة أولاً
      results.sort((a, b) => {
        const priority = { broken: 1, redirect: 2, valid: 3 };
        return priority[a.category] - priority[b.category];
      });

      setProgress(100);
      setProgressText("اكتمل الفحص!");
      setStats(stats);
      setResults(results);

      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء فحص الروابط");
      setIsLoading(false);
      setProgress(0);
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

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-12">
            <div className="sm:col-span-10">
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
                <span>{progressText}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-orange-600 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </section>

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

        <section className="mt-12 space-y-8 text-right max-w-4xl mx-auto">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هو فاحص الروابط المعطلة Broken Link Checker؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              فاحص الروابط المعطلة (Broken Link Checker) هو أداة تساعد أصحاب المواقع ومشرفي الويب على اكتشاف الروابط التي لم تعد تعمل أو التي تؤدي إلى صفحات غير متاحة. تحدث الروابط المعطلة عندما يتم حذف صفحة ويب أو تغيير عنوان URL الخاص بها دون تحديث الروابط المرتبطة بها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية فحص الروابط المعطلة باستخدام Intooly؟</h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 leading-8 text-slate-600">
              <li>أدخل رابط صفحة الويب التي تريد فحصها في الحقل أعلاه.</li>
              <li>اضغط على زر "ابدأ الفحص" وانتظر حتى تكتمل العملية.</li>
              <li>استعرض نتائج الفحص في الجدول لمعرفة حالة كل رابط (سليم، معطل، أو تحويل).</li>
              <li>استخدم خيارات التصفية لعرض الروابط المعطلة فقط أو تصدير التقرير كملف CSV.</li>
            </ol>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول فاحص الروابط المعطلة</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "ما هو فاحص الروابط المعطلة؟", a: "هو أداة تستخدم للتحقق من صلاحية روابط صفحات الويب واكتشاف الروابط التي تؤدي إلى صفحات غير موجودة أو لا يمكن الوصول إليها." },
                { q: "كيف أفحص الروابط المعطلة في موقعي؟", a: "أدخل رابط الصفحة التي تريد فحصها في الأداة، ثم ابدأ الفحص واستعرض الروابط التي تم التحقق منها لمعرفة حالتها." },
                { q: "ما هو خطأ 404 في الروابط؟", a: "هو رمز استجابة HTTP يشير إلى أن الصفحة المطلوبة غير موجودة على الخادم، وغالبًا يحدث بسبب حذف الصفحة أو تغيير عنوانها." },
                { q: "هل تؤثر الروابط المعطلة على ترتيب الموقع في Google؟", a: "قد تؤثر بصورة غير مباشرة على جودة تجربة المستخدم، لكن وجود رابط معطل لا يعني تلقائيًا تعرض الموقع لعقوبة من Google." },
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
        </section>
      </div>
    </main>
  );
}