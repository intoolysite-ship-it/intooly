import WheelController from '@/components/picker-wheel/WheelController';
import Link from 'next/link';
import {
  ArrowLeft, Shuffle, Users, Trophy, Hash, Utensils,
  Sparkles, Target, Gamepad2, Check, QrCode, Percent,
  Type, Calendar, Scale, Music, Layers
} from 'lucide-react';

const faqs = [
  { question: 'ما هي عجلة الحظ؟', answer: 'عجلة الحظ هي أداة اختيار عشوائي تتيح لك إضافة أسماء أو أرقام أو خيارات مختلفة، ثم تدوير العجلة لاختيار نتيجة عشوائية.' },
  { question: 'هل عجلة الحظ مجانية؟', answer: 'نعم، يمكنك استخدام عجلة الحظ من Intooly مجاناً وبدون الحاجة إلى إنشاء حساب.' },
  { question: 'هل يمكن استخدام عجلة الحظ لاختيار فائز؟', answer: 'نعم، يمكنك إدخال أسماء المشاركين وتدوير العجلة لاختيار فائز عشوائي، كما يمكن تخصيص أوزان الخيارات.' },
  { question: 'هل يمكن إضافة عدة أسماء إلى عجلة الاختيار؟', answer: 'نعم، يمكنك إضافة الخيارات بشكل فردي أو إدخال قائمة من الأسماء دفعة واحدة.' },
  { question: 'هل يمكن تخصيص ألوان عجلة الحظ؟', answer: 'نعم، يمكنك تخصيص ألوان القطاعات وتعديل الخيارات والأوزان لتناسب استخدامك.' },
  { question: 'هل نتائج عجلة الحظ عشوائية؟', answer: 'تستخدم الأداة مولداً عشوائياً آمناً متاحاً في المتصفح لاختيار النتائج، مع إمكانية تحديد أوزان مختلفة للخيارات.' },
];

const relatedTools = [
  { title: 'مولّد رمز QR', description: 'أنشئ رمز QR لمشاركة رابط المسابقة أو صفحة التسجيل بسهولة.', href: '/tools/qr-generator', icon: QrCode },
  { title: 'حاسبة النسبة المئوية', description: 'احسب النسب المئوية والنتائج والقيم المختلفة بسهولة.', href: '/tools/percentage-calculator', icon: Percent },
  { title: 'عداد الكلمات', description: 'احسب الكلمات والحروف عند إعداد أسئلة المسابقات والتعليمات.', href: '/tools/word-counter', icon: Type },
  { title: 'حاسبة العمر', description: 'احسب العمر اعتماداً على تاريخ الميلاد.', href: '/tools/age-calculator', icon: Calendar },
  { title: 'حاسبة مؤشر كتلة الجسم', description: 'احسب مؤشر كتلة الجسم BMI باستخدام الطول والوزن.', href: '/tools/bmi-calculator', icon: Scale },
];

const useCases = [
  { title: 'عجلة اختيار الفائز في المسابقات', description: 'أدخل أسماء المشاركين المؤهلين في المسابقة، ثم أدر العجلة لاختيار اسم عشوائي. تساعدك عجلة اختيار الفائز على تنظيم عملية السحب وعرض نتيجتها بصورة واضحة.', icon: Trophy },
  { title: 'عجلة أسماء الطلاب في الفصل', description: 'يمكن للمعلمين إدخال أسماء الطلاب واستخدام عجلة الأسماء لاختيار طالب للمشاركة في الإجابة عن سؤال أو تنفيذ نشاط تعليمي.', icon: Users },
  { title: 'عجلة نعم أو لا', description: 'أنشئ عجلة تحتوي على خيارين هما نعم ولا، ثم أدرها للحصول على اختيار عشوائي في الألعاب والتحديات والقرارات اليومية البسيطة.', icon: Target },
  { title: 'عجلة الأرقام العشوائية', description: 'أدخل مجموعة من الأرقام واستخدم عجلة اختيار الأرقام لتحديد رقم عشوائي من القائمة التي أعددتها.', icon: Hash },
  { title: 'عجلة اختيار الطعام', description: 'أضف الأطعمة التي تفضلها مثل البيتزا والبرجر والشاورما والمكرونة، ودع العجلة تساعدك على اختيار وجبة اليوم.', icon: Utensils },
  { title: 'عجلة اتخاذ القرار', description: 'عندما تتردد بين عدة خيارات يومية بسيطة، يمكنك إدخالها في العجلة وترك الاختيار العشوائي يساعدك على حسم القرار.', icon: Sparkles },
  { title: 'عجلة الألعاب والتحديات', description: 'أدخل أسماء التحديات أو المهام المختلفة، ثم أدر العجلة لتحديد النشاط التالي في اللعبة.', icon: Gamepad2 },
];

const features = [
  { title: 'اختيار عشوائي للأسماء', description: 'أضف أسماء المشاركين وأدر العجلة لاختيار اسم عشوائي بدلاً من الاختيار اليدوي.' },
  { title: 'إضافة قائمة كاملة', description: 'أدخل عدة أسماء أو خيارات دفعة واحدة، بحيث يكون كل خيار في سطر مستقل.' },
  { title: 'تعديل الخيارات وحذفها', description: 'يمكنك تعديل اسم أي خيار أو حذفه بسهولة مع الاحتفاظ بخيارين على الأقل.' },
  { title: 'تخصيص ألوان القطاعات', description: 'غيّر لون كل قطاع بشكل مستقل حتى تتمكن من تمييز الخيارات المختلفة.' },
  { title: 'أوزان مخصصة للاختيارات', description: 'حدد وزناً مختلفاً لكل خيار للتحكم في مساحة القطاع واحتمالية ظهوره.' },
  { title: 'دوران سلس ومتدرج', description: 'تتحرك العجلة بسرعة ثم تتباطأ تدريجياً حتى تصل إلى موضع التوقف.' },
  { title: 'التحقق من النتيجة', description: 'تتحقق الأداة من أن الخيار المعروض هو القطاع الموجود فعلياً تحت المؤشر.' },
  { title: 'عداد مرات الفوز', description: 'تابع عدد مرات فوز كل خيار عند استخدام العجلة في عمليات اختيار متكررة.' },
  { title: 'مجانية وبدون تسجيل', description: 'استخدم عجلة الحظ مباشرة من المتصفح دون إنشاء حساب أو تثبيت برنامج.' },
];

export default function PickerWheelPage() {
  return (
    <main id="top" dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ============ Breadcrumb + Header ============ */}
        <nav className="mb-5 text-sm text-slate-500">
          <a href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</a>
          <span className="mx-2">/</span>
          <a href="/tools/productivity" className="font-medium transition hover:text-orange-600">أدوات الإنتاجية</a>
          <span className="mx-2">/</span>
          <span className="text-slate-700">عجلة الحظ</span>
        </nav>

        <header className="mb-8 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Shuffle size={16} />
            أداة اختيار عشوائي مجانية
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
            عجلة الحظ أونلاين مجاناً – عجلة اختيار الأسماء والفائزين
          </h1>
          <p className="mt-4 text-slate-600">
            أدر عجلة الحظ واختر اسماً أو رقماً أو فائزاً عشوائياً بسهولة. أضف خياراتك وخصص الألوان والأوزان واترك العجلة تختار لك.
          </p>
        </header>

        {/* ============ الأداة ============ */}
        <section className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <WheelController />
        </section>

        {/* ============ المحتوى النصي ============ */}
        <article className="space-y-12">

          {/* 1. المقدمة */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">عجلة الحظ أون لاين مجاناً – عجلة اختيار الأسماء والفائزين</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>هل تحتار بين عدة اختيارات ولا تعرف أيها تختار؟ هل تريد اختيار اسم فائز في مسابقة أو إجراء قرعة بين مجموعة من المشاركين؟ استخدم <strong>عجلة الحظ المجانية من Intooly</strong> لتحويل الاختيار إلى تجربة سهلة وممتعة.</p>
              <p>عجلة الحظ هي أداة اختيار عشوائي تتيح لك إدخال الأسماء والأرقام والخيارات التي تريد المفاضلة بينها، ثم تدوير العجلة للحصول على نتيجة عشوائية. بدلاً من الاختيار اليدوي أو إجراء القرعة بطريقة تقليدية، يمكنك إدخال جميع الخيارات وترك عجلة الاختيار العشوائي تحدد النتيجة.</p>
              <p>تتيح لك الأداة إضافة الخيارات وتعديلها وحذفها، وإدخال قائمة كاملة من الأسماء دفعة واحدة، وتغيير ألوان قطاعات العجلة، وتحديد وزن مختلف لكل خيار للتحكم في احتمالية ظهوره.</p>
              <p>يمكنك استخدام عجلة الحظ أون لاين مباشرة من المتصفح دون تنزيل برنامج أو إنشاء حساب. تتم عملية الاختيار داخل المتصفح باستخدام مولد الأرقام العشوائية الآمن الذي يوفره المتصفح.</p>
            </div>
          </section>

          {/* 2. ما هي */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">ما هي عجلة الحظ وكيف تعمل؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>عجلة الحظ أو عجلة الاختيار العشوائي هي أداة تفاعلية تتكون من دائرة مقسمة إلى قطاعات، يمثل كل قطاع اسماً أو رقماً أو اختياراً مختلفاً.</p>
              <p>عندما تضغط على زر تدوير العجلة، تبدأ القطاعات في الدوران ثم تتباطأ تدريجياً حتى تتوقف عند أحد الخيارات. ويعرض الخيار الذي يشير إليه المؤشر باعتباره نتيجة الدوران.</p>
              <p>تعتمد الأداة على حساب زوايا القطاعات وفق أوزان الخيارات، ثم تحديد موضع التوقف والتحقق من أن القطاع الموجود تحت المؤشر يطابق النتيجة التي تظهر للمستخدم.</p>
              <p>يمكن استخدام عجلة الأسماء العشوائية في اختيار الفائزين، وتنظيم المسابقات، وتحديد المشاركين، والأنشطة التعليمية، واتخاذ القرارات اليومية البسيطة.</p>
            </div>
          </section>

          {/* 3. كيفية الاستخدام */}
          <section className="rounded-3xl border border-orange-100 bg-orange-50/50 p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">كيفية استخدام عجلة الحظ المجانية</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { number: '01', title: 'أدخل الخيارات', description: 'اكتب اسم كل مشارك أو خيار، أو أدخل قائمة كاملة بحيث يكون كل خيار في سطر مستقل.' },
                { number: '02', title: 'عدّل الخيارات', description: 'غيّر أسماء الخيارات أو احذف الخيارات غير المطلوبة، واحتفظ بخيارين على الأقل.' },
                { number: '03', title: 'خصص الألوان والأوزان', description: 'اختر لوناً لكل قطاع، وحدد الوزن المناسب لكل خيار حسب احتمالية ظهوره التي تريدها.' },
                { number: '04', title: 'أدر العجلة', description: 'اضغط على زر أدر العجلة وانتظر حتى يتوقف الدوران وتظهر نتيجة الاختيار.' },
              ].map((step) => (
                <div key={step.number} className="rounded-2xl border border-orange-100 bg-white p-5">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-sm font-extrabold text-orange-700">{step.number}</span>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. المميزات */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أهم مميزات عجلة الحظ من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. الاستخدامات */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">استخدامات عجلة الحظ – ماذا يمكنك أن تختار؟</h2>
            <div className="space-y-5">
              {useCases.map((u, i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <u.icon size={22} />
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-slate-900">{u.title}</h3>
                    <p className="text-sm leading-7 text-slate-600">{u.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. الأوزان */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">كيف تعمل الأوزان في عجلة الاختيار العشوائي؟</h2>
            <div className="space-y-3 text-slate-700 leading-8 mb-5">
              <p>الوزن هو قيمة رقمية تحدد الحصة النسبية للخيار من إجمالي أوزان جميع الخيارات. وكلما زاد وزن الخيار، زادت مساحة القطاع الخاص به وارتفعت احتمالية اختياره.</p>
              <p>على سبيل المثال، إذا كانت لديك ثلاثة خيارات بالأوزان التالية: الخيار الأول وزنه 1، والخيار الثاني وزنه 2، والخيار الثالث وزنه 3، فإن مجموع الأوزان يساوي 6.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="grid grid-cols-3 bg-slate-100 p-3 text-center text-sm font-bold text-slate-700">
                <span>الخيار</span><span>الوزن</span><span>الاحتمال النظري</span>
              </div>
              {[['الأول','1','16.67%'],['الثاني','2','33.33%'],['الثالث','3','50%']].map((row, i) => (
                <div key={i} className="grid grid-cols-3 border-t border-slate-100 p-3 text-center text-sm text-slate-600">
                  <span>{row[0]}</span><span>{row[1]}</span><span className="font-bold text-orange-700">{row[2]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-500">هذه النسب احتمالات نظرية عند إجراء سحب واحد وفق الأوزان المحددة، ولا تعني ضمان ظهور خيار معين بعد عدد محدد من المحاولات. إذا أردت فرصاً متساوية، اترك وزن جميع الخيارات عند القيمة الافتراضية 1.</p>
          </section>

          {/* 7. العشوائية */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل عجلة الحظ عشوائية بالفعل؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>تستخدم عجلة الحظ من Intooly واجهة العشوائية الآمنة المتاحة في المتصفح، وهي <code dir="ltr" className="mx-1 rounded bg-slate-100 px-2 py-1 text-sm text-orange-700">crypto.getRandomValues</code> لتوليد القيم العشوائية المستخدمة في تحديد القطاع الفائز.</p>
              <p>بعد تحديد القطاع، تحسب الأداة زاوية التوقف داخله، ثم تتحقق عند انتهاء الدوران من أن القطاع الموجود تحت المؤشر هو نفسه الخيار الذي تم تحديده.</p>
              <p>يساعد ذلك على ربط النتيجة المعروضة بالحركة الفعلية للعجلة. ومع ذلك، فإن استخدام مولد عشوائي آمن لا يجعل الأداة خدمة تدقيق مستقلة أو نظاماً معتمداً للمسابقات الرسمية.</p>
            </div>
          </section>

          {/* 8. الأمان */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">هل عجلة الحظ مجانية وآمنة؟</h2>
            <div className="space-y-3 text-slate-700 leading-8">
              <p>يمكنك استخدام عجلة الحظ مجاناً من خلال متصفحك، دون الحاجة إلى إنشاء حساب أو تنزيل برنامج. تتم معالجة عملية الاختيار محلياً داخل المتصفح، ولا تحتاج وظيفة تدوير العجلة إلى إرسال قائمة الأسماء إلى خادم خارجي.</p>
              <p>ننصح بعدم إدخال معلومات شخصية حساسة أو بيانات لا تحتاج إليها عند استخدام أي أداة اختيار عشوائي على الإنترنت.</p>
              <p>إذا كنت تنظم مسابقة ذات جوائز عالية القيمة أو تخضع لشروط رسمية، فاحرص على اتباع قواعد المسابقة ومتطلبات التوثيق والتدقيق المناسبة، ولا تعتمد على العجلة وحدها باعتبارها جهة اعتماد مستقلة.</p>
            </div>
          </section>

          {/* 9. أونلاين vs تطبيق */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">عجلة الحظ أون لاين أم تطبيق عجلة الحظ؟</h2>
            <p className="text-slate-700 leading-8">إذا كنت تريد إجراء اختيار سريع دون تثبيت تطبيق جديد، فإن عجلة الحظ أون لاين خيار عملي. يمكنك فتح الأداة مباشرة من متصفح الهاتف أو الكمبيوتر، وإضافة الخيارات ثم تدوير العجلة. توفر لك Intooly طريقة مباشرة لاستخدام الاختيار العشوائي دون الحاجة إلى تثبيت برنامج مستقل.</p>
          </section>

          {/* 10. نصائح */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">نصائح للحصول على أفضل نتيجة عند استخدام عجلة الحظ</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-8 marker:font-bold marker:text-orange-600">
              <li>تأكد من إدخال جميع الخيارات المطلوبة قبل بدء الدوران.</li>
              <li>راجع الأسماء وتأكد من عدم وجود أخطاء إملائية.</li>
              <li>استخدم الأوزان المتساوية إذا كنت تريد احتمالات متساوية.</li>
              <li>لا تغيّر الأوزان إلا إذا كنت تقصد تغيير احتمالات الاختيار.</li>
              <li>استخدم ألواناً مختلفة لتسهيل تمييز القطاعات.</li>
              <li>عند إجراء مسابقة، حدد شروط المشاركة والفوز قبل بدء السحب.</li>
              <li>لا تستخدم الاختيار العشوائي بديلاً عن الإجراءات الرسمية في القرارات عالية الأهمية.</li>
            </ol>
          </section>

          {/* 11. CTA */}
          <section className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-3 sm:text-3xl">جرّب عجلة الحظ المجانية الآن</h2>
            <p className="mx-auto mb-6 max-w-2xl text-orange-50 leading-8">سواء كنت تريد اختيار اسم عشوائي أو تحديد فائز في مسابقة أو اختيار رقم أو حسم قرار يومي، يمكنك استخدام عجلة الحظ من Intooly مباشرة. أضف خياراتك وخصص الألوان والأوزان، ثم ابدأ الدوران.</p>
            <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 transition hover:bg-orange-50">
              ⬆️ العودة إلى عجلة الحظ
            </a>
          </section>

          {/* 12. FAQ */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">الأسئلة الشائعة حول عجلة الحظ</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-orange-200 open:bg-orange-50/30" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900 marker:hidden">
                    <span>{faq.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-8 text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 13. أدوات ذات صلة */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">أدوات ذات صلة من Intooly</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool, i) => (
                <Link key={i} href={tool.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                    <tool.icon size={22} />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900 transition group-hover:text-orange-700">{tool.title}</h3>
                  <p className="text-sm leading-7 text-slate-500">{tool.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600">استخدام الأداة <ArrowLeft size={14} /></span>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/tools/productivity" className="inline-flex items-center gap-1 font-bold text-orange-600 transition hover:text-orange-700">
                اكتشف جميع أدوات الإنتاجية <ArrowLeft size={14} />
              </Link>
            </div>
          </section>

        </article>
      </div>
    </main>
  );
}
