'use client';

/**
 * تبويب معاينة Google — عرض النتيجة كما قد تظهر في البحث.
 */

import { useState } from 'react';
import type { MetaTagsState } from '@/lib/seo-meta-tags/types';
import { DISCLAIMER_MESSAGES } from '@/lib/seo-meta-tags/constants';
import GooglePreviewCard from '../shared/GooglePreviewCard';
import { Monitor, Smartphone, Info } from 'lucide-react';

interface GooglePreviewTabProps {
  state: MetaTagsState;
}

export default function GooglePreviewTab({ state }: GooglePreviewTabProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          معاينة تقديرية
        </p>
        <p className="text-xs mt-1">{DISCLAIMER_MESSAGES.previewGuide}</p>
      </div>

      {/* مفتاح التبديل */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition ${
            mode === 'desktop'
              ? 'bg-brand-600 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          سطح المكتب
        </button>
        <button
          type="button"
          onClick={() => setMode('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition ${
            mode === 'mobile'
              ? 'bg-brand-600 text-white'
              : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          الجوال
        </button>
      </div>

      {/* المعاينة */}
      <div
        className={`mx-auto ${
          mode === 'mobile'
            ? 'max-w-[375px] rounded-2xl border-4 border-ink-300 bg-white p-3'
            : ''
        }`}
      >
        <GooglePreviewCard
          title={state.title}
          description={state.description}
          url={state.url}
          mode={mode}
        />
      </div>
    </div>
  );
}
