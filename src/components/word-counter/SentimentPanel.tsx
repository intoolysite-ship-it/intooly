'use client';

import { useState } from 'react';
import { Heart, Smile, Frown, Meh, ChevronDown } from 'lucide-react';
import type { SentimentAnalysis } from '@/lib/word-counter/types';

interface SentimentPanelProps {
  sentiment: SentimentAnalysis;
}

export default function SentimentPanel({ sentiment }: SentimentPanelProps) {
  const [showWords, setShowWords] = useState(false);
  
  // تكوين حسب النوع
  const config = {
    positive: {
      icon: Smile,
      label: 'إيجابي',
      color: '#22c55e',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      emoji: '😊',
    },
    neutral: {
      icon: Meh,
      label: 'محايد',
      color: '#6b7280',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      emoji: '😐',
    },
    negative: {
      icon: Frown,
      label: 'سلبي',
      color: '#ef4444',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      emoji: '😟',
    },
  };
  
  const current = config[sentiment.overall];
  const Icon = current.icon;
  
  // إجمالي الكلمات العاطفية
  const totalSentimentWords = sentiment.positive + sentiment.negative;
  const totalWords = sentiment.positive + sentiment.neutral + sentiment.negative;
  
  const positivePct = totalWords > 0 ? (sentiment.positive / totalWords) * 100 : 0;
  const neutralPct = totalWords > 0 ? (sentiment.neutral / totalWords) * 100 : 0;
  const negativePct = totalWords > 0 ? (sentiment.negative / totalWords) * 100 : 0;
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
      
      {/* الرأس */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          تحليل المشاعر
        </h3>
        
        {(sentiment.positiveWords.length > 0 || sentiment.negativeWords.length > 0) && (
          <button
            onClick={() => setShowWords(!showWords)}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            {showWords ? 'إخفاء' : 'الكلمات'}
            <ChevronDown className={`w-3 h-3 transition-transform ${showWords ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {/* النتيجة الرئيسية */}
      <div className={`flex items-center gap-4 p-4 rounded-xl ${current.bg} border-2 ${current.border} mb-4`}>
        <div className="text-4xl">{current.emoji}</div>
        <div className="flex-1">
          <p className={`text-2xl font-black ${current.text}`}>
            {current.label}
          </p>
          <p className="text-xs text-ink-600 font-bold">
            النتيجة: {sentiment.score > 0 ? '+' : ''}{sentiment.score}
          </p>
        </div>
        <Icon className="w-10 h-10" style={{ color: current.color }} />
      </div>
      
      {/* توزيع المشاعر */}
      <div className="space-y-2">
        {/* إيجابي */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 font-bold text-green-700">😊 إيجابي</span>
          <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${positivePct}%` }}
            />
          </div>
          <span className="font-black text-green-700 w-12 text-left">
            {sentiment.positive}
          </span>
        </div>
        
        {/* محايد */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 font-bold text-gray-700">😐 محايد</span>
          <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all"
              style={{ width: `${neutralPct}%` }}
            />
          </div>
          <span className="font-black text-gray-700 w-12 text-left">
            {sentiment.neutral}
          </span>
        </div>
        
        {/* سلبي */}
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 font-bold text-red-700">😟 سلبي</span>
          <div className="flex-1 bg-ink-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${negativePct}%` }}
            />
          </div>
          <span className="font-black text-red-700 w-12 text-left">
            {sentiment.negative}
          </span>
        </div>
      </div>
      
      {/* الكلمات العاطفية */}
      {showWords && (
        <div className="mt-4 pt-4 border-t border-ink-200 space-y-3">
          
          {sentiment.positiveWords.length > 0 && (
            <div>
              <p className="text-xs font-black text-green-700 mb-2">
                😊 كلمات إيجابية ({sentiment.positiveWords.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sentiment.positiveWords.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold border border-green-200"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {sentiment.negativeWords.length > 0 && (
            <div>
              <p className="text-xs font-black text-red-700 mb-2">
                😟 كلمات سلبية ({sentiment.negativeWords.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sentiment.negativeWords.map((word, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold border border-red-200"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {sentiment.positiveWords.length === 0 && sentiment.negativeWords.length === 0 && (
            <p className="text-xs text-ink-500 font-bold text-center">
              لا توجد كلمات عاطفية واضحة في النص
            </p>
          )}
        </div>
      )}
      
      {/* ملاحظة */}
      <div className="mt-3 p-2 rounded-lg bg-ink-50 text-center">
        <p className="text-[10px] text-ink-500 font-bold">
          💡 تحليل المشاعر تقديري بناءً على قائمة كلمات عاطفية
        </p>
      </div>
    </div>
  );
}
