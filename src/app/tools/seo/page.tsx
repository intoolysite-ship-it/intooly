import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3,
  FileText,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات SEO مجانية – الكلمات المفتاحية وتحسين محركات البحث | Intooly',
  description:
    'اكتشف أدوات SEO للبحث عن الكلمات المفتاحية وتوليد أفكار المحتوى ودعم تحسين صفحات موقعك لمحركات البحث.',
  alternates: {
    canonical: 'https://intooly.com/tools/seo',
  },
  openGraph: {
    title: 'أدوات SEO مجانية | Intooly',
    description: 'أدوات لاستكشاف الكلمات المفتاحية وتحليل النصوص قبل نشر المحتوى.',
    url: 'https://intooly.com/tools/seo',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  { icon: BarChart3, title: 'مولّد الكلمات المفتاحية', description: 'اكتشف أفكارًا وعبارات مرتبطة بكلمتك الأساسية.', href: '/tools/keyword-generator' },
  { icon: FileText, title: 'عدّاد الكلمات', description: 'احسب الكلمات والأحرف في النصوص.', href: '/tools/word-counter' },
];

const faqs = [
  { q: 'ما هي أدوات SEO؟', a: 'أدوات مساعدة تستخدمها أثناء تخطيط المحتوى وتحسينه، مثل البحث عن أفكار الكلمات المفتاحية وعدّ الكلمات. لا تضمن وحدها تحسّن ترتيب الموقع.' },
  { q: 'هل أدوات SEO مجانية؟', a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.' },
  { q: 'كيف أستخدم الكلمات المفتاحية في المحتوى؟', a: 'ابدأ بتحديد الكلمة الأساسية، ثم استخدمها بشكل طبيعي في العنوان والمقدمة والفقرات. تجنّب الحشو المبالغ فيه.' },
  { q: 'هل أدوات SEO كافية لتحسين الترتيب؟', a: 'لا. تحسين الترتيب يعتمد أيضًا على جودة المحتوى وفائدته للمستخدم وتجربة الصفحة وسرعة التحميل وعوامل أخرى.' },
];

export default function SeoToolsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <BookOpen className="h-4 w-4" />
            Intooly SEO Suite
          </span>
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black tracking-tight text-ink-900">
            أدوات SEO والكلمات المفتاحية وتحليل النصوص
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
            أدوات تساعدك على استكشاف الكلمات المفتاحية ومراجعة النصوص قبل نشر المحتوى.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-ink-900 md:text-3xl">جميع أدوات SEO المتاحة</h2>
          <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">اختر الأداة المناسبة لمهمتك.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 transition-transform group-hover:scale-110">
                  <IconComp className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-600">{tool.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-600">{tool.description}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    استخدام الأداة
                    <ArrowLeft className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <div className="text-right">
            <h2 className="mb-6 text-2xl font-black text-ink-900 md:text-3xl">البحث عن الكلمات المفتاحية ومراجعة المحتوى</h2>
            <p className="mb-4 leading-8 text-ink-700">
              يساعد البحث عن الكلمات المفتاحية في اكتشاف عبارات قد يستخدمها الجمهور عند البحث عن موضوع معين. يمكنك استخدام مولّد الكلمات المفتاحية لاستكشاف أفكار مرتبطة بكلمة أساسية، ثم تقييم مدى ملاءمتها لمحتوى موقعك.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              أما عدّاد الكلمات فيساعدك على معرفة طول النص ومراجعته قبل النشر. يمكن استخدامه أيضًا لمراجعة منشورات التواصل الاجتماعي، والتحقق من طول الوصف والعناوين.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تذكر أن الأدوات المساعدة لا تضمن وحدها تحسّن ترتيب الموقع؛ إذ يعتمد الأداء في نتائج البحث أيضًا على جودة المحتوى ومدى فائدته للمستخدم وتجربة الصفحة وسرعة التحميل وعوامل أخرى.
            </p>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">الأسئلة الشائعة</h3>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h4 className="mb-2 text-base font-bold text-ink-900 md:text-lg">{faq.q}</h4>
                  <p className="leading-8 text-ink-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}