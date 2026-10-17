import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Zap,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  CheckCircle2,
  ChevronDown,
  Scissors,
  Archive,
  Maximize,
  FileType,
  FileImage,
  Crop,
  Palette,
  Film,
  Music,
  Share2,
  Smartphone,
  Lock,
  HelpCircle,
  BookOpen,
  BarChart3,
  QrCode,
  Merge,
  Minimize2,
  RotateCw,
  ImagePlus,
  Plus,
  Files,
  FileArchive,
  ArrowLeft,
  Type,
  FileOutput,
  ScanText,
  Link2,
} from 'lucide-react';

import BlogSection from '@/components/BlogSection';
import HeroSearch from '@/components/HeroSearch';

export const metadata: Metadata = {
  title: 'Intooly – أدوات مجانية أونلاين للصور والفيديو وPDF',
  description:
    'اكتشف أدوات مجانية عبر الإنترنت لتعديل الصور وضغطها، وقص الفيديو وتحويله، ودمج ملفات PDF وضغطها، وتحويل الصور إلى Word باستخدام OCR، وإنشاء رموز QR باستخدام الأدوات المتاحة على Intooly.',
  alternates: {
    canonical: 'https://intooly.com/',
  },
  openGraph: {
    title: 'Intooly – أدوات مجانية أونلاين للصور والفيديو وPDF',
    description:
      'أدوات عبر الإنترنت للصور والفيديو وملفات PDF والمستندات والكلمات المفتاحية والإنتاجية، بواجهة عربية سهلة الاستخدام.',
    url: 'https://intooly.com/',
    siteName: 'Intooly',
    type: 'website',
    locale: 'ar',
  },
};

const categories = [
  {
    icon: ImageIcon,
    title: 'أدوات الصور',
    description: 'إزالة الخلفية، وضغط الصور، وتغيير الأبعاد، وتحويل الصيغ.',
    href: '/tools/images',
    color: {
      bg: '#fff7ed',
      border: '#fed7aa',
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      shadow: 'rgba(234,88,12,0.15)',
    },
  },
  {
    icon: Video,
    title: 'أدوات الفيديو',
    description: 'قص الفيديو وضغطه وتحويله واستخراج الصوت وإنشاء GIF.',
    href: '/tools/video',
    color: {
      bg: '#fef2f2',
      border: '#fecaca',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      shadow: 'rgba(220,38,38,0.15)',
    },
  },
  {
    icon: FileText,
    title: 'أدوات PDF',
    description: 'دمج ملفات PDF وتقسيمها وضغطها وتنظيم صفحاتها.',
    href: '/tools/pdf',
    color: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      shadow: 'rgba(37,99,235,0.15)',
    },
  },
  {
    icon: FileType,
    title: 'أدوات المستندات',
    description: 'تحويل الصور إلى Word باستخدام OCR، والمزيد من أدوات المستندات.',
    href: '/tools/documents',
    color: {
      bg: '#f0fdf4',
      border: '#bbf7d0',
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      shadow: 'rgba(22,163,74,0.15)',
    },
  },
  {
    icon: BarChart3,
    title: 'أدوات SEO',
    description: 'اكتشاف أفكار الكلمات المفتاحية وتحليل النصوص.',
    href: '/tools/seo',
    color: {
      bg: '#f5f3ff',
      border: '#ddd6fe',
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      shadow: 'rgba(124,58,237,0.15)',
    },
  },
  {
    icon: QrCode,
    title: 'أدوات الإنتاجية',
    description: 'إنشاء رموز QR للرابط والنص واستخدامات أخرى.',
    href: '/tools/productivity',
    color: {
      bg: '#fffbeb',
      border: '#fde68a',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      shadow: 'rgba(217,119,6,0.15)',
    },
  },
];

const featuredTools = [
  {
    icon: Files,
    title: 'دمج ملفات PDF',
    description: 'اجمع ملفات PDF متعددة في ملف واحد.',
    href: '/tools/merge-pdf',
    color: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      shadow: 'rgba(37,99,235,0.15)',
    },
  },
  {
    icon: FileArchive,
    title: 'ضغط ملفات PDF',
    description: 'قلّل حجم ملفات PDF وفق إمكانات أداة الضغط.',
    href: '/tools/compress-pdf',
    color: {
      bg: '#fff7ed',
      border: '#fed7aa',
      iconBg: '#ffedd5',
      iconColor: '#ea580c',
      shadow: 'rgba(234,88,12,0.15)',
    },
  },
  {
    icon: Scissors,
    title: 'إزالة خلفية الصور',
    description: 'جرّب إزالة خلفية الصورة للحصول على خلفية شفافة.',
    href: '/tools/background-remover',
    color: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      iconBg: '#d1fae5',
      iconColor: '#059669',
      shadow: 'rgba(5,150,105,0.15)',
    },
  },
  {
    icon: QrCode,
    title: 'إنشاء رمز QR',
    description: 'أنشئ رمزًا للرابط أو النص ونزّله.',
    href: '/tools/qr-generator',
    color: {
      bg: '#f5f3ff',
      border: '#ddd6fe',
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      shadow: 'rgba(124,58,237,0.15)',
    },
  },
  {
    icon: Link2,
    title: 'مولّد روابط UTM',
    description: 'أنشئ روابط تتبع احترافية لحملاتك التسويقية.',
    href: '/tools/utm-builder',
    color: {
      bg: '#ecfeff',
      border: '#a5f3fc',
      iconBg: '#cffafe',
      iconColor: '#0891b2',
      shadow: 'rgba(8,145,178,0.15)',
    },
  },
];

const imageTools = [
  { icon: Scissors, title: 'إزالة خلفية الصور', href: '/tools/background-remover' },
  { icon: Archive, title: 'ضغط الصور', href: '/tools/image-compressor' },
  { icon: Palette, title: 'استوديو صور المنتجات', href: '/tools/product-photo-studio' },
  { icon: Crop, title: 'قص الصور', href: '/tools/image-cropper' },
  { icon: FileType, title: 'تحويل صيغ الصور', href: '/tools/image-converter' },
  { icon: Maximize, title: 'تغيير حجم الصور', href: '/tools/image-resizer' },
];

const videoTools = [
  { icon: Archive, title: 'ضغط الفيديو', href: '/tools/video-compressor' },
  { icon: Share2, title: 'تحويل صيغ الفيديو', href: '/tools/video-converter' },
  { icon: Music, title: 'تحويل الفيديو إلى صوت', href: '/tools/video-to-audio' },
  { icon: Film, title: 'قص الفيديو', href: '/tools/video-trimmer' },
  { icon: Film, title: 'تحويل الفيديو إلى GIF', href: '/tools/video-to-gif' },
];

const pdfTools = [
  { icon: Merge, title: 'دمج PDF', href: '/tools/merge-pdf' },
  { icon: Scissors, title: 'تقسيم PDF', href: '/tools/split-pdf' },
  { icon: Minimize2, title: 'ضغط PDF', href: '/tools/compress-pdf' },
  { icon: RotateCw, title: 'تدوير PDF', href: '/tools/rotate-pdf' },
  { icon: ImagePlus, title: 'تحويل الصور إلى PDF', href: '/tools/jpg-to-pdf' },
];

const documentsTools = [
  { icon: FileText, title: 'تحويل JPG إلى Word', href: '/tools/jpg-to-word' },
];

const faqs = [
  {
    q: 'هل أدوات Intooly مجانية؟',
    a: 'يمكنك استخدام الأدوات المتاحة مجانًا وفقًا للوظائف والقيود الموضحة في صفحة كل أداة.',
  },
  {
    q: 'هل بياناتي وملفاتي آمنة؟',
    a: 'تختلف طريقة معالجة الملفات حسب الأداة. راجع تعليمات الأداة وسياسة الخصوصية.',
  },
  {
    q: 'هل أحتاج إلى تثبيت برامج؟',
    a: 'يمكن استخدام الأدوات المتوافقة مباشرة من متصفح حديث دون تثبيت برنامج منفصل.',
  },
  {
    q: 'كيف أتواصل مع فريق Intooly؟',
    a: 'يمكنك التواصل معنا عبر البريد الإلكتروني support@intooly.com للاستفسارات.',
  },
  {
    q: 'ما الصيغ المدعومة؟',
    a: 'تختلف الصيغ المدعومة حسب الأداة. راجع صفحة كل أداة لمعرفة الصيغ التي تدعمها.',
  },
  {
    q: 'هل تعمل الأدوات على الجوال؟',
    a: 'نعم، الأدوات متوافقة مع المتصفحات الحديثة على الجوال والأجهزة اللوحية.',
  },
];

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center mb-10">
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function ToolGrid({
  tools,
  columns = 'md:grid-cols-3',
}: {
  tools: {
    icon: React.ElementType;
    title: string;
    href: string;
    description?: string;
  }[];
  columns?: string;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-3 md:gap-4`}>
      {tools.map((tool) => {
        const Icon = tool.icon;

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-300 group flex items-center gap-3 shadow-[0_4px_20px_-8px_rgba(245,158,11,0.25)]"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
              <Icon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900">
                {tool.title}
              </h3>
              {tool.description && (
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed mt-1">
                  {tool.description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ColoredToolGrid({
  tools,
  columns = 'md:grid-cols-3',
}: {
  tools: {
    icon: React.ElementType;
    title: string;
    href: string;
    description?: string;
    color?: {
      bg: string;
      border: string;
      iconBg: string;
      iconColor: string;
      shadow: string;
    };
  }[];
  columns?: string;
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-3 md:gap-4`}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        const color = tool.color;

        if (color) {
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 border"
              style={{
                backgroundColor: color.bg,
                borderColor: color.border,
                boxShadow: `0 4px 20px -8px ${color.shadow}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: color.iconBg }}
              >
                <Icon className="w-5 h-5" style={{ color: color.iconColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm md:text-base text-slate-900">
                  {tool.title}
                </h3>
                {tool.description && (
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed mt-1">
                    {tool.description}
                  </p>
                )}
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-300 group flex items-center gap-3 shadow-[0_4px_20px_-8px_rgba(245,158,11,0.25)]"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
              <Icon className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900">
                {tool.title}
              </h3>
              {tool.description && (
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed mt-1">
                  {tool.description}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://intooly.com/#website',
        url: 'https://intooly.com/',
        name: 'Intooly',
        description:
          'أدوات عبر الإنترنت للصور والفيديو وملفات PDF والمستندات والكلمات المفتاحية والإنتاجية.',
        inLanguage: 'ar',
        publisher: {
          '@id': 'https://intooly.com/#organization',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://intooly.com/#organization',
        name: 'Intooly',
        url: 'https://intooly.com/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://intooly.com/favicon.svg',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@intooly.com',
          contactType: 'customer support',
          availableLanguage: ['Arabic', 'English'],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://intooly.com/#faq',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <section
        className="relative overflow-hidden py-10 md:py-14 lg:py-16 bg-white"
        style={{
          boxShadow: '0 15px 50px -10px rgba(202,138,4,0.5), 0 8px 20px -5px rgba(202,138,4,0.3)'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(202,138,4,0.6) 0%, rgba(202,138,4,0.35) 25%, rgba(202,138,4,0.15) 50%, transparent 75%)'
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-ink-900 mb-3 md:mb-4 leading-tight">
              intooly أدوات مجانية احترافية
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-semibold text-ink-800 mb-6 md:mb-8 leading-relaxed">
              أدوات مجانية احترافية لمعالجة الصور والفيديو والمستندات والنصوص
            </p>

            <div className="mb-6 md:mb-8">
              <HeroSearch />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {[
                { icon: Shield, text: 'ملفات آمنة' },
                { icon: Zap, text: 'معالجة فورية' },
                { icon: CheckCircle2, text: 'مجاني' },
                { icon: Lock, text: 'بدون تسجيل' },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-white/50"
                    style={{
                      boxShadow: '0 8px 25px -5px rgba(202,138,4,0.6), 0 4px 10px -3px rgba(202,138,4,0.4)'
                    }}
                  >
                    <Icon className="w-4 h-4 text-ink-800" />
                    <span className="text-xs md:text-sm font-bold text-ink-900">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="py-14 md:py-16 bg-white scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={BookOpen}
            title="استكشف الأدوات المجانية حسب الفئة"
            description="اختر الفئة التي تناسب مهمتك للوصول إلى الأدوات المتاحة وتفاصيل استخدامها."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const color = category.color;

              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group rounded-xl p-5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3 border"
                  style={{
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    boxShadow: `0 4px 20px -8px ${color.shadow}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color.iconBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: color.iconColor }} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {category.description}
                  </p>
                  <span
                    className="text-sm font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                    style={{ color: color.iconColor }}
                  >
                    استكشف الفئة
                    <span>←</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={Star}
            title="أدوات مفيدة لإنجاز مهامك"
            description="ابدأ بأحد هذه الخيارات للوصول مباشرة إلى صفحة الأداة وطريقة استخدامها."
          />

          <ColoredToolGrid tools={featuredTools} columns="md:grid-cols-2 lg:grid-cols-4" />

          <div className="mt-10 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              أدوات عملية للمهام اليومية
            </h3>
            <p className="text-sm md:text-base text-slate-600 leading-8">
              تجمع Intooly أدوات عبر الإنترنت تساعدك على تنفيذ مهام رقمية شائعة،
              مثل دمج ملفات PDF وضغطها، وتجهيز الصور، وإنشاء رموز QR، وتحويل الصور إلى مستندات Word. اختر الأداة
              التي تناسب احتياجك، ثم راجع التعليمات والخيارات المتاحة داخل صفحتها
              قبل بدء المعالجة أو تنزيل النتيجة.
            </p>
          </div>
        </div>
      </section>

      <section id="browse" className="py-14 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={BookOpen}
            title="تصفح حسب الحاجة"
            description="اختر ما تريد إنجازه للوصول إلى الأدوات المناسبة."
          />

          <div className="space-y-6">
            {[
              {
                icon: ImageIcon,
                image: '/images/categories/image-tools.webp',
                imageAlt: 'تعديل الصور وضغطها وتغيير أبعادها وتحويل صيغها.',
                title: 'أدوات تعديل الصور وضغطها أونلاين',
                count: '6 أدوات',
                href: '/tools/images',
                paragraphs: [
                  'توفّر أدوات تعديل الصور على Intooly مجموعة من الوظائف التي تساعدك على تجهيز صورك بسهولة عبر الإنترنت. يمكنك تغيير أبعاد الصورة، وضغطها لتقليل حجم الملف، وتحويلها بين الصيغ المدعومة مثل JPG وPNG وWebP دون تثبيت أي برامج.',
                  'تشمل أدوات الصور أيضًا إمكانية قص الصورة لتحديد الجزء المطلوب، وإزالة الخلفية للحصول على خلفية شفافة عند دعم الأداة. هذه الوظائف مفيدة لأصحاب المتاجر الإلكترونية الذين يحتاجون إلى تجهيز صور المنتجات، ولصنّاع المحتوى الذين يعدّون صورًا لمنصات التواصل.',
                  'إذا كنت تبحث عن أدوات صور مجانية تعمل مباشرة من المتصفح، يمكنك تصفح جميع الأدوات المتاحة والاطلاع على تفاصيل كل أداة قبل استخدامها.',
                ],
              },
              {
                icon: Video,
                image: '/images/categories/video-tools.webp',
                imageAlt: 'قص وضغط وتحويل الفيديو.',
                title: 'أدوات الفيديو المجانية عبر الإنترنت',
                count: '5 أدوات',
                href: '/tools/video',
                paragraphs: [
                  'توفّر أدوات الفيديو على Intooly مجموعة من الوظائف التي تساعدك على التعامل مع مقاطع الفيديو عبر الإنترنت. يمكنك قص جزء محدد من الفيديو، وتقليل حجم الملف ليكون مناسبًا للرفع، وتحويل الفيديو بين الصيغ المدعومة مثل MP4 وWebM وMOV.',
                  'تشمل أدوات الفيديو أيضًا إمكانية استخراج المسار الصوتي من الفيديو وتحويله إلى ملف صوتي، وتحويل جزء من الفيديو إلى صورة GIF متحركة. هذه الوظائف مفيدة لصنّاع المحتوى والمسوقين وأصحاب المشاريع.',
                  'تعتمد مدة المعالجة على حجم الملف وصيغته وقدرات الجهاز والمتصفح. تحقق من متطلبات الأداة وحدود حجم الملف والصيغ التي تدعمها.',
                ],
              },
              {
                icon: FileText,
                image: '/images/categories/pdf-tools.webp',
                imageAlt: 'دمج مستندات PDF وتنظيم الصفحات.',
                title: 'أدوات PDF لدمج الملفات وضغطها وتحويلها',
                count: '10 أدوات',
                href: '/tools/pdf',
                paragraphs: [
                  'تُستخدم أدوات PDF في مهام متعددة، منها جمع المستندات في ملف واحد، وتقسيم ملف إلى أجزاء، وتدوير الصفحات، وتحويل الصور إلى مستند PDF. وتساعد هذه الوظائف الطلاب وأصحاب الأعمال والمستخدمين على تنظيم المستندات.',
                  'يمكنك أيضًا ضغط ملفات PDF لتقليل حجمها قبل الإرسال، وتحويل صفحات PDF إلى صور لاستخدامها في العروض التقديمية، وإضافة علامة مائية إلى المستندات لحمايتها.',
                  'عند ضغط الملفات أو تحويلها، قد تختلف النتيجة بحسب محتوى المستند وإعدادات الأداة. راجع الملف الناتج قبل استخدامه النهائي.',
                ],
              },
              {
                icon: FileType,
                image: '/images/categories/pdf-tools.webp',
                imageAlt: 'تحويل الصور والمستندات بين الصيغ.',
                title: 'أدوات المستندات لتحويل الصور والنصوص',
                count: '1 أداة',
                href: '/tools/documents',
                paragraphs: [
                  'توفّر أدوات المستندات على Intooly وظائف لتحويل الصور إلى مستندات Word باستخدام OCR (التعرف الضوئي على الحروف)، مما يتيح استخراج النصوص من الصور وتحريرها. الأداة الحالية "تحويل JPG إلى Word" تدعم العربية والإنجليزية.',
                  'هذه الأدوات مفيدة للطلاب الذين يحتاجون إلى تحويل صور المحاضرات إلى نصوص، وللموظفين الذين يستقبلون صورًا تحتوي على نص ويحتاجون إلى تحريره، ولمن يريد تحويل صور الفواتير أو العقود إلى مستندات قابلة للبحث.',
                  'تختلف دقة OCR حسب جودة الصورة ووضوح الخطوط، لذا يُنصح بمراجعة النص المستخرج قبل الاعتماد عليه.',
                ],
              },
              {
                icon: BarChart3,
                image: '/images/categories/seo-tools.webp',
                imageAlt: 'تحسين محركات البحث وأدوات بحث الكلمات المفتاحية.',
                title: 'أدوات تحسين محركات البحث والكلمات المفتاحية',
                count: '2 أدوات',
                href: '/tools/seo',
                paragraphs: [
                  'يساعد البحث عن الكلمات المفتاحية في اكتشاف عبارات قد يستخدمها الجمهور عند البحث عن موضوع معين. يمكنك استخدام مولّد الكلمات المفتاحية لاستكشاف أفكار مرتبطة بكلمة أساسية، ثم تقييم مدى ملاءمتها لمحتوى موقعك.',
                  'أما عدّاد الكلمات فيساعدك على معرفة طول النص ومراجعته قبل النشر. يمكن استخدامه أيضًا لمراجعة منشورات التواصل الاجتماعي.',
                  'تذكر أن الأدوات المساعدة لا تضمن وحدها تحسّن ترتيب الموقع؛ إذ يعتمد الأداء في نتائج البحث على جودة المحتوى وتجربة الصفحة وعوامل أخرى.',
                ],
              },
              {
                icon: QrCode,
                image: '/images/categories/productivity-tools.webp',
                imageAlt: 'مكتب منظم مع بطاقة رمز QR.',
                title: 'أدوات مجانية للإنتاجية وإنشاء QR Code',
                count: '3 أدوات',
                href: '/tools/productivity',
                paragraphs: [
                  'يمكن استخدام رمز QR لتسهيل الوصول إلى رابط موقع أو نص أو معلومات أخرى تدعمها الأداة. أنشئ الرمز باستخدام مولّد QR Code، ثم حمّله واستخدمه في الطباعة على الملصقات أو بطاقات العمل.',
                  'قبل طباعة الرمز أو مشاركته على نطاق واسع، جرّب مسحه باستخدام هاتفك للتأكد من أن البيانات صحيحة. تحقّق أيضًا من أن الرمز واضح بما يكفي للطباعة.',
                  'تشمل أدوات الإنتاجية على Intooly أيضًا أدوات نصية مساعدة مثل عدّاد الكلمات ومولّد الكلمات المفتاحية.',
                ],
              },
            ].map((cat, idx) => {
              const Icon = cat.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={cat.href}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_-10px_rgba(245,158,11,0.25)]"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-0">
                    <div className={`relative h-64 md:h-72 lg:h-auto lg:col-span-3 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <img
                        src={cat.image}
                        alt={cat.imageAlt}
                        className="w-full h-full object-contain p-2 md:p-4"
                        loading="lazy"
                      />
                    </div>
                    <div className={`p-6 md:p-8 lg:col-span-7 flex flex-col justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900">
                          {cat.title}
                        </h3>
                      </div>

                      <div className="space-y-2 mb-4">
                        {cat.paragraphs.map((p, i) => (
                          <p key={i} className="text-sm text-slate-600 leading-7">
                            {p}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                          {cat.count}
                        </span>
                        <Link
                          href={cat.href}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 shadow-[0_4px_15px_-4px_rgba(234,179,8,0.35)]"
                        >
                          استكشف جميع الأدوات
                          <ArrowLeft className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={Star}
            title="لماذا تستخدم Intooly؟"
            description="تنظيم الأدوات في مكان واحد يساعدك على الوصول إلى الوظيفة المناسبة دون البحث في مواقع متعددة."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: 'أدوات مصنفة بوضوح',
                description: 'انتقل إلى فئات الصور والفيديو وPDF والمستندات والنصوص.',
                color: { bg: '#fff7ed', border: '#fed7aa', iconBg: '#ffedd5', iconColor: '#ea580c', shadow: 'rgba(234,88,12,0.15)' },
              },
              {
                icon: Smartphone,
                title: 'استخدام عبر المتصفح',
                description: 'افتح صفحات الأدوات من متصفح متوافق.',
                color: { bg: '#eff6ff', border: '#bfdbfe', iconBg: '#dbeafe', iconColor: '#2563eb', shadow: 'rgba(37,99,235,0.15)' },
              },
              {
                icon: CheckCircle2,
                title: 'خطوات واضحة',
                description: 'راجع تعليمات الأداة قبل معالجة الملف.',
                color: { bg: '#ecfdf5', border: '#a7f3d0', iconBg: '#d1fae5', iconColor: '#059669', shadow: 'rgba(5,150,105,0.15)' },
              },
              {
                icon: Zap,
                title: 'خيارات متنوعة',
                description: 'اختر الأداة حسب المهمة التي تريد إنجازها.',
                color: { bg: '#fffbeb', border: '#fde68a', iconBg: '#fef3c7', iconColor: '#d97706', shadow: 'rgba(217,119,6,0.15)' },
              },
              {
                icon: Shield,
                title: 'تفاصيل لكل أداة',
                description: 'تحقق من حدود الملفات وطريقة المعالجة في صفحتها.',
                color: { bg: '#f5f3ff', border: '#ddd6fe', iconBg: '#ede9fe', iconColor: '#7c3aed', shadow: 'rgba(124,58,237,0.15)' },
              },
              {
                icon: HelpCircle,
                title: 'دعم عبر البريد',
                description: 'راسلنا على support@intooly.com لأي استفسار.',
                color: { bg: '#fef2f2', border: '#fecaca', iconBg: '#fee2e2', iconColor: '#dc2626', shadow: 'rgba(220,38,38,0.15)' },
              },
            ].map((feature) => {
              const Icon = feature.icon;
              const color = feature.color;

              return (
                <div
                  key={feature.title}
                  className="rounded-xl p-5 flex items-start gap-3 border"
                  style={{
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    boxShadow: `0 4px 20px -10px ${color.shadow}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color.iconBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: color.iconColor }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-slate-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="py-14 md:py-16 bg-slate-50 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            icon={HelpCircle}
            title="الأسئلة الشائعة"
            description="إجابات عن استخدام الأدوات المتاحة على Intooly."
          />

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group shadow-[0_4px_20px_-12px_rgba(100,116,139,0.3)]"
              >
                <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-sm md:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3 leading-7">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <BlogSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  );
}