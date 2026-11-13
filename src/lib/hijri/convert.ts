import { toHijri, toGregorian } from 'hijri-converter';

export const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export const GREGORIAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export const ARABIC_DAYS = [
  'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت',
];

export const MIN_HIJRI_YEAR = 1356;
export const MAX_HIJRI_YEAR = 1500;
export const MIN_GREGORIAN_YEAR = 1937;
export const MAX_GREGORIAN_YEAR = 2077;

export type HijriDate = { year: number; month: number; day: number };
export type GregorianDate = { year: number; month: number; day: number };

export interface ConversionResult {
  success: boolean;
  error?: string;
  hijri?: HijriDate;
  gregorian?: GregorianDate;
  dayOfWeek?: string;
  hijriFormatted?: string;
  gregorianFormatted?: string;
  hijriNumeric?: string;
  gregorianNumeric?: string;
}

export function hijriToGregorian(hijri: HijriDate): ConversionResult {
  const { year, month, day } = hijri;
  if (!year || !month || !day) return { success: false, error: 'يرجى إدخال اليوم والشهر والسنة' };
  if (year < MIN_HIJRI_YEAR || year > MAX_HIJRI_YEAR) {
    return { success: false, error: 'السنة الهجرية يجب أن تكون بين ' + MIN_HIJRI_YEAR + ' و ' + MAX_HIJRI_YEAR };
  }
  if (month < 1 || month > 12) return { success: false, error: 'الشهر الهجري يجب أن يكون بين 1 و 12' };
  if (day < 1 || day > 30) return { success: false, error: 'اليوم الهجري يجب أن يكون بين 1 و 30' };

  try {
    const result = toGregorian(year, month, day);
    const gregorian: GregorianDate = { year: result.gy, month: result.gm, day: result.gd };
    const date = new Date(gregorian.year, gregorian.month - 1, gregorian.day);
    const dayOfWeek = ARABIC_DAYS[date.getDay()];

    return {
      success: true,
      hijri,
      gregorian,
      dayOfWeek,
      hijriFormatted: day + ' ' + HIJRI_MONTHS[month - 1] + ' ' + year + ' هـ',
      gregorianFormatted: gregorian.day + ' ' + GREGORIAN_MONTHS[gregorian.month - 1] + ' ' + gregorian.year + ' م',
      hijriNumeric: year + '/' + String(month).padStart(2, '0') + '/' + String(day).padStart(2, '0'),
      gregorianNumeric: gregorian.year + '/' + String(gregorian.month).padStart(2, '0') + '/' + String(gregorian.day).padStart(2, '0'),
    };
  } catch (err) {
    return { success: false, error: 'تاريخ هجري غير صالح' };
  }
}

export function gregorianToHijri(gregorian: GregorianDate): ConversionResult {
  const { year, month, day } = gregorian;
  if (!year || !month || !day) return { success: false, error: 'يرجى إدخال اليوم والشهر والسنة' };
  if (year < MIN_GREGORIAN_YEAR || year > MAX_GREGORIAN_YEAR) {
    return { success: false, error: 'السنة الميلادية يجب أن تكون بين ' + MIN_GREGORIAN_YEAR + ' و ' + MAX_GREGORIAN_YEAR };
  }
  if (month < 1 || month > 12) return { success: false, error: 'الشهر الميلادي يجب أن يكون بين 1 و 12' };
  if (day < 1 || day > 31) return { success: false, error: 'اليوم الميلادي يجب أن يكون بين 1 و 31' };

  const testDate = new Date(year, month - 1, day);
  if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
    return { success: false, error: 'تاريخ ميلادي غير صالح' };
  }

  try {
    const result = toHijri(year, month, day);
    const hijri: HijriDate = { year: result.hy, month: result.hm, day: result.hd };
    const dayOfWeek = ARABIC_DAYS[testDate.getDay()];

    return {
      success: true,
      hijri,
      gregorian,
      dayOfWeek,
      hijriFormatted: hijri.day + ' ' + HIJRI_MONTHS[hijri.month - 1] + ' ' + hijri.year + ' هـ',
      gregorianFormatted: day + ' ' + GREGORIAN_MONTHS[month - 1] + ' ' + year + ' م',
      hijriNumeric: hijri.year + '/' + String(hijri.month).padStart(2, '0') + '/' + String(hijri.day).padStart(2, '0'),
      gregorianNumeric: year + '/' + String(month).padStart(2, '0') + '/' + String(day).padStart(2, '0'),
    };
  } catch (err) {
    return { success: false, error: 'تاريخ ميلادي غير صالح' };
  }
}

export function getTodayBoth() {
  const today = new Date();
  const gregorian: GregorianDate = { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
  const result = gregorianToHijri(gregorian);
  return { today, gregorian, hijri: result.hijri };
}