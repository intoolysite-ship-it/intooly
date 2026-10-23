'use client';

/**
 * زر نسخ — ينسخ النص المحدد إلى الحافظة ويظهر تأكيدًا بصريًا مؤقتًا.
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export default function CopyButton({
  text,
  label = 'نسخ',
  copiedLabel = 'تم النسخ',
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard || disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  const variantClasses =
    variant === 'primary'
      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
      : variant === 'secondary'
        ? 'bg-ink-100 text-ink-800 hover:bg-ink-200'
        : 'text-brand-600 hover:bg-brand-50';

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <>
          <Check className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
