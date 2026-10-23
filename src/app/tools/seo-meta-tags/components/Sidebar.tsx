'use client';

/**
 * الشريط الجانبي — معاينة فورية + مؤشرات الطول + أزرار سريعة.
 * يظهر على الكمبيوتر، وينتقل إلى الأعلى/الأسفل على الجوال.
 */

import type { MetaTagsState } from '@/lib/seo-meta-tags/types';
import {
  checkTitleLength,
  checkDescriptionLength,
  generateMetaTags,
} from '@/lib/seo-meta-tags/engine';
import {
  LENGTH_COLORS,
  LENGTH_LIMITS,
} from '@/lib/seo-meta-tags/constants';
import GooglePreviewCard from './shared/GooglePreviewCard';
import CopyButton from './shared/CopyButton';
import { Eye, BarChart3, Zap } from 'lucide-react';

interface SidebarProps {
  state: MetaTagsState;
}

function MiniIndicator({
  label,
  charCount,
  max,
  color,
}: {
  label: string;
  charCount: number;
  max: number;
  color: keyof typeof LENGTH_COLORS;
}) {
  const percentage = Math.min(100, (charCount / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-ink-700">{label}</span>
        <span className="font-bold" style={{ color: LENGTH_COLORS[color] }}>
          {charCount}/{max}
        </span>
      </div>
      <div className="w-full bg-ink-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: LENGTH_COLORS[color],
          }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ state }: SidebarProps) {
  const titleCheck = checkTitleLength(state.title);
  const descriptionCheck = checkDescriptionLength(state.description);
  const generated = generateMetaTags(state);

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      {/* معاينة Google */}
      <div className="rounded-xl border-2 border-ink-200 bg-white p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
          <Eye className="w-4 h-4" />
          <span>معاينة Google</span>
        </div>
        <GooglePreviewCard
          title={state.title}
          description={state.description}
          url={state.url}
          mode="desktop"
        />
      </div>

      {/* مؤشرات الطول */}
      <div className="rounded-xl border-2 border-ink-200 bg-white p-3 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
          <BarChart3 className="w-4 h-4" />
          <span>مؤشرات الطول</span>
        </div>
        <MiniIndicator
          label="العنوان"
          charCount={titleCheck.charCount}
          max={LENGTH_LIMITS.title.max}
          color={titleCheck.color}
        />
        <MiniIndicator
          label="الوصف"
          charCount={descriptionCheck.charCount}
          max={LENGTH_LIMITS.description.max}
          color={descriptionCheck.color}
        />
      </div>

      {/* أزرار سريعة */}
      <div className="rounded-xl border-2 border-ink-200 bg-white p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-ink-700">
          <Zap className="w-4 h-4" />
          <span>إجراءات سريعة</span>
        </div>
        <CopyButton
          text={generated.fullHtml}
          label="نسخ الكود"
          size="sm"
          variant="primary"
          className="w-full"
        />
        <CopyButton
          text={state.title}
          label="نسخ العنوان"
          size="sm"
          variant="secondary"
          className="w-full"
        />
        <CopyButton
          text={state.description}
          label="نسخ الوصف"
          size="sm"
          variant="secondary"
          className="w-full"
        />
      </div>
    </aside>
  );
}
