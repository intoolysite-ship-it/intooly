'use client';

import { X, Video, Clock, Maximize2, FileText, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/video-to-gif/converter';
import type { InputFile, ProcessingStatus } from '@/lib/video-to-gif/types';

interface PreviewPanelProps {
  file: InputFile;
  onClear: () => void;
  status: ProcessingStatus;
  progress: number;
  message: string;
}

export default function PreviewPanel({
  file,
  onClear,
  status,
  progress,
  message,
}: PreviewPanelProps) {
  if (!file) return null;

  const isProcessing = status === 'processing' || status === 'loading-ffmpeg';

  return (
    <div className="gallery-panel">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-base font-extrabold text-ink-900 flex items-center gap-2">
          <Video className="w-5 h-5 text-brand-500" />
          الفيديو المُدخل
        </h2>
        {!isProcessing && (
          <button
            onClick={onClear}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
          >
            <X className="w-4 h-4" />
            مسح
          </button>
        )}
      </div>

      {/* معاينة الفيديو */}
      <div className="main-preview checker-bg">
        {file.url ? (
          <video
            src={file.url}
            controls
            className="max-w-full max-h-full"
            style={{ objectFit: 'contain' }}
          />
        ) : null}
      </div>

      {/* معلومات الملف */}
      <div className="mt-3 p-3 bg-white rounded-lg border border-ink-200">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-ink-600" />
          <p className="font-bold text-ink-900 text-xs truncate">{file.name}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-ink-600 font-bold flex items-center gap-1">
            <span>📦</span>
            {formatBytes(file.size)}
          </span>
          {file.width && file.height && (
            <span className="text-ink-600 font-bold flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              {file.width} × {file.height}
            </span>
          )}
          {file.duration && (
            <span className="text-ink-600 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {file.duration.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* شريط التقدم */}
      {isProcessing && (
        <div className="mt-4 p-4 rounded-xl bg-brand-50 border-2 border-brand-200">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
            <p className="font-extrabold text-ink-900 text-sm">{message}</p>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-ink-600 mt-2 text-center font-bold">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}
