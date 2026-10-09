'use client';

// ============================================================
// ⬆️ زر العودة للأعلى
// ============================================================

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // ✅ مراقبة التمرير
  useEffect(() => {
    const handleScroll = () => {
      // يظهر الزر بعد 500 بكسل من التمرير
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // ✅ فحص أولي (إذا كانت الصفحة محمّلة في موضع تمرير)
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ العودة للأعلى بسلاسة
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="scrollTop"
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى الأعلى"
      title="العودة إلى الأعلى"
      className={`
        fixed bottom-6 left-6 z-40
        w-12 h-12 rounded-full
        bg-gradient-to-br from-amber-400 to-amber-600
        hover:from-amber-500 hover:to-amber-700
        text-white shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        border-2 border-white/20
        ${isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-90'
        }
        hover:-translate-y-1 active:scale-95
      `}
    >
      <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
    </button>
  );
}