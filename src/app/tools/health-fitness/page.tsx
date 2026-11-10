import Link from "next/link";
import { Activity , Baby } from "lucide-react";

const tools = [
  
  {
    icon: Baby,
    title: 'حاسبة الحمل',
    description: 'احسبي عمر الحمل بالأسابيع والأيام، وموعد الولادة المتوقع بالتقويم الهجري والميلادي بدقة.',
    href: '/tools/pregnancy-calculator',
  },{
    icon: Activity,
    title: "حاسبة مؤشر كتلة الجسم BMI",
    description: "احسب مؤشر كتلة الجسم مجانًا مع نطاق الوزن الصحي وBMI Prime وسجل الحسابات.",
    href: "/tools/bmi-calculator",
    status: "متاح",
  },
];

export default function HealthFitnessPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="مسار التنقل" className="mb-5 text-sm text-slate-500">
          <Link href="/tools" className="font-medium transition hover:text-orange-600">الأدوات</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">الصحة واللياقة البدنية</span>
        </nav>

        <header className="mb-8 text-right">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            أدوات الصحة واللياقة البدنية أونلاين مجانًا
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            اكتشف مجموعة أدوات الصحة واللياقة البدنية المجانية من Intooly، واستخدم حاسبات صحية وأدوات حسابية تساعدك على فهم مؤشرات الجسم ومتابعة الوزن والتعرف على بعض القياسات المرتبطة بالتغذية واللياقة البدنية. نوفر لك أدوات سهلة الاستخدام تعمل مباشرة عبر المتصفح، دون الحاجة إلى تثبيت برامج أو إنشاء حساب.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">أفضل أدوات الصحة واللياقة البدنية من Intooly</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-orange-400 hover:bg-orange-50 hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-orange-600 group-hover:bg-orange-200">
                  <tool.icon size={24} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{tool.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{tool.description}</p>
                <span className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {tool.status}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-8 text-right">
          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">ما هي أدوات الصحة واللياقة البدنية؟</h2>
            <p className="mt-3 leading-8 text-slate-600">
              أدوات الصحة واللياقة البدنية هي مجموعة من الحاسبات والأدوات الرقمية التي تساعد المستخدمين على إجراء حسابات متعلقة بوزن الجسم والطول والتغذية والنشاط البدني وبعض المؤشرات الصحية.
              <br /><br />
              تتضمن هذه الأدوات حاسبات مؤشر كتلة الجسم (BMI)، والوزن المثالي، والسعرات الحرارية، ومعدل الأيض الأساسي، واحتياجات الجسم اليومية من الماء، وغيرها من الأدوات التي يمكن الاستفادة منها في متابعة الأهداف الصحية والرياضية.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">كيف تساعدك حاسبات الصحة واللياقة البدنية؟</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 leading-8 text-slate-600">
              <li>معرفة مؤشر كتلة الجسم وتصنيف الوزن.</li>
              <li>تقدير نطاق الوزن الصحي المرتبط بالطول.</li>
              <li>حساب السعرات الحرارية اليومية التقديرية.</li>
              <li>تقدير معدل الأيض الأساسي وفهم احتياجات الجسم من الطاقة.</li>
              <li>متابعة التغيرات في الوزن بمرور الوقت.</li>
              <li>الحصول على نتائج حسابية بطريقة سهلة دون إجراء المعادلات يدويًا.</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">
              تساعد هذه الأدوات على تنظيم المعلومات وإجراء الحسابات الأولية، لكنها لا تُعد بديلًا عن التقييم الطبي أو الاستشارة المتخصصة.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">مميزات أدوات الصحة واللياقة البدنية من Intooly</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: "مجانية وسهلة الاستخدام", desc: "استخدم الأدوات المتاحة دون اشتراك مدفوع." },
                { title: "نتائج سريعة", desc: "احصل على نتائج الحسابات مباشرة بعد إدخال البيانات." },
                { title: "بدون تثبيت برامج", desc: "تعمل الأدوات مباشرة من متصفح الإنترنت." },
                { title: "متوافقة مع جميع الأجهزة", desc: "استخدم الحاسبات من الهاتف أو الكمبيوتر." },
                { title: "واجهة عربية واضحة", desc: "تجربة استخدام مناسبة للمتحدثين باللغة العربية." },
                { title: "الخصوصية التامة", desc: "تعمل الحسابات محليًا داخل المتصفح دون إرسال البيانات إلى خادم." },
              ].map((feature, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl font-extrabold text-slate-900">الأسئلة الشائعة حول الصحة واللياقة البدنية</h2>
            <div className="mt-4 space-y-4">
              {[
                { q: "ما المقصود بأدوات الصحة واللياقة البدنية؟", a: "هي مجموعة من الأدوات والحاسبات الرقمية التي تساعد على إجراء حسابات متعلقة بوزن الجسم والطول والتغذية والسعرات الحرارية وبعض مؤشرات اللياقة البدنية." },
                { q: "هل أدوات الصحة واللياقة البدنية مجانية؟", a: "نعم، يمكنك استخدام الأدوات المجانية المتاحة في تصنيف الصحة واللياقة البدنية من Intooly مباشرة عبر المتصفح، دون الحاجة إلى تثبيت برامج." },
                { q: "كيف أحسب مؤشر كتلة الجسم؟", a: "يتم حساب مؤشر كتلة الجسم بقسمة الوزن بالكيلوجرام على مربع الطول بالمتر. ويمكنك استخدام حاسبة مؤشر كتلة الجسم للحصول على النتيجة وتصنيفها تلقائيًا." },
                { q: "ما الفرق بين BMI وBMR؟", a: "BMI هو مؤشر كتلة الجسم الذي يوضح العلاقة بين الوزن والطول، بينما BMR هو معدل الأيض الأساسي الذي يقدر الطاقة التي يحتاج إليها الجسم لأداء وظائفه الأساسية أثناء الراحة." },
                { q: "هل تغني الحاسبات الصحية عن زيارة الطبيب؟", a: "لا، أدوات الصحة واللياقة البدنية مخصصة للحسابات والتوعية العامة، ولا تغني عن الفحص الطبي أو استشارة الطبيب أو أخصائي التغذية." },
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

          <article className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <h2 className="text-xl font-extrabold text-orange-900 mb-3">تنبيه صحي هام</h2>
            <p className="text-sm leading-8 text-orange-800">
              المعلومات والنتائج التي تقدمها هذه الأدوات مخصصة للتوعية والحسابات التقديرية، ولا تمثل تشخيصًا طبيًا أو توصية علاجية، ولا تغني عن استشارة المختصين الصحيين.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
