/**
 * مكتبة المناسبات الموسمية
 * أفكار كلمات مفتاحية مرتبطة بالمناسبات
 * ⚠️ هذه أفكار موسمية، لا أحجام بحث مؤكدة
 */

import type { CountryCode } from './constants';
import { COUNTRY_EVENTS } from './constants';

// ============================================
// 1. المناسبات العالمية
// ============================================

export interface SeasonalEvent {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  month: number; // 1-12
  countries: CountryCode[] | 'all';
  keywords: string[];
}

export const GLOBAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'ramadan',
    name: 'رمضان',
    nameEn: 'Ramadan',
    icon: '🌙',
    month: 3,
    countries: 'all',
    keywords: ['عروض رمضان', 'تخفيضات رمضان', 'فوانيس رمضان', 'إفطار رمضان', 'سحور رمضان', 'هدايا رمضان'],
  },
  {
    id: 'eid-fitr',
    name: 'عيد الفطر',
    nameEn: 'Eid Al-Fitr',
    icon: '🎉',
    month: 4,
    countries: 'all',
    keywords: ['هدايا عيد الفطر', 'عروض عيد الفطر', 'تخفيضات عيد الفطر', 'ملابس العيد'],
  },
  {
    id: 'eid-adha',
    name: 'عيد الأضحى',
    nameEn: 'Eid Al-Adha',
    icon: '🐑',
    month: 6,
    countries: 'all',
    keywords: ['أضحية العيد', 'هدايا عيد الأضحى', 'عروض عيد الأضحى', 'تخفيضات عيد الأضحى'],
  },
  {
    id: 'black-friday',
    name: 'الجمعة البيضاء',
    nameEn: 'White Friday',
    icon: '🛍️',
    month: 11,
    countries: 'all',
    keywords: ['تخفيضات الجمعة البيضاء', 'عروض الجمعة البيضاء', 'أفضل صفقات'],
  },
  {
    id: 'back-to-school',
    name: 'العودة للمدارس',
    nameEn: 'Back to School',
    icon: '🎒',
    month: 8,
    countries: 'all',
    keywords: ['مستلزمات مدرسية', 'حقائب مدرسية', 'أدوات مكتبية', 'زي مدرسي'],
  },
  {
    id: 'new-year',
    name: 'رأس السنة',
    nameEn: 'New Year',
    icon: '🎆',
    month: 12,
    countries: 'all',
    keywords: ['عروض رأس السنة', 'هدايا رأس السنة', 'تخفيضات رأس السنة'],
  },
];

// ============================================
// 2. المناسبات الوطنية
// ============================================

export const NATIONAL_EVENTS: Record<string, SeasonalEvent[]> = {
  SA: [
    {
      id: 'saudi-national-day',
      name: 'اليوم الوطني السعودي',
      nameEn: 'Saudi National Day',
      icon: '🇸🇦',
      month: 9,
      countries: ['SA'],
      keywords: ['اليوم الوطني السعودي', 'عروض اليوم الوطني', 'احتفالات اليوم الوطني', 'هدايا اليوم الوطني'],
    },
    {
      id: 'saudi-founding-day',
      name: 'يوم التأسيس',
      nameEn: 'Saudi Founding Day',
      icon: '🏛️',
      month: 2,
      countries: ['SA'],
      keywords: ['يوم التأسيس', 'عروض يوم التأسيس', 'احتفالات يوم التأسيس'],
    },
    {
      id: 'riyadh-season',
      name: 'موسم الرياض',
      nameEn: 'Riyadh Season',
      icon: '🎭',
      month: 10,
      countries: ['SA'],
      keywords: ['موسم الرياض', 'فعاليات موسم الرياض', 'تذاكر موسم الرياض'],
    },
  ],
  EG: [
    {
      id: 'sham-el-nessim',
      name: 'شم النسيم',
      nameEn: 'Sham El Nessim',
      icon: '🌸',
      month: 4,
      countries: ['EG'],
      keywords: ['شم النسيم', 'رحلات شم النسيم', 'فعاليات شم النسيم'],
    },
    {
      id: 'egypt-jan25',
      name: 'عيد ثورة 25 يناير',
      nameEn: 'Jan 25 Revolution',
      icon: '🇪🇬',
      month: 1,
      countries: ['EG'],
      keywords: ['ثورة 25 يناير', 'عيد الثورة'],
    },
    {
      id: 'egypt-jun30',
      name: 'عيد ثورة 30 يونيو',
      nameEn: 'Jun 30 Revolution',
      icon: '🇪🇬',
      month: 6,
      countries: ['EG'],
      keywords: ['ثورة 30 يونيو', 'عيد الثورة'],
    },
  ],
  MA: [
    {
      id: 'morocco-throne-day',
      name: 'عيد العرش',
      nameEn: 'Throne Day',
      icon: '👑',
      month: 7,
      countries: ['MA'],
      keywords: ['عيد العرش', 'احتفالات عيد العرش'],
    },
    {
      id: 'morocco-green-march',
      name: 'عيد المسيرة الخضراء',
      nameEn: 'Green March Day',
      icon: '🇲🇦',
      month: 11,
      countries: ['MA'],
      keywords: ['المسيرة الخضراء', 'عيد المسيرة'],
    },
    {
      id: 'amazigh-new-year',
      name: 'رأس السنة الأمازيغية',
      nameEn: 'Amazigh New Year',
      icon: '🌾',
      month: 1,
      countries: ['MA', 'DZ'],
      keywords: ['رأس السنة الأمازيغية', 'يناير الأمازيغي'],
    },
  ],
  AE: [
    {
      id: 'uae-national-day',
      name: 'اليوم الوطني الإماراتي',
      nameEn: 'UAE National Day',
      icon: '🇦🇪',
      month: 12,
      countries: ['AE'],
      keywords: ['اليوم الوطني الإماراتي', 'عروض اليوم الوطني', 'احتفالات الاتحاد'],
    },
    {
      id: 'dubai-shopping-festival',
      name: 'دبي شوبينج فستيفال',
      nameEn: 'Dubai Shopping Festival',
      icon: '🛍️',
      month: 1,
      countries: ['AE'],
      keywords: ['دبي شوبينج فستيفال', 'تخفيضات دبي', 'عروض دبي'],
    },
  ],
  KW: [
    {
      id: 'kuwait-national-day',
      name: 'اليوم الوطني الكويتي',
      nameEn: 'Kuwait National Day',
      icon: '🇰🇼',
      month: 2,
      countries: ['KW'],
      keywords: ['اليوم الوطني الكويتي', 'العيد الوطني', 'عيد التحرير'],
    },
  ],
};

// ============================================
// 3. الدوال
// ============================================

/**
 * الحصول على المناسبات حسب الدولة والشهر
 */
export function getEventsByCountry(
  country: CountryCode,
  month?: number
): SeasonalEvent[] {
  const events: SeasonalEvent[] = [];
  
  // المناسبات العالمية
  for (const event of GLOBAL_EVENTS) {
    if (event.countries === 'all' || event.countries.includes(country)) {
      if (!month || event.month === month) {
        events.push(event);
      }
    }
  }
  
  // المناسبات الوطنية
  const nationalEvents = NATIONAL_EVENTS[country] || [];
  for (const event of nationalEvents) {
    if (!month || event.month === month) {
      events.push(event);
    }
  }
  
  return events;
}

/**
 * الحصول على كل المناسبات (للتصدير)
 */
export function getAllEvents(): SeasonalEvent[] {
  const all: SeasonalEvent[] = [...GLOBAL_EVENTS];
  for (const events of Object.values(NATIONAL_EVENTS)) {
    all.push(...events);
  }
  return all;
}

/**
 * توليد كلمات مفتاحية من مناسبة
 */
export function generateEventKeywords(
  event: SeasonalEvent,
  baseKeyword: string
): string[] {
  const keywords: string[] = [];
  
  for (const eventKeyword of event.keywords) {
    keywords.push(eventKeyword);
    keywords.push(`${baseKeyword} ${eventKeyword}`);
  }
  
  return keywords;
}

/**
 * الحصول على المناسبات القادمة (خلال 3 أشهر)
 */
export function getUpcomingEvents(
  country: CountryCode,
  currentMonth: number = new Date().getMonth() + 1
): SeasonalEvent[] {
  const upcoming: SeasonalEvent[] = [];
  
  for (let i = 0; i < 3; i++) {
    const month = ((currentMonth + i - 1) % 12) + 1;
    const events = getEventsByCountry(country, month);
    upcoming.push(...events);
  }
  
  return upcoming;
}
