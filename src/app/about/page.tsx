import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'من نحن | intooly - أدوات مجانية احترافية تعمل محلياً',
  description: 'تعرف على قصة وأهداف موقع intooly. نحن نقدم أدوات مجانية لمعالجة الصور والفيديو والنصوص تعمل محلياً 100% في متصفحك لضمان خصوصيتك وسرعتك.',
};

export default function AboutPage() {
  return (
    <>
      {/* Schema.org: AboutPage */}
      <Script
        id="schema-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "من نحن - intooly",
            "url": "https://intooly.com/about",
            "inLanguage": "ar",
            "description": "تعرف على قصة وأهداف موقع intooly. أدوات مجانية تعمل محلياً في متصفحك."
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 text-center text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #facc15 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">من نحن</h1>
          <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto leading-relaxed">
            نحن نعيد تعريف مفهوم الأدوات عبر الإنترنت: <span className="text-brand-400 font-bold">سريعة، مجانية، وخاصة 100%</span>.
          </p>
        </div>
      </section>

      {/* Story & Mission */}
      <section className="py-16 bg-white dark:bg-ink-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-ink-900 dark:text-white mb-4">🚀 قصتنا ورسالتنا</h2>
            <p className="text-lg text-ink-600 dark:text-ink-300 leading-relaxed">
              تأسس موقع <strong className="text-brand-600 dark:text-brand-400">intooly</strong> لحل مشكلة حقيقية واجهها الملايين: الخوف على خصوصية البيانات عند استخدام أدوات المعالجة السحابية. معظم المواقع تطلب منك رفع صورك أو فيديوهاتك الشخصية أو التجارية إلى سيرفرات مجهولة.
            </p>
            <p className="text-lg text-ink-600 dark:text-ink-300 leading-relaxed mt-4">
              رسالتنا بسيطة وقوية: <strong className="text-ink-900 dark:text-white">تمكين المستخدمين من معالجة ملفاتهم بأعلى جودة ممكنة، دون أن تغادر هذه الملفات أجهزتهم أبداً.</strong> نحن نستخدم تقنيات الويب الحديثة مثل WebAssembly و ONNX Runtime لتشغيل خوارزميات الذكاء الاصطناعي المعقدة مباشرة داخل متصفحك.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-ink-900 dark:bg-ink-800 p-6 rounded-2xl border border-ink-800 text-white text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-brand-400 text-xl mb-2">خصوصية مطلقة</h3>
              <p className="text-ink-200">لا نرفع ملفاتك. المعالجة تتم محلياً، مما يضمن بقاء بياناتك الحساسة آمنة.</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-200 dark:border-brand-800 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-ink-900 dark:text-brand-100 text-xl mb-2">سرعة فائقة</h3>
              <p className="text-ink-700 dark:text-ink-300">بدون وقت انتظار لرفع أو تنزيل الملفات. النتائج فورية لأن المحرك يعمل على جهازك.</p>
            </div>
            <div className="bg-ink-100 dark:bg-ink-800 p-6 rounded-2xl border border-ink-200 dark:border-ink-700 text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-ink-900 dark:text-white text-xl mb-2">مجانية دائمة</h3>
              <p className="text-ink-700 dark:text-ink-300">لا اشتراكات، لا حدود يومية، ولا علامات مائية. أدوات احترافية في متناول الجميع.</p>
            </div>
            <div className="bg-ink-800 dark:bg-ink-900 p-6 rounded-2xl border border-ink-700 text-white text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="font-bold text-brand-400 text-xl mb-2">تقنيات متقدمة</h3>
              <p className="text-ink-200">نستخدم نماذج ذكاء اصطناعي مفتوحة المصدر ومدققة (مثل U²-Net و FFmpeg.wasm).</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ink-50 dark:bg-ink-950 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-ink-900 dark:text-white mb-4">هل لديك اقتراح لأداة جديدة؟</h2>
          <p className="text-lg text-ink-600 dark:text-ink-400 mb-8 max-w-2xl mx-auto">نحن نحب سماع ملاحظاتك. فريقنا يعمل باستمرار على إضافة أدوات جديدة تلبي احتياجات مجتمعنا.</p>
          <Link href="/contact" className="inline-block bg-gradient-to-r from-brand-500 to-brand-400 text-ink-900 font-bold px-8 py-3 rounded-xl hover:from-brand-400 hover:to-brand-300 transition transform hover:-translate-y-1 shadow-lg">
            تواصل معنا الآن 💬
          </Link>
        </div>
      </section>
    </>
  );
}