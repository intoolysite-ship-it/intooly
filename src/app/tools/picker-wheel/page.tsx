'use client';

import { useEffect, useState } from 'react';
import MultiWheelController from '@/components/picker-wheel/MultiWheelController';

function useShareData() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      if (data) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(data)));
          sessionStorage.setItem('intooly-shared-wheel', JSON.stringify(decoded));
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.warn('فشل قراءة بيانات العجلة المشتركة', e);
        }
      }
      setReady(true);
    }
  }, []);
  return ready;
}

const faqs = [
  { question: 'ما هي عجلة الحظ؟', answer: 'عجلة الحظ هي أداة اختيار عشوائي تتيح لك إضافة أسماء أو أرقام أو خيارات مختلفة، ثم تدوير العجلة لاختيار نتيجة عشوائية.' },
  { question: 'هل عجلة الحظ مجانية؟', answer: 'نعم، يمكنك استخدام عجلة الحظ من Intooly مجاناً وبدون الحاجة إلى إنشاء حساب.' },
  { question: 'هل يمكن استخدام عجلة الحظ لاختيار فائز؟', answer: 'نعم، يمكنك إدخال أسماء المشاركين وتدوير العجلة لاختيار فائز عشوائي، كما يمكن تخصيص أوزان الخيارات.' },
  { question: 'هل يمكن إضافة عدة أسماء إلى عجلة الاختيار؟', answer: 'نعم، يمكنك إضافة الخيارات بشكل فردي أو إدخال قائمة من الأسماء دفعة واحدة.' },
  { question: 'هل يمكن تخصيص ألوان عجلة الحظ؟', answer: 'نعم، يمكنك تخصيص ألوان القطاعات وتعديل الخيارات والأوزان لتناسب استخدامك.' },
  { question: 'هل نتائج عجلة الحظ عشوائية؟', answer: 'تستخدم الأداة مولداً عشوائياً آمناً متاحاً في المتصفح لاختيار النتائج، مع إمكانية تحديد أوزان مختلفة للخيارات.' },
];

const relatedTools = [
  { title: 'مولّد رمز QR', description: 'أنشئ رمز QR لمشاركة رابط المسابقة أو صفحة التسجيل بسهولة.', href: '/tools/qr-generator', icon: '▦' },
  { title: 'حاسبة النسبة المئوية', description: 'احسب النسب المئوية والنتائج والقيم المختلفة بسهولة.', href: '/tools/percentage-calculator', icon: '%' },
  { title: 'عداد الكلمات', description: 'احسب الكلمات والحروف عند إعداد أسئلة المسابقات والتعليمات.', href: '/tools/word-counter', icon: 'Aa' },
  { title: 'حاسبة العمر', description: 'احسب العمر اعتماداً على تاريخ الميلاد.', href: '/tools/age-calculator', icon: '◷' },
  { title: 'حاسبة مؤشر كتلة الجسم', description: 'احسب مؤشر كتلة الجسم BMI باستخدام الطول والوزن.', href: '/tools/bmi-calculator', icon: '⚖' },
];

export default function PickerWheelPage() {
  const ready = useShareData();

  if (!ready) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">جاري التحميل...</div>
      </main>
    );
  }

  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-slate-500">
          <a href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</a>
          <span className="mx-2">/</span>
          <a href="/tools/productivity" className="font-medium transition hover:text-orange-600">أدوات الإنتاجية</a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">عجلة الحظ</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            ✦ أداة اختيار عشوائي مجانية
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            عجلة الحظ أونلاين مجاناً – عجلة اختيار الأسماء والفائزين
          </h1>
          <p className="mt-4 text-slate-600">
            أدر عجلة الحظ واختر اسماً أو رقماً أو فائزاً عشوائياً بسهولة. أضف خياراتك وخصص الألوان والأوزان واترك العجلة تختار لك.
          </p>
        </header>

        <div className="mb-10">
          <MultiWheelController />
        </div>

        <article className="space-y-12">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">عجلة الحظ أون لاين مجاناً – عجلة اختيار الأسماء والفائزين</h2>
            <div className="space-y-4 text-base leading-9 text-slate-600">
              <p>هل تحتار بين عدة اختيارات ولا تعرف أيها تختار؟ هل تريد اختيار اسم فائز في مسابقة أو إجراء قرعة بين مجموعة من المشاركين؟ استخدم <strong className="text-slate-800">عجلة الحظ المجانية من Intooly</strong> لتحويل الاختيار إلى تجربة سهلة وممتعة.</p>
              <p>عجلة الحظ هي أداة اختيار عشوائي تتيح لك إدخال الأسماء والأرقام والخيارات التي تريد المفاضلة بينها، ثم تدوير العجلة للحصول على نتيجة عشوائية. بدلاً من الاختيار اليدوي أو إجراء القرعة بطريقة تقليدية، يمكنك إدخال جميع الخيارات وترك عجلة الاختيار العشوائي تحدد النتيجة.</p>
              <p>تتيح لك الأداة إضافة الخيارات وتعديلها وحذفها، وإدخال قائمة كاملة من الأسماء دفعة واحدة، وتغيير ألوان قطاعات العجلة، وتحديد وزن مختلف لكل خيار للتحكم في احتمالية ظهوره.</p>
              <p>يمكنك استخدام عجلة الحظ أون لاين مباشرة من المتصفح دون تنزيل برنامج أو إنشاء حساب. تتم عملية الاختيار داخل المتصفح باستخدام مولد الأرقام العشوائية الآمن الذي يوفره المتصفح.</p>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">ما هي عجلة الحظ وكيف تعمل؟</h2>
            <div className="space-y-4 text-base leading-9 text-slate-600">
              <p>عجلة الحظ أو عجلة الاختيار العشوائي هي أداة تفاعلية تتكون من دائرة مقسمة إلى قطاعات، يمثل كل قطاع اسماً أو رقماً أو اختياراً مختلفاً.</p>
              <p>عندما تضغط على زر تدوير العجلة، تبدأ القطاعات في الدوران ثم تتباطأ تدريجياً حتى تتوقف عند أحد الخيارات. ويعرض الخيار الذي يشير إليه المؤشر باعتباره نتيجة الدوران.</p>
              <p>تعتمد الأداة على حساب زوايا القطاعات وفق أوزان الخيارات، ثم تحديد موضع التوقف والتحقق من أن القطاع الموجود تحت المؤشر يطابق النتيجة التي تظهر للمستخدم.</p>
              <p>يمكن استخدام عجلة الأسماء العشوائية في اختيار الفائزين، وتنظيم المسابقات، وتحديد المشاركين، والأنشطة التعليمية، واتخاذ القرارات اليومية البسيطة.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-orange-100 bg-orange-50/50 p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">كيفية استخدام عجلة الحظ المجانية</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { number: '01', title: 'أدخل الخيارات', description: 'اكتب اسم كل مشارك أو خيار، أو أدخل قائمة كاملة بحيث يكون كل خيار في سطر مستقل.' },
                { number: '02', title: 'عدّل الخيارات', description: 'غيّر أسماء الخيارات أو احذف الخيارات غير المطلوبة، واحتفظ بخيارين على الأقل.' },
                { number: '03', title: 'خصص الألوان والأوزان', description: 'اختر لوناً لكل قطاع، وحدد الوزن المناسب لكل خيار حسب احتمالية ظهوره التي تريدها.' },
                { number: '04', title: 'أدر العجلة', description: 'اضغط على زر أدر العجلة وانتظر حتى يتوقف الدوران وتظهر نتيجة الاختيار.' },
              ].map((step) => (
                <div key={step.number} className="rounded-2xl border border-orange-100 bg-white p-5">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-extrabold text-orange-700">{step.number}</span>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-8 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">أهم مميزات عجلة الحظ من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'اختيار عشوائي للأسماء', description: 'أضف أسماء المشاركين وأدر العجلة لاختيار اسم عشوائي بدلاً من الاختيار اليدوي.' },
                { title: 'إضافة قائمة كاملة', description: 'أدخل عدة أسماء أو خيارات دفعة واحدة، بحيث يكون كل خيار في سطر مستقل.' },
                { title: 'تعديل الخيارات وحذفها', description: 'يمكنك تعديل اسم أي خيار أو حذفه بسهولة مع الاحتفاظ بخيارين على الأقل.' },
                { title: 'تخصيص ألوان القطاعات', description: 'غيّر لون كل قطاع بشكل مستقل حتى تتمكن من تمييز الخيارات المختلفة.' },
                { title: 'أوزان مخصصة للاختيارات', description: 'حدد وزناً مختلفاً لكل خيار للتحكم في مساحة القطاع واحتمالية ظهوره.' },
                { title: 'دوران سلس ومتدرج', description: 'تتحرك العجلة بسرعة ثم تتباطأ تدريجياً حتى تصل إلى موضع التوقف.' },
                { title: 'التحقق من النتيجة', description: 'تتحقق الأداة من أن الخيار المعروض هو القطاع الموجود فعلياً تحت المؤشر.' },
                { title: 'عداد مرات الفوز', description: 'تابع عدد مرات فوز كل خيار عند استخدام العجلة في عمليات اختيار متكررة.' },
                { title: 'مجانية وبدون تسجيل', description: 'استخدم عجلة الحظ مباشرة من المتصفح دون إنشاء حساب أو تثبيت برنامج.' },
              ].map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-600">✓</div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-extrabold text-slate-900">استخدامات عجلة الحظ – ماذا يمكنك أن تختار؟</h2>
            <div className="space-y-6">
              {[
                { title: 'عجلة اختيار الفائز في المسابقات', description: 'أدخل أسماء المشاركين المؤهلين في المسابقة، ثم أدر العجلة لاختيار اسم عشوائي.' },
                { title: 'عجلة أسماء الطلاب في الفصل', description: 'يمكن للمعلمين إدخال أسماء الطلاب واستخدام عجلة الأسماء لاختيار طالب للمشاركة.' },
                { title: 'عجلة نعم أو لا', description: 'أنشئ عجلة تحتوي على خيارين هما نعم ولا للحصول على اختيار عشوائي.' },
                { title: 'عجلة الأرقام العشوائية', description: 'أدخل مجموعة من الأرقام واستخدم عجلة اختيار الأرقام لتحديد رقم عشوائي.' },
                { title: 'عجلة اختيار الطعام', description: 'أضف الأطعمة التي تفضلها ودع العجلة تساعدك على اختيار وجبة اليوم.' },
                { title: 'عجلة اتخاذ القرار', description: 'عندما تتردد بين عدة خيارات يومية بسيطة، يمكنك إدخالها في العجلة وترك الاختيار العشوائي يساعدك.' },
                { title: 'عجلة الألعاب والتحديات', description: 'أدخل أسماء التحديات أو المهام المختلفة، ثم أدر العجلة لتحديد النشاط التالي.' },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-base leading-8 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="mb-3 text-2xl font-extrabold sm:text-3xl">جرّب عجلة الحظ المجانية الآن</h2>
            <p className="mx-auto mb-6 max-w-2xl text-orange-50 leading-8">سواء كنت تريد اختيار اسم عشوائي أو تحديد فائز في مسابقة أو اختيار رقم أو حسم قرار يومي، يمكنك استخدام عجلة الحظ من Intooly مباشرة.</p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">⬆️ العودة إلى عجلة الحظ</a>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول عجلة الحظ</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-orange-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                    <span>{faq.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool) => (
                <a key={tool.href} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl font-extrabold text-orange-600 transition group-hover:bg-orange-100">{tool.icon}</div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-orange-700">{tool.title}</h3>
                  <p className="text-sm leading-7 text-slate-500">{tool.description}</p>
                  <span className="mt-4 inline-block text-sm font-bold text-orange-600">استخدام الأداة ←</span>
                </a>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}