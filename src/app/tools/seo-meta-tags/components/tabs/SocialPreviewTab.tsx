'use client';

/**
 * تبويب المشاركة الاجتماعية — Open Graph وTwitter Cards
 * مع التحقق من أبعاد صورة المشاركة.
 */

import { useState, useEffect } from 'react';
import type {
  MetaTagsState,
  OgType,
  TwitterCardType,
} from '@/lib/seo-meta-tags/types';
import {
  OG_TYPES,
  TWITTER_CARD_TYPES,
  DISCLAIMER_MESSAGES,
} from '@/lib/seo-meta-tags/constants';
import SocialPreviewCard from '../shared/SocialPreviewCard';
import {
  Info,
  Share2,
  MessageCircle,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SocialPreviewTabProps {
  state: MetaTagsState;
  onChange: (updater: (prev: MetaTagsState) => MetaTagsState) => void;
}

type Platform = 'facebook' | 'twitter' | 'linkedin';

type ImageStatus =
  | { type: 'empty' }
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ok'; width: number; height: number }
  | { type: 'wrong-ratio'; width: number; height: number };

export default function SocialPreviewTab({
  state,
  onChange,
}: SocialPreviewTabProps) {
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [imageStatus, setImageStatus] = useState<ImageStatus>({ type: 'empty' });

  const handleChange = <K extends keyof MetaTagsState>(
    key: K,
    value: MetaTagsState[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  // فحص أبعاد صورة OG
  useEffect(() => {
    const url = state.ogImage.trim();
    if (!url) {
      setImageStatus({ type: 'empty' });
      return;
    }

    setImageStatus({ type: 'loading' });

    const img = new Image();
    let cancelled = false;

    img.onload = () => {
      if (cancelled) return;
      const { naturalWidth: w, naturalHeight: h } = img;
      const ratio = w / h;

      // النسبة المثالية: 1.91:1 (1200×630)
      const idealRatio = 1200 / 630;
      const ratioTolerance = 0.1;

      if (Math.abs(ratio - idealRatio) <= ratioTolerance) {
        setImageStatus({ type: 'ok', width: w, height: h });
      } else {
        setImageStatus({ type: 'wrong-ratio', width: w, height: h });
      }
    };

    img.onerror = () => {
      if (cancelled) return;
      setImageStatus({
        type: 'error',
        message: 'تعذّر تحميل الصورة — تأكد من الرابط.',
      });
    };

    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [state.ogImage]);

  const renderImageStatus = () => {
    if (imageStatus.type === 'empty') {
      return null;
    }

    if (imageStatus.type === 'loading') {
      return (
        <p className="mt-1 text-xs text-ink-500">جاري التحقق من الصورة…</p>
      );
    }

    if (imageStatus.type === 'error') {
      return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="w-3 h-3" />
          {imageStatus.message}
        </p>
      );
    }

    if (imageStatus.type === 'wrong-ratio') {
      return (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          الأبعاد: {imageStatus.width}×{imageStatus.height}px — النسبة المثالية 1200×630.
        </p>
      );
    }

    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        الأبعاد: {imageStatus.width}×{imageStatus.height}px ✅
      </p>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          معاينة تقديرية
        </p>
        <p className="text-xs mt-1">{DISCLAIMER_MESSAGES.socialGuide}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* الحقول */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              صورة المشاركة (OG Image)
            </label>
            <input
              type="url"
              value={state.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              placeholder="https://intooly.com/og-image.jpg"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {renderImageStatus()}
            <p className="mt-1 text-xs text-ink-500">
              الأبعاد المثالية: 1200×630 بكسل (نسبة 1.91:1).
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              اسم الموقع (og:site_name)
            </label>
            <input
              type="text"
              value={state.ogSiteName}
              onChange={(e) => handleChange('ogSiteName', e.target.value)}
              placeholder="Intooly"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              لغة المحتوى (og:locale)
            </label>
            <input
              type="text"
              value={state.ogLocale}
              onChange={(e) => handleChange('ogLocale', e.target.value)}
              placeholder="ar_SA"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-ink-500">
              الصيغة: لغة_دولة (مثل ar_SA, en_US, fr_FR).
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              نوع Open Graph (og:type)
            </label>
            <select
              value={state.ogType}
              onChange={(e) => handleChange('ogType', e.target.value as OgType)}
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              {OG_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              نوع Twitter Card
            </label>
            <select
              value={state.twitterCard}
              onChange={(e) =>
                handleChange('twitterCard', e.target.value as TwitterCardType)
              }
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              {TWITTER_CARD_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              حساب Twitter الموقع (اختياري)
            </label>
            <input
              type="text"
              value={state.twitterSite}
              onChange={(e) => handleChange('twitterSite', e.target.value)}
              placeholder="@intooly"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ink-900 mb-1.5">
              حساب Twitter المنشئ (اختياري)
            </label>
            <input
              type="text"
              value={state.twitterCreator}
              onChange={(e) => handleChange('twitterCreator', e.target.value)}
              placeholder="@author"
              className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* المعاينة */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setPlatform('facebook')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                platform === 'facebook'
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              <Share2 className="w-3 h-3" />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => setPlatform('twitter')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                platform === 'twitter'
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              Twitter
            </button>
            <button
              type="button"
              onClick={() => setPlatform('linkedin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                platform === 'linkedin'
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              LinkedIn
            </button>
          </div>

          <SocialPreviewCard
            title={state.title}
            description={state.description}
            url={state.url}
            image={state.ogImage}
            ogType={state.ogType}
            twitterCard={state.twitterCard}
            twitterSite={state.twitterSite}
            platform={platform}
          />
        </div>
      </div>
    </div>
  );
}
