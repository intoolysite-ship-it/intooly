'use client';

/**
 * تبويب التصدير — نسخ/تنزيل النتائج بصيغ JSON وHTML وTXT.
 */

import { useMemo } from 'react';
import type { MetaTagsState } from '@/lib/seo-meta-tags/types';
import {
  generateMetaTags,
  buildExportData,
} from '@/lib/seo-meta-tags/engine';
import { DISCLAIMER_MESSAGES } from '@/lib/seo-meta-tags/constants';
import CopyButton from '../shared/CopyButton';
import { Download, FileJson, FileCode, FileText, Info } from 'lucide-react';

interface ExportTabProps {
  state: MetaTagsState;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportTab({ state }: ExportTabProps) {
  const generated = useMemo(() => generateMetaTags(state), [state]);
  const exportData = useMemo(() => buildExportData(state), [state]);

  const jsonContent = JSON.stringify(exportData, null, 2);

  const handleDownloadJson = () => {
    downloadFile('meta-tags.json', jsonContent, 'application/json');
  };

  const handleDownloadHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${generated.fullHtml}
</head>
<body>
<!-- الصفحة الخاصة بك هنا -->
</body>
</html>`;
    downloadFile('meta-tags.html', html, 'text/html');
  };

  const handleDownloadTxt = () => {
    const txt = `=== Meta Tags ===

${generated.fullHtml}

=== بيانات التصدير ===

${jsonContent}`;
    downloadFile('meta-tags.txt', txt, 'text/plain');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
        <p className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          إفصاح
        </p>
        <p className="text-xs mt-1">{DISCLAIMER_MESSAGES.noDataCollected}</p>
      </div>

      {/* بطاقات التصدير */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* JSON */}
        <div className="rounded-xl border-2 border-ink-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-ink-900">JSON</h3>
          </div>
          <p className="text-xs text-ink-600">
            بيانات الوسوم بصيغة JSON قابلة للاستخدام في أدوات أخرى.
          </p>
          <div className="flex flex-col gap-1.5">
            <CopyButton text={jsonContent} label="نسخ JSON" size="sm" variant="secondary" />
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-ink-100 text-ink-800 hover:bg-ink-200"
            >
              <Download className="w-3 h-3" />
              تنزيل .json
            </button>
          </div>
        </div>

        {/* HTML */}
        <div className="rounded-xl border-2 border-ink-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-ink-900">HTML</h3>
          </div>
          <p className="text-xs text-ink-600">
            صفحة HTML كاملة تحتوي على الوسوم جاهزة للاستخدام.
          </p>
          <div className="flex flex-col gap-1.5">
            <CopyButton text={generated.fullHtml} label="نسخ الوسوم" size="sm" variant="secondary" />
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-ink-100 text-ink-800 hover:bg-ink-200"
            >
              <Download className="w-3 h-3" />
              تنزيل .html
            </button>
          </div>
        </div>

        {/* TXT */}
        <div className="rounded-xl border-2 border-ink-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <h3 className="font-extrabold text-ink-900">TXT</h3>
          </div>
          <p className="text-xs text-ink-600">
            ملف نصي بسيط يحتوي على الوسوم وبيانات JSON معًا.
          </p>
          <div className="flex flex-col gap-1.5">
            <CopyButton text={jsonContent} label="نسخ البيانات" size="sm" variant="secondary" />
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-ink-100 text-ink-800 hover:bg-ink-200"
            >
              <Download className="w-3 h-3" />
              تنزيل .txt
            </button>
          </div>
        </div>
      </div>

      {/* معاينة JSON */}
      <div className="rounded-xl border-2 border-ink-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between bg-ink-100 px-4 py-2 border-b border-ink-200">
          <span className="text-sm font-bold text-ink-700">معاينة JSON</span>
        </div>
        <pre className="p-4 text-xs text-ink-800 overflow-x-auto font-mono" dir="ltr">
          {jsonContent}
        </pre>
      </div>
    </div>
  );
}
