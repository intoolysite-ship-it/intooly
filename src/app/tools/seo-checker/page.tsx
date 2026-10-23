'use client';

/**
 * صفحة أداة SEO Checker — Intooly
 * تحليل HTML محلي + فحص روابط فعلي عبر Route Handler.
 */

import { useState, useRef, useMemo, ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Search,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Info,
  Upload,
  X,
  Globe,
  Code2,
  Sparkles,
  Clipboard,
  ArrowDownToLine,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ListFilter,
} from 'lucide-react';

import { analyzeHtml } from '@/lib/seo-checker/engine';
import type {
  SeoReport,
  SeoIssue,
  InputMode,
} from '@/lib/seo-checker/types';
import { DEFAULT_OPTIONS } from '@/lib/seo-checker/types';

import ScoreGauge from './components/ScoreGauge';
import StatsCards from './components/StatsCards';
import IssueCard from './components/IssueCard';

type Notice = {
  kind: 'success' | 'error' | 'info';
  text: string;
} | null;

type FilterType = 'all' | 'pass' | 'warning' | 'error' | 'info';

export default function SeoCheckerPage() {
  const [mode, setMode] = useState<InputMode>('html');
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [sourceName, setSourceName] = useState('HTML مُدخل يدويًا');
  const [report, setReport] = useState<SeoReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const fileInput = useRef<HTMLInputElement>(null);

  const filteredIssues = useMemo<SeoIssue[]>(() => {
    if (!report) return [];
    if (filter === 'all') return report.issues;
    return report.issues.filter((i) => i.status === filter);
  }, [report, filter]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ kind: 'error', text: 'الحد الأقصى لحجم الملف 5 ميجابايت.' });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setHtml(content);
      setMode('html');
      setSourceName(file.name);
      setReport(null);
      setNotice({ kind: 'success', text: `تم تحميل ${file.name} — جاهز للفحص.` });
    };
    reader.onerror = () => {
      setNotice({ kind: 'error', text: 'تعذّرت قراءة الملف.' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      setNotice({ kind: 'error', text: 'أدخل رابطًا صحيحًا أولًا.' });
      return;
    }

    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      setNotice({ kind: 'error', text: 'صيغة الرابط غير صحيحة.' });
      return;
    }

    setFetching(true);
    setNotice({ kind: 'info', text: 'جاري جلب الصفحة من الخادم...' });

    try {
      const res = await fetch('/api/seo-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!data.success || !data.html) {
        setNotice({
          kind: 'error',
          text: data.error || 'تعذّر جلب الصفحة.',
        });
        return;
      }

      setHtml(data.html);
      setMode('html');
      setSourceName(url.trim());
      setNotice({
        kind: 'success',
        text: `تم الجلب (${data.fetchInfo?.status || '?'} في ${data.fetchInfo?.responseTimeMs || '?'}ms). جاهز للفحص.`,
      });
    } catch (err) {
      setNotice({
        kind: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'تعذّر الاتصال بالخادم.',
      });
    } finally {
      setFetching(false);
    }
  };

  const handleAnalyze = () => {
    if (!html.trim()) {
      setNotice({ kind: 'error', text: 'لا يوجد HTML للفحص.' });
      return;
    }

    setBusy(true);
    setNotice(null);

    try {
      const newReport = analyzeHtml(html, sourceName, DEFAULT_OPTIONS);
      setReport(newReport);
      setFilter('all');
      setNotice({
        kind: 'success',
        text: 'اكتمل الفحص محليًا. لم يُرسل HTML إلى خادمنا.',
      });
    } catch (err) {
      setNotice({
        kind: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'تعذّر تحليل HTML.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setHtml('');
    setReport(null);
    setNotice(null);
    setSourceName('HTML مُدخل يدويًا');
    setFilter('all');
    setMode('html');
  };

  const copyReport = async () => {
    if (!report) return;

    const summary = [
      'Intooly SEO Checker',
      `الصفحة: ${report.pageTitle}`,
      `المصدر: ${report.source}`,
      `الدرجة: ${report.score}/100`,
      `اجتاز: ${report.passed} | تحذير: ${report.warnings} | خطأ: ${report.errors} | معلومة: ${report.infos}`,
      '',
      ...report.issues.map(
        (i) =>
          `[${i.status.toUpperCase()}] ${i.title}\n  ${i.details}${i.recommendation ? `\n  → ${i.recommendation}` : ''}`
      ),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setNotice({ kind: 'success', text: 'تم نسخ التقرير.' });
    } catch {
      downloadFile('intooly-seo-report.txt', summary, 'text/plain');
    }
  };

  const exportJson = () => {
    if (!report) return;
    downloadFile(
      'intooly-seo-report.json',
      JSON.stringify(report, null, 2),
      'application/json'
    );
  };

  const exportCsv = () => {
    if (!report) return;
    const escape = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
    const rows = [
      ['الحالة', 'الفئة', 'الفحص', 'التفاصيل', 'القيمة', 'التوصية'],
      ...report.issues.map((i) => [
        i.status,
        i.category,
        i.title,
        i.details,
        i.value || '',
        i.recommendation || '',
      ]),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.map(escape).join(',')).join('\r\n');
    downloadFile('intooly-seo-report.csv', csv, 'text/csv');
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #1f2937 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/seo"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات SEO
          </Link>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <Search className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                فاحص SEO الشامل — On-Page SEO Checker
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                حلّل HTML صفحتك واكتشف المشاكل التقنية والعناصر الناقصة، مع توصيات عملية ودرجة إرشادية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MAIN ============ */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* اختيار وضع الإدخال */}
          <div className="rounded-2xl border-2 border-ink-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-extrabold text-ink-900">
                ابدأ الفحص
              </h2>
              <p className="mt-1 text-xs text-ink-500">
                اختر الطريقة المناسبة: رابط مباشر، لصق HTML، أو رفع ملف.
              </p>
            </div>

            <div className="mb-4 flex gap-2 border-b border-ink-200 flex-wrap">
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
                  mode === 'url'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                رابط الصفحة
              </button>
              <button
                type="button"
                onClick={() => setMode('html')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${
                  mode === 'html'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
                لصق HTML
              </button>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors border-b-2 border-transparent -mb-px text-ink-500 hover:text-ink-700"
              >
                <Upload className="w-4 h-4" />
                رفع ملف
              </button>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept=".html,.htm,text/html"
              onChange={handleFileUpload}
              className="hidden"
            />

            {mode === 'url' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/page"
                    dir="ltr"
                    className="flex-1 rounded-lg border-2 border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={fetching || !url.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {fetching ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    جلب الصفحة
                  </button>
                </div>
                <p className="text-[11px] text-ink-500">
                  سيتم جلب HTML من خادم Intooly. بعض المواقع قد تمنع الجلب بحماية ضد البوتات.
                </p>
              </div>
            )}

            {mode === 'html' && (
              <div className="space-y-2">
                <textarea
                  value={html}
                  onChange={(e) => {
                    setHtml(e.target.value);
                    setReport(null);
                  }}
                  placeholder={'<!doctype html>\n<html lang="ar">\n<head>\n  <title>عنوان الصفحة</title>\n</head>\n<body>\n  <h1>العنوان</h1>\n</body>\n</html>'}
                  dir="ltr"
                  rows={8}
                  className="w-full resize-y rounded-lg border-2 border-ink-200 bg-ink-900 p-3 font-mono text-xs leading-6 text-ink-100 focus:border-brand-500 focus:outline-none"
                  spellCheck={false}
                />
                <p className="text-[11px] text-ink-500">
                  المصدر: {sourceName} • {(html.length / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={busy || !html.trim()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 font-bold text-white shadow-lg shadow-brand-500/30 hover:from-brand-600 hover:to-brand-700 disabled:opacity-50"
              >
                {busy ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                ابدأ فحص SEO
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-200 px-5 py-3 font-bold text-ink-700 hover:bg-ink-50"
              >
                <X className="w-4 h-4" />
                مسح
              </button>
            </div>

            {notice && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 ${
                  notice.kind === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : notice.kind === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-sky-200 bg-sky-50 text-sky-800'
                }`}
              >
                {notice.kind === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : notice.kind === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {notice.text}
              </div>
            )}
          </div>

          {/* ============ التقرير ============ */}
          {report && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border-2 border-ink-200 bg-white p-5 md:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex justify-center md:justify-start">
                    <ScoreGauge score={report.score} size="md" label="درجة SEO" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-ink-900 break-words">
                      {report.pageTitle}
                    </h2>
                    <p className="mt-1 text-xs text-ink-500 break-all" dir="ltr">
                      {report.source}
                    </p>
                    <div className="mt-3">
                      <StatsCards
                        passed={report.passed}
                        warnings={report.warnings}
                        errors={report.errors}
                        infos={report.infos}
                        total={report.totalChecks}
                      />
                    </div>
                  </div>
                </div>

                {report.fetchInfo && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-lg bg-ink-50 p-2">
                      <span className="text-ink-500">HTTP:</span>{' '}
                      <strong>{report.fetchInfo.status}</strong>
                    </div>
                    <div className="rounded-lg bg-ink-50 p-2">
                      <span className="text-ink-500">زمن:</span>{' '}
                      <strong>{report.fetchInfo.responseTimeMs}ms</strong>
                    </div>
                    <div className="rounded-lg bg-ink-50 p-2 truncate">
                      <span className="text-ink-500">النوع:</span>{' '}
                      <strong>{report.fetchInfo.contentType || '—'}</strong>
                    </div>
                    <div className="rounded-lg bg-ink-50 p-2">
                      <span className="text-ink-500">تحويل:</span>{' '}
                      <strong>{report.fetchInfo.redirected ? 'نعم' : 'لا'}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  نسخ التقرير
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-200 bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:bg-ink-50"
                >
                  <FileText className="w-3.5 h-3.5" />
                  طباعة
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-ink-200 bg-white p-3">
                <span className="flex items-center gap-1 text-xs font-bold text-ink-600">
                  <ListFilter className="w-3.5 h-3.5" />
                  تصفية:
                </span>
                {(
                  [
                    { id: 'all' as const, label: 'الكل', count: report.totalChecks },
                    { id: 'pass' as const, label: 'اجتاز', count: report.passed },
                    { id: 'warning' as const, label: 'تحذير', count: report.warnings },
                    { id: 'error' as const, label: 'خطأ', count: report.errors },
                    { id: 'info' as const, label: 'معلومة', count: report.infos },
                  ]
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      filter === f.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredIssues.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-ink-300 p-8 text-center text-sm text-ink-500">
                    لا توجد نتائج ضمن هذا الفلتر.
                  </div>
                )}
                {filteredIssues.map((issue, idx) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    defaultOpen={idx === 0 && filter === 'all'}
                  />
                ))}
              </div>

              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  ملاحظة حول الدرجة
                </p>
                <p className="mt-1">
                  الدرجة مؤشر إرشادي مبني على الفحوص الظاهرة في HTML فقط. لا تمثل ترتيب Google، ولا تقيس سرعة الموقع أو الفهرسة الفعلية.
                </p>
              </div>
            </div>
          )}

          {/* ============ محتوى SEO ============ */}
          <div className="mt-12 space-y-8 text-ink-700">
            <article className="prose prose-lg max-w-none prose-headings:text-ink-900 prose-headings:font-black prose-p:leading-8 prose-p:text-ink-600 prose-li:text-ink-600 prose-strong:text-ink-900">
              <h2 id="what-is-seo-checker">ما هي أداة SEO Checker؟</h2>
              <p>
                أداة SEO Checker، أو فاحص تحسين محركات البحث، هي أداة تساعد على مراجعة العناصر التقنية والمحتوى الموجود داخل صفحة الويب، بهدف اكتشاف المشكلات المحتملة التي قد تؤثر في فهم محركات البحث للصفحة أو في طريقة عرضها ومساعدة المستخدمين على الوصول إلى محتواها.
              </p>
              <p>
                يركز فاحص SEO للصفحات من Intooly على تحليل HTML المتاح، بما في ذلك عنوان الصفحة والوصف التعريفي ووسوم العناوين والروابط والصور ووسوم المشاركة الاجتماعية والبيانات المنظمة بصيغة JSON-LD. تظهر نتائج الفحص في تقرير يوضح العناصر التي اجتازت الاختبار، والملاحظات التي تستحق المراجعة، والمعلومات الإضافية التي ينبغي فهمها في سياق الصفحة.
              </p>
              <p>
                من المهم معرفة أن الفحص الأولي لا يغني عن مراجعة جودة المحتوى أو نية البحث أو إمكانية الزحف والفهرسة الفعلية. كما أن النتيجة الرقمية إرشادية وليست درجة صادرة عن Google.
              </p>

              <h2 id="how-to-use">كيف تستخدم أداة فحص SEO؟</h2>
              <ol>
                <li><strong>أدخل كود HTML:</strong> الصق كود الصفحة في الحقل المخصص، أو ارفع ملف HTML محفوظًا على جهازك.</li>
                <li><strong>جرّب الفحص باستخدام الرابط:</strong> أدخل عنوان الصفحة وحاول جلب HTML من الخادم.</li>
                <li><strong>ابدأ التحليل:</strong> اضغط على زر بدء فحص SEO لتحليل العناصر التي اكتشفها الفاحص.</li>
                <li><strong>راجع النتائج:</strong> افحص عنوان الصفحة والوصف والعناوين والصور والروابط والبيانات المنظمة.</li>
                <li><strong>طبّق التوصيات:</strong> ابدأ بالملاحظات الأكثر أهمية بالنسبة إلى هدف الصفحة، ثم راجع العناصر الأخرى.</li>
                <li><strong>صدّر التقرير:</strong> يمكنك نسخ ملخص النتائج أو تنزيل التقرير بصيغتي JSON وCSV أو طباعته.</li>
              </ol>

              <h2 id="what-it-checks">ما العناصر التي يفحصها SEO Checker؟</h2>
              <h3>1. عنوان الصفحة SEO Title</h3>
              <p>يُعد عنوان الصفحة من العناصر المهمة لفهم موضوعها، وقد يُستخدم مصدرًا للرابط المعروض في نتائج البحث. يتحقق الفاحص من وجود وسم <code>&lt;title&gt;</code> ويعرض محتواه وطوله، وينبهك إذا كان مفقودًا أو خارج النطاق الإرشادي.</p>
              
              <h3>2. الوصف التعريفي Meta Description</h3>
              <p>يفحص التقرير وجود وسم الوصف التعريفي ويعرض النص وطوله. اكتب وصفًا فريدًا لكل صفحة، واجعله طبيعيًا ومفيدًا. لا يوجد طول ثابت يضمن ظهور الوصف كاملًا في نتائج البحث.</p>

              <h3>3. العناوين الرئيسية H1 وH2 وH3</h3>
              <p>تساعد العناوين على تنظيم المحتوى وتوضيح العلاقة بين الأقسام. يفحص SEO Checker عدد عناوين H1، ويرصد عناوين المستويات H2 إلى H6 الموجودة في HTML المقدم.</p>

              <h3>4. الرابط الأساسي Canonical</h3>
              <p>يشير وسم Canonical إلى عنوان URL الذي تفضّل الصفحة اعتباره النسخة الأساسية عند وجود صفحات متشابهة. يتحقق الفاحص من وجود الوسم ويعرض قيمته.</p>

              <h3>5. تعليمات Robots والفهرسة</h3>
              <p>يمكن أن تحتوي الصفحة على تعليمات مثل <code>noindex</code> و<code>nofollow</code>. يعرض الفاحص التعليمات المكتشفة وينبهك عند العثور على <code>noindex</code> لأنه قد يمنع فهرسة الصفحة.</p>

              <h3>6. النص البديل للصور Alt Text</h3>
              <p>يساعد النص البديل على توضيح محتوى الصور عندما لا يمكن رؤيتها. يرصد الفاحص الصور التي لا تحتوي على نص بديل، ويعرض لك روابط هذه الصور المحددة لتتمكن من إصلاحها بسرعة.</p>

              <h3>7. الروابط الداخلية والخارجية</h3>
              <p>يعرض التقرير عدد الروابط التي عثر عليها في HTML، ويبحث عن الروابط التي لا تحتوي على نص ظاهر أو تسمية مناسبة.</p>

              <h3>8. وسوم Open Graph وTwitter Card</h3>
              <p>تساعد وسوم المشاركة الاجتماعية على تحديد العنوان والوصف والصورة التي يمكن أن تظهر عند مشاركة رابط الصفحة على المنصات.</p>

              <h3>9. البيانات المنظمة JSON-LD</h3>
              <p>يتحقق SEO Checker من وجود كتل JSON-LD ويحاول تحليل صياغتها باعتبارها JSON. نجاح تحليل JSON لا يعني أن المخطط صحيح وفق مواصفات Schema.org.</p>

              <h3>10. لغة الصفحة وإعداد العرض للأجهزة المحمولة</h3>
              <p>يفحص التقرير خاصية <code>lang</code> على عنصر HTML ووسم <code>viewport</code> وتعريف ترميز الأحرف عند توفره.</p>
            </article>

            {/* FAQ Section */}
            <div className="rounded-2xl border-2 border-ink-200 bg-white p-6 md:p-8 mt-8">
              <h2 className="text-2xl font-black text-ink-900 mb-6">الأسئلة الشائعة حول SEO Checker</h2>
              <div className="space-y-4">
                {[
                  { q: 'ما هو SEO Checker؟', a: 'هو فاحص لعناصر تحسين محركات البحث داخل الصفحة، مثل عنوان SEO والوصف التعريفي والعناوين والصور والروابط والبيانات المنظمة. يساعدك على اكتشاف ملاحظات تقنية أولية ومراجعتها.' },
                  { q: 'هل أداة فحص SEO مجانية؟', a: 'يمكن استخدام أداة Intooly لفحص HTML المتاح داخل المتصفح دون الحاجة إلى خدمة تحليل مدفوعة. وقد تختلف إمكانية جلب الصفحات عبر الرابط بحسب سياسات المواقع التي تفحصها.' },
                  { q: 'كيف أفحص SEO لصفحة موقعي؟', a: 'الصق كود HTML في الأداة أو ارفع ملف الصفحة، ثم ابدأ الفحص وراجع النتائج والتوصيات. إذا لم يعمل جلب الرابط، استخدم كود مصدر الصفحة بدلًا من ذلك.' },
                  { q: 'هل يضمن SEO Checker تحسين ترتيب موقعي في Google؟', a: 'لا. الأداة تفحص عناصر محددة من HTML، لكنها لا تتحكم في الترتيب ولا تضمن تحسن النتائج. يعتمد الأداء في البحث على عوامل متعددة.' },
                  { q: 'هل يفحص SEO Checker سرعة الموقع؟', a: 'لا، هذا الإصدار لا يقيس سرعة تحميل الصفحة أو مؤشرات Core Web Vitals. يحتاج ذلك إلى اختبار أداء مخصص ومصدر قياس مناسب.' },
                ].map((faq) => (
                  <details key={faq.q} className="group rounded-xl border-2 border-ink-100 bg-white overflow-hidden">
                    <summary className="cursor-pointer p-4 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
                      <span>{faq.q}</span>
                      <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="border-t border-ink-100 p-4 text-sm leading-7 text-ink-600">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* دليل سريع */}
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-6">
              <h2 className="text-lg font-extrabold text-brand-900">💡 نصائح لتحسين SEO</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-brand-900 list-disc pr-5 leading-7">
                <li>ابدأ بالمشاكل الحرجة (الخطوط الحمراء) قبل التحذيرات.</li>
                <li>لا تكرر الكلمة المفتاحية بشكل مفرط — اكتب للبشر أولًا.</li>
                <li>تأكد أن المحتوى يخدم نية البحث (معلوماتي، تجاري، شرائي).</li>
                <li>راجع النتائج الفعلية في Google Search Console بانتظام.</li>
                <li>لا تعتمد على أداة واحدة — استخدم أدوات متخصصة للبيانات الفعلية.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
