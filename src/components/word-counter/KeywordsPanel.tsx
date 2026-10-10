'use client';

import { useState, useMemo } from 'react';
import { Key, Filter, Hash } from 'lucide-react';
import type { KeywordDensity } from '@/lib/word-counter/types';

interface KeywordsPanelProps {
  keywords: KeywordDensity[];
  limit?: number;
}

export default function KeywordsPanel({ keywords, limit = 30 }: KeywordsPanelProps) {
  const [showStopWords, setShowStopWords] = useState(false);
  const [sortBy, setSortBy] = useState<'count' | 'density'>('count');
  
  // تصفية وترتيب الكلمات
  const filteredKeywords = useMemo(() => {
    let result = keywords;
    
    // تصفية الكلمات الشائعة
    if (!showStopWords) {
      result = result.filter(k => !k.isStopWord);
    }
    
    // ترتيب
    result = [...result].sort((a, b) => {
      if (sortBy === 'count') return b.count - a.count;
      return b.density - a.density;
    });
    
    return result.slice(0, limit);
  }, [keywords, showStopWords, sortBy, limit]);
  
  if (keywords.length === 0) {
    return (
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-6 text-center">
        <Key className="w-12 h-12 text-ink-300 mx-auto mb-3" />
        <p className="text-sm font-bold text-ink-500">
          لا توجد كلمات لتحليلها
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
      
      {/* الرأس */}
      <div className="p-4 border-b border-ink-200 bg-gradient-to-l from-ink-50 to-brand-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-500" />
              كثافة الكلمات المفتاحية
            </h3>
            <p className="text-xs text-ink-500 font-bold mt-0.5">
              الكلمات الأكثر تكراراً في النص
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* تصفية */}
            <button
              onClick={() => setShowStopWords(!showStopWords)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                showStopWords
                  ? 'bg-brand-500 text-white'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              {showStopWords ? 'إخفاء الشائعة' : 'إظهار الشائعة'}
            </button>
            
            {/* ترتيب */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'count' | 'density')}
              className="px-3 py-1.5 rounded-lg bg-ink-100 text-ink-700 text-xs font-bold border-0 focus:outline-none cursor-pointer"
            >
              <option value="count">الأكثر تكراراً</option>
              <option value="density">الأعلى كثافة</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* القائمة */}
      <div className="divide-y divide-ink-100 max-h-96 overflow-y-auto">
        {filteredKeywords.map((keyword, i) => (
          <div
            key={`${keyword.word}-${i}`}
            className="flex items-center gap-3 p-3 hover:bg-brand-50 transition-colors"
          >
            {/* الترتيب */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs ${
              i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md' :
              i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md' :
              i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
              'bg-ink-100 text-ink-600'
            }`}>
              {i + 1}
            </div>
            
            {/* الكلمة */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-ink-900 text-sm truncate">
                  {keyword.word}
                </span>
                {keyword.isStopWord && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-ink-100 text-ink-500">
                    شائعة
                  </span>
                )}
              </div>
              
              {/* الشريط */}
              <div className="w-full bg-ink-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    keyword.isStopWord
                      ? 'bg-ink-300'
                      : 'bg-gradient-to-r from-brand-500 to-brand-600'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (keyword.count / (keywords[0]?.count || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            {/* الإحصائيات */}
            <div className="text-left flex-shrink-0">
              <p className="font-black text-ink-900 text-sm">
                {keyword.count}
              </p>
              <p className="text-[10px] text-ink-500 font-bold">
                {keyword.percentage.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
        
        {filteredKeywords.length === 0 && (
          <div className="p-6 text-center text-ink-500 text-sm font-bold">
            لا توجد كلمات مطابقة
          </div>
        )}
      </div>
      
      {/* تذييل */}
      <div className="p-3 border-t border-ink-200 bg-ink-50 text-center">
        <p className="text-xs text-ink-500 font-bold">
          <Hash className="w-3 h-3 inline-block mr-1" />
          إجمالي {keywords.length} كلمة فريدة
        </p>
      </div>
    </div>
  );
}
