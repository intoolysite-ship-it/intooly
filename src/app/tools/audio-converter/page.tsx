'use client';

import Link from 'next/link';
import { Music, ArrowRight, Check } from 'lucide-react';
import AudioConverter from '@/components/audio/AudioConverter';
import { faqQuestions } from './faq-data';

const relatedTools = [
  { title: 'تحويل الفيديو إلى صوت', description: 'استخرج الصوت من ملفات الفيديو.', href: '/tools/video-to-audio', icon: '🎵' },
  { title: 'قص الأغاني', description: 'قص وتقطيع الملفات الصوتية.', href: '/tools/song-cutter', icon: '✂️' },
  { title: 'تحويل صيغ الفيديو', description: 'حوّل صيغ الفيديو بسهولة.', href: '/tools/video-converter', icon: '🎬' },
  { title: 'مولّد QR Code', description: 'أنشئ رمز QR لأي رابط.', href: '/tools/qr-generator', icon: '📱' },
];

export default function AudioConverterPage() {
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500 flex flex-wrap items-center gap-1">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/audio" className="font-medium transition hover:text-orange-600">أدوات الصوت</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">محول الصوتيات</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Music size={16} />
            معالجة محلية 100% - خصوصية تامة
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            تحويل صيغ الصوت أونلاين مجاناً – محول صوتيات
          </h1>
          <p className="mt-4 text-slate-600">
            حوّل ملفاتك الصوتية بين 6 صيغ مختلفة (MP3, WAV, M4A, FLAC, OGG, AAC) بسهولة ومجاناً، مع الحفاظ على الجودة.
          </p>
        </header>

        <section className="mb-10">
          <AudioConverter defaultFormat="mp3" />
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">الصيغ المدعومة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['MP3', 'WAV', 'M4A', 'FLAC', 'OGG', 'AAC'].map((f) => (
              <div key={f} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="font-mono font-bold text-orange-600 text-lg">{f}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="space-y-12 border-t border-slate-200 pt-10">
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هو محول الصوتيات؟</h2>
            <p className="text-slate-700 leading-8">
              <strong>محول الصوتيات</strong> هو أداة تتيح تغيير صيغة ملف صوتي من تنسيق إلى آخر. تعتمد أداة Intooly على تقنية FFmpeg WebAssembly، مما يعني أن جميع عمليات التحويل تتم محلياً داخل متصفحك دون رفع ملفاتك إلى أي خادم.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيفية تحويل صيغة الصوت؟</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 pr-2">
              <li><strong>ارفع ملفك الصوتي:</strong> اضغط على زر "اختيار ملف".</li>
              <li><strong>اختر الصيغة المستهدفة:</strong> من بين MP3, WAV, M4A, FLAC, OGG, AAC.</li>
              <li><strong>اضغط على زر التحويل:</strong> انتظر بضع ثوانٍ.</li>
              <li><strong>نزّل الملف الناتج.</strong></li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">مميزات محول الصوتيات من Intooly</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                'دعم 6 صيغ صوتية شائعة',
                'معالجة محلية 100% (خصوصية تامة)',
                'بدون تسجيل حساب',
                'مجاني بالكامل',
                'لا حدود على عدد التحويلات',
                'يعمل على الهاتف والكمبيوتر',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={18} className="text-green-600 shrink-0 mt-1" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3">جرّب محول الصوتيات الآن</h2>
            <p className="text-orange-50 leading-8 mb-5 max-w-2xl mx-auto">
              حوّل أي ملف صوتي إلى الصيغة التي تريدها، مجاناً وبدون رفع ملفاتك.
            </p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">
              ⬆️ العودة إلى الأداة
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول محول الصوتيات</h2>
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