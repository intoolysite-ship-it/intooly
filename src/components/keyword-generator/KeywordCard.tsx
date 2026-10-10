'use client';

import { 
  Copy, Check, Info, Target, Lightbulb, 
  TrendingUp, Database, Flame 
} from 'lucide-react';
import { useState } from 'react';
import CompetitivenessGauge from './CompetitivenessGauge';
import { 
  INTENT_TYPES, 
  OPPORTUNITY_TYPES, 
  DATA_SOURCES,
  COUNTRIES,
  KEYWORD_MESSAGES,
} from '@/lib/keyword-generator/constants';
import type { Keyword } from '@/lib/keyword-generator/types';

interface KeywordCardProps {
  keyword: Keyword;
  onCopy?: (text: string) => void;
}

export default function KeywordCard({ keyword, onCopy }: KeywordCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const country = COUNTRIES.find(c => c.code === keyword.country);
  const intent = INTENT_TYPES.find(i => i.id === keyword.intent);
  const opportunity = OPPORTUNITY_TYPES.find(o => o.id === keyword.opportunityType);
  const dataSource = DATA_SOURCES.find(d => d.id === keyword.dataSource);
  
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(keyword.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(keyword.text);
    }
  };
  

  // كثافة الطلب
  const getTrendInfo = (score: number | undefined) => {
    if (!score || score === 0) return { icon: '❓', label: 'غير محدد', color: '#9ca3af' };
    if (score >= 90) return { icon: '🔥', label: 'طلب مرتفع جداً', color: '#dc2626' };
    if (score >= 70) return { icon: '📈', label: 'طلب مرتفع', color: '#ea580c' };
    if (score >= 50) return { icon: '📊', label: 'طلب متوسط', color: '#eab308' };
    if (score >= 30) return { icon: '📉', label: 'طلب منخفض', color: '#65a30d' };
    return { icon: '❓', label: 'غير محدد', color: '#9ca3af' };
  };
  
  const trendInfo = getTrendInfo(keyword.trendScore);
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-lg transition-all">
      
      {/* الرأس */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-ink-900 text-base md:text-lg break-words">
            {keyword.text}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {country && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-600 font-bold">
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </span>
            )}
            <span className="text-xs text-ink-400">•</span>
            <span className="text-xs text-ink-600 font-bold">
              {keyword.wordCount} كلمة
            </span>
          </div>
        </div>
        
        {/* زر النسخ */}
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-ink-100 hover:bg-brand-100 flex items-center justify-center transition-colors"
          title="نسخ"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-ink-600" />
          )}
        </button>
      </div>
      
      {/* المؤشر + التحليل */}
      <div className="flex items-center gap-4 mb-3">
        <CompetitivenessGauge
          score={keyword.competitionScore}
          level={keyword.competitionLevel}
          size="md"
          showDetails={true}
          breakdown={keyword.competitionReason?.breakdown}
        />
        
        <div className="flex-1 space-y-2">
          {/* النية */}
          {intent && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base">{intent.icon}</span>
              <span className="font-bold text-ink-700">{intent.label}</span>
              <span className="text-ink-400">({keyword.intentConfidence}%)</span>
            </div>
          )}
          
          {/* الفرصة */}
          {opportunity && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base">{opportunity.icon}</span>
              <span className="font-bold text-ink-700">{opportunity.label}</span>
            </div>
          )}
          
          {/* مصدر البيانات */}
          {dataSource && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base">{dataSource.icon}</span>
              <span className="text-ink-600">{dataSource.label}</span>
            </div>
          )}
        </div>
      </div>
      

      {/* كثافة الطلب */}
      {keyword.trendScore !== undefined && keyword.trendScore > 0 && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-ink-50 border border-ink-200">
          <span className="text-xl">{trendInfo.icon}</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-ink-700">
              كثافة الطلب: <span style={{ color: trendInfo.color }}>{trendInfo.label}</span>
            </p>
            <div className="w-full bg-ink-200 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${keyword.trendScore}%`,
                  backgroundColor: trendInfo.color 
                }}
              />
            </div>
          </div>
          <span className="text-xs font-bold" style={{ color: trendInfo.color }}>
            {keyword.trendScore}%
          </span>
        </div>
      )}
      
      {/* تفاصيل قابلة للفتح */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 py-1"
      >
        <Info className="w-3 h-3" />
        {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
      </button>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-ink-100 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-ink-600">عدد الأحرف:</span>
            <span className="font-bold">{keyword.characterCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">نوع الطول:</span>
            <span className="font-bold">
              {keyword.lengthType === 'short' ? 'قصيرة' :
               keyword.lengthType === 'medium' ? 'متوسطة' :
               keyword.lengthType === 'long' ? 'طويلة' : 'طويلة جداً'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">صلة الكلمة:</span>
            <span className="font-bold">{keyword.relevanceScore}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-600">بيانات فعلية:</span>
            <span className={`font-bold ${keyword.hasActualData ? 'text-green-600' : 'text-orange-500'}`}>
              {keyword.hasActualData ? '✅ نعم' : '⚠️ لا'}
            </span>
          </div>
          
          <div className="mt-2 pt-2 border-t border-ink-100">
            <p className="text-[10px] text-ink-500 leading-relaxed">
              {KEYWORD_MESSAGES.DISCLAIMER_COMPETITION}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
