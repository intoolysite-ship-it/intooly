import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. تفعيل التصدير الثابت لاستضافة Hostinger المشتركة (مهم جداً)
  output: 'export',
  
  // 2. توجيه المخرجات مباشرة إلى مجلد public_html ليقرأه السيرفر
  distDir: 'public_html',

  // 3. تعطيل تحسين الصور الافتراضي (لأنه يتطلب خادم Node.js)
  images: {
    unoptimized: true,
  },

  // 4. إعداداتك السابقة (مهمة لعمل Turbopack و Webpack)
  turbopack: {}, 
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
