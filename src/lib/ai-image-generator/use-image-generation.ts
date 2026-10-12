'use client';

import { useCallback, useState } from 'react';

const WORKER_URL = 'https://intooly-ai-image.intoolysite.workers.dev';

type GenerateParams = {
  prompt: string;
  negativePrompt: string;
  steps: number;
  width: number;
  height: number;
  seed?: string;
  style?: string;
  ratio?: string;
  customWidth?: number;
  customHeight?: number;
};

type WorkerResponse = {
  success: boolean;
  image: string;
  format: string;
  error?: string;
};

function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    const translation = data?.[0]?.map((item: unknown[]) => item[0]).join('') || '';
    return translation.trim() || text;
  } catch {
    return text;
  }
}

export function useImageGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [engineReady] = useState(true);

  const generate = useCallback(
    async (params: GenerateParams): Promise<string> => {
      const { prompt, negativePrompt, style, ratio, customWidth, customHeight } = params;

      setError('');
      setIsLoading(true);

      try {
        let promptEn = prompt;
        if (containsArabic(prompt)) {
          setStatus('جارٍ ترجمة الوصف…');
          promptEn = await translateToEnglish(prompt);
        }

        const fullPrompt = negativePrompt
          ? `${promptEn}. Avoid: ${negativePrompt}`
          : promptEn;

        setStatus('جارٍ توليد الصورة على Cloudflare…');

        const payload: Record<string, unknown> = {
          prompt: fullPrompt,
          style: style || 'realistic',
        };

        // إذا استخدم المستخدم الأبعاد المخصصة
        if (customWidth && customHeight) {
          payload.customWidth = customWidth;
          payload.customHeight = customHeight;
        } else {
          payload.ratio = ratio || '1:1';
        }

        const response = await fetch(`${WORKER_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Worker error (${response.status}): ${errText}`);
        }

        const data: WorkerResponse = await response.json();

        if (!data.success || !data.image) {
          throw new Error(data.error || 'لم يتم استلام صورة');
        }

        const mimeType = data.format === 'jpeg' ? 'image/jpeg' : 'image/png';
        return `data:${mimeType};base64,${data.image}`;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'فشل التوليد';
        setError(message);
        throw e;
      } finally {
        setIsLoading(false);
        setStatus('');
      }
    },
    []
  );

  return { generate, isLoading, status, error, setError, engineReady };
}
