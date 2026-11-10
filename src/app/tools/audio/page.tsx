import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Mic,
  Volume2,
  Scissors,
  FileAudio,
  ArrowLeft,
  BookOpen,
  Shield,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات الصوت ومعالجته أونلاين مجانًا | Intooly',
  description:
    'اكتشف أدوات الصوت أونلاين لتحويل الصوت الى نص، تنظيف التسجيلات، وقص الملفات. كل الأدوات تعمل محليًا في متصفحك لضمان الخصوصية والسرعة.',
  alternates: {
    canonical: 'https://intooly.com/tools/audio',
  },
  openGraph: {
    title: 'أدوات الصوت ومعالجته أونلاين | Intooly',
    description: 'أدوات مجانية لتحويل الصوت الى نص، معالجة الملفات الصوتية، وتحسين جودة التسجيلات مباشرة من المتصفح.',
    url: 'https://intooly.com/tools/audio',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  
  {
    icon: Scissors,
    title: 'قص الأغاني',
    description: 'قص ملفات MP3 وتقطيع الأغاني بدقة، وإنشاء نغمات رنين، ومعاينة الموجة الصوتية مباشرة من المتصفح.',
    href: '/tools/song-cutter',
  },{
    icon: Mic,
    title: 'تحويل الصوت الى نص',
    description: 'فرّغ التسجيلات والمحاضرات بدقة عالية باستخدام الذكاء الاصطناعي محليًا داخل متصفحك.',
    href: '/tools/audio-to-text',
  },
  {
    icon: Volume2,
    title: 'تنظيف الصوت من الضوضاء',
    description: 'أزل الأصوات الخلفية المزعجة من تسجيلاتك لتحسين جودة الصوت بذكاء.',
    href: '/tools/audio-denoise', // أداة مستقبلية
  },
  {
    icon: Scissors,
    title: 'قص ودمج الملفات الصوتية',
    description: 'أداة بسيطة وسريعة لقص المقاطع غير المرغوب فيها أو دمج عدة ملفات صوتية.',
    href: '/tools/audio-trimmer', // أداة مستقبلية
  },
  {
    icon: FileAudio,
    title: 'تحويل صيغ الملفات الصوتية',
    description: 'حوّل ملفاتك بين الصيغ الشائعة مثل MP3, WAV, M4A, و OGG بسهولة.',
    href: '/tools/audio-converter', // أداة مستقبلية
  },
];

const faqs = [
  { 
    q: 'هل أدوات الصوت مجانية بالكامل؟', 
    a: 'نعم، يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.' 
  },
  { 
    q: 'هل يتم رفع ملفاتي الصوتية إلى خوادمكم؟', 
    a: 'لا، أدواتنا الأساسية (مثل تحويل الصوت الى نص) تعمل محليًا داخل متصفحك باستخدام تقنيات الويب الحديثة، مما يضمن خصوصية تامة لبياناتك.' 
  },
  { 
    q: 'ما هي الصيغ الصوتية المدعومة؟', 
    a: 'ندعم الصيغ الأكثر شيوعاً مثل MP3, WAV, M4A, و WebM. تختلف الصيغ المدعومة قليلاً حسب الأداة المحددة.' 
  },
  { 
    q: 'هل يمكنني استخدام هذه الأدوات على الجوال؟', 
    a: 'نعم، جميع الأدوات متوافقة تماماً مع المتصفحات الحديثة على الهواتف الذكية والأجهزة اللوحية.' 
  },
];

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'أدوات الصوت — Intooly',
  url: 'https://intooly.com/tools/audio',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'مجموعة أدوات مجانية لتحويل الصوت الى نص ومعالجة الملفات الصوتية داخل المتصفح بأمان.',
  inLanguage: 'ar',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://intooly.com' },
    { '@type': 'ListItem', position: 2, name: 'الأدوات', item: 'https://intooly.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'أدوات الصوت', item: 'https://intooly.com/tools/audio' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

export default function AudioToolsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <main dir="rtl" className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
          <div className="container relative mx-auto px-4 py-12 md:py-16">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
              <BookOpen className="h-4 w-4" />
              Intooly Audio Suite
            </span>
            <h1 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-black tracking-tight text-ink-900">
              أدوات الصوت ومعالجته أونلاين
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
              خيارات متقدمة لتحويل الصوت الى نص، تنظيف التسجيلات من الضوضاء، وقص ودمج الملفات الصوتية. جميع الأدوات تعمل محليًا في متصفحك لضمان السرعة والخصوصية التامة.
            </p>
          </div>
        </section>

        {/* Tools Grid Section */}
        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-black text-ink-900 md:text-2xl">جميع أدوات الصوت المتاحة</h2>
            <p className="mt-3 text-base text-ink-600 max-w-3xl mx-auto leading-8">اختر الأداة المناسبة لمهمتك الصوتية.</p>
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

        {/* SEO Content Section */}
        <section className="border-t border-ink-100 bg-white">
          <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
            <div className="text-right">
              <h2 className="mb-6 text-xl font-black text-ink-900 md:text-2xl">تحويل الصوت الى نص ومعالجته أونلاين بأمان</h2>
              <p className="mb-4 leading-8 text-ink-700">
                توفّر أدوات الصوت على Intooly مجموعة من الوظائف المتقدمة التي تساعدك على التعامل مع ملفاتك الصوتية بسهولة عبر الإنترنت. أبرز هذه الأدوات هي ميزة <strong>تحويل الصوت الى نص</strong> التي تتيح لك تفريغ المحاضرات، الاجتماعات، والتسجيلات الشخصية بدقة عالية باستخدام الذكاء الاصطناعي، دون الحاجة إلى رفع الملفات إلى أي خادم خارجي.
              </p>
              <p className="mb-4 leading-8 text-ink-700">
                تعتمد أدواتنا على تقنيات الويب الحديثة (WebAssembly و Web Audio API) لمعالجة الصوت محليًا داخل متصفحك. هذا يعني أن ملفاتك تبقى على جهازك دائماً، مما يضمن خصوصية تامة وسرعة في المعالجة، سواء كنت تستخدم حاسوباً مكتبيًا أو هاتفاً ذكياً.
              </p>
              <p className="mb-4 leading-8 text-ink-700">
                سواء كنت صانع محتوى يحتاج إلى تفريغ حلقات البودكاست، أو طالباً يريد تحويل المحاضرات إلى نصوص قابلة للبحث، أو محترفاً يحتاج إلى تنظيف التسجيلات من الضوضاء، فإن مجموعة أدوات الصوت من Intooly مصممة لتلبية هذه الاحتياجات بكفاءة ومجانية تامة.
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
    </>
  );
}