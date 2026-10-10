'use client';

import { useState } from 'react';
import { 
  Download, Copy, Check, FileText, 
  FileJson, FileSpreadsheet, FileCode
} from 'lucide-react';
import type { TextAnalysis } from '@/lib/word-counter/types';
import { 
  exportReport, 
  copyReportAsMarkdown 
} from '@/lib/word-counter/exporter';

interface ExportMenuProps {
  analysis: TextAnalysis | null;
  mode: string;
  originalText: string;
  disabled?: boolean;
}

type ExportFormat = 'markdown' | 'csv' | 'json' | 'txt';

const FORMATS: {
  id: ExportFormat;
  label: string;
  icon: any;
  description: string;
  color: string;
}[] = [
  {
    id: 'markdown',
    label: 'Markdown',
    icon: FileText,
    description: 'تقرير كامل قابل للقراءة',
    color: 'blue',
  },
  {
    id: 'csv',
    label: 'CSV',
    icon: FileSpreadsheet,
    description: 'لـ Excel و Google Sheets',
    color: 'green',
  },
  {
    id: 'json',
    label: 'JSON',
    icon: FileJson,
    description: 'للمطورين والتكامل',
    color: 'purple',
  },
  {
    id: 'txt',
    label: 'TXT',
    icon: FileCode,
    description: 'النص الأصلي فقط',
    color: 'gray',
  },
];

export default function ExportMenu({ 
  analysis, 
  mode, 
  originalText,
  disabled = false,
}: ExportMenuProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const hasAnalysis = analysis !== null;
  const hasText = originalText.trim().length > 0;
  
  // تصدير
  const handleExport = (format: ExportFormat) => {
    if (!analysis) return;
    
    try {
      exportReport(
        analysis,
        mode,
        format,
        undefined,
        format === 'txt' ? originalText : undefined
      );
      setShowMenu(false);
    } catch (e) {
      console.error('Export error:', e);
    }
  };
  
  // نسخ Markdown
  const handleCopy = async () => {
    if (!analysis) return;
    
    try {
      const success = await copyReportAsMarkdown(analysis, mode);
      if (success) {
        setCopiedFormat('markdown');
        setTimeout(() => setCopiedFormat(null), 2000);
      }
    } catch (e) {
      console.error('Copy error:', e);
    }
  };
  
  return (
    <div className="relative">
      
      {/* الأزرار */}
      <div className="flex items-center gap-2">
        
        {/* نسخ سريع */}
        <button
          onClick={handleCopy}
          disabled={disabled || !hasAnalysis}
          className="flex-1 px-3 py-2 rounded-lg bg-white border-2 border-ink-200 hover:border-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-ink-700 flex items-center justify-center gap-2 transition-colors"
          title="نسخ التقرير"
        >
          {copiedFormat === 'markdown' ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              نسخ التقرير
            </>
          )}
        </button>
        
        {/* قائمة التصدير */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={disabled || !hasAnalysis}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-l from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          تصدير
        </button>
      </div>
      
      {/* القائمة المنسدلة */}
      {showMenu && hasAnalysis && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          <div className="absolute top-full right-0 mt-2 z-50 bg-white border-2 border-ink-200 rounded-xl shadow-2xl overflow-hidden min-w-[280px]">
            
            <div className="p-3 border-b border-ink-200 bg-ink-50">
              <p className="text-xs font-black text-ink-700">
                اختر صيغة التصدير
              </p>
            </div>
            
            {FORMATS.map((format) => {
              const Icon = format.icon;
              
              return (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={format.id === 'txt' && !hasText}
                  className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-right border-b border-ink-100 last:border-0"
                >
                  <div className={`w-10 h-10 rounded-lg bg-${format.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${format.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-ink-900">
                      {format.label}
                    </p>
                    <p className="text-xs text-ink-500 font-medium">
                      {format.description}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-ink-400" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
