'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Cake, Copy, Check, Share2, ArrowRight } from 'lucide-react';
import {
  HIJRI_MONTHS, GREGORIAN_MONTHS, ARABIC_DAYS,
  hijriToGregorian, gregorianToHijri,
  MIN_HIJRI_YEAR, MAX_HIJRI_YEAR,
  MIN_GREGORIAN_YEAR, MAX_GREGORIAN_YEAR,
} from '@/lib/hijri/convert';
import { faqQuestions } from './faq-data';

type Direction = 'gregorian' | 'hijri';

const relatedTools = [
  { title: 'حساب العمر بالهجري', description: 'احسب عمرك بالتقويم الهجري والميلادي.', href: '/tools/hijri-to-gregorian/age-calculator', icon: '🎂' },
  { title: 'محول التاريخ الكامل', description: 'تحويل ثنائي الاتجاه + تقويم شهري.', href: '/tools/hijri-to-gregorian', icon: '🔄' },
  { title: 'التاريخ الهجري اليوم', description: 'تاريخ اليوم بالهجري والميلادي.', href: '/tools/hijri-to-gregorian/hijri-today', icon: '📅' },
  { title: 'الأشهر الهجرية', description: 'دليل شامل للأشهر الهجرية.', href: '/tools/hijri-to-gregorian/months', icon: '📆' },
];

export default function BirthDatePage() {
  const [direction, setDirection] = useState<Direction>('gregorian');
  const [copied, setCopied] = useState(false);

  const [gYear, setGYear] = useState(1990);
  const [gMonth, setGMonth] = useState(1);
  const [gDay, setGDay] = useState(1);
  const [hYear, setHYear] = useState(1410);
  const [hMonth, setHMonth] = useState(5);
  const [hDay, setHDay] = useState(5);

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

  const result = useMemo(() => {
    try {
      let gregorian: { year: number; month: number; day: number };
      let hijri: { year: number; month: number; day: number };
      let date: Date;

      if (direction === 'gregorian') {
        gregorian = { year: gYear, month: gMonth, day: gDay };
        const h = gregorianToHijri(gregorian);
        if (!h.success || !h.hijri) {
          return { success: false, error: 'تاريخ ميلادي غير صالح' };
        }
        hijri = h.hijri;
        date = new Date(gYear, gMonth - 1, gDay);
      } else {
        hijri = { year: hYear, month: hMonth, day: hDay };
        const g = hijriToGregorian(hijri);
        if (!g.success || !g.gregorian) {
          return { success: false, error: 'تاريخ هجري غير صالح' };
        }
        gregorian = g.gregorian;
        date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
      }

      const dayOfWeek = ARABIC_DAYS[date.getDay()];

      // حساب العمر
      const today = new Date();
      let ageYears = today.getFullYear() - date.getFullYear();
      let ageMonths = today.getMonth() - date.getMonth();
      let ageDays = today.getDate() - date.getDate();
      if (ageDays < 0) { ageMonths--; ageDays += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
      if (ageMonths < 0) { ageYears--; ageMonths += 12; }

      // العمر بالهجري
      const todayH = gregorianToHijri({ year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() });
      let hijriAgeYears = 0, hijriAgeMonths = 0;
      if (todayH.hijri) {
        hijriAgeYears = todayH.hijri.year - hijri.year;
        hijriAgeMonths = todayH.hijri.month - hijri.month;
        if (hijriAgeMonths < 0) { hijriAgeYears--; hijriAgeMonths += 12; }
      }

      return {
        success: true,
        gregorian,
        hijri,
        dayOfWeek,
        gregorianText: `${gregorian.day} ${GREGORIAN_MONTHS[gregorian.month - 1]} ${gregorian.year} م`,
        hijriText: `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} هـ`,
        ageYears,
        ageMonths,
        ageDays,
        hijriAgeYears,
        hijriAgeMonths,
      };
    } catch (e) {
      return { success: false, error: 'خطأ في الحساب' };
    }
  }, [direction, gYear, gMonth, gDay, hYear, hMonth, hDay]);

  const copyResult = () => {
    if (!result.success) return;
    const text = `تاريخ الميلاد:\n${result.hijriText}\n${result.gregorianText}\n${result.dayOfWeek}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareResult = () => {
    if (!result.success) return;
    const text = `تاريخ ميلادي: ${result.hijriText} = ${result.gregorianText}. جرّب الحاسبة: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'تحويل تاريخ الميلاد', text }).catch(() => {});
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

        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/hijri-to-gregorian" className="font-medium transition hover:text-orange-600">محول التاريخ</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">تحويل تاريخ الميلاد</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-sm font-semibold text-purple-700">
            <Cake size={16} />
            هجري ↔ ميلادي
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            تحويل تاريخ الميلاد من هجري إلى ميلادي والعكس
          </h1>
          <p className="mt-4 text-slate-600">
            حوّل تاريخ ميلادك بين التقويم الهجري والميلادي بدقة، مع اسم اليوم والعمر الحالي.
          </p>
        </header>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDirection('gregorian')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'gregorian' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'}`}
            >
              من ميلادي ← هجري
            </button>
            <button
              onClick={() => setDirection('hijri')}
              className={`flex-1 rounded-xl border-2 py-2.5 px-3 text-sm font-bold transition ${direction === 'hijri' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-300'}`}
            >
              من هجري ← ميلادي
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            {direction === 'gregorian' ? 'أدخل تاريخ الميلاد الميلادي' : 'أدخل تاريخ الميلاد الهجري'}
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {direction === 'gregorian' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={gDay} onChange={(e) => setGDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {Array.from({ length: daysInMonth(gYear, gMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={gMonth} onChange={(e) => setGMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {GREGORIAN_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={gYear} onChange={(e) => setGYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {gYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">اليوم</label>
                  <select value={hDay} onChange={(e) => setHDay(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الشهر</label>
                  <select value={hMonth} onChange={(e) => setHMonth(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {HIJRI_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">السنة</label>
                  <select value={hYear} onChange={(e) => setHYear(Number(e.target.value))} className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-purple-500 outline-none">
                    {hYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {result.success ? (
            <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                  <Check size={20} className="text-purple-600" />
                  تاريخ الميلاد
                </h3>
                <div className="flex gap-2">
                  <button onClick={copyResult} className="inline-flex items-center gap-1 rounded-lg bg-purple-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-purple-700 transition">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                  <button onClick={shareResult} className="inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-bold hover:bg-blue-200 transition">
                    <Share2 size={12} /> مشاركة
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">التاريخ الهجري</p>
                  <p className="font-bold text-purple-900">{result.hijriText}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">التاريخ الميلادي</p>
                  <p className="font-bold text-slate-900">{result.gregorianText}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">يوم الميلاد</p>
                  <p className="font-bold text-slate-900">{result.dayOfWeek}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-purple-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">العمر الحالي</p>
                  <p className="font-bold text-slate-900">{result.ageYears} سنة ({result.hijriAgeYears} هجرية)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {result.error}
            </div>
          )}
        </div>

        {/* SEO CONTENT */}
        <article className="space-y-12 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 mt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">لماذا تحتاج تحويل تاريخ الميلاد؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>تحويل تاريخ الميلاد</strong> من هجري إلى ميلادي أو العكس مفيد في حالات كثيرة. كثير من الوثائق الرسمية في السعودية (الهوية، شهادة الميلاد، جواز السفر) تستخدم التقويم الهجري، بينما الوثائق الدولية تستخدم الميلادي.
              </p>
              <p>
                إذا كنت تريد التقديم على وظيفة أو دراسة في الخارج، أو تجديد وثيقة، أو ملء نموذج إلكتروني، ستحتاج أحياناً إلى تاريخ ميلادك في التقويم الآخر.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تحول تاريخ ميلادك؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <ol className="list-decimal list-inside space-y-2 pr-2">
                <li><strong>اختر الاتجاه:</strong> "من ميلادي ← هجري" أو "من هجري ← ميلادي".</li>
                <li><strong>أدخل التاريخ:</strong> اليوم، الشهر، السنة.</li>
                <li><strong>اطلع على النتيجة:</strong> ستظهر في التقويمين، مع اسم اليوم.</li>
                <li><strong>انسخ أو شارك:</strong> انسخ النتيجة لاستخدامها في الوثائق.</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل تاريخ ميلادي يظل ثابتاً في التقويمين؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                نعم، <strong>تاريخ ميلادك ثابت</strong>. لكنه يظهر بتواريخ مختلفة في كل تقويم. على سبيل المثال، إذا وُلدت في 1 يناير 1990 م، فقد يكون تاريخ ميلادك الهجري 5 جمادى الآخرة 1410 هـ. عند تحويلهما، ستحصل على نفس اليوم.
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">هل تريد حساب عمرك بالهجري؟</h2>
            <p className="text-purple-50 leading-8 mb-5 max-w-2xl mx-auto">
              استخدم حاسبة العمر بالهجري لمعرفة عمرك بالسنوات والأشهر والأيام في التقويمين.
            </p>
            <Link href="/tools/hijri-to-gregorian/age-calculator" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-purple-700 transition hover:bg-purple-50">
              حاسبة العمر <ArrowRight size={16} />
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول تحويل تاريخ الميلاد</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-purple-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 transition group-open:rotate-45">+</span>
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
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-purple-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-purple-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>

      </div>
    </main>
  );
}