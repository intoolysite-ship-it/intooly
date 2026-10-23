/**
 * محرك فحص SEO — Intooly
 * دوال نقية لتحليل HTML واستخراج المشاكل والتوصيات.
 * يعمل داخل المتصفح (لا يحتاج خادم).
 */

import type {
  SeoIssue,
  SeoReport,
  AnalysisOptions,
  FetchInfo,
} from './types';

import { DEFAULT_OPTIONS } from './types';

// ============================================
// 1. الدوال المساعدة
// ============================================

function cleanText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function getMeta(doc: Document, name: string): string {
  const element = doc.querySelector(
    `meta[name="${name}" i], meta[property="${name}" i]`
  );
  return cleanText(element?.getAttribute('content'));
}

function countHeadings(doc: Document, tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): number {
  return doc.querySelectorAll(tag).length;
}

function getHeadingsText(doc: Document, tag: 'h1' | 'h2'): string[] {
  return Array.from(doc.querySelectorAll(tag))
    .map((el) => cleanText(el.textContent))
    .filter(Boolean);
}

// ============================================
// 2. فحوص Meta الأساسية
// ============================================

function checkTitle(doc: Document): SeoIssue {
  const title = cleanText(doc.querySelector('title')?.textContent);
  const len = title.length;

  if (!title) {
    return {
      id: 'title', title: 'عنوان الصفحة (Title)', category: 'meta', status: 'error', severity: 'critical',
      details: 'لم يتم العثور على وسم <title> في الصفحة.',
      recommendation: 'أضف عنوانًا فريدًا يصف محتوى الصفحة بوضوح (30-60 حرفًا مثاليًا).',
      codeExample: '<title>عنوان الصفحة الفريد والواضح</title>',
      docUrl: 'https://developers.google.com/search/docs/appearance/title-link',
    };
  }

  const data = JSON.stringify({ current: title, length: len });
  if (len < 30) return { id: 'title', title: 'عنوان الصفحة (Title)', category: 'meta', status: 'warning', severity: 'high', details: `العنوان قصير (${len} حرفًا).`, recommendation: 'اجعل العنوان أطول (30-60 حرفًا).', value: data, codeExample: '<title>عنوان أطول وأكثر وصفاً</title>' };
  if (len > 60) return { id: 'title', title: 'عنوان الصفحة (Title)', category: 'meta', status: 'warning', severity: 'medium', details: `العنوان طويل (${len} حرفًا).`, recommendation: 'قلّص العنوان إلى 60 حرفًا أو أقل.', value: data, codeExample: '<title>عنوان مختصر</title>' };
  
  return { id: 'title', title: 'عنوان الصفحة (Title)', category: 'meta', status: 'pass', severity: 'success', details: `طول العنوان مناسب (${len} حرفًا).`, value: data };
}

function checkDescription(doc: Document): SeoIssue {
  const desc = getMeta(doc, 'description');
  const len = desc.length;

  if (!desc) {
    return {
      id: 'description', title: 'وصف Meta Description', category: 'meta', status: 'warning', severity: 'medium',
      details: 'لم يتم العثور على وسم meta description.',
      recommendation: 'أضف وصفًا موجزًا (140-160 حرفًا) يوضح محتوى الصفحة.',
      codeExample: '<meta name="description" content="وصف موجز يشرح محتوى الصفحة.">',
    };
  }

  const data = JSON.stringify({ current: desc, length: len });
  if (len < 70) return { id: 'description', title: 'وصف Meta Description', category: 'meta', status: 'warning', severity: 'medium', details: `الوصف قصير جدًا (${len} حرفًا).`, recommendation: 'اجعل الوصف بين 140-160 حرفًا.', value: data, codeExample: '<meta name="description" content="وصف أطول يشرح المحتوى.">' };
  if (len > 160) return { id: 'description', title: 'وصف Meta Description', category: 'meta', status: 'warning', severity: 'low', details: `الوصف طويل (${len} حرفًا).`, recommendation: 'قلّص الوصف إلى 160 حرفًا أو أقل.', value: data, codeExample: '<meta name="description" content="وصف مختصر.">' };
  
  return { id: 'description', title: 'وصف Meta Description', category: 'meta', status: 'pass', severity: 'success', details: `طول الوصف مناسب (${len} حرفًا).`, value: data };
}

function checkCanonical(doc: Document): SeoIssue {
  const canonical = cleanText(
    doc.querySelector('link[rel="canonical" i]')?.getAttribute('href')
  );

  if (!canonical) {
    return {
      id: 'canonical',
      title: 'الرابط الأساسي (Canonical)',
      category: 'meta',
      status: 'info',
      severity: 'low',
      details: 'لم يتم العثور على وسم canonical.',
      recommendation:
        'أضف canonical إذا كانت الصفحة قد تظهر بأكثر من رابط (مثل مع/بدون www).',
      codeExample: '<link rel="canonical" href="https://example.com/page">',
    };
  }

  return {
    id: 'canonical',
    title: 'الرابط الأساسي (Canonical)',
    category: 'meta',
    status: 'pass',
    severity: 'success',
    details: `Canonical موجود: ${canonical}`,
    value: canonical,
  };
}

function checkRobots(doc: Document): SeoIssue {
  const robots = getMeta(doc, 'robots');
  const isNoindex = /\bnoindex\b/i.test(robots);

  if (isNoindex) {
    return {
      id: 'robots',
      title: 'تعليمات Robots',
      category: 'meta',
      status: 'warning',
      severity: 'high',
      details: 'الصفحة تحتوي على noindex — أي أنها لن تُفهرس في Google.',
      recommendation:
        'تأكد أن noindex مقصود. إن لم يكن، احذف الوسم ليُسمح بالفهرسة.',
      value: robots,
    };
  }

  return {
    id: 'robots',
    title: 'تعليمات Robots',
    category: 'meta',
    status: 'pass',
    severity: 'success',
    details: robots
      ? `تعليمات Robots: ${robots}`
      : 'لا توجد تعليمات robots (الافتراضي: index, follow).',
    value: robots || 'index, follow (افتراضي)',
  };
}

// ============================================
// 3. فحوص العناوين (H1-H6)
// ============================================

function checkH1(doc: Document): SeoIssue {
  const h1Count = countHeadings(doc, 'h1');
  const h1Texts = getHeadingsText(doc, 'h1');

  if (h1Count === 0) {
    return {
      id: 'h1', title: 'العنوان الرئيسي (H1)', category: 'headings', status: 'error', severity: 'critical',
      details: 'لم يتم العثور على عنوان H1 في الصفحة.',
      recommendation: 'أضف H1 واحدًا يصف الموضوع الرئيسي للصفحة.',
      codeExample: '<h1>العنوان الرئيسي للصفحة</h1>',
    };
  }

  const data = JSON.stringify({ count: h1Count, texts: h1Texts });
  if (h1Count > 1) return { id: 'h1', title: 'العنوان الرئيسي (H1)', category: 'headings', status: 'warning', severity: 'medium', details: `تم العثور على ${h1Count} عناوين H1.`, recommendation: 'اجعل عنوان H1 واحدًا لكل صفحة.', value: data, codeExample: '<h1>عنوان واحد فقط</h1>' };
  
  return { id: 'h1', title: 'العنوان الرئيسي (H1)', category: 'headings', status: 'pass', severity: 'success', details: 'H1 موجود بشكل صحيح.', value: data };
}

function checkHeadingsStructure(doc: Document): SeoIssue {
  const h2 = countHeadings(doc, 'h2');
  const h3 = countHeadings(doc, 'h3');
  const h4 = countHeadings(doc, 'h4');
  const h5 = countHeadings(doc, 'h5');
  const h6 = countHeadings(doc, 'h6');
  const total = h2 + h3 + h4 + h5 + h6;

  if (total === 0) {
    return {
      id: 'headings',
      title: 'بنية العناوين (H2-H6)',
      category: 'headings',
      status: 'warning',
      severity: 'low',
      details: 'لا توجد عناوين فرعية (H2-H6).',
      recommendation:
        'نظّم محتوى الصفحة بعناوين H2-H6 لتحسين القراءة والبنية.',
    };
  }

  if (h2 === 0) {
    return {
      id: 'headings',
      title: 'بنية العناوين (H2-H6)',
      category: 'headings',
      status: 'warning',
      severity: 'medium',
      details: `لا توجد عناوين H2 (يوجد ${total} عنوانًا فرعيًا).`,
      recommendation:
        'ابدأ بنية العناوين بـ H2 قبل H3، فالترتيب يهم.',
    };
  }

  return {
    id: 'headings',
    title: 'بنية العناوين (H2-H6)',
    category: 'headings',
    status: 'pass',
    severity: 'success',
    details: `البنية صحيحة: ${h2} H2، ${h3} H3، ${h4} H4، ${h5} H5، ${h6} H6.`,
    value: `H2: ${h2}, H3: ${h3}, H4: ${h4}, H5: ${h5}, H6: ${h6}`,
  };
}

// ============================================
// 4. فحوص الصور (Alt Text)
// ============================================

function checkImagesAlt(doc: Document): SeoIssue {
  const images = Array.from(doc.querySelectorAll('img'));
  const total = images.length;

  if (total === 0) {
    return {
      id: 'images-alt',
      title: 'النص البديل للصور (Alt)',
      category: 'images',
      status: 'info',
      severity: 'low',
      details: 'لا توجد صور في الصفحة.',
    };
  }

  const imagesWithoutAlt = images.filter((img) => {
    const alt = img.getAttribute('alt');
    return alt === null || alt.trim() === '';
  });

  if (imagesWithoutAlt.length === 0) {
    return {
      id: 'images-alt',
      title: 'النص البديل للصور (Alt)',
      category: 'images',
      status: 'pass',
      severity: 'success',
      details: `جميع الصور (${total}) تحتوي على alt.`,
      value: `${total} صورة`,
    };
  }

  // بناء بيانات منظمة لكل صورة (بدون بتر الرابط، مع ترميز آمن)
  const brokenImagesData = imagesWithoutAlt.map((img, idx) => {
    const rawSrc = img.getAttribute('src') || '';
    
    // محاولة ترميز الرابط إذا كان يحتوي على أحرف عربية أو مسافات
    let safeSrc = rawSrc;
    try {
      if (rawSrc && !rawSrc.startsWith('data:')) {
        // encodeURI يتعامل مع الأحرف العربية والمسافات دون كسر الرابط الأساسي
        safeSrc = encodeURI(rawSrc);
      }
    } catch {
      safeSrc = rawSrc;
    }

    return {
      index: idx + 1,
      src: safeSrc,
      originalSrc: rawSrc,
      currentAlt: img.getAttribute('alt') || '',
      outerHTML: img.outerHTML.substring(0, 500),
    };
  });

  const percentage = Math.round((imagesWithoutAlt.length / total) * 100);

  return {
    id: 'images-alt',
    title: 'النص البديل للصور (Alt)',
    category: 'images',
    status: 'warning',
    severity: percentage > 50 ? 'high' : 'medium',
    details: `${imagesWithoutAlt.length} من أصل ${total} صورة (${percentage}%) بدون نص بديل.`,
    recommendation:
      'أضف alt وصفياً لكل صورة مهمة. الصور الزخرفية يمكن تركها بـ alt="". استخدم أداة الإصلاح أدناه لإضافة Alt مباشرة وتوليد الكود.',
    value: JSON.stringify(brokenImagesData),
  };
}

// ============================================
// 5. فحوص الروابط (نص الرابط + فحص فعلي عبر API)
// ============================================

function checkLinksText(doc: Document): SeoIssue {
  const links = Array.from(doc.querySelectorAll('a[href]'));
  const emptyLinks = links.filter((a) => {
    const text = cleanText(a.textContent);
    const ariaLabel = cleanText(a.getAttribute('aria-label'));
    const title = cleanText(a.getAttribute('title'));
    const hasImageWithAlt = a.querySelector('img[alt]') !== null;
    return !text && !ariaLabel && !title && !hasImageWithAlt;
  });

  if (links.length === 0) return { id: 'links-text', title: 'الروابط ونصوصها', category: 'links', status: 'info', severity: 'low', details: 'لا توجد روابط.' };
  if (emptyLinks.length === 0) return { id: 'links-text', title: 'الروابط ونصوصها', category: 'links', status: 'pass', severity: 'success', details: `جميع الروابط (${links.length}) تحتوي على نص.`, value: JSON.stringify({ total: links.length, empty: 0 }) };

  const brokenLinksData = emptyLinks.map((a, idx) => ({
    index: idx + 1, href: a.getAttribute('href') || '', outerHTML: a.outerHTML.substring(0, 300)
  }));

  return {
    id: 'links-text', title: 'الروابط ونصوصها', category: 'links', status: 'warning', severity: 'medium',
    details: `${emptyLinks.length} من أصل ${links.length} رابط بدون نص واضح.`,
    recommendation: 'أضف نصًا وصفيًا أو aria-label لكل رابط.',
    value: JSON.stringify(brokenLinksData),
  };
}

function checkExternalLinks(doc: Document): SeoIssue {
  const links = Array.from(doc.querySelectorAll('a[href]'));
  const externalLinks = links.filter((a) => {
    const href = a.getAttribute('href') || '';
    return /^https?:\/\//i.test(href) && !href.includes('intooly.com');
  });

  const nofollowCount = externalLinks.filter(
    (a) => (a.getAttribute('rel') || '').includes('nofollow')
  ).length;

  if (externalLinks.length === 0) {
    return {
      id: 'links-external',
      title: 'الروابط الخارجية',
      category: 'links',
      status: 'info',
      severity: 'low',
      details: 'لا توجد روابط خارجية في الصفحة.',
    };
  }

  if (nofollowCount === 0) {
    return {
      id: 'links-external',
      title: 'الروابط الخارجية',
      category: 'links',
      status: 'info',
      severity: 'low',
      details: `${externalLinks.length} رابطًا خارجيًا (لا شيء منها بـ nofollow).`,
      recommendation:
        'فكّر في إضافة rel="nofollow" للروابط المدفوعة أو غير الموثوقة.',
      value: `${externalLinks.length} رابط`,
    };
  }

  return {
    id: 'links-external',
    title: 'الروابط الخارجية',
    category: 'links',
    status: 'pass',
    severity: 'success',
    details: `${externalLinks.length} رابطًا خارجيًا (${nofollowCount} بـ nofollow).`,
    value: `${externalLinks.length} رابط`,
  };
}

// ============================================
// 6. فحوص Social (Open Graph + Twitter)
// ============================================

function checkOpenGraph(doc: Document): SeoIssue {
  const ogTitle = getMeta(doc, 'og:title');
  const ogDescription = getMeta(doc, 'og:description');
  const ogImage = getMeta(doc, 'og:image');
  const ogUrl = getMeta(doc, 'og:url');
  const ogType = getMeta(doc, 'og:type');

  const found = [ogTitle, ogDescription, ogImage, ogUrl, ogType].filter(Boolean).length;

  if (found === 0) {
    return {
      id: 'og',
      title: 'وسوم Open Graph',
      category: 'social',
      status: 'warning',
      severity: 'medium',
      details: 'لم يتم العثور على أي وسم Open Graph.',
      recommendation:
        'أضف og:title, og:description, og:image, og:url لتحسين المشاركة على Facebook/LinkedIn.',
      codeExample:
        '<meta property="og:title" content="عنوان">\n<meta property="og:description" content="وصف">\n<meta property="og:image" content="https://...">',
    };
  }

  if (!ogImage) {
    return {
      id: 'og',
      title: 'وسوم Open Graph',
      category: 'social',
      status: 'warning',
      severity: 'low',
      details: 'og:image مفقود — ستظهر البطاقة بدون صورة.',
      recommendation: 'أضف og:image بأبعاد 1200×630.',
      codeExample: '<meta property="og:image" content="https://example.com/image.jpg">',
    };
  }

  return {
    id: 'og',
    title: 'وسوم Open Graph',
    category: 'social',
    status: 'pass',
    severity: 'success',
    details: `Open Graph مكتمل (${found}/5 وسوم).`,
    value: `og:title, og:description, og:image${ogUrl ? ', og:url' : ''}`,
  };
}

function checkTwitterCard(doc: Document): SeoIssue {
  const twitterCard = getMeta(doc, 'twitter:card');
  const twitterTitle = getMeta(doc, 'twitter:title');
  const twitterImage = getMeta(doc, 'twitter:image');

  if (!twitterCard) {
    return {
      id: 'twitter',
      title: 'بطاقة Twitter/X',
      category: 'social',
      status: 'info',
      severity: 'low',
      details: 'لم يتم العثور على twitter:card.',
      recommendation:
        'أضف twitter:card (summary_large_image عادةً) لتحسين المشاركة على X.',
      codeExample: '<meta name="twitter:card" content="summary_large_image">',
    };
  }

  return {
    id: 'twitter',
    title: 'بطاقة Twitter/X',
    category: 'social',
    status: 'pass',
    severity: 'success',
    details: `twitter:card = ${twitterCard}`,
    value: `Type: ${twitterCard}${twitterImage ? ' + Image' : ''}${twitterTitle ? ' + Title' : ''}`,
  };
}

// ============================================
// 7. فحوص Schema (JSON-LD)
// ============================================

function checkSchema(doc: Document): SeoIssue {
  const scripts = Array.from(
    doc.querySelectorAll('script[type="application/ld+json" i]')
  );

  if (scripts.length === 0) {
    return {
      id: 'schema',
      title: 'البيانات المنظمة (Schema/JSON-LD)',
      category: 'schema',
      status: 'info',
      severity: 'low',
      details: 'لا توجد بيانات منظمة (Schema) في الصفحة.',
      recommendation:
        'أضف JSON-LD مناسبًا (Article, Product, FAQPage, إلخ) عندما يكون مطابقًا للمحتوى.',
    };
  }

  let validCount = 0;
  let invalidCount = 0;
  let detectedTypes: string[] = [];

  scripts.forEach((script) => {
    try {
      const parsed = JSON.parse(script.textContent || '');
      validCount++;
      if (parsed['@type']) {
        detectedTypes.push(String(parsed['@type']));
      }
      if (Array.isArray(parsed['@graph'])) {
        parsed['@graph'].forEach((item: { '@type'?: string }) => {
          if (item['@type']) detectedTypes.push(String(item['@type']));
        });
      }
    } catch {
      invalidCount++;
    }
  });

  detectedTypes = Array.from(new Set(detectedTypes));

  if (invalidCount > 0) {
    return {
      id: 'schema',
      title: 'البيانات المنظمة (Schema/JSON-LD)',
      category: 'schema',
      status: 'error',
      severity: 'high',
      details: `${invalidCount} من ${scripts.length} كتلة JSON-LD بها أخطاء صياغة.`,
      recommendation:
        'أصلح صياغة JSON-LD (أخطاء JSON تمنع Google من قراءتها).',
      docUrl: 'https://search.google.com/test/rich-results',
    };
  }

  return {
    id: 'schema',
    title: 'البيانات المنظمة (Schema/JSON-LD)',
    category: 'schema',
    status: 'pass',
    severity: 'success',
    details: `${validCount} كتلة JSON-LD صحيحة.`,
    value: detectedTypes.length > 0 ? detectedTypes.join(', ') : `${validCount} block(s)`,
  };
}

// ============================================
// 8. فحوص Technical (Viewport, Lang, Charset)
// ============================================

function checkViewport(doc: Document): SeoIssue {
  const viewport = getMeta(doc, 'viewport');
  const hasWidthDevice = viewport.includes('width=device-width');

  if (!viewport) {
    return {
      id: 'viewport',
      title: 'وسم Viewport (الجوال)',
      category: 'technical',
      status: 'warning',
      severity: 'high',
      details: 'لا يوجد meta viewport — الصفحة ستظهر بحجم مصغّر على الجوال.',
      recommendation:
        'أضف meta viewport للسماح بالعرض المتجاوب على الجوال.',
      codeExample:
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
    };
  }

  if (!hasWidthDevice) {
    return {
      id: 'viewport',
      title: 'وسم Viewport (الجوال)',
      category: 'technical',
      status: 'info',
      severity: 'low',
      details: `Viewport موجود لكن قد لا يكون متجاوبًا: ${viewport}`,
      recommendation:
        'استخدم width=device-width, initial-scale=1 للحصول على تجربة جوال مثالية.',
      value: viewport,
    };
  }

  return {
    id: 'viewport',
    title: 'وسم Viewport (الجوال)',
    category: 'technical',
    status: 'pass',
    severity: 'success',
    details: 'Viewport صحيح ومتجاوب.',
    value: viewport,
  };
}

function checkLang(doc: Document): SeoIssue {
  const lang = cleanText(doc.documentElement.getAttribute('lang'));

  if (!lang) {
    return {
      id: 'lang',
      title: 'لغة الصفحة (lang)',
      category: 'technical',
      status: 'warning',
      severity: 'medium',
      details: 'خاصية lang غير محددة على عنصر <html>.',
      recommendation:
        'حدد لغة الصفحة (مثل lang="ar") لتحسين الفهرسة والقراءة الآلية.',
      codeExample: '<html lang="ar" dir="rtl">',
    };
  }

  return {
    id: 'lang',
    title: 'لغة الصفحة (lang)',
    category: 'technical',
    status: 'pass',
    severity: 'success',
    details: `لغة الصفحة: ${lang}`,
    value: lang,
  };
}

function checkCharset(doc: Document): SeoIssue {
  const charset = doc.querySelector('meta[charset], meta[http-equiv="content-type" i]');

  if (!charset) {
    return {
      id: 'charset',
      title: 'ترميز الأحرف (Charset)',
      category: 'technical',
      status: 'info',
      severity: 'low',
      details: 'لا يوجد meta charset — قد تظهر الأحرف العربية مشوّهة.',
      recommendation: 'أضف <meta charset="UTF-8"> كأول عنصر في <head>.',
      codeExample: '<meta charset="UTF-8">',
    };
  }

  return {
    id: 'charset',
    title: 'ترميز الأحرف (Charset)',
    category: 'technical',
    status: 'pass',
    severity: 'success',
    details: 'ترميز الأحرف محدد.',
  };
}

// ============================================
// 9. فحص المحتوى
// ============================================

function checkContent(doc: Document): SeoIssue {
  const bodyText = cleanText(doc.body?.textContent);
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) {
    return {
      id: 'content',
      title: 'حجم المحتوى',
      category: 'content',
      status: 'error',
      severity: 'critical',
      details: 'لا يوجد محتوى نصي في الصفحة.',
      recommendation:
        'أضف محتوى نصيًا حقيقيًا. ملاحظة: إن كانت الصفحة SPA تُحمّل بالجافاسكربت، فالفحص قد لا يرى المحتوى.',
    };
  }

  if (wordCount < 300) {
    return {
      id: 'content',
      title: 'حجم المحتوى',
      category: 'content',
      status: 'warning',
      severity: 'low',
      details: `المحتوى قصير (${wordCount} كلمة).`,
      recommendation:
        'المحتوى القصير قد يكون مقبولًا لبعض الصفحات (مثل صفحات المنتج). راجع السياق.',
      value: `${wordCount} كلمة`,
    };
  }

  return {
    id: 'content',
    title: 'حجم المحتوى',
    category: 'content',
    status: 'pass',
    severity: 'success',
    details: `المحتوى مناسب (${wordCount} كلمة).`,
    value: `${wordCount} كلمة`,
  };
}

// ============================================
// 10. الدالة الرئيسية
// ============================================

export function analyzeHtml(
  html: string,
  source: string,
  options: AnalysisOptions = DEFAULT_OPTIONS,
  fetchInfo?: FetchInfo
): SeoReport {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const issues: SeoIssue[] = [
    checkTitle(doc),
    checkDescription(doc),
    checkCanonical(doc),
    checkRobots(doc),
    checkH1(doc),
    checkHeadingsStructure(doc),
  ];

  if (options.checkImages) {
    issues.push(checkImagesAlt(doc));
  }

  if (options.checkLinks) {
    issues.push(checkLinksText(doc));
    issues.push(checkExternalLinks(doc));
  }

  if (options.checkSocial) {
    issues.push(checkOpenGraph(doc));
    issues.push(checkTwitterCard(doc));
  }

  if (options.checkSchema) {
    issues.push(checkSchema(doc));
  }

  if (options.checkTechnical) {
    issues.push(checkViewport(doc));
    issues.push(checkLang(doc));
    issues.push(checkCharset(doc));
  }

  if (options.checkContent) {
    issues.push(checkContent(doc));
  }

  const passed = issues.filter((i) => i.status === 'pass').length;
  const warnings = issues.filter((i) => i.status === 'warning').length;
  const errors = issues.filter((i) => i.status === 'error').length;
  const infos = issues.filter((i) => i.status === 'info').length;

  const totalChecks = issues.length;
  const score =
    totalChecks === 0
      ? 0
      : Math.round(((passed + infos * 0.5) / totalChecks) * 100);

  const pageTitle = cleanText(doc.querySelector('title')?.textContent) || 'صفحة بدون عنوان';

  return {
    source,
    pageTitle,
    score,
    issues,
    totalChecks,
    passed,
    warnings,
    errors,
    infos,
    checkedAt: new Date().toISOString(),
    fetchInfo,
  };
}
