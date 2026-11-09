// src/app/tools/age-calculator/lib/types.ts
// أنواع البيانات الأساسية لحاسبة العمر

export interface DateInput {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export interface DetailedAge {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  birthWeekday: string;
  nextBirthday: {
    date: Date;
    dateInput: DateInput;
    daysLeft: number;
    weekday: string;
    ageTurning: number;
  };
}

export interface AgeDifference {
  older: 'first' | 'second' | 'equal';
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export type CalendarType = 'gregorian' | 'hijri';

export type TabKey =
  | 'basic'
  | 'at-date'
  | 'birthday'
  | 'hijri'
  | 'diff'
  | 'child'
  | 'milestones'
  | 'stats';

export interface Milestone {
  label: string;
  targetDays: number;
  reached: boolean;
  reachedDate: DateInput | null;
  daysUntil: number | null;
}
