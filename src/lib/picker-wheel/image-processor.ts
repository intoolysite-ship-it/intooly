const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const WEBP_QUALITY = 0.85;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export interface ProcessedWheelImage {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة الصورة. تأكد من سلامة الملف.'));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تعذر ضغط الصورة.'));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function processWheelImage(
  file: File,
): Promise<ProcessedWheelImage> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('الصيغ المدعومة هي JPEG وPNG وWebP فقط.');
  }

  if (file.size === 0) {
    throw new Error('ملف الصورة فارغ.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('حجم الصورة يتجاوز الحد الأقصى المسموح به وهو 15 ميجابايت.');
  }

  const image = await loadImage(file);

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('أبعاد الصورة غير صالحة.');
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(
      image.naturalWidth,
      image.naturalHeight,
    ),
  );

  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('المتصفح لا يدعم معالجة الصور المطلوبة.');
  }

  context.drawImage(image, 0, 0, width, height);

  let blob: Blob;
  let mimeType = 'image/webp';

  try {
    blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);

    if (blob.type !== 'image/webp') {
      throw new Error('WebP غير مدعوم.');
    }
  } catch {
    blob = await canvasToBlob(canvas, 'image/png', 1);
    mimeType = 'image/png';
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }

  return {
    blob,
    mimeType,
    width,
    height,
    originalSize: file.size,
    processedSize: blob.size,
  };
}
