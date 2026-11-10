"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calculator, Percent, TrendingUp, TrendingDown, ShoppingCart, GraduationCap, RefreshCw, Copy, CheckCircle2 } from "lucide-react";

type Tab = "basic" | "change" | "shopping" | "finance" | "study" | "convert";

export default function PercentageCalculatorPage() {
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [decimals, setDecimals] = useState(2);
  const [result, setResult] = useState<string | number>("");
  const [formula, setFormula] = useState("");
  const [copied, setCopied] = useState(false);

  const formatNum = (num: number) => Number(num).toFixed(decimals);

  useEffect(() => {
    calculate();
  }, [activeTab, val1, val2, decimals]);

  const calculate = () => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    let res: number | string = "";
    let form = "";

    if (isNaN(v1) || isNaN(v2)) { setResult(""); setFormula(""); return; }

    switch (activeTab) {
      case "basic":
        // ما هي نسبة v1 من v2؟
        if (v2 === 0) { res = "لا يمكن القسمة على صفر"; form = "غير معرف"; }
        else { res = formatNum((v1 / v2) * 100); form = `(${v1} ÷ ${v2}) × 100 = ${res}%`; }
        break;
      case "change":
        // نسبة التغير من v1 إلى v2
        if (v1 === 0) { res = "لا يمكن القسمة على صفر"; form = "غير معرف"; }
        else { 
          const change = ((v2 - v1) / Math.abs(v1)) * 100;
          res = formatNum(change);
          const direction = change > 0 ? "زيادة" : change < 0 ? "نقصان" : "لا تغيير";
          form = `((${v2} − ${v1}) ÷ |${v1}|) × 100 = ${res}% (${direction})`;
        }
        break;
      case "shopping":
        // السعر v1 بعد خصم v2%
        const discountAmount = v1 * (v2 / 100);
        res = formatNum(v1 - discountAmount);
        form = `${v1} − (${v1} × ${v2}%) = ${res}`;
        break;
      case "finance":
        // إضافة ضريبة/ربح v2% إلى المبلغ v1
        const addAmount = v1 * (v2 / 100);
        res = formatNum(v1 + addAmount);
        form = `${v1} + (${v1} × ${v2}%) = ${res}`;
        break;
      case "study":
        // الدرجة v1 من أصل v2
        if (v2 === 0) { res = "لا يمكن القسمة على صفر"; form = "غير معرف"; }
        else { res = formatNum((v1 / v2) * 100); form = `(${v1} ÷ ${v2}) × 100 = ${res}%`; }
        break;
      case "convert":
        // تحويل v1% إلى عدد عشري
        res = formatNum(v1 / 100);
        form = `${v1} ÷ 100 = ${res}`;
        break;
    }
    setResult(res);
    setFormula(form);
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result}${activeTab !== 'convert' && activeTab !== 'shopping' && activeTab !== 'finance' ? '%' : ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "basic", label: "أساسي", icon: Percent, desc: "نسبة رقم من إجمالي" },
    { id: "change", label: "التغير", icon: TrendingUp, desc: "الزيادة والنقصان" },
    { id: "shopping", label: "التسوق", icon: ShoppingCart, desc: "الخصومات والأسعار" },
    { id: "finance", label: "المالية", icon: Calculator, desc: "الضرائب والأرباح" },
    { id: "study", label: "الدراسة", icon: GraduationCap, desc: "الدرجات والنسب" },
    { id: "convert", label: "تحويل", icon: RefreshCw, desc: "نسبة إلى عشري/كسر" },
  ];

  const getLabels = () => {
    switch (activeTab) {
      case "basic": return { l1: "الجزء", l2: "الإجمالي", p1: "45", p2: "60" };
      case "change": return { l1: "القيمة الأصلية", l2: "القيمة الجديدة", p1: "200", p2: "250" };
      case "shopping": return { l1: "السعر الأصلي", l2: "نسبة الخصم (%)", p1: "800", p2: "25" };
      case "finance": return { l1: "المبلغ الأساسي", l2: "نسبة الإضافة (%)", p1: "1000", p2: "15" };
      case "study": return { l1: "الدرجة المحققة", l2: "الدرجة الكلية", p1: "420", p2: "500" };
      case "convert": return { l1: "النسبة المئوية (%)", l2: "", p1: "25", p2: "" };
      default: return { l1: "", l2: "", p1: "", p2: "" };
    }
  };

  const labels = getLabels();

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link href="/tools/calculators" className="font-medium transition hover:text-orange-600">الحاسبات والأدوات الحسابية</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">حاسبة النسبة المئوية</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Calculator size={16} />
            حاسبة شاملة ومجانية 100%
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            حساب النسبة المئوية – احسب النسبة والزيادة والخصم بسهولة
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            استخدم حاسبة حساب النسبة المئوية المجانية من Intooly لحساب نسبة رقم من رقم، والزيادة والنقصان، والخصومات والضرائب، ومعرفة الفرق والتغير بين الأرقام بسهولة ودقة.
          </p>
        </header>

        {/* Calculator Interface */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as Tab); setVal1(""); setVal2(""); setResult(""); setFormula(""); }}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                  activeTab === tab.id ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={20} />
                <span className="text-sm font-bold">{tab.label}</span>
                <span className="text-[10px] text-slate-500 hidden sm:block">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{labels.l1}</label>
              <input
                type="number"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                placeholder={labels.p1}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            {labels.l2 && (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{labels.l2}</label>
                <input
                  type="number"
                  value={val2}
                  onChange={(e) => setVal2(e.target.value)}
                  placeholder={labels.p2}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            )}
          </div>

          {/* Decimals Setting */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">المنازل العشرية:</span>
            <select value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-orange-500">
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          {/* Result */}
          {result !== "" && (
            <div className="mt-8 rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 text-center">
              <p className="text-sm font-semibold text-orange-700 mb-2">النتيجة</p>
              <p className="text-4xl font-extrabold text-orange-900 mb-3">
                {result}{activeTab !== 'convert' && activeTab !== 'shopping' && activeTab !== 'finance' ? '%' : ''}
              </p>
              <div className="mx-auto mb-4 max-w-md rounded-lg bg-white/60 p-3 font-mono text-sm text-slate-700">
                المعادلة: {formula}
              </div>
              <button
                onClick={copyResult}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "تم النسخ!" : "نسخ النتيجة"}
              </button>
            </div>
          )}
        </section>

        {/* SEO Content */}
        <section className="mt-12 space-y-8 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أداة حساب النسبة المئوية من Intooly؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              أداة حساب النسبة المئوية من Intooly هي حاسبة أونلاين شاملة تساعدك على تنفيذ العمليات المختلفة باستخدام النسب المئوية من مكان واحد. بدلاً من البحث عن حاسبة منفصلة لكل عملية، يمكنك اختيار نوع الحساب وإدخال الأرقام المطلوبة للحصول على النتيجة، مع عرض المعادلة التي توضح كيفية الوصول إليها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيفية استخدام الحاسبة</h2>
            <ol className="mt-4 list-decimal list-inside space-y-2 leading-8 text-slate-600">
              <li>اختر نوع العملية الحسابية من التبويبات العلوية (أساسي، تغير، تسوق، مالية، دراسة، تحويل).</li>
              <li>أدخل القيم المطلوبة في الحقول المخصصة.</li>
              <li>ستظهر النتيجة فوراً مع المعادلة الحسابية المستخدمة.</li>
              <li>يمكنك نسخ النتيجة أو تغيير عدد المنازل العشرية حسب دقتك المطلوبة.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tools/calorie-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة السعرات الحرارية</span>
                <span className="text-sm text-slate-600">احسب احتياجك اليومي من الطاقة</span>
              </Link>
              <Link href="/tools/bmi-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة مؤشر كتلة الجسم (BMI)</span>
                <span className="text-sm text-slate-600">اعرف العلاقة بين طولك ووزنك</span>
              </Link>
              <Link href="/tools/age-calculator" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">حاسبة العمر الدقيقة</span>
                <span className="text-sm text-slate-600">احسب عمرك بالسنوات والأشهر والأيام</span>
              </Link>
              <Link href="/tools/calculators" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400">
                <span className="font-bold block mb-1">جميع الحاسبات</span>
                <span className="text-sm text-slate-600">استكشف المزيد من الأدوات الحسابية</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول حساب النسبة المئوية</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "كيف أحسب النسبة المئوية من رقم؟", a: "اضرب الرقم في النسبة المئوية ثم اقسم الناتج على 100. مثال: 20% من 300 تساوي 300 × 20 ÷ 100 = 60." },
                { q: "كيف أعرف السعر الأصلي قبل الخصم؟", a: "اقسم السعر بعد الخصم على (1 − نسبة الخصم ÷ 100). مثال: سعر 80 بعد خصم 20% يعني أن السعر الأصلي كان 100." },
                { q: "كيف أحسب نسبة النجاح في الامتحان؟", a: "اقسم مجموع الدرجات التي حصلت عليها على مجموع الدرجات الكلية، ثم اضرب الناتج في 100." },
                { q: "هل يمكن أن تكون النسبة المئوية أكبر من 100%؟", a: "نعم، يمكن أن تتجاوز النسبة 100% إذا كانت قيمة الجزء أكبر من الإجمالي المرجعي. على سبيل المثال، 150 من 100 تساوي 150%." }
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