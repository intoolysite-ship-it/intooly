import { MetadataRoute } from 'next';

// ✅ إضافة مطلوبة لـ Static Export
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://intooly.com';

  const routes: Array<{ path: string; priority: number; frequency: 'daily' | 'weekly' | 'monthly' }> = [
    // الصفحة الرئيسية
    { path: '', priority: 1.0, frequency: 'daily' },

    // صفحات الثقة
    { path: '/about', priority: 0.7, frequency: 'monthly' },
    { path: '/contact', priority: 0.7, frequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.5, frequency: 'monthly' },
    { path: '/terms', priority: 0.5, frequency: 'monthly' },
    { path: '/disclaimer', priority: 0.5, frequency: 'monthly' },
    { path: '/cookie-policy', priority: 0.5, frequency: 'monthly' },

    // صفحة تصنيف PDF
    { path: '/tools/pdf', priority: 0.95, frequency: 'weekly' },

    // أدوات PDF (10 أدوات)
    { path: '/tools/merge-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/split-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/rotate-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/jpg-to-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/delete-pdf-pages', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/extract-pdf-pages', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/pdf-to-jpg', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/compress-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/organize-pdf', priority: 0.9, frequency: 'weekly' },
    { path: '/tools/watermark-pdf', priority: 0.9, frequency: 'weekly' },

    // أدوات الصور
    { path: '/tools/background-remover', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/image-compressor', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/image-resizer', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/image-converter', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/image-cropper', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/product-photo-studio', priority: 0.85, frequency: 'weekly' },

    // أدوات الفيديو
    { path: '/tools/video-compressor', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/video-converter', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/video-to-audio', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/video-trimmer', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/video-to-gif', priority: 0.85, frequency: 'weekly' },

    // أدوات SEO
    { path: '/tools/keyword-generator', priority: 0.85, frequency: 'weekly' },
    { path: '/tools/word-counter', priority: 0.85, frequency: 'weekly' },

    // أدوات الإنتاجية
    { path: '/tools/qr-generator', priority: 0.85, frequency: 'weekly' },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
}
