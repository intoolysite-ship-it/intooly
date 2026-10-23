'use client';

/**
 * تبويب فحص الطول والجودة.
 */

import { useState } from 'react';
import type { MetaTagsState, LengthCheckResult } from '@/lib/seo-meta-tags/types';
import {
  checkTitleLength,
  checkDescriptionLength,
  checkTitleQuality,
  checkDescriptionQuality,
  type QualityIssue,
} from '@/lib/seo-meta-tags/engine';
import {
  LENGTH_LIMITS,
  LENGTH_COLORS,
  DISCLAIMER_MESSAGES,
} from '@/lib/seo-meta-tags/constants';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  AlertTriangle,
  Tag,
} from 'lucide-react';

interface LengthCheckerTabProps {
  state: MetaTagsState;
}

interface LengthCardProps {
  label: string;
  result: LengthCheckResult;
  ideal: number;
  max: number;
  issues: QualityIssue[];
}

function LengthCard({ label, result, ideal, max, issues }: LengthCardProps) {
  const color = LENGTH_COLORS[result.color];

  const Icon =
    result.status === 'good'
      ? CheckCircle2
      : result.status === 'empty'
        ? Info
        : result.status === 'too-short'
          ? AlertCircle
          : XCircle;

  const severityIcon = (severity: QualityIssue['severity']) =>
    severity === 'error' ? XCircle : severity === 'warning' ? AlertTriangle : Info;

  const severityColor = (severity: QualityIssue['severity']) =>
    severity === 'error'
      ? 'text-red-600'
      : severity === 'warning'
        ? 'text-amber-700'
        : 'text-blue-700';

  return (
    <div className="rounded-xl border-2 border-ink-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-extrabold text-ink-900">{label}</h3>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black" style={{ color }}>
          {result.charCount}
        </span>
        <span className="text-sm font-bold text-ink-500">حرف</span>
        <span className="text-xs text-ink-400 mr-auto">
          (المثالي: ~{ideal} — الأقصى: {max})
        </span>
      </div>

      <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (result.charCount / max) * 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p className="text-sm font-semibold" style={{ color }}>
        {result.message}
      </p>

      {result.pixelEstimate > 0 && (
        <p className="text-xs text-ink-500">
          عرض تقديري: ~{result.pixelEstimate}px
        </p>
      )}

      {issues.length > 0 && (
        <div className="border-t border-ink-100 pt-2 space-y-1.5">
          <p className="text-[11px] font-bold text-ink-700">
            ملاحظات الجودة:
          </p>
          {issues.map((issue, idx) => {
            const SIcon = severityIcon(issue.severity);
            return (
              <div
                key={idx}
                className={`flex items-start gap-1.5 text-xs ${severityColor(
                  issue.severity
                )}`}
              >
                <SIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{issue.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LengthCheckerTab({ state }: LengthCheckerTabProps) {
  const [targetKeyword, setTargetKeyword] = useState('');

  const titleCheck = checkTitleLength(state.title);
  const descriptionCheck = checkDescriptionLength(state.description);
  const titleQuality = checkTitleQuality(state.title, targetKeyword);
  const descriptionQuality = checkDescriptionQuality(
    state.description,
    targetKeyword
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          ملاحظة حول حدود الطول
        </p>
        <p className="text-xs mt-1">{DISCLAIMER_MESSAGES.lengthGuide}</p>
      </div>

      {/* حقل الكلمة المفتاحية (اختياري) */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-bold text-ink-900 mb-1.5">
          <Tag className="w-4 h-4 text-brand-600" />
          الكلمة المفتاحية المستهدفة (اختياري)
        </label>
        <input
          type="text"
          value={targetKeyword}
          onChange={(e) => setTargetKeyword(e.target.value)}
          placeholder="مثال: ضغط الصور"
          className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink-500">
          تُستخدم فقط لتنبيهك إن لم تظهر في العنوان أو الوصف — لا تُحفظ ولا تُرسل.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LengthCard
          label="عنوان SEO"
          result={titleCheck}
          ideal={LENGTH_LIMITS.title.ideal}
          max={LENGTH_LIMITS.title.max}
          issues={titleQuality}
        />
        <LengthCard
          label="وصف Meta Description"
          result={descriptionCheck}
          ideal={LENGTH_LIMITS.description.ideal}
          max={LENGTH_LIMITS.description.max}
          issues={descriptionQuality}
        />
      </div>

      {/* نصائح */}
      <div className="rounded-xl border-2 border-ink-200 bg-ink-50 p-4">
        <h3 className="font-extrabold text-ink-900 mb-2 text-sm">
          نصائح سريعة
        </h3>
        <ul className="space-y-1.5 text-xs text-ink-700 list-disc pr-5">
          <li>ضع الكلمة المفتاحية في بداية العنوان.</li>
          <li>اجعل العنوان جذابًا — يُقرأ قبل النقر.</li>
          <li>الوصف يُقنع المستخدم — ركّز على الفائدة.</li>
          <li>تجنّب العبارات العامة مثل "مرحبًا بكم" أو "الصفحة الرئيسية".</li>
          <li>تجنّب حشو الكلمات المفتاحية في الوصف.</li>
        </ul>
      </div>
    </div>
  );
}
