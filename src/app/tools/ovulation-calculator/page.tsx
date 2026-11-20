"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Info,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  calculateOvulation,
  type OvulationCalculationResult,
} from "./lib/calculations";

type CycleType = "regular" | "irregular";

function toUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString: string, calendar: "gregory" | "islamic" = "gregory"): string {
  const date = toUTCDate(dateString);

  return new Intl.DateTimeFormat(
    calendar === "gregory" ? "ar-EG" : "ar-SA-u-ca-islamic-umalqura",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      calendar,
      timeZone: "UTC",
    }
  ).format(date);
}

function getTodayString(): string {
  const now = new Date();
  return toDateString(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
}

function getMonthLabel(dateString: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUTCDate(dateString));
}

function getCalendarDays(monthString: string): (string | null)[] {
  const [year, month] = monthString.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return Array.from({ length: 42 }, (_, index) => {
    const day = index - startWeekday + 1;

    if (day < 1 || day > daysInMonth) return null;

    return toDateString(new Date(Date.UTC(year, month - 1, day)));
  });
}

export default function OvulationCalculatorPage() {
  const today = getTodayString();

  const [cycleType, setCycleType] = useState<CycleType>("regular");
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [dateDay, setDateDay] = useState("");
  const [dateMonth, setDateMonth] = useState("");
  const [dateYear, setDateYear] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [shortestCycleLength, setShortestCycleLength] = useState("25");
  const [longestCycleLength, setLongestCycleLength] = useState("35");
  const [result, setResult] = useState<OvulationCalculationResult | null>(null);
  const [error, setError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("");

  const calendarDays = useMemo(
    () => (calendarMonth ? getCalendarDays(calendarMonth) : []),
    [calendarMonth]
  );

  function updateLastPeriodDate(day: string, month: string, year: string) {
    const normalizeDigits = (value: string) =>
      value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
        .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));

    const normalizedDay = normalizeDigits(day);
    const normalizedMonth = normalizeDigits(month);
    const normalizedYear = normalizeDigits(year);

    setDateDay(day);
    setDateMonth(month);
    setDateYear(year);

    if (!normalizedDay || !normalizedMonth || !normalizedYear) {
      setLastPeriodStart("");
      setResult(null);
      return;
    }

    const d = Number(normalizedDay);
    const m = Number(normalizedMonth);
    const y = Number(normalizedYear);

    if (
      !Number.isInteger(d) ||
      !Number.isInteger(m) ||
      !Number.isInteger(y) ||
      y < 1900 ||
      y > Number(today.slice(0, 4)) ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      setLastPeriodStart("");
      setResult(null);
      return;
    }

    const date = new Date(Date.UTC(y, m - 1, d));

    if (
      date.getUTCFullYear() !== y ||
      date.getUTCMonth() !== m - 1 ||
      date.getUTCDate() !== d
    ) {
      setLastPeriodStart("");
      setResult(null);
      return;
    }

    setLastPeriodStart(
      `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    setResult(null);
  }

  function handleCalculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    try {
      if (!lastPeriodStart) {
        throw new Error("يرجى إدخال أول يوم من آخر دورة شهرية.");
      }

      if (lastPeriodStart > today) {
        throw new Error("تاريخ آخر دورة لا يمكن أن يكون في المستقبل.");
      }

      const calculationInput =
        cycleType === "regular"
          ? {
              cycleType: "regular" as const,
              lastPeriodStart,
              cycleLength: Number(cycleLength),
            }
          : {
              cycleType: "irregular" as const,
              lastPeriodStart,
              shortestCycleLength: Number(shortestCycleLength),
              longestCycleLength: Number(longestCycleLength),
            };

      const calculated = calculateOvulation(calculationInput);

      setResult(calculated);
      setCalendarMonth(
        `${calculated.fertileWindowStart.slice(0, 7)}-01`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "حدث خطأ أثناء الحساب."
      );
    }
  }

  function resetCalculator() {
    setLastPeriodStart("");
    setDateDay("");
    setDateMonth("");
    setDateYear("");
    setCycleType("regular");
    setCycleLength("28");
    setShortestCycleLength("25");
    setLongestCycleLength("35");
    setResult(null);
    setError("");
    setCalendarMonth("");
  }

  function changeMonth(amount: number) {
    if (!calendarMonth) return;

    const date = toUTCDate(calendarMonth);
    date.setUTCMonth(date.getUTCMonth() + amount);
    setCalendarMonth(toDateString(date));
  }

  function isInFertileWindow(date: string): boolean {
    return Boolean(
      result &&
        date >= result.fertileWindowStart &&
        date <= result.fertileWindowEnd
    );
  }

  function isOvulationDate(date: string): boolean {
    return Boolean(
      result &&
        date >= result.earliestOvulationDate &&
        date <= result.latestOvulationDate
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-slate-500 print:hidden">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">
            الأدوات
          </Link>
          <span className="mx-2">/</span>
          <Link
            href="/tools/health-fitness"
            className="font-medium transition hover:text-orange-600"
          >
            الصحة واللياقة البدنية
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">حاسبة التبويض</span>
        </nav>

        <header className="mb-8 text-right print:hidden">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <ShieldCheck size={16} />
            حساب محلي في المتصفح دون إرسال بيانات الدورة
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            حاسبة التبويض وأيام الخصوبة
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            احسبي موعد التبويض المتوقع وفترة الخصوبة وموعد الدورة الشهرية التالية
            بناءً على تاريخ آخر دورة وطول دورتك، مع تقويم توضيحي بالتاريخين
            الميلادي والهجري.
          </p>
        </header>

        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 print:border-none print:shadow-none print:p-0">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <HeartPulse size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                احسبي أيام التبويض
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                أدخلي بيانات الدورة الشهرية لعرض التقديرات.
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculate}>
            <fieldset className="mb-6">
              <legend className="mb-3 text-sm font-bold text-slate-700">
                ما طبيعة دورتك الشهرية؟
              </legend>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setCycleType("regular");
                    setResult(null);
                    setError("");
                  }}
                  aria-pressed={cycleType === "regular"}
                  className={`rounded-xl border p-4 text-right transition ${
                    cycleType === "regular"
                      ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="block font-bold text-slate-900">
                    دورة منتظمة
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    طول الدورة متقارب من شهر لآخر.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCycleType("irregular");
                    setResult(null);
                    setError("");
                  }}
                  aria-pressed={cycleType === "irregular"}
                  className={`rounded-xl border p-4 text-right transition ${
                    cycleType === "irregular"
                      ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                      : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className="block font-bold text-slate-900">
                    دورة غير منتظمة
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    يختلف طول الدورة من شهر لآخر.
                  </span>
                </button>
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 block text-sm font-bold text-slate-700">
                  أول يوم من آخر دورة شهرية
                </p>
                <div className="grid grid-cols-3 gap-2" dir="rtl">
                  <div>
                    <label htmlFor="last-period-day" className="mb-2 block text-xs font-semibold text-slate-600">
                      اليوم
                    </label>
                    <input
                      id="last-period-day"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="يوم"
                      maxLength={2}
                      required
                      value={dateDay}
                      onChange={(event) =>
                        updateLastPeriodDate(event.target.value, dateMonth, dateYear)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-2 py-3 text-center text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-period-month" className="mb-2 block text-xs font-semibold text-slate-600">
                      الشهر
                    </label>
                    <input
                      id="last-period-month"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="شهر"
                      maxLength={2}
                      required
                      value={dateMonth}
                      onChange={(event) =>
                        updateLastPeriodDate(dateDay, event.target.value, dateYear)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-2 py-3 text-center text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-period-year" className="mb-2 block text-xs font-semibold text-slate-600">
                      السنة
                    </label>
                    <input
                      id="last-period-year"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="سنة"
                      maxLength={4}
                      required
                      value={dateYear}
                      onChange={(event) =>
                        updateLastPeriodDate(dateDay, dateMonth, event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-2 py-3 text-center text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  اختاري اليوم الأول لنزول دم الدورة، وليس آخر يوم منها.
                </p>
              </div>

              {cycleType === "regular" ? (
                <div>
                  <label
                    htmlFor="cycle-length"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    طول الدورة الشهرية بالأيام
                  </label>
                  <input
                    id="cycle-length"
                    type="number"
                    min="15"
                    max="60"
                    step="1"
                    required
                    value={cycleLength}
                    onChange={(event) => {
                      setCycleLength(event.target.value);
                      setResult(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    احسبي المدة من أول يوم في دورة إلى أول يوم في الدورة التالية.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="shortest-cycle"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      أقصر دورة شهرية بالأيام
                    </label>
                    <input
                      id="shortest-cycle"
                      type="number"
                      min="15"
                      max="60"
                      step="1"
                      required
                      value={shortestCycleLength}
                      onChange={(event) => {
                        setShortestCycleLength(event.target.value);
                        setResult(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="longest-cycle"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      أطول دورة شهرية بالأيام
                    </label>
                    <input
                      id="longest-cycle"
                      type="number"
                      min="15"
                      max="60"
                      step="1"
                      required
                      value={longestCycleLength}
                      onChange={(event) => {
                        setLongestCycleLength(event.target.value);
                        setResult(null);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-orange-700"
              >
                <Sparkles size={19} />
                احسبي موعد التبويض
              </button>

              <button
                type="button"
                onClick={resetCalculator}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={17} />
                إعادة ضبط
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 space-y-6 print:mt-4">
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
                <div className="flex items-center gap-2 text-orange-800">
                  <CalendarDays size={20} />
                  <h2 className="text-xl font-extrabold">
                    نتائج حساب التبويض
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-7 text-orange-800">
                  هذه مواعيد تقديرية محسوبة من بيانات الدورة التي أدخلتِها.
                  قد يختلف موعد الإباضة الفعلي.
                </p>

                {result.cycleType === "irregular" && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                    لأن دورتك غير منتظمة، فإن نطاق الخصوبة المعروض واسع وتقريبي،
                    وقد لا يعكس موعد الإباضة الفعلي. لا تعتمدي عليه وحده لتحديد
                    أيام الخصوبة أو لاتخاذ قرارات منع الحمل.
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-5">
                  <p className="text-sm font-semibold text-orange-800">
                    {result.cycleType === "regular"
                      ? "موعد الإباضة المتوقع"
                      : "أقرب موعد متوقع للإباضة"}
                  </p>
                  <p className="mt-2 text-2xl font-black text-orange-700">
                    {formatDate(result.earliestOvulationDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    هجري: {formatDate(result.earliestOvulationDate, "islamic")}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                  <p className="text-sm font-semibold text-purple-800">
                    {result.cycleType === "regular"
                      ? "نهاية موعد الإباضة التقديري"
                      : "أبعد موعد متوقع للإباضة"}
                  </p>
                  <p className="mt-2 text-2xl font-black text-purple-700">
                    {formatDate(result.latestOvulationDate)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    هجري: {formatDate(result.latestOvulationDate, "islamic")}
                  </p>
                </div>

                <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5">
                  <p className="text-sm font-semibold text-pink-800">
                    بداية نطاق الخصوبة التقريبي
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-pink-700">
                    {formatDate(result.fertileWindowStart)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    هجري: {formatDate(result.fertileWindowStart, "islamic")}
                  </p>
                </div>

                <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5">
                  <p className="text-sm font-semibold text-pink-800">
                    نهاية نطاق الخصوبة التقريبي
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-pink-700">
                    {formatDate(result.fertileWindowEnd)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    هجري: {formatDate(result.fertileWindowEnd, "islamic")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    موعد الدورة التالية المتوقع
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-slate-900">
                    {formatDate(result.nextPeriodEarliestDate)}
                  </p>
                  {result.nextPeriodEarliestDate !== result.nextPeriodLatestDate && (
                    <p className="mt-1 text-sm text-slate-600">
                      حتى {formatDate(result.nextPeriodLatestDate)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    هجري: {formatDate(result.nextPeriodEarliestDate, "islamic")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-500">
                    تاريخ آخر دورة مدخل
                  </p>
                  <p className="mt-2 text-lg font-extrabold text-slate-900">
                    {formatDate(result.lastPeriodStart)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    هجري: {formatDate(result.lastPeriodStart, "islamic")}
                  </p>
                </div>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      تقويم نطاق الخصوبة التقديري
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      تحركي بين الأشهر لمشاهدة التواريخ المحسوبة.
                    </p>
                  </div>
                  <CalendarDays className="text-orange-600" size={24} />
                </div>

                <div className="mb-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="الشهر السابق"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <h4 className="font-bold text-slate-900">
                    {getMonthLabel(calendarMonth)}
                  </h4>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    aria-label="الشهر التالي"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(
                    (day) => (
                      <div
                        key={day}
                        className="py-2 text-xs font-bold text-slate-500"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="min-h-12" />;
                    }

                    const fertile = isInFertileWindow(date);
                    const ovulation = isOvulationDate(date);
                    const dayNumber = toUTCDate(date).getUTCDate();

                    return (
                      <div
                        key={date}
                        title={
                          ovulation
                            ? "موعد إباضة تقديري"
                            : fertile
                              ? "ضمن نافذة الخصوبة التقديرية"
                              : date
                        }
                        className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-sm font-semibold ${
                          ovulation
                            ? "bg-orange-600 text-white ring-2 ring-orange-200"
                            : fertile
                              ? "bg-pink-100 text-pink-800"
                              : date === today
                                ? "border border-slate-400 bg-slate-50 text-slate-900"
                                : "text-slate-700"
                        }`}
                      >
                        <span>{dayNumber}</span>
                        {ovulation && (
                          <span className="text-[9px] font-medium">إباضة</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-pink-100" />
                    نطاق الخصوبة التقديري
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-orange-600" />
                    موعد الإباضة التقديري
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-slate-400 bg-slate-50" />
                    تاريخ اليوم
                  </span>
                </div>
              </section>

              <div className="flex flex-wrap gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Printer size={18} />
                  طباعة النتائج
                </button>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
                <div className="flex items-start gap-2">
                  <Info size={19} className="mt-1 shrink-0" />
                  <p>
                    تنبيه مهم: تعتمد هذه الحاسبة على تقديرات تقويمية لموعد الإباضة
                    بناءً على طول الدورة. وقد يكون نطاق الخصوبة واسعًا، خصوصًا عند عدم انتظام الدورة. قد تتغير الإباضة من دورة لأخرى، ولا
                    تؤكد هذه النتائج حدوث الإباضة أو الحمل. لا تستخدمي الحاسبة
                    وسيلةً لمنع الحمل، واستشيري مختصًا صحيًا عند وجود اضطراب
                    مستمر في الدورة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mx-auto mt-12 max-w-4xl space-y-8 border-t border-slate-200 pt-10 text-right print:hidden">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              ما هي حاسبة التبويض والإباضة والخصوبة؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              حاسبة التبويض أو حاسبة الإباضة أداة تقديرية تساعد على حساب موعد
              التبويض وأيام الخصوبة بعد الدورة الشهرية. تعتمد على تاريخ أول يوم
              من آخر دورة وطول الدورة المعتاد، لتقدير الفترة التي قد ترتفع فيها
              احتمالية الحمل. وتُعرف أيضًا باسم حاسبة أيام التبويض أو حاسبة
              التبويض والحمل، لكن نتائجها تقويمية ولا تؤكد حدوث الإباضة فعليًا.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              كيفية حساب التبويض وأيام التبويض بعد الدورة
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              من الطرق التقويمية الشائعة تقدير موعد الإباضة بالرجوع نحو 14 يومًا
              من موعد الدورة التالية المتوقع. وتُقدّر نافذة الخصوبة بالأيام
              الخمسة السابقة للإباضة ويوم الإباضة نفسه. أدخلي أول يوم من آخر
              دورة شهرية وطول دورتك لمعرفة التقدير. تختلف النتيجة حسب طول الدورة
              وانتظامها، ولا توجد طريقة تقويمية تضمن معرفة يوم التبويض بالضبط.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              حساب أيام التبويض لدورة 28 يومًا
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              في الدورة التي تبلغ مدتها 28 يومًا، يكون موعد الإباضة التقديري
              غالبًا بالقرب من اليوم الرابع عشر عند استخدام طريقة حسابية
              تقويمية، وقد تبدأ نافذة الخصوبة قبل ذلك بعدة أيام. هذا تقدير عام
              وليس موعدًا ثابتًا يناسب جميع النساء؛ فقد يختلف توقيت الإباضة من
              دورة لأخرى حتى لدى المرأة نفسها.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              طريقة حساب التبويض للحمل وفترة الخصوبة والجماع
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              تُقدّر فترة الخصوبة عادةً بالأيام الخمسة السابقة للإباضة ويوم
              الإباضة نفسه. لذلك قد تساعد معرفة أيام التبويض والجماع في فهم
              الفترة التي يُحتمل أن تكون فيها الخصوبة أعلى عند الرغبة في الحمل.
              ومع ذلك، فإن حاسبة التبويض للحمل لا تضمن حدوث الحمل ولا تقيس
              احتمالية حدوثه بدقة، إذ تتأثر الخصوبة بعوامل متعددة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              حساب التبويض عند عدم انتظام الدورة الشهرية
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              عند عدم انتظام الدورة، يمكنك إدخال أقصر دورة وأطول دورة معتادتين
              للحصول على نطاق تقويمي تقديري بدلًا من تاريخ واحد. كلما زاد الفرق
              بين طول الدورات اتسع نطاق الاحتمالات وأصبحت طريقة التقويم أقل
              موثوقية في تحديد موعد الإباضة أو احتساب فترة التبويض. لا يُعد هذا
              النطاق تأكيدًا لأيام الخصوبة الفعلية.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              كيف يمكن متابعة التبويض بطرق أخرى؟
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              إلى جانب برنامج حساب التبويض، يمكن تسجيل مواعيد الدورة وملاحظة
              تغيرات إفرازات عنق الرحم. كما قد تساعد اختبارات التبويض المنزلية
              التي تقيس الارتفاع في الهرمون اللوتيني LH على توقع اقتراب الإباضة،
              لكنها لا تجعل الحساب التقويمي تأكيدًا طبيًا لحدوثها. استشيري
              مختصًا صحيًا إذا كان عدم انتظام الدورة مستمرًا أو كان لديك قلق
              بشأن الخصوبة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              الأسئلة الشائعة حول حاسبة التبويض وأيام الخصوبة
            </h2>

            <div className="mt-4 space-y-4">
              {[
                {
                  q: "كيف أحسب أيام التبويض بعد الدورة الشهرية؟",
                  a: "أدخلي أول يوم من آخر دورة شهرية وطول دورتك المعتاد. تقدّر الحاسبة موعد الإباضة ونافذة الخصوبة بالاعتماد على طول الدورة، والنتائج ليست تأكيدًا لموعد الإباضة الفعلي.",
                },
                {
                  q: "متى يكون التبويض في دورة مدتها 28 يومًا؟",
                  a: "في دورة مدتها 28 يومًا، يكون موعد الإباضة التقديري غالبًا بالقرب من اليوم الرابع عشر عند استخدام طريقة حسابية تقويمية. وقد يختلف الموعد الفعلي من امرأة لأخرى ومن دورة لأخرى.",
                },
                {
                  q: "كيف أحسب فترة التبويض والخصوبة للحمل؟",
                  a: "تُقدّر نافذة الخصوبة عادةً بالأيام الخمسة السابقة للإباضة ويوم الإباضة نفسه. تساعد الحاسبة على تقدير هذه الفترة، لكنها لا تضمن حدوث الحمل أو تحدد فرصه بدقة.",
                },
                {
                  q: "هل يمكن حساب التبويض إذا كانت الدورة غير منتظمة؟",
                  a: "يمكن إدخال أقصر وأطول دورة شهرية للحصول على نطاق تقويمي تقديري. كلما زاد اختلاف طول الدورة، اتسع نطاق الاحتمالات وأصبحت طريقة التقويم أقل موثوقية.",
                },
                {
                  q: "هل حاسبة التبويض دقيقة ومضمونة 100%؟",
                  a: "لا توجد حاسبة تقويمية تضمن تحديد يوم الإباضة بدقة 100%. تعتمد النتائج على أطوال الدورة السابقة، وقد يتغير موعد الإباضة الفعلي لأسباب متعددة.",
                },
                {
                  q: "هل يمكن استخدام حاسبة التبويض للحمل بولد أو بنت؟",
                  a: "لا يمكن لحساب أيام التبويض أو توقيت الجماع ضمان الحمل بولد أو بنت. جنس الجنين لا يمكن تحديده بهذه الطريقة التقويمية.",
                },
                {
                  q: "هل يمكن الاعتماد على الحاسبة لمنع الحمل؟",
                  a: "لا. هذه الحاسبة أداة تقديرية للتوعية بموعد الخصوبة المحتمل وليست وسيلة لمنع الحمل. لا تعتمدي على الحساب التقويمي وحده لتجنب الحمل.",
                },
                {
                  q: "ما الفرق بين حاسبة التبويض بالهجري والميلادي؟",
                  a: "تعرض الحاسبة المواعيد المقدرة بالتقويمين الميلادي والهجري لتسهيل المتابعة. يتم إدخال تاريخ بداية آخر دورة بالتاريخ الميلادي، وقد يختلف التاريخ الهجري يومًا حسب التقويم المعتمد.",
                },
                {
                  q: "ما مدة أيام التبويض بعد الدورة بكم يوم؟",
                  a: "يختلف توقيت الإباضة حسب طول الدورة الشهرية. في دورة 28 يومًا قد يكون الموعد التقديري قرب اليوم الرابع عشر، لكن لا يوجد عدد ثابت من الأيام يناسب جميع النساء.",
                },
                {
                  q: "كيف أتابع التبويض إلى جانب الحساب التقويمي؟",
                  a: "يمكن تسجيل مواعيد الدورة وملاحظة تغيرات إفرازات عنق الرحم، كما قد تساعد اختبارات التبويض المنزلية التي تقيس الهرمون اللوتيني LH على توقع اقتراب الإباضة، لكنها لا تجعل التقدير التقويمي تأكيدًا طبيًا.",
                },
              ].map((item, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition open:border-orange-200 open:bg-orange-50/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-800 marker:hidden">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">
              أدوات صحية ذات صلة
            </h2>
            <p className="mt-3 leading-8 text-slate-600">
              يمكنك استخدام أدوات صحية أخرى على Intooly للمساعدة في متابعة
              المعلومات والحسابات الصحية العامة:
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              <li>
                <Link
                  href="/tools/pregnancy-calculator"
                  className="font-bold text-orange-700 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-800"
                >
                  حاسبة الحمل
                </Link>
                <span className="text-slate-600">
                  {" "}— لتقدير مراحل الحمل والمواعيد المرتبطة به.
                </span>
              </li>
              <li>
                <Link
                  href="/tools/bmi-calculator"
                  className="font-bold text-orange-700 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-800"
                >
                  حاسبة مؤشر كتلة الجسم BMI
                </Link>
                <span className="text-slate-600">
                  {" "}— لحساب مؤشر كتلة الجسم بصورة تقديرية.
                </span>
              </li>
            </ul>
          </article>

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="mb-3 text-xl font-extrabold text-orange-900">
              الخصوصية والتنبيه الصحي
            </h2>
            <p className="text-sm leading-8 text-orange-900">
              تتم عمليات الحساب داخل المتصفح ولا تتطلب إرسال بيانات الدورة
              الشهرية إلى الخادم. النتائج للتوعية والتقدير فقط، ولا تمثل
              تشخيصًا طبيًا أو بديلًا عن استشارة الطبيب، ولا تضمن حدوث الحمل
              أو تحدد جنس الجنين. لا تستخدمي الحاسبة وسيلةً لمنع الحمل.
            </p>
          </article>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          main {
            min-height: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
