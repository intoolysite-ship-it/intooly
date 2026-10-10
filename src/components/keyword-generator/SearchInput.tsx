'use client';

import { useState } from 'react';
import { Search, Sparkles, Settings2, ChevronDown } from 'lucide-react';
import CountrySelector from './CountrySelector';
import type { KeywordInput } from '@/lib/keyword-generator/types';
import type { CountryCode } from '@/lib/keyword-generator/constants';

interface SearchInputProps {
  onSearch: (input: KeywordInput) => void;
  disabled?: boolean;
  initialInput?: Partial<KeywordInput>;
}

export default function SearchInput({ 
  onSearch, 
  disabled = false,
  initialInput 
}: SearchInputProps) {
  const [keyword, setKeyword] = useState(initialInput?.keyword || '');
  const [country, setCountry] = useState<CountryCode>(initialInput?.country || 'SA');
  const [language, setLanguage] = useState<'ar' | 'en' | 'all'>(initialInput?.language || 'ar');
  const [maxResults, setMaxResults] = useState(initialInput?.maxResults || 30);
  const [includeQuestions, setIncludeQuestions] = useState(initialInput?.includeQuestions ?? true);
  const [includeLongTail, setIncludeLongTail] = useState(initialInput?.includeLongTail ?? true);
  const [includeRelated, setIncludeRelated] = useState(initialInput?.includeRelated ?? true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      setError('الرجاء إدخال كلمة مفتاحية (حرفان على الأقل)');
      return;
    }
    
    if (trimmed.length > 100) {
      setError('الكلمة طويلة جداً (الحد: 100 حرف)');
      return;
    }
    
    setError(null);
    
    onSearch({
      keyword: trimmed,
      country,
      language,
      maxResults,
      includeQuestions,
      includeLongTail,
      includeRelated,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* البحث الرئيسي */}
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-6 space-y-4">
        
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">
            🎯 الكلمة المفتاحية
          </label>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="مثال: تحويل الفيديو إلى GIF"
              className="w-full pl-4 pr-12 py-4 bg-ink-50 border-2 border-ink-200 rounded-xl text-base font-bold focus:outline-none focus:border-brand-400 focus:bg-white transition-colors"
              disabled={disabled}
              dir="auto"
            />
          </div>
        </div>
        
        {/* اختيار الدولة */}
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">
            🌍 السوق المستهدف
          </label>
          <CountrySelector value={country} onChange={setCountry} disabled={disabled} />
        </div>
        
        {/* اللغة */}
        <div>
          <label className="block text-sm font-bold text-ink-900 mb-2">
            🗣️ لغة الكلمات
          </label>
          <div className="flex gap-2">
            {[
              { id: 'ar' as const, label: 'العربية', flag: '🇸🇦' },
              { id: 'en' as const, label: 'English', flag: '🇬🇧' },
              { id: 'all' as const, label: 'كل اللغات', flag: '🌐' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                disabled={disabled}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  language === lang.id
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* زر الإعدادات المتقدمة */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-ink-600 hover:text-brand-600 py-2"
        >
          <Settings2 className="w-4 h-4" />
          الإعدادات المتقدمة
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
        
        {/* الإعدادات المتقدمة */}
        {showAdvanced && (
          <div className="space-y-3 pt-3 border-t-2 border-ink-100">
            
            {/* عدد النتائج */}
            <div>
              <label className="block text-xs font-bold text-ink-600 mb-2">
                عدد النتائج: {maxResults}
              </label>
              <input
                type="range"
                min={10}
                max={100}
                step={10}
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                disabled={disabled}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-bold mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>
            
            {/* الخيارات */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg cursor-pointer hover:bg-brand-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeQuestions}
                  onChange={(e) => setIncludeQuestions(e.target.checked)}
                  disabled={disabled}
                  className="w-5 h-5 accent-brand-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-ink-900">تضمين الأسئلة</p>
                  <p className="text-xs text-ink-500">كيف، ما، لماذا، متى، أين</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg cursor-pointer hover:bg-brand-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeLongTail}
                  onChange={(e) => setIncludeLongTail(e.target.checked)}
                  disabled={disabled}
                  className="w-5 h-5 accent-brand-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-ink-900">تضمين العبارات الطويلة</p>
                  <p className="text-xs text-ink-500">Long-tail keywords</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-ink-50 rounded-lg cursor-pointer hover:bg-brand-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeRelated}
                  onChange={(e) => setIncludeRelated(e.target.checked)}
                  disabled={disabled}
                  className="w-5 h-5 accent-brand-500"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-ink-900">تضمين الكلمات المرتبطة</p>
                  <p className="text-xs text-ink-500">كلمات ذات صلة بالموضوع</p>
                </div>
              </label>
            </div>
          </div>
        )}
        
        {/* خطأ */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}
        
        {/* زر البحث */}
        <button
          type="submit"
          disabled={disabled || keyword.trim().length < 2}
          className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all"
        >
          {disabled ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              جاري التوليد...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              توليد الكلمات المفتاحية
            </>
          )}
        </button>
      </div>
    </form>
  );
}
