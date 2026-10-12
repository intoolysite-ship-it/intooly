// ثوابت أداة توليد الصور بالذكاء الاصطناعي

import type { StyleKey, RatioKey } from './types';

// الأنماط الفنية
export const STYLES: Record<StyleKey, string> = {
  realistic: 'photorealistic, natural lighting, detailed, sharp focus',
  digital: 'high quality digital art, rich detail, polished composition',
  anime: 'anime illustration, clean line art, vibrant colors',
  watercolor: 'watercolor painting, soft pigments, paper texture',
  oil: 'oil painting, visible brush strokes, rich colors',
  '3d': '3D render, detailed materials, studio lighting',
  minimal: 'minimalist composition, clean shapes, negative space',
  fantasy: 'fantasy concept art, magical atmosphere, cinematic lighting',
};

// أبعاد اللوحة حسب النسبة
export const DIMENSIONS: Record<RatioKey, [number, number]> = {
  '1:1': [512, 512],
  '4:3': [512, 384],
  '3:4': [384, 512],
  '16:9': [640, 360],
};

// الحد الأقصى لعدد الصور المحفوظة في السجل
export const MAX_HISTORY = 6;

// مفتاح التخزين المحلي للسجل
export const HISTORY_STORAGE_KEY = 'intooly-ai-image-history-v1';

// النص الافتراضي للعناصر غير المرغوبة
export const DEFAULT_NEGATIVE_PROMPT = 'blurry, low quality, distorted';
