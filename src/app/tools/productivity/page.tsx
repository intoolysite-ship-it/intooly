import type { Metadata } from 'next';
import Link from 'next/link';
import {
  QrCode,
  FileText,
  BarChart3,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات إنتاجية مجانية أونلاين – أدوات رقمية وQR Code | Intooly',
  description:
    'أنجز مهامك الرقمية باستخدام أدوات الإنتاجية على Intooly، بما في ذلك إنشاء رموز QR واستخدام الأدوات المتاحة.',
  alternates: {
    canonical: 'https://intooly.com/tools/productivity',
  },
  openGraph: {
    title: 'أدوات إنتاجية مجانية أونلاين | Intooly',
    description: 'أنشئ رموز QR واستخدم أدوات رقمية عملية لتسهيل المهام اليومية.',
    url: 'https://intooly.com/tools/productivity',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  { icon: QrCode, title: 'مولّد QR Code', description: 'أنشئ رمز QR للرابط أو النص ونزّله للاستخدام.', href: '/tools/qr-generator' },
  { icon: FileText, title: 'عدّاد الكلمات', description: 'احسب الكلمات والأحرف في النصوص.', href: '/tools/word-counter' },
  { icon: BarChart3, title: 'مولّد الكلمات المفتاحية', description: 'اكتشف أفكارًا وعبارات مرتبطة بكلمتك الأساسية.', href: '/tools/keyword-generator' },
];

const faqs = [
  { q: 'ما هي أدوات الإنتاجية؟', a: 'أدوات رقمية تساعدك على إنجاز مهام يومية بسرعة وسهولة، مثل إنشاء رموز QR، وعدّ الكلمات، وتوليد أفكار الكلمات المفتاحية.' },
  { q: 'هل أدوات الإنتاجية مجانية؟', a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.' },
  { q: 'كيف أستخدم رمز QR؟', a: 'أنشئ الرمز باستخدام مولّد QR Code، ثم حمّله واستخدمه في الطباعة أو المشاركة الرقمية. تأكد من اختبار الرمز بمسحه قبل استخدامه على نطاق واسع.' },
  { q: 'هل تعمل الأدوات على الجوال؟', a: 'نعم، الأدوات متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.' },
];

export default function ProductivityToolsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="container relative mx-auto px-4 py-12 md:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
            <BookOpen className="h-4 w-4" />
            Intooly Productivity Suite
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black tracking-tight text-ink-900">
            أدوات إنتاجية مجانية عبر الإنترنت
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
            أنشئ رموز QR للرابط أو النص، واستكشف خيارات الاستخدام التي توفرها الأداة.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-ink-900 md:text-3xl">جميع أدوات الإنتاجية المتاحة</h2>
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
            <h2 className="mb-6 text-2xl font-black text-ink-900 md:text-3xl">إنشاء رموز QR للاستخدام الشخصي والتجاري</h2>
            <p className="mb-4 leading-8 text-ink-700">
              يمكن استخدام رمز QR لتسهيل الوصول إلى رابط موقع أو نص أو معلومات أخرى تدعمها الأداة. أنشئ الرمز باستخدام مولّد QR Code، ثم حمّله واستخدمه في الطباعة على الملصقات أو بطاقات العمل أو القوائم الرقمية.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              قبل طباعة الرمز أو مشاركته على نطاق واسع، جرّب مسحه باستخدام هاتفك للتأكد من أن البيانات صحيحة وأن الرابط يفتح الصفحة المقصودة. تحقّق أيضًا من أن الرمز واضح بما يكفي للطباعة، وأن الألوان متباينة لتسهيل المسح.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تشمل أدوات الإنتاجية على Intooly أيضًا أدوات نصية مساعدة مثل عدّاد الكلمات ومولّد الكلمات المفتاحية. هذه الأدوات مفيدة لصنّاع المحتوى والمسوقين وأصحاب المشاريع الذين يحتاجون إلى إنجاز مهام رقمية سريعة.
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