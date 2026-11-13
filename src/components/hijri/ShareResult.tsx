'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareResultProps {
  hijriText: string;
  gregorianText: string;
  direction: 'hijri-to-gregorian' | 'gregorian-to-hijri';
}

export default function ShareResult({ hijriText, gregorianText, direction }: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const shareLink = () => {
    try {
      const data = {
        h: hijriText,
        g: gregorianText,
        d: direction,
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

      // نسخ إلى الحافظة
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (e) {
      console.error('فشل المشاركة:', e);
    }
  };

  return (
    <button
      onClick={shareLink}
      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 text-blue-700 px-3 py-2 text-xs font-bold hover:bg-blue-200 transition"
      title="نسخ رابط يحتوي على هذا التحويل"
    >
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? 'تم نسخ الرابط!' : 'مشاركة'}
    </button>
  );
}