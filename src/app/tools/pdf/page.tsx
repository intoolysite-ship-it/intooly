import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Merge,
  Scissors,
  Trash2,
  RotateCw,
  Image as ImageIcon,
  FileImage,
  LayoutGrid,
  FileOutput,
  Minimize2,
  Stamp,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات PDF مجانية أونلاين – دمج وضغط وتحويل ملفات PDF | Intooly',
  description:
    'اكتشف أدوات PDF لمعالجة ملفاتك عبر الإنترنت، بما في ذلك دمج ملفات PDF وتقسيمها وضغطها وتدوير الصفحات وتحويل الصور إلى PDF، وفقًا للأدوات المتاحة.',
  alternates: {
    canonical: 'https://intooly.com/tools/pdf',
  },
  openGraph: {
    title: 'أدوات PDF مجانية أونلاين | Intooly',
    description:
      'دمج ملفات PDF وتقسيمها وضغطها وتدوير الصفحات وتحويل الصور إلى PDF.',
    url: 'https://intooly.com/tools/pdf',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  {
    icon: Merge,
    title: 'دمج PDF',
    description: 'اجمع عدة ملفات PDF في ملف واحد بسهولة.',
    href: '/tools/merge-pdf',
  },
  {
    icon: Scissors,
    title: 'تقسيم PDF',
    description: 'قسّم ملف PDF أو استخرج الصفحات التي تحتاج إليها.',
    href: '/tools/split-pdf',
  },
  {
    icon: Minimize2,
    title: 'ضغط PDF',
    description: 'قلّل حجم ملفات PDF لتسهيل تخزينها ومشاركتها.',
    href: '/tools/compress-pdf',
  },
  {
    icon: RotateCw,
    title: 'تدوير PDF',
    description: 'دوّر صفحات PDF بالاتجاه الصحيح.',
    href: '/tools/rotate-pdf',
  },
  {
    icon: ImageIcon,
    title: 'تحويل الصور إلى PDF',
    description: 'حوّل صور JPG إلى ملف PDF واحد.',
    href: '/tools/jpg-to-pdf',
  },
  {
    icon: FileImage,
    title: 'تحويل PDF إلى JPG',
    description: 'حوّل صفحات PDF إلى صور JPG.',
    href: '/tools/pdf-to-jpg',
  },
  {
    icon: Trash2,
    title: 'حذف صفحات PDF',
    description: 'احذف الصفحات غير المطلوبة من ملف PDF.',
    href: '/tools/delete-pdf-pages',
  },
  {
    icon: FileOutput,
    title: 'استخراج صفحات PDF',
    description: 'استخرج صفحات محددة في ملف منفصل.',
    href: '/tools/extract-pdf-pages',
  },
  {
    icon: LayoutGrid,
    title: 'تنظيم PDF',
    description: 'أعد ترتيب صفحات PDF لتناسب احتياجك.',
    href: '/tools/organize-pdf',
  },
  {
    icon: Stamp,
    title: 'علامة مائية PDF',
    description: 'أضف علامة مائية إلى مستند PDF.',
    href: '/tools/watermark-pdf',
  },
];

const faqs = [
  {
    q: 'هل أدوات PDF مجانية؟',
    a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة. راجع تفاصيل الأداة لمعرفة حدود حجم الملف والميزات المتاحة.',
  },
  {
    q: 'هل ملفاتي آمنة؟',
    a: 'تختلف طريقة معالجة الملفات حسب الأداة. راجع تعليمات الأداة وسياسة الخصوصية لمعرفة ما إذا كانت المعالجة تتم داخل المتصفح أو تتطلب إرسال البيانات إلى خدمة أخرى.',
  },
  {
    q: 'هل أحتاج إلى تثبيت برامج؟',
    a: 'يمكن استخدام الأدوات المتوافقة مباشرة من متصفح حديث دون تثبيت برنامج منفصل.',
  },
  {
    q: 'هل تعمل الأدوات على الجوال؟',
    a: 'نعم، الأدوات متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.',
  },
];

export default function PdfToolsPage() {
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
                Intooly PDF Suite
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black tracking-tight text-ink-900">
                أدوات PDF مجانية لدمج الملفات وضغطها وتحويلها
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
                تعرف على الأدوات المتاحة لدمج ملفات PDF وتقسيمها وضغطها وتدوير
                الصفحات وتحويل الصور إلى PDF.
              </p>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="/images/categories/pdf-tools.png"
                alt="دمج مستندات PDF وتنظيم الصفحات والملفات الرقمية."
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
            جميع أدوات PDF المتاحة
          </h2>
          <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">
            اختر الأداة المناسبة لمهمتك. كل أداة لها صفحة مستقلة تشرح طريقة
            استخدامها والقيود المهمة.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              التعامل مع ملفات PDF بسهولة أونلاين
            </h2>
            <p className="mb-4 leading-8 text-ink-700">
              تُستخدم أدوات PDF في مهام متعددة، منها جمع المستندات في ملف واحد،
              وتقسيم ملف إلى أجزاء، وتدوير الصفحات، وتحويل الصور إلى مستند PDF.
              وتساعد هذه الوظائف الطلاب وأصحاب الأعمال والمستخدمين على تنظيم
              المستندات وتجهيزها للمشاركة.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              يمكنك أيضًا ضغط ملفات PDF لتقليل حجمها قبل الإرسال عبر البريد
              الإلكتروني أو رفعها على المنصات، وتحويل صفحات PDF إلى صور لاستخدامها
              في العروض التقديمية أو المحتوى الرقمي، وإضافة علامة مائية إلى
              المستندات لحمايتها.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              عند ضغط الملفات أو تحويلها، قد تختلف النتيجة بحسب محتوى المستند
              وإعدادات الأداة. راجع الملف الناتج قبل استخدامه النهائي، خصوصًا إذا
              كان يحتوي على صور أو مستندات مهمة.
            </p>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="space-y-3 leading-8 text-ink-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">الطلاب:</strong>{' '}
                  دمج ملفات المحاضرات والملخصات في مستند واحد.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">أصحاب الأعمال:</strong>{' '}
                  تجهيز الفواتير والتقارير للعملاء والمشاركة.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">المسوقون:</strong>{' '}
                  تحويل صور المنتجات إلى ملف PDF للعروض والكتالوجات.
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