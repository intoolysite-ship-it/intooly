import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | intooly',
  description: 'شروط وأحكام استخدام منصة intooly. اقرأ بعناية قبل استخدام أدواتنا.',
  alternates: {
    canonical: 'https://intooly.com/terms',
  },
};

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: '1. قبول الشروط',
      content: 'باستخدامك لموقع intooly وأدواته، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام الموقع.'
    },
    {
      icon: CheckCircle,
      title: '2. وصف الخدمة',
      content: 'تقدم intooly مجموعة من الأدوات المجانية لمعالجة الصور والفيديو والنصوص. جميع الأدوات تعمل محلياً في متصفحك (Client-Side) ولا يتم رفع ملفاتك إلى خوادمنا. نحن نحتفظ بالحق في تعديل أو إيقاف أي أداة دون إشعار مسبق.'
    },
    {
      icon: AlertCircle,
      title: '3. قيود الاستخدام',
      content: 'تتعهد باستخدام الموقع للأغراض القانونية فقط. يحظر عليك:\n• استخدام الموقع لأي نشاط غير قانوني أو ضار\n• محاولة اختراق أو تعطيل الموقع أو أدواته\n• استخدام الموقع لنشر محتوى مسيء أو مخالف للآداب العامة\n• إعادة بيع أو استغلال تجاري لأدواتنا دون إذن كتابي'
    },
    {
      icon: FileText,
      title: '4. الملكية الفكرية',
      content: 'جميع المحتويات والعلامات التجارية والشعارات والتصاميم الموجودة على هذا الموقع مملوكة لـ intooly أو مرخصة لنا. لا يجوز لك نسخ أو إعادة نشر أي محتوى دون إذن كتابي مسبق.'
    },
    {
      icon: CheckCircle,
      title: '5. إخلاء المسؤولية',
      content: 'يتم تقديم الموقع والأدوات "كما هي" دون أي ضمانات. نحن لا نضمن أن:\n• الأدوات ستكون متاحة دائماً أو خالية من الأخطاء\n• النتائج ستكون دقيقة 100% في جميع الحالات\n• الموقع سيكون آمناً من الفيروسات أو الأخطاء البرمجية\n\nأنت تتحمل المسؤولية الكاملة عن استخدامك للأدوات والنتائج التي تحصل عليها.'
    },
    {
      icon: AlertCircle,
      title: '6. الحد من المسؤولية',
      content: 'في أقصى الحدود التي يسمح بها القانون، لن تكون intooly مسؤولة عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو تبعية ناتجة عن استخدامك أو عدم قدرتك على استخدام الموقع أو الأدوات.'
    },
    {
      icon: FileText,
      title: '7. التعديلات على الشروط',
      content: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التحديثات على هذه الصفحة مع تحديث تاريخ "آخر تحديث".继续使用ك للموقع بعد التعديلات يعني موافقتك على الشروط المحدثة.'
    },
    {
      icon: CheckCircle,
      title: '8. إنهاء الخدمة',
      content: 'نحتفظ بالحق في تعليق أو إنهاء وصولك إلى الموقع أو أي جزء منه، في أي وقت ودون إشعار مسبق، إذا انتهكت هذه الشروط أو استخدمت الموقع بطريقة غير قانونية.'
    },
    {
      icon: FileText,
      title: '9. القانون الحاكم',
      content: 'تخضع هذه الشروط وتفسر وفقاً للقوانين المعمول بها. أي نزاع ينشأ عن هذه الشروط سيتم حله وفقاً للإجراءات القانونية المعمول بها.'
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
            شروط <span className="text-amber-500">الاستخدام</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            يرجى قراءة هذه الشروط بعناية قبل استخدام موقعنا وأدواتنا.
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
              <h3 className="text-2xl font-bold mb-4">هل لديك أي استفسارات حول الشروط؟</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                فريقنا جاهز للإجابة على أي سؤال يتعلق بشروط استخدام موقعنا.
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
            "name": "شروط الاستخدام - intooly",
            "description": "شروط وأحكام استخدام منصة intooly.",
            "url": "https://intooly.com/terms",
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