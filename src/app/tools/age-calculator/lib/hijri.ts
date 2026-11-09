// src/app/tools/age-calculator/lib/hijri.ts
// تحويل التقويم الهجري <-> الميلادي عبر Intl.DateTimeFormat
// - يستخدم islamic-umalqura (أم القرى) افتراضيًا
// - لا يحتاج مكتبات إضافية
// - المتصفحات الحديثة تدعمه أصليًا

import type { DateInput } from './types';
import { inputToDate, dateToInput, isLeapYear, daysInMonth } from './validation';

export type HijriMethod = 'islamic-umalqura' | 'islamic' | 'islamic-civil';

const DEFAULT_METHOD: HijriMethod = 'islamic-umalqura';

const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
];

const HIJRI_WEEKDAYS_AR = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

export interface HijriDate {
  year: number;
  month: number;   // 1-12
  day: number;     // 1-30
  monthNameAr: string;
  weekdayAr: string;
  method: HijriMethod;
}

// نُخزّن الـ formatters مؤقتًا لتحسين الأداء
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(method: HijriMethod, locale: string): Intl.DateTimeFormat {
  const key = `${method}|${locale}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      calendar: method,
      numberingSystem: 'latn',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

function getWeekdayFormatter(locale: string): Intl.DateTimeFormat {
  const key = `weekday|${locale}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

/**
 * تحويل تاريخ ميلادي → هجري
 * يعيد null إذا لم يستطع المتصفح إنشاء التحويل
 */
export function gregorianToHijri(
  gregorian: DateInput,
  method: HijriMethod = DEFAULT_METHOD
): HijriDate | null {
  try {
    const date = inputToDate(gregorian);
    const parts = getFormatter(method, 'ar-SA').formatToParts(date);

    let year = 0, month = 0, day = 0;
    for (const part of parts) {
      if (part.type === 'year') year = parseInt(part.value, 10);
      else if (part.type === 'month') month = parseInt(part.value, 10);
      else if (part.type === 'day') day = parseInt(part.value, 10);
    }

    if (!year || !month || !day) return null;

    // يوم الأسبوع بالعربية
    const weekdayParts = getWeekdayFormatter('ar-EG').formatToParts(date);
    const weekday = weekdayParts.find((p) => p.type === 'weekday')?.value ??
      HIJRI_WEEKDAYS_AR[date.getDay()];

    return {
      year,
      month,
      day,
      monthNameAr: HIJRI_MONTHS_AR[month - 1] ?? '',
      weekdayAr: weekday,
      method,
    };
  } catch {
    return null;
  }
}

/**
 * تحويل تاريخ هجري → ميلادي
 * - يعتمد على بحث عكسي (لأن Intl لا يدعم التحويل المباشر)
 * - نبحث في نطاق ±2 يوم حول التقدير الأولي
 */
export function hijriToGregorian(
  hijri: { year: number; month: number; day: number },
  method: HijriMethod = DEFAULT_METHOD
): DateInput | null {
  if (
    hijri.year < 1300 || hijri.year > 1600 ||
    hijri.month < 1 || hijri.month > 12 ||
    hijri.day < 1 || hijri.day > 30
  ) {
    return null;
  }

  // تقدير أولي: السنة الهجرية ~ 354.367 يومًا
  const approxTotalDays =
    (hijri.year - 1) * 354.367 +
    (hijri.month - 1) * 29.53 +
    (hijri.day - 1);

  // نأخذ نقطة انطلاق: 1 محرم 1 هـ ≈ 622-07-19 ميلادي
  const hijriEpoch = Date.UTC(622, 6, 19); // 19 يوليو 622
  const approxMs = hijriEpoch + approxTotalDays * 86400000;
  const approxDate = new Date(approxMs);

  // بحث في نطاق ±3 أيام
  for (let offset = -3; offset <= 3; offset++) {
    const candidate = new Date(approxDate.getTime() + offset * 86400000);
    const candidateInput = dateToInput(candidate);
    const converted = gregorianToHijri(candidateInput, method);
    if (
      converted &&
      converted.year === hijri.year &&
      converted.month === hijri.month &&
      converted.day === hijri.day
    ) {
      return candidateInput;
    }
  }

  return null;
}

/**
 * التحقق من صحة تاريخ هجري
 * - اليوم يجب أن يكون بين 1 و 29/30 حسب الشهر
 */
export function isValidHijriDate(hijri: {
  year: number;
  month: number;
  day: number;
}): boolean {
  if (
    hijri.year < 1300 || hijri.year > 1600 ||
    hijri.month < 1 || hijri.month > 12 ||
    hijri.day < 1 || hijri.day > 30
  ) {
    return false;
  }
  // التحقق الفعلي: هل التحويل يعيد نفس القيم؟
  const greg = hijriToGregorian(hijri);
  if (!greg) return false;
  const back = gregorianToHijri(greg);
  return (
    back !== null &&
    back.year === hijri.year &&
    back.month === hijri.month &&
    back.day === hijri.day
  );
}

/**
 * تنسيق تاريخ هجري بصيغة عربية
 */
export function formatHijriAr(h: HijriDate): string {
  return `${h.day} ${h.monthNameAr} ${h.year} هـ`;
}

/**
 * اسم الشهر الهجري بالعربية
 */
export function getHijriMonthNameAr(month: number): string {
  return HIJRI_MONTHS_AR[month - 1] ?? '';
}

/**
 * حساب العمر الهجري بالسنوات والأشهر والأيام
 * - يستخدم نفس منطق diffYMD لكن على التواريخ الهجرية
 * - نُعيد النتيجة كأرقام (سنوات/أشهر/أيام)
 */
export function calculateHijriAge(
  birthHijri: { year: number; month: number; day: number },
  referenceHijri: { year: number; month: number; day: number }
): { years: number; months: number; days: number } | null {
  if (
    !isValidHijriDate(birthHijri) ||
    !isValidHijriDate(referenceHijri)
  ) {
    return null;
  }

  // نحوّل إلى ميلادي لحساب الفرق الفعلي بدقة
  const birthGreg = hijriToGregorian(birthHijri);
  const refGreg = hijriToGregorian(referenceHijri);
  if (!birthGreg || !refGreg) return null;

  const birthDate = inputToDate(birthGreg);
  const refDate = inputToDate(refGreg);

  if (birthDate.getTime() > refDate.getTime()) return null;

  // حساب الفرق الهجري بشكل تقويمي بسيط
  let years = referenceHijri.year - birthHijri.year;
  let months = referenceHijri.month - birthHijri.month;
  let days = referenceHijri.day - birthHijri.day;

  if (days < 0) {
    months -= 1;
    days += 30; // تقريب: الشهر الهجري 29-30 يومًا
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}
