'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // ✅ تأخير 1.2 ثانية لتحسين تجربة المستخدم
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    // تفعيل GA بعد الموافقة
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-ink-900 text-white shadow-2xl border-t-2 border-brand-500 animate-[slideUp_0.4s_ease-out]"
      dir="rtl"
      role="dialog"
      aria-live="polite"
      aria-label="إشعار ملفات تعريف الارتباط"
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-base md:text-lg mb-1 flex items-center gap-2">
              🍪 نحن نستخدم ملفات تعريف الارتباط
            </h3>
            <p className="text-sm text-ink-200 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل استخدام الموقع عبر{' '}
              <strong className="text-brand-400">Google Analytics</strong>.
              يمكنك قبول التتبع أو رفضه. راجع{' '}
              <Link
                href="/privacy-policy"
                className="text-brand-400 underline hover:text-brand-300"
              >
                سياسة الخصوصية
              </Link>{' '}
              للمزيد.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={reject}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-ink-700 hover:bg-ink-600 text-white font-bold text-sm transition-colors border border-ink-600"
              aria-label="رفض ملفات تعريف الارتباط"
            >
              رفض
            </button>
            <button
              onClick={accept}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-ink-900 font-bold text-sm transition-all shadow-lg"
              aria-label="قبول ملفات تعريف الارتباط"
            >
              ✅ قبول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}