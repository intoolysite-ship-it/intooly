"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Baby, Heart, Printer, Share2, Info, CheckCircle2 } from "lucide-react";

type CalcMethod = "lmp" | "conception" | "ultrasound" | "ivf";

export default function PregnancyCalculatorPage() {
  const [method, setMethod] = useState<CalcMethod>("lmp");
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [conceptionDate, setConceptionDate] = useState("");
  const [ultrasoundDate, setUltrasoundDate] = useState("");
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState("");
  const [ultrasoundDays, setUltrasoundDays] = useState("");
  const [ivfDate, setIvfDate] = useState("");
  const [ivfType, setIvfType] = useState("day5");

  const [result, setResult] = useState<any>(null);

  const calculatePregnancy = () => {
    let dueDate = new Date();
    let startDate = new Date();

    if (method === "lmp" && lmpDate) {
      startDate = new Date(lmpDate);
      dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + 280 + (cycleLength - 28));
    } else if (method === "conception" && conceptionDate) {
      startDate = new Date(conceptionDate);
      startDate.setDate(startDate.getDate() - 14); // LMP equivalent
      dueDate = new Date(new Date(conceptionDate));
      dueDate.setDate(dueDate.getDate() + 266);
    } else if (method === "ultrasound" && ultrasoundDate && ultrasoundWeeks) {
      const usDate = new Date(ultrasoundDate);
      const usDays = (parseInt(ultrasoundWeeks) * 7) + (parseInt(ultrasoundDays) || 0);
      startDate = new Date(usDate);
      startDate.setDate(startDate.getDate() - (280 - usDays)); // Back calculate LMP
      dueDate = new Date(usDate);
      dueDate.setDate(dueDate.getDate() + (280 - usDays));
    } else if (method === "ivf" && ivfDate) {
      const transferDate = new Date(ivfDate);
      startDate = new Date(transferDate);
      if (ivfType === "day3") {
        startDate.setDate(startDate.getDate() - 17); // 14 + 3
        dueDate = new Date(transferDate);
        dueDate.setDate(dueDate.getDate() + 263);
      } else {
        startDate.setDate(startDate.getDate() - 19); // 14 + 5
        dueDate = new Date(transferDate);
        dueDate.setDate(dueDate.getDate() + 261);
      }
    } else {
      return;
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const currentWeeks = Math.floor(diffDays / 7);
    const currentDays = diffDays % 7;
    const daysRemaining = 280 - diffDays;
    const weeksRemaining = Math.floor(daysRemaining / 7);
    
    let trimester = 1;
    if (currentWeeks >= 14 && currentWeeks <= 27) trimester = 2;
    else if (currentWeeks >= 28) trimester = 3;

    const progress = Math.min((diffDays / 280) * 100, 100);

    // Native Hijri Conversion
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' });
    const gregorianFormatter = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });

    setResult({
      currentWeeks,
      currentDays,
      daysRemaining: Math.max(0, daysRemaining),
      weeksRemaining: Math.max(0, weeksRemaining),
      trimester,
      progress,
      dueDateGregorian: gregorianFormatter.format(dueDate),
      dueDateHijri: hijriFormatter.format(dueDate),
      startDateGregorian: gregorianFormatter.format(startDate),
      startDateHijri: hijriFormatter.format(startDate),
      conceptionDateGregorian: gregorianFormatter.format(new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000)))
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900 print:bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500 print:hidden">
          <Link href="/tools/health" className="font-medium transition hover:text-orange-600">الصحة واللياقة البدنية</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">حاسبة الحمل</span>
        </nav>

        <header className="mb-8 text-right print:hidden">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Heart size={16} />
            أداة مجانية 100% - خصوصية تامة (المعالجة محلياً)
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            حاسبة الحمل – احسبي عمر الحمل وموعد الولادة بدقة
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            باستخدام حاسبة الحمل من Intooly يمكنك حساب عمر الحمل بالأسابيع والأيام، وتحديد موعد الولادة المتوقع، ومعرفة مرحلة الحمل الحالية بسهولة.
          </p>
        </header>

        {/* Calculator Interface */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 print:border-none print:shadow-none print:p-0">
          <div className="mb-6 flex flex-wrap gap-2 print:hidden">
            {[
              { id: "lmp", label: "آخر دورة شهرية" },
              { id: "conception", label: "تاريخ الإخصاب" },
              { id: "ultrasound", label: "تاريخ السونار" },
              { id: "ivf", label: "الحقن المجهري" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id as CalcMethod); setResult(null); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  method === m.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {method === "lmp" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">أول يوم من آخر دورة شهرية</label>
                  <input type="date" value={lmpDate} onChange={(e) => setLmpDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">متوسط طول الدورة (بالأيام)</label>
                  <input type="number" value={cycleLength} onChange={(e) => setCycleLength(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
              </>
            )}

            {method === "conception" && (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">تاريخ الإخصاب التقريبي</label>
                <input type="date" value={conceptionDate} onChange={(e) => setConceptionDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              </div>
            )}

            {method === "ultrasound" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">تاريخ فحص السونار</label>
                  <input type="date" value={ultrasoundDate} onChange={(e) => setUltrasoundDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">عمر الحمل وقت الفحص (أسابيع)</label>
                    <input type="number" value={ultrasoundWeeks} onChange={(e) => setUltrasoundWeeks(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">وأيام</label>
                    <input type="number" value={ultrasoundDays} onChange={(e) => setUltrasoundDays(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  </div>
                </div>
              </>
            )}

            {method === "ivf" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">تاريخ نقل الأجنة</label>
                  <input type="date" value={ivfDate} onChange={(e) => setIvfDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">عمر الجنين عند النقل</label>
                  <select value={ivfType} onChange={(e) => setIvfType(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                    <option value="day3">3 أيام</option>
                    <option value="day5">5 أيام (Blastocyst)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={calculatePregnancy} 
            className="mt-8 w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-orange-700 print:hidden"
          >
            احسبي الحمل وموعد الولادة
          </button>

          {/* Results Section */}
          {result && (
            <div className="mt-8 space-y-6 print:mt-4">
              <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 print:border-2 print:border-slate-800 print:bg-white">
                <div className="flex flex-col items-center text-center sm:flex-row sm:justify-between sm:text-right">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-2xl font-extrabold text-orange-900">عمر الحمل الحالي</h2>
                    <p className="text-4xl font-black text-orange-600 mt-2">
                      الأسبوع {result.currentWeeks} و {result.currentDays} أيام
                    </p>
                    <p className="mt-2 text-slate-600">الثلث {result.trimester === 1 ? "الأول" : result.trimester === 2 ? "الثاني" : "الثالث"} من الحمل</p>
                  </div>
                  <div className="w-full max-w-xs sm:pl-8">
                    <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                      <span>تقدم الحمل</span>
                      <span>{Math.round(result.progress)}%</span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-slate-200">
                      <div className="h-4 rounded-full bg-orange-500 transition-all duration-1000" style={{ width: `${result.progress}%` }}></div>
                    </div>
                    <p className="mt-2 text-center text-sm text-slate-600">
                      متبقي {result.weeksRemaining} أسبوع و {result.daysRemaining % 7} يوم
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-500">موعد الولادة المتوقع (ميلادي)</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{result.dueDateGregorian}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-500">موعد الولادة المتوقع (هجري)</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{result.dueDateHijri}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-500">تاريخ بداية الحمل التقديري</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{result.startDateGregorian}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-500">تاريخ الإخصاب التقديري</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{result.conceptionDateGregorian}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 print:hidden">
                <button onClick={handlePrint} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Printer size={18} /> طباعة / حفظ كـ PDF
                </button>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 print:hidden">
                <div className="flex items-start gap-2">
                  <Info size={18} className="mt-0.5 flex-shrink-0" />
                  <p>تنبيه طبي: هذه الحاسبة تقدم تقديرات مبنية على معادلات طبية قياسية. لا تغني عن متابعة الطبيب أو فحص السونار، وقد يختلف موعد الولادة الفعلي عن التاريخ المتوقع.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10 print:hidden">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي حاسبة الحمل؟</h2>
            <p className="mt-3 leading-8 text-slate-600">حاسبة الحمل هي أداة إلكترونية تساعد المرأة الحامل على تقدير عمر الحمل وموعد الولادة المتوقع، اعتمادًا على مجموعة من التواريخ والمعلومات المتعلقة بالدورة الشهرية أو الحمل.</p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيف يتم حساب الحمل من آخر دورة شهرية؟</h2>
            <p className="mt-3 leading-8 text-slate-600">تُعد طريقة حساب الحمل من آخر دورة شهرية من الطرق الشائعة. يبدأ الحساب من أول يوم في آخر دورة شهرية، ويُحسب بإضافة 280 يومًا (40 أسبوعًا)، مع مراعاة تعديل بسيط إذا كان طول دورتك يختلف عن 28 يومًا.</p>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/bmi-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة مؤشر كتلة الجسم (BMI)</span>
                <span className="text-sm text-slate-600">تابعي وزنك الصحي أثناء الحمل</span>
              </Link>
              <Link href="/tools/calorie-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة السعرات الحرارية</span>
                <span className="text-sm text-slate-600">احسبي احتياجك الغذائي اليومي</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول حاسبة الحمل</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "كيف أحسب حملي من آخر دورة شهرية؟", a: "أدخلي أول يوم من آخر دورة شهرية في حاسبة الحمل، ثم اضغطي على زر الحساب. ستظهر نتيجة تقديرية لعمر الحمل بالأسابيع والأيام." },
                { q: "كم أسبوعًا يستمر الحمل؟", a: "يُقدّر الحمل عادةً بنحو 40 أسبوعًا، أي 280 يومًا، عند حسابه من أول يوم في آخر دورة شهرية." },
                { q: "هل يمكن حساب الحمل إذا كانت الدورة غير منتظمة؟", a: "يمكن إدخال متوسط طول الدورة لتعديل التقدير، لكن يُنصح بتحديد عمر الحمل مع الطبيب باستخدام السونار." },
                { q: "هل يمكن استخدام الحاسبة بعد الحقن المجهري؟", a: "نعم، من خلال إدخال تاريخ نقل الجنين وعمره وقت النقل (3 أيام أو 5 أيام)." }
              ].map((item, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-orange-200 open:bg-orange-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { background: white; color: black; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:border-none { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:grid-cols-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        }
      `}</style>
    </main>
  );
}