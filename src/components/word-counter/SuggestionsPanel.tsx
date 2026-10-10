'use client';

import { Lightbulb, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { WritingSuggestion } from '@/lib/word-counter/types';

interface SuggestionsPanelProps {
  suggestions: WritingSuggestion[];
}

export default function SuggestionsPanel({ suggestions }: SuggestionsPanelProps) {
  
  // تكوين حسب الشدة
  const getSeverityConfig = (severity: WritingSuggestion['severity']) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          label: 'خطأ',
          emoji: '🔴',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'orange',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          label: 'تحذير',
          emoji: '🟠',
        };
      default:
        return {
          icon: Info,
          color: 'blue',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          label: 'ملاحظة',
          emoji: '🔵',
        };
    }
  };
  
  // تكوين حسب النوع
  const getTypeLabel = (type: WritingSuggestion['type']) => {
    const types = {
      'long-sentence': 'جملة طويلة',
      'long-paragraph': 'فقرة طويلة',
      'repetition': 'تكرار',
      'mistake': 'خطأ',
      'style': 'أسلوب',
      'structure': 'بنية',
    };
    return types[type] || type;
  };
  
  if (suggestions.length === 0) {
    return (
      <div className="bg-white border-2 border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-sm font-black text-green-700">
          🎉 نصك ممتاز!
        </p>
        <p className="text-xs text-ink-500 font-bold mt-1">
          لا توجد اقتراحات للتحسين
        </p>
      </div>
    );
  }
  
  // ترتيب حسب الشدة (أخطاء أولاً)
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
  
  // عدد كل نوع
  const errorCount = suggestions.filter(s => s.severity === 'error').length;
  const warningCount = suggestions.filter(s => s.severity === 'warning').length;
  const infoCount = suggestions.filter(s => s.severity === 'info').length;
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
      
      {/* الرأس */}
      <div className="p-4 bg-gradient-to-l from-yellow-50 to-orange-50 border-b border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="font-extrabold text-yellow-900 text-sm">
            اقتراحات التحسين ({suggestions.length})
          </h3>
        </div>
        
        {/* عدادات */}
        <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-700">
              🔴 {errorCount} خطأ
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-orange-700">
              🟠 {warningCount} تحذير
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-blue-700">
              🔵 {infoCount} ملاحظة
            </span>
          )}
        </div>
      </div>
      
      {/* القائمة */}
      <div className="divide-y divide-ink-100 max-h-96 overflow-y-auto">
        {sortedSuggestions.map((suggestion, i) => {
          const config = getSeverityConfig(suggestion.severity);
          const Icon = config.icon;
          
          return (
            <div key={i} className={`p-4 hover:${config.bg} transition-colors`}>
              
              {/* الرأس */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${config.bg} border-2 ${config.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.text}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* النوع + الشدة */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                      {config.emoji} {getTypeLabel(suggestion.type)}
                    </span>
                  </div>
                  
                  {/* الرسالة */}
                  <p className="text-sm font-bold text-ink-900 mb-1">
                    {suggestion.message}
                  </p>
                  
                  {/* الاقتراح */}
                  {suggestion.suggestion && (
                    <p className={`text-xs font-bold ${config.text} flex items-start gap-1`}>
                      <span>💡</span>
                      <span>{suggestion.suggestion}</span>
                    </p>
                  )}
                  
                  {/* النص المتعلق */}
                  {suggestion.relatedText && (
                    <div className="mt-2 p-2 rounded-md bg-ink-50 text-xs text-ink-600 font-medium" dir="auto">
                      {suggestion.relatedText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* تذييل */}
      <div className="p-3 bg-yellow-50 border-t border-yellow-200 text-center">
        <p className="text-[10px] text-yellow-800 font-bold">
          💡 اقتراحات آلية لتحسين جودة النص — استخدمها كدليل فقط
        </p>
      </div>
    </div>
  );
}
