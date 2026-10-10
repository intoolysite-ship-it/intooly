'use client';

import { Download, RefreshCw, CheckCircle, Maximize2, Clock, Gauge, HardDrive } from 'lucide-react';
import { formatBytes } from '@/lib/video-to-gif/converter';
import type { GifResult } from '@/lib/video-to-gif/types';

interface ResultCardProps {
  result: GifResult;
  onNewGif: () => void;
}

export default function ResultCard({ result, onNewGif }: ResultCardProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="result-card">
      {/* رأس البطاقة */}
      <div className="result-card-header">
        <div className="file-icon">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="file-name" title={result.name}>
          {result.name}
        </p>
        <span
          className="badge"
          style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            color: '#15803d',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 800,
          }}
        >
          ✓ جاهز
        </span>
      </div>

      {/* المحتوى */}
      <div className="result-layout">
        {/* معاينة GIF */}
        <div className="result-image-col">
          <div className="comparison-container checker-bg" style={{ aspectRatio: '1/1' }}>
            <img
              src={result.url}
              alt={result.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <p className="drag-hint">
            💡 معاينة GIF النهائي
          </p>
        </div>

        {/* معلومات + أزرار */}
        <div className="result-info-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* الحجم */}
            <div className="info-stat">
              <div className="info-icon">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="info-content">
                <div className="info-label">حجم الملف</div>
                <div className="info-value">{formatBytes(result.size)}</div>
              </div>
            </div>

            {/* الأبعاد */}
            <div className="info-stat">
              <div className="info-icon">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div className="info-content">
                <div className="info-label">الأبعاد</div>
                <div className="info-value">
                  {result.width} × {result.height}
                </div>
              </div>
            </div>

            {/* FPS */}
            <div className="info-stat">
              <div className="info-icon">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="info-content">
                <div className="info-label">معدل الإطارات</div>
                <div className="info-value">{result.fps} FPS</div>
              </div>
            </div>

            {/* المدة */}
            <div className="info-stat">
              <div className="info-icon">
                <Clock className="w-5 h-5" />
              </div>
              <div className="info-content">
                <div className="info-label">المدة</div>
                <div className="info-value">{result.duration.toFixed(1)}s</div>
              </div>
            </div>
          </div>

          {/* الأزرار */}
          <div className="grid grid-cols-1 gap-2 mt-3">
            <button
              onClick={handleDownload}
              className="btn-download"
              style={{ padding: '0.75rem' }}
            >
              <Download className="w-5 h-5" />
              تحميل GIF
            </button>
            <button
              onClick={onNewGif}
              className="btn-secondary justify-center"
              style={{ padding: '0.75rem' }}
            >
              <RefreshCw className="w-5 h-5" />
              إنشاء GIF جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
