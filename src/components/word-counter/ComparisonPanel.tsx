'use client';

import { useState } from 'react';
import { 
  GitCompare, Plus, Minus, Equal, 
  TrendingUp, TrendingDown, Copy, Check,
  FileText
} from 'lucide-react';
import type { TextComparison } from '@/lib/word-counter/types';

interface ComparisonPanelProps {
  comparison: TextComparison | null;
  originalText: string;
  newText: string;
  onCompare: (newText: string) => void;
  onClear: () => void;
}

export default function ComparisonPanel({
  comparison,
  originalText,
  newText,
  onCompare,
  onClear,
}: ComparisonPanelProps) {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const handleCompare = () => {
    if (inputText.trim()) {
      onCompare(inputText);
    }
  };
  
  const handleCopyAdded = async () => {
    if (!comparison) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(comparison.added.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.error('Copy error:', e);
    }
  };
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
      
      {/* الرأس */}
      <div className="p-4 bg-gradient-to-l from-purple-50 to-pink-50 border-b border-purple-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-purple-900 text-sm">
              مقارنة النصوص
            </h3>
          </div>
          
          {comparison && (
            <button
              onClick={onClear}
              className="text-xs font-bold text-red-500 hover:text-red-700"
            >
              مسح المقارنة
            </button>
          )}
        </div>
        <p className="text-xs text-purple-700 font-bold mt-1">
          قارن نسختين لمعرفة الفروق
        </p>
      </div>
      
      {/* إذا لا مقارنة */}
      {!comparison && (
        <div className="p-4 space-y-3">
          
          {!originalText.trim() && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <p className="font-bold text-amber-800">
                ⚠️ اكتب نصاً في المحرر أولاً، ثم الصق النسخة الجديدة هنا للمقارنة.
              </p>
            </div>
          )}
          
          {originalText.trim() && (
            <>
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-2">
                  📋 الصق النسخة الجديدة:
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="الصق النسخة الجديدة هنا..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border-2 border-ink-200 text-sm font-medium focus:outline-none focus:border-purple-400 resize-none"
                  dir="auto"
                />
              </div>
              
              <button
                onClick={handleCompare}
                disabled={!inputText.trim()}
                className="w-full py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:bg-ink-300 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                قارن الآن
              </button>
            </>
          )}
        </div>
      )}
      
      {/* المقارنة */}
      {comparison && (
        <div className="p-4 space-y-4">
          
          {/* ملخص الفروق */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
              <Plus className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-black text-green-700">
                {comparison.addedCount}
              </p>
              <p className="text-[10px] font-bold text-green-600">
                كلمات مضافة
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
              <Minus className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-xl font-black text-red-700">
                {comparison.removedCount}
              </p>
              <p className="text-[10px] font-bold text-red-600">
                كلمات محذوفة
              </p>
            </div>
            
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <Equal className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <p className="text-xl font-black text-gray-700">
                {comparison.unchanged.length}
              </p>
              <p className="text-[10px] font-bold text-gray-600">
                كلمات متطابقة
              </p>
            </div>
          </div>
          
          {/* الفرق في الأرقام */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600 mb-0.5">الكلمات</p>
              <p className={`text-sm font-black flex items-center justify-center gap-1 ${
                comparison.wordCountDiff > 0 ? 'text-green-700' :
                comparison.wordCountDiff < 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                {comparison.wordCountDiff > 0 ? <TrendingUp className="w-3 h-3" /> :
                 comparison.wordCountDiff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                {comparison.wordCountDiff > 0 ? '+' : ''}{comparison.wordCountDiff}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600 mb-0.5">الأحرف</p>
              <p className={`text-sm font-black flex items-center justify-center gap-1 ${
                comparison.charCountDiff > 0 ? 'text-green-700' :
                comparison.charCountDiff < 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                {comparison.charCountDiff > 0 ? <TrendingUp className="w-3 h-3" /> :
                 comparison.charCountDiff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                {comparison.charCountDiff > 0 ? '+' : ''}{comparison.charCountDiff}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-ink-50 text-center">
              <p className="text-[10px] font-bold text-ink-600 mb-0.5">الفقرات</p>
              <p className={`text-sm font-black ${
                comparison.paragraphCountDiff > 0 ? 'text-green-700' :
                comparison.paragraphCountDiff < 0 ? 'text-red-700' : 'text-gray-700'
              }`}>
                {comparison.paragraphCountDiff > 0 ? '+' : ''}{comparison.paragraphCountDiff}
              </p>
            </div>
          </div>
          
          {/* الكلمات المضافة */}
          {comparison.added.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-green-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  كلمات مضافة:
                </p>
                <button
                  onClick={handleCopyAdded}
                  className="text-[10px] font-bold text-ink-500 hover:text-ink-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'تم!' : 'نسخ'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-green-50 border border-green-100">
                {comparison.added.slice(0, 50).map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-green-200 text-green-800 text-xs font-bold"
                  >
                    + {word}
                  </span>
                ))}
                {comparison.added.length > 50 && (
                  <span className="text-[10px] font-bold text-green-700 self-center">
                    و {comparison.added.length - 50} أخرى...
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* الكلمات المحذوفة */}
          {comparison.removed.length > 0 && (
            <div>
              <p className="text-xs font-black text-red-700 mb-2 flex items-center gap-1">
                <Minus className="w-3 h-3" />
                كلمات محذوفة:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-red-50 border border-red-100">
                {comparison.removed.slice(0, 50).map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-red-200 text-red-800 text-xs font-bold line-through"
                  >
                    - {word}
                  </span>
                ))}
                {comparison.removed.length > 50 && (
                  <span className="text-[10px] font-bold text-red-700 self-center">
                    و {comparison.removed.length - 50} أخرى...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
