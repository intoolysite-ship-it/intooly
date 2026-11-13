import Link from 'next/link';
import {
  Activity,
  Calendar,
  Utensils,
  Percent,
  ArrowLeft,
  Calculator,
  HeartPulse,
  Clock,
  Scale,
  Shuffle,
  History,
} from 'lucide-react';

export const metadata = {
  title: 'حاسبات وأدوات حسابية أونلاين مجانًا | Intooly',
  description: 'مجموعة شاملة من الحاسبات المجانية: مؤشر كتلة الجسم، العمر، السعرات الحرارية، والنسب المئوية. دقيقة، سريعة، وآمنة 100%.',
};

const tools = [
  {
    icon: Calendar,
    title: 'حاسبة العمر الدقيقة',
    description: 'احسب عمرك بالضبط بالسنوات والأشهر والأيام، واكتشف يوم ميلادك القادم والمراحل العمرية المختلفة.',
    href: '/tools/age-calculator',
  },
  {
    icon: Utensils,
    title: 'حاسبة السعرات الحرارية',
    description: 'حدد احتياجك اليومي من السعرات الحرارية للحفاظ على وزنك أو لإنقاصه أو زيادته بشكل صحي وآمن.',
    href: '/tools/calorie-calculator',
  },
  {
    icon: Percent,
    title: 'حاسبة النسبة المئوية',
    description: 'أداة سريعة ودقيقة لحساب النسب المئوية، الزيادة، النقصان، والفرق بين قيمتين بسهولة.',
    href: '/tools/percentage-calculator',
  },
  {
    icon: History,
    title: 'محول التاريخ الهجري والميلادي',
    description: 'حوّل التاريخ من هجري إلى ميلادي أو من ميلادي إلى هجري بدقة (أم القرى) مع اسم اليوم.',
    href: '/tools/hijri-to-gregorian',
  },
  {
    icon: Shuffle,
    title: 'عجلة الحظ',
    description: 'أدر عجلة الحظ لاختيار اسم أو فائز عشوائياً. أضف خياراتك وخصص الألوان والأوزان.',
    href: '/tools/picker-wheel',
  },
];

export default function CalculatorsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-slate-500">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">جميع الأدوات</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">الحاسبات والأدوات الحسابية</span>
        </nav>

        <header className="mb-10 text-right">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
            <Calculator size={16} />
            أدوات حسابية دقيقة ومجانية
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            الحاسبات والأدوات الحسابية أونلاين
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            مجموعة متكاملة من الحاسبات المجانية المصممة لتوفير الوقت والدقة. احسب مؤشر كتلة الجسم، العمر، السعرات الحرارية، والنسب المئوية بسهولة تامة ومن متصفحك مباشرة.
          </p>
        </header>

        <section className="mb-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
                  <tool.icon size={24} />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-orange-600">{tool.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{tool.description}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-orange-600 transition-all group-hover:gap-2">
                  استخدم الأداة <ArrowLeft size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="mt-12 space-y-10 max-w-4xl mx-auto text-right border-t border-slate-200 pt-10">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي الحاسبات والأدوات الحسابية؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              الحاسبات والأدوات الحسابية هي تطبيقات ويب تفاعلية تتيح للمستخدمين إجراء عمليات حسابية متخصصة ومعقدة بضغطة زر، دون الحاجة لمعادلات يدوية أو برامج معقدة. في Intooly، نقدم مجموعة متنوعة من هذه الأدوات التي تغطي جوانب الصحة (مثل حاسبة BMI والسعرات)، والزمن (حاسبة العمر)، والرياضيات اليومية (حاسبة النسب المئوية)، جميعها تعمل بدقة عالية وسرعة فائقة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">لماذا تستخدم حاسبات Intooly أونلاين؟</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <HeartPulse className="mt-1 flex-shrink-0 text-orange-600" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900">دقة وموثوقية</h3>
                  <p className="text-sm text-slate-600">تعتمد جميع حاسباتنا على المعادلات الرياضية والعلمية المعتمدة عالمياً من منظمات مثل الصحة العالمية.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Clock className="mt-1 flex-shrink-0 text-orange-600" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900">سرعة وفورية</h3>
                  <p className="text-sm text-slate-600">احصل على نتائج فورية بمجرد إدخال البيانات، دون انتظار أو معالجة معقدة.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Scale className="mt-1 flex-shrink-0 text-orange-600" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900">خصوصية تامة 100%</h3>
                  <p className="text-sm text-slate-600">تتم جميع العمليات الحسابية محلياً داخل متصفحك. لا يتم إرسال أي بيانات صحية أو شخصية إلى خوادمنا.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Calculator className="mt-1 flex-shrink-0 text-orange-600" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900">مجانية وسهلة الاستخدام</h3>
                  <p className="text-sm text-slate-600">واجهة عربية بسيطة وواضحة، متوافقة مع جميع الأجهزة (هواتف، أجهزة لوحية، وكمبيوتر).</p>
                </div>
              </li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">أدوات Intooly ذات صلة</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/tools/health-fitness" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:bg-orange-50/30">
                <span className="font-bold block mb-1">أدوات الصحة واللياقة البدنية</span>
                <span className="text-sm text-slate-600">اكتشف المزيد من الأدوات الصحية والتغذوية</span>
              </Link>
              <Link href="/tools/productivity" className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:bg-orange-50/30">
                <span className="font-bold block mb-1">أدوات الإنتاجية</span>
                <span className="text-sm text-slate-600">أدوات لتنظيم الوقت وتحسين الكفاءة اليومية</span>
              </Link>
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول الحاسبات والأدوات الحسابية</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "ما هي الحاسبات والأدوات الحسابية المتاحة في Intooly؟", a: "نوفر مجموعة متنوعة من الحاسبات المجانية مثل حاسبة مؤشر كتلة الجسم (BMI)، حاسبة العمر الدقيقة، حاسبة السعرات الحرارية، وحاسبة النسب المئوية، مع دقة عالية وسرعة في النتائج." },
                { q: "هل هذه الحاسبات مجانية تماماً؟", a: "نعم، جميع الحاسبات والأدوات الحسابية في Intooly مجانية تماماً للاستخدام الشخصي والمهني دون أي رسوم مخفية." },
                { q: "هل تحافظون على خصوصية البيانات المدخلة في الحاسبات؟", a: "بالتأكيد. جميع عمليات الحساب تتم محلياً داخل متصفحك. لا يتم إرسال أي بيانات صحية أو شخصية إلى خوادمنا، مما يضمن خصوصيتك بنسبة 100%." },
                { q: "هل يمكن استخدام هذه الحاسبات من الهاتف المحمول؟", a: "نعم، جميع أدواتنا مصممة لتكون متجاوبة تماماً وتعمل بسلاسة على الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر." },
                { q: "هل نتائج حاسبة مؤشر كتلة الجسم (BMI) دقيقة طبياً؟", a: "تعتمد الحاسبة على المعادلات الرياضية المعتمدة عالمياً. ومع ذلك، تُعد هذه النتائج للمعلومات العامة ولا تغني عن استشارة الطبيب المتخصص." }
              ].map((item, i) => (
                <details key={i} className="group rounded-2xl border border-slate-200 bg-white p-4 open:border-orange-200 open:bg-orange-50/30 transition">
                  <summary className="cursor-pointer list-none font-bold text-slate-800 marker:hidden flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-orange-600 transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 leading-7 text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}