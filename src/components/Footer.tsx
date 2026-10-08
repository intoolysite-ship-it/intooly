import Link from 'next/link';
import { 
  Mail, Scissors, Archive, Film, Share2, Palette, 
  ArrowLeft, Send, Sparkles
} from 'lucide-react';

export default function Footer() {
  return (
    // ✅ تم الإبقاء على overflow-x-hidden لمنع التمرير الأفقي نهائياً
    <div className="w-full overflow-x-hidden">
      
      {/* ✅ خط فاصل أنيق - يمتد بعرض الشاشة بالكامل */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]"></div>
        </div>
      </div>

      {/* ============ الفوتر الرئيسي ============ */}
      <footer className="bg-[#E6E6E6] text-ink-900 py-8 md:py-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
            
            {/* ========== العمود الأول: عن الموقع ========== */}
            <div className="space-y-3 min-w-0"> 
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="relative w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center shadow-md group-hover:shadow-[0_0_15px_rgba(245,158,11,0.6)] transition-all duration-300 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-white">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#E6E6E6]"></div>
                </div>
                <h3 className="text-3xl font-black text-slate-800 group-hover:text-amber-600 transition-colors truncate">intooly</h3>
              </div>
              
              <p className="text-base font-bold text-amber-600 mt-1">أدوات مجانية احترافية</p>
              <p className="text-sm text-ink-700 leading-relaxed break-words">
                نقدم لك مجموعة متكاملة من الأدوات المجانية لمعالجة الصور والفيديو والنصوص. جميع أدواتنا تعمل محلياً في متصفحك لضمان خصوصيتك الكاملة.
              </p>
            </div>

            {/* ========== العمود الثاني: خدماتنا ========== */}
            <div className="min-w-0">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full flex-shrink-0"></span>
                خدماتنا
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'من نحن', href: '/about' },
                  { label: 'اتصل بنا', href: '/contact' },
                  { label: 'سياسة الخصوصية', href: '/privacy-policy' },
                  { label: 'شروط الاستخدام', href: '/terms' },
                  { label: 'إخلاء المسؤولية', href: '/disclaimer' },
                  { label: 'سياسة الكوكيز', href: '/cookie-policy' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link 
                      href={item.href} 
                      className="text-base text-ink-700 hover:text-amber-600 hover:pr-1 transition-all flex items-center gap-2 group whitespace-nowrap"
                    >
                      <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ========== العمود الثالث: أشهر الأدوات ========== */}
            <div className="min-w-0">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full flex-shrink-0"></span>
                أشهر الأدوات
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: Scissors, label: 'إزالة الخلفية بالـ AI', href: '/tools/background-remover' },
                  { icon: Archive, label: 'ضاغط الصور', href: '/tools/image-compressor' },
                  { icon: Film, label: 'ضاغط الفيديو', href: '/tools/video-compressor' },
                  { icon: Share2, label: 'محول صيغ الفيديو', href: '/tools/video-converter' },
                  { icon: Palette, label: 'استوديو صور المنتجات', href: '/tools/product-photo-studio' },
                ].map((tool, i) => (
                  <li key={i}>
                    <Link 
                      href={tool.href} 
                      className="text-base text-ink-700 hover:text-amber-600 hover:pr-1 transition-all flex items-center gap-2 group whitespace-nowrap"
                    >
                      <tool.icon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                      <span className="truncate">{tool.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ========== العمود الرابع: اشترك معنا ========== */}
            <div className="min-w-0">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full flex-shrink-0"></span>
                اشترك معنا
              </h3>
              <p className="text-sm text-ink-700 mb-4 leading-relaxed">
                احصل على آخر الأدوات والتحديثات مباشرة في بريدك الإلكتروني.
              </p>

              {/* ✅ نموذج Mailchimp النظيف */}
              <form
                action="https://intooly.us22.list-manage.com/subscribe/post?u=1e0523d1cd39eb21f8242d76f&id=9dc1fd8505"
                method="post"
                target="_blank"
                className="space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500 pointer-events-none" />
                  <input
                    type="email"
                    name="EMAIL"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    className="w-full pr-11 pl-4 py-3 text-base rounded-lg border border-ink-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                  />
                </div>

                {/* ✅ حقل الحماية (Honeypot) — display:none بدل left:-5000px */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="b_1e0523d1cd39eb21f8242d76f_9dc1fd8505"
                    tabIndex={-1}
                    value=""
                    readOnly
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-base"
                >
                  <Send className="w-5 h-5" />
                  اشترك الآن
                </button>
              </form>

              {/* ✅ الجملة التحفيزية */}
              <p className="text-xs text-ink-600 mt-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                كن أول من يعرف الجديد والمميز
              </p>
            </div>

          </div>
        </div>

        {/* ============ Footer Bottom ============ */}
        <div className="border-t border-ink-300/50 mt-8 pt-6 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* حقوق النشر + رابط الموقع الرسمي */}
              <a 
                href="https://intooly.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-ink-700 hover:text-amber-600 transition-colors text-center md:text-right whitespace-nowrap"
              >
                © 2026 intooly. جميع الحقوق محفوظة.
              </a>

              {/* الإيميل الرسمي */}
              <a
                href="mailto:support@intooly.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-ink-300 rounded-full text-sm font-bold text-ink-900 hover:border-amber-500 hover:text-amber-600 transition-all shadow-sm whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                support@intooly.com
              </a>

              {/* روابط سريعة */}
              <div className="flex items-center gap-4 text-sm">
                <Link href="/privacy-policy" className="text-ink-700 hover:text-amber-600 transition whitespace-nowrap">الخصوصية</Link>
                <span className="text-ink-400">•</span>
                <Link href="/terms" className="text-ink-700 hover:text-amber-600 transition whitespace-nowrap">الشروط</Link>
                <span className="text-ink-400">•</span>
                <Link href="/contact" className="text-ink-700 hover:text-amber-600 transition whitespace-nowrap">اتصل بنا</Link>
              </div>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}