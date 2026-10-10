'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Sparkles, Loader2, AlertCircle, 
  ChevronDown, BarChart3, Globe, Filter, FileText
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
import { KEYWORD_MESSAGES, OPPORTUNITY_TYPES, COMPETITION_TIERS } from '@/lib/keyword-generator/constants';
import { generateKeywords } from '@/lib/keyword-generator/keywordGenerator';
import { buildClusters } from '@/lib/keyword-generator/clusterBuilder';
import { generateContentPlan } from '@/lib/keyword-generator/contentSuggestor';
import { exportKeywords } from '@/lib/keyword-generator/exporter';

export default function KeywordGeneratorPage() {
  // ============================================
  // الحالة
  // ============================================
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

  // ============================================
  // تصفية النتائج
  // ============================================
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      if (filters.searchQuery && !kw.text.includes(filters.searchQuery)) return false;
      if (filters.intent && filters.intent.length > 0 && !filters.intent.includes(kw.intent)) return false;
      if (filters.competitionLevel && filters.competitionLevel.length > 0 && !filters.competitionLevel.includes(kw.competitionLevel)) return false;
      if (filters.opportunityType && filters.opportunityType.length > 0 && !filters.opportunityType.includes(kw.opportunityType)) return false;
      return true;
    });
  }, [keywords, filters]);

  // ============================================
  // الدالة الرئيسية — توليد الكلمات
  // ============================================
  const handleSearch = useCallback(async (searchInput: KeywordInput) => {
    setError(null);
    setKeywords([]);
    setClusters([]);
    setContentPlan(null);
    setFilters(DEFAULT_FILTERS);
    setInput(searchInput);
    setStatus('loading');
    setProgress(0);
    setMessage('جاري توليد الكلمات...');
    
    try {
      // 1. توليد الكلمات
      const generated = await generateKeywords(
        searchInput,
        (p, msg) => {
          setProgress(p);
          setMessage(msg);
        }
      );
      
      if (generated.length === 0) {
        setError(KEYWORD_MESSAGES.NO_RESULTS);
        setStatus('empty');
        return;
      }
      
      setKeywords(generated);
      
      // 2. بناء المجموعات
      setMessage('جاري تجميع المواضيع...');
      setProgress(85);
      
      const builtClusters = buildClusters(generated);
      setClusters(builtClusters);
      
      // 3. توليد خطة المحتوى
      setMessage('جاري توليد خطة المحتوى...');
      setProgress(95);
      
      // نختار أفضل كلمة للتخطيط
      const topKeyword = [...generated]
        .filter(k => k.competitionScore >= 0)
        .sort((a, b) => (b.relevanceScore - b.competitionScore) - (a.relevanceScore - a.competitionScore))[0] || generated[0];
      
      if (topKeyword) {
        const plan = generateContentPlan(topKeyword);
        setContentPlan(plan);
      }
      
      setProgress(100);
      setMessage(KEYWORD_MESSAGES.SUCCESS);
      setStatus('success');
      
    } catch (e) {
      console.error('خطأ في التوليد:', e);
      const errMsg = e instanceof Error ? e.message : KEYWORD_MESSAGES.ERROR_GENERIC;
      setError(errMsg);
      setStatus('error');
    }
  }, []);

  // ============================================
  // التصدير
  // ============================================
  const handleExport = useCallback((format: 'csv' | 'json' | 'markdown') => {
    if (keywords.length === 0) return;
    
    try {
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
      setError('فشل التصدير. حاول مرة أخرى.');
    }
  }, [keywords, filteredKeywords, clusters, contentPlan]);

  // ============================================
  // بحث جديد
  // ============================================
  const handleNewSearch = useCallback(() => {
    setStatus('idle');
    setKeywords([]);
    setClusters([]);
    setContentPlan(null);
    setFilters(DEFAULT_FILTERS);
    setError(null);
    setProgress(0);
    setMessage('');
    
    // التمرير للأعلى
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // ============================================
  // واجهة المستخدم
  // ============================================
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      
      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div 
          className="absolute inset-0 opacity-20 text-ink-900"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                مولّد الكلمات المفتاحية الذكي
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              محلي للتحليل • 22 دولة عربية • شفافية كاملة
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              اكتشف كلمات مفتاحية حقيقية وحلّل فرصها في السوق المستهدف
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🌍', title: '22 دولة عربية', desc: 'لكل سوق اقتراحاته' },
              { icon: '🟢', title: 'مؤشر منافسة', desc: 'مرئي وشفاف' },
              { icon: '🧠', title: 'نية البحث', desc: 'معلوماتي، تجاري، شرائي' },
              { icon: '📝', title: 'خطة محتوى', desc: 'جاهزة للتنفيذ' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-ink-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5 text-ink-900">{f.title}</h3>
                <p className="text-[10px] md:text-xs text-ink-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIN ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Search Input (عند عدم وجود نتائج) */}
          {!hasResults && (
            <div className="max-w-2xl mx-auto">
              <SearchInput
                onSearch={handleSearch}
                disabled={isProcessing}
                initialInput={input}
              />
              
              {/* Progress */}
              {isProcessing && (
                <div className="mt-4 bg-white border-2 border-brand-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                    <p className="font-bold text-ink-900 text-sm">{message}</p>
                  </div>
                  <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-ink-600 mt-2 text-center font-bold">{Math.round(progress)}%</p>
                </div>
              )}
              
              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* النتائج (عند وجود نتائج) */}
          {hasResults && (
            <div className="space-y-4">
              {/* Filters */}
              <FiltersBar
                filters={filters}
                onChange={setFilters}
                totalResults={keywords.length}
                filteredResults={filteredKeywords.length}
              />
              
              {/* Results */}
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

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* المقدمة */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هو مولّد الكلمات المفتاحية الذكي؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              <strong>مولّد الكلمات المفتاحية</strong> من Intooly هو أداة متقدمة لاكتشاف فرص SEO الحقيقية. لا يكتفي بتوليد قائمة كلمات، بل يحلّل كل كلمة ويصنّفها حسب:
            </p>
            <ul className="text-base leading-relaxed mb-4 text-ink-600 text-right space-y-2 pr-6">
              <li className="list-disc">نية البحث (معلوماتي، تجاري، شرائي)</li>
              <li className="list-disc">مستوى المنافسة (من 5 مستويات)</li>
              <li className="list-disc">تصنيف الفرصة (للمواقع الجديدة، تجارية، محتوى)</li>
              <li className="list-disc">الدولة المستهدفة (22 دولة عربية + عالمية)</li>
            </ul>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              تعمل الأداة <strong>محلياً في متصفحك</strong> للتحليل والتصدير، مع جلب الاقتراحات الفعلية من Google Autocomplete. نوضح بكل شفافية أي طلب خارجي، ونميّز بين البيانات الفعلية والاقتراحات المولّدة.
            </p>
          </article>

          {/* الميزات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الميزات الاحترافية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🌍', title: '22 دولة عربية', desc: 'السعودية، مصر، الإمارات، والمزيد — كل سوق له اقتراحاته' },
                { icon: '🟢', title: 'مؤشر منافسة مرئي', desc: 'نصف دائرة بألوان واضحة: أخضر، أصفر، برتقالي، أحمر' },
                { icon: '🧠', title: 'تحليل نية البحث', desc: 'معلوماتي، تجاري، شرائي، ملاحي — لتفهم جمهورك' },
                { icon: '📊', title: 'شفافية كاملة', desc: 'نميّز بين البيانات الفعلية والاقتراحات المولّدة' },
                { icon: '🎯', title: 'تصنيف الفرص', desc: 'مناسبة للمواقع الجديدة، تجارية، محتوى' },
                { icon: '📝', title: 'خطة محتوى', desc: 'عنوان، وصف، H1/H2، FAQ، روابط داخلية' },
                { icon: '📁', title: 'تجميع المواضيع', desc: 'Topic Clusters — خريطة محتوى شاملة' },
                { icon: '📥', title: 'تصدير احترافي', desc: 'CSV، JSON، Markdown — جاهز للتنفيذ' },
                { icon: '🔒', title: 'خصوصية محلية', desc: 'التحليل والتصدير في متصفحك بدون رفع' },
              ].map((f, i) => (
                <div key={i} className="bg-white border-2 border-ink-200 rounded-xl p-4 text-right">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* الخطوات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيف تستخدم مولّد الكلمات المفتاحية — 4 خطوات
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'أدخل الكلمة المفتاحية', desc: 'اكتب الكلمة الأساسية (مثال: تحويل الفيديو إلى GIF) واختر السوق المستهدف.' },
                { num: 2, title: 'اختر الدولة واللغة', desc: '22 دولة عربية + دول عالمية. اختر العربية أو الإنجليزية أو كلاهما.' },
                { num: 3, title: 'اضغط "توليد الكلمات"', desc: 'ستجلب الأداة الاقتراحات الفعلية من Google وتولّد اقتراحات إضافية.' },
                { num: 4, title: 'حلّل وصدّر', desc: 'افلتر حسب النية أو المنافسة، ثم صدّر النتائج بصيغة CSV، JSON، أو Markdown.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-extrabold flex items-center justify-center shadow-lg">
                    {step.num}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-extrabold text-base mb-1 text-ink-900">{step.title}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* FAQ */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'ما الفرق بين هذه الأداة والمنافسين؟', a: 'نحن نركّز على الأسواق العربية بدقة، ونوفّر مؤشر منافسة مرئي، ونميّز بوضوح بين البيانات الفعلية والاقتراحات المولّدة. لا نختلق أرقام بحث وهمية.' },
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% بدون حدود على عدد الكلمات، وبدون علامات مائية.' },
                { q: 'من أين تأتي الاقتراحات؟', a: 'الاقتراحات الفعلية من Google Autocomplete. التحليل والتصنيف يحدثان محلياً في متصفحك. نوضح دائماً مصدر كل كلمة.' },
                { q: 'ما الفرق بين "بيانات فعلية" و"مقترحة"؟', a: 'البيانات الفعلية = اقتراحات حقيقية من Google. المقترحة = اقتراحات مولّدة آلياً تحتاج تحققاً. نوضح دائماً.' },
                { q: 'كيف أحسب المنافسة؟', a: 'مؤشرنا تقديري بناءً على 4 عوامل: طول الكلمة، عدد الكلمات، نية البحث، وحضور الكلمة في Google. عند الضغط على المؤشر، نعرض التفاصيل.' },
                { q: 'هل يمكنني تصدير النتائج؟', a: 'نعم، CSV (Excel)، JSON (للمطورين)، وMarkdown (للنشر). كل تصدير يشمل التحليل وخطة المحتوى.' },
                { q: 'ما هي Topic Clusters؟', a: 'تجميع الكلمات في مجموعات موضوعية مع اقتراح هيكل الموقع — صفحة واحدة أم صفحات متعددة.' },
                { q: 'هل الأداة تدعم الجوال؟', a: 'نعم، واجهة متجاوبة 100% تعمل على الجوال والتابلت والكمبيوتر.' },
              ].map((faq, i) => (
                <details key={i} className="bg-white border-2 border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold flex justify-between items-center text-ink-900 hover:bg-brand-50 transition text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-brand-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 border-t border-ink-100 pt-3 leading-relaxed text-right">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          {/* CTA */}
          <article className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900">
              ابدأ توليد الكلمات المفتاحية الآن
            </h2>
            <p className="text-base leading-relaxed mb-6 text-ink-600">
              جرّب مولّد الكلمات المفتاحية الذكي، واكتشف فرص SEO الحقيقية لموقعك.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black rounded-xl text-base shadow-lg shadow-brand-500/30 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              ابدأ الآن
            </button>
          </article>

          {/* أدوات ذات صلة */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: FileText, title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل حجم الصور' },
                { icon: Sparkles, title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
                { icon: BarChart3, title: 'تحويل الفيديو إلى GIF', href: '/tools/video-to-gif', desc: 'FFmpeg.wasm' },
                { icon: Globe, title: 'محوّل الصور', href: '/tools/image-converter', desc: 'JPEG, PNG, WebP' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="bg-white border-2 border-ink-200 p-5 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block"
                >
                  <tool.icon className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-ink-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
