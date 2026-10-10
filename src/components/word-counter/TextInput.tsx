'use client';

import { useRef, useEffect } from 'react';
import { 
  X, Copy, Download, Save, Upload, 
  Trash2, Undo2, Redo2
} from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onSave?: () => void;
  onUpload?: () => void;
  onClear?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function TextInput({
  value,
  onChange,
  onCopy,
  onDownload,
  onSave,
  onUpload,
  onClear,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  placeholder = 'اكتب النص هنا أو الصقه لتحليل عدد الكلمات والأحرف والإحصاءات فوراً...',
  disabled = false,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // تحديث ارتفاع textarea تلقائياً
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
  }, [value]);

  const hasText = value.trim().length > 0;

  return (
    <div className="bg-white border-2 border-ink-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* شريط الأدوات العلوي */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-l from-ink-50 to-brand-50 border-b border-ink-200 flex-wrap">
        
        {/* أدوات اليسار (رفع/حفظ) */}
        <div className="flex items-center gap-1">
          {onUpload && (
            <button
              onClick={onUpload}
              disabled={disabled}
              className="px-3 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 text-sm font-bold text-ink-700 disabled:opacity-50"
              title="رفع ملف"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">رفع ملف</span>
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              disabled={disabled || !hasText}
              className="px-3 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 text-sm font-bold text-ink-700 disabled:opacity-50"
              title="حفظ المسودة"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">حفظ</span>
            </button>
          )}
        </div>

        {/* أدوات اليمين (نسخ/تحميل/مسح) */}
        <div className="flex items-center gap-1">
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={disabled || !canUndo}
              className="p-2 rounded-lg hover:bg-white transition-colors text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="تراجع (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}
          
          {onRedo && (
            <button
              onClick={onRedo}
              disabled={disabled || !canRedo}
              className="p-2 rounded-lg hover:bg-white transition-colors text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="إعادة (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          )}
          
          {onCopy && (
            <button
              onClick={onCopy}
              disabled={disabled || !hasText}
              className="px-3 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 text-sm font-bold text-ink-700 disabled:opacity-50"
              title="نسخ النص"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">نسخ</span>
            </button>
          )}
          
          {onDownload && (
            <button
              onClick={onDownload}
              disabled={disabled || !hasText}
              className="px-3 py-2 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 text-sm font-bold text-ink-700 disabled:opacity-50"
              title="تنزيل النص"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تنزيل</span>
            </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
              disabled={disabled || !hasText}
              className="px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex items-center gap-1.5 text-sm font-bold disabled:opacity-50"
              title="مسح الكل"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">مسح</span>
            </button>
          )}
        </div>
      </div>

      {/* منطقة الكتابة */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          dir="auto"
          className="w-full min-h-[300px] p-4 md:p-6 text-base md:text-lg leading-relaxed bg-transparent border-0 focus:outline-none resize-none font-medium text-ink-800 placeholder:text-ink-400"
          style={{
            fontFamily: 'Cairo, sans-serif',
          }}
          spellCheck={true}
        />
        
        {/* حرف/كلمة counter في الأسفل */}
        {hasText && (
          <div className="absolute bottom-3 left-3 text-xs text-ink-400 font-bold bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-ink-100">
            {value.length.toLocaleString('ar-SA')} حرف
          </div>
        )}
      </div>
    </div>
  );
}
