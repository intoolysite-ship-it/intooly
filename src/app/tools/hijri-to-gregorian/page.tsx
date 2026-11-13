'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight, Calendar, Copy, Check, AlertCircle,
  Clock, ChevronDown,
} from 'lucide-react';
import {
  hijriToGregorian, gregorianToHijri, getTodayBoth,
  HIJRI_MONTHS, GREGORIAN_MONTHS,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR, MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
  type ConversionResult,
} from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';
import LiveClock from '@/components/hijri/LiveClock';
import ConversionHistory, { saveConversion } from '@/components/hijri/ConversionHistory';
import HijriCalendar from '@/components/hijri/HijriCalendar';
import DateDifference from '@/components/hijri/DateDifference';
import AddSubtractDays from '@/components/hijri/AddSubtractDays';
import IslamicEvents from '@/components/hijri/IslamicEvents';
import DocumentExpiry from '@/components/hijri/DocumentExpiry';
import ShareResult from '@/components/hijri/ShareResult';

type Direction = 'hijri-to-gregorian' | 'gregorian-to-hijri';

function toArabicDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const relatedTools = [
  { title: 'حاسبة العمر', description: 'احسب عمرك بالسنوات والأشهر والأيام.', href: '/tools/age-calculator', icon: '🎂' },
  { title: 'حاسبة النسبة المئوية', description: 'احسب النسب المئوية بسهولة.', href: '/tools/percentage-calculator', icon: '%' },
  { title: 'حاسبة مؤشر كتلة الجسم', description: 'احسب BMI من الطول والوزن.', href: '/tools/bmi-calculator', icon: '⚖️' },
  { title: 'عداد الكلمات', description: 'احسب الكلمات والحروف في النصوص.', href: '/tools/word-counter', icon: 'Aa' },
];

export default function HijriPage() {
  const [direction, setDirection] = useState<Direction>('hijri-to-gregorian');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [today, setToday] = useState<{ hijri: string; gregorian: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [useArabic, setUseArabic] = useState(true);

  const [hYear, setHYear] = useState(1447);
  const [hMonth, setHMonth] = useState(1);
  const [hDay, setHDay] = useState(1);
  const [gYear, setGYear] = useState(new Date().getFullYear());
  const [gMonth, setGMonth] = useState(1);
  const [gDay, setGDay] = useState(1);

  useEffect(() => {
    const { gregorian, hijri } = getTodayBoth();
    if (hijri) {
      setToday({
        hijri: `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} هـ`,
        gregorian: `${gregorian.day} ${GREGORIAN_MONTHS[gregorian.month - 1]} ${gregorian.year} م`,
      });
    }
  }, []);

  useEffect(() => {
    let res: ConversionResult | null = null;
    if (direction === 'hijri-to-gregorian') {
      if (hYear && hMonth && hDay) {
        res = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
        setResult(res);
      }
    } else {
      if (gYear && gMonth && gDay) {
        res = gregorianToHijri({ year: gYear, month: gMonth, day: gDay });
        setResult(res);
      }
    }
    setCopied(false);

    // حفظ في السجل عند نجاح التحويل
    if (res && res.success && res.hijriFormatted && res.gregorianFormatted) {
      saveConversion({
        direction,
        hijriText: res.hijriFormatted,
        gregorianText: res.gregorianFormatted,
      });
    }
  }, [direction, hYear, hMonth, hDay, gYear, gMonth, gDay]);

  const fillToday = () => {
    const { gregorian, hijri } = getTodayBoth();
    if (hijri) { setHYear(hijri.year); setHMonth(hijri.month); setHDay(hijri.day); }
    setGYear(gregorian.year); setGMonth(gregorian.month); setGDay(gregorian.day);
  };

  const swapDirection = () => {
    if (direction === 'hijri-to-gregorian') {
      if (result?.gregorian) {
        setGYear(result.gregorian.year); setGMonth(result.gregorian.month); setGDay(result.gregorian.day);
      }
      setDirection('gregorian-to-hijri');
    } else {
      if (result?.hijri) {
        setHYear(result.hijri.year); setHMonth(result.hijri.month); setHDay(result.hijri.day);
      }
      setDirection('hijri-to-gregorian');
    }
    setResult(null);
  };

  const copyResult = () => {
    if (!result?.success) return;
    const text = direction === 'hijri-to-gregorian' ? (result.gregorianFormatted || '') : (result.hijriFormatted || '');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displayValue = (val: string) => useArabic ? toArabicDigits(val) : val;
  const hijriDays = 30;
  const gregorianDays = useMemo(() => new Date(gYear, gMonth, 0).getDate(), [gYear, gMonth]);

  useEffect(() => {
    if (direction === 'gregorian-to-hijri' && gDay > gregorianDays) setGDay(gregorianDays);
  }, [gregorianDays, direction, gDay]);

  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <LiveClock />
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">محول التاريخ</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Calendar size={16} />
            محول أم القرى - دقة 100%
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            تحويل الهجري إلى ميلادي والميلادي إلى هجري
          </h1>
          <p className="mt-4 text-slate-600">
            حوّل التاريخ بين التقويم الهجري (أم القرى) والتقويم الميلادي بدقة، في الاتجاهين، مع اسم اليوم ونسخ النتيجة.
          </p>
        </header>

        {today && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 flex-wrap">
            <Clock size={20} className="text-blue-600 shrink-0" />
            <span className="font-bold text-blue-900">تاريخ اليوم:</span>
            <span className="font-mono bg-white px-3 py-1 rounded-lg text-sm">{today.hijri}</span>
            <span className="text-blue-700">=</span>
            <span className="font-mono bg-white px-3 py-1 rounded-lg text-sm">{today.gregorian}</span>
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <button onClick={() => { setDirection('hijri-to-gregorian'); setResult(null); }} className={`rounded-2xl border-2 p-4 text-center font-bold transition ${direction === 'hijri-to-gregorian' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}>
              <div className="text-sm">من</div>
              <div className="text-xl">هجري ← ميلادي</div>
            </button>
            <button onClick={swapDirection} className="mx-auto rounded-full bg-slate-100 hover:bg-orange-100 p-3 text-slate-600 hover:text-orange-700 transition" title="تبديل الاتجاه">
              <ArrowLeftRight size={20} />
            </button>
            <button onClick={() => { setDirection('gregorian-to-hijri'); setResult(null); }} className={`rounded-2xl border-2 p-4 text-center font-bold transition ${direction === 'gregorian-to-hijri' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}>
              <div className="text-sm">من</div>
              <div className="text-xl">ميلادي ← هجري</div>
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" />
              {direction === 'hijri-to-gregorian' ? 'أدخل التاريخ الهجري' : 'أدخل التاريخ الميلادي'}
            </h2>
            <div className="flex gap-2">
              <button onClick={fillToday} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 text-blue-700 px-3 py-2 text-sm font-bold hover:bg-blue-200 transition">
                <Clock size={14} /> تاريخ اليوم
              </button>
              <label className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-slate-200 transition">
                <input type="checkbox" checked={useArabic} onChange={(e) => setUseArabic(e.target.checked)} className="accent-orange-600" />
                أرقام عربية
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {direction === 'hijri-to-gregorian' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={hDay} onChange={(e) => setHDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: hijriDays }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{displayValue(String(d))}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i).map((y) => <option key={y} value={y}>{displayValue(String(y))}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={gDay} onChange={(e) => setGDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: gregorianDays }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{displayValue(String(d))}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={gYear} onChange={(e) => setGYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i).map((y) => <option key={y} value={y}>{displayValue(String(y))}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {result && (
          <div className="mb-6">
            {result.success ? (
              <div className="rounded-3xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <Check size={22} className="text-green-600" /> النتيجة
                  </h3>
                  <button onClick={copyResult} className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-bold hover:bg-green-700 transition">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'تم النسخ!' : 'نسخ النتيجة'}
                  </button>
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-green-700 font-semibold mb-2">
                    {direction === 'hijri-to-gregorian' ? 'التاريخ الميلادي المقابل' : 'التاريخ الهجري المقابل'}
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-green-900 leading-relaxed" dir="ltr">
                    {direction === 'hijri-to-gregorian' ? displayValue(result.gregorianFormatted || '') : displayValue(result.hijriFormatted || '')}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl bg-white p-3 text-center border border-green-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">اسم اليوم</p>
                    <p className="font-bold text-slate-900">{result.dayOfWeek}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center border border-green-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">التاريخ الهجري</p>
                    <p className="font-mono text-sm font-bold text-slate-900" dir="ltr">{displayValue(result.hijriNumeric || '')}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center border border-green-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1">التاريخ الميلادي</p>
                    <p className="font-mono text-sm font-bold text-slate-900" dir="ltr">{displayValue(result.gregorianNumeric || '')}</p>
                  </div>
                </div>

                {/* زر المشاركة */}
                <div className="mt-3 text-center">
                  <ShareResult
                    hijriText={result.hijriFormatted || ''}
                    gregorianText={result.gregorianFormatted || ''}
                    direction={direction}
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">خطأ في التحويل</p>
                  <p className="text-sm text-red-700 mt-1">{result.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <ConversionHistory />

        <div className="mt-6">
          <HijriCalendar />
        </div>

        <div className="mt-6">
          <DateDifference />
        </div>

        <div className="mt-6">
          <AddSubtractDays />
        </div>

        <div className="mt-6">
          <IslamicEvents />
        </div>

        <div className="mt-6">
          <DocumentExpiry />
        </div>

        {/* صفحات ذات صلة */}
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4 text-center">صفحات ذات صلة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/tools/hijri-to-gregorian/hijri-today"
              className="group rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                📅
              </div>
              <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-emerald-700">
                التاريخ الهجري اليوم
              </h3>
              <p className="text-sm leading-6 text-slate-600">
                اعرف تاريخ اليوم بالهجري والميلادي مباشرة مع اسم اليوم والساعة الحية.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                اذهب للصفحة ←
              </span>
            </Link>
          </div>
        </div>

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">تحويل الهجري إلى ميلادي والميلادي إلى هجري أونلاين مجاناً</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>هل تريد <strong>تحويل التاريخ الهجري إلى ميلادي</strong> أو معرفة التاريخ الهجري المقابل لتاريخ ميلادي معين؟ يوفر لك محول التاريخ من Intooly طريقة سهلة وسريعة لتحويل التواريخ بين التقويم الهجري والتقويم الميلادي، دون الحاجة إلى إجراء الحسابات يدوياً.</p>
              <p>أدخل اليوم والشهر والسنة، وحدد اتجاه التحويل الذي تريده، لتحصل على التاريخ المقابل مع إمكانية معرفة اسم اليوم ونسخ النتيجة. يمكنك استخدام الأداة لتحويل تاريخ الميلاد، ومواعيد المناسبات، والتواريخ الموجودة في الوثائق والمعاملات.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">محول التاريخ الهجري والميلادي</h2>
            <p className="text-slate-700 leading-8 mb-4">تتيح لك أداة تحويل التاريخ إجراء التحويل في الاتجاهين:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li><strong>تحويل الهجري إلى ميلادي:</strong> أدخل التاريخ الهجري لمعرفة ما يوافقه في التقويم الميلادي.</li>
              <li><strong>تحويل الميلادي إلى هجري:</strong> أدخل التاريخ الميلادي لمعرفة التاريخ الهجري المقابل له.</li>
            </ul>
            <p className="text-slate-700 leading-8 mt-4">تم تصميم المحول ليكون سهل الاستخدام على الكمبيوتر والهاتف، مع واجهة عربية واضحة ونتيجة مباشرة دون خطوات معقدة.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيفية تحويل التاريخ من هجري إلى ميلادي؟</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li>افتح أداة تحويل الهجري إلى ميلادي.</li>
              <li>اختر وضع التحويل من هجري إلى ميلادي.</li>
              <li>أدخل اليوم الهجري.</li>
              <li>حدد الشهر الهجري والسنة الهجرية.</li>
              <li>اضغط على زر التحويل.</li>
              <li>ستظهر لك النتيجة بالتاريخ الميلادي المقابل.</li>
            </ol>
            <p className="text-slate-700 leading-8 mt-4">يمكنك بعد ذلك نسخ التاريخ الناتج والاحتفاظ به لاستخدامه في المستندات أو المواعيد أو المعاملات.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيفية تحويل التاريخ من ميلادي إلى هجري؟</h2>
            <p className="text-slate-700 leading-8 mb-3">إذا كان لديك تاريخ ميلادي وتريد معرفة ما يوافقه بالتقويم الهجري، يمكنك استخدام الاتجاه العكسي في المحول:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li>اختر التحويل من ميلادي إلى هجري.</li>
              <li>أدخل اليوم والشهر والسنة الميلادية.</li>
              <li>اضغط على زر التحويل.</li>
              <li>ستظهر لك النتيجة بالتاريخ الهجري المقابل.</li>
            </ol>
            <p className="text-slate-700 leading-8 mt-4">تساعدك هذه الخاصية على معرفة التاريخ الهجري لأي يوم ميلادي، بما في ذلك تواريخ الميلاد والمناسبات والمواعيد الشخصية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">مميزات محول التاريخ الهجري والميلادي من Intooly</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'تحويل في الاتجاهين', d: 'تحويل التاريخ من هجري إلى ميلادي ومن ميلادي إلى هجري.' },
                { t: 'سهولة الاستخدام', d: 'واجهة عربية بسيطة لإدخال اليوم والشهر والسنة.' },
                { t: 'نتائج واضحة', d: 'عرض التاريخ المحوّل بطريقة سهلة القراءة.' },
                { t: 'معرفة يوم الأسبوع', d: 'إظهار اسم اليوم الذي يوافق التاريخ.' },
                { t: 'نسخ النتيجة', d: 'نسخ التاريخ المحوّل بسرعة بضغطة زر.' },
                { t: 'دعم الأرقام العربية والإنجليزية', d: 'إدخال التواريخ وقراءتها بأكثر من صيغة.' },
                { t: 'التحقق من التاريخ', d: 'التنبيه عند إدخال تاريخ غير صالح أو خارج النطاق.' },
                { t: 'متوافق مع الهاتف', d: 'استخدام المحول على الجوال والكمبيوتر والأجهزة اللوحية.' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Check size={18} className="text-green-600" />
                    <h3 className="font-bold text-slate-900">{item.t}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-7">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما الفرق بين التقويم الهجري والتقويم الميلادي؟</h2>
            <p className="text-slate-700 leading-8 mb-3">التقويم الهجري تقويم قمري يعتمد على دورة القمر، ويتكون من اثني عشر شهراً، ويبلغ طول السنة فيه نحو 354 أو 355 يوماً. أما التقويم الميلادي فهو تقويم شمسي يعتمد على دورة الأرض حول الشمس، وتتكون سنته عادةً من 365 يوماً أو 366 يوماً في السنة الكبيسة.</p>
            <p className="text-slate-700 leading-8">لهذا السبب يتقدم التاريخ الهجري كل عام بالنسبة إلى التاريخ الميلادي بنحو عشرة أو أحد عشر يوماً تقريباً، وتتغير مواعيد المناسبات الإسلامية بالنسبة إلى التقويم الميلادي من سنة إلى أخرى.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">لماذا قد يختلف التاريخ الهجري من دولة إلى أخرى؟</h2>
            <p className="text-slate-700 leading-8 mb-3">قد يختلف بداية الشهر الهجري بين بعض الدول بسبب اختلاف طرق إثبات دخول الشهر، مثل الاعتماد على رؤية الهلال محلياً أو استخدام تقاويم حسابية معتمدة.</p>
            <p className="text-slate-700 leading-8">لذلك قد تظهر نتيجة مختلفة بيوم واحد بين تقويم أم القرى المستخدم في المملكة العربية السعودية وبعض التقاويم المحلية الأخرى. من المهم معرفة نوع التقويم الذي يعتمد عليه المحول، خاصة عند استخدام النتيجة في المواعيد الرسمية أو المناسبات الدينية.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">متى تحتاج إلى تحويل التاريخ الهجري إلى ميلادي؟</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li>تحويل تاريخ الميلاد المكتوب بالتقويم الهجري إلى تاريخ ميلادي.</li>
              <li>معرفة التاريخ الهجري المقابل لموعد ميلادي.</li>
              <li>تحويل تواريخ الوثائق والشهادات والمعاملات.</li>
              <li>مراجعة التواريخ القديمة المكتوبة بالتقويم الهجري.</li>
              <li>معرفة التاريخ الميلادي للمناسبات الإسلامية.</li>
              <li>إدخال التواريخ في النماذج الإلكترونية التي تتطلب تقويماً معيناً.</li>
              <li>تنظيم المواعيد الشخصية والدراسية والعملية.</li>
              <li>مقارنة التواريخ بين التقويمين الهجري والميلادي.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل تحويل التاريخ الهجري إلى ميلادي دقيق؟</h2>
            <p className="text-slate-700 leading-8">تعتمد دقة النتيجة على التقويم المستخدم وطريقة حساب بداية الأشهر الهجرية. هذه الأداة تعتمد تقويم أم القرى (المستخدم في المملكة العربية السعودية)، وقد تختلف النتيجة بيوم واحد عن التاريخ المعلن في دولة تعتمد رؤية الهلال المحلية. لذلك يُنصح بمراجعة الجهة الرسمية المختصة عند استخدام التواريخ في المعاملات القانونية أو الوثائق المهمة.</p>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">استخدم محول التاريخ مجاناً</h2>
            <p className="text-orange-50 leading-8 mb-5 max-w-2xl mx-auto">بدلاً من البحث عن جداول تحويل التاريخ الهجري والميلادي أو إجراء الحسابات يدوياً، استخدم محول Intooly لتحويل التاريخ في الاتجاه الذي تحتاج إليه. أدخل التاريخ، واحصل على النتيجة، ثم انسخها لاستخدامها بسهولة.</p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">
              ⬆️ العودة إلى الأداة
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول تحويل الهجري إلى ميلادي</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-orange-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl font-extrabold text-orange-600 transition group-hover:bg-orange-100">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-orange-700 text-sm">{tool.title}</h3>
                  <p className="text-xs leading-6 text-slate-500">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}