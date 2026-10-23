'use client';

/**
 * مكوّن إصلاح ذكي شامل — يقدم واجهة تفاعلية لكل نوع مشكلة.
 * يعرض: القيمة الحالية، مكان الخطأ، وحقل لإدخال الحل وتوليد الكود.
 */

import { useState, useMemo } from 'react';
import { Copy, Check, AlertCircle, CheckCircle2, Link2, Heading1 } from 'lucide-react';

interface SmartFixerProps {
  issueId: string;
  issueValue: string;
}

// ============================================
// Title Fixer
// ============================================
function TitleFixer({ data }: { data: { current: string; length: number } }) {
  const [value, setValue] = useState(data.current);
  const [copied, setCopied] = useState(false);

  const length = value.length;
  const isValid = length >= 30 && length <= 60;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`<title>${value}</title>`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-lg border-2 border-ink-200 bg-white p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <p className="text-xs font-bold text-ink-700">
          القيمة الحالية: <span className="font-mono text-ink-900" dir="ltr">{data.current}</span>
        </p>
      </div>
      <div>
        <label className="text-xs font-bold text-ink-700 mb-1 block">
          العنوان الجديد:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <p className={`mt-1 text-xs font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {length} / 60 حرفًا {isValid ? '✓' : '(يفضل 30-60)'}
        </p>
      </div>
      {value.trim() && (
        <div className="rounded-lg border border-ink-200 bg-ink-900 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-ink-800">
            <span className="text-[10px] font-bold text-ink-300">الكود الجديد</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-[10px] font-bold text-white">
              {copied ? <><Check className="w-3 h-3" /> تم</> : <><Copy className="w-3 h-3" /> نسخ</>}
            </button>
          </div>
          <pre className="p-3 text-xs text-ink-100 overflow-x-auto font-mono" dir="ltr">
            {`<title>${value}</title>`}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================
// Description Fixer
// ============================================
function DescriptionFixer({ data }: { data: { current: string; length: number } }) {
  const [value, setValue] = useState(data.current);
  const [copied, setCopied] = useState(false);
  const length = value.length;
  const isValid = length >= 140 && length <= 160;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`<meta name="description" content="${value.replace(/"/g, '&quot;')}">`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-lg border-2 border-ink-200 bg-white p-3 space-y-2">
      <p className="text-xs font-bold text-ink-700">
        القيمة الحالية ({data.length} حرف): <span className="font-mono text-ink-900" dir="ltr">{data.current}</span>
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none resize-none"
      />
      <p className={`text-xs font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        {length} / 160 حرفًا {isValid ? '✓' : '(يفضل 140-160)'}
      </p>
      {value.trim() && (
        <div className="rounded-lg border border-ink-200 bg-ink-900 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-ink-800">
            <span className="text-[10px] font-bold text-ink-300">الكود الجديد</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-[10px] font-bold text-white">
              {copied ? <><Check className="w-3 h-3" /> تم</> : <><Copy className="w-3 h-3" /> نسخ</>}
            </button>
          </div>
          <pre className="p-3 text-xs text-ink-100 overflow-x-auto font-mono break-all" dir="ltr">
            {`<meta name="description" content="${value}">`}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================
// H1 Fixer
// ============================================
function H1Fixer({ data }: { data: { count: number; texts: string[] } }) {
  return (
    <div className="rounded-lg border-2 border-ink-200 bg-white p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Heading1 className="w-4 h-4 text-amber-600" />
        <p className="text-xs font-bold text-ink-700">
          تم اكتشاف {data.count} عنوان H1:
        </p>
      </div>
      <ul className="space-y-1 pr-4">
        {data.texts.map((t, i) => (
          <li key={i} className="text-xs text-ink-700 list-disc">
            <span className="font-mono bg-ink-100 px-1 rounded" dir="auto">{t}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
        <p className="font-bold">الحل:</p>
        <p className="mt-1">احتفظ بـ H1 واحد فقط (الموضوع الرئيسي)، وحوّل الباقي إلى H2.</p>
        <pre className="mt-2 p-2 bg-white rounded text-[11px] font-mono" dir="ltr">{`<h1>${data.texts[0] || 'العنوان الرئيسي'}</h1>\n<h2>عنوان فرعي</h2>`}</pre>
      </div>
    </div>
  );
}

// ============================================
// Links Fixer
// ============================================
function LinksFixer({ data }: { data: { index: number; href: string; outerHTML: string }[] }) {
  const [texts, setTexts] = useState<Record<number, string>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (idx: number, href: string) => {
    const text = texts[idx];
    if (!text) return;
    try {
      await navigator.clipboard.writeText(`<a href="${href}">${text}</a>`);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
        <p className="font-bold flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5" />
          {data.length} رابط بدون نص:
        </p>
      </div>
      {data.map((link) => (
        <div key={link.index} className="rounded-lg border-2 border-ink-200 bg-white p-3 space-y-2">
          <p className="text-xs font-bold text-ink-700">
            رابط #{link.index}: <span className="font-mono text-ink-600 break-all" dir="ltr">{link.href}</span>
          </p>
          <input
            type="text"
            value={texts[link.index] || ''}
            onChange={(e) => setTexts({ ...texts, [link.index]: e.target.value })}
            placeholder="مثال: اقرأ المزيد"
            className="w-full rounded-lg border-2 border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          {texts[link.index]?.trim() && (
            <div className="rounded-lg border border-ink-200 bg-ink-900 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-ink-800">
                <span className="text-[10px] font-bold text-ink-300">الكود الجديد</span>
                <button onClick={() => handleCopy(link.index, link.href)} className="inline-flex items-center gap-1 rounded bg-ink-700 px-2 py-1 text-[10px] font-bold text-white">
                  {copiedIdx === link.index ? <><Check className="w-3 h-3" /> تم</> : <><Copy className="w-3 h-3" /> نسخ</>}
                </button>
              </div>
              <pre className="p-3 text-xs text-ink-100 overflow-x-auto font-mono break-all" dir="ltr">
                {`<a href="${link.href}">${texts[link.index]}</a>`}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// المكوّن الرئيسي
// ============================================
export default function SmartFixer({ issueId, issueValue }: SmartFixerProps) {
  let data: unknown;
  try {
    data = JSON.parse(issueValue);
  } catch {
    return null;
  }

  if (issueId === 'title') {
    return <TitleFixer data={data as { current: string; length: number }} />;
  }
  if (issueId === 'description') {
    return <DescriptionFixer data={data as { current: string; length: number }} />;
  }
  if (issueId === 'h1') {
    return <H1Fixer data={data as { count: number; texts: string[] }} />;
  }
  if (issueId === 'links-text') {
    return <LinksFixer data={data as { index: number; href: string; outerHTML: string }[]} />;
  }

  return null;
}
