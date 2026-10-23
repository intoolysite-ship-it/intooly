'use client';

/**
 * بطاقة معاينة المشاركة الاجتماعية.
 * تعرض الشكل التقريبي للبطاقة عند مشاركة الرابط على Facebook أو Twitter أو LinkedIn.
 * المعاينة تقديرية.
 */

import type { SocialPreviewProps } from '@/lib/seo-meta-tags/types';

export default function SocialPreviewCard({
  title,
  description,
  url,
  image,
  twitterCard,
  platform,
}: SocialPreviewProps) {
  const displayTitle = title.trim() || 'عنوان المشاركة';
  const displayDescription =
    description.trim() || 'وصف المشاركة سيظهر هنا.';
  const displayUrl = url.trim() || 'example.com';

  const displayDomain = (() => {
    try {
      const urlObj = new URL(
        displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`
      );
      return urlObj.hostname.replace(/^www\./, '');
    } catch {
      return displayUrl;
    }
  })();

  const isLargeImage = twitterCard === 'summary_large_image';

  // ========== Twitter ==========
  if (platform === 'twitter') {
    return (
      <div className="max-w-md rounded-2xl border border-ink-200 bg-white overflow-hidden shadow-sm">
        {image && (
          <div
            className="w-full bg-ink-100"
            style={{ aspectRatio: isLargeImage ? '2 / 1' : '1 / 1', maxHeight: 260 }}
          >
            <img
              src={image}
              alt="معاينة المشاركة"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {!image && (
          <div className="w-full bg-ink-100 flex items-center justify-center text-ink-400 text-sm h-32">
            صورة المشاركة (اختياري)
          </div>
        )}
        <div className="p-3 space-y-1">
          <p className="text-xs text-ink-500">{displayDomain}</p>
          <p className="font-bold text-ink-900 text-sm line-clamp-2">{displayTitle}</p>
          <p className="text-xs text-ink-600 line-clamp-2">{displayDescription}</p>
        </div>
      </div>
    );
  }

  // ========== LinkedIn ==========
  if (platform === 'linkedin') {
    return (
      <div className="max-w-md rounded-lg border border-ink-200 bg-white overflow-hidden shadow-sm">
        {image && (
          <div className="w-full bg-ink-100" style={{ aspectRatio: '1.91 / 1', maxHeight: 220 }}>
            <img
              src={image}
              alt="معاينة المشاركة"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {!image && (
          <div className="w-full bg-ink-100 flex items-center justify-center text-ink-400 text-sm h-32">
            صورة المشاركة (موصى بها 1200×627)
          </div>
        )}
        <div className="p-3 space-y-1">
          <p className="font-bold text-ink-900 text-sm line-clamp-2">{displayTitle}</p>
          <p className="text-xs text-ink-500">{displayDomain}</p>
        </div>
      </div>
    );
  }

  // ========== Facebook (افتراضي) ==========
  return (
    <div className="max-w-md rounded-lg border border-ink-200 bg-white overflow-hidden shadow-sm">
      {image && (
        <div className="w-full bg-ink-100" style={{ aspectRatio: '1.91 / 1', maxHeight: 220 }}>
          <img
            src={image}
            alt="معاينة المشاركة"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      {!image && (
        <div className="w-full bg-ink-100 flex items-center justify-center text-ink-400 text-sm h-32">
          صورة المشاركة (موصى بها 1200×630)
        </div>
      )}
      <div className="px-3 py-2 bg-ink-50 border-t border-ink-200">
        <p className="text-[10px] uppercase text-ink-500 tracking-wide">{displayDomain}</p>
        <p className="font-bold text-ink-900 text-sm line-clamp-2">{displayTitle}</p>
        <p className="text-xs text-ink-600 line-clamp-2">{displayDescription}</p>
      </div>
    </div>
  );
}
