'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Zap, FileText, ArrowLeft } from 'lucide-react';

type SearchItem = {
  name: string;
  href: string;
  description?: string;
  category: 'tool' | 'page' | 'article';
};

const SEARCH_ITEMS: SearchItem[] = [
  // ============ أدوات PDF ============
  { name: 'دمج PDF', href: '/tools/merge-pdf', description: 'دمج ملفات PDF في ملف واحد', category: 'tool' },
  { name: 'تقسيم PDF', href: '/tools/split-pdf', description: 'تقسيم PDF إلى ملفات أصغر', category: 'tool' },
  { name: 'تدوير PDF', href: '/tools/rotate-pdf', description: 'تدوير صفحات PDF', category: 'tool' },
  { name: 'ضغط PDF', href: '/tools/compress-pdf', description: 'تقليل حجم ملف PDF', category: 'tool' },
  { name: 'JPG إلى PDF', href: '/tools/jpg-to-pdf', description: 'تحويل الصور إلى PDF', category: 'tool' },
  { name: 'PDF إلى JPG', href: '/tools/pdf-to-jpg', description: 'تحويل PDF إلى صور', category: 'tool' },
  { name: 'حذف صفحات PDF', href: '/tools/delete-pdf-pages', description: 'حذف صفحات من PDF', category: 'tool' },
  { name: 'استخراج صفحات PDF', href: '/tools/extract-pdf-pages', description: 'استخراج صفحات محددة', category: 'tool' },
  { name: 'ترتيب صفحات PDF', href: '/tools/organize-pdf', description: 'إعادة ترتيب صفحات PDF', category: 'tool' },
  { name: 'علامة مائية PDF', href: '/tools/watermark-pdf', description: 'إضافة علامة مائية', category: 'tool' },
  { name: 'أدوات PDF', href: '/tools/pdf', description: 'جميع أدوات PDF', category: 'page' },

  // ============ أدوات الصور ============
  { name: 'إزالة الخلفية بالـ AI', href: '/tools/background-remover', description: 'إزالة خلفية الصور', category: 'tool' },
  { name: 'ضاغط الصور', href: '/tools/image-compressor', description: 'تقليل حجم الصور', category: 'tool' },
  { name: 'تغيير حجم الصور', href: '/tools/image-resizer', description: 'تغيير أبعاد الصور', category: 'tool' },
  { name: 'تحويل صيغ الصور', href: '/tools/image-converter', description: 'تحويل بين صيغ الصور', category: 'tool' },
  { name: 'قص الصور', href: '/tools/image-cropper', description: 'قص أجزاء من الصور', category: 'tool' },
  { name: 'استوديو صور المنتجات', href: '/tools/product-photo-studio', description: 'خلفيات احترافية للمنتجات', category: 'tool' },

  // ============ أدوات الفيديو ============
  { name: 'ضاغط الفيديو', href: '/tools/video-compressor', description: 'تقليل حجم الفيديو', category: 'tool' },
  { name: 'محول صيغ الفيديو', href: '/tools/video-converter', description: 'تحويل بين صيغ الفيديو', category: 'tool' },
  { name: 'تحويل الفيديو إلى صوت', href: '/tools/video-to-audio', description: 'استخراج الصوت', category: 'tool' },
  { name: 'قص الفيديو', href: '/tools/video-trimmer', description: 'قص أجزاء من الفيديو', category: 'tool' },
  { name: 'تحويل الفيديو إلى GIF', href: '/tools/video-to-gif', description: 'صنع GIF من الفيديو', category: 'tool' },

  // ============ أدوات أخرى ============
  { name: 'مولّد QR Code', href: '/tools/qr-generator', description: 'إنشاء رموز QR', category: 'tool' },
  { name: 'مولّد الصور بالذكاء الاصطناعي', href: '/tools/ai-image-generator', description: 'توليد الصور', category: 'tool' },
  { name: 'مولّد الكلمات المفتاحية', href: '/tools/keyword-generator', description: 'استخراج كلمات مفتاحية', category: 'tool' },
  { name: 'عدّاد الكلمات', href: '/tools/word-counter', description: 'تحليل النصوص', category: 'tool' },

  // ============ الصفحات ============
  { name: 'الرئيسية', href: '/', description: 'الصفحة الرئيسية', category: 'page' },
  { name: 'من نحن', href: '/about', description: 'تعرّف على Intooly', category: 'page' },
  { name: 'اتصل بنا', href: '/contact', description: 'تواصل معنا', category: 'page' },
  { name: 'سياسة الخصوصية', href: '/privacy-policy', description: 'سياسة الخصوصية', category: 'page' },
  { name: 'شروط الاستخدام', href: '/terms', description: 'شروط الاستخدام', category: 'page' },
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ============ البحث ============
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = SEARCH_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    ).slice(0, 6);

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query]);

  // ============ إغلاق عند النقر خارجًا ============
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============ لوحة المفاتيح ============
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      window.location.href = results[selectedIndex].href;
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setQuery('');
    }
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setIsFocused(false);
  }

  const showDropdown = isFocused && query.trim().length >= 3;

  return (
    <div ref={wrapperRef} className="relative max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="ابحث عن أداة، مثل ضغط الصور أو تحويل PDF..."
          className="w-full pr-11 pl-4 py-3 md:py-3.5 rounded-xl border-2 border-ink-200 bg-white text-sm md:text-base focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition shadow-sm"
          aria-label="البحث في الأدوات"
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-ink-200 shadow-2xl overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((item, idx) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={clearSearch}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-ink-100 last:border-0 ${
                      idx === selectedIndex ? 'bg-brand-50' : 'hover:bg-brand-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center">
                      {item.category === 'tool' ? (
                        <Zap className="w-4 h-4 text-brand-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-bold text-ink-900 truncate">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-xs text-ink-500 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ArrowLeft className="w-4 h-4 text-ink-400 flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-bold text-ink-700 mb-1">
                لا توجد نتائج
              </p>
              <p className="text-xs text-ink-500">
                جرّب كلمات أخرى أو تصفّح الأدوات
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
