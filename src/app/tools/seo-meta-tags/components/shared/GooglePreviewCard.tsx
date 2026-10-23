'use client';

/**
 * بطاقة معاينة نتيجة Google.
 * تعرض العنوان والوصف والرابط كما قد تظهر في البحث.
 * المعاينة تقديرية ولا تعكس بدقة ما ستعرضه Google.
 */

import type { GooglePreviewProps } from '@/lib/seo-meta-tags/types';

export default function GooglePreviewCard({
  title,
  description,
  url,
  mode = 'desktop',
}: GooglePreviewProps) {
  const fallbackTitle = 'عنوان الصفحة سيظهر هنا';
  const fallbackDescription =
    'وصف الصفحة سيظهر هنا. اكتب وصفًا واضحًا يشرح محتوى الصفحة في 160 حرفًا أو أقل.';
  const fallbackUrl = 'example.com › صفحة';

  // عرض العنوان والوصف مع اقتطاع تقديري (ليس دقيقًا 100%)
  const displayTitle = title.trim() || fallbackTitle;
  const displayDescription = description.trim() || fallbackDescription;

  const formatUrl = (rawUrl: string): string => {
    if (!rawUrl.trim()) return fallbackUrl;

    try {
      const urlObj = new URL(
        rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
      );
      const host = urlObj.hostname.replace(/^www\./, '');
      const path = urlObj.pathname === '/' ? '' : ` › ${urlObj.pathname}`;
      return `${host}${path}`;
    } catch {
      return rawUrl;
    }
  };

  const displayUrl = formatUrl(url);

  const isMobile = mode === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'max-w-full rounded-lg border border-ink-100 bg-white p-3 space-y-1'
          : 'max-w-[600px] rounded-lg border border-ink-100 bg-white p-4 space-y-1'
      }
    >
      {/* شريط URL */}
      <div
        className={`flex items-center gap-1.5 ${
          isMobile ? 'text-[11px]' : 'text-xs'
        } text-ink-600`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-100 text-[10px]">
          🌐
        </span>
        <span className="truncate font-medium">{displayUrl}</span>
      </div>

      {/* العنوان */}
      <h3
        className={`text-[#1a0dab] hover:underline cursor-pointer ${
          isMobile ? 'text-[16px] leading-6' : 'text-[18px] leading-6'
        } font-medium line-clamp-2`}
        style={{ fontFamily: 'arial, sans-serif' }}
      >
        {displayTitle}
      </h3>

      {/* الوصف */}
      <p
        className={`text-[#4d5156] ${
          isMobile ? 'text-[13px] leading-5' : 'text-[14px] leading-5'
        } line-clamp-2`}
        style={{ fontFamily: 'arial, sans-serif' }}
      >
        {displayDescription}
      </p>

      {/* تنبيه */}
      <p className="text-[10px] text-ink-400 pt-1 border-t border-ink-100">
        معاينة تقديرية — قد تختلف النتيجة الفعلية في Google.
      </p>
    </div>
  );
}
