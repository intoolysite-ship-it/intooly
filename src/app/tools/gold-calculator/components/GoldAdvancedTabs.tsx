'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  GoldKarat,
  GoldPortfolioItem,
  GoldTabKey,
} from '../lib/types';

interface Props {
  activeTab: GoldTabKey;
  pricePerGram: number | null;
  gram24Price: number | null;
  karat: GoldKarat;
  currency: string;
  exchangeRate: number | null;
}

const karats: GoldKarat[] = [24, 22, 21, 18, 14];

const numberFormatter = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100';

const labelClass = 'mb-2 block text-sm font-bold text-slate-700';

function money(value: number): string {
  return numberFormatter.format(value);
}

function InputField({
  label,
  value,
  onChange,
  min = '0',
  step = '0.01',
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  step?: string;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
    </div>
  );
}

function ResultCard({
  label,
  value,
  currency = 'USD',
  exchangeRate = 1,
  dark = false,
}: {
  label: string;
  value: number;
  currency?: string;
  exchangeRate?: number | null;
  dark?: boolean;
}) {
  const formatted = exchangeRate === null
    ? 'غير متاح'
    : new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value * exchangeRate);

  return (
    <div className={`rounded-2xl p-4 ${dark ? 'bg-slate-900 text-white' : 'border border-amber-200 bg-amber-50'}`}>
      <p className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-amber-800'}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold" dir="ltr">
        {formatted}
      </p>
    </div>
  );
}

export function GoldAdvancedTabs({
  activeTab,
  pricePerGram,
  gram24Price,
  karat,
  currency,
  exchangeRate,
}: Props) {
  const formatLocalMoney = (value: number): string => {
    if (
      exchangeRate === null ||
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0 ||
      !Number.isFinite(value)
    ) {
      return 'غير متاح';
    }

    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value * exchangeRate);
  };

  const [buyWeight, setBuyWeight] = useState('10');
  const [buyMaking, setBuyMaking] = useState('0');
  const [buyFees, setBuyFees] = useState('0');
  const [buyTax, setBuyTax] = useState('0');

  const [sellWeight, setSellWeight] = useState('10');
  const [sellDeduction, setSellDeduction] = useState('0');
  const [sellFees, setSellFees] = useState('0');

  const [profitWeight, setProfitWeight] = useState('10');
  const [purchasePrice, setPurchasePrice] = useState('0');

  const [portfolio, setPortfolio] = useState<GoldPortfolioItem[]>([]);
  const [portfolioLoaded, setPortfolioLoaded] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('10');
  const [itemKarat, setItemKarat] = useState<GoldKarat>(21);
  const [itemPurchasePrice, setItemPurchasePrice] = useState('0');

  const [hasCompletedHawl, setHasCompletedHawl] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('intooly-gold-portfolio-v1');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPortfolio(parsed.filter((item): item is GoldPortfolioItem =>
            item !== null &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            Number.isFinite(item.weight) &&
            item.weight > 0 &&
            karats.includes(item.karat) &&
            Number.isFinite(item.purchasePricePerGram) &&
            item.purchasePricePerGram >= 0 &&
            typeof item.purchaseDate === 'string'
          ));
        }
      }
    } catch {
      setPortfolio([]);
    } finally {
      setPortfolioLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!portfolioLoaded) return;

    try {
      localStorage.setItem(
        'intooly-gold-portfolio-v1',
        JSON.stringify(portfolio),
      );
    } catch {
      // Portfolio remains available in the current session.
    }
  }, [portfolio, portfolioLoaded]);

  const numeric = (value: string): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const buyResult = useMemo(() => {
    const weight = numeric(buyWeight);
    const exchangeRateValid = exchangeRate !== null &&
      Number.isFinite(exchangeRate) && exchangeRate > 0;
    const makingLocal = numeric(buyMaking);
    const feesLocal = numeric(buyFees);
    const making = exchangeRateValid ? makingLocal / exchangeRate : 0;
    const fees = exchangeRateValid ? feesLocal / exchangeRate : 0;
    const taxRate = numeric(buyTax);
    const valid = pricePerGram !== null && exchangeRateValid &&
      [buyWeight, buyMaking, buyFees, buyTax].every((v) =>
        v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0
      ) &&
      weight > 0;

    const gold = valid ? weight * (pricePerGram ?? 0) : 0;
    const makingCost = valid ? weight * making : 0;
    const tax = valid ? (gold + makingCost + fees) * taxRate / 100 : 0;

    return {
      valid,
      gold,
      makingCost,
      fees: valid ? fees : 0,
      tax,
      total: gold + makingCost + fees + tax,
    };
  }, [buyWeight, buyMaking, buyFees, buyTax, pricePerGram, exchangeRate]);

  const sellResult = useMemo(() => {
    const weight = numeric(sellWeight);
    const exchangeRateValid = exchangeRate !== null &&
      Number.isFinite(exchangeRate) && exchangeRate > 0;
    const deductionLocal = numeric(sellDeduction);
    const feesLocal = numeric(sellFees);
    const deduction = exchangeRateValid ? deductionLocal / exchangeRate : 0;
    const fees = exchangeRateValid ? feesLocal / exchangeRate : 0;
    const valid = pricePerGram !== null && exchangeRateValid &&
      [sellWeight, sellDeduction, sellFees].every((v) =>
        v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0
      ) && weight > 0;

    const gross = valid ? weight * (pricePerGram ?? 0) : 0;
    const deductions = valid ? Math.min(gross, weight * deduction + fees) : 0;

    return {
      valid,
      gross,
      deductions,
      net: gross - deductions,
    };
  }, [sellWeight, sellDeduction, sellFees, pricePerGram, exchangeRate]);

  const profitResult = useMemo(() => {
    const weight = numeric(profitWeight);
    const exchangeRateValid = exchangeRate !== null &&
      Number.isFinite(exchangeRate) && exchangeRate > 0;
    const purchasePriceLocal = numeric(purchasePrice);
    const costPerGram = exchangeRateValid
      ? purchasePriceLocal / exchangeRate
      : 0;
    const valid = pricePerGram !== null && exchangeRateValid &&
      [profitWeight, purchasePrice].every((v) =>
        v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0
      ) && weight > 0 && costPerGram > 0;

    const cost = valid ? weight * costPerGram : 0;
    const current = valid ? weight * (pricePerGram ?? 0) : 0;
    const amount = current - cost;

    return {
      valid,
      cost,
      current,
      amount,
      percentage: cost > 0 ? amount / cost * 100 : 0,
    };
  }, [profitWeight, purchasePrice, pricePerGram, exchangeRate]);

  const portfolioSummary = useMemo(() => {
    const cost = portfolio.reduce(
      (sum, item) => sum + item.weight * item.purchasePricePerGram,
      0,
    );

    const current = gram24Price === null ? null : portfolio.reduce(
      (sum, item) => sum + item.weight * gram24Price * item.karat / 24,
      0,
    );

    return {
      cost,
      current,
      profit: current === null ? null : current - cost,
    };
  }, [portfolio, gram24Price]);

  const zakat = useMemo(() => {
    if (gram24Price === null) return null;

    const nisab = 85 * gram24Price;
    const value = portfolioSummary.current ?? 0;
    const eligible = value >= nisab && hasCompletedHawl;

    return {
      nisab,
      value,
      eligible,
      amount: eligible ? value * 0.025 : 0,
    };
  }, [gram24Price, portfolioSummary.current, hasCompletedHawl]);

  function addPortfolioItem() {
    const weight = Number(itemWeight);
    const purchaseLocal = Number(itemPurchasePrice);
    const exchangeRateValid = exchangeRate !== null &&
      Number.isFinite(exchangeRate) && exchangeRate > 0;
    const purchase = exchangeRateValid
      ? purchaseLocal / exchangeRate
      : 0;

    if (
      !itemName.trim() ||
      !Number.isFinite(weight) || weight <= 0 ||
      !Number.isFinite(purchaseLocal) || purchaseLocal <= 0 ||
      !exchangeRateValid
    ) return;

    setPortfolio((items) => [...items, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: itemName.trim(),
      weight,
      karat: itemKarat,
      purchasePricePerGram: purchase,
      purchaseDate: new Date().toISOString().slice(0, 10),
    }]);

    setItemName('');
    setItemWeight('10');
    setItemPurchasePrice('0');
  }

  if (activeTab === 'buy') {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-600">
          احسب تكلفة شراء الذهب بناءً على السعر العالمي التقديري، مع إضافة المصنعية والرسوم والضريبة.
        </p>

        {pricePerGram === null && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            السعر الحالي غير متاح. لا يمكن إجراء حساب شراء موثوق دون سعر الذهب.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField id="buy-weight" label="وزن الذهب بالجرام" value={buyWeight} onChange={setBuyWeight} />
          <InputField id="buy-making" label={`المصنعية لكل جرام (${currency})`} value={buyMaking} onChange={setBuyMaking} />
          <InputField id="buy-fees" label={`رسوم إضافية (${currency})`} value={buyFees} onChange={setBuyFees} />
          <InputField id="buy-tax" label="الضريبة (%)" value={buyTax} onChange={setBuyTax} step="0.1" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCard currency={currency} exchangeRate={exchangeRate} label="قيمة الذهب" value={buyResult.gold} />
          <ResultCard currency={currency} exchangeRate={exchangeRate} label="تكلفة المصنعية" value={buyResult.makingCost} />
          <ResultCard currency={currency} exchangeRate={exchangeRate} label="الرسوم الإضافية" value={buyResult.fees} />
          <ResultCard currency={currency} exchangeRate={exchangeRate} label="الضريبة" value={buyResult.tax} />
        </div>

        <ResultCard currency={currency} exchangeRate={exchangeRate} label="إجمالي تكلفة الشراء التقديرية" value={buyResult.total} dark />
        {!buyResult.valid && <p className="text-xs text-red-600">أدخل وزناً موجباً وجميع القيم بصورة صحيحة بعد توفر السعر.</p>}
        <p className="text-xs leading-6 text-slate-500">الحساب لا يمثل عرض سعر من تاجر، ولا يشمل أي رسوم غير مدخلة.</p>
      </div>
    );
  }

  if (activeTab === 'sell') {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-600">
          قدّر المبلغ الذي قد تحصل عليه عند بيع الذهب بعد خصم المصنعية المستهلكة والرسوم التي تحددها.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField id="sell-weight" label="وزن الذهب بالجرام" value={sellWeight} onChange={setSellWeight} />
          <InputField id="sell-deduction" label={`خصم لكل جرام (${currency})`} value={sellDeduction} onChange={setSellDeduction} />
          <InputField id="sell-fees" label={`رسوم أو خصومات إضافية (${currency})`} value={sellFees} onChange={setSellFees} />
        </div>

        {pricePerGram === null ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">السعر الحالي غير متاح. حاول تحديث السعر أولاً.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="القيمة قبل الخصم" value={sellResult.gross} />
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="إجمالي الخصومات" value={sellResult.deductions} />
            </div>
            <ResultCard currency={currency} exchangeRate={exchangeRate} label="صافي حصيلة البيع التقديرية" value={sellResult.net} dark />
          </>
        )}

        {!sellResult.valid && <p className="text-xs text-red-600">أدخل وزناً موجباً وقيم خصم صحيحة.</p>}
        <p className="text-xs leading-6 text-slate-500">قد يختلف سعر شراء التاجر للذهب المستعمل عن السعر النظري، حسب السوق والعيار والحالة.</p>
      </div>
    );
  }

  if (activeTab === 'profit') {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-600">
          قارن تكلفة شرائك للذهب بقيمته الحالية التقديرية لمعرفة الربح أو الخسارة قبل المصروفات والضرائب.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField id="profit-weight" label="الوزن بالجرام" value={profitWeight} onChange={setProfitWeight} />
          <InputField id="purchase-price" label={`سعر الشراء لكل جرام (${currency})`} value={purchasePrice} onChange={setPurchasePrice} />
        </div>

        {pricePerGram === null ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">السعر الحالي غير متاح لحساب الربح والخسارة.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="إجمالي تكلفة الشراء" value={profitResult.cost} />
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="القيمة الحالية التقديرية" value={profitResult.current} />
            </div>
            <div className={`rounded-2xl p-5 text-white ${profitResult.amount >= 0 ? 'bg-emerald-700' : 'bg-red-700'}`}>
              <p className="text-sm font-semibold text-white/80">
                {profitResult.amount >= 0 ? 'الربح التقديري' : 'الخسارة التقديرية'}
              </p>
              <p className="mt-2 text-3xl font-extrabold" dir="ltr">
                {profitResult.amount < 0 ? '-' : '+'}{formatLocalMoney(Math.abs(profitResult.amount))}
              </p>
              <p className="mt-2 text-sm" dir="ltr">
                {profitResult.percentage >= 0 ? '+' : ''}{money(profitResult.percentage)}%
              </p>
            </div>
          </>
        )}

        {!profitResult.valid && <p className="text-xs text-red-600">أدخل وزناً موجباً وسعر شراء أكبر من صفر.</p>}
      </div>
    );
  }

  if (activeTab === 'portfolio') {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-600">
          أضف مقتنياتك الذهبية لمتابعة تكلفتها وقيمتها الحالية. تُحفظ البيانات محلياً في متصفحك ولا تُرسل إلى الخادم.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="portfolio-name" className={labelClass}>اسم القطعة</label>
            <input id="portfolio-name" value={itemName} onChange={(e) => setItemName(e.target.value)} className={fieldClass} placeholder="مثال: خاتم ذهب" maxLength={60} />
          </div>
          <InputField id="portfolio-weight" label="الوزن بالجرام" value={itemWeight} onChange={setItemWeight} />
          <div>
            <label htmlFor="portfolio-karat" className={labelClass}>العيار</label>
            <select id="portfolio-karat" value={itemKarat} onChange={(e) => setItemKarat(Number(e.target.value) as GoldKarat)} className={fieldClass}>
              {karats.map((k) => <option key={k} value={k}>عيار {k}</option>)}
            </select>
          </div>
          <InputField id="portfolio-price" label={`سعر الشراء لكل جرام (${currency})`} value={itemPurchasePrice} onChange={setItemPurchasePrice} />
        </div>

        <button type="button" onClick={addPortfolioItem} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 font-bold text-white transition hover:opacity-90">
          + إضافة إلى محفظتي
        </button>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCard currency={currency} exchangeRate={exchangeRate} label="إجمالي تكلفة المقتنيات" value={portfolioSummary.cost} />
          {portfolioSummary.current === null
            ? <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">القيمة الحالية غير متاحة</div>
            : <ResultCard currency={currency} exchangeRate={exchangeRate} label="القيمة الحالية التقديرية" value={portfolioSummary.current} dark />}
        </div>

        {portfolioSummary.profit !== null && (
          <p className={`rounded-xl p-3 text-sm font-bold ${portfolioSummary.profit >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {portfolioSummary.profit >= 0 ? 'الربح التقديري: ' : 'الخسارة التقديرية: '}
            {formatLocalMoney(Math.abs(portfolioSummary.profit))}
          </p>
        )}

        {portfolio.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            لم تضف أي مقتنيات بعد.
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.map((item) => {
              const current = gram24Price === null ? null : item.weight * gram24Price * item.karat / 24;
              const cost = item.weight * item.purchasePricePerGram;

              return (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.weight} جرام · عيار {item.karat} · شراء {formatLocalMoney(cost)}
                    </p>
                    {current !== null && (
                      <p className="mt-1 text-xs text-slate-600">القيمة الحالية: {formatLocalMoney(current)}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => setPortfolio((items) => items.filter((x) => x.id !== item.id))} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">
                    حذف
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'zakat') {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-7 text-slate-600">
          تقدير زكاة الذهب وفق معيار النصاب الشائع: ما يعادل 85 جراماً من الذهب الخالص عيار 24، وبنسبة 2.5% بعد اكتمال الحول.
        </p>

        {zakat === null ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">يلزم توفر سعر الذهب لحساب قيمة النصاب.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="قيمة النصاب التقديرية (85 جرام عيار 24)" value={zakat.nisab} />
              <ResultCard currency={currency} exchangeRate={exchangeRate} label="قيمة محفظتك الحالية" value={zakat.value} dark />
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-bold text-slate-800">هل مرّ حول قمري كامل على المال المستحق؟</p>
              <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" checked={hasCompletedHawl} onChange={(e) => setHasCompletedHawl(e.target.checked)} className="h-5 w-5 accent-amber-600" />
                نعم، اكتمل الحول
              </label>
            </div>

            <div className={`rounded-2xl p-5 ${zakat.eligible ? 'bg-emerald-50' : 'bg-slate-100'}`}>
              <p className="font-bold text-slate-800">
                {zakat.value < zakat.nisab
                  ? 'القيمة الحالية أقل من النصاب المحسوب'
                  : !hasCompletedHawl
                    ? 'يجب التأكد من اكتمال الحول'
                    : 'مقدار الزكاة التقديري (2.5%)'}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900" dir="ltr">
                {formatLocalMoney(zakat.amount)}
              </p>
            </div>
          </>
        )}

        <p className="text-xs leading-6 text-slate-500">
          هذا تقدير مبسط لمحفظة الذهب المسجلة في الأداة فقط، ولا يراعي تفاصيل اختلاف أحكام الزكاة أو ضم الأموال الأخرى أو الديون. يُرجى مراجعة جهة شرعية موثوقة لتحديد الوعاء والنصاب والحول في حالتك.
        </p>
      </div>
    );
  }

  return null;
}