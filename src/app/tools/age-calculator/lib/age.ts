// src/app/tools/age-calculator/lib/age.ts
// منطق الحساب الميلادي الكامل للعمر

import type { DateInput, DetailedAge, AgeDifference, Milestone } from './types';
import {
  inputToDate,
  dateToInput,
  todayInput,
  isLeapYear,
  daysInMonth,
} from './validation';

const WEEKDAYS_AR = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export function getWeekdayAr(date: Date): string {
  return WEEKDAYS_AR[date.getDay()];
}

export function getMonthNameAr(month: number): string {
  return MONTHS_AR[month - 1] ?? '';
}

export function formatDateAr(d: DateInput): string {
  return `${d.day} ${getMonthNameAr(d.month)} ${d.year}`;
}

/**
 * إرجاع تاريخ "عيد الميلاد في سنة معينة"
 * - يعالج 29 فبراير في السنوات غير الكبيسة → 1 مارس
 */
function getBirthdayInYear(birth: DateInput, targetYear: number): DateInput {
  let day = birth.day;
  let month = birth.month;
  if (month === 2 && day === 29 && !isLeapYear(targetYear)) {
    day = 1;
    month = 3;
  }
  const maxDay = daysInMonth(targetYear, month);
  if (day > maxDay) day = maxDay;
  return { year: targetYear, month, day };
}

/**
 * حساب الفرق بين تاريخين بالسنوات والأشهر والأيام المكتملة.
 * ملاحظة: يعمل على التاريخ "كما هو" دون معالجة 29 فبراير —
 * هذه المعالجة تحدث في calculateAge و calculateAgeDifference.
 */
function diffYMD(start: DateInput, end: DateInput): {
  years: number;
  months: number;
  days: number;
} {
  const s = inputToDate(start);
  const e = inputToDate(end);

  if (s.getTime() >= e.getTime()) {
    return { years: 0, months: 0, days: 0 };
  }

  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();

  // إذا كانت أيام النهاية أقل، نقترض من الشهر السابق
  if (days < 0) {
    months -= 1;
    const prevMonthYear = e.getMonth() === 0 ? e.getFullYear() - 1 : e.getFullYear();
    const prevMonth = e.getMonth() === 0 ? 12 : e.getMonth();
    days += daysInMonth(prevMonthYear, prevMonth);
  }

  // إذا كانت الأشهر سالبة، نقترض سنة
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

/**
 * حساب العمر المفصل من تاريخ الميلاد إلى تاريخ مرجعي (افتراضيًا اليوم)
 */
export function calculateAge(
  birth: DateInput,
  reference: DateInput = todayInput()
): DetailedAge {
  // معالجة 29 فبراير: إذا وُلد في 29 فبراير والسنة المرجعية غير كبيسة،
  // نعتبر عيد ميلاده في تلك السنة هو 1 مارس
  let effectiveBirth = birth;
  if (
    birth.month === 2 &&
    birth.day === 29 &&
    !isLeapYear(reference.year) &&
    reference.month >= 3
  ) {
    // بعد 1 مارس من سنة غير كبيسة: نعتبر عيد ميلاده هذه السنة هو 1 مارس
    effectiveBirth = { year: birth.year, month: 3, day: 1 };
  }

  const { years, months, days } = diffYMD(effectiveBirth, reference);

  const birthDate = inputToDate(birth);
  const refDate = inputToDate(reference);
  const diffMs = refDate.getTime() - birthDate.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / 86400000));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // عيد الميلاد القادم
  let nextBirthdayInput = getBirthdayInYear(birth, reference.year);
  if (inputToDate(nextBirthdayInput).getTime() <= refDate.getTime()) {
    nextBirthdayInput = getBirthdayInYear(birth, reference.year + 1);
  }
  const nextBirthdayDate = inputToDate(nextBirthdayInput);
  const daysLeft = Math.ceil(
    (nextBirthdayDate.getTime() - refDate.getTime()) / 86400000
  );

  return {
    years, months, days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 24 * 60,
    totalSeconds: totalDays * 24 * 60 * 60,
    birthWeekday: getWeekdayAr(birthDate),
    nextBirthday: {
      date: nextBirthdayDate,
      dateInput: nextBirthdayInput,
      daysLeft,
      weekday: getWeekdayAr(nextBirthdayDate),
      ageTurning: years + 1,
    },
  };
}

/**
 * حساب العمر في تاريخ محدد
 */
export function calculateAgeAtDate(
  birth: DateInput,
  target: DateInput
): DetailedAge | null {
  if (inputToDate(target).getTime() < inputToDate(birth).getTime()) {
    return null;
  }
  return calculateAge(birth, target);
}

/**
 * التاريخ الذي سيبلغ فيه الشخص عمرًا معينًا
 */
export function getAgeTurningDate(
  birth: DateInput,
  targetAge: number
): DateInput {
  return getBirthdayInYear(birth, birth.year + targetAge);
}

/**
 * حساب الفرق بين شخصين
 */
export function calculateAgeDifference(
  first: DateInput,
  second: DateInput
): AgeDifference {
  const f = inputToDate(first).getTime();
  const s = inputToDate(second).getTime();

  let older: 'first' | 'second' | 'equal';
  if (f < s) older = 'first';
  else if (f > s) older = 'second';
  else older = 'equal';

  if (older === 'equal') {
    return { older, years: 0, months: 0, days: 0, totalDays: 0 };
  }

  const earlier = older === 'first' ? first : second;
  const later = older === 'first' ? second : first;

  // معالجة 29 فبراير في الفرق أيضًا
  let effectiveEarlier = earlier;
  if (
    earlier.month === 2 &&
    earlier.day === 29 &&
    !isLeapYear(later.year) &&
    later.month >= 3
  ) {
    effectiveEarlier = { year: earlier.year, month: 3, day: 1 };
  }

  const { years, months, days } = diffYMD(effectiveEarlier, later);
  const totalDays = Math.floor(
    (inputToDate(later).getTime() - inputToDate(earlier).getTime()) / 86400000
  );

  return { older, years, months, days, totalDays };
}

export const MILESTONE_DAYS = [
  1000, 5000, 10000, 15000, 20000, 25000, 30000, 40000,
] as const;

export function calculateMilestones(
  birth: DateInput,
  reference: DateInput = todayInput()
): Milestone[] {
  const birthDate = inputToDate(birth);
  const refDate = inputToDate(reference);
  const todayDays = Math.floor(
    (refDate.getTime() - birthDate.getTime()) / 86400000
  );

  return MILESTONE_DAYS.map((targetDays) => {
    const reachedDate = new Date(birthDate.getTime() + targetDays * 86400000);
    const reached = todayDays >= targetDays;
    return {
      label: `${targetDays.toLocaleString('en-US')} يوم`,
      targetDays,
      reached,
      reachedDate: reached ? dateToInput(reachedDate) : null,
      daysUntil: reached ? null : targetDays - todayDays,
    };
  });
}

export function getAgeInMonths(
  birth: DateInput,
  reference: DateInput = todayInput()
): number {
  const { years, months } = diffYMD(birth, reference);
  return years * 12 + months;
}
