'use client';

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import {
  Upload, Download, Video, Sparkles, ChevronDown, Trash2,
  CheckCircle2, Wand2, Loader2, AlertCircle, FileArchive, Film,
  RotateCcw, RefreshCw, Scissors, Settings2, Volume2, VolumeX,
  Plus, X, Copy, Layers, ZoomIn, ZoomOut, Play, Pause,
  SkipBack, SkipForward, Merge, Undo2, Redo2, Flag, Save,
  Keyboard, Eye, EyeOff, Sliders, Target, Gauge, Music
} from 'lucide-react';
import { saveAs } from 'file-saver';

// ============================================================
// ✅ الأنواع
// ============================================================
type Segment = {
  id: string;
  start: number;
  end: number;
  label: string;
  color: string;
};

type Marker = {
  id: string;
  time: number;
  label: string;
  color: string;
};

type Resolution = 'original' | '4k' | '1080p' | '720p' | '480p' | 'custom';
type FPS = 'original' | 24 | 25 | 30 | 50 | 60;

type Settings = {
  resolution: Resolution;
  customWidth: number;
  customHeight: number;
  fps: FPS;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  mute: boolean;
  normalizeAudio: boolean;
};

type VideoState = {
  file: File | null;
  originalUrl: string | null;
  trimmedUrl: string | null;
  originalSize: number;
  trimmedSize: number | null;
  duration: number;
  width: number | null;
  height: number | null;
  status: 'idle' | 'loading-ffmpeg' | 'trimming' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
};

// ============================================================
// ✅ الثوابت
// ============================================================
const FFMPEG_CDNS = [
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
  'https://cdn.skypack.dev/@ffmpeg/core@0.12.6/dist/umd',
];

const QUALITY_PRESETS = [
  { id: 'copy', name: 'بدون إعادة ترميز', desc: 'أسرع — جودة أصلية', crf: 0, icon: '⚡' },
  { id: 'high', name: 'عالية', desc: 'CRF 20', crf: 20, icon: '💎' },
  { id: 'medium', name: 'متوسطة', desc: 'CRF 23', crf: 23, icon: '⚖️' },
  { id: 'low', name: 'منخفضة', desc: 'CRF 28', crf: 28, icon: '🗜️' },
];

const SEGMENT_COLORS = [
  { id: 'brand', solid: '#eab308', light: 'rgba(234, 179, 8, 0.4)' },
  { id: 'blue', solid: '#3b82f6', light: 'rgba(59, 130, 246, 0.4)' },
  { id: 'purple', solid: '#a855f7', light: 'rgba(168, 85, 247, 0.4)' },
  { id: 'pink', solid: '#ec4899', light: 'rgba(236, 72, 153, 0.4)' },
  { id: 'orange', solid: '#f97316', light: 'rgba(249, 115, 22, 0.4)' },
  { id: 'emerald', solid: '#10b981', light: 'rgba(16, 185, 129, 0.4)' },
  { id: 'cyan', solid: '#06b6d4', light: 'rgba(6, 182, 212, 0.4)' },
  { id: 'red', solid: '#ef4444', light: 'rgba(239, 68, 68, 0.4)' },
];

const MARKER_COLORS = ['#eab308', '#ef4444', '#3b82f6', '#10b981', '#a855f7'];

const BASE_PPS = 80;
const SNAP_THRESHOLD = 0.3;
const TIMELINE_PADDING = 24;
const IDB_NAME = 'intooly-video-trimmer';
const IDB_VERSION = 1;
const IDB_STORE = 'projects';

// ============================================================
// ✅ IndexedDB Helpers
// ============================================================
async function openProjectDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB غير مدعوم'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
  });
}

async function saveProject(data: any): Promise<void> {
  try {
    const db = await openProjectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const request = store.put(data, 'current');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) { console.warn('[AutoSave] فشل الحفظ:', e); }
}

async function clearProject(): Promise<void> {
  try {
    const db = await openProjectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const request = store.delete('current');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) { console.warn(e); }
}

// ============================================================
// 🎬 Timeline Editor
// ============================================================
type TimelineActions = {
  onSelectSegment: (id: string) => void;
  onSeek: (time: number) => void;
  onSplit: () => void;
  onDelete: (id: string) => void;
  onRippleDelete: (id: string) => void;
  onAddMarker: () => void;
  onJumpMarker: (time: number) => void;
  onSegmentsChange: (updater: (prev: Segment[]) => Segment[]) => void;
  onCommitSegments: (segs: Segment[]) => void;
};

type TimelineEditorProps = {
  duration: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  thumbnails: string[];
  waveform: number[];
  showWaveform: boolean;
  showMarkers: boolean;
  segments: Segment[];
  markers: Marker[];
  activeSegmentId: string | null;
  playheadRef: React.RefObject<HTMLDivElement | null>;
  snapEnabled: boolean;
  actionsRef: React.MutableRefObject<TimelineActions>;
};

const TimelineEditor = memo(function TimelineEditor({
  duration, zoom, onZoomChange, thumbnails, waveform, showWaveform, showMarkers,
  segments, markers, activeSegmentId, playheadRef, snapEnabled, actionsRef,
}: TimelineEditorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string | null; type: 'start' | 'end' | 'move' | 'playhead' | null; startX: number; start: number; end: number }>({
    id: null, type: null, startX: 0, start: 0, end: 0,
  });
  const rafZoomRef = useRef<number | null>(null);
  const pendingZoomRef = useRef<number | null>(null);
  const latestSegmentsRef = useRef<Segment[]>(segments);

  useEffect(() => { latestSegmentsRef.current = segments; }, [segments]);

  const timelineWidth = Math.max(duration * BASE_PPS * zoom, 400);
  const snap = (value: number) => {
    if (!snapEnabled) return value;
    const nearest = Math.round(value * 10) / 10;
    return Math.abs(value - nearest) < SNAP_THRESHOLD ? nearest : value;
  };
  const clamp = (value: number) => Math.max(0, Math.min(duration, value));

  const setPlayhead = useCallback((time: number) => {
    const pct = duration > 0 ? Math.max(0, Math.min(100, (clamp(time) / duration) * 100)) : 0;
    if (playheadRef.current) playheadRef.current.style.left = `${pct}%`;
  }, [duration]);

  const timeFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track || duration <= 0) return null;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(timelineWidth, clientX - rect.left));
    return clamp((x / timelineWidth) * duration);
  }, [duration, timelineWidth]);

  const seekFromPointer = useCallback((clientX: number) => {
    const t = timeFromClientX(clientX);
    if (t == null) return;
    actionsRef.current.onSeek(t);
    setPlayhead(t);
  }, [timeFromClientX, setPlayhead, actionsRef]);

  const commit = useCallback(() => {
    actionsRef.current.onCommitSegments(latestSegmentsRef.current);
  }, [actionsRef]);

  const pointerDown = useCallback((e: React.PointerEvent, id: string | null, type: 'start' | 'end' | 'move' | 'playhead') => {
    e.preventDefault();
    e.stopPropagation();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    const seg = id ? segments.find(s => s.id === id) : null;
    latestSegmentsRef.current = segments;
    dragRef.current = { id, type, startX: e.clientX, start: seg?.start ?? 0, end: seg?.end ?? 0 };
    if (id) actionsRef.current.onSelectSegment(id);
    if (type === 'playhead') seekFromPointer(e.clientX);
  }, [segments, seekFromPointer, actionsRef]);

  const pointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.type) return;
    e.preventDefault();
    if (d.type === 'playhead') {
      seekFromPointer(e.clientX);
      return;
    }
    if (!d.id) return;
    const delta = (e.clientX - d.startX) / Math.max(1, BASE_PPS * zoom);
    actionsRef.current.onSegmentsChange(prev => {
      const next = prev.map(s => {
        if (s.id !== d.id) return s;
        if (d.type === 'start') return { ...s, start: clamp(snap(Math.min(d.end - 0.1, Math.max(0, d.start + delta)))) };
        if (d.type === 'end') return { ...s, end: clamp(snap(Math.max(d.start + 0.1, Math.min(duration, d.end + delta)))) };
        const len = d.end - d.start;
        let start = d.start + delta;
        let end = d.end + delta;
        if (start < 0) { start = 0; end = len; }
        if (end > duration) { end = duration; start = duration - len; }
        return { ...s, start: clamp(start), end: clamp(end) };
      });
      latestSegmentsRef.current = next;
      return next;
    });
  }, [zoom, duration, seekFromPointer, actionsRef]);

  const pointerUp = useCallback((e?: React.PointerEvent) => {
    if (e) { try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {} }
    if (dragRef.current.type && dragRef.current.type !== 'playhead') commit();
    dragRef.current = { id: null, type: null, startX: 0, start: 0, end: 0 };
  }, [commit]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-handle]') || target.closest('[data-playhead]')) return;
    seekFromPointer(e.clientX);
  }, [seekFromPointer]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) return;
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 / 1.08 : 1.08;
    const next = Math.max(1, Math.min(30, zoom * direction));
    pendingZoomRef.current = next;
    if (rafZoomRef.current == null) {
      rafZoomRef.current = requestAnimationFrame(() => {
        if (pendingZoomRef.current != null) onZoomChange(pendingZoomRef.current);
        rafZoomRef.current = null;
      });
    }
  }, [zoom, onZoomChange]);

  useEffect(() => () => { if (rafZoomRef.current != null) cancelAnimationFrame(rafZoomRef.current); }, []);

  const rulerMarks = useMemo(() => {
    if (duration <= 0) return [] as number[];
    const step = zoom >= 10 ? 0.5 : zoom >= 6 ? 1 : zoom >= 3 ? 2 : zoom >= 1.5 ? 5 : 10;
    const marks: number[] = [];
    for (let t = 0; t <= duration + 0.0001; t += step) marks.push(Math.min(duration, t));
    return marks;
  }, [duration, zoom]);

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 w-full max-w-full relative overflow-hidden" dir="ltr">
      <div className="relative h-7 bg-ink-800 border-b border-ink-700 overflow-hidden w-full">
        <div className="h-full overflow-x-auto overflow-y-hidden timeline-scroll" style={{ scrollbarWidth: 'thin', paddingInline: `${TIMELINE_PADDING}px`, touchAction: 'pan-x' }}>
          <div className="relative h-full" style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
            {rulerMarks.map(mark => (
              <div key={mark} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${(mark / Math.max(duration, 0.001)) * 100}%` }}>
                <div className="w-px h-3 bg-ink-600" /><span className="text-[9px] font-bold text-ink-400 mt-0.5">{formatTimelineTime(mark)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full" style={{ height: '94px' }}>
        <div className="h-full overflow-x-auto overflow-y-hidden timeline-scroll" onWheel={handleWheel} style={{ scrollbarWidth: 'thin', paddingInline: `${TIMELINE_PADDING}px`, paddingBlock: '5px', touchAction: 'pan-x' }}>
          <div ref={trackRef} className="relative h-full cursor-crosshair select-none" style={{ width: `${timelineWidth}px`, minWidth: '100%', touchAction: 'none' }} onClick={handleTrackClick}>
            {thumbnails.length > 0 && (
              <div className="absolute inset-0 flex pointer-events-none overflow-hidden rounded opacity-60">
                {thumbnails.map((thumb, i) => thumb ? <div key={i} className="h-full bg-cover bg-center border-r border-ink-800" style={{ backgroundImage: `url(${thumb})`, width: `${100 / thumbnails.length}%` }} /> : <div key={i} className="h-full bg-ink-800/40 border-r border-ink-800" style={{ width: `${100 / thumbnails.length}%` }} />)}
              </div>
            )}
            {showWaveform && waveform.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end pointer-events-none opacity-80" aria-hidden="true">
                {waveform.map((val, i) => <div key={i} className="flex-1 bg-brand-400/80" style={{ height: `${Math.max(3, val * 100)}%` }} />)}
              </div>
            )}
            {segments.map(seg => {
              const color = SEGMENT_COLORS.find(c => c.id === seg.color) || SEGMENT_COLORS[0];
              const active = seg.id === activeSegmentId;
              const left = duration > 0 ? (seg.start / duration) * 100 : 0;
              const width = duration > 0 ? ((seg.end - seg.start) / duration) * 100 : 0;
              return (
                <div key={seg.id} data-segment className={`absolute top-0 bottom-0 rounded-md ${active ? 'ring-2 ring-white z-20' : 'z-10'}`} style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color.light, borderTop: `3px solid ${color.solid}`, borderBottom: `3px solid ${color.solid}`, cursor: 'grab', touchAction: 'none' }} onPointerDown={e => pointerDown(e, seg.id, 'move')} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => pointerUp()}>
                  <div className="absolute top-1 left-1 right-1 text-center pointer-events-none"><span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded truncate inline-block max-w-full">{seg.label}</span></div>
                  {width > 8 && <div className="absolute bottom-1 left-1 right-1 text-center pointer-events-none"><span className="text-[8px] font-bold text-white/90 bg-black/40 px-1 py-0.5 rounded">{formatTimelineTime(seg.end - seg.start)}</span></div>}
                  {active && segments.length > 1 && <button onClick={e => { e.stopPropagation(); actionsRef.current.onDelete(seg.id); }} className="absolute top-1/2 -translate-y-1/2 left-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg z-30" title="حذف"><X className="w-3 h-3 text-white" /></button>}
                  <div data-handle className="absolute top-0 bottom-0 -left-2 w-4 cursor-ew-resize z-30 flex items-center justify-center rounded" style={{ backgroundColor: color.solid, touchAction: 'none' }} onPointerDown={e => pointerDown(e, seg.id, 'start')} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => pointerUp()} title="اسحب لتعديل البداية"><div className="w-1 h-8 bg-white rounded-full shadow-lg" /></div>
                  <div data-handle className="absolute top-0 bottom-0 -right-2 w-4 cursor-ew-resize z-30 flex items-center justify-center rounded" style={{ backgroundColor: color.solid, touchAction: 'none' }} onPointerDown={e => pointerDown(e, seg.id, 'end')} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => pointerUp()} title="اسحب لتعديل النهاية"><div className="w-1 h-8 bg-white rounded-full shadow-lg" /></div>
                </div>
              );
            })}

            {showMarkers && markers.map(marker => (
              <button key={marker.id} type="button" className="absolute -top-1 z-40 w-4 h-4 -translate-x-1/2 cursor-pointer" style={{ left: `${duration > 0 ? (marker.time / duration) * 100 : 0}%` }} onClick={e => { e.stopPropagation(); actionsRef.current.onJumpMarker(marker.time); }} title={`${marker.label} - ${formatTimelineTime(marker.time)}`}>
                <span className="block w-3 h-3 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: marker.color }} />
              </button>
            ))}

            <div ref={playheadRef} data-playhead className="absolute top-0 bottom-0 z-50 pointer-events-none" style={{ left: '0%', willChange: 'left' }}>
              <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-red-500 shadow-lg" />
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-red-500 shadow-xl border-2 border-white flex items-center justify-center pointer-events-auto cursor-ew-resize z-[60]" style={{ touchAction: 'none', userSelect: 'none' }} onPointerDown={e => pointerDown(e, null, 'playhead')} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => pointerUp()} title="اسحب لتحريك المؤشر"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 border-t border-ink-700 bg-ink-950" dir="rtl">
        <div className="flex items-center gap-1">
          <button onClick={() => actionsRef.current.onSplit()} className="px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold" title="Split">✂️ Split</button>
          <button onClick={() => activeSegmentId && actionsRef.current.onDelete(activeSegmentId)} disabled={!activeSegmentId || segments.length <= 1} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold" title="Delete">🗑️ Delete</button>
          <button onClick={() => activeSegmentId && actionsRef.current.onRippleDelete(activeSegmentId)} disabled={!activeSegmentId || segments.length <= 1} className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold" title="Ripple Delete">↔️ Ripple</button>
          <button onClick={() => actionsRef.current.onAddMarker()} className="px-2.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold" title="Marker">🚩 Marker</button>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onZoomChange(Math.max(1, zoom / 1.18))} disabled={zoom <= 1} className="p-1.5 bg-ink-800 hover:bg-ink-700 disabled:opacity-40 rounded"><ZoomOut className="w-3.5 h-3.5 text-white" /></button>
          <span className="min-w-[45px] text-center text-[10px] text-white font-bold">{zoom.toFixed(1)}x</span>
          <button onClick={() => onZoomChange(Math.min(30, zoom * 1.18))} disabled={zoom >= 30} className="p-1.5 bg-ink-800 hover:bg-ink-700 disabled:opacity-40 rounded"><ZoomIn className="w-3.5 h-3.5 text-white" /></button>
          <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${snapEnabled ? 'bg-brand-500/20 text-brand-300' : 'bg-ink-800 text-ink-500'}`}>Snap {snapEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </div>
  );
}, (a, b) => (
  a.duration === b.duration &&
  a.zoom === b.zoom &&
  a.thumbnails === b.thumbnails &&
  a.waveform === b.waveform &&
  a.showWaveform === b.showWaveform &&
  a.showMarkers === b.showMarkers &&
  a.segments === b.segments &&
  a.markers === b.markers &&
  a.activeSegmentId === b.activeSegmentId &&
  a.playheadRef === b.playheadRef &&
  a.snapEnabled === b.snapEnabled &&
  a.actionsRef === b.actionsRef
));

function formatTimelineTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00.0';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}.${ms}`;
}

// ============================================================
// ✅ المكوّن الرئيسي
// ============================================================
export default function VideoTrimmerPage() {
  const [video, setVideo] = useState<VideoState>({
    file: null, originalUrl: null, trimmedUrl: null,
    originalSize: 0, trimmedSize: null, duration: 0,
    width: null, height: null, status: 'idle', progress: 0,
  });

  const [toast, setToast] = useState<{ message: string; visible: boolean; isError: boolean }>({
    message: '', visible: false, isError: false,
  });
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [history, setHistory] = useState<Segment[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [markers, setMarkers] = useState<Marker[]>([]);

  const [quality, setQuality] = useState('copy');
  const [settings, setSettings] = useState<Settings>({
    resolution: 'original', customWidth: 1920, customHeight: 1080,
    fps: 'original', volume: 100, fadeIn: 0, fadeOut: 0,
    mute: false, normalizeAudio: false,
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [frameRate, setFrameRate] = useState(30);

  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [waveform, setWaveform] = useState<number[]>([]);

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'video' | 'audio' | 'export'>('general');
  const [showWaveform, setShowWaveform] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeSegment = segments.find(s => s.id === activeSegmentId) || null;

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, visible: true, isError });
    setTimeout(() => setToast({ message: '', visible: false, isError: false }), 3500);
  }, []);

  useEffect(() => {
    if (!video.file) return;
    const interval = setInterval(async () => {
      if (segments.length === 0) return;
      setAutoSaveStatus('saving');
      try {
        await saveProject({
          fileName: video.file?.name, fileSize: video.file?.size,
          duration: video.duration, segments, markers, settings, quality, lastSaved: Date.now(),
        });
        setLastSavedAt(Date.now());
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (e) { setAutoSaveStatus('idle'); }
    }, 3000);
    return () => clearInterval(interval);
  }, [video.file, video.duration, segments, markers, settings, quality]);

  const pushHistory = useCallback((newSegments: Segment[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newSegments);
      return newHistory.slice(-30);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 29));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setSegments(history[newIndex]);
    setHistoryIndex(newIndex);
    showToast('↩️ تم التراجع');
  }, [history, historyIndex, showToast]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setSegments(history[newIndex]);
    setHistoryIndex(newIndex);
    showToast('↪️ تم الإعادة');
  }, [history, historyIndex, showToast]);

  const generateThumbnails = useCallback(async (videoUrl: string, duration: number) => {
    const count = Math.min(36, Math.max(12, Math.ceil(duration / 8)));
    const thumbs: string[] = new Array(count).fill('');
    const videoEl = document.createElement('video');
    videoEl.src = videoUrl;
    videoEl.muted = true;
    videoEl.preload = 'metadata';
    videoEl.playsInline = true;

    try {
      await new Promise<void>((resolve) => {
        const done = () => { cleanup(); resolve(); };
        const cleanup = () => {
          videoEl.removeEventListener('loadedmetadata', done);
          videoEl.removeEventListener('error', done);
        };
        videoEl.addEventListener('loadedmetadata', done, { once: true });
        videoEl.addEventListener('error', done, { once: true });
        setTimeout(done, 5000);
      });

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      for (let i = 0; i < count; i++) {
        const time = duration <= 0 ? 0 : Math.min(duration - 0.001, (i + 0.5) * duration / count);
        try {
          await new Promise<void>((resolve) => {
            let finished = false;
            const done = () => {
              if (finished) return;
              finished = true;
              videoEl.removeEventListener('seeked', done);
              resolve();
            };
            videoEl.addEventListener('seeked', done, { once: true });
            videoEl.currentTime = time;
            setTimeout(done, 700);
          });
          if (videoEl.readyState >= 2) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            thumbs[i] = canvas.toDataURL('image/jpeg', 0.58);
          }
        } catch {
          thumbs[i] = '';
        }
        if (i % 3 === 2) await new Promise(requestAnimationFrame);
      }
      setThumbnails(thumbs);
    } finally {
      videoEl.removeAttribute('src');
      videoEl.load();
    }
  }, []);

  const generateWaveform = useCallback(async (videoUrl: string) => {
    try {
      const file = video.file;
      const samples = 240;
      if (!file || file.size > 60 * 1024 * 1024 || video.duration > 15 * 60) {
        const fallback = Array.from({ length: samples }, (_, i) => {
          const a = Math.abs(Math.sin(i * 0.31) * 0.35);
          const b = Math.abs(Math.sin(i * 0.071 + 1.7) * 0.25);
          return Math.max(0.08, Math.min(1, 0.18 + a + b));
        });
        setWaveform(fallback);
        return;
      }

      const response = await fetch(videoUrl);
      const arrayBuffer = await response.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.max(1, Math.floor(channelData.length / samples));
        const data = new Array(samples).fill(0);
        for (let i = 0; i < samples; i++) {
          const start = i * blockSize;
          const end = Math.min(channelData.length, start + blockSize);
          let peak = 0;
          for (let j = start; j < end; j += Math.max(1, Math.floor(blockSize / 96))) {
            peak = Math.max(peak, Math.abs(channelData[j]));
          }
          data[i] = peak;
        }
        const maxVal = Math.max(...data, 0.001);
        setWaveform(data.map(v => Math.max(0.04, v / maxVal)));
      } finally {
        await audioContext.close().catch(() => {});
      }
    } catch (e) {
      console.warn('[Waveform] فشل التوليد:', e);
      setWaveform([]);
    }
  }, [video.file, video.duration]);

  const loadFFmpeg = useCallback(async (signal?: AbortSignal) => {
    if (ffmpegRef.current) return ffmpegRef.current;
    if (ffmpegLoading) throw new Error('FFmpeg يُحمّل بالفعل...');
    setFfmpegLoading(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      for (const baseUrl of FFMPEG_CDNS) {
        try {
          if (signal?.aborted) throw new Error('تم الإلغاء');
          const ffmpeg = new FFmpeg();
          ffmpeg.on('progress', ({ progress }: { progress: number }) => {
            setVideo(prev => ({ ...prev, progress: Math.round(progress * 100) }));
          });
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, 'application/wasm'),
          });
          ffmpegRef.current = ffmpeg;
          setFfmpegLoaded(true);
          setFfmpegLoading(false);
          return ffmpeg;
        } catch (error) {
          if (signal?.aborted) { setFfmpegLoading(false); throw new Error('تم الإلغاء'); }
        }
      }
      throw new Error('فشل تحميل FFmpeg');
    } catch (error) { setFfmpegLoading(false); throw error; }
  }, [ffmpegLoading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { showToast('❌ الملف ليس فيديو', true); return; }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.trimmedUrl) URL.revokeObjectURL(video.trimmedUrl);
    const displayUrl = URL.createObjectURL(file);
    const probeUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata'; tempVideo.muted = true;
    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration;
      setVideo({
        file, originalUrl: displayUrl, trimmedUrl: null,
        originalSize: file.size, trimmedSize: null,
        duration, width: tempVideo.videoWidth, height: tempVideo.videoHeight,
        status: 'idle', progress: 0,
      });
      const firstSegment: Segment = {
        id: Date.now().toString(), start: 0, end: duration,
        label: 'المقطع 1', color: SEGMENT_COLORS[0].id,
      };
      setSegments([firstSegment]);
      setActiveSegmentId(firstSegment.id);
      setCurrentTime(0); setZoom(1); setMarkers([]);
      setHistory([[firstSegment]]); setHistoryIndex(0);
      URL.revokeObjectURL(probeUrl);
      generateThumbnails(displayUrl, duration);
      generateWaveform(displayUrl);
    };
    tempVideo.onerror = () => {
      showToast('❌ فشل قراءة الفيديو', true);
      URL.revokeObjectURL(displayUrl); URL.revokeObjectURL(probeUrl);
    };
    tempVideo.src = probeUrl;
    e.target.value = '';
  };

  const loadNewVideo = useCallback(() => {
    if (abortControllerRef.current) { abortControllerRef.current.abort(); abortControllerRef.current = null; }
    if (video.originalUrl) URL.revokeObjectURL(video.originalUrl);
    if (video.trimmedUrl) URL.revokeObjectURL(video.trimmedUrl);
    setVideo({
      file: null, originalUrl: null, trimmedUrl: null,
      originalSize: 0, trimmedSize: null, duration: 0,
      width: null, height: null, status: 'idle', progress: 0,
    });
    setSegments([]); setActiveSegmentId(null); setMarkers([]);
    setCurrentTime(0); setThumbnails([]); setWaveform([]);
    setZoom(1); setHistory([]); setHistoryIndex(-1);
    clearProject();
    setTimeout(() => {
      if (fileInputRef.current) { fileInputRef.current.value = ''; fileInputRef.current.click(); }
    }, 100);
    showToast('✅ جاهز لتحميل فيديو جديد');
  }, [video, showToast]);

  const seekByFrames = (frames: number) => {
    if (!videoRef.current) return;
    const delta = frames / frameRate;
    const newTime = Math.max(0, Math.min(video.duration, currentTime + delta));
    try { videoRef.current.currentTime = newTime; videoRef.current.pause(); } catch {}
  };

  const addMarker = () => {
    const newMarker: Marker = {
      id: Date.now().toString(), time: currentTime,
      label: `علامة ${markers.length + 1}`,
      color: MARKER_COLORS[markers.length % MARKER_COLORS.length],
    };
    setMarkers(prev => [...prev, newMarker].sort((a, b) => a.time - b.time));
    showToast(`📍 علامة عند ${formatTime(currentTime)}`);
  };

  const removeMarker = (id: string) => setMarkers(prev => prev.filter(m => m.id !== id));
  const jumpToMarker = (time: number) => {
    if (videoRef.current) { try { videoRef.current.currentTime = time; } catch {} }
  };

  const splitAtPlayhead = () => {
    if (!video.file) return;
    const time = currentTime;
    const targetSegment = segments.find(s => time > s.start + 0.1 && time < s.end - 0.1);
    if (!targetSegment) { showToast('⚠️ ضع المؤشر داخل مقطع (ليس على الحدود)', true); return; }
    const seg1: Segment = { ...targetSegment, id: Date.now().toString(), end: time };
    const seg2: Segment = { ...targetSegment, id: (Date.now() + 1).toString(), start: time };
    const newSegments: Segment[] = [];
    for (const s of segments) {
      if (s.id === targetSegment.id) newSegments.push(seg1, seg2);
      else newSegments.push(s);
    }
    const renamed = newSegments.map((s, i) => ({
      ...s, label: `المقطع ${i + 1}`, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length].id,
    }));
    setSegments(renamed); setActiveSegmentId(seg1.id); pushHistory(renamed);
    showToast(`✂️ تم القص عند ${formatTime(time)}`);
  };

  const deleteSegment = (id: string) => {
    if (segments.length === 1) { showToast('⚠️ لا يمكن حذف المقطع الأخير', true); return; }
    const newSegments = segments.filter(s => s.id !== id);
    const renamed = newSegments.map((s, i) => ({
      ...s, label: `المقطع ${i + 1}`, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length].id,
    }));
    setSegments(renamed); setActiveSegmentId(renamed[0]?.id || null); pushHistory(renamed);
    showToast('🗑️ تم حذف المقطع — الباقي يندمج تلقائياً');
  };

  const clampTime = useCallback((time: number) => {
    if (!Number.isFinite(time) || video.duration <= 0) return 0;
    return Math.max(0, Math.min(video.duration, time));
  }, [video.duration]);

  const updatePlayheadDom = useCallback((time: number) => {
    const clamped = clampTime(time);
    const percent = video.duration > 0 ? (clamped / video.duration) * 100 : 0;
    if (playheadRef.current) playheadRef.current.style.left = `${Math.max(0, Math.min(100, percent))}%`;
  }, [clampTime, video.duration]);

  const seekToTime = useCallback((time: number, pause = false) => {
    const next = clampTime(time);
    const el = videoRef.current;
    if (!el) return next;
    try { el.currentTime = next; if (pause) el.pause(); } catch {}
    setCurrentTime(next);
    updatePlayheadDom(next);
    return next;
  }, [clampTime, updatePlayheadDom]);

  const rippleDeleteSegment = useCallback((id: string) => {
    if (segments.length <= 1) { showToast('⚠️ لا يمكن حذف المقطع الأخير', true); return; }
    const target = segments.find(s => s.id === id);
    if (!target) return;
    const removedDuration = target.end - target.start;
    const newSegments = segments
      .filter(s => s.id !== id)
      .map(s => {
        if (s.start >= target.end) {
          return { ...s, start: Math.max(0, s.start - removedDuration), end: Math.max(0, s.end - removedDuration) };
        }
        return s;
      })
      .filter(s => s.end - s.start >= 0.1)
      .sort((a, b) => a.start - b.start)
      .map((s, i) => ({ ...s, label: `المقطع ${i + 1}`, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length].id }));
    setSegments(newSegments);
    setActiveSegmentId(newSegments[0]?.id || null);
    pushHistory(newSegments);
    const next = clampTime(currentTime > target.end ? currentTime - removedDuration : currentTime);
    seekToTime(next);
    showToast('↔️ تم Ripple Delete وتحريك المقاطع التالية');
  }, [segments, showToast, pushHistory, clampTime, currentTime, seekToTime]);

  const addSegment = () => {
    if (!video.file) return;
    const lastEnd = segments.reduce((max, s) => Math.max(max, s.end), 0);
    const start = Math.min(lastEnd, video.duration - 1);
    const end = Math.min(start + 5, video.duration);
    const newSegment: Segment = {
      id: Date.now().toString(), start, end,
      label: `المقطع ${segments.length + 1}`,
      color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length].id,
    };
    const newSegments = [...segments, newSegment];
    setSegments(newSegments); setActiveSegmentId(newSegment.id); pushHistory(newSegments);
  };

  const duplicateSegment = (segment: Segment) => {
    const newSegment: Segment = {
      ...segment, id: Date.now().toString(),
      label: `المقطع ${segments.length + 1}`,
      color: SEGMENT_COLORS[segments.length % SEGMENT_COLORS.length].id,
    };
    const newSegments = [...segments, newSegment];
    setSegments(newSegments); setActiveSegmentId(newSegment.id); pushHistory(newSegments);
  };

  const timelineActionsRef = useRef<TimelineActions>({
    onSelectSegment: setActiveSegmentId,
    onSeek: () => {},
    onSplit: () => {},
    onDelete: () => {},
    onRippleDelete: () => {},
    onAddMarker: () => {},
    onJumpMarker: () => {},
    onSegmentsChange: setSegments,
    onCommitSegments: () => {},
  });

  timelineActionsRef.current = {
    onSelectSegment: setActiveSegmentId,
    onSeek: seekToTime,
    onSplit: splitAtPlayhead,
    onDelete: deleteSegment,
    onRippleDelete: rippleDeleteSegment,
    onAddMarker: addMarker,
    onJumpMarker: jumpToMarker,
    onSegmentsChange: setSegments,
    onCommitSegments: pushHistory,
  };

  const zoomIn = useCallback(() => setZoom(prev => Math.min(30, prev * 1.18)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(1, prev / 1.18)), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      switch (e.key) {
        case ' ': e.preventDefault(); if (videoRef.current) { if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause(); } break;
        case 'ArrowLeft': e.preventDefault(); seekByFrames(e.shiftKey ? -10 : -1); break;
        case 'ArrowRight': e.preventDefault(); seekByFrames(e.shiftKey ? 10 : 1); break;
        case 's': case 'S': e.preventDefault(); splitAtPlayhead(); break;
        case 'i': case 'I': e.preventDefault(); if (activeSegment) { const updated = segments.map(s => s.id === activeSegment.id ? { ...s, start: Math.min(currentTime, s.end - 0.1) } : s); setSegments(updated); pushHistory(updated); } break;
        case 'o': case 'O': e.preventDefault(); if (activeSegment) { const updated = segments.map(s => s.id === activeSegment.id ? { ...s, end: Math.max(currentTime, s.start + 0.1) } : s); setSegments(updated); pushHistory(updated); } break;
        case 'Delete': case 'Backspace': e.preventDefault(); if (activeSegment && segments.length > 1) deleteSegment(activeSegment.id); break;
        case 'r': case 'R': e.preventDefault(); if (activeSegment && segments.length > 1) rippleDeleteSegment(activeSegment.id); break;
        case 'm': case 'M': e.preventDefault(); addMarker(); break;
        case 'z': case 'Z': if (e.ctrlKey || e.metaKey) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); } break;
        case 'Home': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime = 0; break;
        case 'End': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime = video.duration; break;
        case '+': case '=': e.preventDefault(); zoomIn(); break;
        case '-': e.preventDefault(); zoomOut(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [segments, activeSegment, currentTime, video.duration, undo, redo, rippleDeleteSegment, zoomIn, zoomOut]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
  };

  const trimVideo = async () => {
    if (!video.file) { showToast('❌ يرجى اختيار فيديو أولاً', true); return; }
    if (segments.length === 0) { showToast('❌ لا توجد مقاطع', true); return; }
    for (const seg of segments) {
      if (seg.end - seg.start < 0.1) { showToast(`❌ المقطع "${seg.label}" قصير جداً`, true); return; }
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    setVideo(prev => ({ ...prev, status: 'loading-ffmpeg', progress: 0 }));
    try {
      const ffmpeg = await loadFFmpeg(signal);
      if (signal.aborted) return;
      const { fetchFile } = await import('@ffmpeg/util');
      setVideo(prev => ({ ...prev, status: 'trimming', progress: 5 }));
      const inputExt = video.file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const inputName = `input.${inputExt}`;
      await ffmpeg.writeFile(inputName, await fetchFile(video.file));
      const crf = QUALITY_PRESETS.find(q => q.id === quality)?.crf || 23;
      const outputFiles: string[] = [];
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const segOutput = `seg_${i}.${inputExt}`;
        const args: string[] = [];
        args.push('-ss', seg.start.toFixed(3));
        args.push('-i', inputName);
        args.push('-t', (seg.end - seg.start).toFixed(3));
        if (quality === 'copy' && settings.resolution === 'original' && settings.fps === 'original' && settings.volume === 100 && settings.fadeIn === 0 && settings.fadeOut === 0 && !settings.mute) {
          args.push('-c', 'copy');
          if (inputExt === 'mp4' || inputExt === 'mov') args.push('-movflags', 'faststart');
        } else {
          if (settings.resolution !== 'original') {
            let h = 1080;
            if (settings.resolution === '4k') h = 2160;
            else if (settings.resolution === '720p') h = 720;
            else if (settings.resolution === '480p') h = 480;
            else if (settings.resolution === 'custom') h = settings.customHeight;
            args.push('-vf', `scale=-2:${h}`);
          }
          args.push('-c:v', 'libx264'); args.push('-crf', String(crf)); args.push('-preset', 'fast');
          if (settings.fps !== 'original') args.push('-r', String(settings.fps));
          if (settings.mute) { args.push('-an'); }
          else {
            const af: string[] = [];
            if (settings.volume !== 100) af.push(`volume=${settings.volume / 100}`);
            if (settings.fadeIn > 0) af.push(`afade=t=in:st=0:d=${settings.fadeIn}`);
            if (settings.fadeOut > 0) {
              const fadeStart = Math.max(0, (seg.end - seg.start) - settings.fadeOut);
              af.push(`afade=t=out:st=${fadeStart}:d=${settings.fadeOut}`);
            }
            if (af.length > 0) args.push('-af', af.join(','));
            args.push('-c:a', 'aac', '-b:a', '128k');
          }
          if (inputExt === 'mp4' || inputExt === 'mov') args.push('-movflags', 'faststart');
        }
        args.push('-threads', '1'); args.push('-max_muxing_queue_size', '1024'); args.push(segOutput);
        await ffmpeg.exec(args); outputFiles.push(segOutput);
      }
      let finalOutput = outputFiles[0];
      if (outputFiles.length > 1) {
        setVideo(prev => ({ ...prev, progress: 50 }));
        const concatList = outputFiles.map(f => `file '${f}'`).join('\n');
        await ffmpeg.writeFile('concat.txt', concatList);
        finalOutput = `merged.${inputExt}`;
        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', finalOutput]);
      }
      if (signal.aborted) return;
      const data = await ffmpeg.readFile(finalOutput);
      const mime = `video/${inputExt === 'mkv' ? 'x-matroska' : inputExt === 'webm' ? 'webm' : inputExt}`;
      const blob = new Blob([data.buffer], { type: mime });
      if (blob.size === 0) throw new Error('الملف الناتج فارغ');
      if (video.trimmedUrl) URL.revokeObjectURL(video.trimmedUrl);
      setVideo(prev => ({ ...prev, trimmedUrl: URL.createObjectURL(blob), trimmedSize: blob.size, status: 'done', progress: 100 }));
      showToast(`✅ تم قص ${segments.length} مقطع ودمجهم!`);
    } catch (error) {
      if (signal.aborted) return;
      let errorMessage = 'فشل القص';
      if (error instanceof Error) {
        if (error.message.includes('memory access out of bounds')) {
          try { ffmpegRef.current?.terminate?.(); } catch {}
          ffmpegRef.current = null; setFfmpegLoaded(false);
          errorMessage = '❌ الذاكرة غير كافية.\n\nالحلول:\n• استخدم "بدون إعادة ترميز"\n• فيديو أصغر\n• عدد أقل من المقاطع';
        } else errorMessage = error.message;
      }
      setVideo(prev => ({ ...prev, status: 'error', errorMessage }));
      showToast('❌ فشل قص الفيديو', true);
    } finally { abortControllerRef.current = null; }
  };

  const downloadVideo = async () => {
    if (!video.trimmedUrl || !video.file) return;
    try {
      const response = await fetch(video.trimmedUrl);
      const blob = await response.blob();
      const ext = video.file.name.split('.').pop() || 'mp4';
      saveAs(blob, `trimmed_${video.file.name.replace(/\.[^.]+$/, '')}_intoooly.${ext}`);
      showToast('✅ بدأ التنزيل');
    } catch { showToast('❌ فشل التنزيل', true); }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00.0';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const estimateFileSize = useMemo(() => {
    if (video.duration === 0) return 0;
    const totalDur = segments.reduce((acc, s) => acc + (s.end - s.start), 0);
    let bitrateKbps = 8000;
    if (settings.resolution === '4k') bitrateKbps = 35000;
    else if (settings.resolution === '1080p') bitrateKbps = 10000;
    else if (settings.resolution === '720p') bitrateKbps = 5000;
    else if (settings.resolution === '480p') bitrateKbps = 2500;
    else if (video.originalSize > 0 && video.duration > 0) bitrateKbps = (video.originalSize * 8) / video.duration / 1000;
    if (quality === 'high') bitrateKbps *= 1.3;
    else if (quality === 'medium') bitrateKbps *= 1.0;
    else if (quality === 'low') bitrateKbps *= 0.6;
    return (bitrateKbps * totalDur) / 8 * 1024;
  }, [segments, settings, quality, video.duration, video.originalSize]);

  const totalTrimmedDuration = segments.reduce((acc, s) => acc + (s.end - s.start), 0);
  const trimmedPercentage = video.duration > 0 ? (totalTrimmedDuration / video.duration) * 100 : 0;

  const bgClass = 'bg-ink-50 text-ink-900';
  const cardClass = 'bg-white border-ink-200';
  const textClass = 'text-ink-600';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgClass}`} dir="rtl">
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-2xl z-50 max-w-lg text-center ${
          toast.isError ? 'bg-red-600 text-white' : 'bg-ink-900 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* HERO */}
      <section className="relative bg-gradient-to-b from-ink-50 to-white py-8 md:py-12 overflow-hidden shadow-[0_8px_30px_-8px_rgba(31,41,55,0.1)]">
        <div className="absolute inset-0 opacity-20 text-ink-900"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <style jsx>{`
          @keyframes video-trimmer-hero-float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-2px) scale(1.035); }
          }
          @keyframes video-trimmer-hero-glow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.18), 0 8px 18px rgba(234, 179, 8, 0.10);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(234, 179, 8, 0.05), 0 10px 24px rgba(234, 179, 8, 0.18);
            }
          }
          @keyframes video-trimmer-hero-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }
          .video-trimmer-hero-icon {
            animation: video-trimmer-hero-float 3s ease-in-out infinite, video-trimmer-hero-glow 3s ease-in-out infinite;
          }
          .video-trimmer-hero-icon:hover .video-trimmer-hero-icon-svg {
            animation: video-trimmer-hero-wiggle 0.55s ease-in-out;
          }
        `}</style>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3" dir="rtl">
              <div className="video-trimmer-hero-icon w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Scissors className="video-trimmer-hero-icon-svg w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-ink-900 leading-tight">
                قص الفيديو باحترافية
              </h1>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              قص دقيق • محلياً 100% • بدون رفع
            </div>

            <p className="text-base md:text-lg font-bold text-brand-600 mb-6">
              قص الفيديو بدقة الإطار وتقسيم ودمج المقاطع بسهولة
            </p>
          </div>
        </div>
      </section>

      {/* MAIN TOOL */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className={`${cardClass} border rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 max-w-7xl mx-auto`}>

            {!video.file ? (
              <div className="text-center space-y-4 py-12">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-300 bg-brand-50/50 rounded-2xl p-8 md:p-16 cursor-pointer hover:bg-brand-50 transition-all group max-w-2xl mx-auto"
                >
                  <Scissors className="w-12 h-12 md:w-16 md:h-16 text-brand-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl md:text-2xl font-black mb-2 text-ink-900">اختر فيديو لقصه</h3>
                  <p className={`text-xs md:text-sm ${textClass}`}>MP4, MOV, WebM, MKV, AVI — حتى 500 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5 items-start">

                {/* MAIN AREA */}
                <div className="lg:col-span-1 space-y-3 min-w-0 flex flex-col h-full">

                  <div className={`${cardClass} border rounded-2xl overflow-hidden`}>
                    <div className="p-2 border-b border-ink-200/20 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs truncate flex-1 text-ink-900">{video.file.name}</h3>
                      <div className="flex items-center gap-1">
                        {autoSaveStatus === 'saving' && (
                          <span className="text-[10px] text-brand-500 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> جاري الحفظ
                          </span>
                        )}
                        {autoSaveStatus === 'saved' && (
                          <span className="text-[10px] text-green-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> تم الحفظ
                          </span>
                        )}
                        {autoSaveStatus === 'idle' && lastSavedAt && (
                          <span className="text-[10px] text-ink-500 flex items-center gap-1">
                            <Save className="w-3 h-3" /> {Math.round((Date.now() - lastSavedAt) / 1000)}ث
                          </span>
                        )}
                        <button onClick={loadNewVideo} className="p-1.5 hover:bg-brand-100 rounded-lg transition" title="فيديو جديد">
                          <RefreshCw className="w-3.5 h-3.5 text-brand-500" />
                        </button>
                        <button onClick={loadNewVideo} className="p-1.5 hover:bg-red-100 rounded-lg transition" title="حذف">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-black">
                      <video
                        ref={videoRef}
                        src={video.originalUrl || ''}
                        controls playsInline preload="metadata" crossOrigin="anonymous"
                        className="w-full max-h-[min(34vh,320px)] md:max-h-[min(36vh,340px)] lg:max-h-[min(38vh,360px)] object-contain"
                        onTimeUpdate={(e) => { const t = (e.target as HTMLVideoElement).currentTime; setCurrentTime(t); updatePlayheadDom(t); }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    </div>

                    <div className="p-2 space-y-2 bg-ink-950">
                      <div className="flex items-center justify-center gap-1 p-1.5 bg-ink-900 rounded-lg border border-ink-700 flex-wrap">
                        <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-ink-800 rounded-lg transition disabled:opacity-40" title="تراجع (Ctrl+Z)">
                          <Undo2 className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-ink-800 rounded-lg transition disabled:opacity-40" title="إعادة (Ctrl+Shift+Z)">
                          <Redo2 className="w-4 h-4 text-white" />
                        </button>
                        <div className="w-px h-6 bg-ink-700"></div>
                        <button onClick={() => seekByFrames(-1)} className="p-2 hover:bg-ink-800 rounded-lg transition" title="إطار للخلف (←)">
                          <SkipBack className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={togglePlay} className="p-2.5 bg-brand-500 hover:bg-brand-600 rounded-full transition shadow-lg" title="تشغيل/إيقاف (Space)">
                          {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                        </button>
                        <button onClick={() => seekByFrames(1)} className="p-2 hover:bg-ink-800 rounded-lg transition" title="إطار للأمام (→)">
                          <SkipForward className="w-4 h-4 text-white" />
                        </button>
                        <div className="w-px h-6 bg-ink-700"></div>
                        <button onClick={splitAtPlayhead} className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold transition shadow-lg" title="قص (S)">
                          <Scissors className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">قص</span>
                        </button>
                        <button onClick={() => activeSegment && rippleDeleteSegment(activeSegment.id)} disabled={!activeSegment || segments.length <= 1} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg font-bold transition shadow-lg" title="Ripple Delete (R)">
                          <Merge className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">Ripple</span>
                        </button>
                        <button onClick={addMarker} className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition shadow-lg" title="إضافة علامة (M)">
                          <Flag className="w-4 h-4" />
                          <span className="text-xs hidden sm:inline">علامة</span>
                        </button>
                        <div className="w-px h-6 bg-ink-700"></div>
                        <div className="px-2.5 py-1.5 bg-ink-800 rounded-lg border border-ink-700 font-mono text-xs">
                          <span className="text-brand-400 font-bold">{formatTime(currentTime)}</span>
                          <span className="text-ink-500 mx-1">/</span>
                          <span className="text-ink-500">{formatTime(video.duration)}</span>
                        </div>
                        <button onClick={() => setShowShortcuts(!showShortcuts)} className="p-2 hover:bg-ink-800 rounded-lg transition" title="اختصارات لوحة المفاتيح">
                          <Keyboard className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {showShortcuts && (
                        <div className="p-2 bg-ink-900 rounded-lg border border-ink-700 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {[
                            { key: 'Space', action: 'تشغيل/إيقاف' },
                            { key: '← / →', action: 'إطار للخلف/الأمام' },
                            { key: 'Shift + ←/→', action: '10 إطارات' },
                            { key: 'S', action: 'قص' },
                            { key: 'M', action: 'إضافة علامة' },
                            { key: 'I / O', action: 'بداية/نهاية' },
                            { key: 'Delete', action: 'حذف المقطع' },
                            { key: 'R', action: 'Ripple Delete' },
                            { key: 'Ctrl+Z', action: 'تراجع' },
                            { key: 'Ctrl+Shift+Z', action: 'إعادة' },
                            { key: 'Home/End', action: 'بداية/نهاية' },
                            { key: '+ / -', action: 'تكبير/تصغير' },
                          ].map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-ink-800 px-2 py-1.5 rounded">
                              <kbd className="px-1.5 py-0.5 bg-ink-700 text-white font-mono text-[10px] rounded">{s.key}</kbd>
                              <span className="text-ink-400 text-[10px]">{s.action}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-brand-500" />
                          <p className="text-xs font-bold text-white">{segments.length} مقطع • {markers.length} علامة</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowWaveform(!showWaveform)} className={`p-1.5 rounded-lg transition ${showWaveform ? 'bg-brand-500 text-white' : 'bg-ink-800 text-white'}`} title="إظهار/إخفاء موجة الصوت">
                            {showWaveform ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setSnapEnabled(v => !v)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border ${snapEnabled ? 'bg-brand-500 text-white border-brand-500' : 'bg-ink-800 text-ink-400 border-ink-700'}`} title="التقاط إلى أعشار الثانية">
                            Snap
                          </button>
                          <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-1 border border-ink-700">
                            <button onClick={zoomOut} disabled={zoom <= 1} className="p-1.5 hover:bg-ink-700 rounded disabled:opacity-40">
                              <ZoomOut className="w-3.5 h-3.5 text-white" />
                            </button>
                            <span className="text-[10px] font-bold px-2 min-w-[40px] text-center text-white">{zoom.toFixed(1)}x</span>
                            <button onClick={zoomIn} disabled={zoom >= 30} className="p-1.5 hover:bg-ink-700 rounded disabled:opacity-40">
                              <ZoomIn className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          <button onClick={addSegment} className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg">
                            <Plus className="w-3 h-3" /> مقطع
                          </button>
                        </div>
                      </div>

                      <TimelineEditor
                        duration={video.duration}
                        zoom={zoom}
                        onZoomChange={setZoom}
                        thumbnails={thumbnails}
                        waveform={waveform}
                        showWaveform={showWaveform}
                        showMarkers={showMarkers}
                        segments={segments}
                        markers={markers}
                        activeSegmentId={activeSegmentId}
                        playheadRef={playheadRef}
                        snapEnabled={snapEnabled}
                        actionsRef={timelineActionsRef}
                      />

                      <div className="rounded-lg p-2 bg-ink-900 border border-ink-700">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-brand-500" /> المقاطع ({segments.length})
                          </p>
                          <span className="text-[10px] text-ink-500">المتبقية ستُدمج</span>
                        </div>
                        <div className="space-y-0.5 max-h-[96px] overflow-y-auto">
                          {segments.map((seg) => {
                            const color = SEGMENT_COLORS.find(c => c.id === seg.color) || SEGMENT_COLORS[0];
                            const isActive = seg.id === activeSegmentId;
                            return (
                              <div key={seg.id} onClick={() => setActiveSegmentId(seg.id)} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isActive ? 'bg-brand-900/30 ring-1 ring-brand-500' : 'hover:bg-ink-800'}`}>
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.solid }}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold truncate text-white">{seg.label}</p>
                                  <p className="text-[9px] text-ink-400">{formatTime(seg.start)} → {formatTime(seg.end)}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <button onClick={(e) => { e.stopPropagation(); duplicateSegment(seg); }} className="p-1 hover:bg-brand-900/30 rounded" title="تكرار">
                                    <Copy className="w-3 h-3 text-brand-400" />
                                  </button>
                                  {segments.length > 1 && (
                                    <button onClick={(e) => { e.stopPropagation(); deleteSegment(seg.id); }} className="p-1 hover:bg-red-900/30 rounded" title="حذف">
                                      <X className="w-3 h-3 text-red-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {markers.length > 0 && (
                        <div className="rounded-lg p-2 bg-ink-900 border border-ink-700">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Flag className="w-3.5 h-3.5 text-purple-500" /> العلامات ({markers.length})
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-0.5">
                            {markers.map((marker) => (
                              <div key={marker.id} className="flex items-center gap-1 bg-ink-800 rounded px-1.5 py-0.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: marker.color }}></div>
                                <button onClick={() => jumpToMarker(marker.time)} className="text-[10px] text-white hover:text-brand-400">{formatTime(marker.time)}</button>
                                <button onClick={() => removeMarker(marker.id)} className="p-0.5 hover:bg-red-900/30 rounded">
                                  <X className="w-2.5 h-2.5 text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-center p-1.5 rounded-lg bg-brand-900/30 border border-brand-700/50">
                        <p className="text-[10px] text-ink-400 mb-0.5">إجمالي المدة بعد الدمج</p>
                        <p className="text-sm font-black text-brand-400">{formatTime(totalTrimmedDuration)} ({trimmedPercentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className={`${cardClass} border rounded-lg p-1.5 text-center`}>
                      <p className={`text-[9px] ${textClass}`}>الأصلي</p>
                      <p className="text-[10px] font-bold">{formatFileSize(video.originalSize)}</p>
                    </div>
                    <div className={`${cardClass} border rounded-lg p-1.5 text-center`}>
                      <p className={`text-[9px] ${textClass}`}>المدة</p>
                      <p className="text-[10px] font-bold">{formatTime(video.duration)}</p>
                    </div>
                    {video.trimmedSize && (
                      <div className={`${cardClass} border rounded-lg p-2 text-center bg-green-50`}>
                        <p className="text-[9px] text-green-600">الجديد</p>
                        <p className="text-[10px] font-bold text-green-700">{formatFileSize(video.trimmedSize)}</p>
                      </div>
                    )}
                    <div className={`${cardClass} border rounded-lg p-2 text-center bg-blue-50`}>
                      <p className="text-[9px] text-blue-600">متوقع</p>
                      <p className="text-[10px] font-bold text-blue-700">~{formatFileSize(estimateFileSize)}</p>
                    </div>
                  </div>
                </div>

                {/* SETTINGS PANEL */}
                <div className="lg:col-span-1 flex flex-col min-w-0 w-full lg:sticky lg:top-4 self-start">
                  <div className="flex flex-col w-full h-full">

                    <div className={`${cardClass} border rounded-2xl overflow-hidden flex flex-col w-full`}>
                      <div className="flex border-b border-ink-200/20 overflow-x-auto flex-shrink-0">
                        {[
                          { id: 'general' as const, icon: Sliders, label: 'عام' },
                          { id: 'video' as const, icon: Video, label: 'فيديو' },
                          { id: 'audio' as const, icon: Music, label: 'صوت' },
                          { id: 'export' as const, icon: Target, label: 'تصدير' },
                        ].map(t => (
                          <button key={t.id} onClick={() => setActiveSettingsTab(t.id)} className={`flex-1 min-w-[70px] flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-all ${activeSettingsTab === t.id ? 'text-brand-600 border-b-2 border-brand-500 bg-brand-50/50' : `${textClass} hover:text-brand-500`}`}>
                            <t.icon className="w-4 h-4" /> {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 md:p-3.5 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                        {activeSettingsTab === 'general' && (
                          <>
                            <div>
                              <label className="text-sm font-bold mb-3 block text-ink-900">
                                <Gauge className="w-4 h-4 inline ml-1 text-brand-500" /> جودة القص
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {QUALITY_PRESETS.map((q) => (
                                  <button key={q.id} onClick={() => setQuality(q.id)} className={`p-3 rounded-lg border-2 text-center transition-all ${quality === q.id ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-ink-200'}`}>
                                    <div className="text-xl mb-1">{q.icon}</div>
                                    <p className="text-xs font-bold text-ink-900">{q.name}</p>
                                    <p className="text-[10px] text-ink-500 mt-0.5">{q.desc}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => { setQuality('copy'); setSettings({ resolution: 'original', customWidth: 1920, customHeight: 1080, fps: 'original', volume: 100, fadeIn: 0, fadeOut: 0, mute: false, normalizeAudio: false }); if (video.duration > 0) { const resetSegment: Segment = { id: Date.now().toString(), start: 0, end: video.duration, label: 'المقطع 1', color: SEGMENT_COLORS[0].id }; setSegments([resetSegment]); setActiveSegmentId(resetSegment.id); setZoom(1); pushHistory([resetSegment]); } }} className="w-full py-2.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 bg-ink-100 hover:bg-ink-200 text-ink-700">
                              <RotateCcw className="w-4 h-4" /> إعادة الإعدادات
                            </button>
                          </>
                        )}

                        {activeSettingsTab === 'video' && (
                          <>
                            <div>
                              <label className="text-sm font-bold mb-3 block text-ink-900">
                                <Video className="w-4 h-4 inline ml-1 text-brand-500" /> الدقة
                              </label>
                              <select value={settings.resolution} onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as Resolution }))} className="w-full px-3 py-2.5 text-sm rounded-lg border bg-white border-ink-300">
                                <option value="original">أصلي ({video.width}×{video.height})</option>
                                <option value="4k">4K (2160p)</option>
                                <option value="1080p">1080p</option>
                                <option value="720p">720p</option>
                                <option value="480p">480p</option>
                                <option value="custom">مخصص</option>
                              </select>
                            </div>
                            {settings.resolution === 'custom' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className={`text-xs ${textClass}`}>العرض</label>
                                  <input type="number" value={settings.customWidth} onChange={(e) => setSettings(prev => ({ ...prev, customWidth: parseInt(e.target.value) || 1920 }))} className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300" />
                                </div>
                                <div>
                                  <label className={`text-xs ${textClass}`}>الارتفاع</label>
                                  <input type="number" value={settings.customHeight} onChange={(e) => setSettings(prev => ({ ...prev, customHeight: parseInt(e.target.value) || 1080 }))} className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300" />
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-bold mb-3 block text-ink-900">
                                <Film className="w-4 h-4 inline ml-1 text-brand-500" /> FPS
                              </label>
                              <select value={String(settings.fps)} onChange={(e) => setSettings(prev => ({ ...prev, fps: e.target.value === 'original' ? 'original' : parseInt(e.target.value) as FPS }))} className="w-full px-3 py-2.5 text-sm rounded-lg border bg-white border-ink-300">
                                <option value="original">أصلي</option>
                                <option value="24">24 FPS</option>
                                <option value="25">25 FPS</option>
                                <option value="30">30 FPS</option>
                                <option value="50">50 FPS</option>
                                <option value="60">60 FPS</option>
                              </select>
                            </div>
                          </>
                        )}

                        {activeSettingsTab === 'audio' && (
                          <>
                            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg bg-ink-50 border border-ink-200">
                              <input type="checkbox" checked={settings.mute} onChange={(e) => setSettings(prev => ({ ...prev, mute: e.target.checked }))} className="w-4 h-4 accent-brand-500" />
                              <span className="text-sm font-bold flex items-center gap-2 text-ink-900">
                                {settings.mute ? <VolumeX className="w-4 h-4 text-brand-500" /> : <Volume2 className="w-4 h-4 text-brand-500" />} كتم الصوت
                              </span>
                            </label>
                            {!settings.mute && (
                              <>
                                <div>
                                  <label className="text-sm font-bold mb-2 block text-ink-900">🔊 مستوى الصوت: {settings.volume}%</label>
                                  <input type="range" min={0} max={200} value={settings.volume} onChange={(e) => setSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))} className="w-full accent-brand-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className={`text-xs font-bold block mb-1 ${textClass}`}>Fade In (ث)</label>
                                    <input type="number" min={0} max={10} step={0.5} value={settings.fadeIn} onChange={(e) => setSettings(prev => ({ ...prev, fadeIn: parseFloat(e.target.value) || 0 }))} className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300" />
                                  </div>
                                  <div>
                                    <label className={`text-xs font-bold block mb-1 ${textClass}`}>Fade Out (ث)</label>
                                    <input type="number" min={0} max={10} step={0.5} value={settings.fadeOut} onChange={(e) => setSettings(prev => ({ ...prev, fadeOut: parseFloat(e.target.value) || 0 }))} className="w-full px-2 py-1.5 text-sm rounded border bg-white border-ink-300" />
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {activeSettingsTab === 'export' && (
                          <>
                            <div className="p-4 rounded-lg bg-brand-50 border border-brand-200">
                              <p className="text-xs font-bold mb-2 text-brand-600">📊 تقدير حجم الملف</p>
                              <p className="text-2xl font-black text-brand-700">~{formatFileSize(estimateFileSize)}</p>
                              <p className={`text-[10px] mt-1 ${textClass}`}>المدة: {formatTime(totalTrimmedDuration)} • {segments.length} مقطع</p>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center p-2 rounded bg-ink-50">
                                <span className={textClass}>الدقة</span>
                                <span className="font-bold text-ink-900">{settings.resolution === 'original' ? `${video.width}×${video.height}` : settings.resolution === 'custom' ? `${settings.customWidth}×${settings.customHeight}` : settings.resolution.toUpperCase()}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded bg-ink-50">
                                <span className={textClass}>FPS</span>
                                <span className="font-bold text-ink-900">{settings.fps === 'original' ? 'أصلي' : `${settings.fps} FPS`}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded bg-ink-50">
                                <span className={textClass}>الجودة</span>
                                <span className="font-bold text-ink-900">{QUALITY_PRESETS.find(q => q.id === quality)?.name}</span>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded bg-ink-50">
                                <span className={textClass}>الصوت</span>
                                <span className="font-bold text-ink-900">{settings.mute ? 'مكتوم' : `${settings.volume}%`}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 flex-shrink-0">
                      <button onClick={trimVideo} disabled={video.status === 'trimming' || video.status === 'loading-ffmpeg' || segments.length === 0} className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:from-ink-300 disabled:to-ink-400 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all">
                        {video.status === 'loading-ffmpeg' ? (<><Loader2 className="w-4 h-4 animate-spin" /> تحميل FFmpeg...</>) : video.status === 'trimming' ? (<><Loader2 className="w-4 h-4 animate-spin" /> جاري القص... {video.progress}%</>) : video.status === 'done' ? (<><CheckCircle2 className="w-4 h-4" /> تم القص</>) : (<><Merge className="w-4 h-4" /> قص ودمج ({segments.length})</>)}
                      </button>
                      <button onClick={loadNewVideo} className="w-full py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
                        <RefreshCw className="w-3.5 h-3.5" /> تحميل فيديو جديد
                      </button>
                      {video.status === 'done' && video.trimmedUrl && (
                        <button onClick={downloadVideo} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all">
                          <Download className="w-4 h-4" /> تحميل الفيديو
                        </button>
                      )}
                    </div>

                    <div className={`mt-3 ${cardClass} border rounded-xl p-3 flex items-start gap-2 text-xs ${textClass}`}>
                      <AlertCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-ink-900">🔒 خصوصية كاملة:</strong> كل المعالجة تتم محلياً في متصفحك.</span>
                    </div>

                    {video.status === 'error' && video.errorMessage && (
                      <div className="mt-3 p-3 bg-red-100 text-red-700 text-xs rounded-lg flex items-start gap-2 whitespace-pre-line">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {video.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEO CONTENT */}
      <section className="py-10 md:py-14 bg-white" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-right text-ink-900">ما هي أداة قص الفيديو من intooly؟</h2>
            <p className={`text-base leading-relaxed mb-4 ${textClass} text-right`}>
              <strong>أداة قص الفيديو</strong> من intooly هي <strong>محرر فيديو</strong> كامل يعمل <strong>محلياً في متصفحك</strong> بدون رفع ملفاتك إلى أي خادم.
              تتيح لك <strong>قص الفيديو</strong> بدقة الإطار الواحد، <strong>تقسيم الفيديو الطويل</strong> إلى مقاطع متعددة، و<strong>دمج المقاطع</strong> في فيديو واحد — كل ذلك <strong>بدون علامة مائية</strong> و<strong>بدون برامج</strong>.
            </p>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">لماذا تختار أداة قص الفيديو من intooly؟</h2>
            <ul className={`space-y-3 text-sm leading-relaxed ${textClass} text-right list-disc pr-6`}>
              <li><strong>بدون علامة مائية</strong> — صدّر فيديوهاتك نظيفة تماماً.</li>
              <li><strong>بدون برامج</strong> — لا تحتاج إلى تثبيت أي تطبيق.</li>
              <li><strong>خصوصية كاملة</strong> — المعالجة تتم 100% على جهازك.</li>
              <li><strong>دقة الإطار الواحد</strong> — قص دقيق باستخدام Frame Step.</li>
              <li><strong>علامات مرجعية</strong> — ضع Markers وارجع إليها فوراً.</li>
              <li><strong>دعم الموجات الصوتية</strong> — شاهد الـ Waveform واقص عند اللحظات المهمة.</li>
              <li><strong>إعدادات تصدير احترافية</strong> — تحكم في الدقة، FPS، ومستوى الصوت.</li>
            </ul>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">مثالي لـ:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['قص فيديو لستوري انستقرام', 'تقسيم فيديو طويل', 'قص فيديو لتيك توك', 'إزالة الأجزاء غير المرغوب فيها'].map((useCase, i) => (
                <div key={i} className={`${cardClass} border rounded-xl p-4 text-center hover:border-brand-400 transition-all`}>
                  <span className="text-xs font-bold text-ink-900">{useCase}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">كيف تقص فيديو في 3 خطوات؟</h2>
            <ol className={`space-y-3 text-sm leading-relaxed ${textClass} text-right list-decimal pr-6`}>
              <li><strong>حمّل الفيديو</strong> من جهازك بالضغط على منطقة الرفع.</li>
              <li><strong>اسحب المقابض</strong> على الشريط الزمني لتحديد المقطع المطلوب.</li>
              <li><strong>اضغط "قص ودمج"</strong> ثم حمّل النتيجة بجودة عالية.</li>
            </ol>
          </article>

          <article className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">الأسئلة الشائعة</h2>
            <div className="space-y-3">
              {[
                { q: 'هل الأداة مجانية بالكامل؟', a: 'نعم، أداة قص الفيديو مجانية 100% ولا تتطلب تسجيل دخول.' },
                { q: 'هل تضيف الأداة علامة مائية؟', a: 'لا، الفيديو الناتج بدون أي علامة مائية.' },
                { q: 'هل تُرفع ملفاتي إلى خادم؟', a: 'لا، كل المعالجة تتم محلياً في متصفحك لضمان خصوصيتك.' },
                { q: 'ما هي الصيغ المدعومة؟', a: 'MP4, MOV, WebM, MKV, AVI — حتى 500 ميجابايت.' },
                { q: 'هل يمكن قص عدة مقاطع ودمجها؟', a: 'نعم، يمكنك إضافة عدة مقاطع ودمجها في فيديو واحد.' },
              ].map((faq, i) => (
                <div key={i} className={`${cardClass} border rounded-lg p-4`}>
                  <p className="font-bold text-ink-900 mb-1 text-right">{faq.q}</p>
                  <p className={`text-sm ${textClass} text-right`}>{faq.a}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <h2 className="text-2xl md:text-3xl font-black mb-6 text-right text-ink-900">أدوات ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Film, title: 'ضغط الفيديو', href: '/tools/video-compressor' },
                { icon: Scissors, title: 'تحويل الصيغ', href: '/tools/video-converter' },
                { icon: FileArchive, title: 'ضاغط الصور', href: '/tools/image-compressor' },
                { icon: Wand2, title: 'إزالة الخلفية', href: '/tools/background-remover' },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className={`${cardClass} border p-4 rounded-xl text-center transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer block`}
                >
                  <tool.icon className="w-7 h-7 text-brand-500 mx-auto mb-2" />
                  <h3 className="font-extrabold text-xs text-ink-900">{tool.title}</h3>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* FAQ Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'هل الأداة مجانية بالكامل؟', acceptedAnswer: { '@type': 'Answer', text: 'نعم، أداة قص الفيديو مجانية 100% ولا تتطلب تسجيل دخول.' } },
            { '@type': 'Question', name: 'هل تضيف الأداة علامة مائية؟', acceptedAnswer: { '@type': 'Answer', text: 'لا، الفيديو الناتج بدون أي علامة مائية.' } },
            { '@type': 'Question', name: 'هل تُرفع ملفاتي إلى خادم؟', acceptedAnswer: { '@type': 'Answer', text: 'لا، كل المعالجة تتم محلياً في متصفحك لضمان خصوصيتك.' } },
            { '@type': 'Question', name: 'ما هي الصيغ المدعومة؟', acceptedAnswer: { '@type': 'Answer', text: 'MP4, MOV, WebM, MKV, AVI — حتى 500 ميجابايت.' } },
          ],
        }),
      }} />
    </div>
  );
}