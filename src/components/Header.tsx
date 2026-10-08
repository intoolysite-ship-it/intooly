'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, Menu, X, ChevronDown, Zap, Star, 
  Image as ImageIcon, Video, FileText, Code
} from 'lucide-react';

type ToolItem = {
  name: string;
  href: string;
  hot?: boolean;
  star?: boolean;
};

const BLOG_URL = 'https://blog.intooly.com';

const TOOLS_MENU: Record<string, { icon: any; title: string; color: string; items: ToolItem[] }> = {
  image: {
    icon: ImageIcon,
    title: 'أدوات الصور',
    color: 'from-brand-500 to-brand-600',
    items: [
      { name: 'إزالة الخلفية بالـ AI', href: '/tools/background-remover', hot: true },
      { name: 'ضاغط الصور', href: '/tools/image-compressor' },
      { name: 'تغيير حجم الصور', href: '/tools/image-resizer' },
      { name: 'تحويل صيغ الصور', href: '/tools/image-converter' },
      { name: 'قص الصور', href: '/tools/image-cropper' },
      { name: 'استوديو صور المنتجات', href: '/tools/product-photo-studio', star: true },
    ],
  },
    video: {
    icon: Video,
    title: 'أدوات الفيديو',
    color: 'from-ink-700 to-ink-900',
    items: [
      { name: 'ضاغط الفيديو', href: '/tools/video-compressor' },
      { name: 'محول صيغ الفيديو', href: '/tools/video-converter' },
      { name: 'تحويل الفيديو إلى صوت', href: '/tools/video-to-audio', hot: true }, // ✅ هذا هو الرابط الفعلي للمجلد
      { name: 'قص الفيديو', href: '/tools/video-trimmer' },
      { name: 'فيديو إلى GIF', href: '/tools/video-to-gif' },
    ],
  },
  text: {
    icon: FileText,
    title: 'أدوات النصوص والـ SEO',
    color: 'from-emerald-500 to-emerald-700',
    items: [
      { name: 'عداد الكلمات', href: '/tools/word-counter' },
      { name: 'تنظيف النصوص', href: '/tools/text-cleaner' },
      { name: 'إزالة التشكيل', href: '/tools/diacritics-remover' },
      { name: 'مولد Meta Tags', href: '/tools/meta-generator' },
    ],
  },
  dev: {
    icon: Code,
    title: 'أدوات المطورين',
    color: 'from-indigo-500 to-indigo-700',
    items: [
      { name: 'JSON Formatter', href: '/tools/json-formatter' },
      { name: 'مولد QR Code', href: '/tools/qr-generator' },
      { name: 'Base64 Encoder', href: '/tools/base64' },
      { name: 'Color Picker', href: '/tools/color-picker' },
    ],
  },
};

export default function Header() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // كشف التمرير
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إغلاق البحث عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // فلترة نتائج البحث
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      const allTools = Object.values(TOOLS_MENU).flatMap(cat => cat.items);
      const filtered = allTools.filter(tool => tool.name.toLowerCase().includes(query));
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // إغلاق Mega Menu عند تغيير الصفحة
  const closeMegaMenu = () => setMegaMenuOpen(false);

  return (
    <>
      <header 
        ref={headerRef}
        onMouseLeave={() => setMegaMenuOpen(false)}
        className={`sticky top-0 z-50 transition-all duration-300 relative ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm' 
            : 'bg-white'
        }`}
      >
        {/* الخط الفاصل - رمادي فاتح يشبه الشادو */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200/80"></div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* 1. الشعار - مع إغلاق الميجا مينو عند المرور */}
            <div 
              onMouseEnter={() => setMegaMenuOpen(false)}
              className="flex-shrink-0"
            >
              <Link 
                href="/" 
                className="flex items-center gap-3 group" 
                aria-label="intooly - الصفحة الرئيسية"
              >
                <div className="relative w-14 h-14 rounded-xl bg-ink-900 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-ink-900 leading-tight">intooly</span>
                  <span className="text-sm font-bold text-ink-600 leading-tight mt-0.5">أدوات مجانية احترافية</span>
                </div>
              </Link>
            </div>
            
            {/* 2. الصفحات الرئيسية + زر الأدوات */}
            <nav className="hidden lg:flex items-center gap-1 text-ink-700 mx-auto">
              
              {/* زر الأدوات - يفتح الـ Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
              >
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-ink-100 transition-colors font-bold text-base">
                  <Zap className="w-4 h-4 text-brand-500" />
                  الأدوات
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              <a 
                href={BLOG_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                onMouseEnter={() => setMegaMenuOpen(false)}
                className="px-4 py-2 rounded-lg hover:bg-ink-100 transition-colors flex items-center gap-1 font-bold text-base"
              >
                المدونة
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <Link 
                href="/about" 
                onMouseEnter={() => setMegaMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-brand-600 font-bold text-base hover:bg-ink-100 transition-colors"
              >
                من نحن
              </Link>
              <Link 
                href="/contact" 
                onMouseEnter={() => setMegaMenuOpen(false)}
                className="px-4 py-2 rounded-lg font-bold text-base hover:bg-ink-100 transition-colors"
              >
                اتصل بنا
              </Link>
            </nav>
            
            {/* 3. مربع البحث والأدوات */}
            <div className="flex items-center gap-3" onMouseEnter={() => setMegaMenuOpen(false)}>
              <div ref={searchRef} className="relative hidden sm:block">
                <input 
                  type="search" 
                  placeholder="🔍 ابحث عن أداة..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-40 md:w-56 px-4 py-2 rounded-full border border-ink-300 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 bg-ink-50 transition"
                />
                
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-ink-200 overflow-hidden z-50">
                    {searchResults.map((tool, idx) => (
                      <Link
                        key={idx}
                        href={tool.href}
                        onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors border-b border-ink-100 last:border-0"
                      >
                        <Zap className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-medium text-ink-800">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="فتح القائمة"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============= Mega Menu بعرض كامل الشاشة ============= */}
        {megaMenuOpen && (
          <div
            className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-t border-ink-200 shadow-2xl z-40"
            onMouseEnter={() => setMegaMenuOpen(true)}
          >
            <div className="container mx-auto px-6 py-6">
              <div className="grid grid-cols-4 gap-8">
                {Object.entries(TOOLS_MENU).map(([key, category]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md`}>
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-extrabold text-ink-900 text-base">
                        {category.title}
                      </h3>
                    </div>
                    <ul className="space-y-1">
                      {category.items.map((item, i) => (
                        <li key={i}>
                          <Link
                            href={item.href}
                            onClick={() => setMegaMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-ink-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          >
                            <span className="font-medium">{item.name}</span>
                            <div className="flex gap-1">
                              {item.hot && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-600">جديد</span>}
                              {item.star && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">مميز</span>}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-ink-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ink-600 font-medium">
                  <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                  <span>كل الأدوات مجانية، محلية، وتعمل بدون تسجيل</span>
                </div>
                <Link 
                  href="/#tools" 
                  onClick={() => setMegaMenuOpen(false)}
                  className="text-sm font-black text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                >
                  عرض كل الأدوات <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============= قائمة الجوال ============= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-ink-200 flex items-center justify-between">
              <span className="font-extrabold text-xl text-ink-900">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-ink-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {Object.entries(TOOLS_MENU).map(([key, category]) => (
                <details key={key} className="group border border-ink-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-ink-50 font-bold text-ink-900">
                    <category.icon className="w-5 h-5 text-brand-500" />
                    <span>{category.title}</span>
                    <ChevronDown className="w-4 h-4 mr-auto group-open:rotate-180 transition-transform text-ink-400" />
                  </summary>
                  <ul className="bg-ink-50 py-2 space-y-1">
                    {category.items.map((item, i) => (
                      <li key={i}>
                        <Link href={item.href} onClick={() => setMobileMenuOpen(false)} className="block px-6 py-2.5 text-sm text-ink-600 hover:text-brand-600 hover:bg-white transition-colors">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              <div className="pt-4 space-y-2">
                <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl font-bold hover:bg-ink-100">المدونة ↗</a>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-xl font-bold text-brand-600">من نحن</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-xl font-bold hover:bg-ink-100">اتصل بنا</Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}