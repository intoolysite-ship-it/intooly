// src/app/tools/age-calculator/lib/validation.ts
// التحقق من صحة التواريخ وتحويلها

import type { DateInput } from './types';

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

export function isValidDate(d: DateInput): boolean {
  if (
    !Number.isInteger(d.year) ||
    !Number.isInteger(d.month) ||
    !Number.isInteger(d.day)
  ) {
    return false;
  }
  if (d.year < MIN_YEAR || d.year > MAX_YEAR) return false;
  if (d.month < 1 || d.month > 12) return false;
  if (d.day < 1 || d.day > 31) return false;

  const date = new Date(d.year, d.month - 1, d.day);
  return (
    date.getFullYear() === d.year &&
    date.getMonth() === d.month - 1 &&
    date.getDate() === d.day
  );
}

export function inputToDate(d: DateInput): Date {
  return new Date(d.year, d.month - 1, d.day);
}

export function dateToInput(date: Date): DateInput {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function todayInput(): DateInput {
  return dateToInput(new Date());
}

export function isFutureDate(d: DateInput): boolean {
  const today = todayInput();
  const todayDate = inputToDate(today);
  const target = inputToDate(d);
  return target.getTime() > todayDate.getTime();
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * رسالة خطأ عربية مناسبة عند رفض تاريخ
 */
export function getDateError(d: DateInput): string | null {
  if (!isValidDate(d)) {
    if (d.year < MIN_YEAR || d.year > MAX_YEAR) {
      return `السنة يجب أن تكون بين ${MIN_YEAR} و ${MAX_YEAR}`;
    }
    return 'تاريخ غير صالح. تحقق من اليوم والشهر والسنة.';
  }
  return null;
}
