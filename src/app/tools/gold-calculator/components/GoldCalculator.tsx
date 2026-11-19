'use client';

import { useMemo, useState } from 'react';
import { LiveGoldTicker } from './LiveGoldTicker';
import { useGoldPrice } from '../hooks/useGoldPrice';
import {
  GOLD_KARATS,
  calculateKaratPrice,
  calculateGoldValue,
} from '../lib/gold';
import type { GoldKarat, GoldTabKey } from '../lib/types';
import { GoldAdvancedTabs } from './GoldAdvancedTabs';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { ARAB_COUNTRIES, DEFAULT_COUNTRY } from '../lib/currencies';

interface TabDef {
  key: GoldTabKey;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'calculator', label: 'الحاسبة', icon: '🧮' },
  { key: 'buy', label: 'الشراء', icon: '🛒' },
  { key: 'sell', label: 'البيع', icon: '💰' },
  { key: 'profit', label: 'الربح والخسارة', icon: '📈' },
  { key: 'portfolio', label: 'محفظتي', icon: '💼' },
  { key: 'zakat', label: 'الزكاة', icon: '🌙' },
];

const numberFormatter = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function GoldCalculator() {
  const [activeTab, setActiveTab] = useState<GoldTabKey>('calculator');
  const [weight, setWeight] = useState('10');
  const [karat, setKarat] = useState<GoldKarat>(21);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);

  const {
    price,
    status,
    error,
    lastChecked,
    refresh,
    isLoading,
    isRefreshing,
  } = useGoldPrice();

  const { rates, updatedAt: exchangeUpdatedAt, status: exchangeStatus, refresh: refreshExchangeRate } = useExchangeRate();
  const selectedCountry = ARAB_COUNTRIES.find((country) => country.code === countryCode) ?? ARAB_COUNTRIES[0];
  const exchangeRate = rates[selectedCountry.currency];
  const hasExchangeRate = Number.isFinite(exchangeRate) && exchangeRate > 0;

  const formatLocal = (usdValue: number): string => {
    if (!hasExchangeRate) return 'غير متاح';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: selectedCountry.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue * exchangeRate);
  };

  const activeTabInfo = TABS.find((tab) => tab.key === activeTab);

  const calculations = useMemo(() => {
    if (!price) return null;

    const gram24 = price.gram24Usd;
    const karatPrices = calculateKaratPrice(gram24);
    const selected = karatPrices.find((item) => item.karat === karat);
    const parsedWeight = Number(weight);
    const validWeight = Number.isFinite(parsedWeight) && parsedWeight > 0;

    return {
      gram24,
      karatPrices,
      selectedPrice: selected?.pricePerGram ?? 0,
      purity: selected?.purity ?? 0,
      total: validWeight
        ? calculateGoldValue(parsedWeight, selected?.pricePerGram ?? 0)
        : 0,
      validWeight,
    };
  }, [price, weight, karat]);

  const statusLabel: Record<typeof status, string> = {
    loading: 'جارٍ تحميل السعر',
    live: 'سعر مباشر',
    cached: 'سعر محفوظ مؤقتاً',
    stale: 'بيانات قديمة',
    error: 'تعذر جلب السعر',
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🥇</span>
          <h2 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
            حاسبة الذهب الذكية
          </h2>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-bold ${
              status === 'live'
                ? 'border-green-200 bg-green-50 text-green-700'
                : status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {statusLabel[status]}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          حسابات تقديرية لأسعار الذهب العالمية
        </span>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-l from-orange-50 via-amber-50 to-white p-4 shadow-sm">
        <label htmlFor="gold-country" className="mb-3 block font-extrabold text-slate-800">
          🌍 اختر الدولة والعملة
        </label>
        <select
          id="gold-country"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          className="w-full rounded-xl border border-amber-300 bg-white px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          {ARAB_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name} — {country.currencyName} ({country.currency})
            </option>
          ))}
        </select>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-slate-700">
            العملة المختارة: {selectedCountry.currency}
          </span>
          <span className={hasExchangeRate ? 'text-emerald-700' : 'text-red-600'}>
            {hasExchangeRate
              ? exchangeStatus === 'live' ? 'سعر صرف محدث' : 'سعر صرف محفوظ أو سابق'
              : 'سعر الصرف غير متاح لهذه العملة'}
          </span>
        </div>
        {!hasExchangeRate && (
          <button
            type="button"
            onClick={() => void refreshExchangeRate()}
            className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-700"
          >
            تحديث أسعار الصرف
          </button>
        )}
        {exchangeUpdatedAt && (
          <p className="mt-2 text-xs text-slate-500">تاريخ بيانات الصرف: {exchangeUpdatedAt}</p>
        )}
      </section>

      <LiveGoldTicker
        price={price}
        status={status}
        error={error}
        lastChecked={lastChecked}
        refresh={refresh}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={isActive}
                className={`
                  flex items-center gap-1.5 whitespace-nowrap rounded-xl
                  px-3 py-2 text-xs font-semibold transition
                  sm:px-4 sm:text-sm
                  ${isActive
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'}
                `}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        className="min-h-[400px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        aria-live="polite"
      >
        <div className="mb-5">
          <h3 className="text-lg font-extrabold text-slate-800">
            {activeTabInfo?.icon} {activeTabInfo?.label}
          </h3>
        </div>

        {activeTab === 'calculator' ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="gold-weight" className="mb-2 block text-sm font-bold text-slate-700">
                  وزن الذهب بالجرام
                </label>
                <input
                  id="gold-weight"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="أدخل الوزن بالجرام"
                />
              </div>

              <div>
                <label htmlFor="gold-karat" className="mb-2 block text-sm font-bold text-slate-700">
                  عيار الذهب
                </label>
                <select
                  id="gold-karat"
                  value={karat}
                  onChange={(event) => setKarat(Number(event.target.value) as GoldKarat)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                >
                  {GOLD_KARATS.map((item) => (
                    <option key={item.karat} value={item.karat}>
                      {item.label} - {(item.purity * 100).toFixed(2)}% نقاء
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {calculations ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">
                      سعر جرام عيار {karat}
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900" dir="ltr">
                      {formatLocal(calculations.selectedPrice)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4 text-white">
                    <p className="text-sm font-semibold text-slate-300">
                      القيمة التقديرية للذهب
                    </p>
                    <p className="mt-2 text-2xl font-extrabold" dir="ltr">
                      {calculations.validWeight ? formatLocal(calculations.total) : '—'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">نسبة النقاء</p>
                    <p className="mt-1 font-extrabold text-slate-800">
                      {(calculations.purity * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">سعر جرام عيار 24</p>
                    <p className="mt-1 font-extrabold text-slate-800" dir="ltr">
                      {formatLocal(calculations.gram24)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">حالة بيانات السعر</p>
                    <p className="mt-1 font-extrabold text-slate-800">
                      {statusLabel[status]}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <h4 className="mb-3 font-extrabold text-slate-800">
                    جدول أسعار جرام الذهب حسب العيار
                  </h4>
                  <table className="w-full min-w-[320px] text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="rounded-r-lg p-3 text-right">العيار</th>
                        <th className="p-3 text-right">النقاء</th>
                        <th className="rounded-l-lg p-3 text-left">السعر / جرام</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.karatPrices.map((item) => (
                        <tr key={item.karat} className={item.karat === karat ? 'bg-amber-50 font-bold' : 'border-b border-slate-100'}>
                          <td className="p-3">عيار {item.karat}</td>
                          <td className="p-3">{(item.purity * 100).toFixed(2)}%</td>
                          <td className="p-3 text-left" dir="ltr">{formatLocal(item.pricePerGram)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">
                  {status === 'error'
                    ? 'تعذر تحميل أسعار الذهب حالياً. حاول تحديث الصفحة لاحقاً.'
                    : 'جارٍ تحميل أسعار الذهب العالمية...'}
                </p>
              </div>
            )}

            <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-6 text-blue-900">
              السعر المعروض تقديري بعملة {selectedCountry.currency}، ومحوّل من سعر أوقية الذهب العالمية بالدولار.
              لا يمثل بالضرورة سعر السوق المحلي، ولا يشمل المصنعية أو الضرائب
              أو فروق التجار.
            </p>
          </div>
        ) : (
          <GoldAdvancedTabs
            activeTab={activeTab}
            pricePerGram={calculations ? calculations.selectedPrice : null}
            gram24Price={calculations ? calculations.gram24 : null}
            karat={karat}
            currency={selectedCountry.currency}
            exchangeRate={hasExchangeRate ? exchangeRate : null}
          />
        )}
      </section>

      <p className="pt-2 text-center text-xs text-slate-400">
        الأسعار محوّلة إلى {selectedCountry.currency}، وقد تختلف الأسعار المحلية بسبب فروق
        السوق والعملة والمصنعية والضرائب.
      </p>
    </div>
  );
}