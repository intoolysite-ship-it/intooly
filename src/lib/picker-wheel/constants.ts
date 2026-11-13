import type { WheelOption, WheelSettings, WheelTemplate } from './types';

export const WHEEL_COLORS = [
  '#EA580C',
  '#F59E0B',
  '#0F766E',
  '#2563EB',
  '#9333EA',
  '#DB2777',
  '#0891B2',
  '#65A30D',
  '#DC2626',
  '#475569',
  '#7C3AED',
  '#0D9488',
] as const;

export const DEFAULT_WHEEL_SETTINGS: WheelSettings = {
  spinDuration: 8,
  soundEnabled: true,
  removeWinnerAfterSpin: false,
  winnerCount: 1,
  showImages: true,
};

export const DEFAULT_OPTIONS: WheelOption[] = [
  { id: 'option-1', label: 'الخيار الأول', color: WHEEL_COLORS[0], weight: 1, winCount: 0 },
  { id: 'option-2', label: 'الخيار الثاني', color: WHEEL_COLORS[1], weight: 1, winCount: 0 },
  { id: 'option-3', label: 'الخيار الثالث', color: WHEEL_COLORS[2], weight: 1, winCount: 0 },
  { id: 'option-4', label: 'الخيار الرابع', color: WHEEL_COLORS[3], weight: 1, winCount: 0 },
];

export const WHEEL_TEMPLATES: WheelTemplate[] = [
  {
    id: 'yes-no',
    name: 'نعم أو لا',
    options: ['نعم', 'لا'],
  },
  {
    id: 'numbers',
    name: 'الأرقام من 1 إلى 10',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  {
    id: 'names',
    name: 'اختيار اسم',
    options: ['أحمد', 'محمد', 'علي', 'عمر', 'يوسف', 'محمود'],
  },
  {
    id: 'food',
    name: 'ماذا نأكل اليوم؟',
    options: ['بيتزا', 'برجر', 'شاورما', 'مشويات', 'مكرونة', 'فراخ'],
  },
  {
    id: 'weekdays',
    name: 'أيام الأسبوع',
    options: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
  },
];

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 100;
export const MAX_WINNERS = 20;
export const MIN_WEIGHT = 0.1;
export const MAX_WEIGHT = 100;
export const DEFAULT_SPIN_DURATION = 8;
