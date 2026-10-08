import { MetadataRoute } from 'next';

// ✅ إضافة مطلوبة لـ Static Export
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://intooly.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/cookie-policy',
    '/blog',
    '/tools/background-remover',
    '/tools/image-compressor',
    '/tools/product-photo-studio',
    '/tools/image-cropper',
    '/tools/image-converter',
    '/tools/image-resizer',
    '/tools/video-compressor',
    '/tools/video-converter',
    '/tools/video-to-audio',
    '/tools/video-trimmer',
    '/tools/video-to-gif',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}