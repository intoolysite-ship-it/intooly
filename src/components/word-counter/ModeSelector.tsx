'use client';

import { TOOL_MODES, type ToolMode } from '@/lib/word-counter/constants';

interface ModeSelectorProps {
  value: ToolMode;
  onChange: (mode: ToolMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ value, onChange, disabled = false }: ModeSelectorProps) {
  
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4">
      <div className="mb-3">
        <h3 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
          🎯 اختر الوضع
        </h3>
        <p className="text-xs text-ink-500 font-bold mt-1">
          يتغير التحليل حسب غرضك
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {TOOL_MODES.map((mode) => {
          const isActive = value === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => !disabled && onChange(mode.id)}
              disabled={disabled}
              className={`
                relative p-3 rounded-xl border-2 text-right transition-all
                ${isActive 
                  ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 shadow-md' 
                  : 'border-ink-200 bg-white hover:border-brand-300 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* الشارة "نشط" */}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md">
                  ✓
                </span>
              )}
              
              {/* الأيقونة */}
              <div className="text-2xl md:text-3xl mb-2">{mode.icon}</div>
              
              {/* الاسم */}
              <p className={`font-extrabold text-xs md:text-sm mb-0.5 ${
                isActive ? 'text-brand-700' : 'text-ink-900'
              }`}>
                {mode.name}
              </p>
              
              {/* الوصف */}
              <p className="text-[10px] text-ink-500 font-bold leading-tight">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {/* معلومات الوضع النشط */}
      {value !== 'general' && (
        <div className="mt-3 p-3 rounded-xl bg-brand-50 border border-brand-200">
          <div className="flex items-start gap-2 text-xs">
            <span className="text-lg flex-shrink-0">
              {TOOL_MODES.find(m => m.id === value)?.icon}
            </span>
            <div className="flex-1">
              <p className="font-black text-brand-700 mb-1">
                وضع {TOOL_MODES.find(m => m.id === value)?.name}
              </p>
              <p className="text-ink-600 font-bold leading-relaxed">
                {value === 'seo' && 'يُظهر: طول عنوان SEO، وصف Meta، كثافة الكلمة الرئيسية، وأهداف المحتوى.'}
                {value === 'academic' && 'يُظهر: طول الملخص، متوسط الجملة، وتحليل الأسلوب الأكاديمي.'}
                {value === 'social' && 'يُظهر: حدود تويتر، إنستغرام، فيسبوك، LinkedIn لكل منشور.'}
                {value === 'editor' && 'يُظهر: مقارنة النصوص، تتبع التغييرات، وإبراز الإضافات والحذف.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
