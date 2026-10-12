import Link from 'next/link';
import { 
  Sparkles, Upload, Download, Shield, Zap, Image, Video, 
  FileText, TrendingUp, Star, CheckCircle2, ChevronDown,
  Scissors, Archive, Maximize, FileType, Crop, Palette,
  Film, Music, Share2, Clock, Globe, Smartphone, Lock,
  HelpCircle, BookOpen, ArrowLeft, Wrench, Hash, QrCode,
  Braces, Type, Search, BarChart3, FileCode, Code,
  Merge, Minimize2, RotateCw, ImagePlus, Plus
} from 'lucide-react';

import BlogSection from '@/components/BlogSection';

export default function Home() {
  return (
    <div className="min-h-screen" dir="rtl">
      
      {/* ============ 1. Hero Section ============ */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 mb-3 leading-tight">
              intooly أدوات مجانية احترافية
            </h1>
            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              أدوات مجانية احترافية لمعالجة الصور والفيديو والنصوص
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <Link href="/tools/background-remover" className="group flex items-center gap-3 bg-white border border-ink-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-300 transition-all duration-300 text-right">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-ink-900 mb-0.5">جرّب إزالة الخلفية</h3>
                  <p className="text-xs text-ink-600 leading-tight">أزل خلفية أي صورة بدقة عالية بالذكاء الاصطناعي</p>
                </div>
                <span className="text-brand-600 font-semibold text-xs flex items-center gap-1 flex-shrink-0 group-hover:gap-1.5 transition-all">ابدأ <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              </Link>

              <Link href="/tools/image-compressor" className="group flex items-center gap-3 bg-white border border-ink-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-300 transition-all duration-300 text-right">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-ink-900 mb-0.5">ضغط صورة</h3>
                  <p className="text-xs text-ink-600 leading-tight">قلّل حجم صورتك مع الحفاظ على الجودة العالية</p>
                </div>
                <span className="text-brand-600 font-semibold text-xs flex items-center gap-1 flex-shrink-0 group-hover:gap-1.5 transition-all">ابدأ <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              </Link>

              <Link href="/tools/product-photo-studio" className="group flex items-center gap-3 bg-brand-50 border-2 border-brand-300 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-right relative">
                <span className="absolute -top-2 -left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">🆕 جديد</span>
                <div className="w-10 h-10 bg-brand-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-ink-900 mb-0.5">استوديو صور المنتجات</h3>
                  <p className="text-xs text-ink-600 leading-tight">خلفيات احترافية لصور منتجاتك بإطار</p>
                </div>
                <span className="text-brand-700 font-semibold text-xs flex items-center gap-1 flex-shrink-0 group-hover:gap-1.5 transition-all">ابدأ <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-xs md:text-sm text-ink-600 bg-white/50 backdrop-blur-sm rounded-xl px-4 md:px-6 py-3 border border-ink-200">
              <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg><span className="font-medium">ملفات آمنة</span></div>
              <div className="hidden md:block w-px h-5 bg-ink-300"></div>
              <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span className="font-medium">معالجة فورية</span></div>
              <div className="hidden md:block w-px h-5 bg-ink-300"></div>
              <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg><span className="font-medium">مجاني</span></div>
              <div className="hidden md:block w-px h-5 bg-ink-300"></div>
              <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg><span className="font-medium">بدون تسجيل</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. التصنيفات الرئيسية ============ */}
      <section id="categories" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">التصنيفات الرئيسية</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">اختر التصنيف الذي يناسب احتياجاتك</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {[
              { icon: Image, label: 'أدوات الصور', href: '/#image-tools', shadowColor: 'rgba(249,115,22,0.25)' },
              { icon: Video, label: 'أدوات الفيديو', href: '/#video-tools', shadowColor: 'rgba(59,130,246,0.25)' },
              { icon: Type, label: 'أدوات النصوص', href: '#', shadowColor: 'rgba(16,185,129,0.25)' },
              { icon: FileText, label: 'أدوات SEO', href: '/#seo-tools', shadowColor: 'rgba(139,92,246,0.25)' },
                { icon: Zap, label: 'أدوات الإنتاجية', href: '/#productivity-tools', shadowColor: 'rgba(234,179,8,0.25)' },
              { icon: Wrench, label: 'أدوات التطوير', href: '#', shadowColor: 'rgba(99,102,241,0.25)' },
              { icon: FileText, label: 'أدوات PDF', href: '/tools/pdf', shadowColor: 'rgba(6,182,212,0.25)' },
            ].map((cat, idx) => (
              <Link key={idx} href={cat.href} className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5" style={{ boxShadow: `0 4px 20px -4px ${cat.shadowColor}` }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <cat.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-sm md:text-base text-slate-900">{cat.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. الأدوات الأكثر شعبية ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">الأدوات الأكثر شعبية</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">الأدوات التي يستخدمها الآلاف يومياً</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Scissors, title: 'إزالة الخلفية بالـ AI', desc: 'أزل خلفية أي صورة بدقة عالية', href: '/tools/background-remover' },
              { icon: Archive, title: 'ضاغط الصور', desc: 'قلّل حجم صورتك مع الحفاظ على الجودة', href: '/tools/image-compressor' },
              { icon: Film, title: 'ضاغط الفيديو', desc: 'ضغط احترافي باستخدام FFmpeg', href: '/tools/video-compressor' },
              { icon: Share2, title: 'محول صيغ الفيديو', desc: 'حوّل بين MP4, WebM, MOV بسهولة', href: '/tools/video-converter' },
            ].map((tool, idx) => (
              <Link key={idx} href={tool.href} className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5" style={{ boxShadow: '0 4px 20px -4px rgba(245,158,11,0.25)' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <tool.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm md:text-base text-slate-900 truncate">{tool.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">أدوات أونلاين مجانية يستخدمها المحترفون</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              تقدم منصة <strong>intooly</strong> مجموعة من <strong>الأدوات الأونلاين المجانية</strong> الأكثر استخداماً من قبل المصممين وصناع المحتوى والمسوقين الرقميين. تشمل أدواتنا الأكثر شعبية <strong>إزالة الخلفية بالذكاء الاصطناعي</strong>، <strong>ضغط الصور</strong> دون فقدان الجودة، <strong>ضغط الفيديو</strong> باستخدام محرك FFmpeg الاحترافي، و<strong>تحويل صيغ الفيديو</strong> بين جميع الصيغ الشائعة مثل MP4 وWebM وMOV.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              جميع هذه الأدوات تعمل <strong>مباشرة في متصفحك</strong> بدون الحاجة لتثبيت أي برامج، وبدون رفع ملفاتك إلى أي سيرفر خارجي، مما يضمن <strong>خصوصية كاملة</strong> وسرعة فائقة في المعالجة.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 4. أدوات الصور ============ */}
      <section id="image-tools" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Image className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">أدوات الصور</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">6 أدوات احترافية لمعالجة الصور</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[
              { icon: Scissors, title: 'إزالة الخلفية AI', href: '/tools/background-remover' },
              { icon: Archive, title: 'ضاغط الصور', href: '/tools/image-compressor' },
              { icon: Palette, title: 'استوديو المنتجات', href: '/tools/product-photo-studio' },
              { icon: Crop, title: 'قص الصور', href: '/tools/image-cropper' },
              { icon: FileType, title: 'تحويل الصيغ', href: '/tools/image-converter' },
              { icon: Maximize, title: 'تغيير الحجم', href: '/tools/image-resizer' },
            ].map((tool, idx) => (
              <Link key={idx} href={tool.href} className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5" style={{ boxShadow: '0 4px 20px -4px rgba(249,115,22,0.25)' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <tool.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{tool.title}</h3>
              </Link>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">أدوات تعديل الصور أونلاين مجاناً</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              مجموعة <strong>أدوات تعديل الصور أونلاين</strong> من intooly مصممة خصيصاً للمصممين، أصحاب المتاجر الإلكترونية، وصناع المحتوى. تتضمن الأدوات <strong>إزالة خلفية الصور بالذكاء الاصطناعي</strong> بدقة عالية باستخدام تقنية U-Net، <strong>ضغط الصور</strong> حتى 80% مع الحفاظ على الجودة الأصلية، و<strong>استوديو صور المنتجات</strong> لإضافة خلفيات احترافية لصور منتجاتك.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              كما نوفر أدوات أساسية مثل <strong>قص الصور</strong> لاختيار الأجزاء المحددة، <strong>تحويل صيغ الصور</strong> بين JPG وPNG وWebP وGIF، و<strong>تغيير حجم الصور</strong> بسهولة وسرعة. جميع هذه الأدوات تعمل <strong>مجاناً 100%</strong> وبدون أي قيود يومية.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              سواء كنت تحتاج إلى <strong>تحسين صور منتجاتك</strong> للتجارة الإلكترونية، أو <strong>تجهيز صور للسوشيال ميديا</strong>، أو <strong>تقليل حجم الصور</strong> لتسريع موقعك، فإن أدوات intooly توفر لك كل ما تحتاجه في مكان واحد.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 5. أدوات الفيديو ============ */}
      <section id="video-tools" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Video className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">أدوات الفيديو</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">5 أدوات متقدمة للفيديو</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {[
              { icon: Archive, title: 'ضاغط الفيديو', href: '/tools/video-compressor' },
              { icon: Share2, title: 'محول الصيغ', href: '/tools/video-converter' },
              { icon: Music, title: 'تحويل إلى صوت', href: '/tools/video-to-audio' },
              { icon: Film, title: 'قص الفيديو', href: '/tools/video-trimmer' },
              { icon: Film, title: 'تحويل إلى GIF', href: '/tools/video-to-gif' },
            ].map((tool, idx) => (
              <Link key={idx} href={tool.href} className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5" style={{ boxShadow: '0 4px 20px -4px rgba(59,130,246,0.25)' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <tool.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{tool.title}</h3>
              </Link>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">أدوات معالجة الفيديو أونلاين مجانية</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              أدوات <strong>معالجة الفيديو أونلاين</strong> من intooly توفر لك حلاً شاملاً لجميع احتياجاتك المتعلقة بالفيديو. يمكنك <strong>ضغط الفيديو</strong> باستخدام محرك FFmpeg الاحترافي لتقليل حجم الملفات مع الحفاظ على الجودة، أو <strong>تحويل صيغ الفيديو</strong> بين جميع الصيغ الشائعة مثل MP4 وWebM وMOV وMKV وAVI.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              كما نوفر أداة <strong>تحويل الفيديو إلى صوت</strong> لاستخراج المسار الصوتي من أي فيديو بصيغ MP3 وWAV وAAC، وأداة <strong>قص الفيديو</strong> لقطع البداية أو النهاية بسرعة فائقة، وأداة <strong>تحويل الفيديو إلى GIF</strong> لصنع صور متحركة من فيديوهاتك.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              جميع أدوات الفيديو تعمل <strong>محلياً في متصفحك</strong> باستخدام تقنية WebAssembly، مما يعني أن فيديوهاتك <strong>لا تُرفع إلى أي سيرفر</strong>، وتتم المعالجة بسرعة فائقة مع خصوصية كاملة.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 5.5. أدوات SEO ============ */}
      {/* ============ 5.5. أدوات PDF ============ */}
      <section id="pdf-tools" className="py-16 bg-gradient-to-br from-ink-50 via-white to-ink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* العنوان */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 flex-shrink-0">
                <div className="absolute inset-0 rounded-lg bg-brand-400/40 blur-xl" />
                <FileText className="relative w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900">أدوات PDF المجانية أونلاين</h2>
            </div>
            <p className="text-base md:text-lg text-ink-600">أفضل أدوات PDF المجانية عبر الإنترنت لتيسير تحرير وضغط واستخراج النصوص</p>
          </div>

          {/* البطاقة الرئيسية */}
          <Link
            href="/tools/pdf"
            className="group flex flex-col items-center justify-center w-full bg-white rounded-2xl p-6 md:p-8 text-center transition-all duration-300 shadow-[0_8px_30px_-8px_rgba(234,179,8,0.3)] hover:shadow-[0_15px_40px_-10px_rgba(234,179,8,0.5)] hover:-translate-y-1"
          >
            <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand-200 transition group-hover:bg-brand-600">
              استكشف جميع الأدوات
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>

          {/* 6 بطاقات التصنيفات - مضغوطة */}
          <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            <Link
              href="/tools/merge-pdf"
              className="group flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center transition-all duration-300 shadow-[0_4px_12px_-3px_rgba(234,179,8,0.35)] hover:bg-brand-600 hover:shadow-[0_8px_20px_-4px_rgba(234,179,8,0.65)] hover:-translate-y-0.5"
            >
              <Merge className="h-4 w-4 text-brand-600 transition-colors group-hover:text-white" />
              <span className="text-xs md:text-sm font-bold text-ink-900 transition-colors group-hover:text-white">دمج</span>
            </Link>

            <Link
              href="/tools/split-pdf"
              className="group flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center transition-all duration-300 shadow-[0_4px_12px_-3px_rgba(234,179,8,0.35)] hover:bg-brand-600 hover:shadow-[0_8px_20px_-4px_rgba(234,179,8,0.65)] hover:-translate-y-0.5"
            >
              <Scissors className="h-4 w-4 text-brand-600 transition-colors group-hover:text-white" />
              <span className="text-xs md:text-sm font-bold text-ink-900 transition-colors group-hover:text-white">تقسيم</span>
            </Link>

            <div className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center opacity-50 cursor-not-allowed shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]">
              <Minimize2 className="h-4 w-4 text-ink-400" />
              <span className="text-xs md:text-sm font-bold text-ink-400">ضغط</span>
              <span className="text-[9px] font-bold text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">قريبًا</span>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center opacity-50 cursor-not-allowed shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]">
              <RotateCw className="h-4 w-4 text-ink-400" />
              <span className="text-xs md:text-sm font-bold text-ink-400">تدوير</span>
              <span className="text-[9px] font-bold text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">قريبًا</span>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-center opacity-50 cursor-not-allowed shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)]">
              <ImagePlus className="h-4 w-4 text-ink-400" />
              <span className="text-xs md:text-sm font-bold text-ink-400">تحويل</span>
              <span className="text-[9px] font-bold text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded">قريبًا</span>
            </div>

            <Link
              href="/tools/pdf"
              className="group flex items-center justify-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-center transition-all duration-300 shadow-[0_4px_12px_-3px_rgba(234,179,8,0.45)] hover:bg-brand-600 hover:shadow-[0_8px_20px_-4px_rgba(234,179,8,0.65)] hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 text-brand-700 transition-colors group-hover:text-white" />
              <span className="text-xs md:text-sm font-bold text-ink-900 transition-colors group-hover:text-white">+20 أداة</span>
            </Link>
          </div>

          {/* محتوى SEO - فقرتان فقط */}
          <div className="mt-10 w-full rounded-2xl bg-white p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.15)]">
            <h2 className="text-lg md:text-xl font-bold text-ink-900 mb-4 flex items-center gap-3">
              <span className="inline-block w-1.5 h-6 rounded-full bg-brand-500" />
              أدوات PDF المجانية أونلاين — أفضل حل للتعامل مع ملفاتك
            </h2>
            <p className="text-sm md:text-base text-ink-700 leading-relaxed mb-4">
              إذا كنت تبحث عن <strong>أدوات PDF المجانية أونلاين</strong> التي تتيح لك التعامل مع ملفات PDF بسهولة وأمان، فأنت في المكان الصحيح. تقدم لك <strong>Intooly</strong> مجموعة متكاملة من <strong>أفضل أدوات PDF المجانية عبر الإنترنت</strong>، تعمل جميعها داخل متصفحك مباشرة، دون الحاجة إلى تحميل أي برامج، أو إنشاء حساب، أو رفع ملفاتك إلى أي خادم خارجي.
            </p>
            <p className="text-sm md:text-base text-ink-700 leading-relaxed">
              تشمل الأدوات <strong>دمج ملفات PDF</strong> المتعددة في مستند واحد، <strong>تقسيم PDF</strong> إلى ملفات أصغر، <strong>ضغط PDF</strong> لتقليل الحجم دون فقدان الجودة، <strong>تدوير الصفحات</strong> لضبط الاتجاه، <strong>تحويل الصور إلى PDF</strong> بسهولة، بالإضافة إلى أكثر من 20 أداة أخرى لتحرير الملفات وحمايتها واستخراج النصوص منها.
            </p>
          </div>
        </div>
      </section>

      <section id="seo-tools" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">أدوات SEO</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">أدوات مجانية لتحسين ترتيبك في محركات البحث</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link href="/tools/keyword-generator" className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5 relative" style={{ boxShadow: '0 4px 20px -4px rgba(139,92,246,0.25)' }}>
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">جديد</span>
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900">مولد الكلمات</h3>
                <p className="text-xs text-slate-600 truncate">اكتشف كلمات مفتاحية طويلة</p>
              </div>
            </Link>

            <Link href="/tools/word-counter" className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5 relative" style={{ boxShadow: '0 4px 20px -4px rgba(16,185,129,0.25)' }}>
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">جديد</span>
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900">عدّاد الكلمات</h3>
                  <p className="text-xs text-slate-600 truncate">تحليل شامل + مؤشر قراءة</p>
                </div>
              </Link>

            

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2.5 opacity-60" style={{ boxShadow: '0 4px 20px -4px rgba(139,92,246,0.25)' }}>
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900">مولد Meta Tags</h3>
                <p className="text-xs text-slate-500">قريباً</p>
              </div>
            </div>
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">أدوات تحسين محركات البحث (SEO) مجانية</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              أدوات <strong>تحسين محركات البحث (SEO)</strong> من intooly تساعدك على تحسين ترتيب موقعك في نتائج Google. أداة <strong>مولد الكلمات المفتاحية</strong> تكتشف مئات الكلمات المفتاحية الطويلة (Long-tail Keywords) من كلمة واحدة فقط، معتمدة على Google Autocomplete مع تصنيف ذكي حسب نية البحث وتجميع تلقائي.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              جرّب أيضاً <strong>عدّاد الكلمات الذكي</strong> لتحليل كثافة الكلمات ومؤشر القراءة، و<strong>مولد Meta Tags</strong> لإنشاء عناوين ووصفات Meta مثالية مع معاينة حية لنتائج محركات البحث (قريباً).
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              باستخدام أدوات SEO من intooly، يمكنك <strong>زيادة الزيارات العضوية</strong> لموقعك، <strong>تحسين محتوى مقالاتك</strong>، و<strong>الوصول إلى جمهورك المستهدف</strong> بشكل أكثر دقة وفعالية.
            </p>
          </div>
        </div>
      </section>

        {/* ============ 5.6. أدوات الإنتاجية ============ */}
        <section id="productivity-tools" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">أدوات الإنتاجية</h2>
              </div>
              <p className="text-base md:text-lg text-slate-600">أدوات عملية لإنجاز مهامك اليومية بكفاءة</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <Link href="/tools/qr-generator" className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5 relative" style={{ boxShadow: '0 4px 20px -4px rgba(234,179,8,0.25)' }}>
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">جديد</span>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <QrCode className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900">مولّد QR Code</h3>
                  <p className="text-xs text-slate-600 truncate">14 نوع QR + تخصيص كامل</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-200">
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                <strong>أدوات الإنتاجية</strong> من intooly تساعدك على إنجاز مهامك اليومية بكفاءة. بدلاً من استخدام أدوات متعددة، تجد كل ما تحتاجه في مكان واحد.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                جميع الأدوات تعمل <strong>محلياً في متصفحك</strong> بدون رفع ملفاتك إلى أي سيرفر، مما يضمن <strong>خصوصية كاملة</strong> وسرعة فائقة.
              </p>
            </div>
          </div>
        </section>

      {/* ============ 6. كل ما تحتاجه لمعالجة ملفاتك ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">كل ما تحتاجه لمعالجة ملفاتك</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              منصة <strong>intooly</strong> تقدم لك مجموعة متكاملة من <strong>الأدوات المجانية عبر الإنترنت</strong> لمعالجة <strong>الصور والفيديو والنصوص</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Image, title: 'أدوات الصور', desc: 'إزالة الخلفية، ضغط، تحويل', href: '/#image-tools', shadowColor: 'rgba(249,115,22,0.25)' },
              { icon: Video, title: 'أدوات الفيديو', desc: 'ضغط، تحويل، قص، GIF', href: '/#video-tools', shadowColor: 'rgba(59,130,246,0.25)' },
              { icon: BarChart3, title: 'أدوات SEO', desc: 'كلمات مفتاحية، Meta Tags', href: '/#seo-tools', shadowColor: 'rgba(139,92,246,0.25)' },
                { icon: Zap, title: 'أدوات الإنتاجية', desc: 'QR Code، أدوات عملية', href: '/#productivity-tools', shadowColor: 'rgba(234,179,8,0.25)' },
              { icon: FileCode, title: 'أدوات المطورين', desc: 'JSON, QR, Base64', href: '#', shadowColor: 'rgba(99,102,241,0.25)' },
            ].map((tool, idx) => (
              <Link key={idx} href={tool.href} className="bg-white border border-slate-200 rounded-xl p-4 hover:-translate-y-0.5 transition-all duration-300 group flex items-center gap-2.5" style={{ boxShadow: `0 4px 20px -4px ${tool.shadowColor}` }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <tool.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{tool.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">منصة متكاملة لمعالجة الملفات أونلاين</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              <strong>intooly</strong> هي <strong>منصة أدوات مجانية عبر الإنترنت</strong> تجمع كل ما تحتاجه لمعالجة ملفاتك في مكان واحد. بدلاً من البحث عن مواقع متعددة وتثبيت برامج معقدة، نقدم لك مجموعة شاملة من <strong>أدوات معالجة الصور</strong>، <strong>أدوات معالجة الفيديو</strong>، <strong>أدوات تحسين SEO</strong>، و<strong>أدوات المطورين</strong>.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              جميع أدواتنا تعمل <strong>مباشرة في متصفحك</strong> بدون رفع ملفاتك إلى أي سيرفر خارجي، مما يضمن <strong>خصوصية كاملة</strong> وسرعة فائقة. لا تحتاج إلى <strong>تسجيل حساب</strong> أو دفع أي اشتراكات، و<strong>لا توجد حدود يومية</strong> على استخدام الأدوات.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              سواء كنت <strong>مصمماً محترفاً</strong>، <strong>صانع محتوى</strong>، <strong>مسوقاً رقمياً</strong>، أو <strong>مطور ويب</strong>، فإن intooly توفر لك الأدوات الاحترافية التي تحتاجها لإنجاز عملك بكفاءة عالية.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 7. لماذا intooly؟ ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">لماذا يختار المستخدمون intooly؟</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">في intooly نؤمن بأن معظم الناس يريدون أداة سريعة، آمنة، ومجانية تعمل مباشرة في المتصفح.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: 'ملفات آمنة', desc: 'لا تغادر جهازك' },
              { icon: Shield, title: 'مجاني بالكامل', desc: 'بدون اشتراكات' },
              { icon: Zap, title: 'بدون تسجيل', desc: 'ابدأ فوراً' },
              { icon: Smartphone, title: 'جميع الأجهزة', desc: 'كمبيوتر وجوال' },
              { icon: Globe, title: 'واجهة عربية', desc: 'مصممة للمستخدم العربي' },
              { icon: Clock, title: 'سرعة فائقة', desc: 'معالجة محلية' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2.5" style={{ boxShadow: '0 4px 20px -4px rgba(245,158,11,0.25)' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <feature.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{feature.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">لماذا intooly هو الخيار الأفضل للأدوات أونلاين؟</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              يتميز <strong>intooly</strong> عن باقي مواقع الأدوات أونلاين بعدة مزايا فريدة. أولاً، <strong>الخصوصية الكاملة</strong>: ملفاتك لا تغادر جهازك أبداً، فجميع المعالجة تتم محلياً في متصفحك باستخدام تقنيات متقدمة مثل WebAssembly والذكاء الاصطناعي.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              ثانياً، <strong>المجانية الحقيقية</strong>: لا نطلب أي اشتراكات، ولا نضع حدوداً يومية على استخدام الأدوات، ولا نضيف علامات مائية على نتائجك. ثالثاً، <strong>السهولة والسرعة</strong>: واجهة عربية سهلة مصممة خصيصاً للمستخدم العربي، مع معالجة فورية لا تتطلب الانتظار.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              رابعاً، <strong>التوافق مع جميع الأجهزة</strong>: أدواتنا تعمل على الكمبيوتر، التابلت، والهاتف المحمول، على جميع المتصفحات الحديثة مثل Chrome وFirefox وSafari وEdge.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 8. كيف تعمل أدواتنا؟ ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">كيف تعمل أدواتنا؟</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">3 خطوات بسيطة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { num: '1', title: 'اختر ملفك', desc: 'اسحب أو اختر من جهازك', icon: Upload },
              { num: '2', title: 'معالجة فورية', desc: 'تعمل في متصفحك', icon: Zap },
              { num: '3', title: 'احصل على النتيجة', desc: 'حمّل فوراً', icon: Download },
            ].map((step, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2.5 relative" style={{ boxShadow: '0 4px 20px -4px rgba(6,182,212,0.25)' }}>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white font-black rounded-full flex items-center justify-center text-xs shadow-lg">{step.num}</div>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <step.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{step.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">تقنية معالجة الملفات محلياً في المتصفح</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              تعتمد أدوات intooly على <strong>تقنيات متقدمة</strong> مثل <strong>WebAssembly</strong> و<strong>Canvas API</strong> و<strong>الذكاء الاصطناعي</strong> لمعالجة ملفاتك مباشرة في متصفحك. هذا يعني أن ملفاتك <strong>لا تُرفع إلى أي سيرفر خارجي</strong>، مما يضمن سرعة فائقة وخصوصية كاملة.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              على عكس المواقع التقليدية التي ترفع ملفاتك إلى سيرفراتها وتعالجها هناك (مما يستغرق وقتاً طويلاً ويشكل خطراً على خصوصيتك)، تعمل أدواتنا <strong>محلياً 100%</strong>، مما يجعل المعالجة <strong>أسرع بـ 3 مرات</strong> على الأقل.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              هذه التقنية تتيح لنا تقديم <strong>أدوات احترافية مجانية</strong> بدون الحاجة إلى بنية تحتية مكلفة، وهو ما ينعكس إيجاباً على المستخدم الذي يحصل على خدمة عالية الجودة بدون أي تكلفة.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 9. ما يميز أدواتنا ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">ما يميز أدواتنا</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">نلتزم بتقديم أفضل تجربة ممكنة</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {[
              { icon: Lock, title: 'بدون رفع للسيرفر', desc: 'ملفاتك تبقى على جهازك' },
              { icon: Shield, title: 'بدون تسجيل', desc: 'ابدأ العمل فوراً' },
              { icon: Zap, title: 'بدون حدود يومية', desc: 'استخدم بلا قيود' },
              { icon: CheckCircle2, title: 'بدون علامات مائية', desc: 'نتائج نظيفة' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2.5" style={{ boxShadow: '0 4px 20px -4px rgba(244,63,94,0.25)' }}>
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <feature.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{feature.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* محتوى SEO */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-3">التزامنا بالجودة والخصوصية</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              في <strong>intooly</strong>، نلتزم بأربعة مبادئ أساسية تميزنا عن المنافسين. <strong>أولاً: بدون رفع للسيرفر</strong> — ملفاتك تبقى على جهازك دائماً، ولا نطلب منك رفع أي ملف إلى خوادمنا. <strong>ثانياً: بدون تسجيل</strong> — ابدأ العمل فوراً دون الحاجة لإنشاء حساب أو إدخال أي بيانات شخصية.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              <strong>ثالثاً: بدون حدود يومية</strong> — استخدم الأدوات بقدر ما تشاء، بدون قيود على عدد الملفات أو حجمها. <strong>رابعاً: بدون علامات مائية</strong> — نتائجك نظيفة واحترافية 100%، بدون أي شعارات أو علامات تجارية تفسد عملك.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              هذه المبادئ تجعل <strong>intooly</strong> الخيار الأمثل للمستخدمين الذين يهتمون <strong>بخصوصيتهم</strong> و<strong>جودة عملهم</strong>، سواء كانوا محترفين أو مبتدئين.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 10. الأسئلة الشائعة ============ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <HelpCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">الأسئلة الشائعة</h2>
            </div>
            <p className="text-base md:text-lg text-slate-600">إجابات للأسئلة الشائعة</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: 'هل الموقع مجاني بالكامل؟', a: 'نعم، جميع أدوات intooly مجانية 100% ولا تتطلب أي اشتراك أو تسجيل.' },
              { q: 'هل بياناتي آمنة؟', a: 'نعم، ملفاتك لا تغادر جهازك أبداً. جميع العمليات تتم محلياً في متصفحك.' },
              { q: 'هل أحتاج لتثبيت برامج؟', a: 'لا، جميع الأدوات تعمل مباشرة في المتصفح دون الحاجة لتثبيت أي برامج.' },
              { q: 'كيف أتواصل مع الدعم؟', a: 'يمكنك التواصل معنا عبر البريد الإلكتروني: support@intooly.com' },
            ].map((faq, idx) => (
              <details key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden group" style={{ boxShadow: '0 4px 20px -4px rgba(100,116,139,0.25)' }}>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-sm text-slate-900">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

            {/* ✅ قسم المقالات الديناميكي من المدونة */}
      <BlogSection />

      {/* ============ Schema Markup للـ SEO ============ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://intooly.com/#website",
                "url": "https://intooly.com",
                "name": "intooly",
                "description": "أدوات مجانية احترافية للصور والفيديو أونلاين",
                "inLanguage": "ar-SA",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://intooly.com/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": "https://intooly.com/#organization",
                "name": "intooly",
                "url": "https://intooly.com",
                "logo": { "@type": "ImageObject", "url": "https://intooly.com/favicon.svg" },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "support@intooly.com",
                  "contactType": "customer support",
                  "inLanguage": "ar-SA"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "هل الموقع مجاني بالكامل؟",
                    "acceptedAnswer": { "@type": "Answer", "text": "نعم، جميع أدوات intooly مجانية 100% ولا تتطلب أي اشتراك أو تسجيل." }
                  },
                  {
                    "@type": "Question",
                    "name": "هل بياناتي آمنة؟",
                    "acceptedAnswer": { "@type": "Answer", "text": "نعم، ملفاتك لا تغادر جهازك أبداً. جميع العمليات تتم محلياً في متصفحك." }
                  }
                ]
              }
            ]
          })
        }}
      />
    </div>
  );
}

