'use client';

import { 
  FileText, Hash, AlignLeft, Layers, 
  Clock, BookOpen, PenTool, Edit3,
  TrendingUp, Percent
} from 'lucide-react';
import type { TextStats } from '@/lib/word-counter/types';
import { formatTime, formatNumber } from '@/lib/word-counter/textAnalyzer';

interface StatsPanelProps {
  stats: TextStats;
  uniqueWords: number;
}

export default function StatsPanel({ stats, uniqueWords }: StatsPanelProps) {
  
  // الإحصائيات الأساسية
  const primaryStats = [
    {
      icon: FileText,
      label: 'الكلمات',
      value: formatNumber(stats.words),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      icon: Hash,
      label: 'الأحرف',
      value: formatNumber(stats.characters),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      icon: AlignLeft,
      label: 'الجمل',
      value: formatNumber(stats.sentences),
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      icon: Layers,
      label: 'الفقرات',
      value: formatNumber(stats.paragraphs),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
  ];
  
  // الأوقات
  const timeStats = [
    {
      icon: BookOpen,
      label: 'وقت القراءة',
      value: formatTime(stats.readingTime),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: PenTool,
      label: 'وقت الكتابة',
      value: formatTime(stats.writingTime),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Edit3,
      label: 'وقت التحرير',
      value: formatTime(stats.editingTime),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];
  
  return (
    <div className="space-y-4">
      
      {/* الإحصائيات الأساسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {primaryStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border-2 border-ink-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-bold text-ink-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.textColor}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      
      {/* إحصائيات إضافية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* الكلمات الفريدة */}
        <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold text-ink-600">الكلمات الفريدة</p>
          </div>
          <p className="text-2xl font-black text-teal-700">
            {formatNumber(uniqueWords)}
          </p>
          {stats.words > 0 && (
            <p className="text-xs text-ink-500 font-bold mt-1">
              {Math.round((uniqueWords / stats.words) * 100)}% من إجمالي الكلمات
            </p>
          )}
        </div>
        
        {/* الأحرف بدون مسافات */}
        <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold text-ink-600">الأحرف بدون مسافات</p>
          </div>
          <p className="text-2xl font-black text-pink-700">
            {formatNumber(stats.charactersNoSpaces)}
          </p>
        </div>
        
        {/* الأسطر */}
        <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <AlignLeft className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-bold text-ink-600">الأسطر</p>
          </div>
          <p className="text-2xl font-black text-indigo-700">
            {formatNumber(stats.lines)}
          </p>
        </div>
      </div>
      
      {/* الأوقات */}
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
        <h3 className="font-extrabold text-ink-900 text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500" />
          الأوقات التقديرية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timeStats.map((time, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl ${time.bgColor} border-2 border-transparent hover:border-current transition-colors`}
            >
              <time.icon className={`w-5 h-5 ${time.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-600">{time.label}</p>
                <p className={`text-sm font-black ${time.color}`}>{time.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* المتوسطات */}
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
        <h3 className="font-extrabold text-ink-900 text-sm mb-3 flex items-center gap-2">
          <Percent className="w-4 h-4 text-brand-500" />
          المتوسطات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex justify-between items-center p-2 rounded-lg bg-ink-50">
            <span className="text-ink-600 font-bold">كلمات/جملة</span>
            <span className="font-black text-ink-900">{stats.avgWordsPerSentence}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-ink-50">
            <span className="text-ink-600 font-bold">كلمات/فقرة</span>
            <span className="font-black text-ink-900">{stats.avgWordsPerParagraph}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-ink-50">
            <span className="text-ink-600 font-bold">أحرف/كلمة</span>
            <span className="font-black text-ink-900">{stats.avgCharsPerWord}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
