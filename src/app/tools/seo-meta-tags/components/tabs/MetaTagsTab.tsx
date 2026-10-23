'use client';

/**
 * تبويب Meta Tags — العنوان، الوصف، الرابط، وإعدادات Robots المتقدمة.
 */

import type {
  MetaTagsState,
  RobotsOptions,
  SnippetOption,
  ImagePreviewOption,
} from '@/lib/seo-meta-tags/types';
import {
  checkTitleLength,
  checkDescriptionLength,
  isValidUrl,
} from '@/lib/seo-meta-tags/engine';
import { LENGTH_LIMITS } from '@/lib/seo-meta-tags/constants';
import CharCounter from '../shared/CharCounter';
import { AlertCircle } from 'lucide-react';

interface MetaTagsTabProps {
  state: MetaTagsState;
  onChange: (updater: (prev: MetaTagsState) => MetaTagsState) => void;
}

function handleRobotsChange<K extends keyof RobotsOptions>(
  current: RobotsOptions,
  key: K,
  value: RobotsOptions[K]
): RobotsOptions {
  return { ...current, [key]: value };
}

const SNIPPET_OPTIONS: { value: SnippetOption; label: string; description: string }[] = [
  { value: 'max', label: 'بلا حد', description: 'max-snippet:-1 — السماح بمقتطف كامل' },
  { value: 'limited', label: 'محدود (150 حرفًا)', description: 'max-snippet:150' },
  { value: 'none', label: 'منع المقتطف', description: 'nosnippet — لا يظهر نص في البحث' },
];

const IMAGE_PREVIEW_OPTIONS: { value: ImagePreviewOption; label: string; description: string }[] = [
  { value: 'large', label: 'كبيرة', description: 'max-image-preview:large — موصى به' },
  { value: 'standard', label: 'قياسية', description: 'max-image-preview:standard' },
  { value: 'none', label: 'بدون معاينة', description: 'max-image-preview:none' },
];

export default function MetaTagsTab({ state, onChange }: MetaTagsTabProps) {
  const titleCheck = checkTitleLength(state.title);
  const descriptionCheck = checkDescriptionLength(state.description);
  const urlValid = isValidUrl(state.url);
  const titleHasExtraSpaces = /\s{2,}/.test(state.title);
  const descriptionHasExtraSpaces = /\s{2,}/.test(state.description);

  const handleChange = <K extends keyof MetaTagsState>(
    key: K,
    value: MetaTagsState[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleRobots = <K extends keyof RobotsOptions>(
    key: K,
    value: RobotsOptions[K]
  ) => {
    onChange((prev) => ({
      ...prev,
      robots: handleRobotsChange(prev.robots, key, value),
    }));
  };

  return (
    <div className="space-y-5">
      {/* ============ العنوان ============ */}
      <div>
        <label className="block text-sm font-bold text-ink-900 mb-1.5">
          عنوان SEO
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="مثال: ضغط الصور أونلاين بدون فقدان الجودة | Intooly"
          className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          maxLength={80}
        />
        <div className="mt-2">
          <CharCounter result={titleCheck} max={LENGTH_LIMITS.title.max} />
        </div>
        {titleHasExtraSpaces && (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
            <AlertCircle className="w-3 h-3" />
            يوجد مسافات متكررة في العنوان — قد يُظهر Google مسافات غير مرغوبة.
          </p>
        )}
      </div>

      {/* ============ الوصف ============ */}
      <div>
        <label className="block text-sm font-bold text-ink-900 mb-1.5">
          وصف Meta Description
        </label>
        <textarea
          value={state.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="اكتب وصفًا موجزًا يشرح محتوى الصفحة (140-160 حرفًا)."
          rows={3}
          className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
          maxLength={200}
        />
        <div className="mt-2">
          <CharCounter
            result={descriptionCheck}
            max={LENGTH_LIMITS.description.max}
          />
        </div>
        {descriptionHasExtraSpaces && (
          <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
            <AlertCircle className="w-3 h-3" />
            يوجد مسافات متكررة في الوصف.
          </p>
        )}
      </div>

      {/* ============ الرابط ============ */}
      <div>
        <label className="block text-sm font-bold text-ink-900 mb-1.5">
          رابط الصفحة (Canonical URL)
        </label>
        <input
          type="url"
          value={state.url}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://intooly.com/tools/seo-meta-tags"
          className={`w-full rounded-lg border-2 px-3 py-2 text-sm focus:outline-none ${
            urlValid
              ? 'border-ink-200 focus:border-brand-500'
              : 'border-red-400 focus:border-red-500'
          }`}
        />
        {!urlValid && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3 h-3" />
            صيغة الرابط غير صحيحة. مثال: https://example.com/page
          </p>
        )}
        <p className="mt-1 text-xs text-ink-500">
          يُستخدم لوسم Canonical ووسم og:url.
        </p>
      </div>

      {/* ============ Robots (متقدم) ============ */}
      <div className="rounded-xl border-2 border-ink-200 bg-ink-50 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-ink-900 mb-1">
            إعدادات Robots
          </h3>
          <p className="text-xs text-ink-500">
            القيم الافتراضية (index, follow) لا تُضاف تلقائيًا إلى الكود — تُضاف
            فقط التوجيهات المخصصة.
          </p>
        </div>

        {/* Indexing */}
        <div>
          <p className="text-xs font-bold text-ink-700 mb-1.5">الفهرسة</p>
          <div className="flex gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                checked={state.robots.index}
                onChange={() => handleRobots('index', true)}
                className="accent-brand-600"
              />
              index (مسموح)
            </label>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                checked={!state.robots.index}
                onChange={() => handleRobots('index', false)}
                className="accent-red-600"
              />
              noindex (ممنوع)
            </label>
          </div>
        </div>

        {/* Follow */}
        <div>
          <p className="text-xs font-bold text-ink-700 mb-1.5">الروابط</p>
          <div className="flex gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                checked={state.robots.follow}
                onChange={() => handleRobots('follow', true)}
                className="accent-brand-600"
              />
              follow (تتبع)
            </label>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 bg-white cursor-pointer text-xs font-semibold">
              <input
                type="radio"
                checked={!state.robots.follow}
                onChange={() => handleRobots('follow', false)}
                className="accent-red-600"
              />
              nofollow (منع)
            </label>
          </div>
        </div>

        {/* Snippet */}
        <div>
          <p className="text-xs font-bold text-ink-700 mb-1.5">المقتطف النصي</p>
          <div className="space-y-1.5">
            {SNIPPET_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2 px-3 py-2 rounded-lg border border-ink-200 bg-white cursor-pointer hover:bg-ink-100"
              >
                <input
                  type="radio"
                  checked={state.robots.snippet === opt.value}
                  onChange={() => handleRobots('snippet', opt.value)}
                  className="mt-0.5 accent-brand-600"
                />
                <div>
                  <p className="text-xs font-bold text-ink-900">{opt.label}</p>
                  <p className="text-[10px] text-ink-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Image Preview */}
        <div>
          <p className="text-xs font-bold text-ink-700 mb-1.5">معاينة الصورة</p>
          <div className="space-y-1.5">
            {IMAGE_PREVIEW_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2 px-3 py-2 rounded-lg border border-ink-200 bg-white cursor-pointer hover:bg-ink-100"
              >
                <input
                  type="radio"
                  checked={state.robots.imagePreview === opt.value}
                  onChange={() => handleRobots('imagePreview', opt.value)}
                  className="mt-0.5 accent-brand-600"
                />
                <div>
                  <p className="text-xs font-bold text-ink-900">{opt.label}</p>
                  <p className="text-[10px] text-ink-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced: noarchive */}
        <details className="border-t border-ink-200 pt-3">
          <summary className="cursor-pointer text-xs font-bold text-ink-700 hover:text-brand-600">
            خيارات متقدمة
          </summary>
          <label className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg border border-ink-200 bg-white cursor-pointer hover:bg-ink-100">
            <input
              type="checkbox"
              checked={state.robots.noarchive}
              onChange={(e) => handleRobots('noarchive', e.target.checked)}
              className="mt-0.5 accent-amber-600"
            />
            <div>
              <p className="text-xs font-bold text-ink-900">noarchive</p>
              <p className="text-[10px] text-ink-500">
                منع عرض نسخة مخبأة (غير مضمون في Google حاليًا).
              </p>
            </div>
          </label>
        </details>
      </div>
    </div>
  );
}
