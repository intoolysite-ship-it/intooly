'use client';

import { useState, useMemo } from 'react';
import { 
  Grid3x3, Target, FolderTree, FileText, 
  Sparkles, Download, RefreshCw 
} from 'lucide-react';
import KeywordCard from './KeywordCard';
import { 
  OPPORTUNITY_TYPES, 
  COMPETITION_TIERS,
  INTENT_TYPES,
} from '@/lib/keyword-generator/constants';
import type { 
  Keyword, 
  KeywordCluster, 
  ContentPlan,
  KeywordFilters,
} from '@/lib/keyword-generator/types';

interface ResultsGridProps {
  keywords: Keyword[];
  clusters: KeywordCluster[];
  contentPlan: ContentPlan | null;
  filters: KeywordFilters;
  onExport: (format: 'csv' | 'json' | 'markdown') => void;
  onNewSearch: () => void;
}

type TabType = 'all' | 'opportunities' | 'clusters' | 'content';

export default function ResultsGrid({
  keywords,
  clusters,
  contentPlan,
  filters,
  onExport,
  onNewSearch,
}: ResultsGridProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // تصفية الكلمات
  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      // البحث النصي
      if (filters.searchQuery && !kw.text.includes(filters.searchQuery)) {
        return false;
      }
      // النية
      if (filters.intent && filters.intent.length > 0 && !filters.intent.includes(kw.intent)) {
        return false;
      }
      // المنافسة
      if (filters.competitionLevel && filters.competitionLevel.length > 0 && !filters.competitionLevel.includes(kw.competitionLevel)) {
        return false;
      }
      // الفرصة
      if (filters.opportunityType && filters.opportunityType.length > 0 && !filters.opportunityType.includes(kw.opportunityType)) {
        return false;
      }
      return true;
    });
  }, [keywords, filters]);
  
  // أفضل الفرص (أعلى صلة + أقل منافسة)
  const topOpportunities = useMemo(() => {
    return [...filteredKeywords]
      .filter(k => k.competitionScore >= 0)
      .sort((a, b) => {
        const scoreA = a.relevanceScore - a.competitionScore;
        const scoreB = b.relevanceScore - b.competitionScore;
        return scoreB - scoreA;
      })
      .slice(0, 12);
  }, [filteredKeywords]);
  
  return (
    <div className="space-y-4">
      
      {/* شريط الأدوات */}
      <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-extrabold text-lg text-ink-900">
              النتائج
            </h2>
            <p className="text-xs text-ink-500 font-bold">
              {filteredKeywords.length} كلمة • {clusters.length} مجموعة
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* تصدير */}
            <div className="flex items-center gap-1 bg-ink-100 rounded-lg p-1">
              <button
                onClick={() => onExport('csv')}
                className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white transition-colors"
                title="تصدير CSV"
              >
                CSV
              </button>
              <button
                onClick={() => onExport('json')}
                className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white transition-colors"
                title="تصدير JSON"
              >
                JSON
              </button>
              <button
                onClick={() => onExport('markdown')}
                className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white transition-colors"
                title="تصدير Markdown"
              >
                MD
              </button>
            </div>
            
            {/* بحث جديد */}
            <button
              onClick={onNewSearch}
              className="px-4 py-2 bg-ink-900 hover:bg-ink-800 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              بحث جديد
            </button>
          </div>
        </div>
      </div>
      
      {/* التبويبات */}
      <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-ink-200 overflow-x-auto">
          {[
            { id: 'all' as TabType, icon: Grid3x3, label: 'جميع الكلمات', count: filteredKeywords.length },
            { id: 'opportunities' as TabType, icon: Target, label: 'أفضل الفرص', count: topOpportunities.length },
            { id: 'clusters' as TabType, icon: FolderTree, label: 'المجموعات', count: clusters.length },
            { id: 'content' as TabType, icon: FileText, label: 'خطة المحتوى', count: contentPlan ? 1 : 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-500'
                  : 'text-ink-600 hover:bg-ink-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-xs bg-ink-200 text-ink-700 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        <div className="p-4">
          
          {/* تبويب "جميع الكلمات" */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKeywords.map((kw) => (
                <KeywordCard key={kw.id} keyword={kw} />
              ))}
              {filteredKeywords.length === 0 && (
                <div className="col-span-full text-center py-12 text-ink-500">
                  <p className="font-bold mb-2">لا توجد كلمات مطابقة للفلاتر</p>
                  <p className="text-xs">جرب تغيير الفلاتر أو مسحها</p>
                </div>
              )}
            </div>
          )}
          
          {/* تبويب "أفضل الفرص" */}
          {activeTab === 'opportunities' && (
            <div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  أفضل الفرص: كلمات ذات صلة عالية ومنافسة منخفضة — مثالية للبدء
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topOpportunities.map((kw) => (
                  <KeywordCard key={kw.id} keyword={kw} />
                ))}
              </div>
            </div>
          )}
          
          {/* تبويب "المجموعات" */}
          {activeTab === 'clusters' && (
            <div className="space-y-4">
              {clusters.map((cluster) => {
                const competitionLevel = 
                  cluster.avgCompetition < 0 ? 'unknown' :
                  cluster.avgCompetition <= 25 ? 'very-easy' :
                  cluster.avgCompetition <= 50 ? 'easy' :
                  cluster.avgCompetition <= 75 ? 'medium' : 'hard';
                const compTier = COMPETITION_TIERS.find(t => t.id === competitionLevel);
                const intent = INTENT_TYPES.find(i => i.id === cluster.dominantIntent);
                
                return (
                  <div key={cluster.id} className="border-2 border-ink-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-extrabold text-ink-900 text-base">{cluster.title}</h3>
                        <p className="text-xs text-ink-600 mt-1">{cluster.description}</p>
                      </div>
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-bold whitespace-nowrap">
                        {cluster.totalKeywords} كلمة
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {compTier && (
                        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ backgroundColor: `${compTier.hex}20`, color: compTier.hex }}>
                          {compTier.icon} متوسط المنافسة: {cluster.avgCompetition}%
                        </span>
                      )}
                      {intent && (
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-ink-100 text-ink-700">
                          {intent.icon} النية السائدة: {intent.label}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-amber-100 text-amber-700">
                        📄 {cluster.suggestedPageType === 'single-page' ? 'صفحة واحدة' :
                            cluster.suggestedPageType === 'multiple-pages' ? 'صفحات متعددة' :
                            'مركز محتوى'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-ink-500 mb-3 italic">
                      💡 {cluster.suggestedPageTypeReason}
                    </p>
                    
                    <details className="text-sm">
                      <summary className="cursor-pointer font-bold text-brand-600 text-xs">
                        عرض {cluster.totalKeywords} كلمة
                      </summary>
                      <ul className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                        {cluster.keywords.map((kw, i) => (
                          <li key={i} className="text-xs text-ink-600 py-1 px-2 hover:bg-ink-50 rounded">
                            • {kw.text}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                );
              })}
              
              {clusters.length === 0 && (
                <div className="text-center py-12 text-ink-500">
                  <p className="font-bold">لا توجد مجموعات</p>
                </div>
              )}
            </div>
          )}
          
          {/* تبويب "خطة المحتوى" */}
          {activeTab === 'content' && contentPlan && (
            <div className="space-y-4">
              {/* العنوان */}
              <div className="bg-brand-50 border-2 border-brand-200 rounded-xl p-4">
                <p className="text-xs font-bold text-brand-600 mb-1">عنوان SEO</p>
                <h3 className="font-extrabold text-ink-900 text-lg">{contentPlan.title}</h3>
              </div>
              
              {/* الوصف */}
              <div className="bg-white border-2 border-ink-200 rounded-xl p-4">
                <p className="text-xs font-bold text-ink-600 mb-1">الوصف (Meta Description)</p>
                <p className="text-sm text-ink-700">{contentPlan.metaDescription}</p>
              </div>
              
              {/* العناوين */}
              <div className="bg-white border-2 border-ink-200 rounded-xl p-4">
                <p className="text-xs font-bold text-ink-600 mb-2">الهيكل (H1, H2)</p>
                <div className="space-y-2">
                  <p className="font-black text-ink-900">H1: {contentPlan.h1}</p>
                  {contentPlan.h2.map((h2, i) => (
                    <p key={i} className="text-sm font-bold text-ink-700 pr-4">H2: {h2}</p>
                  ))}
                </div>
              </div>
              
              {/* FAQ */}
              <div className="bg-white border-2 border-ink-200 rounded-xl p-4">
                <p className="text-xs font-bold text-ink-600 mb-3">الأسئلة الشائعة (FAQ)</p>
                <div className="space-y-3">
                  {contentPlan.faq.map((faq, i) => (
                    <details key={i} className="border border-ink-100 rounded-lg overflow-hidden">
                      <summary className="cursor-pointer p-3 font-bold text-sm bg-ink-50 hover:bg-brand-50">
                        {faq.question}
                      </summary>
                      <p className="p-3 text-xs text-ink-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
              
              {/* الروابط الداخلية */}
              {contentPlan.internalLinks.length > 0 && (
                <div className="bg-white border-2 border-ink-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-ink-600 mb-2">الروابط الداخلية المقترحة</p>
                  <ul className="space-y-1">
                    {contentPlan.internalLinks.map((link, i) => (
                      <li key={i} className="text-xs text-ink-600">
                        • <a href={link.targetPage} className="text-brand-600 font-bold hover:underline">{link.anchorText}</a> — {link.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'content' && !contentPlan && (
            <div className="text-center py-12 text-ink-500">
              <p className="font-bold">لا توجد خطة محتوى</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
