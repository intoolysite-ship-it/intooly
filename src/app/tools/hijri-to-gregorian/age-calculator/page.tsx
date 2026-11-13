'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Cake, Copy, Check, Share2, ArrowRight, Sparkles, Clock,
} from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
} from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';

type Direction = 'gregorian' | 'hijri';

function toArabicDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const relatedTools = [
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري + مناسبات.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي مباشرة.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'حاسبة العمر الميلادية', description: 'احسب عمرك بالتقويم الميلادي فقط.', href: '/tools/age-calculator', icon: '🎂' },
  { title: 'الفرق بين تاريخين', description: 'احسب الفرق بين أي تاريخين.', href: '/tools/hijri-to-gregorian/date-difference', icon: '📊' },
];

export default function AgeCalculatorPage() {
  const [direction, setDirection] = useState<Direction>('gregorian');
  const [copied, setCopied] = useState(false);
  const [useArabic, setUseArabic] = useState(false);

  const today = new Date();

  // تاريخ الميلاد (افتراضي: 1 يناير 1990)
  const [gYear, setGYear] = useState(1990);
  const [gMonth, setGMonth] = useState(1);
  const [gDay, setGDay] = useState(1);
  const [hYear, setHYear] = useState(1410);
  const [hMonth, setHMonth] = useState(5);
  const [hDay, setHDay] = useState(5);

  const displayValue = (val: string) => useArabic ? toArabicDigits(val) : val;

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  const result = useMemo(() => {
    try {
      let birthDate: Date;

      if (direction === 'gregorian') {
        birthDate = new Date(gYear, gMonth - 1, gDay);
      } else {
        const g = hijriToGregorian({ year: hYear, month: hMonth, day: hDay });
        if (!g.success || !g.gregorian) {
          return { success: false, error: 'تاريخ هجري غير صالح' };
        }
        birthDate = new Date(g.gregorian.year, g.gregorian.month - 1, g.gregorian.day);
      }

      if (birthDate > today) {
        return { success: false, error: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
      }

      // حساب العمر بالميلادي
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonthDays;
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // إجمالي الأيام
      const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const totalHours = totalDays * 24;
      const totalMinutes = totalHours * 60;

      // يوم الميلاد
      const dayOfWeek = ARABIC_DAYS[birthDate.getDay()];

      // التاريخ الهجري للميلاد
      const birthHijri = gregorianToHijri({
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
      });

      // حساب العمر بالهجري (تقريبي)
      const todayHijri = gregorianToHijri({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      });

      let hijriYears = 0, hijriMonths = 0, hijriDays = 0;
      if (birthHijri.hijri && todayHijri.hijri) {
        hijriYears = todayHijri.hijri.year - birthHijri.hijri.year;
        hijriMonths = todayHijri.hijri.month - birthHijri.hijri.month;
        hijriDays = todayHijri.hijri.day - birthHijri.hijri.day;

        if (hijriDays < 0) {
          hijriMonths--;
          hijriDays += 30;
        }
        if (hijriMonths < 0) {
          hijriYears--;
          hijriMonths += 12;
        }
      }

      // عيد الميلاد القادم
      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (nextBirthday < today) {
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      }
      const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        success: true,
        years,
        months,
        days,
        totalDays,
        totalWeeks,
        totalHours,
        totalMinutes,
        dayOfWeek,
        birthHijri: birthHijri.hijri,
        birthGregorian: {
          year: birthDate.getFullYear(),
          month: birthDate.getMonth() + 1,
          day: birthDate.getDate(),
        },
        hijriYears,
        hijriMonths,
        hijriDays,
        daysToBirthday,
        nextBirthday,
      };
    } catch (e) {
      return { success: false, error: 'خطأ في الحساب' };
    }
  }, [direction, gYear, gMonth, gDay, hYear, hMonth, hDay]);

  const copyResult = () => {
    if (!result.success) return;
    const text = `العمر: ${result.years} سنة، ${result.months} شهر، ${result.days} يوم\nإجمالي الأيام: ${result.totalDays}\nالعمر بالهجري: ${result.hijriYears} سنة، ${result.hijriMonths} شهر، ${result.hijriDays} يوم`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareResult = () => {
    if (!result.success) return;
    const text = `عمري: ${result.years} سنة ميلادية / ${result.hijriYears} سنة هجرية. احسب عمرك: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'حساب العمر', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const gYearOptions = Array.from({ length: MAX_GREGORIAN_YEAR - MIN_GREGORIAN_YEAR + 1 }, (_, i) => MIN_GREGORIAN_YEAR + i);
  const hYearOptions = Array.from({ length: MAX_HIJRI_YEAR - MIN_HIJRI_YEAR + 1 }, (_, i) => MIN_HIJRI_YEAR + i);

  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/hijri-to-gregorian" className="font-medium transition hover:text-orange-600">محول التاريخ</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">حساب العمر بالهجري</span>
        </nav>

        {/* Header */}
        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1.5 text-sm font-semibold text-pink-700">
            <Cake size={16} />
            حساب دقيق - تقويم أم القرى
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            حساب العمر بالهجري والميلادي
          </h1>
          <p className="mt-4 text-slate-600">
            احسب عمرك بالتقويم الهجري والميلادي بدقة. أدخل تاريخ ميلادك لتعرف عمرك بالسنوات والأشهر والأيام، ويوم ميلادك.
          </p>
        </header>

        {/* أداة الحساب */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {/* اختيار نوع التاريخ */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDirection('gregorian')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'gregorian' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}
            >
              تاريخ ميلادي
            </button>
            <button
              onClick={() => setDirection('hijri')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'hijri' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}
            >
              تاريخ هجري
            </button>
          </div>

          {/* إدخال تاريخ الميلاد */}
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar size={20} className="text-orange-600" />
            تاريخ الميلاد
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {direction === 'gregorian' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={gDay} onChange={(e) => setGDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: daysInMonth(gYear, gMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{displayValue(String(d))}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={gYear} onChange={(e) => setGYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {gYearOptions.map(y => <option key={y} value={y}>{displayValue(String(y))}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={hDay} onChange={(e) => setHDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{displayValue(String(d))}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-orange-500 outline-none">
                    {hYearOptions.map(y => <option key={y} value={y}>{displayValue(String(y))}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* أزرار سريعة */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setUseArabic(!useArabic)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              {useArabic ? '123' : '١٢٣'}
              {useArabic ? ' أرقام إنجليزية' : ' أرقام عربية'}
            </button>
          </div>

          {/* النتيجة */}
          {result.success ? (
            <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <Check size={20} className="text-green-600" />
                  عمرك
                </h3>
                <div className="flex gap-2">
                  <button onClick={copyResult} className="inline-flex items-center gap-1 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-green-700 transition">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                  <button onClick={shareResult} className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-bold hover:bg-blue-200 transition">
                    <Share2 size={12} /> مشاركة
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-green-700 font-semibold mb-1">العمر بالميلادي</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-green-900 leading-relaxed">
                  {displayValue(String(result.years))} سنة
                </p>
                <p className="text-base font-bold text-green-700 mt-1">
                  {displayValue(String(result.months))} شهر، {displayValue(String(result.days))} يوم
                </p>
              </div>

              <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 mb-3">
                <p className="text-sm text-pink-700 font-semibold mb-1 text-center">العمر بالهجري</p>
                <p className="text-center text-xl font-bold text-pink-900">
                  {displayValue(String(result.hijriYears))} سنة، {displayValue(String(result.hijriMonths))} شهر، {displayValue(String(result.hijriDays))} يوم
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xs text-slate-500 mb-1">إجمالي الأيام</p>
                  <p className="font-bold text-slate-900">{displayValue(String(result.totalDays))}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xs text-slate-500 mb-1">الأسابيع</p>
                  <p className="font-bold text-slate-900">{displayValue(String(result.totalWeeks))}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xs text-slate-500 mb-1">الساعات</p>
                  <p className="font-bold text-slate-900">{displayValue((result.totalHours || 0).toLocaleString())}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xs text-slate-500 mb-1">يوم الميلاد</p>
                  <p className="font-bold text-slate-900 text-sm">{result.dayOfWeek}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Cake size={16} className="text-amber-600" />
                  عيد ميلادك القادم بعد {displayValue(String(result.daysToBirthday))} يوم
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {result.error}
            </div>
          )}
        </div>

        {/* ===== SEO CONTENT ===== */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو حساب العمر بالهجري؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>حساب العمر بالهجري</strong> هو حساب عدد السنوات والأشهر والأيام التي عشتها منذ ولادتك، باستخدام التقويم الهجري (القمري) بدلاً من التقويم الميلادي (الشمسي). يُستخدم في المملكة العربية السعودية ودول عربية أخرى.
              </p>
              <p>
                الفرق الأساسي بين العمر الهجري والميلادي هو أن <strong>السنة الهجرية أقصر</strong> من السنة الميلادية. السنة الهجرية 354 يوماً تقريباً، بينما الميلادية 365 يوماً. هذا يعني أن العمر بالهجري يكون <strong>أكبر بسنة أو أكثر</strong> من العمر بالميلادي.
              </p>
              <p>
                على سبيل المثال، إذا كان عمرك 25 سنة ميلادية، فقد يكون عمرك 26 سنة هجرية. الفرق يتراكم مع الوقت، ويزداد كلما تقدمت في العمر.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تحسب عمرك بالهجري؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>لحساب عمرك بالهجري بدقة، اتبع هذه الخطوات:</p>
              <ol className="list-decimal list-inside space-y-2 pr-2 mt-3">
                <li><strong>أدخل تاريخ ميلادك:</strong> اختر "تاريخ هجري" أو "تاريخ ميلادي" (إذا كان تاريخ ميلادك ميلادي، الحاسبة تحوله تلقائياً).</li>
                <li><strong>حدد اليوم والشهر والسنة:</strong> من القوائم المنسدلة.</li>
                <li><strong>اطلع على النتيجة:</strong> ستظهر عمرك بالسنوات والأشهر والأيام في التقويمين.</li>
                <li><strong>انسخ أو شارك:</strong> يمكنك نسخ النتيجة أو مشاركتها مع الآخرين.</li>
              </ol>
              <p className="mt-3">
                الحاسبة تعتمد على <strong>تقويم أم القرى</strong>، وهو التقويم الرسمي في المملكة العربية السعودية. قد يختلف العمر بيوم أو يومين في بعض الدول التي تعتمد الرؤية المحلية للهلال.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">الفرق بين العمر الهجري والميلادي</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                الفرق بين العمر الهجري والميلادي يتراوح بين <strong>سنة واحدة و3 سنوات</strong>، حسب تاريخ الميلاد. يعود السبب إلى أن:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>السنة الهجرية:</strong> 354 يوماً (12 شهراً قمرياً).</li>
                <li><strong>السنة الميلادية:</strong> 365 يوماً (12 شهراً شمسياً).</li>
                <li><strong>الفرق السنوي:</strong> حوالي 11 يوماً.</li>
                <li><strong>التراكم:</strong> كل 33 سنة ميلادية تعادل 34 سنة هجرية.</li>
              </ul>
              <p className="mt-3">
                هذا الفرق مهم في المعاملات الرسمية (مثل التقاعد، الوثائق، العقود)، حيث يُعتمد التقويم الهجري في بعض الدول.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">استخدامات حساب العمر بالهجري</h2>
            <div className="space-y-2 text-slate-700 leading-8">
              <ul className="list-disc list-inside space-y-2 pr-2">
                <li><strong>الوثائق الرسمية:</strong> كثير من الوثائق في السعودية تستخدم التاريخ الهجري (الهوية، جواز السفر، شهادات الميلاد).</li>
                <li><strong>التعليم:</strong> العام الدراسي في السعودية يُخطط وفق التقويم الهجري.</li>
                <li><strong>التقاعد:</strong> سن التقاعد في بعض الدول العربية يُحسب بالهجري.</li>
                <li><strong>العقود والاتفاقيات:</strong> بعض العقود تستخدم التقويم الهجري.</li>
                <li><strong>المعاملات المالية:</strong> بعض البنوك تستخدم التقويم الهجري في الفوائد والأقساط.</li>
                <li><strong>المناسبات العائلية:</strong> تواريخ الميلاد والزواج في الأسر السعودية التقليدية.</li>
                <li><strong>معرفة يوم الميلاد:</strong> معرفة اليوم (السبت، الأحد...) الذي وُلدت فيه.</li>
                <li><strong>عيد الميلاد القادم:</strong> حساب متى يصادف عيد ميلادك القادم.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل العمر الهجري أدق من الميلادي؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                لا يمكن القول إن أحدهما "أدق" من الآخر. <strong>كلاهما دقيق</strong>، لكنهما يقيسان الزمن بطريقتين مختلفتين:
              </p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>العمر الهجري:</strong> يقيس عدد الدورات القمرية منذ ولادتك. مفيد دينياً (الصيام، الزكاة، الحج).</li>
                <li><strong>العمر الميلادي:</strong> يقيس عدد دورات الأرض حول الشمس. مفيد علمياً وطبياً (النمو، التقاعد).</li>
              </ul>
              <p className="mt-3">
                في المعاملات الرسمية السعودية، يُعتمد التقويم الهجري. في المعاملات الدولية، يُعتمد الميلادي. لذلك من المفيد معرفة عمرك في كلا التقويمين.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد المزيد من أدوات التاريخ؟</h2>
            <p className="text-pink-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم محول التاريخ الكامل لتحويل أي تاريخ بين الهجري والميلادي، أو اعرف تاريخ اليوم بالهجري، أو احسب الفرق بين تاريخين.
            </p>
            <Link href="/tools/hijri-to-gregorian" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-pink-700 transition hover:bg-pink-50">
              محول التاريخ الكامل <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول حساب العمر بالهجري</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-pink-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-pink-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-2xl">
                    {tool.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-pink-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-pink-600">
                    استخدام الأداة <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}