export interface ArabCountry {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencyName: string;
}

export const ARAB_COUNTRIES: ArabCountry[] = [
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿', currency: 'DZD', currencyName: 'الدينار الجزائري' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭', currency: 'BHD', currencyName: 'الدينار البحريني' },
  { code: 'KM', name: 'جزر القمر', flag: '🇰🇲', currency: 'KMF', currencyName: 'الفرنك القمري' },
  { code: 'DJ', name: 'جيبوتي', flag: '🇩🇯', currency: 'DJF', currencyName: 'الفرنك الجيبوتي' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬', currency: 'EGP', currencyName: 'الجنيه المصري' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶', currency: 'IQD', currencyName: 'الدينار العراقي' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴', currency: 'JOD', currencyName: 'الدينار الأردني' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼', currency: 'KWD', currencyName: 'الدينار الكويتي' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧', currency: 'LBP', currencyName: 'الليرة اللبنانية' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾', currency: 'LYD', currencyName: 'الدينار الليبي' },
  { code: 'MR', name: 'موريتانيا', flag: '🇲🇷', currency: 'MRU', currencyName: 'الأوقية الموريتانية' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦', currency: 'MAD', currencyName: 'الدرهم المغربي' },
  { code: 'OM', name: 'عُمان', flag: '🇴🇲', currency: 'OMR', currencyName: 'الريال العُماني' },
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸', currency: 'ILS', currencyName: 'الشيكل الإسرائيلي (متداول)' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦', currency: 'QAR', currencyName: 'الريال القطري' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦', currency: 'SAR', currencyName: 'الريال السعودي' },
  { code: 'SO', name: 'الصومال', flag: '🇸🇴', currency: 'SOS', currencyName: 'الشلن الصومالي' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩', currency: 'SDG', currencyName: 'الجنيه السوداني' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾', currency: 'SYP', currencyName: 'الليرة السورية' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳', currency: 'TND', currencyName: 'الدينار التونسي' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪', currency: 'AED', currencyName: 'الدرهم الإماراتي' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪', currency: 'YER', currencyName: 'الريال اليمني' },
];

export const DEFAULT_COUNTRY = 'EG';