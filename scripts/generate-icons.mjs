import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const INPUT = resolve('public/logo-icon.svg');
const OUTPUTS = [
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'favicon-144x144.png', size: 144 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
];

console.log('📖 قراءة logo-icon.svg...');
const svgBuffer = readFileSync(INPUT);
console.log('✅ تم القراءة بنجاح');

for (const { name, size } of OUTPUTS) {
  const outputPath = resolve('public', name);
  await sharp(svgBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`✅ ${name} (${size}x${size})`);
}

console.log('\n🎉 تم إنشاء جميع الأيقونات بنجاح!');
