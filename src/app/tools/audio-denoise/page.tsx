'use client';

import Link from 'next/link';
import { Music, ArrowRight, Check, Sliders, Volume2, Shield, Zap, Clock } from 'lucide-react';
import AudioDenoiser from '@/components/audio/AudioDenoiser';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'تحويل صيغ الصوت', description: 'حوّل بين MP3 وWAV وM4A وFLAC.', href: '/tools/audio-converter', icon: '🔄' },
  { title: 'قص الأغاني', description: 'قص وتقطيع الملفات الصوتية.', href: '/tools/song-cutter', icon: '✂️' },
  { title: 'تحويل الفيديو إلى صوت', description: 'استخرج الصوت من الفيديو.', href: '/tools/video-to-audio', icon: '🎬' },
  { title: 'تحويل الصوت إلى نص', description: 'حوّل التسجيلات إلى نصوص.', href: '/tools/audio-to-text', icon: '📝' },
];

export default function AudioDenoisePage() {
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/audio" className="font-medium transition hover:text-orange-600">أدوات الصوت</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">إزالة الضوضاء</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Shield size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            إزالة الضوضاء من الصوت أونلاين مجاناً
          </h1>
          <p className="mt-4 text-slate-600">
            أزل الأصوات الخلفية المزعجة (المروحة، المكيف، الهسيس، ضوضاء الشارع) من تسجيلاتك، مع التحكم الكامل في قوة التنظيف ومعاينة النتيجة قبل التحميل.
          </p>
        </header>

        <section className="mb-10">
          <AudioDenoiser />
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تعمل الأداة؟</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-orange-600 font-bold text-lg mb-2">1. ارفع</div>
              <p className="text-sm text-slate-600">ارفع ملفك الصوتي (MP3, WAV, M4A, FLAC).</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-orange-600 font-bold text-lg mb-2">2. اضبط</div>
              <p className="text-sm text-slate-600">اختر قوة التنظيف المناسبة (خفيف، متوسط، قوي).</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-orange-600 font-bold text-lg mb-2">3. استمع ونزّل</div>
              <p className="text-sm text-slate-600">قارن الأصل بالنتيجة، ثم نزّل الملف WAV.</p>
            </div>
          </div>
        </section>

        <article className="space-y-12 border-t border-slate-200 pt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هي أداة إزالة الضوضاء من الصوت؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>أداة إزالة الضوضاء من الصوت</strong> هي أداة لمعالجة التسجيلات الصوتية بهدف تقليل الأصوات غير المرغوبة التي تظهر في الخلفية، مع الحفاظ على صوت المتحدث الأساسي.
              </p>
              <p>تساعد الأداة في معالجة أنواع مختلفة من الضوضاء:</p>
              <ul className="list-disc list-inside space-y-2 pr-2 mt-3">
                <li><strong>الضوضاء الثابتة:</strong> صوت المكيف، المروحة، أجهزة الكمبيوتر.</li>
                <li><strong>الطنين الكهربائي:</strong> الأصوات منخفضة التردد من الأجهزة.</li>
                <li><strong>ضجيج البيئة:</strong> حركة السيارات، أصوات الشارع.</li>
                <li><strong>ضوضاء الرياح:</strong> الهواء الذي يضرب الميكروفون.</li>
                <li><strong>الهسيس والتشويش:</strong> الأصوات الخلفية المستمرة.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">مميزات الأداة</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'إزالة الضوضاء الثابتة (مروحة، مكيف، هسيس)',
                'التحكم الكامل في قوة التنظيف (0-100%)',
                'مقارنة فورية بين الصوت الأصلي والمنظف',
                'معالجة محلية 100% (خصوصية تامة)',
                'تصدير WAV بجودة عالية',
                'مجاني بالكامل وبدون تسجيل',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={18} className="text-green-600 shrink-0 mt-1" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">جرّب أداة إزالة الضوضاء الآن</h2>
            <p className="text-orange-50 leading-8 mb-5 max-w-2xl mx-auto">
              لا تدع أصوات الخلفية تقلل من جودة تسجيلاتك. نظّف صوتك في ثوانٍ، مجاناً وبدون رفع ملفاتك.
            </p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">
              ⬆️ العودة إلى الأداة
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة</h2>
            <div className="space-y-3">
              {faqQuestions.map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-orange-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-orange-700">{tool.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600">استخدام الأداة <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}