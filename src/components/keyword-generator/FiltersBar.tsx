'use client';

import { X, Filter } from 'lucide-react';
import { 
  INTENT_TYPES, 
  COMPETITION_TIERS, 
  OPPORTUNITY_TYPES,
  type CompetitionLevel,
  type SearchIntent,
  type OpportunityType,
} from '@/lib/keyword-generator/constants';
import type { KeywordFilters } from '@/lib/keyword-generator/types';

interface FiltersBarProps {
  filters: KeywordFilters;
  onChange: (filters: KeywordFilters) => void;
  totalResults: number;
  filteredResults: number;
}

export default function FiltersBar({
  filters,
  onChange,
  totalResults,
  filteredResults,
}: FiltersBarProps) {
  const hasActiveFilters = 
    (filters.intent && filters.intent.length > 0) ||
    (filters.competitionLevel && filters.competitionLevel.length > 0) ||
    (filters.opportunityType && filters.opportunityType.length > 0) ||
    (filters.searchQuery && filters.searchQuery.length > 0);
  
  const toggleIntent = (intent: SearchIntent) => {
    const current = filters.intent || [];
    const updated = current.includes(intent)
      ? current.filter(i => i !== intent)
      : [...current, intent];
    onChange({ ...filters, intent: updated.length > 0 ? updated : undefined });
  };
  
  const toggleCompetition = (level: CompetitionLevel) => {
    const current = filters.competitionLevel || [];
    const updated = current.includes(level)
      ? current.filter(c => c !== level)
      : [...current, level];
    onChange({ ...filters, competitionLevel: updated.length > 0 ? updated : undefined });
  };
  
  const toggleOpportunity = (type: OpportunityType) => {
    const current = filters.opportunityType || [];
    const updated = current.includes(type)
      ? current.filter(o => o !== type)
      : [...current, type];
    onChange({ ...filters, opportunityType: updated.length > 0 ? updated : undefined });
  };
  
  const clearAll = () => {
    onChange({ searchQuery: '' });
  };
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 space-y-4">
      
      {/* الرأس */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-brand-500" />
          <h3 className="font-extrabold text-ink-900">الفلاتر</h3>
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
            {filteredResults} / {totalResults}
          </span>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            مسح الفلاتر
          </button>
        )}
      </div>
      
      {/* شريط البحث */}
      <div>
        <input
          type="text"
          value={filters.searchQuery || ''}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="ابحث في الكلمات..."
          className="w-full px-4 py-2 bg-ink-50 border-2 border-ink-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
        />
      </div>
      
      {/* النية */}
      <div>
        <label className="block text-xs font-bold text-ink-600 mb-2">نية البحث</label>
        <div className="flex flex-wrap gap-2">
          {INTENT_TYPES.filter(i => i.id !== 'unknown').map((intent) => {
            const isActive = filters.intent?.includes(intent.id);
            return (
              <button
                key={intent.id}
                onClick={() => toggleIntent(intent.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                <span>{intent.icon}</span>
                <span>{intent.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* المنافسة */}
      <div>
        <label className="block text-xs font-bold text-ink-600 mb-2">مستوى المنافسة</label>
        <div className="flex flex-wrap gap-2">
          {COMPETITION_TIERS.map((tier) => {
            const isActive = filters.competitionLevel?.includes(tier.id);
            return (
              <button
                key={tier.id}
                onClick={() => toggleCompetition(tier.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border-2 ${
                  isActive
                    ? 'shadow-md'
                    : 'bg-white hover:bg-ink-50'
                }`}
                style={{
                  backgroundColor: isActive ? tier.hex : undefined,
                  borderColor: tier.hex,
                  color: isActive ? 'white' : tier.hex,
                }}
              >
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* الفرصة */}
      <div>
        <label className="block text-xs font-bold text-ink-600 mb-2">تصنيف الفرصة</label>
        <div className="flex flex-wrap gap-2">
          {OPPORTUNITY_TYPES.map((opp) => {
            const isActive = filters.opportunityType?.includes(opp.id);
            return (
              <button
                key={opp.id}
                onClick={() => toggleOpportunity(opp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                <span>{opp.icon}</span>
                <span>{opp.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
