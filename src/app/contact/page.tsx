'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Clock, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ تم وضع مفتاح الوصول الصحيح هنا
  const ACCESS_KEY = 'd5588257-5a8e-4852-9ab5-ad657a8fd39f'; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `رسالة جديدة من intooly: ${formData.subject || 'استفسار عام'}`,
          from_name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-full mb-4">
            نحن هنا لمساعدتك
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            تواصل <span className="text-amber-500">معنا</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            لديك سؤال، اقتراح، أو تواجه مشكلة؟ فريق الدعم لدينا جاهز لمساعدتك والرد عليك في أسرع وقت ممكن.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* معلومات الاتصال (العمود الجانبي) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">معلومات التواصل</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">البريد الإلكتروني</p>
                      <a href="mailto:support@intooly.com" className="text-slate-600 hover:text-amber-600 transition-colors text-sm">
                        support@intooly.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">وقت الاستجابة</p>
                      <p className="text-slate-600 text-sm">نرد عادةً خلال 24 ساعة عمل</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">الموقع</p>
                      <p className="text-slate-600 text-sm">نعمل عن بُعد لخدمتك في أي مكان</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">هل تفضل البريد المباشر؟</h4>
                <p className="text-sm text-amber-100 mb-4">يمكنك مراسلتنا مباشرة على الإيميل وسنقوم بالرد عليك.</p>
                <a 
                  href="mailto:support@intooly.com" 
                  className="inline-flex items-center gap-2 text-sm font-bold bg-white text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  إرسال إيميل مباشر
                </a>
              </div>
            </div>

            {/* نموذج الاتصال */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">أرسل لنا رسالة</h3>

                {status === 'success' ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-green-800 mb-2">تم إرسال رسالتك بنجاح!</h4>
                    <p className="text-green-700 mb-4">شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.</p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="text-green-700 font-semibold hover:underline"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                          الاسم الكامل <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="أدخل اسمك"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                          البريد الإلكتروني <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-slate-50 focus:bg-white"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                        الموضوع
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-slate-50 focus:bg-white"
                        placeholder="مثال: استفسار حول أداة إزالة الخلفية"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                        الرسالة <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                        placeholder="اكتب رسالتك أو استفسارك هنا بالتفصيل..."
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{errorMessage}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          إرسال الرسالة
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
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
            "@type": "ContactPage",
            "name": "اتصل بنا - intooly",
            "description": "تواصل مع فريق دعم intooly.",
            "url": "https://intooly.com/contact",
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