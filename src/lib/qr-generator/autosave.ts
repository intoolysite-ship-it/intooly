/**
 * حفظ تلقائي لسجلات QR في LocalStorage
 */

import type { SavedQR, QRType, QRData } from './types';

const STORAGE_KEY = 'intooly-qr-records';
const MAX_RECORDS = 100;

// ============================================
// Types
// ============================================

interface StoredRecord {
  id: string;
  apiKey: string;
  type: QRType;
  name: string;
  url: string;
  createdAt: string;
  data: QRData;
}

// ============================================
// Save QR Record
// ============================================

export function saveQrRecord(record: SavedQR): void {
  if (typeof window === 'undefined') return;

  try {
    const records = loadQrRecords();
    
    const existing = records.findIndex(r => r.id === record.id);
    if (existing >= 0) {
      records[existing] = record;
    } else {
      records.unshift(record);
    }

    const trimmed = records.slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save QR record:', error);
  }
}

// ============================================
// Load All QR Records
// ============================================

export function loadQrRecords(): SavedQR[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.warn('Failed to load QR records:', error);
    return [];
  }
}

// ============================================
// Get Single QR Record
// ============================================

export function getQrRecord(id: string): SavedQR | null {
  const records = loadQrRecords();
  return records.find(r => r.id === id) || null;
}

// ============================================
// Delete QR Record
// ============================================

export function deleteQrRecord(id: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const records = loadQrRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.warn('Failed to delete QR record:', error);
    return false;
  }
}

// ============================================
// Clear All Records
// ============================================

export function clearAllRecords(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear records:', error);
    return false;
  }
}

// ============================================
// Check if Has Records
// ============================================

export function hasRecords(): boolean {
  return loadQrRecords().length > 0;
}

// ============================================
// Get Records Count
// ============================================

export function getRecordsCount(): number {
  return loadQrRecords().length;
}

// ============================================
// Format Date for Display
// ============================================

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SA');
  } catch {
    return dateString;
  }
}
