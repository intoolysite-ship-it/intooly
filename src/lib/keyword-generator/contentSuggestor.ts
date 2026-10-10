/**
 * مولّد خطة المحتوى
 * يولّد عناوين، وصف، هيكل مقال، FAQ، روابط داخلية
 */

import type { 
  Keyword, 
  ContentPlan,
  FAQItem,
  ArticleSection,
  InternalLink,
} from './types';

// ============================================
// 1. توليد عنوان SEO
// ============================================

export function generateTitle(keyword: string, intent: string): string {
  const templates: Record<string, string[]> = {
    informational: [
      `${keyword} — دليل شامل 2026`,
      `ما هو ${keyword}؟ شرح كامل بالعربي`,
      `${keyword}: كل ما تحتاج معرفته`,
    ],
    commercial: [
      `أفضل ${keyword} — مقارنة ومراجعة 2026`,
      `${keyword}: مقارنة أفضل الخيارات`,
      `مراجعة ${keyword} — الأفضل لعام 2026`,
    ],
    transactional: [
      `${keyword} — أفضل العروض 2026`,
      `${keyword} أونلاين — تسوق الآن`,
      `${keyword} بأفضل سعر`,
    ],
    navigational: [
      `${keyword} — الموقع الرسمي`,
      `${keyword}: الصفحة الرئيسية`,
    ],
    unknown: [
      `${keyword} — دليل شامل`,
      `كل ما تريد معرفته عن ${keyword}`,
    ],
  };
  
  const options = templates[intent] || templates.unknown;
  return options[0];
}

// ============================================
// 2. توليد وصف Meta
// ============================================

export function generateMetaDescription(keyword: string, intent: string): string {
  const templates: Record<string, string> = {
    informational: `تعرف على ${keyword} بالتفصيل — شرح مبسط، أمثلة عملية، وأفضل الممارسات. دليل شامل بالعربي.`,
    commercial: `قارن أفضل ${keyword} في 2026 — مميزات، عيوب، وأسعار. اختر الأفضل لاحتياجك.`,
    transactional: `اكتشف أفضل عروض ${keyword} — تسوق أونلاين بأفضل سعر، مع شحن سريع وضمان.`,
    navigational: `${keyword} — الموقع الرسمي. تعرف على الخدمات والعروض.`,
    unknown: `كل ما تحتاج معرفته عن ${keyword} — دليل شامل بالعربي.`,
  };
  
  return templates[intent] || templates.unknown;
}

// ============================================
// 3. توليد H2
// ============================================

export function generateH2Headings(keyword: string, intent: string): string[] {
  const base = [
    `ما هو ${keyword}؟`,
    `أهمية ${keyword}`,
    `كيفية استخدام ${keyword}`,
  ];
  
  if (intent === 'commercial') {
    return [
      `ما هو ${keyword}؟`,
      `أفضل ${keyword} في 2026`,
      `مقارنة ${keyword}`,
      `مميزات وعيوب`,
      `كيف تختار ${keyword} المناسب؟`,
      `الأسئلة الشائعة`,
    ];
  }
  
  if (intent === 'informational') {
    return [
      `ما هو ${keyword}؟`,
      `أنواع ${keyword}`,
      `كيفية ${keyword} خطوة بخطوة`,
      `أفضل ممارسات ${keyword}`,
      `أخطاء شائعة`,
      `الأسئلة الشائعة`,
    ];
  }
  
  if (intent === 'transactional') {
    return [
      `${keyword} — نظرة عامة`,
      `أفضل عروض ${keyword}`,
      `كيف تشتري ${keyword}؟`,
      `مقارنة الأسعار`,
      `الأسئلة الشائعة`,
    ];
  }
  
  return [...base, `الأسئلة الشائعة`];
}

// ============================================
// 4. توليد FAQ
// ============================================

export function generateFAQ(keyword: string): FAQItem[] {
  return [
    {
      question: `ما هو ${keyword}؟`,
      answer: `${keyword} هو... (اكتب تعريفاً شاملاً هنا)`,
    },
    {
      question: `كيف أستخدم ${keyword}؟`,
      answer: `لاستخدام ${keyword}، اتبع الخطوات التالية: 1) ... 2) ... 3) ...`,
    },
    {
      question: `ما أفضل ${keyword}؟`,
      answer: `أفضل ${keyword} يعتمد على احتياجك. قارن بين الخيارات حسب: السعر، الجودة، سهولة الاستخدام.`,
    },
    {
      question: `هل ${keyword} مجاني؟`,
      answer: `${keyword} قد يكون مجانياً أو مدفوعاً حسب الأداة أو الخدمة. تحقق من الخيارات المتاحة.`,
    },
    {
      question: `هل ${keyword} آمن؟`,
      answer: `نعم، ${keyword} آمن عند استخدامه بشكل صحيح. اتبع التعليمات وتأكد من المصدر.`,
    },
    {
      question: `أين أجد ${keyword}؟`,
      answer: `يمكنك إيجاد ${keyword} عبر الإنترنت أو من المتاجر المتخصصة. ابحث عن الموثوقية.`,
    },
  ];
}

// ============================================
// 5. توليد مخطط المقال
// ============================================

export function generateArticleOutline(
  keyword: string,
  intent: string,
  h2Headings: string[]
): ArticleSection[] {
  return h2Headings.map((heading) => ({
    heading,
    points: generatePointsForHeading(heading, keyword, intent),
    keywords: generateRelatedKeywords(keyword, heading),
  }));
}

function generatePointsForHeading(
  heading: string,
  keyword: string,
  intent: string
): string[] {
  if (heading.includes('ما هو') || heading.includes('تعريف')) {
    return [
      `تعريف ${keyword}`,
      `أهمية ${keyword}`,
      `الاستخدامات الشائعة`,
    ];
  }
  
  if (heading.includes('كيف') || heading.includes('طريقة')) {
    return [
      `الخطوة 1: التحضير`,
      `الخطوة 2: التنفيذ`,
      `الخطوة 3: المراجعة`,
      `نصائح احترافية`,
    ];
  }
  
  if (heading.includes('مقارنة') || heading.includes('أفضل')) {
    return [
      `معايير المقارنة`,
      `الخيار 1: المميزات والعيوب`,
      `الخيار 2: المميزات والعيوب`,
      `الخيار 3: المميزات والعيوب`,
      `التوصية النهائية`,
    ];
  }
  
  if (heading.includes('الأسئلة')) {
    return [
      `أسئلة شائعة عن ${keyword}`,
      `إجابات مفصلة`,
    ];
  }
  
  return [
    `نقاط رئيسية عن ${keyword}`,
    `أمثلة عملية`,
    `نصائح مفيدة`,
  ];
}

function generateRelatedKeywords(keyword: string, heading: string): string[] {
  const words = heading.replace(/[؟?:]/g, '').split(/\s+/);
  return words.slice(0, 3).map(w => `${keyword} ${w}`);
}

// ============================================
// 6. توليد الروابط الداخلية
// ============================================

export function generateInternalLinks(keyword: string): InternalLink[] {
  const tools = [
    { name: 'مولد الكلمات المفتاحية', href: '/tools/keyword-generator' },
    { name: 'ضاغط الصور', href: '/tools/image-compressor' },
    { name: 'إزالة الخلفية', href: '/tools/background-remover' },
    { name: 'تحويل الفيديو إلى GIF', href: '/tools/video-to-gif' },
  ];
  
  return tools.map(tool => ({
    anchorText: tool.name,
    targetPage: tool.href,
    reason: `أداة ذات صلة بـ ${keyword}`,
  }));
}

// ============================================
// 7. الدالة الرئيسية
// ============================================

export function generateContentPlan(
  primaryKeyword: Keyword
): ContentPlan {
  const keyword = primaryKeyword.text;
  const intent = primaryKeyword.intent;
  
  const h2Headings = generateH2Headings(keyword, intent);
  
  return {
    title: generateTitle(keyword, intent),
    metaDescription: generateMetaDescription(keyword, intent),
    h1: keyword,
    h2: h2Headings,
    faq: generateFAQ(keyword),
    articleOutline: generateArticleOutline(keyword, intent, h2Headings),
    internalLinks: generateInternalLinks(keyword),
    targetKeywords: [keyword],
    estimatedWordCount: Math.max(800, h2Headings.length * 250),
  };
}
