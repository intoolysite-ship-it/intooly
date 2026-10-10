'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { readFile, isSupportedFile } from '@/lib/word-counter/fileReader';

interface FileUploaderProps {
  onFileLoaded: (text: string, fileName: string) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFileLoaded, disabled = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    // التحقق من النوع
    if (!isSupportedFile(file)) {
      setError('نوع الملف غير مدعوم. المدعوم: TXT, MD, CSV, DOCX, PDF');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const text = await readFile(file);
      
      if (!text.trim()) {
        setError('الملف فارغ أو لا يحتوي على نص');
        setIsLoading(false);
        return;
      }
      
      onFileLoaded(text, file.name);
    } catch (e) {
      console.error('File read error:', e);
      const errMsg = e instanceof Error ? e.message : 'فشل قراءة الملف';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [onFileLoaded]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isLoading) setIsDragging(true);
  }, [disabled, isLoading]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isLoading) return;
    
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, isLoading, handleFile]);
  
  const handleClick = () => {
    if (!disabled && !isLoading) fileInputRef.current?.click();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    e.target.value = '';
  };
  
  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-4 cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-lg' 
            : 'border-ink-300 bg-gradient-to-br from-ink-50 to-brand-50 hover:border-brand-500 hover:shadow-md'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label="منطقة رفع الملفات"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.docx,.pdf"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled || isLoading}
        />
        
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border-2 border-brand-200 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-brand-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-right">
            <h3 className="font-extrabold text-ink-900 text-sm mb-0.5">
              {isLoading ? 'جاري قراءة الملف...' : 'رفع ملف نصي'}
            </h3>
            <p className="text-xs text-ink-500 font-bold">
              اسحب الملف أو انقر — TXT, DOCX, PDF
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
          <X className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
