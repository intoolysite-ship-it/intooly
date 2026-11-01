'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Copy, Trash2, Languages, AlertCircle } from 'lucide-react';

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence?: number;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | undefined {
  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return (
    browserWindow.SpeechRecognition ||
    browserWindow.webkitSpeechRecognition
  );
}

export default function TestSTTPage() {
  const [language, setLanguage] = useState('ar-EG');
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [status, setStatus] = useState('جاهز للاختبار');
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const textRef = useRef('');

  useEffect(() => {
    const available = Boolean(
      getSpeechRecognitionConstructor()
    );
    setSupported(available);

    if (!available) {
      setStatus('المتصفح لا يدعم Web Speech API');
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startRecording = () => {
    const Recognition =
      getSpeechRecognitionConstructor();

    if (!Recognition) {
      setError('هذا المتصفح لا يدعم التعرف على الكلام. جرّب أحدث إصدار من Chrome.');
      return;
    }

    setError('');
    setInterim('');

    try {
      const recognition = new Recognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setRecording(true);
        setStatus('جارٍ الاستماع... تحدث الآن');
      };

      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';

          if (result.isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          textRef.current = [textRef.current, finalText]
            .filter(Boolean)
            .join(' ');
          setText(textRef.current);
        }

        setInterim(interimText);
      };

      recognition.onerror = (event) => {
        const messages: Record<string, string> = {
          'not-allowed': 'تم رفض إذن الميكروفون. اسمح للمتصفح باستخدام الميكروفون.',
          'no-speech': 'لم يتم اكتشاف كلام. حاول التحدث بصوت أوضح.',
          'audio-capture': 'لم يتم العثور على ميكروفون متاح.',
          network: 'حدث خطأ في الاتصال بخدمة التعرف على الكلام.',
          'service-not-allowed': 'خدمة التعرف على الكلام غير متاحة في هذا المتصفح.',
          aborted: 'تم إلغاء التسجيل.',
        };

        const message = messages[event.error] || `حدث خطأ أثناء التسجيل: ${event.error}`;
        setError(message);
        setStatus('تعذر إكمال عملية التعرف');
      };

      recognition.onend = () => {
        setRecording(false);
        setInterim('');
        setStatus('توقف التسجيل');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('تعذر بدء التسجيل');
      setRecording(false);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    setStatus('جارٍ إنهاء التسجيل...');
  };

  const clearText = () => {
    if (recording) {
      recognitionRef.current?.stop();
    }

    textRef.current = '';
    setText('');
    setInterim('');
    setError('');
    setStatus('تم مسح النص؛ جاهز لاختبار جديد');
  };

  const copyText = async () => {
    const value = [text, interim].filter(Boolean).join(' ').trim();

    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setStatus('تم نسخ النص إلى الحافظة');
    } catch {
      setError('تعذر النسخ تلقائيًا. حدّد النص وانسخه يدويًا.');
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Mic size={32} />
          </div>
          <h1 className="text-3xl font-extrabold">اختبار تحويل الكلام إلى نص</h1>
          <p className="mt-3 leading-8 text-slate-600">
            تجربة مستقلة للتعرف على الكلام المباشر بالعربية والإنجليزية قبل بناء أداة Intooly النهائية.
          </p>
          <span className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
            نموذج تجريبي — ليس أداة الإنتاج النهائية
          </span>
        </header>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <label htmlFor="stt-language" className="mb-2 block font-bold">
              لغة التعرف على الكلام
            </label>
            <div className="relative">
              <Languages className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select
                id="stt-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                disabled={recording}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-4 outline-none focus:border-orange-500"
              >
                <option value="ar-EG">العربية — مصر</option>
                <option value="ar-SA">العربية — السعودية</option>
                <option value="en-US">English — United States</option>
                <option value="en-GB">English — United Kingdom</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startRecording}
              disabled={recording || supported === false}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={20} />
              بدء التسجيل
            </button>

            <button
              type="button"
              onClick={stopRecording}
              disabled={!recording}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-4 font-bold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MicOff size={20} />
              إيقاف التسجيل
            </button>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full ${recording ? 'animate-pulse bg-red-500' : 'bg-slate-400'}`} />
              {status}
            </div>
            {supported === false && (
              <p className="mt-2 text-sm leading-7 text-slate-600">
                جرّب فتح الصفحة في أحدث إصدار من Chrome. دعم واجهة التعرف على الكلام يختلف بين المتصفحات والأجهزة.
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <AlertCircle className="mt-1 shrink-0" size={19} />
              <p className="leading-7">{error}</p>
            </div>
          )}

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">النص المتعرف عليه</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyText}
                  disabled={!text && !interim}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                >
                  <Copy size={16} />
                  نسخ
                </button>
                <button
                  type="button"
                  onClick={clearText}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  <Trash2 size={16} />
                  مسح
                </button>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(event) => {
                textRef.current = event.target.value;
                setText(event.target.value);
              }}
              placeholder="سيظهر النص النهائي هنا أثناء التحدث..."
              className="min-h-56 w-full resize-y rounded-xl border border-slate-300 p-4 text-base leading-8 outline-none focus:border-orange-500"
              aria-label="النص الناتج"
            />

            {interim && (
              <div className="mt-3 rounded-xl border border-dashed border-orange-300 bg-orange-50 p-4">
                <p className="mb-1 text-sm font-bold text-orange-800">نص مؤقت قيد التعرف</p>
                <p className="leading-8 text-slate-700">{interim}</p>
              </div>
            )}

            <p className="mt-3 text-sm text-slate-500">
              عدد الكلمات: {text.trim() ? text.trim().split(/\s+/).length : 0}
              {' '}| عدد الأحرف: {text.length}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-8 text-amber-950">
          <h2 className="mb-2 font-bold">ملاحظات مهمة للاختبار</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>قد تحتاج إلى منح المتصفح إذن استخدام الميكروفون.</li>
            <li>قد تعتمد المعالجة على خدمة خارجية يوفرها المتصفح، وقد تتطلب اتصالًا بالإنترنت.</li>
            <li>هذه الصفحة لا ترفع ملفات صوتية إلى خادم Intooly، لكنها لا تضمن أن الصوت يبقى محليًا داخل الجهاز.</li>
            <li>اختبرها بجمل عربية واضحة، ثم بالإنجليزية، ودوّن الأخطاء والتأخير والانقطاعات.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

