import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات الذكاء الاصطناعي أونلاين – توليد الصور والمحتوى | Intooly',
  description:
    'تعرّف على أدوات الذكاء الاصطناعي المتاحة على Intooly، ووظائفها وطريقة استخدامها ومتطلباتها لإنجاز مهام رقمية وإنشاء المحتوى.',
  alternates: {
    canonical: 'https://intooly.com/tools/ai',
  },
  openGraph: {
    title: 'أدوات الذكاء الاصطناعي أونلاين | Intooly',
    description:
      'أدوات ذكاء اصطناعي لإنجاز مهام رقمية وإنشاء المحتوى.',
    url: 'https://intooly.com/tools/ai',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  {
    icon: Sparkles,
    title: 'مولّد الصور بالذكاء الاصطناعي',
    description: 'أنشئ صورًا بالذكاء الاصطناعي حسب الوصف الذي تحدّده.',
    href: '/tools/ai-image-generator',
  },
];

const faqs = [
  {
    q: 'ما هي أدوات الذكاء الاصطناعي المتاحة؟',
    a: 'حاليًا تتوفر أداة مولّد الصور بالذكاء الاصطناعي. نعمل على إضافة أدوات أخرى في الفترة القادمة.',
  },
  {
    q: 'هل أدوات الذكاء الاصطناعي مجانية؟',
    a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.',
  },
  {
    q: 'هل تحتاج أدوات الذكاء الاصطناعي إلى اتصال بالإنترنت؟',
    a: 'نعم، أدوات الذكاء الاصطناعي تحتاج إلى اتصال بالإنترنت لأنها تعتمد على خدمات خارجية لتوليد المحتوى أو معالجته.',
  },
  {
    q: 'كيف أحصل على أفضل نتائج من مولّد الصور؟',
    a: 'اكتب وصفًا واضحًا ومحددًا للصورة التي تريدها، وحدّد النمط والأبعاد إن أمكن. جرّب أكثر من وصف للحصول على نتائج مختلفة.',
  },
];

export default function AiToolsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                <BookOpen className="h-4 w-4" />
                Intooly AI Suite
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black tracking-tight text-ink-900">
                أدوات الذكاء الاصطناعي أونلاين
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
                اكتشف أدوات الذكاء الاصطناعي المتاحة لإنجاز مهام رقمية وإنشاء
                المحتوى.
              </p>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="/images/categories/ai-tools.png"
                alt="أدوات الذكاء الاصطناعي وإنشاء محتوى بصري رقمي."
                className="w-full h-auto rounded-2xl shadow-[0_15px_40px_-10px_rgba(245,158,11,0.35)]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* الأدوات */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-ink-900 md:text-3xl">
            جميع أدوات الذكاء الاصطناعي المتاحة
          </h2>
          <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">
            اختر الأداة المناسبة لمهمتك. كل أداة لها صفحة مستقلة تشرح طريقة
            استخدامها والقيود المهمة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 transition-transform group-hover:scale-110">
                  <IconComp className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                    {tool.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-ink-600">
                    {tool.description}
                  </p>
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

      {/* محتوى SEO */}
      <section className="border-t border-ink-100 bg-white">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <div className="text-right">
            <h2 className="mb-6 text-2xl font-black text-ink-900 md:text-3xl">
              أدوات الذكاء الاصطناعي لإنشاء المحتوى الرقمي
            </h2>
            <p className="mb-4 leading-8 text-ink-700">
              تتوفر على Intooly أدوات ذكاء اصطناعي تساعدك على إنشاء المحتوى
              الرقمي بسرعة وسهولة. حاليًا تتضمن الأداة مولّد الصور بالذكاء
              الاصطناعي، والتي تتيح لك إنشاء صور بناءً على وصف نصي تحدّده. هذه
              الأداة مفيدة للمصممين وصنّاع المحتوى والمسوقين الذين يحتاجون إلى
              صور مخصصة لمشاريعهم.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              لاستخدام أدوات الذكاء الاصطناعي، تحتاج إلى اتصال بالإنترنت. تعتمد
              هذه الأدوات على خدمات خارجية لتوليد المحتوى، وقد تختلف سرعة
              الاستجابة ودقة النتائج بحسب الخدمة المستخدمة والوصف الذي تدخله.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              نعمل على إضافة المزيد من أدوات الذكاء الاصطناعي في الفترة القادمة.
              تابع صفحات الموقع للحصول على آخر التحديثات، أو راسلنا عبر البريد
              الإلكتروني لاقتراح أداة تريد رؤيتها على المنصة.
            </p>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="space-y-3 leading-8 text-ink-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">المصممون:</strong>{' '}
                  إنشاء صور مبدئية أو خلفيات لمشاريع التصميم.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">صنّاع المحتوى:</strong>{' '}
                  إنتاج صور مخصصة للمقالات ومنشورات التواصل الاجتماعي.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">المسوقون:</strong>{' '}
                  تجهيز صور إعلانية مخصصة للحملات التسويقية.
                </span>
              </li>
            </ul>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              الأسئلة الشائعة
            </h3>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h4 className="mb-2 text-base font-bold text-ink-900 md:text-lg">
                    {faq.q}
                  </h4>
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