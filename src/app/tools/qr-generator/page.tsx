'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, 
  Sparkles, Loader2, AlertCircle, CheckCircle2,
  QrCode, Download, Shield, Zap, Globe, Smartphone,
  ChevronDown, RefreshCw

} from 'lucide-react';

import QRPreview from '@/components/qr-generator/QRPreview';
import QRTypeSelector from '@/components/qr-generator/QRTypeSelector';
import DynamicForm from '@/components/qr-generator/DynamicForm';
import StylingPanel from '@/components/qr-generator/StylingPanel';
import ExportPanel from '@/components/qr-generator/ExportPanel';
import SavedPanel from '@/components/qr-generator/SavedPanel';

import { 
  QR_TYPES, 
  QR_CONFIG, 
  QR_MESSAGES,
  DEFAULT_QR_STATE,
  type QRType,
  type ErrorCorrectionLevel 
} from '@/lib/qr-generator/constants';
import type { 
  QRData, 
  QRSettings, 
  SavedQR,
  ToolStatus 
} from '@/lib/qr-generator/types';
import { validateContent } from '@/lib/qr-generator/generators';
import { buildQRContent } from '@/lib/qr-generator/generators';

export default function QrGeneratorPage() {
  // ============================================
  // الحالة
  // ============================================
  const [type, setType] = useState<QRType>('link');
  const [data, setData] = useState<QRData>({});
  const [settings, setSettings] = useState<QRSettings>({
    size: QR_CONFIG.DEFAULT_SIZE,
    margin: QR_CONFIG.DEFAULT_MARGIN,
    foreground: QR_CONFIG.DEFAULT_FOREGROUND,
    background: QR_CONFIG.DEFAULT_BACKGROUND,
    errorCorrection: QR_CONFIG.DEFAULT_ERROR_CORRECTION,
  });
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  // ============================================
  // Toast
  // ============================================
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  }, []);

  // ============================================
  // تغيير النوع
  // ============================================
  const handleTypeChange = useCallback((newType: QRType) => {
    setType(newType);
    setData({});
    setError(null);
    setStatus('idle');
  }, []);

  // ============================================
  // تغيير البيانات
  // ============================================
  const handleDataChange = useCallback((newData: QRData) => {
    setData(newData);
    setError(null);
  }, []);

  // ============================================
  // استرجاع QR محفوظ
  // ============================================
  const handleRestore = useCallback((record: SavedQR) => {
    setType(record.type);
    setData(record.data);
    showToast('تم استرجاع QR', 'success');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showToast]);

  // ============================================
  // إعادة تعيين
  // ============================================
  const handleReset = useCallback(() => {
    setType('link');
    setData({});
    setSettings({
      size: QR_CONFIG.DEFAULT_SIZE,
      margin: QR_CONFIG.DEFAULT_MARGIN,
      foreground: QR_CONFIG.DEFAULT_FOREGROUND,
      background: QR_CONFIG.DEFAULT_BACKGROUND,
      errorCorrection: QR_CONFIG.DEFAULT_ERROR_CORRECTION,
    });
    setError(null);
    setStatus('idle');
    showToast('تمت إعادة التعيين', 'info');
  }, [showToast]);

  // ============================================
  // التحقق من الصحة
  // ============================================
  const content = buildQRContent(type, data);
  const validationError = validateContent(type, data);
  const hasContent = content.trim().length > 0;
  const isValid = !validationError && hasContent;

  // ============================================
  // واجهة المستخدم
  // ============================================
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900" dir="rtl">
      
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold shadow-2xl z-[100] max-w-lg text-center transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'info' ? 'bg-ink-800 text-white' :
          'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-ink-100 shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #1f2937 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />

        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <Link
            href="/tools/productivity"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            جميع أدوات الإنتاجية
          </Link>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="icon-glow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 sm:h-12 sm:w-12">
              <QrCode className="h-5 w-5 text-brand-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-ink-900 sm:text-xl md:text-2xl lg:text-3xl">
                مولّد QR Code
              </h1>
              <p className="mt-2 text-sm leading-7 text-brand-700 sm:text-base">
                أنشئ رمز QR مخصص لمطعمك، متجرك، شركتك، أو أي استخدام — 14 نوع QR، تخصيص كامل، رابط دائم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '🎯', title: '14 نوع QR', desc: 'روابط، Wi-Fi، vCard، مطاعم' },
              { icon: '🎨', title: 'تخصيص كامل', desc: 'ألوان، حجم، شعار' },
              { icon: '💾', title: 'رابط دائم', desc: 'محفوظ سحابياً' },
              { icon: '🔒', title: 'مجاني 100%', desc: 'بدون تسجيل' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-ink-200 rounded-xl p-3 md:p-4 text-center shadow-sm">
                <div className="text-2xl md:text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-xs md:text-sm mb-0.5 text-ink-900">{f.title}</h3>
                <p className="text-[10px] md:text-xs text-ink-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MAIN TOOL ===== */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* اختيار النوع */}
          <div className="mb-4">
            <QRTypeSelector
              value={type}
              onChange={handleTypeChange}
            />
          </div>

          {/* التخطيط: النموذج + المعاينة */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* العمود الأيسر: النموذج */}
            <div className="lg:col-span-2 space-y-4">
              <DynamicForm
                type={type}
                data={data}
                onChange={handleDataChange}
              />

              <StylingPanel
                settings={settings}
                onChange={setSettings}
              />
            </div>

            {/* العمود الأيمن: المعاينة + التصدير */}
            <div className="space-y-4">
              {/* رسالة الخطأ */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-bold">{error}</p>
                </div>
              )}

              {/* المعاينة */}
              <QRPreview
                type={type}
                data={data}
                settings={settings}
                size="md"
                showActions={false}
              />

              {/* معلومات التحقق */}
              {!hasContent && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-bold">
                    ابدأ بإدخال البيانات لعرض QR
                  </p>
                </div>
              )}

              {hasContent && validationError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-bold">
                    {validationError}
                  </p>
                </div>
              )}

              {isValid && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700 font-bold">
                    ✅ QR جاهز للتصدير
                  </p>
                </div>
              )}

              {/* التصدير */}
              {isValid && (
                <ExportPanel
                  type={type}
                  data={data}
                  settings={settings}
                />
              )}

              {/* إعادة تعيين */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* QR المحفوظة */}
          <div className="mt-6">
            <SavedPanel onRestore={handleRestore} />
          </div>

        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* المقدمة */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هو مولّد QR Code؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              <strong>مولّد QR Code</strong> من Intooly هو أداة مجانية لإنشاء رموز QR احترافية. يمكنك تحويل الروابط والنصوص والبيانات إلى رمز قابل للمسح بكاميرا الهاتف، مع تخصيص كامل للألوان والحجم، وإمكانية إضافة رابط دائم محفوظ على الخادم.
            </p>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              تستخدم الأداة تقنية <strong>مكتبة qrcode</strong> لتوليد الرموز محلياً في المتصفح، مع دعم <strong>رابط دائم</strong> محفوظ على Cloudflare. هذا يعني أن QR يعمل من أي جهاز، ويمكنك العودة إليه لاحقاً.
            </p>
          </article>

          {/* كيفية الإنشاء */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيفية إنشاء QR Code
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'اختر نوع QR', desc: 'اختر من 14 نوع: رابط، نص، Wi-Fi، vCard، مطعم، متجر، شركة، أو أي استخدام.' },
                { num: 2, title: 'أدخل البيانات', desc: 'أدخل المعلومات المطلوبة حسب النوع — سيتم عرض QR مباشرة.' },
                { num: 3, title: 'خصّص التصميم', desc: 'غيّر الألوان، الحجم، الهوامش، ومستوى تصحيح الأخطاء.' },
                { num: 4, title: 'حمّل أو شارك', desc: 'حمّل QR بصيغة PNG أو SVG، أو أنشئ رابطاً دائماً للمشاركة.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-extrabold flex items-center justify-center shadow-lg">
                    {step.num}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-extrabold text-base mb-1 text-ink-900">{step.title}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* الاستخدامات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أهم استخدامات QR Code
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '🍽️', title: 'المطاعم', desc: 'قائمة طعام رقمية، حجز طاولة، طلب توصيل' },
                { icon: '🛍️', title: 'المتاجر', desc: 'صفحة منتج، كتالوج، عروض' },
                { icon: '🏢', title: 'الشركات', desc: 'بطاقة عمل رقمية، معلومات التواصل' },
                { icon: '🎉', title: 'الفعاليات', desc: 'دعوات، تسجيل، جدول الفعالية' },
                { icon: '📚', title: 'التعليم', desc: 'دروس، اختبارات، ملفات تعليمية' },
                { icon: '📶', title: 'Wi-Fi', desc: 'مشاركة شبكة، كلمة المرور' },
                { icon: '💚', title: 'واتساب', desc: 'محادثة مباشرة، رسالة جاهزة' },
                { icon: '📍', title: 'المواقع', desc: 'مشاركة موقع على الخريطة' },
              ].map((use, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl border border-ink-200">
                  <div className="text-3xl flex-shrink-0">{use.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-sm text-ink-900 mb-1">{use.title}</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">{use.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* الثابت vs الديناميكي */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الفرق بين QR الثابت والديناميكي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-black text-lg text-blue-900 mb-3 flex items-center gap-2">
                  📌 QR ثابت
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✅ البيانات مُشفّرة داخل الرمز</li>
                  <li>✅ لا يحتاج خادم</li>
                  <li>✅ يعمل للأبد</li>
                  <li>⚠️ لا يمكن تغيير البيانات بعد الإنشاء</li>
                </ul>
              </div>
              <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200">
                <h3 className="font-black text-lg text-green-900 mb-3 flex items-center gap-2">
                  🚀 QR ديناميكي (مع رابط دائم)
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>✅ رابط محفوظ سحابياً</li>
                  <li>✅ يمكن تعديل البيانات لاحقاً</li>
                  <li>✅ يعمل من أي جهاز</li>
                  <li>✅ إحصائيات المسح (قريباً)</li>
                </ul>
              </div>
            </div>
          </article>

          {/* FAQ */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% بدون تسجيل، بدون علامات مائية، وبدون حدود على عدد الرموز.' },
                { q: 'هل QR ينتهي؟', a: 'QR ثابت لا ينتهي صلاحيته. الرابط الدائم المحفوظ على الخادم يعمل للأبد أيضاً طالما الخادم يعمل.' },
                { q: 'ما الفرق بين PNG و SVG؟', a: 'PNG صورة نقطية مناسبة للاستخدام الرقمي. SVG متجهي يمكن تكبيره بدون فقدان الجودة، مناسب للطباعة والتصميم.' },
                { q: 'كيف أحصل على رابط دائم؟', a: 'بعد إدخال البيانات، اضغط "إنشاء QR دائم". سيُحفظ على Cloudflare ويُعطيك رابطاً فريداً + مفتاح API للعودة لاحقاً.' },
                { q: 'أين تُحفظ بياناتي؟', a: 'البيانات محفوظة على Cloudflare (عند إنشاء رابط دائم) أو في متصفحك (LocalStorage للسجلات). لا نشاركها مع أي طرف ثالث.' },
                { q: 'هل يمكنني تعديل QR لاحقاً؟', a: 'نعم، إذا أنشأت QR دائم مع مفتاح API، يمكنك تعديل البيانات لاحقاً. QR نفسه لا يتغير، لكن الرابط يفتح صفحة محدّثة.' },
                { q: 'ما هو مستوى تصحيح الأخطاء؟', a: '4 مستويات: L (7%)، M (15%)، Q (25%)، H (30%). كلما زاد المستوى، زادت مقاومة QR للتلف — لكن يزيد تعقيد الرمز.' },
                { q: 'هل تعمل الأداة على الجوال؟', a: 'نعم، الواجهة متجاوبة 100% وتعمل على الجوال، التابلت، والكمبيوتر.' },
              ].map((faq, i) => (
                <details key={i} className="bg-white border-2 border-ink-200 rounded-xl overflow-hidden group">
                  <summary className="p-4 cursor-pointer font-bold flex justify-between items-center text-ink-900 hover:bg-brand-50 transition text-right">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-brand-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-ink-600 border-t border-ink-100 pt-3 leading-relaxed text-right">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </article>

          {/* أدوات ذات صلة */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '📝', title: 'عدّاد الكلمات', href: '/tools/word-counter', desc: 'تحليل شامل للنصوص' },
                { icon: '🔍', title: 'مولّد الكلمات', href: '/tools/keyword-generator', desc: 'كلمات مفتاحية ذكية' },
                { icon: '🪄', title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
                { icon: '🎬', title: 'تحويل الفيديو', href: '/tools/video-to-gif', desc: 'إلى GIF' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="bg-white border-2 border-ink-200 p-5 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block"
                >
                  <div className="text-3xl mb-2">{tool.icon}</div>
                  <h3 className="font-extrabold text-sm text-ink-900">{tool.title}</h3>
                  <p className="text-xs text-ink-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
