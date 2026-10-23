'use client';

/**
 * شريط التبويبات — يعرض التبويبات الستة.
 * يدعم التمرير الأفقي على الشاشات الصغيرة.
 */

import type { TabId, TabDefinition } from '@/lib/seo-meta-tags/types';
import { TABS } from '@/lib/seo-meta-tags/constants';

interface TabsNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export default function TabsNav({ activeTab, onChange }: TabsNavProps) {
  return (
    <div className="border-b-2 border-ink-200 bg-white">
      <div className="flex overflow-x-auto gap-1 px-2 py-2 scrollbar-thin">
        {TABS.map((tab: TabDefinition) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-ink-700 hover:bg-ink-100'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
