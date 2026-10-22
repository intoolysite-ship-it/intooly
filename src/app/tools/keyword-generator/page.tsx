
'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  BarChart3,
  Globe,
  FileText,
} from 'lucide-react';

import SearchInput from '@/components/keyword-generator/SearchInput';
import ResultsGrid from '@/components/keyword-generator/ResultsGrid';
import FiltersBar from '@/components/keyword-generator/FiltersBar';

import { DEFAULT_INPUT, DEFAULT_FILTERS } from '@/lib/keyword-generator/types';
import type {
  KeywordInput,
  Keyword,
  KeywordCluster,
  ContentPlan,
  KeywordFilters,
  ToolStatus,
} from '@/lib/keyword-generator/types';

import { KEYWORD_MESSAGES } from '@/lib/keyword-generator/constants';
import { generateKeywords } from '@/lib/keyword-generator/keywordGenerator';
import { buildClusters } from '@/lib/keyword-generator/clusterBuilder';
import { generateContentPlan } from '@/lib/keyword-generator/contentSuggestor';
import { exportKeywords } from '@/lib/keyword-generator/exporter';

export default function KeywordGeneratorPage() {
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [input, setInput] = useState<KeywordInput>(DEFAULT_INPUT);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [filters, setFilters] = useState<KeywordFilters>(DEFAULT_FILTERS);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = status === 'loading';
  const hasResults = keywords.length > 0;

  // تصفية النتائج
  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      const query = filters.searchQuery?.trim().toLocaleLowerCase();

      if (query && !kw.text.toLocaleLowerCase().includes(query)) {
        return false;
      }

      if (
        filters.intent?.length &&
        !filters.intent.includes(kw.intent)
      ) {
        return false;
      }

      if (
        filters.competitionLevel?.length &&
        !filters.competitionLevel.includes(kw.competitionLevel)
      ) {
        return false;
      }

      if (
        filters.opportunityType?.length &&
        !filters.opportunityType.includes(kw.opportunityType)
      ) {
        return false;
      }

      return true;
    });
  }, [keywords, filters]);

  // توليد الكلمات وتحليلها
  const handleSearch = useCallback(async (searchInput: KeywordInput) => {
    setError(null);
    setKeywords([]);
    setClusters([]);
    setContentPlan(null);
    setFilters(DEFAULT_FILTERS);
    setInput(searchInput);
    setStatus('loading');
    setProgress(0);
    setMessage('جاري جلب اقتراحات الكلمات المفتاحية...');

    try {
      const generated = await generateKeywords(
        searchInput,
        (p, msg) => {
          setProgress(p);
          setMessage(msg);
        }
      );

      if (!generated.length) {
        setError(KEYWORD_MESSAGES.NO_RESULTS);
        setStatus('empty');
        return;
      }

      setKeywords(generated);

      // تجميع الكلمات المتقاربة موضوعياً
      setMessage('جاري تجميع المواضيع...');
      setProgress(85);

      const builtClusters = buildClusters(generated);
      setClusters(builtClusters);

      // اختيار كلمة خطة المحتوى بناءً على الصلة فقط.
      // لا نستخدم درجة المنافسة؛ فقد تكون غير متاحة.
      setMessage('جاري إعداد خطة المحتوى...');
      setProgress(95);

      const rankedKeywords = [...generated].sort((a, b) => {
        const relevanceA = Number.isFinite(a.relevanceScore)
          ? a.relevanceScore
          : 0;

        const relevanceB = Number.isFinite(b.relevanceScore)
          ? b.relevanceScore
          : 0;

        return relevanceB - relevanceA;
      });

      const topKeyword = rankedKeywords[0];

      if (topKeyword) {
        setContentPlan(generateContentPlan(topKeyword));
      }

      setProgress(100);
      setMessage(KEYWORD_MESSAGES.SUCCESS);
      setStatus('success');
    } catch (e) {
      console.error('خطأ في توليد الكلمات المفتاحية:', e);

      const errMsg =
        e instanceof Error
          ? e.message
          : KEYWORD_MESSAGES.ERROR_GENERIC;

      setError(errMsg);
      setStatus('error');
    }
  }, []);

  // تصدير النتائج بعد تطبيق الفلاتر
  const handleExport = useCallback(
    (format: 'csv' | 'json' | 'markdown') => {
      if (!filteredKeywords.length) {
        setError('لا توجد كلمات لتصديرها بعد تطبيق الفلاتر.');
        return;
      }

      try {
        setError(null);

        exportKeywords(
          filteredKeywords,
          {
            format,
            includeAnalysis: true,
            includeContentPlan: true,
          },
          clusters,
          contentPlan
        );
      } catch (e) {
        console.error('خطأ في التصدير:', e);
        setError('فشل تصدير النتائج. حاول مرة أخرى.');
      }
    },
    [filteredKeywords, clusters, contentPlan]
  );

  // بدء بحث جديد
  const handleNewSearch = useCallback(() => {
    setStatus('idle');
    setKeywords([]);
    setClusters([]);
    setContentPlan(null);
    setFilters(DEFAULT_FILTERS);
    setError(null);
    setProgress(0);
    setMessage('');

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const features = [
    {
      icon: '🌍',
      title: 'أسواق متعددة',
      desc: 'اختر الدولة واللغة لاستكشاف الاقتراحات',
    },
    {
      icon: '🔎',
      title: 'اقتراحات الكلمات',
      desc: 'تمييز اقتراحات Google عن الكلمات المولّدة',
    },
    {
      icon: '🧠',
      title: 'نية البحث',
      desc: 'تصنيف آلي يساعد على فهم غرض الباحث',
    },
    {
      icon: '📝',
      title: 'خطة محتوى',
      desc: 'أفكار أولية لبناء محتوى مناسب',
    },
  ];

  const seoFeatures = [
    {
      icon: '🌍',
      title: 'استهداف الأسواق',
      desc: 'اختر السوق واللغة من إعدادات البحث المتاحة في الأداة.',
    },
    {
      icon: '🔎',
      title: 'مصادر الاقتراحات',
      desc: 'عرض مصدر الكلمات للتمييز بين الاقتراحات الفعلية والكلمات المولّدة.',
    },
    {
      icon: '🧠',
      title: 'نية البحث',
      desc: 'تصنيف آلي مبدئي للنية المعلوماتية والتجارية والشرائية والملاحية.',
    },
    {
      icon: '📊',
      title: 'توضيح حدود البيانات',
      desc: 'اقتراحات Google لا توفر وحدها حجم البحث الشهري أو صعوبة المنافسة.',
    },
    {
      icon: '🎯',
      title: 'تصنيف الكلمات',
      desc: 'تصنيف مبدئي يساعد على تنظيم الكلمات، وليس ضماناً لنجاحها.',
    },
    {
      icon: '📝',
      title: 'خطة محتوى',
      desc: 'إنشاء مسودة محتوى انطلاقاً من إحدى الكلمات الناتجة.',
    },
    {
      icon: '📁',
      title: 'تجميع المواضيع',
      desc: 'تنظيم الكلمات في مجموعات موضوعية مقترحة.',
    },
    {
      icon: '📥',
      title: 'تصدير النتائج',
      desc: 'تصدير الكلمات والتحليلات المتاحة بصيغ CSV وJSON وMarkdown.',
    },
    {
      icon: '🔒',
      title: 'معالجة محلية',
      desc: 'يتم التحليل والتصدير في المتصفح، مع وجود طلب خارجي لجلب الاقتراحات.',
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'أدخل الكلمة المفتاحية',
      desc: 'اكتب الموضوع الأساسي الذي تريد استكشاف الكلمات المرتبطة به.',
    },
    {
      num: 2,
      title: 'اختر الدولة واللغة',
      desc: 'حدّد السوق واللغة من الخيارات المتاحة في نموذج البحث.',
    },
    {
      num: 3,
      title: 'ولّد الكلمات',
      desc: 'استكشف اقتراحات Google والكلمات الإضافية التي تنشئها الأداة.',
    },
    {
      num: 4,
      title: 'راجع النتائج وصدّرها',
      desc: 'استخدم الفلاتر، وراجع المجموعات وخطة المحتوى، ثم صدّر النتائج.',
    },
  ];

  const faqs = [
    {
      q: 'من أين تأتي اقتراحات الكلمات؟',
      a: 'تأتي الاقتراحات التي تحمل مصدر Google Autocomplete من خدمة اقتراحات Google. وقد تعرض الأداة أيضاً كلمات مولّدة آلياً، ويجب التمييز بين المصدرين.',
    },
    {
      q: 'هل تعرض الأداة حجم البحث الشهري؟',
      a: 'لا. اقتراحات Google وحدها لا تكشف عدد عمليات البحث الشهرية. لذلك لا ينبغي اعتبار ترتيب الاقتراح أو درجة الصلة تقديراً لحجم البحث.',
    },
    {
      q: 'هل يمكن معرفة مستوى المنافسة؟',
      a: 'لا تتوفر حالياً بيانات موثوقة كافية لحساب صعوبة المنافسة الفعلية من اقتراحات Google وحدها. للحصول على تقدير متخصص، استخدم أداة SEO توفر بيانات المنافسة وتوضح منهجيتها.',
    },
    {
      q: 'هل تصنيف نية البحث دقيق دائماً؟',
      a: 'نية البحث تصنيف آلي مبدئي، وقد يخطئ في بعض الكلمات. راجع نتائج البحث الفعلية وسياق الكلمة قبل اتخاذ قرارات المحتوى.',
    },
    {
      q: 'ما الفرق بين اقتراح Google والكلمة المولّدة؟',
      a: 'اقتراح Google هو نص أعادته خدمة الاقتراحات، أما الكلمة المولّدة فتقترحها الأداة آلياً. الكلمة المولّدة ليست دليلاً على وجود طلب بحث فعلي.',
    },
    {
      q: 'هل الأداة مجانية؟',
      a: 'يمكنك تجربة الأداة وتصدير النتائج من واجهتها الحالية. وقد تعتمد بعض الوظائف على توفر خدمة جلب الاقتراحات الخارجية.',
    },
    {
      q: 'ما المقصود بمجموعات الكلمات؟',
      a: 'هي مجموعات آلية لكلمات متقاربة موضوعياً، ويمكن الاستفادة منها مبدئياً في تخطيط صفحات الموقع والمقالات. راجع كل مجموعة قبل اعتماد بنية المحتوى.',
    },
    {
      q: 'هل يمكن تصدير النتائج؟',
      a: 'تدعم الواجهة تصدير النتائج بصيغ CSV وJSON وMarkdown. ويتحدد محتوى الملف وفق البيانات التي توفرها الأداة والخيارات المفعّلة.',
    },
  ];

  const relatedTools = [
    {
      icon: FileText,
      title: 'ضاغط الصور',
      href: '/tools/image-compressor',
      desc: 'تقليل حجم الصور',
    },
    {
      icon: Sparkles,
      title: 'إزالة الخلفية',
      href: '/tools/background-remover',
      desc: 'إزالة خلفية الصور',
    },
    {
      icon: BarChart3,
      title: 'تحويل الفيديو إلى GIF',
      href: '/tools/video-to-gif',
      desc: 'إنشاء صور GIF',
    },
    {
      icon: Globe,
      title: 'محوّل الصور',
      href: '/tools/image-converter',
      desc: 'تحويل صيغ الصور',
    },
  ];

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, #1f2937 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/seo"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات SEO
          </Link>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <BarChart3 className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>

            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                مولّد الكلمات المفتاحية الذكي
              </h1>

              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                اكتشف اقتراحات الكلمات المفتاحية، ونظّمها حسب نية البحث
                والموضوع، مع توضيح حدود البيانات المتاحة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="-mt-4 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-ink-200 bg-white p-3 text-center shadow-sm md:p-4"
              >
                <div className="mb-2 text-2xl md:text-3xl">
                  {feature.icon}
                </div>
                <h3 className="mb-0.5 text-xs font-bold text-ink-900 md:text-sm">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-ink-600 md:text-xs">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto max-w-7xl px-4">
          {!hasResults && (
            <div className="mx-auto max-w-2xl">
              <SearchInput
                onSearch={handleSearch}
                disabled={isProcessing}
                initialInput={input}
              />

              {isProcessing && (
                <div
                  className="mt-4 rounded-2xl border-2 border-brand-200 bg-white p-6"
                  role="status"
                  aria-live="polite"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                    <p className="text-sm font-bold text-ink-900">
                      {message}
                    </p>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-center text-xs font-bold text-ink-600">
                    {Math.round(progress)}%
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="mt-4 flex items-start gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-700">
                      {error}
                    </p>
                    {hasResults && (
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="mt-2 text-xs font-semibold text-red-700 underline"
                      >
                        إخفاء الرسالة
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {hasResults && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                <p className="font-bold">ملاحظة حول دقة البيانات</p>
                <p>
                  اقتراحات Google تساعد في اكتشاف عبارات مرتبطة بموضوعك،
                  لكنها لا توفر وحدها حجم البحث الشهري أو مستوى المنافسة.
                  تعامل مع نية البحث وتصنيف الفرص على أنهما تحليل آلي
                  مبدئي، وليس ضماناً لوجود طلب أو سهولة الترتيب.
                </p>
              </div>

              {error && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              <FiltersBar
                filters={filters}
                onChange={setFilters}
                totalResults={keywords.length}
                filteredResults={filteredKeywords.length}
              />

              <ResultsGrid
                keywords={filteredKeywords}
                clusters={clusters}
                contentPlan={contentPlan}
                filters={filters}
                onExport={handleExport}
                onNewSearch={handleNewSearch}
              />
            </div>
          )}
        </div>
      </section>

      {/* SEO CONTENT */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <article className="mb-12">
            <h2 className="mb-4 text-right text-2xl font-black text-ink-900 md:text-3xl">
              ما هو مولّد الكلمات المفتاحية؟
            </h2>

            <p className="mb-4 text-right text-base leading-relaxed text-ink-600">
              مولّد الكلمات المفتاحية من Intooly أداة تساعدك على استكشاف
              عبارات مرتبطة بموضوع معين، والاستفادة منها في البحث عن أفكار
              للمقالات وصفحات المواقع وتحسين محركات البحث.
            </p>

            <p className="mb-4 text-right text-base leading-relaxed text-ink-600">
              تجمع الأداة اقتراحات الكلمات، وتتيح تصنيفها آلياً حسب نية
              البحث والموضوع، وإنشاء مجموعات مقترحة وخطة محتوى أولية.
              وتختلف هذه النتائج عن بيانات حجم البحث أو صعوبة المنافسة
              التي تتطلب مصادر متخصصة.
            </p>

            <ul className="mb-4 space-y-2 pr-6 text-right text-base leading-relaxed text-ink-600">
              <li className="list-disc">
                استكشاف اقتراحات الكلمات المفتاحية.
              </li>
              <li className="list-disc">
                تصنيف آلي مبدئي لنية البحث.
              </li>
              <li className="list-disc">
                تجميع الكلمات المتقاربة موضوعياً.
              </li>
              <li className="list-disc">
                إنشاء خطة محتوى أولية وتصدير النتائج.
              </li>
            </ul>

            <p className="text-right text-base leading-relaxed text-ink-600">
              يتم التحليل والتصدير داخل المتصفح، بينما يتطلب جلب اقتراحات
              Google اتصالاً بالخدمة الخارجية المستخدمة في الأداة.
              لا تُعد الاقتراحات وحدها دليلاً على حجم البحث أو المنافسة
              أو ضماناً للظهور في نتائج البحث.
            </p>
          </article>

          <article className="mb-12">
            <h2 className="mb-6 text-right text-2xl font-black text-ink-900 md:text-3xl">
              ميزات مولّد الكلمات المفتاحية
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {seoFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border-2 border-ink-200 bg-white p-4 text-right"
                >
                  <div className="mb-2 text-3xl">{feature.icon}</div>
                  <h3 className="mb-1 text-sm font-bold text-ink-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="mb-6 text-right text-2xl font-black text-ink-900 md:text-3xl">
              كيفية استخدام الأداة في 4 خطوات
            </h2>

            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 font-extrabold text-white shadow-lg">
                    {step.num}
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="mb-1 text-base font-extrabold text-ink-900">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-600">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-12">
            <h2 className="mb-6 text-right text-2xl font-black text-ink-900 md:text-3xl">
              الأسئلة الشائعة
            </h2>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group overflow-hidden rounded-xl border-2 border-ink-200 bg-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-right font-bold text-ink-900 transition hover:bg-brand-50">
                    <span>{faq.q}</span>
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-brand-600 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="border-t border-ink-100 px-4 pb-4 pt-3 text-right text-sm leading-relaxed text-ink-600">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          <article className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-black text-ink-900 md:text-3xl">
              ابدأ البحث عن كلمات مفتاحية جديدة
            </h2>

            <p className="mb-6 text-base leading-relaxed text-ink-600">
              استكشف الاقتراحات، ونظّم أفكارك، وحوّل الكلمات المناسبة
              إلى خطة محتوى قابلة للمراجعة والتطوير.
            </p>

            <button
              type="button"
              onClick={() => {
                handleNewSearch();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-brand-500/30 transition-all hover:from-brand-600 hover:to-brand-700"
            >
              <Sparkles className="h-5 w-5" />
              ابدأ الآن
            </button>
          </article>

          <article>
            <h2 className="mb-6 text-right text-2xl font-black text-ink-900 md:text-3xl">
              أدوات ذات صلة
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block cursor-pointer rounded-xl border-2 border-ink-200 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
                >
                  <tool.icon className="mx-auto mb-2 h-8 w-8 text-brand-500" />
                  <h3 className="text-sm font-extrabold text-ink-900">
                    {tool.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-600">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
