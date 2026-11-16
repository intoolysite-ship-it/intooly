'use client';

import Link from 'next/link';
import { Music, ArrowRight, Check, Scissors, Clock } from 'lucide-react';
import AudioEditor from '@/components/audio/AudioEditor';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'تحويل صيغ الصوت', description: 'حوّل بين MP3 وWAV وM4A وFLAC.', href: '/tools/audio-converter', icon: '🔄' },
  { title: 'إزالة الضوضاء', description: 'نظّف صوتك من الأصوات الخلفية.', href: '/tools/audio-denoise', icon: '🔇' },
  { title: 'تحويل الفيديو إلى صوت', description: 'استخرج الصوت من الفيديو.', href: '/tools/video-to-audio', icon: '🎬' },
  { title: 'تحويل الصوت إلى نص', description: 'حوّل التسجيلات إلى نصوص.', href: '/tools/audio-to-text', icon: '📝' },
];

export default function AudioTrimmerPage() {
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/audio" className="font-medium transition hover:text-orange-600">أدوات الصوت</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">قص ودمج الصوت</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Scissors size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            قص ودمج الملفات الصوتية أونلاين مجاناً
          </h1>
          <p className="mt-4 text-slate-600">
            قص الصوت ودمج ملفات MP3 وWAV أونلاين مجاناً. حدد المقاطع بدقة من الموجة الصوتية، ورتب الملفات، ثم نزّل النتيجة بسهولة.
          </p>
        </header>

        <section className="mb-10">
          <AudioEditor />
        </section>

        <article className="space-y-12 border-t border-slate-200 pt-10">

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هي أداة قص ودمج الملفات الصوتية؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>
                <strong>أداة قص ودمج الملفات الصوتية</strong> هي محرر صوت عبر الإنترنت يساعدك على تحديد أجزاء معينة من التسجيلات الصوتية واقتطاعها أو حذفها، بالإضافة إلى جمع عدة ملفات صوتية في ملف واحد.
              </p>
              <p>
                بدلاً من استخدام برامج تحرير الصوت الاحترافية التي قد تحتاج إلى تثبيت وخبرة، يمكنك استخدام محرر الصوت من Intooly لإنجاز المهام الشائعة بسرعة. سواء كنت تريد حذف بداية تسجيل غير ضرورية، أو استخراج مقطع من أغنية، أو دمج عدة تسجيلات متتابعة، يمكنك تنفيذ ذلك من مكان واحد.
              </p>
              <p>
                تساعدك الموجة الصوتية على معرفة مواضع الصوت والصمت بصرياً، بينما تتيح لك حقول التوقيت إدخال وقت البداية والنهاية بدقة أكبر.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيفية قص ملف صوتي أونلاين</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li>افتح أداة قص الصوت من Intooly.</li>
              <li>اختر ملفاً صوتياً من جهازك أو اسحبه إلى منطقة الرفع.</li>
              <li>انتظر حتى يتم تحميل الملف وتحليل الموجة الصوتية.</li>
              <li>حدد بداية ونهاية الجزء الذي تريد الاحتفاظ به باستخدام أشرطة التمرير.</li>
              <li>استمع إلى الجزء المحدد للتأكد من اختيار المقطع الصحيح.</li>
              <li>اختر صيغة التصدير (MP3, WAV, FLAC, OGG).</li>
              <li>نزّل الملف الصوتي النهائي إلى جهازك.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">مميزات الأداة</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'قص الصوت بسهولة عبر الموجة الصوتية',
                'تحديد بداية ونهاية المقطع بدقة',
                'معاينة الصوت قبل التنزيل',
                'تصدير MP3, WAV, FLAC, OGG',
                'معالجة محلية 100% (خصوصية تامة)',
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
            <h2 className="text-2xl font-extrabold mb-3">ابدأ الآن بقص ودمج ملفاتك الصوتية</h2>
            <p className="text-orange-50 leading-8 mb-5 max-w-2xl mx-auto">
              سواء كنت تريد قص أغنية، أو استخراج مقطع من تسجيل، أو دمج عدة ملفات صوتية في ملف واحد، استخدم أداة Intooly لإنجاز تعديلاتك بسهولة من المتصفح.
            </p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">
              ⬆️ العودة إلى الأداة
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول قص الصوت</h2>
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