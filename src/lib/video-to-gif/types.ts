/**
 * أنواع البيانات لأداة تحويل الفيديو إلى GIF
 */

/**
 * حالة المعالجة
 */
export type ProcessingStatus =
  | 'idle'
  | 'loading-ffmpeg'
  | 'reading-file'
  | 'processing'
  | 'success'
  | 'error';

/**
 * إعدادات التحويل
 */
export interface GifSettings {
  fps: number;
  width: number;
  startTime: number;
  endTime: number;
  duration: number;
}

/**
 * ملف فيديو مُدخل
 */
export interface InputFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * نتيجة التحويل
 */
export interface GifResult {
  id: string;
  url: string;
  blob: Blob;
  name: string;
  size: number;
  width: number;
  height: number;
  fps: number;
  duration: number;
  createdAt: Date;
}

/**
 * حالة الأداة العامة
 */
export interface ToolState {
  status: ProcessingStatus;
  progress: number;
  message: string;
  inputFile: InputFile | null;
  result: GifResult | null;
  settings: GifSettings;
  error: string | null;
}

/**
 * خيارات FFmpeg
 */
export interface FFmpegOptions {
  outputName: string;
  fps: number;
  width: number;
  startTime: number;
  duration: number;
}

/**
 * نتيجة فحص ملف
 */
export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * إعدادات افتراضية
 */
export const DEFAULT_SETTINGS: GifSettings = {
  fps: 15,
  width: 480,
  startTime: 0,
  endTime: 10,
  duration: 10,
};
