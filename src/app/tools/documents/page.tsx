import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات المستندات المجانية – تحويل الصور إلى Word | Intooly',
  description:
    'اكتشف أدوات المستندات المجانية لتحويل الصور إلى Word باستخدام OCR. استخرج النص من صور JPG وPNG وأنشئ مستندات قابلة للتحرير.',
  keywords: [
    'أدوات المستندات',
    'تحويل JPG إلى Word',
    'JPG to Word',
    'OCR عربي',
    'استخراج النص من الصور',
    'تحويل صور إلى مستندات',
    'Document Tools',
  ],
  alternates: {
    canonical: 'https://intooly.com/tools/documents',
  },
  openGraph: {
    title: 'أدوات المستندات المجانية | Intooly',
    description:
      'حوّل الصور إلى Word باستخدام OCR، واستخرج النص من الصور.',
    url: 'https://intooly.com/tools/documents',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  {
    icon: FileText,
    title: 'تحويل JPG إلى Word',
    description: 'استخرج النص من صور JPG وPNG باستخدام OCR، ثم أنشئ ملف Word.',
    href: '/tools/jpg-to-word',
  },
];

const faqs = [
  {
    q: 'ما أدوات المستندات في Intooly؟',
    a: 'هي أدوات لتحويل الصور والمستندات بين الصيغ المختلفة. الأداة الحالية هي "تحويل JPG إلى Word" التي تستخدم OCR لاستخراج النص من الصور وإنشاء مستند Word.',
  },
  {
    q: 'هل أدوات المستندات مجانية؟',
    a: 'نعم، الأداة المتاحة مجانية بالكامل ولا تتطلب تسجيلًا أو مفتاح API.',
  },
  {
    q: 'ما الفرق بين تحويل JPG إلى Word بوضع OCR ووضع الصورة؟',
    a: 'وضع OCR يستخرج النص من الصورة ويحوّله إلى نص قابل للتحرير في Word. وضع الصورة يدرج الصورة نفسها في Word دون استخراج النص.',
  },
  {
    q: 'هل OCR يدعم اللغة العربية؟',
    a: 'نعم، الأداة تدعم العربية والإنجليزية، ويمكن دمج اللغتين إذا كانت الصورة تحتوي على نصوص مختلطة.',
  },
  {
    q: 'هل تحافظ أدوات المستندات على تنسيق الملف الأصلي؟',
    a: 'عند استخدام OCR، قد يتغيّر التنسيق قليلًا (مثل ترتيب الفقرات والأعمدة). يُنصح بمراجعة النتيجة قبل الاستخدام النهائي.',
  },
  {
    q: 'هل تعمل أدوات المستندات على الجوال؟',
    a: 'نعم، الأداة متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.',
  },
];

export default function DocumentToolsPage() {
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
          <div className="grid grid-cols-1 gap-8 items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                <BookOpen className="h-4 w-4" />
                Intooly Document Suite
              </span>
              <h1 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-black tracking-tight text-ink-900">
                أدوات المستندات لتحويل الصور والنصوص إلى مستندات
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
                حوّل صور JPG وPNG إلى مستندات Word باستخدام OCR، واستخرج النص من الصور بسهولة.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-ink-600">
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                  ✓ OCR عربي وإنجليزي
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                  ✓ معالجة داخل المتصفح
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                  ✓ مجاني بالكامل
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* الأدوات */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-black text-ink-900 md:text-2xl">
            أدوات المستندات المتاحة
          </h2>
          <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">
            اختر الأداة المناسبة لمهمتك. كل أداة لها صفحة مستقلة تشرح طريقة استخدامها والقيود المهمة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link
                key={tool.title}
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
            <h2 className="mb-6 text-xl font-black text-ink-900 md:text-2xl">
              تحويل الصور والمستندات بسهولة أونلاين
            </h2>
            <p className="mb-4 leading-8 text-ink-700">
              تُستخدم أدوات المستندات في مهام متعددة، منها تحويل صور JPG وPNG إلى مستندات Word قابلة للتحرير باستخدام OCR، واستخراج النص من الصور.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تساعد هذه الأدوات الطلاب وأصحاب الأعمال والمستخدمين على تحويل المستندات بسرعة، وتوفير الوقت، وتحسين إنتاجية العمل مع الصور والمستندات.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تتم معالجة الملفات داخل المتصفح كلما أمكن، مما يحافظ على خصوصيتك. راجع صفحة كل أداة لمعرفة التفاصيل الدقيقة حول المعالجة والحدود.
            </p>
          </div>
        </article>
      </section>

      {/* الأسئلة الشائعة */}
      <section className="border-t border-ink-100 bg-ink-50">
        <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
          <h2 className="mb-6 text-xl font-black text-ink-900 md:text-2xl">
            الأسئلة الشائعة حول أدوات المستندات
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-ink-200 bg-white p-4"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-bold text-ink-900 marker:hidden">
                  <span>{faq.q}</span>
                  <span className="text-xl text-brand-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-ink-100 pt-3 leading-7 text-ink-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}