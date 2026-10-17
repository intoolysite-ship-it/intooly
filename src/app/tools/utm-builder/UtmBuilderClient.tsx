'use client';

import { useState, useMemo } from 'react';
import {
  Link2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Info,
  Trash2,
  BarChart3,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Shield,
} from 'lucide-react';

interface UtmFields {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

const INITIAL_FIELDS: UtmFields = {
  url: '',
  source: '',
  medium: '',
  campaign: '',
  content: '',
  term: '',
};

export default function UtmBuilderClient() {
  const [fields, setFields] = useState<UtmFields>(INITIAL_FIELDS);
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(() => {
    if (!fields.url.trim()) return '';
    if (!fields.source.trim() || !fields.medium.trim() || !fields.campaign.trim()) {
      return '';
    }

    try {
      const url = new URL(fields.url.trim());
      url.searchParams.set('utm_source', fields.source.trim().toLowerCase());
      url.searchParams.set('utm_medium', fields.medium.trim().toLowerCase());
      url.searchParams.set('utm_campaign', fields.campaign.trim().toLowerCase());
      if (fields.content.trim()) {
        url.searchParams.set('utm_content', fields.content.trim().toLowerCase());
      }
      if (fields.term.trim()) {
        url.searchParams.set('utm_term', fields.term.trim().toLowerCase());
      }
      return url.toString();
    } catch {
      return '';
    }
  }, [fields]);

  const updateField = (key: keyof UtmFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* تجاهل */
    }
  };

  const handleReset = () => {
    setFields(INITIAL_FIELDS);
    setCopied(false);
  };

  const isValid = generatedUrl.length > 0;

  return (
    <main dir="rtl" className="min-h-screen bg-ink-50 text-ink-900">
      {/* Hero — بنفس هوية Intooly */}
      <section
        className="relative overflow-hidden py-10 md:py-14 lg:py-16 bg-white"
        style={{
          boxShadow: '0 15px 50px -10px rgba(202,138,4,0.5), 0 8px 20px -5px rgba(202,138,4,0.3)'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(202,138,4,0.6) 0%, rgba(202,138,4,0.35) 25%, rgba(202,138,4,0.15) 50%, transparent 75%)'
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center shadow-sm">
                <BarChart3 className="w-6 h-6 text-brand-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink-900 leading-tight">
                مولّد روابط UTM
              </h1>
            </div>
            <p className="text-base sm:text-lg md:text-xl font-semibold text-ink-800 max-w-2xl mx-auto leading-relaxed">
              أنشئ روابط UTM احترافية لحملاتك التسويقية. أضف معاملات التتبع وتابع مصادر زياراتك بدقة في Google Analytics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-6">
              <span className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-white/50 shadow-sm">
                <Shield className="w-4 h-4 text-ink-800" />
                <span className="text-xs md:text-sm font-bold text-ink-900">معالجة محلية 100%</span>
              </span>
              <span className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-white/50 shadow-sm">
                <Sparkles className="w-4 h-4 text-ink-800" />
                <span className="text-xs md:text-sm font-bold text-ink-900">توليد فوري</span>
              </span>
              <span className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-white/50 shadow-sm">
                <Copy className="w-4 h-4 text-ink-800" />
                <span className="text-xs md:text-sm font-bold text-ink-900">نسخ بضغطة</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
          {/* Inputs */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                بيانات الحملة
              </h2>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-ink-500 hover:text-red-600 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                مسح
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">
                  رابط الموقع <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={fields.url}
                  onChange={(e) => updateField('url', e.target.value)}
                  placeholder="https://intooly.com"
                  className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    المصدر (utm_source) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fields.source}
                    onChange={(e) => updateField('source', e.target.value)}
                    placeholder="google, newsletter"
                    className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    الوسيط (utm_medium) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fields.medium}
                    onChange={(e) => updateField('medium', e.target.value)}
                    placeholder="cpc, email, social"
                    className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  اسم الحملة (utm_campaign) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fields.campaign}
                  onChange={(e) => updateField('campaign', e.target.value)}
                  placeholder="summer-sale-2026"
                  className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    المحتوى (utm_content)
                  </label>
                  <input
                    type="text"
                    value={fields.content}
                    onChange={(e) => updateField('content', e.target.value)}
                    placeholder="banner-top"
                    className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    الكلمة (utm_term)
                  </label>
                  <input
                    type="text"
                    value={fields.term}
                    onChange={(e) => updateField('term', e.target.value)}
                    placeholder="running-shoes"
                    className="w-full px-4 py-2.5 border border-ink-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                الحقول المميزة بـ <span className="text-red-500">*</span> إلزامية. سيتم تحويل القيم تلقائيًا إلى أحرف صغيرة لتوحيد التتبع.
              </p>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-brand-600" />
              الرابط الناتج
            </h2>

            {!isValid ? (
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-ink-50 border border-dashed border-ink-300 p-8 text-center text-ink-400">
                <Link2 className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">
                  املأ الحقول الإلزامية <br />
                  ليظهر الرابط الناتج هنا
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-ink-50 border border-ink-200 p-4 mb-4">
                  <p className="text-xs text-ink-500 mb-2">الرابط الناتج:</p>
                  <p
                    className="text-sm font-mono text-ink-900 break-all leading-relaxed"
                    dir="ltr"
                  >
                    {generatedUrl}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={handleCopy}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        تم النسخ!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        نسخ الرابط
                      </>
                    )}
                  </button>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 border border-ink-200 rounded-xl hover:bg-ink-50 transition flex items-center justify-center"
                    title="فتح الرابط"
                  >
                    <ExternalLink className="w-5 h-5 text-ink-600" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ما هو UTM */}
          <article className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-ink-900">
                ما هو UTM ولماذا تحتاجه؟
              </h2>
            </div>
            <p className="text-ink-700 leading-8 mb-4">
              UTM (Urchin Tracking Module) هو مجموعة من المعاملات التي تُضاف إلى نهاية رابط الموقع، ليتمكن Google Analytics وأدوات التحليل الأخرى من معرفة مصدر الزيارة بدقة.
            </p>
            <p className="text-ink-700 leading-8">
              بدون UTM، قد تظهر زياراتك كـ "Direct" أو "Referral" غير واضح. مع UTM، تعرف بالضبط: من أين جاء الزائر (Google، Facebook، نشرة بريدية)، وما نوع الحملة (CPC، Social، Email)، وما اسم الحملة نفسها.
            </p>
          </article>

          {/* المعاملات الخمسة */}
          <article className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-ink-900">
                المعاملات الخمسة لـ UTM
              </h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'utm_source', desc: 'مصدر الزيارة (مثل: google, facebook, newsletter)', required: true },
                { name: 'utm_medium', desc: 'نوع الوسيط (مثل: cpc, email, social)', required: true },
                { name: 'utm_campaign', desc: 'اسم الحملة (مثل: summer-sale-2026)', required: true },
                { name: 'utm_content', desc: 'المحتوى أو الزر (مثل: banner-top, cta-button)', required: false },
                { name: 'utm_term', desc: 'الكلمة المفتاحية (لإعلانات الدفع بالنقرة فقط)', required: false },
              ].map((p) => (
                <div key={p.name} className="flex items-start gap-3 p-3 rounded-lg bg-ink-50">
                  <code className="font-mono text-sm text-brand-700 font-bold" dir="ltr">
                    {p.name}
                  </code>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-ink-200 text-ink-600">
                    {p.required ? 'إلزامي' : 'اختياري'}
                  </span>
                  <p className="text-sm text-ink-600 flex-1">{p.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* نصائح */}
          <article className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-ink-900">
                نصائح لاستخدام UTM بفعالية
              </h2>
            </div>
            <ul className="space-y-2 text-ink-700 leading-7">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-1" />
                <span>استخدم أحرفًا صغيرة دائمًا (google وليس Google)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-1" />
                <span>لا تستخدم مسافات — استبدلها بشرطة (-) أو شرطة سفلية (_)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-1" />
                <span>وحّد المصطلحات: "email" دائمًا، وليس "Email" أو "mail"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-1" />
                <span>لا تضف UTM للروابط الداخلية (لأنها تُعيد تعيين الجلسة)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-brand-600 shrink-0 mt-1" />
                <span>اختبر الرابط قبل النشر للتأكد من أنه يعمل</span>
              </li>
            </ul>
          </article>

          {/* FAQ */}
          <article className="bg-white rounded-2xl border border-ink-200 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-ink-900">
                الأسئلة الشائعة
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: 'هل الأداة مجانية؟',
                  a: 'نعم، مجانية بالكامل ولا تتطلب تسجيلًا أو مفتاح API. كل شيء يعمل محليًا في متصفحك.',
                },
                {
                  q: 'هل ترتيب المعاملات مهم؟',
                  a: 'لا، ترتيب المعاملات لا يؤثر على التحليل. Google Analytics يقرأها جميعًا بنفس الطريقة.',
                },
                {
                  q: 'هل يمكنني استخدام UTM للروابط الداخلية؟',
                  a: 'لا يُنصح بذلك. UTM على الروابط الداخلية يُعيد تعيين الجلسة في Google Analytics، مما يُفسد البيانات.',
                },
                {
                  q: 'هل يتم حفظ بياناتي؟',
                  a: 'لا. كل شيء يعمل في متصفحك. لا نُرسل أي بيانات إلى خوادمنا.',
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="rounded-xl border border-ink-200 p-4 group"
                >
                  <summary className="cursor-pointer list-none font-bold text-ink-900 marker:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {faq.q}
                      <span className="text-xl text-brand-600 transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 pt-3 border-t border-ink-100 leading-7 text-ink-600">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}