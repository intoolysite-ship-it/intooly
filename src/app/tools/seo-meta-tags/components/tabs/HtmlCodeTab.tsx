'use client';

/**
 * تبويب كود HTML — عرض الكود الكامل للوسوم مع إمكانية النسخ.
 */

import { useMemo } from 'react';
import type { MetaTagsState } from '@/lib/seo-meta-tags/types';
import { generateMetaTags } from '@/lib/seo-meta-tags/engine';
import { DISCLAIMER_MESSAGES } from '@/lib/seo-meta-tags/constants';
import CopyButton from '../shared/CopyButton';
import { Code2, Info } from 'lucide-react';

interface HtmlCodeTabProps {
  state: MetaTagsState;
}

export default function HtmlCodeTab({ state }: HtmlCodeTabProps) {
  const generated = useMemo(() => generateMetaTags(state), [state]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          ملاحظة
        </p>
        <p className="text-xs mt-1">{DISCLAIMER_MESSAGES.previewGuide}</p>
      </div>

      {/* الكود الكامل */}
      <div className="rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between bg-ink-100 px-4 py-2 border-b border-ink-200">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink-700">
            <Code2 className="w-4 h-4" />
            <span>الكود الكامل (HTML)</span>
          </div>
          <CopyButton text={generated.fullHtml} label="نسخ الكود" size="sm" />
        </div>
        <pre className="p-4 text-xs text-ink-800 overflow-x-auto font-mono whitespace-pre-wrap break-all" dir="ltr">
          {generated.fullHtml || '<!-- ابدأ بملء الحقول في تبويب Meta Tags -->'}
        </pre>
      </div>

      {/* كود كل وسم منفصل */}
      <div className="space-y-3">
        {[
          { label: 'Title Tag', code: generated.titleTag },
          { label: 'Meta Description', code: generated.descriptionTag },
          { label: 'Robots', code: generated.robotsTag },
          { label: 'Canonical', code: generated.canonicalTag },
          { label: 'Open Graph', code: generated.openGraphTags },
          { label: 'Twitter Card', code: generated.twitterCardTags },
        ]
          .filter((item) => item.code)
          .map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-ink-200 bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between bg-ink-50 px-3 py-1.5 border-b border-ink-200">
                <span className="text-xs font-bold text-ink-700">
                  {item.label}
                </span>
                <CopyButton text={item.code} label="نسخ" size="sm" variant="ghost" />
              </div>
              <pre className="p-3 text-[11px] text-ink-800 overflow-x-auto font-mono whitespace-pre-wrap break-all" dir="ltr">
                {item.code}
              </pre>
            </div>
          ))}
      </div>
    </div>
  );
}
