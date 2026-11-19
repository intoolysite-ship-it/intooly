'use client';

import type { GoldPriceResponse } from '../lib/types';

type PriceStatus = 'loading' | 'live' | 'cached' | 'stale' | 'error';

interface LiveGoldTickerProps {
  price: GoldPriceResponse | null;
  status: PriceStatus;
  error: string | null;
  lastChecked: number | null;
  refresh: () => Promise<void>;
  isLoading: boolean;
  isRefreshing: boolean;
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(value: string | null): string {
  if (!value) return 'غير متاح';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'غير متاح';

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function LiveGoldTicker({
  price,
  status,
  error,
  lastChecked,
  refresh,
  isLoading,
  isRefreshing,
}: LiveGoldTickerProps) {
  const statusConfig = {
    loading: {
      label: 'جارٍ تحميل الأسعار',
      className: 'bg-slate-100 text-slate-600',
      dotClassName: 'bg-slate-400',
    },
    live: {
      label: 'سعر مباشر',
      className: 'bg-green-100 text-green-700',
      dotClassName: 'bg-green-500',
    },
    cached: {
      label: 'من الذاكرة المؤقتة',
      className: 'bg-blue-100 text-blue-700',
      dotClassName: 'bg-blue-500',
    },
    stale: {
      label: 'آخر سعر محفوظ',
      className: 'bg-amber-100 text-amber-700',
      dotClassName: 'bg-amber-500',
    },
    error: {
      label: 'تعذر الاتصال',
      className: 'bg-red-100 text-red-700',
      dotClassName: 'bg-red-500',
    },
  } as const;

  const currentStatus = statusConfig[status];

  return (
    <section
      dir="rtl"
      aria-label="أسعار الذهب العالمية"
      className="w-full overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-l from-amber-50 to-orange-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🥇</span>
          <div>
            <h3 className="font-extrabold text-slate-800">
              أسعار الذهب العالمية
            </h3>
            <p className="text-xs text-slate-500">
              المصدر: GoldAPI.dev · XAU/USD
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${currentStatus.className}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${currentStatus.dotClassName}`}
          />
          {currentStatus.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-2 text-sm font-medium text-slate-500">
            سعر أوقية الذهب
          </p>
          <p className="text-2xl font-extrabold tabular-nums text-slate-900 sm:text-3xl">
            {price ? usdFormatter.format(price.priceUsdPerOunce) : isLoading ? 'جارٍ التحميل...' : 'غير متاح'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            أوقية ترويسية · 31.1034768 جرام
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="mb-2 text-sm font-medium text-slate-500">
            سعر جرام الذهب عيار 24
          </p>
          <p className="text-2xl font-extrabold tabular-nums text-amber-700 sm:text-3xl">
            {price ? usdFormatter.format(price.gram24Usd) : isLoading ? 'جارٍ التحميل...' : 'غير متاح'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            السعر العالمي بالدولار قبل فروق السوق المحلي
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
        <div className="text-xs text-slate-500">
          <p>
            آخر تحديث من المصدر:{' '}
            <span className="font-semibold text-slate-700">
              {formatDate(price?.updatedAt ?? null)}
            </span>
          </p>
          {lastChecked && (
            <p className="mt-1">
              آخر تحقق من الاتصال:{' '}
              {new Intl.DateTimeFormat('ar-EG', {
                timeStyle: 'short',
              }).format(lastChecked)}
            </p>
          )}
          {error && (
            <p className="mt-1 text-red-600">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">↻</span>
          {isRefreshing ? 'جارٍ التحديث...' : 'تحديث الأسعار'}
        </button>
      </div>
    </section>
  );
}