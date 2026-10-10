'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, Video, X } from 'lucide-react';
import { GIF_CONFIG, MESSAGES } from '@/lib/video-to-gif/constants';
import { isVideoFile } from '@/lib/video-to-gif/converter';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploader({ onFileSelected, disabled = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!isVideoFile(file)) {
      setError(MESSAGES.ERROR_INVALID_TYPE);
      return;
    }

    if (file.size > GIF_CONFIG.MAX_VIDEO_SIZE) {
      setError(MESSAGES.ERROR_FILE_TOO_BIG);
      return;
    }

    onFileSelected(file);
  }, [onFileSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, handleFile]);

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
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
          relative border-3 border-dashed rounded-2xl p-8 md:p-14 cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-brand-500 bg-brand-50 scale-[1.02] shadow-lg'
            : 'border-ink-300 bg-gradient-to-br from-ink-50 to-brand-50 hover:border-brand-500 hover:shadow-md'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label="منطقة رفع الفيديو"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={GIF_CONFIG.ACCEPTED_VIDEO_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Video className="w-16 h-16 md:w-20 md:h-20 text-brand-500" />
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-ink-900 mb-2">
            اسحب الفيديو وأفلته هنا
          </h3>
          <p className="text-ink-600 mb-2 text-sm md:text-base">
            أو انقر لاختيار <strong>ملف فيديو</strong> من جهازك
          </p>
          <p className="text-xs md:text-sm text-ink-500 mb-6">
            💡 يدعم: MP4, WebM, MOV, AVI — حتى 100 ميجابايت
          </p>

          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            disabled={disabled}
          >
            <Upload className="w-5 h-5" />
            اختر فيديو
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-3">
          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
