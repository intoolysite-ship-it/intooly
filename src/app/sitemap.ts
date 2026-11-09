import { MetadataRoute } from 'next';
import * as fs from 'fs';
import * as path from 'path';

// إجبار Next.js على توليد هذا الملف بشكل ثابت أثناء البناء (مطلوب لـ output: export)
export const dynamic = 'force-static';

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
    { url: `${baseUrl}/tools`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    
    // التصنيفات الرئيسية
    { url: `${baseUrl}/tools/calculators`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/health-fitness`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/images`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/pdf`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/video`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/audio`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/seo`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/tools/productivity`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
  ];

  // 2. المسح التلقائي لمجلد الأدوات (Dynamic Tools Scanning)
  const toolsDir = path.join(process.cwd(), 'src', 'app', 'tools');
  let dynamicToolRoutes: MetadataRoute.Sitemap = [];

  if (fs.existsSync(toolsDir)) {
    // قراءة جميع المجلدات داخل src/app/tools
    const folders = fs.readdirSync(toolsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('[')) // تجاهل المجلدات الديناميكية مثل [slug]
      .map(dirent => dirent.name);

    // تحويل كل مجلد إلى رابط في خريطة الموقع
    dynamicToolRoutes = folders.map(folder => ({
      url: `${baseUrl}/tools/${folder}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  // 3. دمج الصفحات الأساسية مع الأدوات المكتشفة تلقائياً
  return [...baseRoutes, ...dynamicToolRoutes];
}