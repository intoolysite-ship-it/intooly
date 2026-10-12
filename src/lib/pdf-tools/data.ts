// بيانات أدوات PDF — المصدر الموحد
// يستخدم في صفحة التصنيف /tools/pdf وصفحات الأدوات الفردية

export type PdfToolCategory =
  | 'convert'   // تحويل
  | 'organize'  // تنظيم
  | 'compress'  // ضغط
  | 'security'  // حماية
  | 'extract';  // استخراج

export type PdfTool = {
  slug: string;
  name: string;
  seoTitle: string;
  metaDescription: string;
  description: string;
  category: PdfToolCategory;
  icon: string;          // اسم أيقونة lucide-react
  priority: 1 | 2 | 3;   // أولوية التنفيذ
  needsWorker: boolean;  // هل يحتاج Worker؟
  isReady: boolean;      // هل الأداة جاهزة للنشر؟
};

export const PDF_CATEGORIES: Record<
  PdfToolCategory,
  { title: string; description: string }
> = {
  convert: {
    title: 'أدوات التحويل',
    description: 'حوّل ملفات PDF إلى صيغ أخرى والعكس',
  },
  organize: {
    title: 'تنظيم الصفحات',
    description: 'دمج، تقسيم، ترتيب، وحذف الصفحات',
  },
  compress: {
    title: 'ضغط وتحسين',
    description: 'تقليل حجم الملفات وتحسين جودتها',
  },
  security: {
    title: 'الحماية والتوقيع',
    description: 'حماية الملفات، إزالة الحماية، والتوقيع',
  },
  extract: {
    title: 'استخراج المحتوى',
    description: 'استخراج النصوص والصور والجداول',
  },
};

export const PDF_TOOLS: PdfTool[] = [
  // ============================================
  // المرحلة 1 — الأدوات الأساسية
  // ============================================
  {
    slug: 'merge-pdf',
    name: 'دمج PDF',
    seoTitle: 'دمج PDF أونلاين مجانًا – دمج ملفات PDF في ملف واحد | Intooly',
    metaDescription:
      'اجمع عدة ملفات PDF في مستند واحد بسهولة. رتّب الملفات قبل الدمج ثم نزّل النتيجة فورًا. مجاني وبدون تسجيل.',
    description: 'اجمع عدة ملفات PDF في ملف واحد مع إمكانية الترتيب',
    category: 'organize',
    icon: 'Merge',
    priority: 1,
    needsWorker: false,
    isReady: true,
  },
  {
    slug: 'split-pdf',
    name: 'تقسيم PDF',
    seoTitle: 'تقسيم PDF أونلاين – فصل صفحات ملف PDF بسهولة | Intooly',
    metaDescription:
      'قسّم ملف PDF إلى ملفات أصغر حسب نطاق الصفحات. مجاني، سريع، وبدون رفع إلى خادم.',
    description: 'استخرج نطاقات صفحات أو قسّم المستند إلى ملفات أصغر',
    category: 'organize',
    icon: 'Scissors',
    priority: 1,
    needsWorker: false,
    isReady: true,
  },
  {
    slug: 'delete-pdf-pages',
    name: 'حذف صفحات PDF',
    seoTitle: 'حذف صفحات من PDF أونلاين مجانًا | Intooly',
    metaDescription:
      'احذف الصفحات غير المطلوبة من ملف PDF واحتفظ بالصفحات التي تحتاجها. معاينة قبل التنزيل.',
    description: 'اختر الصفحات المطلوب حذفها مع معاينة قبل التنزيل',
    category: 'organize',
    icon: 'Trash2',
    priority: 1,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'rotate-pdf',
    name: 'تدوير PDF',
    seoTitle: 'تدوير صفحات PDF أونلاين – تعديل اتجاه الصفحات | Intooly',
    metaDescription:
      'دوّر صفحات PDF إلى الاتجاه الصحيح، لصفحة واحدة أو لجميع الصفحات. مجاني وبدون تسجيل.',
    description: 'تدوير صفحات محددة أو جميع الصفحات ثم حفظ الملف',
    category: 'organize',
    icon: 'RotateCw',
    priority: 1,
    needsWorker: false,
    isReady: true,
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG إلى PDF',
    seoTitle: 'تحويل JPG إلى PDF أونلاين مجانًا | Intooly',
    metaDescription:
      'حوّل صور JPG وPNG إلى ملف PDF واحد. رتّب الصور، واضبط حجم الصفحة والهوامش.',
    description: 'قبول JPG وPNG وترتيب الصور وضبط حجم الصفحة',
    category: 'convert',
    icon: 'Image',
    priority: 1,
    needsWorker: false,
    isReady: false,
  },

  // ============================================
  // المرحلة 2 — أدوات التحويل والتنظيم
  // ============================================
  {
    slug: 'pdf-to-jpg',
    name: 'PDF إلى JPG',
    seoTitle: 'تحويل PDF إلى JPG أونلاين – تحويل صفحات PDF إلى صور | Intooly',
    metaDescription:
      'حوّل صفحات PDF إلى صور JPG قابلة للتنزيل، مع اختيار الصفحات وجودة الصور.',
    description: 'تحويل صفحات PDF إلى صور JPG قابلة للتنزيل',
    category: 'convert',
    icon: 'FileImage',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'organize-pdf',
    name: 'ترتيب صفحات PDF',
    seoTitle: 'ترتيب صفحات PDF أونلاين وإعادة تنظيمها | Intooly',
    metaDescription:
      'غيّر ترتيب صفحات PDF بالسحب والإفلات، ثم احفظ المستند بالترتيب الجديد.',
    description: 'غيّر ترتيب صفحات PDF بالسحب والإفلات',
    category: 'organize',
    icon: 'LayoutGrid',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'extract-pdf-pages',
    name: 'استخراج صفحات PDF',
    seoTitle: 'استخراج صفحات من PDF – حفظ صفحات محددة | Intooly',
    metaDescription:
      'اختر صفحات محددة من ملف PDF واحفظها في مستند مستقل دون تقسيم يدوي.',
    description: 'اختر صفحات محددة واحفظها في مستند مستقل',
    category: 'extract',
    icon: 'FileOutput',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'compress-pdf',
    name: 'ضغط PDF',
    seoTitle: 'ضغط PDF أونلاين مجانًا – تقليل حجم ملف PDF | Intooly',
    metaDescription:
      'قلّل حجم ملفات PDF لتسهيل رفعها وإرسالها. اختر مستوى الضغط وحافظ على الجودة.',
    description: 'قلّل حجم ملف PDF مع الحفاظ على الجودة',
    category: 'compress',
    icon: 'Minimize2',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'watermark-pdf',
    name: 'علامة مائية PDF',
    seoTitle: 'إضافة علامة مائية إلى PDF أونلاين | Intooly',
    metaDescription:
      'أضف علامة مائية نصية إلى صفحات PDF. اضبط موضعها وحجمها وشفافيتها.',
    description: 'أضف علامة مائية نصية إلى صفحات PDF',
    category: 'security',
    icon: 'Stamp',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'add-page-numbers-pdf',
    name: 'ترقيم صفحات PDF',
    seoTitle: 'إضافة أرقام الصفحات إلى PDF أونلاين | Intooly',
    metaDescription:
      'رقّم صفحات ملف PDF، وحدد موضع الأرقام وحجمها وتنسيقها، ثم نزّل النسخة الجديدة.',
    description: 'أضف أرقام الصفحات إلى PDF بموضع وتنسيق مخصص',
    category: 'organize',
    icon: 'Hash',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'protect-pdf',
    name: 'حماية PDF',
    seoTitle: 'حماية PDF بكلمة مرور – تشفير ملفات PDF | Intooly',
    metaDescription:
      'أضف حماية بكلمة مرور إلى ملفات PDF، وتحقق من إمكانية فتح الملف بعد الحماية.',
    description: 'أضف حماية بكلمة مرور إلى ملف PDF',
    category: 'security',
    icon: 'Lock',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'pdf-to-text',
    name: 'PDF إلى نص',
    seoTitle: 'تحويل PDF إلى نص – استخراج النص من PDF | Intooly',
    metaDescription:
      'استخرج النص القابل للتحديد من ملفات PDF وانسخه أو نزّله. الملفات الممسوحة تحتاج OCR.',
    description: 'استخرج النص من PDF القابل للتحديد',
    category: 'extract',
    icon: 'FileText',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG إلى PDF',
    seoTitle: 'تحويل PNG إلى PDF أونلاين مجانًا | Intooly',
    metaDescription:
      'حوّل صور PNG إلى ملف PDF، ورتّب الصور وحدد حجم الصفحة والاتجاه.',
    description: 'حوّل صور PNG إلى ملف PDF واحد',
    category: 'convert',
    icon: 'ImagePlus',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'sign-pdf',
    name: 'التوقيع على PDF',
    seoTitle: 'التوقيع على PDF أونلاين – إضافة توقيع إلى ملف PDF | Intooly',
    metaDescription:
      'أضف توقيعًا مرسومًا أو صورة توقيع إلى ملف PDF، وحدد موضعه ثم نزّل المستند.',
    description: 'أضف توقيعًا مرسومًا أو صورة إلى PDF',
    category: 'security',
    icon: 'PenTool',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'edit-pdf',
    name: 'تعديل PDF',
    seoTitle: 'تعديل PDF أونلاين – إضافة نصوص وصور إلى PDF | Intooly',
    metaDescription:
      'أضف نصوصًا أو صورًا إلى ملف PDF وعدّل العناصر المدعومة، ثم احفظ النسخة النهائية.',
    description: 'أضف نصوصًا وصورًا إلى ملف PDF',
    category: 'organize',
    icon: 'Edit3',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'extract-images-from-pdf',
    name: 'استخراج الصور من PDF',
    seoTitle: 'استخراج الصور من PDF وحفظها على جهازك | Intooly',
    metaDescription:
      'استخرج الصور المضمنة في ملف PDF ونزّل الصور المتاحة كل واحدة على حدة.',
    description: 'استخرج الصور المضمنة في PDF',
    category: 'extract',
    icon: 'Images',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'unlock-pdf',
    name: 'إزالة كلمة مرور PDF',
    seoTitle: 'إزالة كلمة مرور PDF – فتح الملفات المحمية | Intooly',
    metaDescription:
      'أزل الحماية من ملف PDF تملكه أو لديك صلاحية تعديله، عندما تكون طريقة فك الحماية مدعومة.',
    description: 'أزل الحماية من ملف PDF مصرّح به',
    category: 'security',
    icon: 'Unlock',
    priority: 2,
    needsWorker: false,
    isReady: false,
  },

  // ============================================
  // المرحلة 3 — أدوات متقدمة
  // ============================================
  {
    slug: 'pdf-to-word',
    name: 'PDF إلى Word',
    seoTitle: 'تحويل PDF إلى Word أونلاين – ملف Word قابل للتعديل | Intooly',
    metaDescription:
      'حوّل ملفات PDF إلى Word لتسهيل تحرير النصوص. تحقق من تنسيق الملف قبل الاستخدام.',
    description: 'حوّل PDF إلى Word قابل للتعديل',
    category: 'convert',
    icon: 'FileType',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'pdf-to-excel',
    name: 'PDF إلى Excel',
    seoTitle: 'تحويل PDF إلى Excel – استخراج الجداول إلى Excel | Intooly',
    metaDescription:
      'استخرج الجداول من ملفات PDF إلى Excel، وراجع الأعمدة والأرقام بعد التحويل.',
    description: 'استخرج الجداول من PDF إلى Excel',
    category: 'convert',
    icon: 'Table',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'excel-to-pdf',
    name: 'Excel إلى PDF',
    seoTitle: 'تحويل Excel إلى PDF أونلاين مجانًا | Intooly',
    metaDescription:
      'حوّل جداول Excel إلى PDF مع مراجعة اتجاه الصفحة وعرض الأعمدة قبل الحفظ.',
    description: 'حوّل Excel إلى PDF',
    category: 'convert',
    icon: 'FileSpreadsheet',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'ppt-to-pdf',
    name: 'PowerPoint إلى PDF',
    seoTitle: 'تحويل PowerPoint إلى PDF أونلاين | Intooly',
    metaDescription:
      'حوّل عروض PowerPoint إلى PDF لتسهيل المشاركة والطباعة، وتحقق من الشرائح بعد التحويل.',
    description: 'حوّل PowerPoint إلى PDF',
    category: 'convert',
    icon: 'Presentation',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'word-to-pdf',
    name: 'Word إلى PDF',
    seoTitle: 'تحويل Word إلى PDF أونلاين مجانًا | Intooly',
    metaDescription:
      'حوّل مستندات Word إلى PDF للمشاركة والطباعة، وتحقق من الخطوط والتنسيق.',
    description: 'حوّل Word إلى PDF',
    category: 'convert',
    icon: 'FileText',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'ocr-pdf',
    name: 'OCR PDF',
    seoTitle: 'استخراج النص من PDF ممسوح ضوئيًا باستخدام OCR | Intooly',
    metaDescription:
      'حوّل صفحات PDF الممسوحة ضوئيًا إلى نص قابل للبحث والنسخ باستخدام OCR.',
    description: 'استخرج النص من PDF ممسوح ضوئيًا',
    category: 'extract',
    icon: 'ScanText',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
  {
    slug: 'repair-pdf',
    name: 'إصلاح PDF',
    seoTitle: 'إصلاح ملفات PDF التالفة واستعادة إمكانية فتحها | Intooly',
    metaDescription:
      'جرّب استعادة ملفات PDF التي لا تفتح بشكل صحيح. تعتمد إمكانية الإصلاح على نوع التلف.',
    description: 'جرّب استعادة ملفات PDF التالفة',
    category: 'compress',
    icon: 'Wrench',
    priority: 3,
    needsWorker: false,
    isReady: false,
  },
];
