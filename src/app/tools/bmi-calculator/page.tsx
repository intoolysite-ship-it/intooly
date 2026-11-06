"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calculator, Scale, Ruler, History, Download, Copy, Share2,
  Trash2, ChevronDown, ChevronUp, Info, Check, RefreshCcw,
  Activity, Droplets, Flame, Target, TrendingUp, Moon, Sun,
  Award, Users, Zap
} from "lucide-react";

type UnitSystem = "metric" | "imperial";
type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type TabType = "calculator" | "advanced" | "history" | "export";

type BmiRecord = {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  category: string;
  unit: UnitSystem;
  waist?: number;
};

const STORAGE_KEY = "intooly-bmi-history";

export default function BmiCalculatorPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("calculator");
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [heightFt, setHeightFt] = useState<string>("");
  const [heightIn, setHeightIn] = useState<string>("");
  const [waistCm, setWaistCm] = useState<string>("");
  const [waistIn, setWaistIn] = useState<string>("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [isAthlete, setIsAthlete] = useState(false);
  
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>("");
  const [healthyRange, setHealthyRange] = useState<{ min: number; max: number } | null>(null);
  const [bmiPrime, setBmiPrime] = useState<number | null>(null);
  const [difference, setDifference] = useState<number | null>(null);
  const [idealWeight, setIdealWeight] = useState<{ min: number; max: number } | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [whtr, setWhtr] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<number | null>(null);
  
  const [history, setHistory] = useState<BmiRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
      const theme = localStorage.getItem("intooly-bmi-theme");
      if (theme === "dark") setDarkMode(true);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("intooly-bmi-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const saveToHistory = useCallback(() => {
    if (bmi === null || !weight) return;
    const newRecord: BmiRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("ar-EG"),
      weight: Number(weight),
      height: unit === "metric" ? Number(heightCm) : (Number(heightFt) * 12 + Number(heightIn || 0)),
      bmi: Math.round(bmi * 10) / 10,
      category,
      unit,
      waist: waistCm ? Number(waistCm) : undefined,
    };
    const updated = [newRecord, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [bmi, weight, heightCm, heightFt, heightIn, category, history, unit, waistCm]);

  const calculate = useCallback(() => {
    let w = 0, h = 0, waist = 0;
    if (unit === "metric") {
      if (!weight || !heightCm) return;
      w = Number(weight);
      h = Number(heightCm) / 100;
      waist = waistCm ? Number(waistCm) / 100 : 0;
    } else {
      if (!weight || !heightFt) return;
      w = Number(weight) * 0.453592;
      h = (Number(heightFt) * 12 + Number(heightIn || 0)) * 0.0254;
      waist = waistIn ? Number(waistIn) * 0.0254 : 0;
    }

    if (h <= 0 || w <= 0) return;

    const bmiValue = w / (h * h);
    const roundedBmi = Math.round(bmiValue * 10) / 10;
    setBmi(roundedBmi);
    setBmiPrime(Math.round((bmiValue / 25) * 100) / 100);

    let cat = "";
    if (bmiValue < 18.5) cat = "نقص الوزن";
    else if (bmiValue < 25) cat = "وزن طبيعي";
    else if (bmiValue < 30) cat = "زيادة الوزن";
    else if (bmiValue < 35) cat = "سمنة من الدرجة الأولى";
    else if (bmiValue < 40) cat = "سمنة من الدرجة الثانية";
    else cat = "سمنة من الدرجة الثالثة";
    setCategory(cat);

    const minW = 18.5 * (h * h);
    const maxW = 24.9 * (h * h);
    setHealthyRange({ min: Math.round(minW * 10) / 10, max: Math.round(maxW * 10) / 10 });

    if (bmiValue < 18.5) {
      setDifference(Math.round((minW - w) * 10) / 10);
    } else if (bmiValue >= 25) {
      setDifference(Math.round((w - maxW) * 10) / 10);
    } else {
      setDifference(0);
    }

    // الوزن المثالي (Devine/Robinson)
    const heightInches = h * 39.3701;
    let idealMin = 0, idealMax = 0;
    if (gender === "male") {
      idealMin = 50 + 2.3 * (heightInches - 60);
      idealMax = 52 + 2.3 * (heightInches - 60);
    } else {
      idealMin = 45.5 + 2.3 * (heightInches - 60);
      idealMax = 47.5 + 2.3 * (heightInches - 60);
    }
    setIdealWeight({ min: Math.round(idealMin * 10) / 10, max: Math.round(idealMax * 10) / 10 });

    // نسبة الدهون (RFM)
    if (waist > 0) {
      let rf = 0;
      if (gender === "male") {
        rf = 64 - (20 * (h / waist));
      } else {
        rf = 76 - (20 * (h / waist));
      }
      setBodyFat(Math.round(rf * 10) / 10);

      // WHtR
      const whtrValue = waist / h;
      setWhtr(Math.round(whtrValue * 100) / 100);
    }

    // BMR (Mifflin-St Jeor)
    if (age) {
      const ageNum = Number(age);
      let bmrValue = 0;
      if (gender === "male") {
        bmrValue = 10 * w + 6.25 * (h * 100) - 5 * ageNum + 5;
      } else {
        bmrValue = 10 * w + 6.25 * (h * 100) - 5 * ageNum - 161;
      }
      setBmr(Math.round(bmrValue));

      // TDEE
      const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      setTdee(Math.round(bmrValue * multipliers[activityLevel]));

      // احتياج الماء
      setWaterIntake(Math.round(w * 35 / 1000 * 10) / 10);
    }
  }, [unit, weight, heightCm, heightFt, heightIn, waistCm, waistIn, gender, age, activityLevel]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const resetForm = () => {
    setWeight("");
    setHeightCm("");
    setHeightFt("");
    setHeightIn("");
    setWaistCm("");
    setWaistIn("");
    setAge("");
    setBmi(null);
    setCategory("");
    setHealthyRange(null);
    setBmiPrime(null);
    setDifference(null);
    setIdealWeight(null);
    setBodyFat(null);
    setWhtr(null);
    setBmr(null);
    setTdee(null);
    setWaterIntake(null);
  };

  const copyResult = () => {
    if (bmi === null) return;
    let text = `نتيجة حساب مؤشر كتلة الجسم (BMI) من Intooly:\n`;
    text += `المؤشر: ${bmi}\n`;
    text += `التصنيف: ${category}\n`;
    text += `النطاق الصحي للوزن: ${healthyRange?.min} - ${healthyRange?.max} ${unit === "metric" ? "كجم" : "رطل"}\n`;
    if (idealWeight) {
      text += `الوزن المثالي: ${idealWeight.min} - ${idealWeight.max} ${unit === "metric" ? "كجم" : "رطل"}\n`;
    }
    if (bodyFat) {
      text += `نسبة الدهون التقديرية: ${bodyFat}%\n`;
    }
    if (tdee) {
      text += `احتياج السعرات اليومي: ${tdee} سعرة\n`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCategoryColor = (cat: string) => {
    if (cat.includes("نقص")) return darkMode ? "text-blue-400 bg-blue-900/30 border-blue-700" : "text-blue-600 bg-blue-50 border-blue-200";
    if (cat.includes("طبيعي")) return darkMode ? "text-green-400 bg-green-900/30 border-green-700" : "text-green-600 bg-green-50 border-green-200";
    if (cat.includes("زيادة")) return darkMode ? "text-yellow-400 bg-yellow-900/30 border-yellow-700" : "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (cat.includes("أولى")) return darkMode ? "text-orange-400 bg-orange-900/30 border-orange-700" : "text-orange-600 bg-orange-50 border-orange-200";
    if (cat.includes("ثانية")) return darkMode ? "text-red-400 bg-red-900/30 border-red-700" : "text-red-600 bg-red-50 border-red-200";
    return darkMode ? "text-rose-400 bg-rose-900/30 border-rose-700" : "text-rose-700 bg-rose-50 border-rose-200";
  };

  const getBarPosition = (bmiVal: number) => {
    if (bmiVal < 18.5) return "10%";
    if (bmiVal < 25) return "35%";
    if (bmiVal < 30) return "60%";
    if (bmiVal < 35) return "75%";
    if (bmiVal < 40) return "90%";
    return "98%";
  };

  const getTips = () => {
    if (!category) return [];
    if (category.includes("نقص")) {
      return [
        "تناول وجبات غنية بالسعرات الصحية مثل المكسرات والأفوكادو",
        "ممارسة تمارين المقاومة لبناء الكتلة العضلية",
        "استشارة أخصائي تغذية لوضع خطة غذائية مناسبة",
        "تناول 5-6 وجبات صغيرة يومياً بدلاً من 3 وجبات كبيرة",
      ];
    }
    if (category.includes("طبيعي")) {
      return [
        "حافظ على نمط حياتك الصحي الحالي",
        "مارس الرياضة بانتظام (150 دقيقة أسبوعياً على الأقل)",
        "اتبع نظاماً غذائياً متوازناً غنياً بالخضروات والفواكه",
        "احصل على نوم كافٍ (7-9 ساعات يومياً)",
      ];
    }
    if (category.includes("زيادة") || category.includes("سمنة")) {
      return [
        "قلل من تناول السكريات والأطعمة المصنعة",
        "مارس رياضة المشي 30 دقيقة يومياً على الأقل",
        "زد من تناول الخضروات والألياف",
        "استشر طبيباً أو أخصائي تغذية لوضع خطة مناسبة",
        "اشرب الماء بكثرة وتجنب المشروبات الغازية",
      ];
    }
    return [];
  };

  const bgClass = darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardClass = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const inputClass = darkMode ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-white border-slate-300 text-slate-900";

  return (
    <main dir="rtl" className={`min-h-screen ${bgClass} transition-colors duration-300 print:bg-white`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm opacity-70 no-print">
          <a href="/tools/health-fitness" className="font-medium transition hover:text-orange-500">الصحة واللياقة البدنية</a>
          <span className="mx-2">/</span>
          <span>حساب مؤشر كتلة الجسم</span>
        </nav>

        <header className="mb-8 text-right no-print">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-xl border p-2.5 transition ${darkMode ? "border-slate-600 bg-slate-800 text-yellow-400" : "border-slate-300 bg-white text-slate-700"}`}
              title={darkMode ? "الوضع الفاتح" : "الوضع المظلم"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <Calculator size={16} />
              حاسبة صحية متقدمة
            </div>
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            حساب مؤشر كتلة الجسم
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 opacity-80 sm:text-lg">
            حاسبة متقدمة لحساب مؤشر كتلة الجسم مع الوزن المثالي، نسبة الدهون، السعرات الحرارية، ونصائح صحية مخصصة.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto no-print">
          {[
            { id: "calculator", label: "الحاسبة", icon: Calculator },
            { id: "advanced", label: "التحليل المتقدم", icon: Activity },
            { id: "history", label: "السجل", icon: History },
            { id: "export", label: "المشاركة", icon: Share2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-lg"
                  : darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "calculator" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <section className={`rounded-3xl border ${cardClass} p-6 shadow-sm sm:p-8`}>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold">أدخل بياناتك</h2>
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700">
                  <button
                    onClick={() => setUnit("metric")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit === "metric" ? "bg-white text-orange-600 shadow-sm dark:bg-slate-600" : "opacity-60 hover:opacity-100"}`}
                  >
                    كجم / سم
                  </button>
                  <button
                    onClick={() => setUnit("imperial")}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${unit === "imperial" ? "bg-white text-orange-600 shadow-sm dark:bg-slate-600" : "opacity-60 hover:opacity-100"}`}
                  >
                    رطل / قدم
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Scale size={16} /> الوزن ({unit === "metric" ? "كجم" : "رطل"})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={unit === "metric" ? "مثال: 75.5" : "مثال: 165"}
                    className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                  />
                </div>
                {unit === "metric" ? (
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Ruler size={16} /> الطول (سم)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="مثال: 175"
                      className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">الطول (قدم)</label>
                      <input
                        type="number"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        placeholder="5"
                        className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">البوصة</label>
                      <input
                        type="number"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        placeholder="9"
                        className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Target size={16} /> العمر (اختياري)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="مثال: 30"
                    className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Users size={16} /> الجنس
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Ruler size={16} /> محيط الخصر (اختياري - {unit === "metric" ? "سم" : "بوصة"})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={unit === "metric" ? waistCm : waistIn}
                    onChange={(e) => unit === "metric" ? setWaistCm(e.target.value) : setWaistIn(e.target.value)}
                    placeholder={unit === "metric" ? "مثال: 85" : "مثال: 33"}
                    className={`w-full rounded-xl border px-4 py-3 text-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Zap size={16} /> مستوى النشاط
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${inputClass}`}
                  >
                    <option value="sedentary">خامل (قليل الحركة)</option>
                    <option value="light">نشاط خفيف (1-3 أيام/أسبوع)</option>
                    <option value="moderate">نشاط متوسط (3-5 أيام/أسبوع)</option>
                    <option value="active">نشاط عالي (6-7 أيام/أسبوع)</option>
                    <option value="very_active">نشاط مكثف (رياضي محترف)</option>
                  </select>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAthlete}
                  onChange={(e) => setIsAthlete(e.target.checked)}
                  className="accent-orange-600"
                />
                <Award size={16} className="text-orange-600" />
                أنا رياضي (كتلة عضلية عالية)
              </label>

              <button
                onClick={resetForm}
                className="mt-6 flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <RefreshCcw size={16} /> إعادة تعيين
              </button>

              {bmi !== null && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50 print:border-0 print:bg-white">
                  <div className="print-only mb-4">
                    <h2 className="text-2xl font-bold">تقرير مؤشر كتلة الجسم - Intooly</h2>
                    <p className="text-sm opacity-70">التاريخ: {new Date().toLocaleDateString("ar-EG")}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium opacity-70">مؤشر كتلة الجسم BMI</p>
                    <p className={`mt-2 text-5xl font-black ${category.includes("طبيعي") ? "text-green-600" : category.includes("نقص") ? "text-blue-600" : "text-orange-600"}`}>
                      {bmi}
                    </p>
                    <span className={`mt-3 inline-block rounded-full border px-4 py-1.5 text-sm font-bold ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                    {isAthlete && (
                      <p className="mt-2 text-xs text-orange-600">⚠️ رياضي - BMI قد لا يكون دقيقاً</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="relative h-4 rounded-full bg-gradient-to-l from-blue-400 via-green-400 via-yellow-400 via-orange-400 to-red-500">
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg transition-all duration-500"
                        style={{ left: getBarPosition(bmi) }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs opacity-70">
                      <span>نقص</span>
                      <span>طبيعي</span>
                      <span>زيادة</span>
                      <span>سمنة</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                    <div className={`rounded-xl border ${cardClass} p-4`}>
                      <p className="text-xs opacity-70">نطاق الوزن الصحي</p>
                      <p className="mt-1 text-lg font-bold">
                        {healthyRange?.min} – {healthyRange?.max} {unit === "metric" ? "كجم" : "رطل"}
                      </p>
                    </div>
                    <div className={`rounded-xl border ${cardClass} p-4`}>
                      <p className="text-xs opacity-70">BMI Prime</p>
                      <p className="mt-1 text-lg font-bold">{bmiPrime}</p>
                      <p className="text-xs opacity-70">(المثالي ≤ 1.0)</p>
                    </div>
                    {idealWeight && (
                      <div className={`rounded-xl border ${cardClass} p-4`}>
                        <p className="text-xs opacity-70">الوزن المثالي التقريبي</p>
                        <p className="mt-1 text-lg font-bold">
                          {idealWeight.min} – {idealWeight.max} {unit === "metric" ? "كجم" : "رطل"}
                        </p>
                      </div>
                    )}
                    {bodyFat && (
                      <div className={`rounded-xl border ${cardClass} p-4`}>
                        <p className="text-xs opacity-70">نسبة الدهون التقديرية</p>
                        <p className="mt-1 text-lg font-bold">{bodyFat}%</p>
                      </div>
                    )}
                    {whtr && (
                      <div className={`rounded-xl border ${cardClass} p-4`}>
                        <p className="text-xs opacity-70">WHtR (محيط الخصر/الطول)</p>
                        <p className="mt-1 text-lg font-bold">{whtr}</p>
                        <p className="text-xs opacity-70">(الصحي &lt; 0.5)</p>
                      </div>
                    )}
                    {tdee && (
                      <div className={`rounded-xl border ${cardClass} p-4`}>
                        <p className="text-xs opacity-70">احتياج السعرات اليومي</p>
                        <p className="mt-1 text-lg font-bold">{tdee} سعرة</p>
                      </div>
                    )}
                    {waterIntake && (
                      <div className={`rounded-xl border ${cardClass} p-4`}>
                        <p className="text-xs opacity-70">احتياج الماء اليومي</p>
                        <p className="mt-1 text-lg font-bold">{waterIntake} لتر</p>
                      </div>
                    )}
                    {difference !== null && difference > 0 && (
                      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 sm:col-span-2 dark:border-orange-700 dark:bg-orange-900/30">
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          الفرق عن نطاق الوزن الصحي: <span className="font-black">{difference} {unit === "metric" ? "كجم" : "رطل"}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6 no-print">
              {bmi !== null && getTips().length > 0 && (
                <div className={`rounded-3xl border ${cardClass} p-6 shadow-sm`}>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                    <Info size={20} className="text-orange-600" />
                    نصائح مخصصة لك
                  </h3>
                  <ul className="space-y-3">
                    {getTips().map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="leading-6">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`rounded-3xl border ${cardClass} p-6 shadow-sm`}>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex w-full items-center justify-between text-lg font-bold"
                >
                  <span className="flex items-center gap-2">
                    <History size={20} className="text-orange-600" />
                    سجل الحسابات
                  </span>
                  {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {showHistory && (
                  <div className="mt-4 space-y-3">
                    {history.length === 0 ? (
                      <p className="text-sm opacity-70">لا توجد حسابات محفوظة بعد.</p>
                    ) : (
                      history.map((record) => (
                        <div key={record.id} className={`rounded-xl border ${cardClass} p-3 text-sm`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{record.bmi}</span>
                            <span className="text-xs opacity-70">{record.date}</span>
                          </div>
                          <p className="mt-1 text-xs opacity-80">{record.category} • {record.weight} {record.unit === "metric" ? "كجم" : "رطل"}</p>
                        </div>
                      ))
                    )}
                    {history.length > 0 && (
                      <button
                        onClick={() => { setHistory([]); localStorage.removeItem(STORAGE_KEY); }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30"
                      >
                        <Trash2 size={14} /> مسح السجل
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6 dark:border-orange-700 dark:bg-orange-900/20">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-orange-800 dark:text-orange-300">
                  <Info size={18} /> ملاحظة صحية
                </h3>
                <p className="text-sm leading-7 text-orange-900 dark:text-orange-200">
                  هذه الأداة مخصصة للتوعية والحساب الأولي للبالغين. لا تُغني عن استشارة الطبيب. قد لا يكون المؤشر دقيقاً للرياضيين أو الحوامل.
                </p>
              </div>
            </aside>
          </div>
        )}

        {activeTab === "advanced" && (
          <section className={`rounded-3xl border ${cardClass} p-6 shadow-sm sm:p-8`}>
            <h2 className="mb-6 text-2xl font-bold">التحليل المتقدم</h2>
            {bmi === null ? (
              <p className="text-center opacity-70">يرجى إدخال البيانات في تبويب "الحاسبة" أولاً.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bmr && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Flame size={24} className="mb-2 text-orange-600" />
                      <p className="text-sm opacity-70">معدل الأيض الأساسي (BMR)</p>
                      <p className="mt-2 text-2xl font-bold">{bmr} سعرة/يوم</p>
                      <p className="mt-1 text-xs opacity-70">الطاقة التي يحتاجها جسمك أثناء الراحة</p>
                    </div>
                  )}
                  {tdee && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Zap size={24} className="mb-2 text-orange-600" />
                      <p className="text-sm opacity-70">إجمالي استهلاك الطاقة (TDEE)</p>
                      <p className="mt-2 text-2xl font-bold">{tdee} سعرة/يوم</p>
                      <p className="mt-1 text-xs opacity-70">احتياجك اليومي مع النشاط</p>
                    </div>
                  )}
                  {waterIntake && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Droplets size={24} className="mb-2 text-blue-600" />
                      <p className="text-sm opacity-70">احتياج الماء اليومي</p>
                      <p className="mt-2 text-2xl font-bold">{waterIntake} لتر</p>
                      <p className="mt-1 text-xs opacity-70">ما يعادل {Math.round(waterIntake * 4)} أكواب</p>
                    </div>
                  )}
                  {bodyFat && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Target size={24} className="mb-2 text-orange-600" />
                      <p className="text-sm opacity-70">نسبة الدهون التقديرية (RFM)</p>
                      <p className="mt-2 text-2xl font-bold">{bodyFat}%</p>
                      <p className="mt-1 text-xs opacity-70">
                        {gender === "male" ? "الطبيعي للرجال: 10-20%" : "الطبيعي للنساء: 18-28%"}
                      </p>
                    </div>
                  )}
                  {whtr && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Activity size={24} className="mb-2 text-orange-600" />
                      <p className="text-sm opacity-70">نسبة الخصر إلى الطول (WHtR)</p>
                      <p className="mt-2 text-2xl font-bold">{whtr}</p>
                      <p className="mt-1 text-xs opacity-70">الصحي أقل من 0.5</p>
                    </div>
                  )}
                  {idealWeight && (
                    <div className={`rounded-2xl border ${cardClass} p-5`}>
                      <Scale size={24} className="mb-2 text-orange-600" />
                      <p className="text-sm opacity-70">الوزن المثالي التقريبي</p>
                      <p className="mt-2 text-2xl font-bold">{idealWeight.min} - {idealWeight.max}</p>
                      <p className="mt-1 text-xs opacity-70">{unit === "metric" ? "كجم" : "رطل"} (معادلة Devine)</p>
                    </div>
                  )}
                </div>

                <div className={`rounded-2xl border ${cardClass} p-6`}>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                    <TrendingUp size={20} className="text-orange-600" />
                    مقارنة مع المتوسطات العالمية
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">متوسط BMI العالمي (البالغين)</span>
                      <span className="font-bold">24.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">BMI الخاص بك</span>
                      <span className="font-bold text-orange-600">{bmi}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-orange-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, (bmi / 40) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section className={`rounded-3xl border ${cardClass} p-6 shadow-sm sm:p-8`}>
            <h2 className="mb-6 text-2xl font-bold">سجل الحسابات والتتبع</h2>
            {history.length === 0 ? (
              <p className="text-center opacity-70">لا توجد حسابات محفوظة بعد. ابدأ بحساب جديد واحفظه في السجل.</p>
            ) : (
              <div className="space-y-6">
                <div className={`rounded-2xl border ${cardClass} p-6`}>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                    <TrendingUp size={20} className="text-orange-600" />
                    تطور الوزن عبر الوقت
                  </h3>
                  <div className="relative h-48">
                    <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="rgb(234, 88, 12)"
                        strokeWidth="2"
                        points={history
                          .slice()
                          .reverse()
                          .map((record, i) => {
                            const x = (i / Math.max(1, history.length - 1)) * 380 + 10;
                            const maxWeight = Math.max(...history.map(r => r.weight));
                            const minWeight = Math.min(...history.map(r => r.weight));
                            const range = maxWeight - minWeight || 1;
                            const y = 190 - ((record.weight - minWeight) / range) * 170;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                      />
                      {history.slice().reverse().map((record, i) => {
                        const x = (i / Math.max(1, history.length - 1)) * 380 + 10;
                        const maxWeight = Math.max(...history.map(r => r.weight));
                        const minWeight = Math.min(...history.map(r => r.weight));
                        const range = maxWeight - minWeight || 1;
                        const y = 190 - ((record.weight - minWeight) / range) * 170;
                        return (
                          <circle
                            key={record.id}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="rgb(234, 88, 12)"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {history.map((record) => (
                    <div key={record.id} className={`rounded-xl border ${cardClass} p-4`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{record.bmi}</span>
                        <span className="text-xs opacity-70">{record.date}</span>
                      </div>
                      <p className="mt-2 text-sm">{record.category}</p>
                      <p className="mt-1 text-xs opacity-70">{record.weight} {record.unit === "metric" ? "كجم" : "رطل"}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setHistory([]); localStorage.removeItem(STORAGE_KEY); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30"
                >
                  <Trash2 size={16} /> مسح السجل بالكامل
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "export" && (
          <section className={`rounded-3xl border ${cardClass} p-6 shadow-sm sm:p-8`}>
            <h2 className="mb-6 text-2xl font-bold">المشاركة والتصدير</h2>
            {bmi === null ? (
              <p className="text-center opacity-70">يرجى إدخال البيانات في تبويب "الحاسبة" أولاً.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={copyResult}
                    className={`flex items-center justify-center gap-2 rounded-xl border ${cardClass} p-6 transition hover:border-orange-400 hover:shadow-md`}
                  >
                    {copied ? <Check size={24} className="text-green-600" /> : <Copy size={24} className="text-orange-600" />}
                    <div className="text-right">
                      <p className="font-bold">{copied ? "تم النسخ!" : "نسخ النتيجة"}</p>
                      <p className="text-xs opacity-70">نسخ جميع النتائج</p>
                    </div>
                  </button>
                  <button
                    onClick={handlePrint}
                    className={`flex items-center justify-center gap-2 rounded-xl border ${cardClass} p-6 transition hover:border-orange-400 hover:shadow-md`}
                  >
                    <Download size={24} className="text-orange-600" />
                    <div className="text-right">
                      <p className="font-bold">تنزيل PDF</p>
                      <p className="text-xs opacity-70">طباعة أو حفظ كـ PDF</p>
                    </div>
                  </button>
                </div>

                <div className={`rounded-2xl border ${cardClass} p-6`}>
                  <h3 className="mb-4 text-lg font-bold">مشاركة على وسائل التواصل</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`نتيجة حساب BMI من Intooly: ${bmi} - ${category}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-green-600 p-4 text-white transition hover:bg-green-700"
                    >
                      <Share2 size={20} />
                      WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`نتيجة حساب BMI من Intooly: ${bmi} - ${category}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 p-4 text-white transition hover:bg-blue-600"
                    >
                      <Share2 size={20} />
                      Twitter
                    </a>
                    <button
                      onClick={copyResult}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-700 p-4 text-white transition hover:bg-slate-800"
                    >
                      <Copy size={20} />
                      نسخ الرابط
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-12 space-y-8 text-right max-w-4xl mx-auto no-print">
          <article>
            <h2 className="text-2xl font-extrabold">ما هو مؤشر كتلة الجسم BMI؟</h2>
            <p className="mt-3 leading-8 opacity-80">
              مؤشر كتلة الجسم (Body Mass Index)، المعروف اختصارًا باسم BMI، هو مقياس حسابي يُستخدم لتقدير العلاقة بين وزن الشخص وطوله.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold">كيفية حساب مؤشر كتلة الجسم؟</h2>
            <p className="mt-3 leading-8 opacity-80">
              تعتمد طريقة حساب مؤشر كتلة الجسم على قسمة وزن الجسم بالكيلوجرام على مربع الطول بالمتر.
              <br />
              <strong>معادلة حساب BMI:</strong> الوزن بالكيلوجرام ÷ (الطول بالمتر × الطول بالمتر)
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold">جدول مؤشر كتلة الجسم وتصنيف الوزن</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm text-right">
                <thead className={darkMode ? "bg-slate-800" : "bg-slate-50"}>
                  <tr>
                    <th className="px-4 py-3 font-bold">مؤشر كتلة الجسم BMI</th>
                    <th className="px-4 py-3 font-bold">تصنيف الوزن</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "divide-slate-700" : "divide-slate-200"}`}>
                  <tr><td className="px-4 py-3">أقل من 18.5</td><td className="px-4 py-3 font-medium text-blue-600">نقص الوزن</td></tr>
                  <tr><td className="px-4 py-3">18.5 إلى أقل من 25</td><td className="px-4 py-3 font-medium text-green-600">وزن طبيعي</td></tr>
                  <tr><td className="px-4 py-3">25 إلى أقل من 30</td><td className="px-4 py-3 font-medium text-yellow-600">زيادة الوزن</td></tr>
                  <tr><td className="px-4 py-3">30 إلى أقل من 35</td><td className="px-4 py-3 font-medium text-orange-600">سمنة من الدرجة الأولى</td></tr>
                  <tr><td className="px-4 py-3">35 إلى أقل من 40</td><td className="px-4 py-3 font-medium text-red-600">سمنة من الدرجة الثانية</td></tr>
                  <tr><td className="px-4 py-3">40 أو أكثر</td><td className="px-4 py-3 font-medium text-rose-700">سمنة من الدرجة الثالثة</td></tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className={`rounded-2xl border ${cardClass} p-6`}>
            <h2 className="text-xl font-extrabold mb-3">أدوات Intooly ذات صلة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href="/tools/health-fitness" className={`rounded-xl border ${cardClass} p-4 transition hover:border-orange-400`}>
                <span className="font-bold block mb-1">الصحة واللياقة البدنية</span>
                <span className="text-sm opacity-70">جميع الحاسبات الصحية</span>
              </a>
              <a href="/tools/calorie-calculator" className={`rounded-xl border ${cardClass} p-4 transition hover:border-orange-400`}>
                <span className="font-bold block mb-1">حاسبة السعرات الحرارية</span>
                <span className="text-sm opacity-70">احسب احتياجك اليومي</span>
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}