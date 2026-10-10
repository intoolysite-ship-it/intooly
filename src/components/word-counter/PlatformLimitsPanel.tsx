'use client';

import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PlatformLimitStatus } from '@/lib/word-counter/types';

interface PlatformLimitsPanelProps {
  limits: PlatformLimitStatus[];
  filterCategory?: 'seo' | 'social' | 'academic' | 'all';
}

export default function PlatformLimitsPanel({ 
  limits, 
  filterCategory = 'all' 
}: PlatformLimitsPanelProps) {
  
  // تصفية حسب الفئة
  const getFilteredLimits = () => {
    if (filterCategory === 'all') return limits;
    
    const categoryMap = {
      seo: ['seo-title', 'meta-description', 'meta-keywords', 'blog-post', 'product-description'],
      social: ['twitter', 'instagram-caption', 'facebook-post', 'linkedin-post', 'whatsapp-message'],
      academic: ['abstract', 'thesis-page'],
    };
    
    const allowedIds = categoryMap[filterCategory] || [];
    return limits.filter(l => allowedIds.includes(l.platform.id));
  };
  
  const filteredLimits = getFilteredLimits();
  
  if (filteredLimits.length === 0) {
    return null;
  }
  
  // تكوين الحالة
  const getStatusConfig = (status: PlatformLimitStatus['status']) => {
    switch (status) {
      case 'over':
        return {
          icon: AlertCircle,
          color: 'red',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          barColor: 'bg-red-500',
          label: 'تجاوز الحد',
        };
      case 'near':
        return {
          icon: AlertTriangle,
          color: 'orange',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          barColor: 'bg-orange-500',
          label: 'قريب من الحد',
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          barColor: 'bg-green-500',
          label: 'ضمن الحد',
        };
    }
  };
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden">
      
      {/* الرأس */}
      <div className="p-4 bg-gradient-to-l from-blue-50 to-indigo-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">📱</span>
          <h3 className="font-extrabold text-blue-900 text-sm">
            حدود المنصات
          </h3>
        </div>
        <p className="text-xs text-blue-700 font-bold mt-1">
          تحقق من طول النص لكل منصة
        </p>
      </div>
      
      {/* القائمة */}
      <div className="divide-y divide-ink-100">
        {filteredLimits.map((item, i) => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          
          return (
            <div key={i} className="p-3 hover:bg-ink-50 transition-colors">
              
              {/* الرأس */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{item.platform.icon}</span>
                <span className="font-extrabold text-ink-900 text-sm flex-1">
                  {item.platform.name}
                </span>
                <Icon className={`w-4 h-4 ${config.text}`} />
              </div>
              
              {/* الأرقام */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={`font-bold ${config.text}`}>
                  {item.current.toLocaleString('ar-SA')} / {item.platform.limit.toLocaleString('ar-SA')}
                </span>
                <span className={`font-black ${config.text}`}>
                  {item.percentage}%
                </span>
              </div>
              
              {/* الشريط */}
              <div className="w-full bg-ink-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${config.barColor}`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
              
              {/* ملاحظة */}
              {item.platform.notes && (
                <p className="text-[10px] text-ink-500 font-bold mt-1.5">
                  💡 {item.platform.notes}
                </p>
              )}
              
              {/* تحذير إذا تجاوز */}
              {item.status === 'over' && (
                <p className="text-[10px] text-red-700 font-black mt-1">
                  ⚠️ تجاوزت الحد بـ {(item.current - item.platform.limit).toLocaleString('ar-SA')} {item.platform.unit === 'char' ? 'حرف' : 'كلمة'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
