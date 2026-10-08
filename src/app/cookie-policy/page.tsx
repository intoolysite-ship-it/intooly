import type { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Shield, Info, Settings, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الكوكيز | intooly',
  description: 'تعرف على كيفية استخدام intooly لملفات تعريف الارتباط (Cookies) لتحسين تجربتك.',
  alternates: {
    canonical: 'https://intooly.com/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  const sections = [
    {
      icon: Cookie,
      title: '1. ما هي ملفات تعريف الارتباط (الكوكيز)؟',
      content: 'ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك (كمبيوتر أو هاتف محمول) عند زيارتك لموقعنا. تُستخدم هذه الملفات على نطاق واسع لجعل المواقع تعمل بكفاءة أكبر، وكذلك لتزويد مالكي الموقع بمعلومات حول كيفية استخدام الزوار للموقع.'
    },
    {
      icon: Info,
      title: '2. كيف نستخدم الكوكيز في intooly؟',
      content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. تشمل استخداماتنا:\n• تحليل كيفية تفاعل المستخدمين مع الموقع والأدوات (عبر Google Analytics).\n• تذكر تفضيلاتك الأساسية (مثل إعدادات العرض).\n• ضمان الأمان ومنع الأنشطة الاحتيالية.\nنؤكد لك أن الكوكيز لا تجمع أي بيانات شخصية حساسة ولا تتعقب ملفاتك التي تعالجها عبر أدواتنا.'
    },
    {
      icon: Shield,
      title: '3. أنواع الكوكيز التي نستخدمها',
      content: '• الكوكيز الضرورية: هذه الملفات أساسية لعمل الموقع بشكل صحيح ولا يمكن تعطيلها.\n• كوكيز التحليلات والأداء: تساعدنا على فهم عدد الزوار وكيف يتصفحون الموقع، مما يتيح لنا تحسين الأداء.'
    },
    {
      icon: Settings,
      title: '4. كيفية إدارة أو تعطيل الكوكيز',
      content: 'لديك الحق في قبول أو رفض ملفات تعريف الارتباط. يمكنك التحكم في تفضيلات الكوكيز من خلال إعدادات متصفحك. يرجى ملاحظة أنه إذا اخترت تعطيل بعض أنواع الكوكيز، فقد يؤثر ذلك على تجربتك في استخدام الموقع وبعض ميزاته.'
    },
    {
      icon: Info,
      title: '5. تحديثات سياسة الكوكيز',
      content: 'قد نقوم بتحديث سياسة الكوكيز هذه من وقت لآخر لتعكس التغييرات في التقنيات التي نستخدمها أو المتطلبات القانونية. ننصحك بمراجعة هذه الصفحة بشكل دوري للبقاء على اطلاع.'
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
            سياسة <span className="text-amber-500">الكوكيز</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك. تعرف على التفاصيل هنا.
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
              <h3 className="text-2xl font-bold mb-4">هل لديك أي استفسارات حول الكوكيز؟</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                فريقنا جاهز للإجابة على أي سؤال يتعلق بخصوصيتك وبياناتك.
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
            "name": "سياسة الكوكيز - intooly",
            "description": "تعرف على كيفية استخدام intooly لملفات تعريف الارتباط.",
            "url": "https://intooly.com/cookie-policy",
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