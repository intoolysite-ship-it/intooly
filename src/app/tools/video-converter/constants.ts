// src/app/tools/video-converter/constants.ts

export type VideoFormat = 'mp4' | 'webm' | 'mov' | 'mkv' | 'avi' | 'gif' | 'mpeg' | 'ts' | 'flv' | 'vob' | 'wmv';
export type QualityPreset = 'high' | 'medium' | 'low';
export type Resolution = 'original' | 1080 | 720 | 480 | 360;

export const FORMATS: { id: VideoFormat; name: string; desc: string; icon: string; mime: string }[] = [
  { id: 'mp4',  name: 'MP4',  desc: 'الأكثر توافقاً', icon: '🎬', mime: 'video/mp4' },
  { id: 'webm', name: 'WebM', desc: 'للويب (VP8)',   icon: '🌐', mime: 'video/webm' },
  { id: 'mov',  name: 'MOV',  desc: 'لآبل',          icon: '🍎', mime: 'video/quicktime' },
  { id: 'mkv',  name: 'MKV',  desc: 'جودة عالية',   icon: '📦', mime: 'video/x-matroska' },
  { id: 'avi',  name: 'AVI',  desc: 'قديم',          icon: '📼', mime: 'video/x-msvideo' },
  { id: 'gif',  name: 'GIF',  desc: 'صور متحركة',   icon: '🎞️', mime: 'image/gif' },
  { id: 'mpeg', name: 'MPEG', desc: 'MPEG-2',        icon: '📹', mime: 'video/mpeg' },
  { id: 'ts',   name: 'TS',   desc: 'بث مباشر',     icon: '📡', mime: 'video/mp2t' },
  { id: 'flv',  name: 'FLV',  desc: 'Flash',         icon: '🔷', mime: 'video/x-flv' },
  { id: 'vob',  name: 'VOB',  desc: 'DVD',           icon: '💿', mime: 'video/dvd' },
  { id: 'wmv',  name: 'WMV',  desc: 'Windows Media', icon: '🪟', mime: 'video/x-ms-wmv' },
];

export const QUALITY_PRESETS: { id: QualityPreset; name: string; desc: string; crf: number; preset: string }[] = [
  { id: 'high',   name: 'عالية',   desc: 'جودة ممتازة',  crf: 20, preset: 'fast' },
  { id: 'medium', name: 'متوسطة', desc: 'متوازنة',      crf: 23, preset: 'superfast' },
  { id: 'low',    name: 'منخفضة', desc: 'حجم أصغر',     crf: 28, preset: 'ultrafast' },
];

export const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: 'original', label: 'الأصلية (بدون تغيير)' },
  { value: 1080, label: '1080p (Full HD)' },
  { value: 720,  label: '720p (HD)' },
  { value: 480,  label: '480p (SD)' },
  { value: 360,  label: '360p (منخفض)' },
];

export const LOCAL_FFMPEG_BASE = '/assets/ffmpeg';
