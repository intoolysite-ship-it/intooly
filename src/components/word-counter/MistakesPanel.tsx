'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';
import type { DetectedMistake } from '@/lib/word-counter/types';

interface MistakesPanelProps {
  mistakes: DetectedMistake[];
  onReplace?: (wrong: string, correct: string) => void;
  onFixAll?: () => void;
}

export default function MistakesPanel({ 
  mistakes, 
  onReplace, 
  onFixAll 
}: MistakesPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const handleCopy = async (text: string, index: number) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (e) {
      console.error('Copy error:', e);
    }
  };
  
  if (mistakes.length === 0) {
    return (
      <div className="bg-white border-2 border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="text-sm font-black text-green-700">
          🎉 لا توجد أخطاء شائعة!
        </p>
        <p className="text-xs text-ink-500 font-bold mt-1">
          النص يبدو خالياً من الأخطاء الإملائية الشائعة
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-2 border-orange-200 rounded-2xl overflow-hidden">
      
      {/* الرأس */}
      <div className="p-4 bg-gradient-to-l from-orange-50 to-red-50 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="font-extrabold text-orange-900 text-sm">
            أخطاء شائعة ({mistakes.length})
          </h3>
        </div>
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <p className="text-xs text-orange-700 font-bold">
            يُنصح بمراجعة هذه الأخطاء قبل النشر
          </p>
          {onFixAll && (
            <button
              onClick={onFixAll}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
            >
              🔧 تصحيح الكل
            </button>
          )}
        </div>
      </div>
      
      {/* القائمة */}
      <div className="divide-y divide-ink-100 max-h-96 overflow-y-auto">
        {mistakes.map((mistake, i) => (
          <div key={i} className="p-4 hover:bg-orange-50/50 transition-colors">
            
            {/* الخطأ → الصحيح */}
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-sm font-bold border border-red-200 line-through">
                {mistake.wrong}
              </span>
              
              <span className="text-ink-400 font-bold">→</span>
              
              {onReplace ? (
                <button
                  onClick={() => onReplace(mistake.wrong, mistake.correct)}
                  className="px-2 py-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 text-sm font-bold border-2 border-green-300 hover:border-green-400 transition-all flex items-center gap-1 group"
                  title="اضغط للتصحيح المباشر"
                >
                  {mistake.correct}
                  <span className="text-[10px] opacity-60 group-hover:opacity-100">✓</span>
                </button>
              ) : (
                <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                  {mistake.correct}
                </span>
              )}
              
              <button
                onClick={() => handleCopy(mistake.correct, i)}
                className="mr-auto p-1.5 rounded-md bg-ink-100 hover:bg-ink-200 transition-colors"
                title="نسخ الصحيح"
              >
                {copiedIndex === i ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3 text-ink-600" />
                )}
              </button>
            </div>
            
            {/* السبب */}
            <p className="text-xs text-ink-600 font-bold mb-2">
              💡 {mistake.reason}
            </p>
            
            {/* السياق */}
            <div className="p-2 rounded-md bg-ink-50 text-xs text-ink-600 font-medium" dir="auto">
              ...{mistake.context}...
            </div>
          </div>
        ))}
      </div>
      
      {/* تذييل */}
      <div className="p-3 bg-orange-50 border-t border-orange-200 text-center">
        <p className="text-[10px] text-orange-700 font-bold">
          💡 القائمة تشمل أشهر الأخطاء الإملائية في العربية
        </p>
      </div>
    </div>
  );
}
