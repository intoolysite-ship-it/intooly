import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Mail, FileText, Cookie, Lock, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | intooly',
  description: 'تعرف على كيفية حماية intooly لبياناتك وخصوصيتك. نحن لا نرفع ملفاتك إلى أي خادم، وجميع المعالجة تتم محلياً على جهازك.',
  alternates: {
    canonical: 'https://intooly.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: '1. مقدمة',
      content: 'مرحباً بك في intooly. نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمعنا للمعلومات، واستخدامنا لها، والخطوات التي نتخذها لضمان أمان بياناتك أثناء استخدامك لموقعنا وأدواتنا.'
    },
    {
      icon: Lock,
      title: '2. المعلومات التي نجمعها (وما لا نجمعه)',
      content: 'نود أن نؤكد بشدة أن intooly منصة تعتمد على المعالجة المحلية (Client-Side Processing). هذا يعني:\n• نحن لا نقوم برفع صور أو فيديوهات أو ملفاتك إلى خوادمنا.\n• جميع عمليات المعالجة (مثل إزالة الخلفية أو ضغط الفيديو) تتم مباشرة داخل متصفحك على جهازك.\n• المعلومات الوحيدة التي قد نجمعها هي بيانات الاستخدام العامة المجهولة المصدر (عبر Google Analytics) لتحسين تجربة المستخدم، ولا تحتوي على أي بيانات شخصية قابلة للتحديد.'
    },
    {
      icon: FileText,
      title: '3. كيفية استخدام المعلومات',
      content: 'أي معلومات عامة نجمعها تُستخدم فقط للأغراض التالية:\n• تحسين أداء الموقع والأدوات.\n• فهم كيفية تفاعل المستخدمين مع المنصة لتطوير ميزات جديدة.\n• ضمان أمان الموقع ومنع الأنشطة الضارة.'
    },
    {
      icon: Cookie,
      title: '4. ملفات تعريف الارتباط (Cookies)',
      content: 'يستخدم موقع intooly ملفات تعريف الارتباط (Cookies) لتحسين تجربتك. تُستخدم هذه الملفات لتذكر تفضيلاتك وتحليل حركة المرور على الموقع عبر خدمات مثل Google Analytics. يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات متصفحك، ولكن قد يؤثر ذلك على بعض وظائف الموقع.'
    },
    {
      icon: Shield,
      title: '5. روابط الطرف الثالث',
      content: 'قد يحتوي موقعنا على روابط لمواقع خارجية. نحن لسنا مسؤولين عن ممارسات الخصوصية أو محتوى هذه المواقع. ننصحك بمراجعة سياسات الخصوصية الخاصة بأي موقع تزوره عبر روابطنا.'
    },
    {
      icon: Lock,
      title: '6. حقوقك في الخصوصية',
      content: 'بما أننا لا نخزن ملفاتك أو بياناتك الشخصية على خوادمنا، فإن خصوصيتك مضمونة بشكل افتراضي. لديك الحق الكامل في معرفة كيفية عمل أدواتنا، ويمكنك التواصل معنا في أي وقت للاستفسار عن أي نقطة تتعلق بهذه السياسة.'
    },
    {
      icon: FileText,
      title: '7. تحديثات سياسة الخصوصية',
      content: 'نحتفظ بالحق في تحديث هذه السياسة من وقت لآخر لتعكس أي تغييرات في ممارساتنا أو متطلبات قانونية جديدة. سيتم نشر أي تعديلات على هذه الصفحة مع تحديث تاريخ "آخر تحديث" في الأعلى.'
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
            سياسة <span className="text-amber-500">الخصوصية</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            خصوصيتك هي أولويتنا القصوى. نلتزم بالشفافية التامة حول كيفية تعاملنا مع بياناتك.
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
              <h3 className="text-2xl font-bold mb-4">هل لديك أي استفسارات حول خصوصيتك؟</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                فريقنا جاهز للإجابة على أي سؤال يتعلق بكيفية حماية بياناتك أو استخدامك لأدواتنا.
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
            "name": "سياسة الخصوصية - intooly",
            "description": "تعرف على كيفية حماية intooly لبياناتك وخصوصيتك.",
            "url": "https://intooly.com/privacy-policy",
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