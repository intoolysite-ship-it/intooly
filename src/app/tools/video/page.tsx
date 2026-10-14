import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Archive,
  Share2,
  Music,
  Film,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'أدوات الفيديو أونلاين مجانًا: قص وضغط وتحويل الفيديو | Intooly',
  description:
    'اكتشف أدوات الفيديو لقص المقاطع وضغطها وتحويلها واستخراج الصوت وإنشاء GIF، مع تفاصيل الاستخدام والقيود لكل أداة.',
  alternates: {
    canonical: 'https://intooly.com/tools/video',
  },
  openGraph: {
    title: 'أدوات الفيديو أونلاين مجانًا | Intooly',
    description:
      'قص الفيديو وضغطه وتحويل صيغته واستخراج الصوت وإنشاء صور GIF متحركة.',
    url: 'https://intooly.com/tools/video',
    siteName: 'Intooly',
    locale: 'ar_EG',
    type: 'website',
  },
};

const tools = [
  {
    icon: Archive,
    title: 'ضغط الفيديو',
    description: 'قلّل حجم ملفات الفيديو لتسهيل رفعها ومشاركتها.',
    href: '/tools/video-compressor',
  },
  {
    icon: Share2,
    title: 'تحويل صيغ الفيديو',
    description: 'حوّل الفيديو بين الصيغ المدعومة مثل MP4 وWebM وMOV.',
    href: '/tools/video-converter',
  },
  {
    icon: Music,
    title: 'تحويل الفيديو إلى صوت',
    description: 'استخرج المسار الصوتي من ملفات الفيديو.',
    href: '/tools/video-to-audio',
  },
  {
    icon: Film,
    title: 'قص الفيديو',
    description: 'حدّد بداية ونهاية المقطع لقص الجزء المطلوب.',
    href: '/tools/video-trimmer',
  },
  {
    icon: Film,
    title: 'تحويل الفيديو إلى GIF',
    description: 'حوّل جزءًا من الفيديو إلى صورة GIF متحركة.',
    href: '/tools/video-to-gif',
  },
];

const faqs = [
  {
    q: 'هل أدوات الفيديو مجانية؟',
    a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة. راجع تفاصيل الأداة لمعرفة حدود حجم الملف والصيغ المدعومة.',
  },
  {
    q: 'ما الصيغ المدعومة؟',
    a: 'تختلف الصيغ المدعومة حسب الأداة. راجع صفحة كل أداة لمعرفة الصيغ التي تدعمها.',
  },
  {
    q: 'كم يستغرق معالجة الفيديو؟',
    a: 'تعتمد مدة المعالجة على حجم الملف وصيغته وقدرات الجهاز والمتصفح.',
  },
  {
    q: 'هل يمكنني استخدام الأدوات على الجوال؟',
    a: 'نعم، الأدوات متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية، مع مراعاة أن معالجة الملفات الكبيرة قد تحتاج موارد أكبر.',
  },
];

export default function VideoToolsPage() {
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
                Intooly Video Suite
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-black tracking-tight text-ink-900">
                أدوات الفيديو أونلاين لقص المقاطع وضغطها وتحويلها
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
                استكشف أدوات لقص الفيديو وضغطه وتحويل صيغته أو استخراج الصوت وإنشاء
                صور GIF متحركة.
              </p>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="/images/categories/video-tools.png"
                alt="قص وضغط وتحويل الفيديو"
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
            جميع أدوات الفيديو المتاحة
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
              قص الفيديو وتحويله وتقليل حجمه أونلاين
            </h2>
            <p className="mb-4 leading-8 text-ink-700">
              توفّر أدوات الفيديو على Intooly مجموعة من الوظائف التي تساعدك على
              التعامل مع مقاطع الفيديو عبر الإنترنت. يمكنك قص جزء محدد من الفيديو
              بتحديد بدايته ونهايته، وتقليل حجم الملف ليكون مناسبًا للرفع على
              المواقع أو المشاركة عبر منصات التواصل، وتحويل الفيديو بين الصيغ
              المدعومة مثل MP4 وWebM وMOV.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تشمل أدوات الفيديو أيضًا إمكانية استخراج المسار الصوتي من الفيديو
              وتحويله إلى ملف صوتي، وتحويل جزء من الفيديو إلى صورة GIF متحركة
              لمشاركتها في المحادثات أو على المواقع. هذه الوظائف مفيدة لصنّاع
              المحتوى والمسوقين وأصحاب المشاريع الذين يحتاجون إلى معالجة سريعة
              للفيديو دون تثبيت برامج متخصصة.
            </p>
            <p className="mb-4 leading-8 text-ink-700">
              تعتمد مدة المعالجة على حجم الملف وصيغته وقدرات الجهاز والمتصفح. قبل
              معالجة المقاطع الكبيرة، تحقق من متطلبات الأداة وحدود حجم الملف
              والصيغ التي تدعمها. راجع أيضًا خيارات التنزيل والجودة داخل صفحة
              الأداة قبل حفظ النتيجة.
            </p>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              حالات استخدام شائعة
            </h3>
            <ul className="space-y-3 leading-8 text-ink-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">صنّاع المحتوى:</strong>{' '}
                  قص المقاطع الطويلة وتجهيزها للنشر على منصات التواصل.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">المسوقون:</strong>{' '}
                  ضغط مقاطع الفيديو لتسريع رفعها على المواقع الإعلانية.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  <strong className="text-ink-900">أصحاب المشاريع:</strong>{' '}
                  استخراج الصوت من مقاطع الاجتماعات أو العروض التقديمية.
                </span>
              </li>
            </ul>

            <h3 className="mb-4 mt-10 text-xl font-bold text-ink-900 md:text-2xl">
              كيف تختار الأداة المناسبة؟
            </h3>
            <p className="mb-4 leading-8 text-ink-700">
              ابدأ بتحديد المهمة التي تريد إنجازها. إذا كنت تريد تقليل حجم
              الفيديو، استخدم أداة ضغط الفيديو. إذا كنت تحتاج إلى صيغة معينة،
              استخدم أداة تحويل الصيغ. إذا كنت تريد استخراج الصوت، استخدم أداة
              تحويل الفيديو إلى صوت. كل أداة تحتوي على تعليمات مخصصة تساعدك على
              إنجاز المهمة.
            </p>

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