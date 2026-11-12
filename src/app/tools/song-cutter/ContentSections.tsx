"use client";
import Link from "next/link";
import { faqQuestions } from "./faq-data";

const SUPPORTED_FORMATS = [
  { ext: "MP3", desc: "الأكثر شيوعاً", lossy: "مضغوط" },
  { ext: "WAV", desc: "جودة غير مضغوطة", lossy: "بدون فقدان" },
  { ext: "M4A", desc: "مناسب لآيفون", lossy: "مضغوط" },
  { ext: "AAC", desc: "كفاءة عالية", lossy: "مضغوط" },
  { ext: "OGG", desc: "مفتوح المصدر", lossy: "مضغوط" },
  { ext: "FLAC", desc: "بدون فقدان", lossy: "بدون فقدان" },
];

const RELATED_TOOLS = [
  { href: "/tools/audio", title: "أدوات الصوت", desc: "مجموعة أدوات الصوت والفيديو" },
  { href: "/tools/video-to-audio", title: "تحويل الفيديو إلى صوت", desc: "استخراج الصوت من الفيديو" },
  { href: "/tools/audio-to-text", title: "تحويل الصوت إلى نص", desc: "نسخ التسجيلات الصوتية" },
  { href: "/tools/video-trimmer", title: "قص الفيديو", desc: "تقطيع مقاطع الفيديو" },
];

export default function ContentSections() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 text-right" dir="rtl">

      {/* ============ المقدمة ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          قص الاغاني أونلاين مجانًا – قص ملفات MP3 وتقطيع الموسيقى بسهولة
        </h2>
        <p className="leading-8 text-slate-600">
          استخدم أداة <strong>قص الاغاني</strong> من Intooly لقص ملفات MP3 وتحديد الجزء الذي تريده من أي ملف صوتي بسهولة ودقة. اختر المقطع المناسب من بداية الأغنية أو منتصفها أو نهايتها، وحدد وقت البداية والنهاية، ثم استمع إلى الجزء المحدد قبل تنزيله. سواء كنت تريد استخراج مقطع موسيقي مفضل، أو تجهيز نغمة رنين لهاتفك، أو تقطيع ملف صوتي طويل إلى جزء قصير، توفر لك الأداة طريقة سهلة لقص الاغاني أونلاين دون الحاجة إلى تثبيت برامج معقدة.
        </p>
        <p className="leading-8 text-slate-600 mt-3">
          تساعدك أداة قص الاغاني MP3 على تحديد المقطع الذي تحتاج إليه والتحكم في مدته، مع واجهة استخدام بسيطة تدعم العمل من الكمبيوتر والهاتف. يمكنك استخدام الأداة لقص الموسيقى والمقاطع الصوتية والتسجيلات، وإنشاء ملفات صوتية قصيرة تناسب احتياجاتك اليومية.
        </p>
      </section>

      {/* ============ ما هي الأداة ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          ما هي أداة قص الاغاني من Intooly؟
        </h2>
        <p className="leading-8 text-slate-600">
          أداة قص الاغاني من Intooly هي أداة مجانية عبر الإنترنت تتيح لك تقطيع الأغاني وملفات الصوت واستخراج أجزاء محددة منها. بدلًا من استخدام برنامج تحرير صوت احترافي لمجرد حذف بداية أغنية أو استخراج مقطع من منتصفها، يمكنك استخدام الأداة مباشرة من المتصفح وتحديد الجزء المطلوب بسهولة.
        </p>
        <p className="leading-8 text-slate-600 mt-3">
          تساعدك الأداة على قص الأغاني الطويلة، واستخراج المقاطع المفضلة، وتحديد بداية ونهاية المقطع بالوقت، ومعاينة النتيجة قبل حفظها. وهي مناسبة للمستخدمين الذين يبحثون عن طريقة سريعة لقص الأغاني MP3 أو تقطيع الموسيقى أو إعداد مقطع صوتي قصير.
        </p>
        <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3">من أهم استخدامات أداة قص الاغاني:</h3>
        <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-600 pr-2">
          <li>قص جزء محدد من أغنية MP3.</li>
          <li>تقطيع الأغاني واستخراج المقطع المفضل.</li>
          <li>حذف الأجزاء غير المطلوبة من التسجيلات الصوتية.</li>
          <li>قص بداية الأغنية أو نهايتها.</li>
          <li>استخراج مقطع موسيقي قصير.</li>
          <li>تجهيز مقطع صوتي لاستخدامه كنغمة رنين.</li>
          <li>تقطيع الملفات الصوتية الطويلة إلى مقاطع أقصر.</li>
          <li>معاينة الجزء المحدد قبل تنزيله.</li>
        </ul>
      </section>

      {/* ============ مميزات الأداة ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          مميزات أداة قص الاغاني أونلاين
        </h2>
        <p className="leading-8 text-slate-600 mb-4">
          صممنا أداة قص الاغاني لتسهيل عملية تقطيع الملفات الصوتية دون الحاجة إلى خبرة سابقة في تحرير الصوت. ومن الميزات الأساسية التي ينبغي أن توفرها الأداة:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">1. قص الاغاني MP3 بسهولة</h3>
            <p className="leading-8 text-slate-600 mt-1">يمكنك تحديد الجزء الذي تريد الاحتفاظ به من ملف MP3، سواء كان مقطعًا من بداية الأغنية أو من منتصفها أو من نهايتها، ثم قصه وحفظه كملف صوتي مستقل.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">2. تحديد بداية ونهاية المقطع</h3>
            <p className="leading-8 text-slate-600 mt-1">تحكم في وقت بداية القص ووقت النهاية باستخدام أدوات التحديد، حتى تتمكن من استخراج الجزء الذي تريده دون الحاجة إلى الاحتفاظ بالملف الصوتي كاملًا.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">3. عرض الموجة الصوتية Waveform</h3>
            <p className="leading-8 text-slate-600 mt-1">يساعدك عرض الموجة الصوتية على رؤية توزيع الصوت داخل الملف، والتعرف بصريًا على المقاطع المرتفعة والمنخفضة، مما يسهل تحديد الجزء المناسب للقص.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">4. معاينة المقطع قبل القص</h3>
            <p className="leading-8 text-slate-600 mt-1">استمع إلى الجزء الذي حددته قبل تنزيله، وتأكد من أن بداية المقطع ونهايته مناسبتان لما تريده. تساعدك المعاينة على تجنب قص جزء غير صحيح.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">5. قص الموسيقى لإنشاء نغمة رنين</h3>
            <p className="leading-8 text-slate-600 mt-1">استخرج الجزء المفضل من أغنيتك واستخدمه لإعداد نغمة رنين قصيرة لهاتفك. يمكنك اختيار مدة جاهزة (15 أو 30 أو 40 ثانية) وإضافة تلاشي تدريجي.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">6. واجهة سهلة الاستخدام</h3>
            <p className="leading-8 text-slate-600 mt-1">لا تحتاج إلى خبرة في برامج المونتاج أو تحرير الصوت. اختر الملف، وحدد الجزء المطلوب، واستمع إلى النتيجة، ثم احفظ المقطع.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">7. استخدام الأداة من الهاتف والكمبيوتر</h3>
            <p className="leading-8 text-slate-600 mt-1">يمكن استخدام أداة قص الاغاني من متصفح الهاتف أو الكمبيوتر أو الجهاز اللوحي، مع واجهة متوافقة مع الشاشات المختلفة.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">8. تنزيل المقطع بعد القص</h3>
            <p className="leading-8 text-slate-600 mt-1">بعد تحديد الجزء المطلوب ومعاينته، يمكنك حفظ الملف الصوتي الناتج على جهازك لاستخدامه لاحقًا، بصيغة MP3 عالية الجودة.</p>
          </div>
        </div>
      </section>

      {/* ============ كيفية الاستخدام ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          كيفية قص الاغاني MP3 أونلاين؟
        </h2>
        <p className="leading-8 text-slate-600 mb-4">يمكنك تقطيع الأغاني باستخدام أداة Intooly في خطوات بسيطة:</p>
        <ol className="list-decimal list-inside space-y-2 leading-8 text-slate-600 pr-2">
          <li><strong>اختر ملف الأغنية:</strong> افتح أداة قص الاغاني، ثم اختر ملف MP3 من جهازك.</li>
          <li><strong>انتظر تحميل الملف:</strong> سيظهر الملف داخل واجهة الأداة مع الموجة الصوتية عند اكتمال التحميل.</li>
          <li><strong>حدد بداية المقطع:</strong> اختر النقطة التي تريد أن يبدأ منها الجزء الصوتي.</li>
          <li><strong>حدد نهاية المقطع:</strong> اختر النقطة التي تريد أن ينتهي عندها القص.</li>
          <li><strong>استمع إلى المقطع:</strong> شغّل الجزء المحدد للتأكد من أن الاختيار صحيح.</li>
          <li><strong>نفذ عملية القص:</strong> اضغط على زر القص لبدء معالجة المقطع.</li>
          <li><strong>احفظ الملف:</strong> نزّل المقطع الصوتي الناتج إلى جهازك.</li>
        </ol>

        {/* صورة توضيحية - TODO */}
        <figure className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {/* TODO: ضع الصورة في public/og/song-cutter-ui.png ثم استبدل هذا التعليق بـ:
          <Image src="/og/song-cutter-ui.png" alt="شرح استخدام أداة قص الاغاني MP3 من Intooly" width={1200} height={630} className="rounded-xl w-full h-auto" />
          */}
          <div className="flex items-center justify-center h-48 rounded-xl bg-slate-100 text-slate-400 text-sm">
            📷 [صورة توضيحية لواجهة الأداة - تُضاف لاحقاً]
          </div>
          <figcaption className="mt-3 text-center text-xs text-slate-500">
            شرح استخدام أداة قص الاغاني MP3 من Intooly
          </figcaption>
        </figure>
      </section>

      {/* ============ نغمة رنين ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          قص الاغاني MP3 لإنشاء نغمة رنين للهاتف
        </h2>
        <p className="leading-8 text-slate-600">
          إذا كنت تريد استخدام جزء معين من أغنية كنغمة رنين، يمكنك الاستفادة من أداة قص الاغاني لاستخراج المقطع الذي يعجبك بدلًا من استخدام الأغنية كاملة.
        </p>
        <p className="leading-8 text-slate-600 mt-3">
          على سبيل المثال، يمكنك اختيار بداية اللحن أو المقطع الموسيقي المميز أو الجزء الذي تفضله، ثم تحديد مدته وقصه وحفظه لاستخدامه على هاتفك. ولجعل الأداة أكثر فائدة، يمكنك الاستفادة من:
        </p>
        <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-600 mt-3 pr-2">
          <li>تحديد مدة جاهزة للمقطع (15 أو 30 أو 40 ثانية).</li>
          <li>اختيار بداية ونهاية نغمة الرنين.</li>
          <li>إضافة ظهور تدريجي للصوت (Fade In).</li>
          <li>إضافة اختفاء تدريجي للصوت (Fade Out).</li>
          <li>تصدير MP3 لهواتف Android.</li>
        </ul>
      </section>

      {/* ============ الفرق ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          ما الفرق بين قص الاغاني وتقطيع الصوت؟
        </h2>
        <p className="leading-8 text-slate-600">
          يشير مصطلح قص الاغاني غالبًا إلى استخراج جزء محدد من أغنية أو مقطع موسيقي، بينما يشمل تقطيع الصوت نطاقًا أوسع من الملفات الصوتية، مثل التسجيلات الصوتية والمحاضرات والبودكاست والمقابلات والملفات الموسيقية.
        </p>
        <p className="leading-8 text-slate-600 mt-3">
          يمكن استخدام أداة قص الاغاني في الحالتين؛ فهي مفيدة لاستخراج مقطع من أغنية، كما يمكن الاستفادة منها في قص جزء من تسجيل صوتي أو ملف MP3 طويل.
        </p>
        <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3">مصطلحات قريبة من هذه العملية:</h3>
        <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-600 pr-2">
          <li><strong>قص الاغاني:</strong> استخراج جزء من أغنية.</li>
          <li><strong>تقطيع الأغاني:</strong> تقسيم الأغنية إلى أجزاء.</li>
          <li><strong>قص الصوت:</strong> استخراج جزء من أي ملف صوتي.</li>
          <li><strong>قص MP3:</strong> تقطيع ملف بصيغة MP3.</li>
          <li><strong>Audio Trimmer:</strong> أداة تشذيب الملفات الصوتية.</li>
          <li><strong>MP3 Cutter:</strong> أداة قص ملفات MP3.</li>
          <li><strong>Audio Cutter:</strong> أداة قص الصوت.</li>
          <li><strong>Music Cutter:</strong> أداة تقطيع الموسيقى.</li>
          <li><strong>Ringtone Maker:</strong> أداة إنشاء نغمات الرنين.</li>
        </ul>
      </section>

      {/* ============ لمن تناسب ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          لمن تناسب أداة قص الاغاني؟
        </h2>
        <p className="leading-8 text-slate-600 mb-3">تساعد الأداة فئات مختلفة من المستخدمين، ومن أبرز استخداماتها:</p>
        <ul className="list-disc list-inside space-y-1.5 leading-8 text-slate-600 pr-2">
          <li><strong>محبو الموسيقى:</strong> لاستخراج المقاطع المفضلة من الأغاني.</li>
          <li><strong>مستخدمو الهواتف:</strong> لإنشاء نغمات رنين قصيرة.</li>
          <li><strong>صناع المحتوى:</strong> لاستخراج مقاطع صوتية قصيرة للمشروعات والمحتوى المسموح باستخدامه.</li>
          <li><strong>الطلاب:</strong> لتقطيع التسجيلات والمحاضرات إلى أجزاء يسهل الرجوع إليها.</li>
          <li><strong>مقدمو البودكاست:</strong> لاستخراج مقاطع محددة من التسجيلات الطويلة.</li>
          <li><strong>المستخدمون العاديون:</strong> لحذف أجزاء غير مرغوبة من الملفات الصوتية.</li>
        </ul>
      </section>

      {/* ============ الصيغ المدعومة ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          الصيغ الصوتية المدعومة
        </h2>
        <p className="leading-8 text-slate-600 mb-4">
          تدعم الأداة أشهر صيغ الملفات الصوتية، ويمكنك قص ملفات MP3 وWAV وM4A وAAC وOGG وFLAC مباشرة من متصفحك:
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-right font-bold">الصيغة</th>
                <th className="px-4 py-3 text-right font-bold">الوصف</th>
                <th className="px-4 py-3 text-right font-bold">نوع الضغط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SUPPORTED_FORMATS.map((f) => (
                <tr key={f.ext} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-orange-600">{f.ext}</td>
                  <td className="px-4 py-3 text-slate-600">{f.desc}</td>
                  <td className="px-4 py-3 text-slate-500">{f.lossy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============ لماذا Intooly ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          لماذا تستخدم قص الاغاني من Intooly؟
        </h2>
        <p className="leading-8 text-slate-600">
          توفر Intooly مجموعة من الأدوات المجانية عبر الإنترنت التي تساعدك على إنجاز المهام اليومية بسهولة. وتأتي أداة قص الاغاني لتسهيل تقطيع ملفات MP3 واستخراج المقاطع الصوتية دون الحاجة إلى تعلم برامج تحرير احترافية.
        </p>
        <p className="leading-8 text-slate-600 mt-3">
          يمكنك الوصول إلى الأداة من المتصفح، واختيار الملف من جهازك، وتحديد الجزء الذي تحتاج إليه، ثم حفظ النتيجة. تتم المعالجة بالكامل داخل متصفحك دون رفع ملفاتك إلى أي خادم، مما يضمن خصوصية تامة وسرعة في الأداء.
        </p>
      </section>

      {/* ============ نصائح ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          نصائح للحصول على أفضل نتيجة عند قص الأغاني
        </h2>
        <ul className="list-disc list-inside space-y-2 leading-8 text-slate-600 pr-2">
          <li>استمع إلى الأغنية قبل تحديد الجزء الذي تريد قصه.</li>
          <li>اختر بداية المقطع بعد بداية النغمة أو الكلمة التي تريد الاحتفاظ بها.</li>
          <li>تجنب إنهاء المقطع قبل اكتمال الكلمة أو اللحن.</li>
          <li>استخدم المعاينة أكثر من مرة للتأكد من النتيجة.</li>
          <li>إذا كنت تنشئ نغمة رنين، اختر مقطعًا قصيرًا ومميزًا.</li>
          <li>احتفظ بنسخة من الملف الأصلي قبل إجراء أي تعديلات.</li>
          <li>تأكد من امتلاك حق استخدام الملف الصوتي أو الحصول على إذن صاحبه عند الحاجة.</li>
        </ul>
      </section>

      {/* ============ FAQ ============ */}
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
          الأسئلة الشائعة حول قص الاغاني
        </h2>
        <div className="mt-4 space-y-3">
          {faqQuestions.map((item, i) => (
            <details key={i} className="rounded-2xl border border-slate-200 bg-white p-4 group">
              <summary className="cursor-pointer font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                {item.q}
              </summary>
              <p className="mt-3 text-slate-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ أدوات ذات صلة ============ */}
      <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
        <h2 className="text-xl font-extrabold text-orange-900 mb-4">أدوات Intooly ذات صلة</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {RELATED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-400 hover:shadow-md"
            >
              <span className="font-bold block mb-1 text-slate-900">{tool.title}</span>
              <span className="text-sm text-slate-600">{tool.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ ابدأ الآن ============ */}
      <section className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-center text-white">
        <h2 className="text-2xl font-extrabold mb-3">ابدأ الآن في قص الاغاني أونلاين</h2>
        <p className="leading-8 text-orange-50 mb-5 max-w-2xl mx-auto">
          لا تحتاج إلى برنامج معقد لاستخراج الجزء الذي تريده من أغنيتك. افتح أداة قص الاغاني من Intooly، واختر ملف MP3، وحدد المقطع الذي تفضله، ثم استمع إليه واحفظ النتيجة.
        </p>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-colors shadow-lg"
        >
          ⬆️ العودة إلى الأداة
        </a>
      </section>

    </div>
  );
}
