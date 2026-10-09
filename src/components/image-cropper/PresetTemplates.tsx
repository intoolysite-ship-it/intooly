'use client';

// ============================================================
// 🎨 مكوّن القوالب الجاهزة
// ============================================================

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PresetTemplate, TemplateCategory } from '@/lib/image-cropper/types';
import { PRESET_TEMPLATES } from '@/lib/image-cropper/constants';

// ============================================================
// 📝 الأنواع
// ============================================================

interface PresetTemplatesProps {
  onSelect: (template: PresetTemplate) => void;
  activeTemplateId?: string;
  onCustomSelect: () => void;
}

// ============================================================
// 🎨 المكوّن الرئيسي
// ============================================================

export default function PresetTemplates({
  onSelect,
  activeTemplateId,
  onCustomSelect,
}: PresetTemplatesProps) {
  const [expandedCategory, setExpandedCategory] = useState<TemplateCategory | null>('social');

  // تصنيف القوالب
  const categories: Array<{
    id: TemplateCategory;
    title: string;
    icon: string;
    color: string;
  }> = [
    { id: 'social', title: 'سوشيال ميديا', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { id: 'marketplace', title: 'ماركت بليس', icon: '🛒', color: 'from-emerald-500 to-emerald-600' },
    { id: 'print', title: 'طباعة', icon: '🖨️', color: 'from-purple-500 to-purple-600' },
    { id: 'custom', title: 'مخصص', icon: '⚙️', color: 'from-slate-500 to-slate-600' },
  ];

  const toggleCategory = (cat: TemplateCategory) => {
    setExpandedCategory(prev => (prev === cat ? null : cat));
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-black text-slate-700 mb-2">
        <span className="text-base">🎯</span>
        القوالب الجاهزة
      </label>

      {categories.map((category) => {
        const templates = PRESET_TEMPLATES.filter(t => t.category === category.id);
        const isExpanded = expandedCategory === category.id;
        const hasActive = templates.some(t => t.id === activeTemplateId);

        return (
          <div
            key={category.id}
            className={`border-2 rounded-xl overflow-hidden transition-all ${
              hasActive ? 'border-amber-400 shadow-md' : 'border-slate-200'
            }`}
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`w-full flex items-center justify-between gap-2 p-3 transition-colors ${
                hasActive
                  ? 'bg-gradient-to-l from-amber-50 to-white'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className="text-base">{category.icon}</span>
                </div>
                <span className="font-black text-sm text-slate-900">
                  {category.title}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {templates.length}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Templates */}
            {isExpanded && (
              <div className="p-2 bg-slate-50 border-t border-slate-200">
                {category.id === 'custom' ? (
                  // زر المخصص
                  <button
                    type="button"
                    onClick={onCustomSelect}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-center
                      ${
                        activeTemplateId === 'custom-size'
                          ? 'border-amber-500 bg-amber-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">⚙️</div>
                    <div className="text-xs font-black text-slate-900">
                      مقاس مخصص
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                      أدخل الأبعاد يدويًا
                    </div>
                  </button>
                ) : (
                  // القوالب العادية
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => {
                      const isActive = activeTemplateId === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => onSelect(template)}
                          title={template.description}
                          className={`
                            relative p-2.5 rounded-lg border-2 transition-all text-center
                            ${
                              isActive
                                ? 'border-amber-500 bg-amber-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 hover:-translate-y-0.5'
                            }
                          `}
                        >
                          <div className="text-xl mb-0.5">{template.icon}</div>
                          <div className="text-[11px] font-black text-slate-900 truncate">
                            {template.name}
                          </div>
                          <div className="text-[9px] text-slate-500 font-bold mt-0.5">
                            {template.width}×{template.height}
                          </div>
                          {isActive && (
                            <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              <span className="text-white text-[10px] font-black">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}