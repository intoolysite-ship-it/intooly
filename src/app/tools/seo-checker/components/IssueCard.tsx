'use client';

/**
 * بطاقة مشكلة SEO واحدة — قابلة للفتح/الإغلاق.
 * تعرض: الحالة، العنوان، التفاصيل، التوصية، مثال الكود، رابط التوثيق.
 */

import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Code2,
  ExternalLink,
} from 'lucide-react';
import type { SeoIssue } from '@/lib/seo-checker/types';
import { SEVERITY_LABELS, CATEGORY_LABELS } from '@/lib/seo-checker/types';
import ImagesAltFixer from './ImagesAltFixer';
import SmartFixer from './SmartFixer';

interface IssueCardProps {
  issue: SeoIssue;
  defaultOpen?: boolean;
}

const STATUS_CONFIG = {
  pass: {
    Icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
  },
  error: {
    Icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
  },
  info: {
    Icon: Info,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
  },
};

export default function IssueCard({ issue, defaultOpen = false }: IssueCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = STATUS_CONFIG[issue.status];
  const Icon = cfg.Icon;

  return (
    <article className={`rounded-xl border ${cfg.border} bg-white overflow-hidden`}>
      {/* الرأس */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-ink-50 transition-colors"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink-900">{issue.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
              {SEVERITY_LABELS[issue.severity]}
            </span>
            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
              {CATEGORY_LABELS[issue.category]}
            </span>
          </span>
          <span className="mt-1 block text-sm leading-6 text-ink-600 line-clamp-2">
            {issue.details}
          </span>
        </span>

        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-ink-400" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-ink-400" />
        )}
      </button>

      {/* المحتوى */}
      {open && (
        <div className="border-t border-ink-100 bg-ink-50/50 p-4 space-y-3">
          {/* القيمة المكتشفة */}
          {issue.value && issue.id === 'images-alt' && (
            <ImagesAltFixer imagesData={issue.value} />
          )}

          {issue.value && ['title', 'description', 'h1', 'links-text'].includes(issue.id) && (
            <SmartFixer issueId={issue.id} issueValue={issue.value} />
          )}

          {issue.value && !['images-alt', 'title', 'description', 'h1', 'links-text'].includes(issue.id) && (
            <div className="rounded-lg border border-ink-200 bg-white p-3">
              <p className="text-[10px] font-bold text-ink-500 uppercase tracking-wide mb-1">
                القيمة المكتشفة
              </p>
              <p className="text-sm text-ink-800 break-words whitespace-pre-line" dir="auto">
                {issue.value}
              </p>
            </div>
          )}

          {/* التوصية */}
          {issue.recommendation && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-1">
                <Lightbulb className="h-3.5 w-3.5" />
                التوصية
              </p>
              <p className="text-sm leading-6 text-brand-900/90">
                {issue.recommendation}
              </p>
            </div>
          )}

          {/* مثال الكود */}
          {issue.codeExample && (
            <div className="rounded-lg border border-ink-200 bg-ink-900 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-ink-800 border-b border-ink-700">
                <Code2 className="h-3.5 w-3.5 text-ink-300" />
                <span className="text-[10px] font-bold text-ink-300 uppercase tracking-wide">
                  مثال الكود
                </span>
              </div>
              <pre className="p-3 text-xs text-ink-100 overflow-x-auto font-mono" dir="ltr">
                {issue.codeExample}
              </pre>
            </div>
          )}

          {/* رابط التوثيق */}
          {issue.docUrl && (
            <a
              href={issue.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <ExternalLink className="h-3 w-3" />
              اقرأ المزيد في التوثيق الرسمي
            </a>
          )}
        </div>
      )}
    </article>
  );
}
