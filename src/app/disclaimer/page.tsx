import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Shield, FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'إخلاء المسؤولية | intooly',
  description: 'إخلاء مسؤولية منصة intooly. تعرف على حدود استخدام أدواتنا ودقة النتائج.',
  alternates: {
    canonical: 'https://intooly.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  const sections = [
    {
      icon: AlertTriangle,
      title: '1. معلومات عامة',
      content: 'تم إنشاء موقع intooly وأدواته لأغراض معلوماتية وتعليمية وترفيهية فقط. بينما نسعى جاهدين لضمان دقة وحداثة المعلومات والأدوات المقدمة، فإننا لا نقدم أي ضمانات أو تعهدات من أي نوع، صريحة أو ضمنية، بشأن اكتمال أو دقة أو موثوقية أو ملاءمة أو توفر المعلومات أو المنتجات أو الخدمات أو الرسومات المرتبطة بالموقع.'
    },
    {
      icon: Shield,
      title: '2. دقة الأدوات والذكاء الاصطناعي',
      content: 'تستخدم بعض أدواتنا (مثل إزالة الخلفية) تقنيات الذكاء الاصطناعي. بينما تعمل هذه التقنيات بدقة عالية في معظم الحالات، إلا أنها قد لا تكون مثالية بنسبة 100% في جميع الصور أو الفيديوهات. نحن لا نتحمل المسؤولية عن أي أخطاء أو عيوب في النتائج الناتجة عن استخدام هذه الأدوات. يُنصح دائماً بمراجعة النتائج يدوياً قبل استخدامها في مشاريع احترافية.'
    },
    {
      icon: FileText,
      title: '3. مسؤولية المستخدم',
      content: 'أنت تتحمل المسؤولية الكاملة عن استخدامك لأدواتنا والنتائج التي تحصل عليها. يجب عليك التأكد من أن لديك الحق القانوني في تعديل أو معالجة أي ملفات (صور، فيديو، نصوص) تقوم برفعها أو استخدامها عبر موقعنا. نحن لا نتحمل أي مسؤولية عن انتهاكات حقوق الطبع والنشر أو الملكية الفكرية التي قد يرتكبها المستخدمون.'
    },
    {
      icon: AlertTriangle,
      title: '4. الروابط الخارجية',
      content: 'قد يحتوي موقعنا على روابط لمواقع خارجية لا تخضع لسيطرتنا. نحن لا نتحمل أي مسؤولية عن محتوى أو ممارسات الخصوصية أو توفر أي مواقع خارجية. إدراج أي رابط لا يعني بالضرورة تأييدنا للموقع المرتبط. نتشجع بشدة على قراءة شروط الاستخدام وسياسات الخصوصية لأي موقع خارجي تزوره.'
    },
    {
      icon: Shield,
      title: '5. التوفر والاستمرارية',
      content: 'نعمل بجد للحفاظ على عمل الموقع وأدواته على مدار الساعة. ومع ذلك، قد تحدث انقطاعات تقنية أو صيانة دورية قد تؤدي إلى عدم توفر الموقع مؤقتاً. نحن لا نتحمل المسؤولية إذا كان الموقع غير متاح في أي وقت أو لأي فترة زمنية.'
    }
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-full mb-4">
            آخر تحديث: 4 أكتوبر 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            إخلاء <span className="text-amber-500">المسؤولية</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            يرجى قراءة هذا الإخلاء بعناية لفهم حدود استخدامك لأدواتنا وخدماتنا.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {sections.map((section, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 text-center text-white mt-12">
              <h3 className="text-2xl font-bold mb-4">هل لديك أي استفسارات؟</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                إذا كنت بحاجة إلى توضيح أي نقطة في هذا الإخلاء، لا تتردد في التواصل معنا.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
              >
                تواصل معنا
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "إخلاء المسؤولية - intooly",
            "description": "إخلاء مسؤولية منصة intooly.",
            "url": "https://intooly.com/disclaimer",
            "isPartOf": {
              "@type": "WebSite",
              "name": "intooly",
              "url": "https://intooly.com"
            }
          })
        }}
      />
    </div>
  );
}