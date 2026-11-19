'use client';
import Link from 'next/link';
import { ArrowLeft, Download, FileVideo, Scissors, Music, RotateCcw, Film, Image as ImageIcon, Zap } from 'lucide-react';

export default function VideoToolsPage() {
  const videoTools = [
    {
      icon: Download,
      title: 'تنزيل فيديوهات تيك توك',
      description: 'تنزيل فيديوهات تيك توك بدون علامة مائية بجودة عالية MP4 أو استخراج الصوت MP3',
      href: '/tools/tiktok-downloader',
      badge: 'جديد',
    },
    {
      icon: Scissors,
      title: 'قص الفيديو',
      description: 'قص وتحرير مقاطع الفيديو بدقة وسهولة مباشرة من المتصفح',
      href: '/tools/video-trimmer',
    },
    {
      icon: FileVideo,
      title: 'ضغط الفيديو',
      description: 'تقليل حجم ملفات الفيديو مع الحفاظ على أعلى جودة ممكنة',
      href: '/tools/video-compressor',
    },
    {
      icon: RotateCcw,
      title: 'تحويل صيغ الفيديو',
      description: 'تحويل الفيديوهات بين الصيغ المختلفة مثل MP4, AVI, MOV',
      href: '/tools/video-converter',
    },
    {
      icon: Music,
      title: 'تحويل الفيديو إلى صوت',
      description: 'استخراج المقطع الصوتي من أي فيديو وحفظه بصيغة MP3',
      href: '/tools/video-to-audio',
    },
    {
      icon: Film,
      title: 'تحويل الفيديو إلى GIF',
      description: 'إنشاء صور متحركة (GIF) احترافية من مقاطع الفيديو',
      href: '/tools/video-to-gif',
    },
    {
      icon: ImageIcon,
      title: 'صانع الصور المصغرة',
      description: 'تصميم صور مصغرة (Thumbnails) جذابة وعالية الجودة للفيديوهات',
      href: '/tools/video-thumbnail-maker',
    },
  ];

  return (
    <main className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-ink-100">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #1f2937 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        
        <div className="container relative mx-auto px-4 py-10 md:py-14 max-w-5xl">
          <Link href="/tools" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع الأدوات
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <FileVideo className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">أدوات الفيديو</h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                مجموعة متكاملة من الأدوات المجانية لتعديل، ضغط، تحويل، وتنزيل الفيديوهات بسهولة وأمان مباشرة من متصفحك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {videoTools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="bg-white border border-ink-200 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-brand-400 transition-all group cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  {tool.badge && (
                    <span className="bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{tool.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">{tool.description}</p>
                <span className="text-brand-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  جرّب الأداة <ArrowLeft className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-white border-t border-ink-100">
        <div className="container mx-auto px-4 max-w-4xl text-right">
          <h2 className="text-xl font-black text-ink-900 md:text-2xl mb-4">أدوات الفيديو المجانية من Intooly</h2>
          <p className="leading-8 text-ink-700 mb-4">
            نقدم لك مجموعة متكاملة من <strong>أدوات الفيديو</strong> المجانية التي تساعدك في التعامل مع الفيديوهات بسهولة واحترافية. 
            سواء كنت تريد تنزيل فيديوهات من منصات التواصل الاجتماعي، أو قص مقاطع، أو ضغط الملفات لتقليل حجمها، 
            فإن أدواتنا توفر لك كل ما تحتاجه في مكان واحد.
          </p>
          <p className="leading-8 text-ink-700">
            جميع أدواتنا تعمل مباشرة من المتصفح دون الحاجة لتثبيت برامج، وتحافظ على خصوصيتك حيث تتم المعالجة محلياً أو عبر خوادم آمنة ومشفرة.
          </p>
        </div>
      </section>
    </main>
  );
}
