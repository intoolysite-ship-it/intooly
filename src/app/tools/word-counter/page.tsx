'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, BarChart3, Target, Key, BookOpen, 
  Heart, AlertTriangle, Lightbulb, Smartphone,
  GitCompare, Sparkles, ChevronDown, ArrowRight
} from 'lucide-react';

import TextInput from '@/components/word-counter/TextInput';
import StatsPanel from '@/components/word-counter/StatsPanel';
import ModeSelector from '@/components/word-counter/ModeSelector';
import GoalPanel from '@/components/word-counter/GoalPanel';
import KeywordsPanel from '@/components/word-counter/KeywordsPanel';
import ReadabilityPanel from '@/components/word-counter/ReadabilityPanel';
import SentimentPanel from '@/components/word-counter/SentimentPanel';
import MistakesPanel from '@/components/word-counter/MistakesPanel';
import SuggestionsPanel from '@/components/word-counter/SuggestionsPanel';
import PlatformLimitsPanel from '@/components/word-counter/PlatformLimitsPanel';
import ComparisonPanel from '@/components/word-counter/ComparisonPanel';
import ExportMenu from '@/components/word-counter/ExportMenu';
import FileUploader from '@/components/word-counter/FileUploader';

import { analyzeText, calculateGoalProgress } from '@/lib/word-counter/textAnalyzer';
import { compareTexts } from '@/lib/word-counter/comparison';
import { 
  saveDraft, 
  loadDraft, 
  deleteDraft, 
  scheduleAutosave,
  formatLastSaveTime,
} from '@/lib/word-counter/autosave';
import { 
  DEFAULT_STATE, 
  type TextAnalysis, 
  type WritingGoal,
  type TextComparison,
} from '@/lib/word-counter/types';
import { 
  DEFAULT_MODE, 
  WORD_COUNTER_MESSAGES,
  type ToolMode,
} from '@/lib/word-counter/constants';

export default function WordCounterPage() {
  // ============================================
  // الحالة
  // ============================================
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ToolMode>(DEFAULT_MODE);
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [goal, setGoal] = useState<WritingGoal | null>(null);
  const [comparison, setComparison] = useState<TextComparison | null>(null);
  const [comparisonText, setComparisonText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveNotice, setShowSaveNotice] = useState(false);
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
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // ============================================
  // تحديث النص + التحليل
  // ============================================
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    
    // تحليل فوري إذا كان هناك نص
    if (newText.trim()) {
      const result = analyzeText(newText);
      
      // تحديث الهدف إذا موجود
      if (goal) {
        const newGoalProgress = calculateGoalProgress(newText, goal.target, goal.unit);
        setGoal(newGoalProgress);
        result.goal = newGoalProgress;
      }
      
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
    
    // جدولة حفظ تلقائي
    scheduleAutosave(newText, mode, goal ? { target: goal.target, unit: goal.unit } : undefined);
  }, [goal, mode]);

  // ============================================
  // تغيير الوضع
  // ============================================
  const handleModeChange = useCallback((newMode: ToolMode) => {
    setMode(newMode);
  }, []);

  // ============================================
  // تعيين الهدف
  // ============================================
  const handleSetGoal = useCallback((target: number, unit: 'word' | 'char') => {
    const newGoal = calculateGoalProgress(text, target, unit);
    setGoal(newGoal);
    if (analysis) {
      setAnalysis({ ...analysis, goal: newGoal });
    }
    showToast(`✅ تم تعيين الهدف: ${target.toLocaleString('ar-SA')} ${unit === 'word' ? 'كلمة' : 'حرف'}`);
  }, [text, analysis, showToast]);

  // ============================================
  // مسح الهدف
  // ============================================
  const handleClearGoal = useCallback(() => {
    setGoal(null);
    if (analysis) {
      setAnalysis({ ...analysis, goal: null });
    }
    showToast('تم مسح الهدف', 'info');
  }, [analysis, showToast]);

  // ============================================
  // مقارنة النصوص
  // ============================================
  const handleCompare = useCallback((newVersionText: string) => {
    if (!text.trim()) {
      showToast('اكتب نصاً في المحرر أولاً', 'error');
      return;
    }
    
    const result = compareTexts(text, newVersionText);
    setComparison(result);
    setComparisonText(newVersionText);
    showToast('✅ تمت المقارنة', 'success');
  }, [text, showToast]);

  const handleClearComparison = useCallback(() => {
    setComparison(null);
    setComparisonText('');
  }, []);

  // ============================================
  // نسخ النص
  // ============================================
  const handleCopyText = useCallback(async () => {
    if (!text.trim()) return;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast('✅ تم نسخ النص');
      }
    } catch (e) {
      showToast('فشل النسخ', 'error');
    }
  }, [text, showToast]);

  // ============================================
  // تنزيل النص
  // ============================================
  const handleDownloadText = useCallback(() => {
    if (!text.trim()) return;
    
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `intooly-text-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('✅ بدأ التنزيل');
    } catch (e) {
      showToast('فشل التنزيل', 'error');
    }
  }, [text, showToast]);

  // ============================================
  // حفظ المسودة
  // ============================================
  const handleSaveDraft = useCallback(() => {
    if (!text.trim()) return;
    
    const saved = saveDraft(
      text,
      mode,
      goal ? { target: goal.target, unit: goal.unit } : undefined
    );
    
    if (saved) {
      setLastSaved(new Date());
      showToast('✅ تم حفظ المسودة');
    } else {
      showToast('فشل الحفظ', 'error');
    }
  }, [text, mode, goal, showToast]);

  // ============================================
  // مسح النص
  // ============================================
  const handleClearText = useCallback(() => {
    if (!text.trim()) return;
    
    if (typeof window !== 'undefined' && !confirm('هل أنت متأكد من مسح النص؟')) {
      return;
    }
    
    setText('');
    setAnalysis(null);
    setComparison(null);
    setGoal(null);
    deleteDraft();
    setLastSaved(null);
    showToast('تم مسح النص', 'info');
  }, [text, showToast]);

  // ============================================
  // رفع ملف
  // ============================================
  const handleFileLoaded = useCallback((fileText: string, fileName: string) => {
    setText(fileText);
    handleTextChange(fileText);
    showToast(`✅ تم تحميل: ${fileName}`);
  }, [handleTextChange, showToast]);

  // ============================================
  // استرجاع المسودة عند التحميل
  // ============================================
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.text.trim()) {
      setText(draft.text);
      setMode(draft.mode);
      
      if (draft.goal) {
        const savedGoal = calculateGoalProgress(draft.text, draft.goal.target, draft.goal.unit);
        setGoal(savedGoal);
      }
      
      const result = analyzeText(draft.text);
      setAnalysis(result);
      setLastSaved(new Date(draft.updatedAt));
      setShowSaveNotice(true);
      
      // إخفاء الإشعار بعد 5 ثوانٍ
      setTimeout(() => setShowSaveNotice(false), 5000);
    }
  }, []);

  // ============================================
  // حفظ عند تغيير الوضع
  // ============================================
  useEffect(() => {
    if (text.trim()) {
      scheduleAutosave(text, mode, goal ? { target: goal.target, unit: goal.unit } : undefined);
    }
  }, [mode, text, goal]);


  // ============================================
  // تصحيح خطأ شائع
  // ============================================
  const handleReplaceMistake = useCallback((wrong: string, correct: string) => {
    if (!text.includes(wrong)) return;
    const newText = text.replace(new RegExp(wrong, 'g'), correct);
    setText(newText);
    handleTextChange(newText);
    showToast('✅ تم التصحيح');
  }, [text, handleTextChange, showToast]);

  // ============================================
  // تصحيح كل الأخطاء
  // ============================================
  const handleFixAllMistakes = useCallback(() => {
    if (!analysis || analysis.mistakes.length === 0) return;
    
    let newText = text;
    let fixedCount = 0;
    
    const uniqueMistakes = analysis.mistakes.reduce((acc, m) => {
      if (!acc.find(x => x.wrong === m.wrong)) acc.push(m);
      return acc;
    }, [] as typeof analysis.mistakes);
    
    for (const mistake of uniqueMistakes) {
      const regex = new RegExp(mistake.wrong, 'g');
      const matches = newText.match(regex);
      if (matches) {
        fixedCount += matches.length;
        newText = newText.replace(regex, mistake.correct);
      }
    }
    
    if (fixedCount > 0) {
      setText(newText);
      handleTextChange(newText);
      showToast(`✅ تم تصحيح ${fixedCount} خطأ`);
    }
  }, [text, analysis, handleTextChange, showToast]);

  // ============================================
  // استبدال كلمة بأخرى (للتكرار)
  // ============================================
  const handleReplaceWord = useCallback((oldWord: string, newWord: string) => {
    if (!text.includes(oldWord)) return;
    const regex = new RegExp(`\\b${oldWord}\\b`, 'g');
    const newText = text.replace(regex, newWord);
    setText(newText);
    handleTextChange(newText);
    showToast(`✅ تم استبدال "${oldWord}" بـ "${newWord}"`);
  }, [text, handleTextChange, showToast]);

  // ============================================
  // تطبيق اقتراح (تقسيم جملة/فقرة)
  // ============================================
  const handleApplySuggestion = useCallback((suggestion: any) => {
    // اقتراحات البنية (لا يمكن تطبيقها تلقائياً)
    if (suggestion.type === 'structure' || suggestion.type === 'style') {
      showToast('💡 هذا اقتراح يدوي — طبّقه بنفسك', 'info');
      return;
    }
    
    // التكرارات — اقتراح استبدال
    if (suggestion.type === 'repetition' && suggestion.relatedText) {
      showToast('💡 استخدم "استبدال" من لوحة كثافة الكلمات', 'info');
      return;
    }
    
    // الأخطاء
    if (suggestion.type === 'mistake' && suggestion.relatedText) {
      // محاولة استخراج الخطأ
      showToast('💡 استخدم لوحة الأخطاء الشائعة للتصحيح', 'info');
      return;
    }
    
    showToast('💡 هذا الاقتراح يتطلب تعديلاً يدوياً', 'info');
  }, [showToast]);

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
      
      {/* إشعار استرجاع المسودة */}
      {showSaveNotice && (
        <div className="fixed top-20 right-4 z-[90] bg-white border-2 border-brand-300 rounded-xl p-4 shadow-2xl max-w-sm animate-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink-900 text-sm mb-1">
                ✅ تم استرجاع مسودتك
              </p>
              <p className="text-xs text-ink-600">
                آخر حفظ: {formatLastSaveTime(lastSaved)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div 
          className="absolute inset-0 opacity-20 text-ink-900"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                عدّاد الكلمات الذكي
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              محلي 100% • 22 دولة عربية • تحليل ذكي
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              حلّل نصك فورياً — كلمات، أحرف، جمل، مؤشر القراءة، كثافة الكلمات، وأكثر
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-6 -mt-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              { icon: '⚡', title: 'تحليل فوري', desc: 'بدون زر حساب' },
              { icon: '🇸🇦', title: 'عربي متقدم', desc: 'RTL + تشكيل' },
              { icon: '📊', title: '9 لوحات', desc: 'تحليل شامل' },
              { icon: '🔒', title: 'محلي 100%', desc: 'نصك لا يرفع' },
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
          
          {/* اختيار الوضع */}
          <div className="mb-4">
            <ModeSelector
              value={mode}
              onChange={handleModeChange}
            />
          </div>

          {/* التخطيط: المحرر + الجانب */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* العمود الأيسر: المحرر + الإحصائيات */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* FileUploader (صغير في الأعلى) */}
              <FileUploader onFileLoaded={handleFileLoaded} />

              {/* TextInput */}
              <TextInput
                value={text}
                onChange={handleTextChange}
                onCopy={handleCopyText}
                onDownload={handleDownloadText}
                onSave={handleSaveDraft}
                onClear={handleClearText}
              />

              {/* StatsPanel */}
              {analysis && (
                <StatsPanel 
                  stats={analysis.stats} 
                  uniqueWords={analysis.uniqueWords} 
                />
              )}

              {/* ExportMenu */}
              {analysis && (
                <ExportMenu
                  analysis={analysis}
                  mode={mode}
                  originalText={text}
                />
              )}

              {/* GoalPanel */}
              <GoalPanel
                goal={goal}
                onSetGoal={handleSetGoal}
                onClearGoal={handleClearGoal}
              />

              {/* ComparisonPanel (للـ editor mode فقط) */}
              {mode === 'editor' && (
                <ComparisonPanel
                  comparison={comparison}
                  originalText={text}
                  newText={comparisonText}
                  onCompare={handleCompare}
                  onClear={handleClearComparison}
                />
              )}
            </div>

            {/* العمود الأيمن: التحليلات */}
            <div className="space-y-4">
              
              {/* ReadabilityPanel */}
              {analysis && (
                <ReadabilityPanel readability={analysis.readability} />
              )}

              {/* SentimentPanel */}
              {analysis && (
                <SentimentPanel sentiment={analysis.sentiment} />
              )}

              {/* MistakesPanel */}
              {analysis && analysis.mistakes.length > 0 && (
                <MistakesPanel 
                  mistakes={analysis.mistakes} 
                  onReplace={handleReplaceMistake}
                  onFixAll={handleFixAllMistakes}
                />
              )}

              {/* SuggestionsPanel */}
              {analysis && (
                <SuggestionsPanel suggestions={analysis.suggestions} />
              )}

              {/* PlatformLimitsPanel */}
              {analysis && (
                <PlatformLimitsPanel limits={analysis.platformLimits} />
              )}
            </div>
          </div>

          {/* KeywordsPanel - أسفل الصفحة (عرض كامل) */}
          {analysis && analysis.keywords.length > 0 && (
            <div className="mt-4">
              <KeywordsPanel keywords={analysis.keywords} />
            </div>
          )}
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* المقدمة */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">
              ما هو عدّاد الكلمات الذكي؟
            </h2>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              <strong>عدّاد الكلمات الذكي</strong> من Intooly ليس مجرد أداة لعدّ الكلمات — بل <strong>استوديو نصي متكامل</strong> يحلل نصك فورياً ويقدم لك:
            </p>
            <ul className="text-base leading-relaxed mb-4 text-ink-600 text-right space-y-2 pr-6">
              <li className="list-disc">عدّ فوري للكلمات والأحرف والجمل والفقرات</li>
              <li className="list-disc">مؤشر قراءة عربي مخصص (5 مستويات)</li>
              <li className="list-disc">كثافة الكلمات المفتاحية (Top 30)</li>
              <li className="list-disc">تحليل المشاعر (إيجابي/محايد/سلبي)</li>
              <li className="list-disc">اكتشاف الأخطاء الشائعة (50+ خطأ)</li>
              <li className="list-disc">اقتراحات تحسين فورية</li>
              <li className="list-disc">حدود المنصات (تويتر، إنستغرام، Meta)</li>
            </ul>
            <p className="text-base leading-relaxed mb-4 text-ink-600 text-right">
              يعمل <strong>محلياً 100%</strong> في متصفحك — نصك لا يُرفع إلى أي خادم. يدعم العربية بتشكيلها وتطويلها، مع RTL/LTR تلقائي.
            </p>
          </article>

          {/* الميزات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الميزات الاحترافية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '⚡', title: 'تحليل فوري', desc: 'تحديث النتائج أثناء الكتابة — بدون زر حساب' },
                { icon: '🇸🇦', title: 'عربي متقدم', desc: 'RTL + تشكيل + تطويل + جذور' },
                { icon: '📖', title: 'مؤشر قراءة عربي', desc: '5 مستويات — فريد من نوعه' },
                { icon: '🎯', title: 'أوضاع ذكية', desc: 'SEO، أكاديمي، تواصل، محرر' },
                { icon: '📊', title: '9 لوحات تحليل', desc: 'شامل لكل جوانب النص' },
                { icon: '🔑', title: 'كثافة الكلمات', desc: 'Top 30 مع نسب مئوية' },
                { icon: '⚠️', title: 'اكتشاف الأخطاء', desc: '50+ خطأ عربي شائع' },
                { icon: '📱', title: 'حدود المنصات', desc: 'تويتر، إنستغرام، Meta، SEO' },
                { icon: '🔒', title: 'محلي 100%', desc: 'نصك لا يغادر متصفحك' },
              ].map((f, i) => (
                <div key={i} className="bg-white border-2 border-ink-200 rounded-xl p-4 text-right">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-ink-900">{f.title}</h3>
                  <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </article>

          {/* الخطوات */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              كيف تستخدم العدّاد — 3 خطوات
            </h2>
            <div className="space-y-4">
              {[
                { num: 1, title: 'اختر الوضع', desc: 'العدّ العام، كاتب SEO، بحث أكاديمي، تواصل اجتماعي، أو محرر.' },
                { num: 2, title: 'اكتب أو الصق', desc: 'اكتب نصك، الصقه، أو ارفع ملف (TXT, DOCX, PDF).' },
                { num: 3, title: 'حلّل وصدّر', desc: 'شاهد النتائج الفورية، ثم صدّر التقرير (Markdown، CSV، JSON، TXT).' },
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

          {/* FAQ */}
          <article className="mb-12">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              الأسئلة الشائعة
            </h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، مجانية 100% بدون حدود على عدد الكلمات أو التحليلات، وبدون علامات مائية.' },
                { q: 'هل نصي آمن؟', a: 'نعم 100%. كل المعالجة تتم محلياً في متصفحك. نصك لا يُرفع إلى أي خادم.' },
                { q: 'ما الفرق بين "كلمات" و"كلمات فريدة"؟', a: '"الكلمات" = إجمالي الكلمات. "الكلمات الفريدة" = الكلمات المختلفة (بدون تكرار). مؤشر تنوع المفردات.' },
                { q: 'كيف يعمل مؤشر القراءة؟', a: '4 عوامل: طول الجملة (35%)، تعقيد الكلمات (30%)، نسبة التشكيل (15%)، الكلمات الطويلة (20%). يعطي مؤشراً من 0-100.' },
                { q: 'هل تحليل المشاعر دقيق؟', a: 'تقديري — يعتمد على قائمة كلمات عاطفية. للدقة الكاملة استخدم أدوات متخصصة.' },
                { q: 'ما صيغ الملفات المدعومة؟', a: 'TXT، MD، CSV، DOCX، PDF. لـ PDF الممسوح ضوئياً (OCR) — ميزة منفصلة قادمة.' },
                { q: 'هل يمكنني حفظ مسودتي؟', a: 'نعم، تلقائياً في LocalStorage. عند العودة، تُستَرجع المسودة تلقائياً.' },
                { q: 'ما أوضاع الأداة الخمسة؟', a: 'العدّ العام، كاتب SEO، بحث أكاديمي، تواصل اجتماعي، محرر. كل وضع يُظهر تحليلات مخصصة.' },
                { q: 'هل تعمل الأداة على الجوال؟', a: 'نعم، واجهة متجاوبة 100% تعمل على الجوال والتابلت والكمبيوتر.' },
                { q: 'هل يمكنني مقارنة نصين؟', a: 'نعم، في وضع "محرر". الصق النسخة الجديدة، واضغط "قارن الآن" لرؤية الفروق (مضافة/محذوفة).' },
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

          {/* CTA */}
          <article className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-ink-900">
              ابدأ تحليل نصك الآن
            </h2>
            <p className="text-base leading-relaxed mb-6 text-ink-600">
              جرّب العدّاد الذكي، واكتشف جودة نصك في ثوانٍ.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black rounded-xl text-base shadow-lg shadow-brand-500/30 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              ابدأ الآن
            </button>
          </article>

          {/* أدوات ذات صلة */}
          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">
              أدوات ذات صلة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: BarChart3, title: 'مولّد الكلمات', href: '/tools/keyword-generator', desc: 'كلمات مفتاحية ذكية' },
                { icon: Sparkles, title: 'إزالة الخلفية', href: '/tools/background-remover', desc: 'AI دقيق' },
                { icon: FileText, title: 'تحويل الفيديو إلى GIF', href: '/tools/video-to-gif', desc: 'FFmpeg.wasm' },
                { icon: Target, title: 'ضاغط الصور', href: '/tools/image-compressor', desc: 'قلّل حجم الصور' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="bg-white border-2 border-ink-200 p-5 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block"
                >
                  <tool.icon className="w-8 h-8 text-brand-500 mx-auto mb-2" />
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
