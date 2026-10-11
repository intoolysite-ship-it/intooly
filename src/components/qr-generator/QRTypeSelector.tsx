'use client';

import { QR_TYPES, type QRType } from '@/lib/qr-generator/constants';

interface QRTypeSelectorProps {
  value: QRType;
  onChange: (type: QRType) => void;
  disabled?: boolean;
}

export default function QRTypeSelector({
  value,
  onChange,
  disabled = false,
}: QRTypeSelectorProps) {
  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl p-4 md:p-6">
      {/* العنوان */}
      <div className="mb-4">
        <h3 className="font-extrabold text-ink-900 text-base md:text-lg flex items-center gap-2">
          🎯 اختر نوع QR
        </h3>
        <p className="text-xs md:text-sm text-ink-500 font-bold mt-1">
          اختر الاستخدام المناسب
        </p>
      </div>

      {/* الشبكة */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {QR_TYPES.map((type) => {
          const isActive = value === type.id;

          return (
            <button
              key={type.id}
              onClick={() => !disabled && onChange(type.id)}
              disabled={disabled}
              className={`
                relative p-3 md:p-4 rounded-xl border-2 text-right transition-all
                ${
                  isActive
                    ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 shadow-md scale-[1.02]'
                    : 'border-ink-200 bg-white hover:border-brand-300 hover:shadow-sm'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* شارة نشطة */}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md">
                  ✓
                </span>
              )}

              {/* الأيقونة */}
              <div className="text-2xl md:text-3xl mb-2">{type.icon}</div>

              {/* الاسم */}
              <p
                className={`font-extrabold text-xs md:text-sm mb-0.5 ${
                  isActive ? 'text-brand-700' : 'text-ink-900'
                }`}
              >
                {type.name}
              </p>

              {/* الوصف */}
              <p className="text-[10px] md:text-xs text-ink-500 font-bold leading-tight">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* معلومات النوع النشط */}
      {value && (
        <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-200">
          <div className="flex items-start gap-2 text-xs md:text-sm">
            <span className="text-lg md:text-xl flex-shrink-0">
              {QR_TYPES.find((t) => t.id === value)?.icon}
            </span>
            <div className="flex-1">
              <p className="font-black text-brand-700 mb-1">
                {QR_TYPES.find((t) => t.id === value)?.name}
              </p>
              <p className="text-ink-600 font-bold leading-relaxed">
                {QR_TYPES.find((t) => t.id === value)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
