'use client';

/**
 * صفحة أداة Meta Tags Toolkit — Intooly
 * صفحة واحدة + تبويبات + شريط جانبي.
 * يدعم الحفظ التلقائي في localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Shield, Lightbulb, BookOpen } from 'lucide-react';

import type { MetaTagsState, TabId, AutoSaveSnapshot } from '@/lib/seo-meta-tags/types';
import {
  DEFAULT_META_STATE,
} from '@/lib/seo-meta-tags/types';
import {
  DISCLAIMER_MESSAGES,
} from '@/lib/seo-meta-tags/constants';

import TabsNav from './components/TabsNav';
import Sidebar from './components/Sidebar';
import MetaTagsTab from './components/tabs/MetaTagsTab';
import LengthCheckerTab from './components/tabs/LengthCheckerTab';
import GooglePreviewTab from './components/tabs/GooglePreviewTab';
import SocialPreviewTab from './components/tabs/SocialPreviewTab';
import HtmlCodeTab from './components/tabs/HtmlCodeTab';
import ExportTab from './components/tabs/ExportTab';

const STORAGE_KEY = 'intooly-seo-meta-tags-v1';

export default function SeoMetaTagsPage() {
  const [state, setState] = useState<MetaTagsState>(DEFAULT_META_STATE);
  const [activeTab, setActiveTab] = useState<TabId>('meta');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // استرجاع من localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AutoSaveSnapshot;
        if (parsed && parsed.state) {
          setState(parsed.state);
          setSavedAt(parsed.savedAt);
        }
      }
    } catch {
      // تجاهل الأخطاء — ابدأ بحالة فارغة
    }
    setIsHydrated(true);
  }, []);

  // حفظ تلقائي
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const snapshot: AutoSaveSnapshot = {
        state,
        savedAt: new Date().toISOString(),
        version: 1,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      setSavedAt(snapshot.savedAt);
    } catch {
      // تجاهل
    }
  }, [state, isHydrated]);

  const handleChange = useCallback(
    (updater: (prev: MetaTagsState) => MetaTagsState) => {
      setState(updater);
    },
    []
  );

  const handleReset = useCallback(() => {
    if (window.confirm('هل تريد مسح كل الحقول والبدء من جديد؟')) {
      setState(DEFAULT_META_STATE);
      setSavedAt(null);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // تجاهل
      }
    }
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'meta':
        return <MetaTagsTab state={state} onChange={handleChange} />;
      case 'length':
        return <LengthCheckerTab state={state} />;
      case 'google':
        return <GooglePreviewTab state={state} />;
      case 'social':
        return <SocialPreviewTab state={state} onChange={handleChange} />;
      case 'html':
        return <HtmlCodeTab state={state} />;
      case 'export':
        return <ExportTab state={state} />;
      default:
        return null;
    }
  };

  const savedAtDisplay = savedAt
    ? new Date(savedAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

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
        <div className="container relative mx-auto px-4 py-8 md:py-10">
          <Link
            href="/tools/seo"
            className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات SEO
          </Link>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <BookOpen className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl">
                أداة Meta Tags الشاملة
              </h1>
              <p className="mt-1 text-sm leading-6 text-brand-700">
                أنشئ وسوم SEO الأساسية (Title, Description, Robots, Open Graph, Twitter Card) واختبر طولها، مع معاينة فورية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="py-6">
        <div className="container mx-auto max-w-7xl px-4">
          {/* شريط أدوات علوي */}
          <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-ink-500">
              {savedAtDisplay
                ? `آخر حفظ تلقائي: ${savedAtDisplay}`
                : 'الحفظ التلقائي مفعّل — سيُحفظ عملك في متصفحك'}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-200"
            >
              <RotateCcw className="h-3 w-3" />
              مسح الكل
            </button>
          </div>

          {/* الحاوية الرئيسية */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            {/* العمود الأيمن: التبويبات + المحتوى */}
            <div className="rounded-2xl border-2 border-ink-200 bg-white overflow-hidden">
              <TabsNav activeTab={activeTab} onChange={setActiveTab} />
              <div className="p-4 md:p-5">{renderActiveTab()}</div>
            </div>

            {/* العمود الأيسر: الشريط الجانبي */}
            {/* على الكمبيوتر: يظهر دائمًا. على الجوال: details قابل للفتح (مغلق افتراضيًا). */}
            <div className="hidden lg:block">
              <Sidebar state={state} />
            </div>
            <details className="lg:hidden rounded-2xl border-2 border-brand-200 bg-brand-50 overflow-hidden">
              <summary className="cursor-pointer px-4 py-3 text-sm font-extrabold text-brand-800 flex items-center justify-between gap-2">
                <span>📊 معاينة Google ومؤشرات الطول</span>
                <span className="text-brand-600 text-xs">(اضغط للعرض)</span>
              </summary>
              <div className="border-t border-brand-200 p-3 bg-white">
                <Sidebar state={state} />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* SEO CONTENT */}
      <section className="bg-white py-10 md:py-14 mt-6">
        <div className="container mx-auto max-w-4xl px-4 space-y-10">
          <article>
            <h2 className="mb-3 text-2xl font-black text-ink-900">
              ما هي وسوم Meta Tags؟
            </h2>
            <p className="text-base leading-relaxed text-ink-600">
              وسوم Meta Tags هي أكواد HTML توضع في رأس الصفحة (داخل
              <code className="mx-1 rounded bg-ink-100 px-1 py-0.5 text-sm" dir="ltr">
                &lt;head&gt;
              </code>
              ) لتخبر محركات البحث ومنصات التواصل الاجتماعي بمحتوى الصفحة. أشهرها
              <strong> title </strong>
              (عنوان الصفحة)،
              <strong> meta description </strong>
              (الوصف)،
              <strong> meta robots </strong>
              (تعليمات الفهرسة)،
              <strong> Open Graph </strong>
              (للمشاركة على Facebook وLinkedIn)، و
              <strong> Twitter Card </strong>
              (للمشاركة على X).
            </p>
          </article>

          <article>
            <h2 className="mb-3 text-2xl font-black text-ink-900">
              لماذا تُعد وسوم Meta ضرورية؟
            </h2>
            <ul className="space-y-2 pr-5 text-base leading-relaxed text-ink-600 list-disc">
              <li>تساعد في توجيه طريقة عرض عنوان الصفحة ووصفها في نتائج البحث.</li>
              <li>تُحسّن نسبة النقر (CTR) عند كتابتها بعناية.</li>
              <li>تُحدد كيف يظهر الرابط عند مشاركته على السوشيال ميديا.</li>
              <li>تُخبر محركات البحث بالصفحات التي يجب فهرستها.</li>
            </ul>
          </article>

          <article>
            <h2 className="mb-3 text-2xl font-black text-ink-900">
              كيف تستخدم الأداة؟
            </h2>
            <ol className="space-y-2 pr-5 text-base leading-relaxed text-ink-600 list-decimal">
              <li>املأ حقول العنوان والوصف والرابط في تبويب <strong>Meta Tags</strong>.</li>
              <li>راجع الطول والجودة في تبويب <strong>فحص الطول</strong>.</li>
              <li>شاهد كيف قد تظهر في Google في تبويب <strong>معاينة Google</strong>.</li>
              <li>أضف صورة المشاركة في تبويب <strong>المشاركة الاجتماعية</strong>.</li>
              <li>انسخ الكود الكامل من تبويب <strong>HTML</strong>.</li>
              <li>صدّر بصيغة JSON أو HTML أو TXT من تبويب <strong>التصدير</strong>.</li>
            </ol>
            <div className="mt-4 rounded-xl border-2 border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
              <p className="font-bold mb-1">📋 خطوة أخيرة مهمة:</p>
              <p>
                تعديل الوسوم داخل هذه الأداة <strong>لا يُغيّر موقعك تلقائيًا</strong>.
                يجب نسخ الكود الناتج من تبويب HTML، ولصقه يدويًا في وسم
                <code className="mx-1 rounded bg-white px-1 py-0.5 text-sm" dir="ltr">&lt;head&gt;</code>
                للصفحة المستهدفة على موقعك.
              </p>
            </div>
          </article>

          <article>
            <h2 className="mb-3 text-2xl font-black text-ink-900">
              لماذا قد لا تظهر الوسوم كما تكتبها؟
            </h2>
            <p className="text-base leading-relaxed text-ink-600 mb-2">
              Google <strong>لا يلتزم دائمًا</strong> بالعنوان أو الوصف الذي تكتبه. قد يختار نصًا آخر من محتوى الصفحة إذا رآه أكثر صلة باستعلام البحث. لذلك:
            </p>
            <ul className="space-y-1.5 pr-5 text-sm leading-relaxed text-ink-600 list-disc">
              <li>اكتب وسومًا واضحة وصادقة تُطابق محتوى الصفحة.</li>
              <li>لا تعتمد على وسوم Meta كضمان وحيد للظهور.</li>
              <li>راجع النتائج الفعلية في Google Search Console بانتظام.</li>
            </ul>
          </article>

          <article>
  <h2 className="mb-4 text-2xl font-black text-ink-900">الأسئلة الشائعة</h2>
  <div className="space-y-2">
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>هل تضمن هذه الأداة ظهور عنواني كما كتبته في Google؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        لا. Google قد يستبدل العنوان أو الوصف بنص آخر من محتوى الصفحة إذا رآه أكثر صلة باستعلام البحث. الأداة تساعد في كتابة وسوم واضحة، لكنها لا تضمن شكل الظهور النهائي.
      </div>
    </details>
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>كيف أُطبّق الوسوم التي أنشأتها على موقعي؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        انسخ الكود من تبويب HTML، ثم الصقه يدويًا داخل وسم head في الصفحة المستهدفة على موقعك. هذه الأداة لا تعدّل موقعك تلقائيًا.
      </div>
    </details>
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>هل تحفظ الأداة بياناتي على خادمكم؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        لا. كل ما تكتبه يُحفظ في متصفحك فقط (localStorage)، ولا يُرسل إلى خوادمنا. يمكنك مسح البيانات بضغطة زر مسح الكل.
      </div>
    </details>
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>لماذا لا يوجد خيار index و follow في كود Robots الناتج؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        لأن index و follow هما السلوك الافتراضي لمحركات البحث. إضافتهما في وسم Robots غير ضرورية، ولذلك لا نضيفهما إلا إذا اخترت noindex أو nofollow.
      </div>
    </details>
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>هل الأداة بديل عن أدوات SEO مثل Ahrefs أو Semrush؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        لا. الأداة تُنشئ وسوم Meta Tags وتساعد في كتابتها بشكل صحيح. لكنها لا توفر بيانات حجم البحث أو تحليل المنافسين أو تتبع الترتيب — هذه تحتاج أدوات متخصصة.
      </div>
    </details>
    <details className="group rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
      <summary className="cursor-pointer p-3 text-sm font-bold text-ink-900 hover:bg-brand-50 flex items-center justify-between gap-2">
        <span>ما الفرق بين Open Graph وTwitter Card؟</span>
        <span className="text-brand-600 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-ink-100 p-3 text-sm leading-relaxed text-ink-600">
        Open Graph تُستخدم من Facebook وLinkedIn وغيرها لعرض معاينة الرابط. Twitter Card خاصة بمنصة X (Twitter). الأداة تولّد الوسمين معًا لتغطية جميع المنصات.
      </div>
    </details>
  </div>
</article>

          <article>
            <h2 className="mb-3 text-2xl font-black text-ink-900">حدود الأداة (شفافية)</h2>
            <div className="space-y-2 text-sm leading-relaxed text-ink-600">
              <p className="flex items-start gap-1.5">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-600" />
                <span>{DISCLAIMER_MESSAGES.lengthGuide}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-600" />
                <span>{DISCLAIMER_MESSAGES.previewGuide}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-600" />
                <span>{DISCLAIMER_MESSAGES.noDataCollected}</span>
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
