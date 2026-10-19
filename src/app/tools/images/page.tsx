import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Scissors,
  Archive,
  Palette,
  Crop,
  FileType,
  Maximize,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات تعديل الصور وضغطها أونلاين مجانًا | Intooly',
  description:
    'اكتشف أدوات تعديل الصور أونلاين لتغيير الأبعاد، وضغط الملفات، وقص الصور، وتحويل صيغها وإزالة الخلفيات، وتجهيز صور المنتجات والمحتوى الرقمي.',
  alternates: {
    canonical: 'https://intooly.com/tools/images',
  },
  openGraph: {
    title: 'أدوات تعديل الصور وضغطها أونلاين | Intooly',
    description: 'خيارات لتجهيز الصور وتغيير أبعادها وتحويل صيغها وضغطها.',
    url: 'https://intooly.com/tools/images',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  { icon: Scissors, title: 'إزالة خلفية الصور', description: 'أزل خلفية الصورة للحصول على خلفية شفافة.', href: '/tools/background-remover' },
  { icon: Archive, title: 'ضغط الصور', description: 'قلّل حجم ملفات الصور لتسهيل رفعها ومشاركتها.', href: '/tools/image-compressor' },
  { icon: Palette, title: 'استوديو صور المنتجات', description: 'جهّز صور المنتجات للمتاجر الإلكترونية والإعلانات.', href: '/tools/product-photo-studio' },
  { icon: Crop, title: 'قص الصور', description: 'حدّد الجزء المطلوب من الصورة وأزل الحواف.', href: '/tools/image-cropper' },
  { icon: FileType, title: 'تحويل صيغ الصور', description: 'حوّل الصور بين الصيغ المدعومة مثل JPG وPNG.', href: '/tools/image-converter' },
  { icon: Maximize, title: 'تغيير حجم الصور', description: 'غيّر أبعاد الصور بالبكسل لتناسب المواقع.', href: '/tools/image-resizer' },
];

const faqs = [
  { q: 'هل أدوات تعديل الصور مجانية؟', a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.' },
  { q: 'هل أحتاج إلى تثبيت برامج؟', a: 'يمكن استخدام الأدوات المتوافقة مباشرة من متصفح حديث دون تثبيت برنامج منفصل.' },
  { q: 'ما الصيغ المدعومة؟', a: 'تختلف الصيغ المدعومة حسب الأداة. راجع صفحة كل أداة لمعرفة الصيغ التي تدعمها.' },
  { q: 'هل يمكنني استخدام الأدوات على الجوال؟', a: 'نعم، الأدوات متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.' },
];

export default function ImageToolsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <BookOpen className="h-4 w-4" />
            Intooly Image Suite
          </span>
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-black tracking-tight text-ink-900">
            أدوات تعديل الصور وضغطها أونلاين
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
            خيارات لتجهيز الصور وتغيير أبعادها وتحويل صيغها وضغطها وإزالة الخلفيات، مع أدوات تساعدك على إعداد صور المنتجات للاستخدام في المتاجر الإلكترونية والمحتوى الرقمي.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-ink-900 md:text-3xl">جميع أدوات الصور المتاحة</h2>
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
            <h2 className="mb-6 text-2xl font-black text-ink-900 md:text-3xl">تعديل الصور وضغطها وتجهيزها أونلاين</h2>
            <p className="mb-4 leading-8 text-ink-700">
              توفّر أدوات تعديل الصور على Intooly مجموعة من الوظائف التي تساعدك على تجهيز صورك بسهولة عبر الإنترنت. يمكنك تغيير أبعاد الصورة، وضغطها لتقليل حجم الملف، وتحويلها بين الصيغ المدعومة مثل JPG وPNG وWebP دون تثبيت أي برامج.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تشمل أدوات الصور أيضًا إمكانية قص الصورة لتحديد الجزء المطلوب، وإزالة الخلفية للحصول على خلفية شفافة عند دعم الأداة. هذه الوظائف مفيدة لأصحاب المتاجر الإلكترونية الذين يحتاجون إلى تجهيز صور المنتجات، ولصنّاع المحتوى الذين يعدّون صورًا لمنصات التواصل.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              إذا كنت تبحث عن أدوات صور مجانية تعمل مباشرة من المتصفح، يمكنك تصفح جميع الأدوات المتاحة والاطلاع على تفاصيل كل أداة قبل استخدامها. تختلف إمكانات كل أداة بحسب الصيغ المدعومة وحجم الملف.
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