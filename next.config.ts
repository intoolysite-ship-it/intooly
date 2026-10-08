import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // إضافة هذا السطر لحل مشكلة Turbopack في Next.js 16
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