/**
 * منطق تحويل الفيديو إلى GIF
 * يستخدم FFmpeg WebAssembly (محلي 100%)
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { GIF_CONFIG } from './constants';
import type { FFmpegOptions } from './types';

// ============================================
// تحميل FFmpeg
// ============================================

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) {
        const percent = Math.max(0, Math.min(100, progress * 100));
        onProgress(percent);
      }
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoadPromise;
}

export function resetFFmpeg(): void {
  ffmpegInstance = null;
  ffmpegLoadPromise = null;
}

// ============================================
// دوال مساعدة
// ============================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
}

export function isVideoFile(file: File): boolean {
  return (GIF_CONFIG.ACCEPTED_VIDEO_TYPES as readonly string[]).includes(file.type) ||
    (GIF_CONFIG.VIDEO_EXTENSIONS as readonly string[]).includes(getFileExtension(file.name));
}

// ============================================
// دوال التحويل
// ============================================

function buildVideoToGifCommand(options: FFmpegOptions, inputName: string): string[] {
  const { outputName, fps, width, startTime, duration } = options;

  const args: string[] = [];

  // قص الوقت
  if (startTime > 0) {
    args.push('-ss', startTime.toString());
  }
  if (duration > 0) {
    args.push('-t', duration.toString());
  }

  // المدخل
  args.push('-i', inputName);

  // فلتر: fps + scale + palette (لجودة عالية)
  const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`;

  args.push('-filter_complex', filter);

  // تكرار لا نهائي
  args.push('-loop', '0');

  // المخرج
  args.push(outputName);

  return args;
}

export async function convertVideoToGif(
  file: File,
  options: FFmpegOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const ffmpeg = await loadFFmpeg();

  // توليد اسم الملف
  const ext = getFileExtension(file.name).slice(1) || 'mp4';
  const inputName = `input-${Date.now()}.${ext}`;
  
  console.log('📁 Input file name:', file.name, '→ FFmpeg name:', inputName);
  console.log('📁 Output file name:', options.outputName);
  console.log('📁 File size:', file.size, 'bytes');
  
  try {
    const fileData = await fetchFile(file);
    console.log('✅ fetchFile success, size:', fileData.byteLength);
    await ffmpeg.writeFile(inputName, fileData);
    console.log('✅ writeFile success');
  } catch (e) {
    console.error('❌ Failed to write file:', e);
    throw new Error('فشل تحميل الملف إلى FFmpeg: ' + (e instanceof Error ? e.message : 'unknown'));
  }

  const args = buildVideoToGifCommand(options, inputName);
  console.log('🎬 FFmpeg command:', args.join(' '));

  try {
    await ffmpeg.exec(args);
    console.log('✅ exec success');
  } catch (e) {
    console.error('❌ exec failed:', e);
    throw new Error('فشل تنفيذ FFmpeg: ' + (e instanceof Error ? e.message : 'unknown'));
  }

  const data = await ffmpeg.readFile(options.outputName);

  // تنظيف
  await cleanupFFmpegFiles([inputName, options.outputName]);

  if (typeof data === 'string') {
    throw new Error('FFmpeg returned string instead of binary');
  }
  return data as Uint8Array;
}

async function cleanupFFmpegFiles(filenames: string[]): Promise<void> {
  if (!ffmpegInstance) return;
  for (const name of filenames) {
    try {
      await ffmpegInstance.deleteFile(name);
    } catch (e) {
      // تجاهل
    }
  }
}

export function cancelFFmpeg(): void {
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch (e) {
      // تجاهل
    }
    resetFFmpeg();
  }
}

export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('فشل قراءة الفيديو'));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const dims = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      URL.revokeObjectURL(video.src);
      resolve(dims);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('فشل قراءة أبعاد الفيديو'));
    };
    video.src = URL.createObjectURL(file);
  });
}
