// src/lib/hijri/events.ts
// المناسبات الإسلامية الثابتة (وفق التقويم الهجري)

export interface IslamicEvent {
  id: string;
  name: string;
  description: string;
  hijriMonth: number; // 1-12
  hijriDay: number;
  isEstimated?: boolean; // إذا كان يعتمد على رؤية الهلال
  category: 'major' | 'monthly' | 'weekly';
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'new-year',
    name: 'رأس السنة الهجرية',
    description: 'أول يوم من شهر محرم، بداية السنة الهجرية الجديدة',
    hijriMonth: 1,
    hijriDay: 1,
    category: 'major',
  },
  {
    id: 'ashura',
    name: 'يوم عاشوراء',
    description: 'اليوم العاشر من محرم، يوم صيام تطوعي',
    hijriMonth: 1,
    hijriDay: 10,
    category: 'major',
  },
  {
    id: 'mawlid',
    name: 'المولد النبوي الشريف',
    description: 'ذكرى مولد النبي محمد ﷺ في 12 ربيع الأول',
    hijriMonth: 3,
    hijriDay: 12,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'isra-miraj',
    name: 'الإسراء والمعراج',
    description: 'ذكرى رحلة الإسراء والمعراج في 27 رجب',
    hijriMonth: 7,
    hijriDay: 27,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'mid-shaban',
    name: 'ليلة النصف من شعبان',
    description: 'ليلة 15 شعبان، من الليالي المباركة',
    hijriMonth: 8,
    hijriDay: 15,
    isEstimated: true,
    category: 'monthly',
  },
  {
    id: 'ramadan',
    name: 'شهر رمضان المبارك',
    description: 'شهر الصيام والقرآن، الشهر التاسع من السنة الهجرية',
    hijriMonth: 9,
    hijriDay: 1,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'laylat-al-qadr',
    name: 'ليلة القدر',
    description: 'ليلة مباركة في العشر الأواخر من رمضان (تُلتمس في 27 رمضان)',
    hijriMonth: 9,
    hijriDay: 27,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'eid-fitr',
    name: 'عيد الفطر المبارك',
    description: 'أول يوم من شهر شوال، عيد المسلمين بعد صيام رمضان',
    hijriMonth: 10,
    hijriDay: 1,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'arafah',
    name: 'يوم عرفة',
    description: 'اليوم التاسع من ذي الحجة، أعظم أيام الحج',
    hijriMonth: 12,
    hijriDay: 9,
    isEstimated: true,
    category: 'major',
  },
  {
    id: 'eid-adha',
    name: 'عيد الأضحى المبارك',
    description: 'اليوم العاشر من ذي الحجة، عيد الأضحى المبارك',
    hijriMonth: 12,
    hijriDay: 10,
    isEstimated: true,
    category: 'major',
  },
];