'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Link from 'next/link';

import {
  AlertCircle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Download,
  FileSpreadsheet,
  Filter,
  Hash,
  Lightbulb,
  List,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
  Film,
  Scissors,
  FileArchive,
  Wand2,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

type Intent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'comparison'
  | 'general';

type Source =
  | 'Google Autocomplete'
  | 'Google Questions'
  | 'Google Modifiers'
  | 'Google Alphabet'
  | 'Google Comparison'
  | string;

interface Keyword {
  keyword: string;
  intent: Intent;
  source: Source;
  score: number;
  wordCount: number;
  characterCount: number;
  isLongTail: boolean;
  volume?: number | null;
  cpc?: number | null;
}

interface Cluster {
  [key: string]: Keyword[];
}

interface Stats {
  total: number;
  informational: number;
  commercial: number;
  transactional: number;
  comparison: number;
  general: number;
  longTail: number;
  averageScore: number;
}

interface GeneratorResults {
  success: boolean;
  seed: string;
  totalKeywords: number;
  keywords: Keyword[];
  clusters: Cluster;
  questions?: Keyword[];
  commercialKeywords?: Keyword[];
  stats?: Stats;
  meta?: {
    source?: string;
    note?: string;
    queriesUsed?: number;
  };
}

type Tab =
  | 'all'
  | 'questions'
  | 'commercial'
  | 'clusters';

/* =========================================================
   CONSTANTS
========================================================= */

const COUNTRIES = [
  { value: 'eg', label: 'مصر' },
  { value: 'sa', label: 'السعودية' },
  { value: 'ae', label: 'الإمارات' },
  { value: 'kw', label: 'الكويت' },
  { value: 'qa', label: 'قطر' },
  { value: 'bh', label: 'البحرين' },
  { value: 'om', label: 'عُمان' },
  { value: 'jo', label: 'الأردن' },
  { value: 'ma', label: 'المغرب' },
  { value: 'dz', label: 'الجزائر' },
  { value: 'tn', label: 'تونس' },
  { value: 'us', label: 'الولايات المتحدة' },
  { value: 'gb', label: 'بريطانيا' },
];

const LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const INITIAL_STATS: Stats = {
  total: 0,
  informational: 0,
  commercial: 0,
  transactional: 0,
  comparison: 0,
  general: 0,
  longTail: 0,
  averageScore: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function getIntentLabel(intent: Intent): string {
  switch (intent) {
    case 'informational':
      return 'معلوماتي';
    case 'commercial':
      return 'تجاري';
    case 'transactional':
      return 'شرائي';
    case 'comparison':
      return 'مقارنة';
    default:
      return 'عام';
  }
}

function getIntentClasses(intent: Intent): string {
  switch (intent) {
    case 'informational':
      return 'bg-blue-100 text-blue-700';
    case 'commercial':
      return 'bg-purple-100 text-purple-700';
    case 'transactional':
      return 'bg-green-100 text-green-700';
    case 'comparison':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getScoreClasses(score: number): string {
  if (score >= 80) {
    return 'bg-green-100 text-green-700';
  }
  if (score >= 60) {
    return 'bg-brand-100 text-brand-700';
  }
  if (score >= 40) {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-gray-100 text-gray-700';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'ممتاز';
  if (score >= 60) return 'جيد';
  if (score >= 40) return 'متوسط';
  return 'ضعيف';
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function KeywordGeneratorPage() {
  const [seed, setSeed] = useState('');
  const [country, setCountry] = useState('eg');
  const [language, setLanguage] = useState('ar');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [results, setResults] = useState<GeneratorResults | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [intentFilter, setIntentFilter] = useState<'all' | Intent>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | '80' | '60' | '40'>('all');

  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  /* =========================================================
     GENERATE
  ========================================================= */

  async function handleGenerate() {
    const cleanSeed = seed.trim();

    if (!cleanSeed) {
      setError('يرجى كتابة كلمة أو موضوع للبحث عنه.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setSelectedKeywords(new Set());
    setExpandedCluster(null);

    try {
      const response = await fetch('/api/keyword-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seed: cleanSeed,
          country,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'حدث خطأ أثناء توليد الكلمات المفتاحية.');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'تعذر إنشاء الكلمات المفتاحية.');
      }

      setResults(data);
      setActiveTab('all');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     FILTERED KEYWORDS
  ========================================================= */

  const allKeywords = results?.keywords ?? [];

  const questions = results?.questions ?? allKeywords.filter((item) => item.intent === 'informational');

  const commercialKeywords =
    results?.commercialKeywords ??
    allKeywords.filter((item) => item.intent === 'commercial' || item.intent === 'transactional');

  const filteredKeywords = useMemo(() => {
    let items = allKeywords;

    if (activeTab === 'questions') {
      items = questions;
    }

    if (activeTab === 'commercial') {
      items = commercialKeywords;
    }

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      items = items.filter((item) => item.keyword.toLowerCase().includes(search));
    }

    if (intentFilter !== 'all') {
      items = items.filter((item) => item.intent === intentFilter);
    }

    if (sourceFilter !== 'all') {
      items = items.filter((item) => item.source === sourceFilter);
    }

    if (scoreFilter !== 'all') {
      const minimum = Number(scoreFilter);
      items = items.filter((item) => item.score >= minimum);
    }

    return items;
  }, [
    allKeywords,
    questions,
    commercialKeywords,
    activeTab,
    searchTerm,
    intentFilter,
    sourceFilter,
    scoreFilter,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = results?.stats ?? INITIAL_STATS;

  const sources = useMemo(() => {
    const unique = new Set<string>();
    allKeywords.forEach((item) => {
      if (item.source) {
        unique.add(item.source);
      }
    });
    return Array.from(unique).sort();
  }, [allKeywords]);

  /* =========================================================
     SELECTION
  ========================================================= */

  function toggleKeyword(keyword: string) {
    setSelectedKeywords((previous) => {
      const next = new Set(previous);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedKeywords((previous) => {
      const next = new Set(previous);
      filteredKeywords.forEach((item) => {
        next.add(item.keyword);
      });
      return next;
    });
  }

  function clearSelection() {
    setSelectedKeywords(new Set());
  }

  /* =========================================================
     COPY
  ========================================================= */

  async function copyText(text: string, keyword?: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (keyword) {
        setCopiedKeyword(keyword);
        window.setTimeout(() => {
          setCopiedKeyword(null);
        }, 1500);
      }
    } catch {
      setError('تعذر نسخ النص. يرجى المحاولة مرة أخرى.');
    }
  }

  async function copySelected() {
    const selected = Array.from(selectedKeywords);
    if (!selected.length) {
      setError('لم تحدد أي كلمات بعد.');
      return;
    }
    await copyText(selected.join('\n'));
  }

  async function copyAll() {
    if (!filteredKeywords.length) {
      setError('لا توجد كلمات لنسخها.');
      return;
    }
    const text = filteredKeywords.map((item) => item.keyword).join('\n');
    await copyText(text);
  }

  /* =========================================================
     EXCEL EXPORT
  ========================================================= */

  function exportToExcel() {
    if (!results || !filteredKeywords.length) {
      setError('لا توجد بيانات لتصديرها.');
      return;
    }

    const rows = filteredKeywords.map((item, index) => ({
      '#': index + 1,
      'الكلمة المفتاحية': item.keyword,
      'نية البحث': getIntentLabel(item.intent),
      'المصدر': item.source,
      'Opportunity Score': item.score,
      'التقييم': getScoreLabel(item.score),
      'كلمة طويلة': item.isLongTail ? 'نعم' : 'لا',
      'عدد الكلمات': item.wordCount,
      'عدد الأحرف': item.characterCount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 45 },
      { wch: 18 },
      { wch: 28 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Keywords');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const safeSeed = seed
      .trim()
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\-_ ]/g, '')
      .replace(/\s+/g, '-');

    const date = new Date().toISOString().slice(0, 10);

    const fileName = 'intooly-keywords-' + (safeSeed || 'export') + '-' + date + '.xlsx';

    saveAs(blob, fileName);
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  function resetFilters() {
    setSearchTerm('');
    setIntentFilter('all');
    setSourceFilter('all');
    setScoreFilter('all');
  }

  /* =========================================================
     CLUSTERS
  ========================================================= */

  const clusterEntries = Object.entries(results?.clusters ?? {});

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-ink-50 text-ink-900">

      {/* =====================================================
          HERO — هوية intooly الموحّدة (مع توهج بسيط)
      ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20 text-ink-900"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl" />

        <style jsx>{`
          @keyframes keyword-hero-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-3px) scale(1.05); }
          }
          @keyframes keyword-hero-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(234, 179, 8, 0); }
          }
          @keyframes keyword-hero-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-6deg); }
            75% { transform: rotate(6deg); }
          }
          .keyword-hero-icon {
            animation: keyword-hero-float 3s ease-in-out infinite, keyword-hero-glow 3s ease-in-out infinite;
          }
          .keyword-hero-icon:hover .keyword-hero-icon-svg {
            animation: keyword-hero-wiggle 0.6s ease-in-out;
          }
        `}</style>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* ✅ الأيقونة بجوار العنوان مع تأثير توهج */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3" dir="rtl">
              <div className="keyword-hero-icon w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Hash className="keyword-hero-icon-svg w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                مولّد الكلمات المفتاحية
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              اكتشاف الكلمات • تصنيف النية • Opportunity Score
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              اكتشف كلمات مفتاحية جديدة، نوايا البحث، والأسئلة المناسبة لمحتواك.
            </p>
            {/* ✅ تم حذف السطر المطلوب حذفه */}
          </div>

          {/* =================================================
              GENERATOR CARD
          ================================================= */}

          <div className="mx-auto mt-8 max-w-5xl">
            <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-xl shadow-ink-900/5 md:p-7">
              <div className="grid gap-5 md:grid-cols-12">
                {/* Seed */}
                <div className="md:col-span-6">
                  <label htmlFor="keyword-seed" className="mb-2 block text-sm font-bold">
                    الكلمة أو الموضوع
                  </label>

                  <div className="relative">
                    <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />

                    <input
                      id="keyword-seed"
                      type="text"
                      value={seed}
                      onChange={(event) => setSeed(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !loading) {
                          void handleGenerate();
                        }
                      }}
                      placeholder="مثال: أدوات الذكاء الاصطناعي"
                      className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pr-12 pl-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="md:col-span-3">
                  <label htmlFor="keyword-country" className="mb-2 block text-sm font-bold">
                    الدولة
                  </label>

                  <select
                    id="keyword-country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  >
                    {COUNTRIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language */}
                <div className="md:col-span-3">
                  <label htmlFor="keyword-language" className="mb-2 block text-sm font-bold">
                    اللغة
                  </label>

                  <select
                    id="keyword-language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  >
                    {LANGUAGES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Generate */}
                <div className="md:col-span-12">
                  <button
                    type="button"
                    onClick={() => void handleGenerate()}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري تحليل الكلمات... (قد يستغرق 20-40 ثانية)
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        إنشاء الكلمات المفتاحية
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">حدث خطأ</p>
                    <p className="mt-1">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="rounded-lg p-1 hover:bg-red-100"
                    aria-label="إغلاق الخطأ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {results && (
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<List className="h-5 w-5" />}
              title="إجمالي الكلمات"
              value={stats.total}
              description="كلمة مفتاحية مكتشفة"
            />
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              title="متوسط الفرصة"
              value={Math.round(stats.averageScore)}
              suffix="/100"
              description="Opportunity Score"
            />
            <FeatureCard
              icon={<Lightbulb className="h-5 w-5" />}
              title="كلمات طويلة"
              value={stats.longTail}
              description="Long-tail keywords"
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="أسئلة"
              value={questions.length}
              description="أفكار محتوى وأسئلة"
            />
          </div>

          {/* Intent overview */}
          <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-extrabold">تحليل نية البحث</h2>
                <p className="text-sm text-ink-500">توزيع الكلمات حسب نية المستخدم</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <IntentStat label="معلوماتي" value={stats.informational} intent="informational" />
              <IntentStat label="تجاري" value={stats.commercial} intent="commercial" />
              <IntentStat label="شرائي" value={stats.transactional} intent="transactional" />
              <IntentStat label="مقارنة" value={stats.comparison} intent="comparison" />
              <IntentStat label="عام" value={stats.general} intent="general" />
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <TabButton
                  active={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  icon={<List className="h-4 w-4" />}
                  label={`كل الكلمات (${allKeywords.length})`}
                />
                <TabButton
                  active={activeTab === 'questions'}
                  onClick={() => setActiveTab('questions')}
                  icon={<Lightbulb className="h-4 w-4" />}
                  label={`الأسئلة (${questions.length})`}
                />
                <TabButton
                  active={activeTab === 'commercial'}
                  onClick={() => setActiveTab('commercial')}
                  icon={<TrendingUp className="h-4 w-4" />}
                  label={`التجارية (${commercialKeywords.length})`}
                />
                <TabButton
                  active={activeTab === 'clusters'}
                  onClick={() => setActiveTab('clusters')}
                  icon={<BarChart3 className="h-4 w-4" />}
                  label={`المجموعات (${clusterEntries.length})`}
                />
              </div>

              {activeTab !== 'clusters' && (
                <div className="grid gap-3 lg:grid-cols-12">
                  <div className="relative lg:col-span-4">
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="ابحث داخل الكلمات..."
                      className="w-full rounded-xl border border-ink-200 bg-white py-3 pr-10 pl-3 text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <select
                    value={intentFilter}
                    onChange={(event) => setIntentFilter(event.target.value as 'all' | Intent)}
                    className="rounded-xl border border-ink-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-500 lg:col-span-2"
                  >
                    <option value="all">كل النوايا</option>
                    <option value="informational">معلوماتي</option>
                    <option value="commercial">تجاري</option>
                    <option value="transactional">شرائي</option>
                    <option value="comparison">مقارنة</option>
                    <option value="general">عام</option>
                  </select>

                  <select
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                    className="rounded-xl border border-ink-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-500 lg:col-span-2"
                  >
                    <option value="all">كل المصادر</option>
                    {sources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>

                  <select
                    value={scoreFilter}
                    onChange={(event) => setScoreFilter(event.target.value as 'all' | '80' | '60' | '40')}
                    className="rounded-xl border border-ink-200 bg-white px-3 py-3 text-sm outline-none focus:border-brand-500 lg:col-span-2"
                  >
                    <option value="all">كل الدرجات</option>
                    <option value="80">80+ ممتاز</option>
                    <option value="60">60+ جيد</option>
                    <option value="40">40+ متوسط</option>
                  </select>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-3 text-sm font-bold transition hover:border-brand-400 hover:text-brand-600 lg:col-span-2"
                  >
                    <Filter className="h-4 w-4" />
                    إعادة ضبط
                  </button>
                </div>
              )}

              {activeTab !== 'clusters' && (
                <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-bold transition hover:border-brand-400 hover:text-brand-600"
                  >
                    تحديد الظاهر
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-xl border border-ink-200 px-3 py-2 text-sm font-bold transition hover:border-brand-400 hover:text-brand-600"
                  >
                    إلغاء التحديد
                  </button>
                  <button
                    type="button"
                    onClick={() => void copySelected()}
                    className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-100"
                  >
                    <Clipboard className="h-4 w-4" />
                    نسخ المحدد
                    {selectedKeywords.size > 0 && ` (${selectedKeywords.size})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyAll()}
                    className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-100"
                  >
                    <Clipboard className="h-4 w-4" />
                    نسخ الكل
                  </button>
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="mr-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition hover:from-brand-600 hover:to-brand-700"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    تصدير Excel
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CLUSTERS */}
          {activeTab === 'clusters' ? (
            <div className="mt-6 space-y-3">
              {clusterEntries.length === 0 ? (
                <EmptyState
                  icon={<BarChart3 className="h-8 w-8" />}
                  title="لا توجد مجموعات"
                  description="لم يتم إنشاء مجموعات للكلمات الحالية."
                />
              ) : (
                clusterEntries.map(([clusterName, keywords]) => {
                  const isExpanded = expandedCluster === clusterName;
                  return (
                    <div
                      key={clusterName}
                      className="overflow-hidden rounded-2xl border border-ink-200 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedCluster(isExpanded ? null : clusterName)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-right transition hover:bg-ink-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                            <Hash className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-extrabold">{clusterName}</p>
                            <p className="mt-1 text-sm text-ink-500">{keywords.length} كلمة</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                      {isExpanded && (
                        <div className="border-t border-ink-100">
                          <div className="divide-y divide-ink-100">
                            {keywords.map((item) => (
                              <KeywordRow
                                key={item.keyword}
                                item={item}
                                selected={selectedKeywords.has(item.keyword)}
                                copied={copiedKeyword === item.keyword}
                                onToggle={() => toggleKeyword(item.keyword)}
                                onCopy={() => void copyText(item.keyword, item.keyword)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">
              <div className="border-b border-ink-100 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-extrabold">الكلمات المفتاحية</h2>
                    <p className="mt-1 text-sm text-ink-500">
                      عرض {filteredKeywords.length} من {allKeywords.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
                    {selectedKeywords.size} محددة
                  </div>
                </div>
              </div>

              {filteredKeywords.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-8 w-8" />}
                  title="لا توجد نتائج"
                  description="جرب تغيير البحث أو الفلاتر."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-right">
                    <thead>
                      <tr className="border-b border-ink-100 bg-ink-50/70 text-xs font-extrabold text-ink-600">
                        <th className="px-4 py-4">اختيار</th>
                        <th className="px-4 py-4">الكلمة المفتاحية</th>
                        <th className="px-4 py-4">النية</th>
                        <th className="px-4 py-4">المصدر</th>
                        <th className="px-4 py-4">الفرصة</th>
                        <th className="px-4 py-4">Long-tail</th>
                        <th className="px-4 py-4">نسخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeywords.map((item) => (
                        <KeywordRow
                          key={item.keyword}
                          item={item}
                          selected={selectedKeywords.has(item.keyword)}
                          copied={copiedKeyword === item.keyword}
                          onToggle={() => toggleKeyword(item.keyword)}
                          onCopy={() => void copyText(item.keyword, item.keyword)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DATA NOTICE */}
          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h3 className="font-extrabold text-brand-800">ملاحظة مهمة حول البيانات</h3>
                <p className="mt-2 text-sm leading-7 text-brand-700">
                  يعتمد هذا المولد على Google Autocomplete، YouTube Suggestions، Bing Suggestions،
                  و Google Trends لاكتشاف عبارات البحث والأفكار التي يكتبها المستخدمون فعلاً.
                </p>
                <p className="mt-2 text-sm leading-7 text-brand-700">
                  لكنه لا يوفر حجم البحث الشهري الحقيقي أو تكلفة النقرة CPC. لذلك لا نعرض أرقامًا
                  وهمية، بل نعرض <strong> Opportunity Score </strong> لمساعدتك على ترتيب الكلمات
                  واختيار الفرص الأفضل مبدئيًا.
                </p>
                {results?.meta?.queriesUsed && (
                  <p className="mt-2 text-xs text-brand-600">
                    عدد الطلبات المستخدمة في هذا البحث: {results.meta.queriesUsed}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureInfo
              icon={<Sparkles className="h-5 w-5" />}
              title="اقتراحات Google + YouTube + Bing"
              description="اكتشاف عبارات البحث المقترحة من 3 محركات مختلفة لتنويع المصادر."
            />
            <FeatureInfo
              icon={<Target className="h-5 w-5" />}
              title="نية البحث"
              description="تصنيف الكلمات إلى معلوماتية وتجارية وشرائية ومقارنة."
            />
            <FeatureInfo
              icon={<TrendingUp className="h-5 w-5" />}
              title="Opportunity Score"
              description="درجة تساعدك على ترتيب الكلمات الطويلة والأكثر ملاءمة للمحتوى."
            />
          </div>
        </section>
      )}

      {/* Empty initial state */}
      {!results && !loading && (
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureInfo
              icon={<Search className="h-5 w-5" />}
              title="اكتشاف الكلمات"
              description="أدخل كلمة أساسية واحصل على 1500+ اقتراح من Google، YouTube، Bing، و Google Trends."
            />
            <FeatureInfo
              icon={<Target className="h-5 w-5" />}
              title="فهم نية البحث"
              description="اعرف هل الكلمة معلوماتية أو تجارية أو شرائية أو مقارنة."
            />
            <FeatureInfo
              icon={<FileSpreadsheet className="h-5 w-5" />}
              title="تصدير النتائج"
              description="صدّر النتائج إلى Excel لاستخدامها في خطة المحتوى."
            />
          </div>
        </section>
      )}

      {/* =====================================================
          SEO CONTENT — أسفل الأداة
      ===================================================== */}

      <section className="py-12 md:py-16 bg-white" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هو مولّد الكلمات المفتاحية؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              <strong>مولّد الكلمات المفتاحية</strong> من intooly هو أداة مجانية تعمل بالكامل في متصفحك،
              تتيح لك <strong>اكتشاف مئات الكلمات المفتاحية</strong> من كلمة أساسية واحدة. يعتمد على
              <strong> Google Autocomplete</strong>، <strong>YouTube Suggestions</strong>،
              <strong> Bing Suggestions</strong>، و<strong> Google Trends</strong> — أشهر 4 مصادر
              للبحث عن الكلمات في العالم العربي.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              لا يحتاج تسجيل دخول، ولا يخزّن بحثك على أي خادم. كل عمليات التوسيع والتصنيف
              <strong> تتم محلياً</strong>، ويظهر لك أكثر من <strong>1500 كلمة مفتاحية</strong>
              مصنّفة حسب نية البحث و<strong> Opportunity Score</strong>.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              لماذا تختار مولّد الكلمات المفتاحية من intooly؟
            </h2>
            <ul className="space-y-3 text-sm leading-relaxed text-ink-700 text-right list-disc pr-6">
              <li><strong>4 مصادر بحث</strong> — Google, YouTube, Bing, و Google Trends.</li>
              <li><strong>تصنيف نية البحث</strong> — معلوماتي، تجاري، شرائي، مقارنة، عام.</li>
              <li><strong>Opportunity Score</strong> — درجة لترتيب الكلمات الأكثر قيمة.</li>
              <li><strong>Clusters</strong> — تجميع الكلمات في مجموعات موضوعية.</li>
              <li><strong>تصدير Excel</strong> — حمّل النتائج كملف XLSX للتخطيط.</li>
              <li><strong>دعم 13 دولة عربية</strong> — مصر، السعودية، الإمارات، وغيرها.</li>
              <li><strong>مجاني بالكامل</strong> — بدون تسجيل، بدون حد أقصى.</li>
            </ul>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              حالات استخدام مولّد الكلمات المفتاحية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '📝', title: 'لكتّاب المحتوى', desc: 'اكتشف مواضيع مقالاتك من خلال الكلمات التي يبحث عنها جمهورك فعلاً.' },
                { icon: '🚀', title: 'لخبراء SEO', desc: 'ابحث عن كلمات طويلة (Long-tail) منخفضة المنافسة وسهلة التصدر.' },
                { icon: '🛒', title: 'للتجارة الإلكترونية', desc: 'اعرف كيف يبحث العملاء عن منتجاتك — البادئات، الأسعار، والمقارنات.' },
                { icon: '📱', title: 'لصنّاع المحتوى', desc: 'اكتشف أسئلة الجمهور لتصنع فيديوهات تيك توك ويوتيوب تتصدر.' },
                { icon: '🎯', title: 'للمسوقين', desc: 'حلّل نية البحث لتعرف أي كلمات تجيب عن استفسارات الشراء.' },
                { icon: '📊', title: 'لمحللي السوق', desc: 'افهم سلوك البحث في 13 دولة عربية بنقرة واحدة.' },
              ].map((use, i) => (
                <div key={i} className="border border-ink-200 rounded-2xl p-5 bg-ink-50 text-right hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">{use.icon}</div>
                  <h3 className="font-bold text-base mb-2 text-ink-900">{use.title}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{use.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيف تستخدم مولّد الكلمات في 3 خطوات؟
            </h2>
            <div className="space-y-4">
              {[
                { num: '1', title: 'أدخل الكلمة الأساسية', desc: 'اكتب موضوعاً عاماً (مثل: أدوات الذكاء الاصطناعي)، واختر الدولة واللغة.' },
                { num: '2', title: 'اضغط "إنشاء الكلمات"', desc: 'المولّد يطلب مئات الاقتراحات من 4 مصادر ويصنّفها حسب نية البحث. تستغرق العملية 20-40 ثانية.' },
                { num: '3', title: 'صفّي، اختر، وصدّر', desc: 'استخدم الفلاتر (نية البحث، المصدر، الفرصة)، حدّد الكلمات المفيدة، ثم صدّرها إلى Excel.' },
              ].map((step, i) => (
                <div key={i} className="border border-ink-200 rounded-xl p-5 text-right flex gap-4 bg-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1 text-ink-900">{step.title}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% وبدون حد أقصى لعدد عمليات البحث أو الكلمات المستخرجة.' },
                { q: 'هل تُخزَّن كلماتي على الخادم؟', a: 'لا. لا نخزّن أي شيء. كل عملية التوسيع والتصنيف تتم في متصفحك مباشرة.' },
                { q: 'ما الفرق بين Opportunity Score وحجم البحث؟', a: 'Opportunity Score هو تقدير مبني على طول الكلمة ونوعها ونيّة بحثها. حجم البحث الحقيقي يحتاج Google Keyword Planner. نحن لا نعرض أرقاماً وهمية.' },
                { q: 'من أين تُجمع الكلمات؟', a: 'من 4 مصادر: Google Autocomplete، YouTube Suggestions، Bing Suggestions، و Google Trends.' },
                { q: 'كم كلمة يمكنني الحصول عليها؟', a: 'عادةً بين 800 و 1500 كلمة فريدة لكل بحث، حسب شمولية كلمتك الأساسية.' },
                { q: 'هل يمكنني تصدير النتائج؟', a: 'نعم، بصيغة Excel (XLSX) جاهز للاستخدام في خطط المحتوى.' },
                { q: 'ما هي "نية البحث"؟', a: 'تصنيف الكلمة حسب هدف المستخدم: معلوماتي (يبحث عن معلومة)، تجاري (يقارن)، شرائي (ينوي الشراء)، مقارنة (بين خيارين)، أو عام.' },
                { q: 'هل تدعم اللغة الإنجليزية؟', a: 'نعم، بالإضافة إلى 13 دولة عربية يمكنك اختيار الدولة المناسبة لجمهورك.' },
              ].map((faq, i) => (
                <details key={i} className="border border-ink-200 rounded-lg p-4 bg-white group">
                  <summary className="cursor-pointer font-bold text-ink-900 mb-1 text-right flex justify-between items-center">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-brand-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <p className="text-sm text-ink-600 text-right mt-2 pt-2 border-t border-ink-100 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </article>

          {/* أدوات ذات صلة */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Film, title: 'ضغط الفيديو', href: '/tools/video-compressor', desc: 'قلّل حجم الفيديو' },
                { icon: Scissors, title: 'قص الفيديو', href: '/tools/video-trimmer', desc: 'قص بدقة الإطار' },
                { icon: FileArchive, title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل حجم الصور' },
                { icon: Wand2, title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="bg-white border border-ink-200 p-4 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block"
                >
                  <tool.icon className="w-7 h-7 text-brand-500 mx-auto mb-2" />
                  <h3 className="font-extrabold text-xs text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-ink-500 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'هل مولّد الكلمات المفتاحية مجاني بالكامل؟',
                acceptedAnswer: { '@type': 'Answer', text: 'نعم، مجانية 100% وبدون حد أقصى لعدد عمليات البحث.' },
              },
              {
                '@type': 'Question',
                name: 'هل تُخزَّن كلماتي على الخادم؟',
                acceptedAnswer: { '@type': 'Answer', text: 'لا، كل عملية التوسيع والتصنيف تتم في متصفحك مباشرة.' },
              },
              {
                '@type': 'Question',
                name: 'ما الفرق بين Opportunity Score وحجم البحث؟',
                acceptedAnswer: { '@type': 'Answer', text: 'Opportunity Score هو تقدير مبني على طول الكلمة ونوعها ونيّة بحثها. حجم البحث الحقيقي يحتاج Google Keyword Planner.' },
              },
              {
                '@type': 'Question',
                name: 'من أين تُجمع الكلمات المفتاحية؟',
                acceptedAnswer: { '@type': 'Answer', text: 'من 4 مصادر: Google Autocomplete، YouTube Suggestions، Bing Suggestions، و Google Trends.' },
              },
              {
                '@type': 'Question',
                name: 'كم كلمة يمكنني الحصول عليها؟',
                acceptedAnswer: { '@type': 'Answer', text: 'عادةً بين 800 و 1500 كلمة فريدة لكل بحث، حسب شمولية كلمتك الأساسية.' },
              },
              {
                '@type': 'Question',
                name: 'هل يمكنني تصدير النتائج؟',
                acceptedAnswer: { '@type': 'Answer', text: 'نعم، بصيغة Excel (XLSX) جاهز للاستخدام في خطط المحتوى.' },
              },
            ],
          }),
        }}
      />
    </main>
  );
}

/* =========================================================
   KEYWORD ROW
========================================================= */

interface KeywordRowProps {
  item: Keyword;
  selected: boolean;
  copied: boolean;
  onToggle: () => void;
  onCopy: () => void;
}

function KeywordRow({ item, selected, copied, onToggle, onCopy }: KeywordRowProps) {
  return (
    <tr className="border-b border-ink-100 last:border-b-0 hover:bg-ink-50/50">
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
            selected
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-ink-300 bg-white'
          }`}
          aria-label={selected ? 'إلغاء تحديد الكلمة' : 'تحديد الكلمة'}
        >
          {selected && <Check className="h-4 w-4" />}
        </button>
      </td>

      <td className="px-4 py-4">
        <div className="max-w-md">
          <p className="font-bold text-ink-900">{item.keyword}</p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-500">
            <span>{item.wordCount} كلمات</span>
            <span>•</span>
            <span>{item.characterCount} حرف</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getIntentClasses(item.intent)}`}>
          {getIntentLabel(item.intent)}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="rounded-lg bg-ink-100 px-2.5 py-1.5 text-xs font-bold text-ink-600">
          {item.source}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${getScoreClasses(item.score)}`}>
            {item.score}
          </span>
          <span className="text-xs text-ink-500">{getScoreLabel(item.score)}</span>
        </div>
      </td>

      <td className="px-4 py-4">
        {item.isLongTail ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">نعم</span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">لا</span>
        )}
      </td>

      <td className="px-4 py-4">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-bold transition hover:border-brand-400 hover:text-brand-600"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              تم
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5" />
              نسخ
            </>
          )}
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active
          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   INTENT STAT
========================================================= */

interface IntentStatProps {
  label: string;
  value: number;
  intent: Intent;
}

function IntentStat({ label, value, intent }: IntentStatProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getIntentClasses(intent)}`}>
          {label}
        </span>
        <span className="text-xl font-extrabold">{value}</span>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  suffix?: string;
  description: string;
}

function FeatureCard({ icon, title, value, suffix, description }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          {icon}
        </div>
        <div className="text-left">
          <div className="text-2xl font-extrabold">
            {value}
            {suffix && <span className="text-sm text-ink-400">{suffix}</span>}
          </div>
        </div>
      </div>
      <h3 className="mt-4 font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
    </div>
  );
}

/* =========================================================
   FEATURE INFO
========================================================= */

interface FeatureInfoProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureInfo({ icon, title, description }: FeatureInfoProps) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          {icon}
        </div>
        <div>
          <h3 className="font-extrabold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
    </div>
  );
}