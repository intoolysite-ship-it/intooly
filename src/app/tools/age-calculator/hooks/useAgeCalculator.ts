// src/app/tools/age-calculator/hooks/useAgeCalculator.ts
// hook مركزي لإدارة حالة حاسبة العمر

'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  DateInput,
  DetailedAge,
  AgeDifference,
  CalendarType,
  TabKey,
  Milestone,
} from '../lib/types';
import {
  todayInput,
  isValidDate,
  getDateError,
} from '../lib/validation';
import {
  calculateAge,
  calculateAgeAtDate,
  calculateAgeDifference,
  calculateMilestones,
  getAgeTurningDate,
  getAgeInMonths,
  getWeekdayAr,
  formatDateAr,
} from '../lib/age';
import {
  gregorianToHijri,
  hijriToGregorian,
  formatHijriAr,
  isValidHijriDate,
  calculateHijriAge,
  type HijriDate,
} from '../lib/hijri';

export interface UseAgeCalculatorReturn {
  // الحالة
  birth: DateInput;
  reference: DateInput;
  customDate: DateInput;
  secondBirth: DateInput;
  targetAge: number;
  calendar: CalendarType;
  activeTab: TabKey;

  // رسائل التحقق
  birthError: string | null;
  referenceError: string | null;
  customDateError: string | null;
  secondBirthError: string | null;

  // النتائج المشتقة
  age: DetailedAge | null;
  ageAtCustomDate: DetailedAge | null;
  ageDifference: AgeDifference | null;
  milestones: Milestone[];
  ageInMonths: number;
  hijriBirth: HijriDate | null;
  hijriReference: HijriDate | null;
  hijriAge: { years: number; months: number; days: number } | null;
  turningDate18: DateInput;
  turningDate21: DateInput;
  turningDate60: DateInput;
  birthWeekdayAr: string;
  formattedBirth: string;

  // دوال التحكم
  setBirth: (d: DateInput) => void;
  setReference: (d: DateInput) => void;
  setCustomDate: (d: DateInput) => void;
  setSecondBirth: (d: DateInput) => void;
  setTargetAge: (age: number) => void;
  setCalendar: (c: CalendarType) => void;
  setActiveTab: (t: TabKey) => void;
  resetAll: () => void;
  setTodayAsReference: () => void;
}

export function useAgeCalculator(): UseAgeCalculatorReturn {
  const [birth, setBirthRaw] = useState<DateInput>({
    year: 1995, month: 6, day: 15,
  });
  const [reference, setReferenceRaw] = useState<DateInput>(todayInput());
  const [customDate, setCustomDateRaw] = useState<DateInput>(todayInput());
  const [secondBirth, setSecondBirthRaw] = useState<DateInput>({
    year: 2000, month: 1, day: 1,
  });
  const [targetAge, setTargetAge] = useState<number>(18);
  const [calendar, setCalendar] = useState<CalendarType>('gregorian');
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // ---- رسائل التحقق ----
  const birthError = useMemo(() => {
    if (!isValidDate(birth)) return getDateError(birth);
    if (birth.year > todayInput().year) {
      return 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
    }
    return null;
  }, [birth]);

  const referenceError = useMemo(() => getDateError(reference), [reference]);
  const customDateError = useMemo(() => getDateError(customDate), [customDate]);
  const secondBirthError = useMemo(() => getDateError(secondBirth), [secondBirth]);

  // ---- النتائج المشتقة ----
  const age = useMemo<DetailedAge | null>(() => {
    if (birthError || referenceError) return null;
    return calculateAge(birth, reference);
  }, [birth, reference, birthError, referenceError]);

  const ageAtCustomDate = useMemo<DetailedAge | null>(() => {
    if (birthError || customDateError) return null;
    return calculateAgeAtDate(birth, customDate);
  }, [birth, customDate, birthError, customDateError]);

  const ageDifference = useMemo<AgeDifference | null>(() => {
    if (birthError || secondBirthError) return null;
    return calculateAgeDifference(birth, secondBirth);
  }, [birth, secondBirth, birthError, secondBirthError]);

  const milestones = useMemo<Milestone[]>(() => {
    if (birthError) return [];
    return calculateMilestones(birth, reference);
  }, [birth, reference, birthError]);

  const ageInMonths = useMemo(() => {
    if (birthError || referenceError) return 0;
    return getAgeInMonths(birth, reference);
  }, [birth, reference, birthError, referenceError]);

  // ---- الهجري ----
  const hijriBirth = useMemo<HijriDate | null>(() => {
    if (birthError) return null;
    return gregorianToHijri(birth);
  }, [birth, birthError]);

  const hijriReference = useMemo<HijriDate | null>(() => {
    if (referenceError) return null;
    return gregorianToHijri(reference);
  }, [reference, referenceError]);

  const hijriAge = useMemo(() => {
    if (!hijriBirth || !hijriReference) return null;
    if (!isValidHijriDate(hijriBirth) || !isValidHijriDate(hijriReference)) {
      return null;
    }
    return calculateHijriAge(
      { year: hijriBirth.year, month: hijriBirth.month, day: hijriBirth.day },
      { year: hijriReference.year, month: hijriReference.month, day: hijriReference.day }
    );
  }, [hijriBirth, hijriReference]);

  // ---- تواريخ بلوغ أعمار شائعة ----
  const turningDate18 = useMemo(() => getAgeTurningDate(birth, 18), [birth]);
  const turningDate21 = useMemo(() => getAgeTurningDate(birth, 21), [birth]);
  const turningDate60 = useMemo(() => getAgeTurningDate(birth, 60), [birth]);

  // ---- يوم الأسبوع والتنسيق ----
  const birthWeekdayAr = useMemo(() => {
    if (birthError) return '';
    const d = new Date(birth.year, birth.month - 1, birth.day);
    return getWeekdayAr(d);
  }, [birth, birthError]);

  const formattedBirth = useMemo(() => formatDateAr(birth), [birth]);

  // ---- دوال التحكم ----
  const setBirth = useCallback((d: DateInput) => setBirthRaw(d), []);
  const setReference = useCallback((d: DateInput) => setReferenceRaw(d), []);
  const setCustomDate = useCallback((d: DateInput) => setCustomDateRaw(d), []);
  const setSecondBirth = useCallback((d: DateInput) => setSecondBirthRaw(d), []);

  const setTodayAsReference = useCallback(() => {
    setReferenceRaw(todayInput());
  }, []);

  const resetAll = useCallback(() => {
    setBirthRaw({ year: 1995, month: 6, day: 15 });
    setReferenceRaw(todayInput());
    setCustomDateRaw(todayInput());
    setSecondBirthRaw({ year: 2000, month: 1, day: 1 });
    setTargetAge(18);
    setCalendar('gregorian');
    setActiveTab('basic');
  }, []);

  return {
    birth, reference, customDate, secondBirth, targetAge, calendar, activeTab,
    birthError, referenceError, customDateError, secondBirthError,
    age, ageAtCustomDate, ageDifference, milestones, ageInMonths,
    hijriBirth, hijriReference, hijriAge,
    turningDate18, turningDate21, turningDate60,
    birthWeekdayAr, formattedBirth,
    setBirth, setReference, setCustomDate, setSecondBirth,
    setTargetAge, setCalendar, setActiveTab,
    resetAll, setTodayAsReference,
  };
}
