import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const INPUT = resolve('public/logo-icon-v2.svg');
const svgBuffer = readFileSync(INPUT);

console.log('📖 قراءة logo-icon-v2.svg...');

// icon.png — لـ Next.js
await sharp(svgBuffer)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 100, compressionLevel: 9 })
  .toFile(resolve('src/app/icon.png'));
console.log('✅ src/app/icon.png (512x512)');

// apple-icon.png — لأجهزة Apple
await sharp(svgBuffer)
  .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 100, compressionLevel: 9 })
  .toFile(resolve('src/app/apple-icon.png'));
console.log('✅ src/app/apple-icon.png (180x180)');

// favicon.ico — من 48x48 PNG
const buf48 = await sharp(svgBuffer)
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();
  
// نحفظ favicon.ico (sharp يدعم ICO عبر PNG)
await sharp(buf48).toFile(resolve('src/app/favicon.ico'));
console.log('✅ src/app/favicon.ico (48x48)');

console.log('\n🎉 تم توليد أيقونات src/app/ بنجاح!');
