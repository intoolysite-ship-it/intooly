/**
 * أنواع البيانات لأداة مولّد QR Code
 */

import type { QRType, ErrorCorrectionLevel } from './constants';

// إعادة تصدير الأنواع من constants
export type { QRType, ErrorCorrectionLevel };

export interface QRData {
  url?: string;
  title?: string;
  description?: string;
  text?: string;
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  address?: string;
  name?: string;
  whatsapp?: string;
  menuUrl?: string;
  catalogUrl?: string;
  location?: string;
  hours?: string;
  date?: string;
  time?: string;
  registrationUrl?: string;
  subject?: string;
  body?: string;
  data?: string;
  message?: string;
  [key: string]: any;
}

export interface QRRecord {
  id: string;
  apiKey?: string;
  type: QRType;
  data: QRData;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface CreateResponse {
  success: boolean;
  id: string;
  apiKey: string;
  url: string;
  createdAt: string;
}

export interface GetResponse {
  success: boolean;
  record: QRRecord;
}

export interface UpdateResponse {
  success: boolean;
  record: QRRecord;
}

export interface DeleteResponse {
  success: boolean;
}

export interface ListResponse {
  success: boolean;
  records: QRRecord[];
}

export interface APIError {
  error: string;
  success: false;
}

export type ToolStatus = 'idle' | 'generating' | 'creating' | 'success' | 'error' | 'loading';

export interface QRSettings {
  size: number;
  margin: number;
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
}

export interface QRState {
  status: ToolStatus;
  type: QRType;
  data: QRData;
  settings: QRSettings;
  previewDataUrl: string | null;
  record: QRRecord | null;
  error: string | null;
}

export interface SavedQR {
  id: string;
  apiKey: string;
  type: QRType;
  name: string;
  url: string;
  createdAt: string;
  data: QRData;
}

export interface QRTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: QRType;
  data: QRData;
  settings?: Partial<QRSettings>;
}

export type ExportFormat = 'png' | 'svg' | 'jpeg';

export interface ExportOptions {
  format: ExportFormat;
  size: number;
  filename?: string;
}

import { DEFAULT_QR_STATE } from './constants';

export const INITIAL_STATE: QRState = {
  status: 'idle',
  type: DEFAULT_QR_STATE.type,
  data: {},
  settings: {
    size: DEFAULT_QR_STATE.size,
    margin: DEFAULT_QR_STATE.margin,
    foreground: DEFAULT_QR_STATE.foreground,
    background: DEFAULT_QR_STATE.background,
    errorCorrection: DEFAULT_QR_STATE.errorCorrection,
  },
  previewDataUrl: null,
  record: null,
  error: null,
};
