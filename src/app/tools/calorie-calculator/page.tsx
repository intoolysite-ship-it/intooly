"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, Activity, Flame, TrendingUp, TrendingDown, Minus, Info, Copy, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";

type UnitSystem = "metric" | "imperial";
type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

type CalcResult = {
  bmr: number;
  tdee: number;
  lose: number;
  maintain: number;
  gain: number;
  protein: { grams: number; calories: number; percent: number };
  carbs: { grams: number; calories: number; percent: number };
  fats: { grams: number; calories: number; percent: number };
};

const activityMultipliers: Record<ActivityLevel, { value: number; label: string; desc: string }> = {
  sedentary: { value: 1.2, label: "خامل", desc: "عمل مكتبي وحركة قليلة جدًا" },
  light: { value: 1.375, label: "نشاط خفيف", desc: "مشي أو تمارين خفيفة 1-3 أيام/أسبوع" },
  moderate: { value: 1.55, label: "نشاط متوسط", desc: "تمارين معتدلة 3-5 أيام/أسبوع" },
  active: { value: 1.725, label: "نشاط مرتفع", desc: "تمارين شاقة 6-7 أيام/أسبوع" },
  veryActive: { value: 1.9, label: "نشاط مرتفع جدًا", desc: "نشاط بدني مكثف أو عمل شاق" },
};

export default function CalorieCalculatorPage() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    setError("");
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const feetNum = parseFloat(heightFeet) || 0;
    const inchesNum = parseFloat(heightInches) || 0;

    if (!ageNum || ageNum < 18 || ageNum > 100) { setError("يرجى إدخال عمر صحيح بين 18 و 100 سنة."); return; }
    if (!weightNum || weightNum < 30 || weightNum > 300) { setError("يرجى إدخال وزن صحيح."); return; }
    
    let heightCm: number;
    if (unit === "metric") {
      if (!heightNum || heightNum < 100 || heightNum > 250) { setError("يرجى إدخال طول صحيح بالسنتيمتر."); return; }
      heightCm = heightNum;
    } else {
      if (feetNum < 3 || feetNum > 8) { setError("يرجى إدخال طول صحيح."); return; }
      heightCm = (feetNum * 30.48) + (inchesNum * 2.54);
    }

    const weightKg = unit === "metric" ? weightNum : weightNum * 0.453592;

    // Mifflin-St Jeor Equation
    const bmr = gender === "male"
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) - 161;

    const tdee = bmr * activityMultipliers[activity].value;
    const lose = Math.round(tdee - 500);
    const maintain = Math.round(tdee);
    const gain = Math.round(tdee + 500);

    // Macro distribution (30% protein, 40% carbs, 30% fats)
    const targetCal = goal === "lose" ? lose : goal === "gain" ? gain : maintain;
    const proteinCal = targetCal * 0.30;
    const carbsCal = targetCal * 0.40;
    const fatsCal = targetCal * 0.30;

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      lose, maintain, gain,
      protein: { grams: Math.round(proteinCal / 4), calories: Math.round(proteinCal), percent: 30 },
      carbs: { grams: Math.round(carbsCal / 4), calories: Math.round(carbsCal), percent: 40 },
      fats: { grams: Math.round(fatsCal / 9), calories: Math.round(fatsCal), percent: 30 },
    });
  };

  const copyResults = () => {
    if (!result) return;
    const text = `حاسبة السعرات الحرارية - Intooly\nBMR: ${result.bmr} سعرة\nTDEE: ${result.tdee} سعرة\nخسارة الوزن: ${result.lose} سعرة\nالمحافظة: ${result.maintain} سعرة\nزيادة الوزن: ${result.gain} سعرة\nالبروتين: ${result.protein.grams}غ | الكربوهيدرات: ${result.carbs.grams}غ | الدهون: ${result.fats.grams}غ`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Calorie Calculator Report - Intooly", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`BMR: ${result.bmr} kcal/day`, 20, 40);
    doc.text(`TDEE: ${result.tdee} kcal/day`, 20, 50);
    doc.text(`Weight Loss: ${result.lose} kcal/day`, 20, 60);
    doc.text(`Maintenance: ${result.maintain} kcal/day`, 20, 70);
    doc.text(`Weight Gain: ${result.gain} kcal/day`, 20, 80);
    doc.text(`Protein: ${result.protein.grams}g (${result.protein.percent}%)`, 20, 100);
    doc.text(`Carbs: ${result.carbs.grams}g (${result.carbs.percent}%)`, 20, 110);
    doc.text(`Fats: ${result.fats.grams}g (${result.fats.percent}%)`, 20, 120);
    doc.setFontSize(10);
    doc.text("Note: These are estimates based on the Mifflin-St Jeor equation.", 20, 140);
    doc.text("Consult a healthcare professional for personalized advice.", 20, 150);
    doc.save("calorie-calculator-report.pdf");
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات والأدوات الحسابية</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">حاسبة السعرات الحرارية</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Flame size={16} />
            حاسبة مجانية 100% - معالجة محلية في متصفحك
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            حساب السعرات الحرارية – احسب احتياجك اليومي من السعرات
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم حاسبة حساب السعرات الحرارية المجانية لمعرفة احتياجك اليومي من السعرات حسب العمر والطول والوزن والنشاط، وحدد سعرات خسارة الوزن أو زيادته أو المحافظة عليه.
          </p>
        </header>

        {/* Calculator Form */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setUnit("metric")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${unit === "metric" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              نظام متري (كجم/سم)
            </button>
            <button onClick={() => setUnit("imperial")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${unit === "imperial" ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              نظام إنجليزي (رطل/بوصة)
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">الجنس</label>
              <div className="flex gap-2">
                <button onClick={() => setGender("male")} className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition ${gender === "male" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:bg-slate-50"}`}>ذكر</button>
                <button onClick={() => setGender("female")} className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition ${gender === "female" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:bg-slate-50"}`}>أنثى</button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">العمر (سنة)</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">الوزن ({unit === "metric" ? "كجم" : "رطل"})</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === "metric" ? "70" : "154"} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                الطول ({unit === "metric" ? "سم" : "قدم وبوصة"})
              </label>
              {unit === "metric" ? (
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
              ) : (
                <div className="flex gap-2">
                  <input type="number" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} placeholder="5" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  <input type="number" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} placeholder="9" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">مستوى النشاط البدني</label>
              <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                {Object.entries(activityMultipliers).map(([key, val]) => (
                  <option key={key} value={key}>{val.label} - {val.desc}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">الهدف</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setGoal("lose")} className={`rounded-xl border px-4 py-3 font-semibold transition ${goal === "lose" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 hover:bg-slate-50"}`}>
                  <TrendingDown className="mx-auto mb-1" size={20} /> خسارة الوزن
                </button>
                <button onClick={() => setGoal("maintain")} className={`rounded-xl border px-4 py-3 font-semibold transition ${goal === "maintain" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:bg-slate-50"}`}>
                  <Minus className="mx-auto mb-1" size={20} /> المحافظة
                </button>
                <button onClick={() => setGoal("gain")} className={`rounded-xl border px-4 py-3 font-semibold transition ${goal === "gain" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 hover:bg-slate-50"}`}>
                  <TrendingUp className="mx-auto mb-1" size={20} /> زيادة الوزن
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle className="inline ml-2" size={18} /> {error}
            </div>
          )}

          <button onClick={calculate} className="mt-6 w-full rounded-xl bg-orange-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-orange-700 active:scale-95">
            <Calculator className="inline ml-2" size={20} /> احسب السعرات الحرارية
          </button>
        </section>

        {/* Results */}
        {result && (
          <section className="mb-10 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
                <TrendingDown className="mx-auto mb-2 text-red-600" size={32} />
                <p className="text-sm font-semibold text-red-700">خسارة الوزن</p>
                <p className="text-3xl font-extrabold text-red-900">{result.lose}</p>
                <p className="text-xs text-red-600">سعرة/يوم</p>
              </div>
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
                <Minus className="mx-auto mb-2 text-blue-600" size={32} />
                <p className="text-sm font-semibold text-blue-700">المحافظة على الوزن</p>
                <p className="text-3xl font-extrabold text-blue-900">{result.maintain}</p>
                <p className="text-xs text-blue-600">سعرة/يوم</p>
              </div>
              <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
                <TrendingUp className="mx-auto mb-2 text-green-600" size={32} />
                <p className="text-sm font-semibold text-green-700">زيادة الوزن</p>
                <p className="text-3xl font-extrabold text-green-900">{result.gain}</p>
                <p className="text-xs text-green-600">سعرة/يوم</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Activity size={20} /> تفاصيل معدل الحرق
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">معدل الأيض الأساسي (BMR)</p>
                  <p className="text-2xl font-bold text-slate-900">{result.bmr} <span className="text-sm font-normal text-slate-500">سعرة/يوم</span></p>
                  <p className="mt-1 text-xs text-slate-500">الطاقة التي يحتاجها جسمك أثناء الراحة التامة</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">إجمالي الاستهلاك اليومي (TDEE)</p>
                  <p className="text-2xl font-bold text-slate-900">{result.tdee} <span className="text-sm font-normal text-slate-500">سعرة/يوم</span></p>
                  <p className="mt-1 text-xs text-slate-500">الطاقة الكلية مع احتساب النشاط البدني</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Flame size={20} /> توزيع المغذيات الكبرى (Macros)
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
                  <p className="text-sm font-semibold text-orange-700">البروتين</p>
                  <p className="text-2xl font-extrabold text-orange-900">{result.protein.grams}غ</p>
                  <p className="text-xs text-orange-600">{result.protein.calories} سعرة ({result.protein.percent}%)</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-700">الكربوهيدرات</p>
                  <p className="text-2xl font-extrabold text-amber-900">{result.carbs.grams}غ</p>
                  <p className="text-xs text-amber-600">{result.carbs.calories} سعرة ({result.carbs.percent}%)</p>
                </div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
                  <p className="text-sm font-semibold text-yellow-700">الدهون</p>
                  <p className="text-2xl font-extrabold text-yellow-900">{result.fats.grams}غ</p>
                  <p className="text-xs text-yellow-600">{result.fats.calories} سعرة ({result.fats.percent}%)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={copyResults} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                {copied ? "تم النسخ!" : "نسخ النتائج"}
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                <Download size={18} /> تصدير PDF
              </button>
            </div>
          </section>
        )}

        {/* SEO Content */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي حاسبة السعرات الحرارية؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              حاسبة السعرات الحرارية هي أداة تساعد على تقدير كمية الطاقة التي يحتاج إليها الجسم خلال اليوم لأداء وظائفه الحيوية وممارسة أنشطته المختلفة. ويختلف هذا الاحتياج من شخص إلى آخر حسب العمر والجنس والطول والوزن ومستوى الحركة والتمارين الرياضية.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيف يتم حساب السعرات الحرارية اليومية؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              يعتمد تقدير احتياج الجسم من السعرات على حساب معدل الأيض الأساسي (BMR) باستخدام معادلة Mifflin-St Jeor العلمية، ثم مراعاة مستوى النشاط البدني للوصول إلى تقدير إجمالي الطاقة المستهلكة خلال اليوم (TDEE).
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="mb-3 font-bold text-slate-900">معادلة Mifflin-St Jeor:</h3>
              <p className="font-mono text-sm text-slate-700">للرجال: BMR = (10 × الوزن كجم) + (6.25 × الطول سم) − (5 × العمر) + 5</p>
              <p className="mt-2 font-mono text-sm text-slate-700">للنساء: BMR = (10 × الوزن كجم) + (6.25 × الطول سم) − (5 × العمر) − 161</p>
              <p className="mt-3 text-sm text-slate-600">ثم: TDEE = BMR × معامل النشاط البدني</p>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما الفرق بين BMR وTDEE؟</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">BMR (معدل الأيض الأساسي)</h3>
                <p className="text-sm text-slate-600">تقدير الطاقة التي يحتاج إليها الجسم للقيام بوظائفه الأساسية أثناء الراحة، مثل التنفس والدورة الدموية.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-2 font-bold text-slate-900">TDEE (إجمالي الاستهلاك اليومي)</h3>
                <p className="text-sm text-slate-600">تقدير إجمالي الطاقة المستهلكة خلال اليوم، بما يشمل النشاط البدني والحركة والتمارين.</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/bmi-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة مؤشر كتلة الجسم (BMI)</span>
                <span className="text-sm text-slate-600">اعرف العلاقة بين طولك ووزنك</span>
              </Link>
              <Link href="/tools/age-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة العمر الدقيقة</span>
                <span className="text-sm text-slate-600">احسب عمرك بالسنوات والأشهر والأيام</span>
              </Link>
              <Link href="/tools/percentage-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة النسبة المئوية</span>
                <span className="text-sm text-slate-600">لحساب النسب والزيادة والنقصان</span>
              </Link>
              <Link href="/tools/calculators" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">جميع الحاسبات</span>
                <span className="text-sm text-slate-600">استكشف المزيد من الأدوات الحسابية</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول حساب السعرات الحرارية</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "كيف أحسب السعرات الحرارية التي يحتاجها جسمي يوميًا؟", a: "تحتاج إلى إدخال العمر والوزن والطول والجنس ومستوى النشاط البدني في حاسبة السعرات الحرارية. تُستخدم هذه البيانات لتقدير معدل الأيض الأساسي ثم إجمالي استهلاك الطاقة اليومي." },
                { q: "كم سعرة حرارية يحتاج الإنسان في اليوم؟", a: "يختلف احتياج السعرات من شخص إلى آخر حسب العمر والوزن والطول والجنس ومستوى النشاط والحالة الصحية. لذلك لا يوجد رقم ثابت يناسب جميع الأشخاص." },
                { q: "ما الفرق بين BMR وTDEE؟", a: "BMR هو معدل الأيض الأساسي (الطاقة أثناء الراحة)، بينما TDEE هو إجمالي استهلاك الطاقة اليومي بما يشمل النشاط البدني." },
                { q: "هل يمكن حساب السعرات الحرارية بدون ممارسة الرياضة؟", a: "نعم، يمكنك حساب احتياجك حتى إذا كان نشاطك محدودًا. اختر مستوى النشاط الذي يعكس حركتك الفعلية." },
                { q: "هل حساب السعرات الحرارية دقيق بنسبة 100%؟", a: "لا، فالنتائج تقديرية وتعتمد على معادلات رياضية وبيانات المستخدم. قد يختلف الاحتياج الفعلي من شخص إلى آخر." },
                { q: "هل نتائج الحاسبة نصيحة طبية؟", a: "لا، النتائج معلومات تقديرية عامة وليست تشخيصًا أو خطة علاجية. استشر مختصًا مؤهلًا عند الحاجة." }
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
    </main>
  );
}