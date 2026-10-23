import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const SITE_LAUNCH_DATE = new Date('2025-01-01');
const LAST_MAJOR_UPDATE = new Date('2026-10-17');

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://intooly.com';

  const routes: Array<{
    path: string;
    priority: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastModified: Date;
  }> = [
    { path: '', priority: 1.0, frequency: 'daily', lastModified: LAST_MAJOR_UPDATE },
    { path: '/about', priority: 0.7, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    { path: '/contact', priority: 0.7, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    { path: '/privacy-policy', priority: 0.5, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    { path: '/terms', priority: 0.5, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    { path: '/disclaimer', priority: 0.5, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    { path: '/cookie-policy', priority: 0.5, frequency: 'monthly', lastModified: SITE_LAUNCH_DATE },
    
    // تصنيفات الأدوات
    { path: '/tools/pdf', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/documents', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/images', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/video', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/seo', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/productivity', priority: 0.95, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },

    // أدوات PDF
    { path: '/tools/merge-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/split-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/rotate-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/jpg-to-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/word-to-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/delete-pdf-pages', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/extract-pdf-pages', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/pdf-to-jpg', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/compress-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/organize-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/watermark-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/pdf-to-word', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/pdf-to-excel', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/pdf-to-ppt', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/sign-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/protect-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/unlock-pdf', priority: 0.9, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },

    // أدوات الصور
    { path: '/tools/background-remover', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/image-compressor', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/image-resizer', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/image-converter', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/image-cropper', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/product-photo-studio', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },

    // أدوات الفيديو
    { path: '/tools/video-compressor', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/video-converter', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/video-to-audio', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/video-trimmer', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/video-to-gif', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },

    // أدوات SEO
    { path: '/tools/keyword-generator', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/word-counter', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/seo-meta-tags', priority: 0.9, frequency: 'weekly', lastModified: new Date('2026-10-23') },
    { path: '/tools/seo-checker', priority: 0.9, frequency: 'weekly', lastModified: new Date('2026-10-24') },

    // أدوات الإنتاجية
    { path: '/tools/qr-generator', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/utm-builder', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
    { path: '/tools/what-is-my-ip', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },

    // أدوات المستندات
    { path: '/tools/jpg-to-word', priority: 0.85, frequency: 'weekly', lastModified: LAST_MAJOR_UPDATE },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.frequency,
    priority: route.priority,
  }));
}