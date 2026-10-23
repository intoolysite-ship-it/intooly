'use client';

/**
 * مكون تفاعلي لإصلاح الصور التي ينقصها Alt.
 * يعرض: معاينة الصورة، الرابط الكامل، حقل Alt، وكود الإصلاح.
 */

import { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Link2,
} from 'lucide-react';

interface BrokenImage {
  index: number;
  src: string;
  originalSrc: string;
  currentAlt: string;
  outerHTML: string;
}

interface ImagesAltFixerProps {
  imagesData: string;
}

export default function ImagesAltFixer({ imagesData }: ImagesAltFixerProps) {
  let images: BrokenImage[] = [];
  try {
    images = JSON.parse(imagesData);
  } catch {
    return <p className="text-sm text-red-600">تعذّرت قراءة بيانات الصور.</p>;
  }

  const [alts, setAlts] = useState<Record<number, string>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);

  const generatedCodes = useMemo(() => {
    const codes: Record<number, string> = {};
    images.forEach((img) => {
      const alt = alts[img.index] || '';
      const hasAlt = img.currentAlt !== '';
      if (alt.trim()) {
        if (hasAlt) {
          codes[img.index] = img.outerHTML.replace(
            /alt="[^"]*"/i,
            `alt="${alt}"`
          );
        } else {
          codes[img.index] = img.outerHTML.replace(
            /(<img[^>]*?)(\/?>)/i,
            `$1 alt="${alt}" $2`
          );
        }
      } else {
        codes[img.index] = img.outerHTML;
      }
    });
    return codes;
  }, [alts, images]);

  const handleCopy = async (index: number) => {
    const code = generatedCodes[index];
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {}
  };

  const handleCopyUrl = async (index: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrlIndex(index);
      setTimeout(() => setCopiedUrlIndex(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="flex items-center gap-1.5 font-bold">
          <AlertCircle className="h-3.5 w-3.5" />
          {images.length} صورة تحتاج إلى Alt
        </p>
        <p className="mt-1">
          أدخل وصفًا لكل صورة، ثم انسخ الكود المُولَّد واستبدله في HTML صفحتك.
        </p>
      </div>

      {images.map((img) => (
        <div
          key={img.index}
          className="rounded-lg border-2 border-ink-200 bg-white p-3 space-y-3"
        >
          {/* Header: صورة + رابط */}
          <div className="flex items-start gap-3">
            <a
              href={img.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-ink-100 overflow-hidden hover:opacity-80 transition-opacity"
              title="فتح الصورة"
            >
              {img.src && !img.src.startsWith('data:') ? (
                <img
                  src={img.src}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<svg class="h-6 w-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                    }
                  }}
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-ink-400" />
              )}
            </a>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-ink-500">
                صورة #{img.index}
              </p>
              <p
                className="mt-1 text-xs text-ink-700 break-all font-mono"
                dir="ltr"
              >
                {img.src || '(بدون src)'}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <a
                  href={img.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-1 text-[10px] font-bold text-ink-700 hover:bg-ink-200"
                >
                  <ExternalLink className="h-3 w-3" />
                  فتح الصورة
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(img.index, img.src)}
                  className="inline-flex items-center gap-1 rounded bg-ink-100 px-2 py-1 text-[10px] font-bold text-ink-700 hover:bg-ink-200"
                >
                  {copiedUrlIndex === img.index ? (
                    <>
                      <Check className="h-3 w-3" />
                      تم
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3 w-3" />
                      نسخ الرابط
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* حقل Alt */}
          <div>
            <label className="text-xs font-bold text-ink-700 mb-1 block">
              النص البديل (Alt):
            </label>
            <input
              type="text"
              value={alts[img.index] || ''}
              onChange={(e) =>
                setAlts({ ...alts, [img.index]: e.target.value })
              }
              placeholder="مثال: صورة توضح معاني أسماء البنات"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* كود الإصلاح */}
          {alts[img.index]?.trim() && (
            <div className="rounded-lg border border-ink-200 bg-ink-900 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-ink-800 border-b border-ink-700">
                <span className="text-[10px] font-bold text-ink-300 uppercase">
                  الكود المُولَّد
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(img.index)}
                  className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-[10px] font-bold text-white hover:bg-ink-600"
                >
                  {copiedIndex === img.index ? (
                    <>
                      <Check className="h-3 w-3" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      نسخ الكود
                    </>
                  )}
                </button>
              </div>
              <pre
                className="p-3 text-[11px] text-ink-100 overflow-x-auto font-mono"
                dir="ltr"
              >
                {generatedCodes[img.index]}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
