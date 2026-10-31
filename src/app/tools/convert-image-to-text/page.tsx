'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createWorker } from 'tesseract.js';
import {
  ArrowLeft, Upload, Copy, Download, FileText,
  AlertCircle, CheckCircle2, Image as ImageIcon,
  RotateCcw, Languages, ScanText
} from 'lucide-react';

export default function ImageToTextPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState<'ara' | 'eng'>('ara');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('❌ الرجاء اختيار ملف صورة صالح (JPG, PNG, WEBP)');
        return;
      }
      setError('');
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText('');
      setProgress(0);
    }
  };

  const extractText = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError('');
    setExtractedText('');
    setProgress(0);

    try {
      setStatus('جارٍ تهيئة محرك التعرف على النصوص...');
      const worker = await createWorker(language === 'ara' ? 'ara' : 'eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatus(`جارٍ استخراج النص... ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      setStatus('جارٍ تحليل الصورة...');
      const { data: { text } } = await worker.recognize(image);

      setExtractedText(text.trim());
      setStatus('تم استخراج النص بنجاح!');
      await worker.terminate();
    } catch (err) {
      console.error(err);
      setError('❌ حدث خطأ أثناء استخراج النص. يرجى التأكد من وضوح الصورة والمحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert('✅ تم نسخ النص إلى الحافظة');
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([extractedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'extracted-text-intooly.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetTool = () => {
    setImage(null);
    setImagePreview(null);
    setExtractedText('');
    setError('');
    setProgress(0);
    setStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const wordCount = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const charCount = extractedText.length;

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-gradient-to-b from-ink-50 to-white">
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link href="/tools/documents" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" /> جميع أدوات المستندات
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100">
              <ScanText className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink-900 sm:text-3xl md:text-4xl">
                تحويل الصورة إلى نص
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                استخرج النصوص العربية والإنجليزية من الصور مجاناً وبشكل آمن 100% داخل متصفحك باستخدام تقنية OCR المتقدمة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white border border-ink-200 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-8 max-w-5xl mx-auto">
            {!image ? (
              <div className="text-center space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group"
                >
                  <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اسحب الصورة هنا أو انقر للاختيار</h3>
                  <p className="text-xs md:text-sm text-ink-600">يدعم JPG, PNG, WEBP (أقصى حجم 10 ميجابايت)</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-ink-50 border border-ink-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-ink-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-brand-500" /> الصورة المصدر
                      </h3>
                      <button onClick={resetTool} className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> تغيير الصورة
                      </button>
                    </div>
                    <img src={imagePreview!} alt="Preview" className="w-full h-64 object-contain bg-white rounded-xl border border-ink-200" />
                  </div>

                  <div className="bg-white border border-ink-200 rounded-2xl p-4">
                    <label className="text-sm font-bold mb-2 flex items-center gap-2 text-ink-900">
                      <Languages className="w-4 h-4 text-brand-500" /> لغة النص في الصورة
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'ara' | 'eng')}
                      className="w-full p-3 rounded-xl border-2 border-ink-200 focus:border-brand-500 outline-none text-sm font-bold bg-white"
                    >
                      <option value="ara">🇸🇦 العربية</option>
                      <option value="eng">🇬🇧 الإنجليزية</option>
                    </select>

                    {isProcessing ? (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-brand-600">{status}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-ink-200 rounded-full h-2">
                          <div className="bg-brand-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={extractText}
                        className="w-full mt-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ScanText className="w-5 h-5" /> استخراج النص الآن
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-ink-200 rounded-2xl p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-ink-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-500" /> النص المستخرج
                      </h3>
                      {extractedText && (
                        <div className="flex gap-2">
                          <button onClick={copyToClipboard} className="p-2 hover:bg-ink-100 rounded-lg transition" title="نسخ">
                            <Copy className="w-4 h-4 text-ink-600" />
                          </button>
                          <button onClick={downloadText} className="p-2 hover:bg-ink-100 rounded-lg transition" title="تنزيل TXT">
                            <Download className="w-4 h-4 text-ink-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                      </div>
                    )}

                    <textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      placeholder="سيظهر النص المستخرج هنا..."
                      className="flex-1 w-full min-h-[300px] p-4 rounded-xl border-2 border-ink-200 focus:border-brand-500 outline-none text-sm leading-7 resize-none bg-ink-50"
                      dir={language === 'ara' ? 'rtl' : 'ltr'}
                    />

                    {extractedText && (
                      <div className="mt-3 flex items-center justify-between text-xs text-ink-500 bg-ink-50 p-3 rounded-xl">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> تم الاستخراج بنجاح</span>
                        <span>{wordCount} كلمة | {charCount} حرف</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

            <section className="py-12 md:py-16 bg-ink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">تحويل الصورة إلى نص</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              هل تريد <strong>تحويل الصورة إلى نص مكتوب</strong> بدلًا من إعادة كتابة الكلمات يدويًا؟ تساعدك أداة تحويل الصورة إلى نص من Intooly على استخراج النصوص من الصور وتحويلها إلى نص رقمي يمكنك نسخه وتعديله والاستفادة منه في أعمالك اليومية.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تعتمد عملية <strong>استخراج النص من الصور</strong> على تقنية التعرف الضوئي على الحروف (OCR)، التي تحلل الحروف والكلمات الظاهرة في الصورة وتحولها إلى نص قابل للتحرير. ويمكن استخدام هذه التقنية للتعامل مع صور المستندات والكتب والملاحظات والفواتير واللقطات المصورة للشاشات.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              سواء كنت تبحث عن طريقة لـ <strong>تحويل الصورة إلى نص عربي</strong>، أو استخراج النص من صورة باللغة الإنجليزية، أو نسخ فقرة من كتاب مصور، فإن هذه الأداة توفر لك طريقة عملية لتقليل الكتابة اليدوية وتوفير الوقت.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">ما أداة تحويل الصورة إلى نص؟</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              أداة تحويل الصورة إلى نص هي أداة إلكترونية تعتمد على تقنية OCR لاستخراج النص المكتوب داخل الصور وتحويله إلى كلمات رقمية قابلة للنسخ والتحرير.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              بدلًا من كتابة محتويات الصورة حرفًا حرفًا، يمكنك رفع صورة واضحة، ثم تشغيل عملية التعرف على النص للحصول على النتيجة. وبعد ذلك تستطيع مراجعة النص المستخرج وتصحيح الأخطاء المحتملة ونسخه إلى محرر النصوص الذي تستخدمه.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تختلف دقة استخراج النص باختلاف وضوح الصورة وحجم الخط وجودة التصوير ولغة المستند. لذلك يُفضّل استخدام صور واضحة، مع مراجعة النتيجة قبل الاعتماد عليها في المستندات المهمة.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">كيفية تحويل الصورة إلى نص أونلاين</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يمكنك استخدام أداة تحويل الصورة إلى نص من Intooly باتباع الخطوات التالية:
            </p>
            <div className="space-y-4">
              {[
                { step: '1', title: 'افتح الأداة', desc: 'افتح أداة تحويل الصورة إلى نص.' },
                { step: '2', title: 'اختر صورة', desc: 'اختر صورة من جهازك تحتوي على النص الذي تريد استخراجه.' },
                { step: '3', title: 'انتظر المعاينة', desc: 'انتظر حتى تظهر معاينة الصورة وتصبح الأداة جاهزة للمعالجة.' },
                { step: '4', title: 'حدد اللغة', desc: 'حدد لغة النص إذا كان هذا الخيار متاحًا.' },
                { step: '5', title: 'استخرج النص', desc: 'اضغط على زر استخراج النص لبدء عملية التعرف على الحروف والكلمات.' },
                { step: '6', title: 'راجع النص', desc: 'راجع النص المستخرج وصحح أي أخطاء في الأسماء أو الأرقام أو علامات الترقيم.' },
                { step: '7', title: 'انسخ أو نزّل', desc: 'انسخ النص أو نزّله بالصيغة التي تدعمها الأداة.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-ink-200">
                  <div className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-ink-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-base leading-relaxed mt-4 text-ink-700 text-right">
              تعتمد مدة المعالجة على حجم الصورة وأداء جهازك واللغة المختارة. وقد تحتاج الصور الكبيرة أو المستندات ذات الخطوط غير الواضحة إلى وقت أطول.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">تحويل الصورة إلى نص عربي</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يحتاج المستخدم العربي إلى أداة تستطيع التعامل مع الحروف العربية والكلمات المتصلة واتجاه الكتابة من اليمين إلى اليسار. ولهذا نركز في Intooly على توفير تجربة مناسبة لاستخراج النصوص العربية من الصور.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يمكن استخدام OCR العربي لمحاولة استخراج النصوص من صور الكتب والمذكرات الدراسية والمستندات المطبوعة واللافتات والفواتير والوثائق المصورة.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              للحصول على نتيجة أفضل، اختر صورة واضحة وتجنب الظلال القوية والانعكاسات والضبابية. كما يُستحسن التأكد من ترتيب الكلمات والأرقام بعد الاستخراج، لأن بعض محركات OCR قد تواجه صعوبة مع النص العربي المختلط بالأرقام أو الكلمات الإنجليزية.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">تحويل الصورة إلى نص مكتوب قابل للتعديل</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              من أهم فوائد استخراج النص من الصور إمكانية إعادة استخدام المحتوى بدلًا من الاحتفاظ به داخل صورة فقط.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              بعد استخراج النص، يمكنك نسخه إلى محرر نصوص وتعديل الكلمات والفقرات، أو إعادة تنسيقه، أو الاستفادة منه في إعداد الملاحظات والملخصات والمستندات.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تُعد هذه العملية مفيدة للطلاب والباحثين والموظفين وأصحاب الأعمال الذين يتعاملون مع كميات كبيرة من النصوص المطبوعة.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              ومع ذلك، فإن استخراج النص لا يعني استعادة التنسيق الأصلي للصورة بالكامل؛ فقد تحتاج إلى إعادة ترتيب العناوين والجداول والفقرات يدويًا.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">تحويل الصورة إلى نص Word</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              إذا كنت تريد <strong>تحويل الصورة إلى نص Word</strong>، فيمكنك أولًا استخراج الكلمات من الصورة باستخدام OCR، ثم نسخ النص الناتج إلى Microsoft Word أو أي محرر مستندات متوافق.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تساعدك هذه الطريقة على تحويل النصوص الموجودة في الصور إلى محتوى قابل للتعديل، بدلًا من إعادة كتابتها يدويًا.
            </p>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-right text-ink-800">طريقة الاستخدام:</h3>
            <ul className="list-disc list-inside space-y-2 text-ink-700 text-right mb-4 pr-4">
              <li>ارفع الصورة التي تحتوي على النص.</li>
              <li>استخرج النص باستخدام الأداة.</li>
              <li>انسخ النتيجة بعد مراجعتها.</li>
              <li>افتح Word والصق النص.</li>
              <li>عدّل الخطوط والعناوين والفقرات حسب حاجتك.</li>
            </ul>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يجب التمييز بين استخراج النص من الصورة وإنشاء ملف Word قابل للتنزيل؛ فالأول يعتمد على التعرف على الحروف، أما الثاني فيتطلب توفير ميزة تصدير المستند إلى صيغة DOCX إذا أردنا دعم التنزيل المباشر من الأداة.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">استخراج النص من الصور باستخدام OCR</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يشير اختصار OCR إلى Optical Character Recognition، أي التعرف الضوئي على الحروف. وهي تقنية تُستخدم لتحليل النصوص الظاهرة في الصور وتحويلها إلى بيانات نصية.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تمر عملية التعرف على النص عادةً بمراحل تشمل قراءة الصورة، وتحليل أشكال الحروف، والتعرف على الكلمات، ثم إنتاج النص المستخرج.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تختلف النتائج بحسب محرك OCR المستخدم واللغة المدعومة وجودة الصورة. وتكون النتائج عادةً أفضل مع المستندات المطبوعة الواضحة مقارنةً بالكتابة اليدوية أو الصور المائلة أو النصوص منخفضة الدقة.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يمكن الاستفادة من OCR في رقمنة المستندات، واستخراج المعلومات من الصور، والبحث داخل النصوص بعد تحويلها إلى صيغة رقمية، وتقليل الوقت اللازم لإعادة الكتابة.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">تحويل الصورة إلى نص بالذكاء الاصطناعي</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تستخدم تقنيات التعرف على النص نماذج وخوارزميات قادرة على تحليل أشكال الحروف داخل الصور والتعرف على الكلمات.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              وقد تساعد المعالجة المسبقة للصورة، مثل تحسين التباين أو تصحيح الميل، على تحسين النتائج في بعض الحالات. لكن استخدام الذكاء الاصطناعي لا يضمن استخراجًا صحيحًا بنسبة 100%، خصوصًا عندما تكون الصورة مشوشة أو يحتوي النص على خطوط غير مألوفة.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              لذلك ننصح بمراجعة النص بعد استخراجه، لا سيما عند التعامل مع الأرقام أو البيانات المالية أو الأسماء أو المعلومات التي تتطلب دقة عالية.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">ما أنواع الصور التي يمكن تحويلها إلى نص؟</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يمكن الاستفادة من تقنية OCR مع العديد من الصور التي تحتوي على نصوص واضحة، ومنها:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-700 text-right mb-4 pr-4">
              <li>صور الكتب والمراجع المطبوعة.</li>
              <li>صور المذكرات والمحاضرات الدراسية.</li>
              <li>صور الفواتير والمستندات.</li>
              <li>لقطات الشاشة التي تحتوي على نص.</li>
              <li>صور اللافتات والإعلانات.</li>
              <li>الصور التي تحتوي على فقرات باللغة العربية أو الإنجليزية.</li>
            </ul>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يعتمد دعم الصيغ الفعلية على الملفات التي تقبلها الأداة. أما الصور التي تحتوي على كتابة يدوية أو خلفيات مزدحمة أو نص صغير جدًا فقد تحتاج إلى تحسين جودتها قبل المعالجة.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">مميزات أداة تحويل الصورة إلى نص من Intooly</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              صُممت الأداة لتسهيل استخراج النصوص من الصور ضمن تجربة استخدام واضحة وسهلة. ومن الميزات التي نستهدف توفيرها:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'واجهة عربية سهلة', desc: 'واجهة عربية سهلة الاستخدام ومتوافقة مع الهواتف والحواسيب.' },
                { title: 'تقنية OCR', desc: 'استخراج النصوص من الصور باستخدام تقنية التعرف الضوئي.' },
                { title: 'دعم العربية والإنجليزية', desc: 'دعم استخراج النص العربي والإنجليزي من نفس الأداة.' },
                { title: 'معاينة الصورة', desc: 'معاينة الصورة قبل بدء المعالجة للتأكد من وضوحها.' },
                { title: 'نسخ بسهولة', desc: 'نسخ النص المستخرج بضغطة زر واحدة إلى الحافظة.' },
                { title: 'تنزيل TXT', desc: 'تنزيل النتيجة في ملف نصي لاستخدامها في Word والمستندات.' },
                { title: 'حالة المعالجة', desc: 'عرض حالة المعالجة ورسائل الأخطاء بوضوح.' },
                { title: 'معالجة محلية', desc: 'معالجة محلية داخل المتصفح دون رفع الصور إلى خادم خارجي.' },
                { title: 'مجانية', desc: 'إتاحة استخدام الأداة مجانًا وفق حدود التشغيل الفعلية.' }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-ink-200 rounded-2xl p-5 text-right shadow-sm">
                  <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-ink-900">
                    <span className="text-brand-500">✓</span> {item.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">هل تحويل الصورة إلى نص مجاني؟</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تهدف أداة تحويل الصورة إلى نص من Intooly إلى إتاحة استخراج النصوص من الصور <strong>مجانًا</strong>، دون اشتراط الاشتراك في خدمة مدفوعة لاستخدام الوظائف الأساسية.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تختلف تجربة الاستخدام بحسب إمكانات الجهاز وحجم الصورة ومحرك OCR المستخدم. وإذا تمت المعالجة بالكامل داخل المتصفح، فلن تكون هناك حاجة إلى إرسال الصورة إلى خادم لمعالجتها.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">هل يمكن تحويل الصورة إلى نص دون رفعها إلى خادم؟</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              نعم، يمكن بناء أداة OCR تعمل داخل المتصفح باستخدام مكتبات JavaScript وWebAssembly المناسبة. وفي هذه الحالة تُعالج الصورة على جهاز المستخدم بدلًا من إرسال محتواها إلى خادم خارجي.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              يساعد هذا الأسلوب على تقليل الاعتماد على خدمات المعالجة المدفوعة وتعزيز خصوصية الملفات.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">نصائح للحصول على أفضل نتيجة عند استخراج النص من الصور</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              للحصول على نتائج أفضل عند <strong>تحويل الصورة إلى نص عربي</strong> أو إنجليزي، اتبع النصائح التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-700 text-right mb-4 pr-4">
              <li>استخدم صورة واضحة وعالية الدقة قدر الإمكان.</li>
              <li>تأكد من ظهور النص كاملًا دون قص أطراف الكلمات.</li>
              <li>تجنب الظلال والانعكاسات والإضاءة غير المتوازنة.</li>
              <li>اجعل المستند مستقيمًا قدر الإمكان قبل المعالجة.</li>
              <li>استخدم صورًا ذات تباين جيد بين النص والخلفية.</li>
              <li>اختر اللغة المناسبة إذا كانت الأداة توفر اختيار اللغة.</li>
              <li>راجع النص بعد استخراجه، خصوصًا الأرقام والأسماء وعلامات الترقيم.</li>
            </ul>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">الفرق بين تحويل الصورة إلى نص وتحويل PDF إلى نص</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تستهدف أداة تحويل الصورة إلى نص الصور التي تحتوي على كلمات أو حروف، بينما يعتمد استخراج النص من PDF على طبيعة ملف PDF نفسه.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              إذا كان ملف PDF يحتوي على نص رقمي قابل للتحديد والنسخ، فقد يمكن استخراج النص مباشرةً. أما إذا كان الملف عبارة عن صفحات ممسوحة ضوئيًا، فقد يتطلب التعرف على النص استخدام OCR.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              لذلك، إذا كان المصدر صورة منفردة، فإن أداة تحويل الصورة إلى نص هي الخيار المناسب. أما إذا كان المصدر مستند PDF كاملًا، فمن الأفضل استخدام أداة مخصصة لاستخراج النص من PDF.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">استخدم أدوات Intooly ذات الصلة</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              بعد استخراج النص من الصورة، يمكنك الاستفادة من أدوات أخرى بحسب طبيعة عملك، مثل أدوات تحويل الصور وضغطها وتغيير أبعادها. وقد يكون من المفيد تحسين جودة الصورة أو تقليل حجمها قبل مشاركتها أو تخزينها.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <a href="/tools/image-compressor" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-lg">📉</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">ضغط الصور أونلاين</h4>
                  <p className="text-xs text-ink-600">قلّل حجم الصور مع الحفاظ على جودتها.</p>
                </div>
              </a>
              <a href="/tools/image-converter" className="bg-white border border-ink-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-lg">🔄</span>
                </div>
                <div>
                  <h4 className="font-bold text-ink-900">تحويل صيغ الصور</h4>
                  <p className="text-xs text-ink-600">حوّل الصور بين JPG, PNG, WEBP بسهولة.</p>
                </div>
              </a>
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">الخلاصة</h2>
            <p className="text-base leading-relaxed mb-4 text-ink-700 text-right">
              تساعدك أداة تحويل الصورة إلى نص من Intooly على الاستفادة من تقنية OCR لاستخراج الكلمات من الصور وتحويلها إلى نص قابل للنسخ والتعديل. وهي مناسبة للطلاب والموظفين والباحثين وكل من يريد توفير الوقت عند التعامل مع المستندات والصور التي تحتوي على نصوص.
            </p>
            <p className="text-base leading-relaxed text-ink-700 text-right">
              للحصول على أفضل نتيجة، استخدم صورة واضحة وراجع النص المستخرج قبل الاعتماد عليه. فحتى مع تطور تقنيات التعرف على الحروف، تظل جودة الصورة واللغة المستخدمة من العوامل المؤثرة في دقة النتائج.
            </p>
          </article>
        </div>
      </section>
</main>
  );
}