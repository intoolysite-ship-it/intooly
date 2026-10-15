'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

type WpPost = {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string }[];
  };
};

export default function BlogSection() {
  const [posts, setPosts] = useState<WpPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // جلب آخر 4 مقالات من ووردبريس مع الصور المضمنة
    fetch('https://blog.intooly.com/wp-json/wp/v2/posts?per_page=4&_embed=true')
      .then((res) => {
        if (!res.ok) throw new Error('فشل في جلب المقالات');
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('خطأ في جلب المقالات:', err);
        setError(true);
        setLoading(false);
      });
  }, []);

  // دالة لتنظيف النص من وسوم HTML التي يعيدها ووردبريس
  const stripHtml = (html: string, maxLength: number = 100) => {
    const text = html.replace(/<[^>]+>/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // دالة لتعقيم HTML قبل عرضه (تحمي من XSS)
  const sanitizeHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  };

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* عنوان القسم */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-slate-900">أحدث المقالات والأدلة</h2>
          </div>
          <p className="text-base md:text-lg text-slate-600">تعلّم أكثر عن معالجة الصور والفيديو وتحسين محركات البحث</p>
        </div>

        {/* حالة التحميل */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <span className="mr-3 text-slate-600 font-bold">جاري تحميل أحدث المقالات...</span>
          </div>
        )}

        {/* حالة الخطأ */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <AlertCircle className="w-10 h-10 mb-2 text-red-400" />
            <p className="font-bold">تعذر تحميل المقالات حالياً، يرجى المحاولة لاحقاً.</p>
          </div>
        )}

        {/* شبكة المقالات: 2 للموبايل، 3 للتابلت، 4 للديسكتوب */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {posts.map((post) => {
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image';

              return (
                <Link
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* صورة المقال */}
                  <div className="relative h-24 md:h-28 overflow-hidden bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={stripHtml(post.title.rendered, 120)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3
                      className="font-bold text-sm md:text-base text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title.rendered) }}
                    />
                    <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3 flex-1">
                      {stripHtml(post.excerpt.rendered)}
                    </p>

                    <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs mt-auto group-hover:gap-2 transition-all">
                      اقرأ المزيد <ArrowLeft className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* زر عرض جميع المقالات */}
        {!loading && !error && posts.length > 0 && (
          <div className="text-center mt-4">
            <Link
              href="https://blog.intooly.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              عرض جميع المقالات في المدونة <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}