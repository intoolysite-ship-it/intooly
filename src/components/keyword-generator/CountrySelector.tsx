'use client';

import { useState } from 'react';
import { Search, Globe, X, ChevronDown } from 'lucide-react';
import { COUNTRIES, type CountryCode } from '@/lib/keyword-generator/constants';

interface CountrySelectorProps {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  disabled?: boolean;
}

const ARAB_COUNTRIES = COUNTRIES.filter(c => 
  ['khaliji', 'masri', 'shami', 'iraqi', 'yemeni', 'libi', 'tunisi', 'jazairi', 'maghribi', 'sudani'].includes(c.dialect)
);

const WORLD_COUNTRIES = COUNTRIES.filter(c => 
  !['khaliji', 'masri', 'shami', 'iraqi', 'yemeni', 'libi', 'tunisi', 'jazairi', 'maghribi', 'sudani'].includes(c.dialect)
);

export default function CountrySelector({ value, onChange, disabled = false }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const selected = COUNTRIES.find(c => c.code === value);
  
  const filteredArab = ARAB_COUNTRIES.filter(c =>
    c.name.includes(searchQuery) || c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredWorld = WORLD_COUNTRIES.filter(c =>
    c.name.includes(searchQuery) || c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (code: CountryCode) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  return (
    <div className="relative">
      {/* الزر الرئيسي */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-ink-200 rounded-xl hover:border-brand-400 transition-all text-right font-bold text-ink-900 disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-500 flex-shrink-0" />
          {selected ? (
            <>
              <span className="text-xl">{selected.flag}</span>
              <span className="text-sm md:text-base">{selected.name}</span>
            </>
          ) : (
            <span className="text-sm md:text-base">اختر الدولة</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* القائمة المنسدلة */}
      {isOpen && (
        <>
          {/* Overlay للإغلاق */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border-2 border-ink-200 rounded-xl shadow-2xl overflow-hidden">
            
            {/* شريط البحث */}
            <div className="p-3 border-b border-ink-200">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دولة..."
                  className="w-full pl-3 pr-10 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
                  autoFocus
                />
              </div>
            </div>
            
            {/* القائمة */}
            <div className="max-h-80 overflow-y-auto">
              
              {/* خيار "جميع الدول العربية" */}
              <button
                onClick={() => handleSelect('ALL')}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors text-right border-b border-ink-100 ${
                  value === 'ALL' ? 'bg-brand-50' : ''
                }`}
              >
                <span className="text-xl">🌍</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-ink-900">جميع الدول العربية</p>
                  <p className="text-xs text-ink-500">اجمع الاقتراحات من 22 دولة</p>
                </div>
                {value === 'ALL' && <span className="text-brand-600 font-bold">✓</span>}
              </button>
              
              {/* الدول العربية */}
              {filteredArab.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-ink-50 text-xs font-bold text-ink-600 sticky top-0 z-10">
                    🇸🇦 الدول العربية
                  </div>
                  {filteredArab.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleSelect(country.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-right ${
                        value === country.code ? 'bg-brand-50' : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink-900 truncate">{country.name}</p>
                        <p className="text-[10px] text-ink-500">{country.nameEn}</p>
                      </div>
                      {value === country.code && <span className="text-brand-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              
              {/* دول العالم */}
              {filteredWorld.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-ink-50 text-xs font-bold text-ink-600 sticky top-0 z-10">
                    🌍 دول العالم
                  </div>
                  {filteredWorld.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleSelect(country.code)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 transition-colors text-right ${
                        value === country.code ? 'bg-brand-50' : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink-900 truncate">{country.name}</p>
                        <p className="text-[10px] text-ink-500">{country.nameEn}</p>
                      </div>
                      {value === country.code && <span className="text-brand-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
              
              {/* لا نتائج */}
              {filteredArab.length === 0 && filteredWorld.length === 0 && (
                <div className="p-6 text-center text-ink-500 text-sm">
                  لا توجد نتائج
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
