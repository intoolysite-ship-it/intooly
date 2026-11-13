import { MetadataRoute } from 'next';
import * as fs from 'fs';
import * as path from 'path';

// إجبار Next.js على توليد هذا الملف بشكل ثابت أثناء البناء (مطلوب لـ output: export)
export const dynamic = 'force-static';

/**
 * دالة متكررة تقرأ كل مجلد داخل مسار معين
 * وتُرجع المسار النسبي لكل صفحة (page.tsx) تجدها.
 * تتجاهل:
 * - المجلدات الديناميكية [slug]
 * - المجلدات الخاصة _folder
 * - ملفات API
 * - ملفات layout.tsx وليس page.tsx
 */
function collectPages(dir: string, baseDir: string, results: string[] = []): string[] {
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // تجاهل المجلدات الديناميكية والخاصة
      if (entry.name.startsWith('[') || entry.name.startsWith('_')) continue;
      // تجاهل مجلد api
      if (entry.name === 'api') continue;
      collectPages(fullPath, baseDir, results);
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      // احسب المسار النسبي
      const relativePath = path.relative(baseDir, dir);
      const url = relativePath ? `/${relativePath.split(path.sep).join('/')}` : '';
      results.push(url);
    }
  }

  return results;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://intooly.com';
  const lastModified = new Date();

  // 1. الصفحات الأساسية والثابتة
  const baseRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/tools`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
  ];

  // 2. التصنيفات الرئيسية (مكتوبة يدوياً)
  const categoryRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/tools/calculators`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/health-fitness`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/images`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/pdf`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/video`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/audio`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/seo`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/productivity`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/documents`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
  ];

  // 3. المسح التلقائي المتكرر لكل صفحات الأدوات
  const toolsDir = path.join(process.cwd(), 'src', 'app', 'tools');
  const toolPages = collectPages(toolsDir, path.join(process.cwd(), 'src', 'app'));

  // تجنب التكرار (لو كانت الصفحة موجودة في التصنيفات)
  const categoryUrls = new Set(categoryRoutes.map(r => r.url));

  const dynamicToolRoutes: MetadataRoute.Sitemap = toolPages
    .map(page => `${baseUrl}${page}`)
    .filter(url => !categoryUrls.has(url))
    .map(url => ({
      url,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // 4. دمج الكل
  return [...baseRoutes, ...categoryRoutes, ...dynamicToolRoutes];
}