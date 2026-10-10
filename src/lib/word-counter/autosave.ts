/**
 * حفظ المسودات تلقائياً في LocalStorage
 * حفظ + استرجاع + حذف
 */

import { WORD_COUNTER_CONFIG } from './constants';
import type { ToolMode } from './constants';

// ============================================
// نوع المسودة
// ============================================

export interface Draft {
  id: string;
  text: string;
  mode: ToolMode;
  goal?: {
    target: number;
    unit: 'word' | 'char';
  };
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

// ============================================
// 1. حفظ المسودة
// ============================================

export function saveDraft(
  text: string,
  mode: ToolMode,
  goal?: { target: number; unit: 'word' | 'char' }
): Draft | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const draft: Draft = {
      id: 'current',
      text,
      mode,
      goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
    };
    
    localStorage.setItem(
      WORD_COUNTER_CONFIG.STORAGE_KEY,
      JSON.stringify(draft)
    );
    
    return draft;
  } catch (e) {
    console.error('Save draft error:', e);
    return null;
  }
}

// ============================================
// 2. استرجاع المسودة
// ============================================

export function loadDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(WORD_COUNTER_CONFIG.STORAGE_KEY);
    if (!stored) return null;
    
    const draft: Draft = JSON.parse(stored);
    
    // التحقق من الصلاحية
    if (!draft.text || typeof draft.text !== 'string') {
      return null;
    }
    
    return draft;
  } catch (e) {
    console.error('Load draft error:', e);
    return null;
  }
}

// ============================================
// 3. حذف المسودة
// ============================================

export function deleteDraft(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(WORD_COUNTER_CONFIG.STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Delete draft error:', e);
    return false;
  }
}

// ============================================
// 4. هل يوجد مسودة محفوظة؟
// ============================================

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(WORD_COUNTER_CONFIG.STORAGE_KEY);
    return !!stored;
  } catch (e) {
    return false;
  }
}

// ============================================
// 5. آخر وقت حفظ
// ============================================

export function getLastSaveTime(): Date | null {
  const draft = loadDraft();
  if (!draft || !draft.updatedAt) return null;
  
  try {
    return new Date(draft.updatedAt);
  } catch (e) {
    return null;
  }
}

// ============================================
// 6. تنسيق آخر حفظ
// ============================================

export function formatLastSaveTime(date: Date | null): string {
  if (!date) return 'لا يوجد حفظ سابق';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar-SA');
}

// ============================================
// 7. حفظ تلقائي مجدول
// ============================================

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleAutosave(
  text: string,
  mode: ToolMode,
  goal?: { target: number; unit: 'word' | 'char' }
): void {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
  
  autosaveTimer = setTimeout(() => {
    saveDraft(text, mode, goal);
  }, WORD_COUNTER_CONFIG.AUTOSAVE_INTERVAL);
}

export function cancelAutosave(): void {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

// ============================================
// 8. تنسيق الحجم (لتخزين)
// ============================================

export function getStorageSize(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(WORD_COUNTER_CONFIG.STORAGE_KEY);
    if (!stored) return 0;
    return new Blob([stored]).size;
  } catch (e) {
    return 0;
  }
}

// ============================================
// 9. تنسيق البايتات
// ============================================

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
