'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Music, AlertCircle, CheckCircle2, RefreshCw, Play, Pause, Scissors, Clock, Layers, Trash2, CheckCircle, Grid3x3, ArrowUp, ArrowDown, X, VolumeX } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import JSZip from 'jszip';

type AudioFormat = 'mp3' | 'wav' | 'flac' | 'ogg';
type OperationMode = 'trim' | 'cut-middle' | 'split' | 'silence';
type SplitType = 'count' | 'duration';

type SplitPart = { index: number; name: string; url: string; duration: number; size: number; };
type MergeFileItem = { id: string; file: File; name: string; duration: number; size: number; url: string; };

const FORMATS: { id: AudioFormat; name: string; mime: string }[] = [
  { id: 'mp3', name: 'MP3', mime: 'audio/mpeg' },
  { id: 'wav', name: 'WAV', mime: 'audio/wav' },
  { id: 'flac', name: 'FLAC', mime: 'audio/flac' },
  { id: 'ogg', name: 'OGG', mime: 'audio/ogg' },
];

export default function AudioEditor() {
  // --- States ---
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(2);
  const [bitrate, setBitrate] = useState('192');

  // Silence Settings
  const [silenceThreshold, setSilenceThreshold] = useState(-40); // dB
  const [silenceDuration, setSilenceDuration] = useState(0.5); // seconds

  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'trim' | 'merge'>('trim');
  const [operationMode, setOperationMode] = useState<OperationMode>('trim');
  const [splitType, setSplitType] = useState<SplitType>('count');
  const [splitCount, setSplitCount] = useState(4);
  const [splitDuration, setSplitDuration] = useState(30);
  
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [splitParts, setSplitParts] = useState<SplitPart[]>([]);
  const [mergeFiles, setMergeFiles] = useState<MergeFileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState('');

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const ffmpegRef = useRef<any>(null);
  const playEndRef = useRef<number>(0);

  // --- FFmpeg Loader ---
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    setProcessStep('جاري تحميل محرك المعالجة...');
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  // --- WaveSurfer Init ---
  const initWaveSurfer = useCallback((url: string) => {
    if (!waveformRef.current) return;
    if (wavesurferRef.current) { wavesurferRef.current.destroy(); wavesurferRef.current = null; }

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#cbd5e1', progressColor: '#f97316', cursorColor: '#1e293b',
      barWidth: 2, barGap: 1, barRadius: 2, height: 120, autoScroll: false,
      plugins: [regions],
    });
    wavesurferRef.current = ws;

    ws.on('ready', (dur: number) => {
      setDuration(dur); setStartTime(0); setEndTime(dur);
      regions.clearRegions();
      const region = regions.addRegion({ start: 0, end: dur, color: 'rgba(249, 115, 22, 0.2)', drag: true, resize: true });
      region.on('update', () => { setStartTime(region.start); setEndTime(region.end); });
    });
    ws.on('error', () => setError('تعذر تحليل الملف الصوتي.'));
    ws.on('audioprocess', (time: number) => { setCurrentTime(time); if (playEndRef.current > 0 && time >= playEndRef.current) { ws.pause(); playEndRef.current = 0; } });
    ws.on('seeking', (time: number) => setCurrentTime(time));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => { setIsPlaying(false); playEndRef.current = 0; });
    ws.load(url);
  }, []);

  useEffect(() => { return () => { if (wavesurferRef.current) { wavesurferRef.current.destroy(); wavesurferRef.current = null; } }; }, []);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      const ws = wavesurferRef.current; const regions = regionsRef.current;
      switch (e.code) {
        case 'Space': e.preventDefault(); if (ws) ws.playPause(); break;
        case 'KeyI': e.preventDefault(); if (ws && regions) { const t = ws.getCurrentTime(); const r = regions.getRegions(); if (r.length > 0) r[0].setOptions({ start: t }); } break;
        case 'KeyO': e.preventDefault(); if (ws && regions) { const t = ws.getCurrentTime(); const r = regions.getRegions(); if (r.length > 0) r[0].setOptions({ end: t }); } break;
        case 'Home': e.preventDefault(); if (ws) ws.seekTo(0); break;
        case 'End': e.preventDefault(); if (ws && duration > 0) ws.seekTo(1); break;
        case 'Delete': case 'Backspace': e.preventDefault(); if (mode === 'trim' && file && endTime > startTime) processAudio(); break;
        case 'KeyM': e.preventDefault(); setMode(prev => prev === 'trim' ? 'merge' : 'trim'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, startTime, endTime, duration, mode, isProcessing]);

  // --- File Handlers ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile); setError(null); setDownloadUrl(null); setSplitParts([]);
    e.target.value = '';
    const url = URL.createObjectURL(selectedFile);
    setTimeout(() => initWaveSurfer(url), 100);
  };

  const handleMergeFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: MergeFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('audio/')) continue;
      try {
        const arrayBuffer = await f.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        newFiles.push({
          id: Date.now().toString() + Math.random(),
          file: f, name: f.name, duration: audioBuffer.duration, size: f.size,
          url: URL.createObjectURL(f)
        });
        audioContext.close();
      } catch (err) { console.warn('Failed to decode', f.name); }
    }
    setMergeFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeMergeFile = (id: string) => {
    setMergeFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    setMergeFiles(prev => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFiles.length) return prev;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      return newFiles;
    });
  };

  // --- Playback Controls ---
  const togglePlay = () => {
    if (wavesurferRef.current) {
      if (isPlaying) { wavesurferRef.current.pause(); playEndRef.current = 0; }
      else { playEndRef.current = 0; wavesurferRef.current.play(); }
    }
  };
  const playSelection = () => {
    if (!wavesurferRef.current || !regionsRef.current) return;
    const regions = regionsRef.current.getRegions();
    if (regions.length === 0) return;
    const region = regions[0];
    playEndRef.current = region.end;
    wavesurferRef.current.setTime(region.start);
    wavesurferRef.current.play();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60); const secs = Math.floor(time % 60); const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // --- Main Processing Logic ---
  const processAudio = async () => {
    if (mode === 'merge') { await mergeFilesLogic(); return; }
    if (!file) return;
    setIsProcessing(true); setError(null); setDownloadUrl(null); setSplitParts([]);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');
      setProcessStep('جاري قراءة الملف...');
      const inputExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const inputName = `input.${inputExt}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      if (operationMode === 'split') {
        setProcessStep('جاري تقسيم الملف...');
        const partDuration = splitType === 'count' ? duration / splitCount : splitDuration;
        const partsCount = splitType === 'count' ? splitCount : Math.ceil(duration / splitDuration);
        const parts: SplitPart[] = []; const zip = new JSZip();

        for (let i = 0; i < partsCount; i++) {
          const start = i * partDuration; const end = Math.min((i + 1) * partDuration, duration);
          const clipDuration = end - start; const outputName = `part_${i + 1}.${targetFormat}`;
          let args: string[] = ['-i', inputName, '-ss', start.toString(), '-t', clipDuration.toString()];
          if (targetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
          else if (targetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
          else if (targetFormat === 'flac') args.push('-c:a', 'flac');
          else if (targetFormat === 'ogg') args.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
          args.push('-y', outputName);
          await ffmpeg.exec(args);
          const data = await ffmpeg.readFile(outputName);
          const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
          const blob = new Blob([data as any], { type: mime });
          parts.push({ index: i + 1, name: outputName, url: URL.createObjectURL(blob), duration: clipDuration, size: blob.size });
          zip.file(outputName, data);
          await ffmpeg.deleteFile(outputName).catch(() => {});
        }
        setSplitParts(parts);
        setProcessStep('جاري ضغط الملفات في ZIP...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setDownloadUrl(URL.createObjectURL(zipBlob));
        setProcessStep('تم التقسيم بنجاح!');
      } else if (operationMode === 'silence') {
        setProcessStep('جاري إزالة الصمت...');
        const outputName = `output.${targetFormat}`;
        // FFmpeg silenceremove filter
        // stop_periods=-1: remove all silence periods
        // stop_duration: minimum duration of silence to remove
        // stop_threshold: volume threshold in dB
        const filter = `silenceremove=stop_periods=-1:stop_duration=${silenceDuration}:stop_threshold=${silenceThreshold}dB`;
        
        let args: string[] = ['-i', inputName, '-af', filter];
        if (targetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
        else if (targetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
        else if (targetFormat === 'flac') args.push('-c:a', 'flac');
        else if (targetFormat === 'ogg') args.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
        args.push('-y', outputName);
        
        await ffmpeg.exec(args);
        
        setProcessStep('جاري تحضير الملف...');
        const data = await ffmpeg.readFile(outputName);
        const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
        const blob = new Blob([data as any], { type: mime });
        setDownloadUrl(URL.createObjectURL(blob));
        setProcessStep('تمت إزالة الصمت بنجاح!');
        await ffmpeg.deleteFile(outputName).catch(() => {});

      } else {
        const outputName = `output.${targetFormat}`;
        setProcessStep(operationMode === 'trim' ? 'جاري قص الصوت...' : 'جاري حذف المحدد ودمج الباقي...');
        let args: string[] = ['-i', inputName];
        if (operationMode === 'trim') {
          const clipDuration = endTime - startTime;
          args.push('-ss', startTime.toString(), '-t', clipDuration.toString());
          const filters: string[] = [];
          if (fadeIn) filters.push(`afade=t=in:st=0:d=${fadeDuration}`);
          if (fadeOut) filters.push(`afade=t=out:st=${Math.max(0, clipDuration - fadeDuration)}:d=${fadeDuration}`);
          if (filters.length > 0) args.push('-af', filters.join(','));
        } else {
          const filters = [`[0:a]atrim=0:${startTime},asetpts=PTS-STARTPTS[a1]`, `[0:a]atrim=${endTime}:${duration},asetpts=PTS-STARTPTS[a2]`, `[a1][a2]concat=n=2:v=0:a=1[out]`];
          args.push('-filter_complex', filters.join(';'), '-map', '[out]');
          const fadeFilters: string[] = [];
          if (fadeIn) fadeFilters.push(`afade=t=in:st=0:d=${fadeDuration}`);
          if (fadeOut) fadeFilters.push(`afade=t=out:st=${Math.max(0, (duration - (endTime - startTime)) - fadeDuration)}:d=${fadeDuration}`);
          if (fadeFilters.length > 0) args.push('-af', fadeFilters.join(','));
        }
        if (targetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
        else if (targetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
        else if (targetFormat === 'flac') args.push('-c:a', 'flac');
        else if (targetFormat === 'ogg') args.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
        args.push('-y', outputName);
        await ffmpeg.exec(args);
        setProcessStep('جاري تحضير الملف...');
        const data = await ffmpeg.readFile(outputName);
        const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
        const blob = new Blob([data as any], { type: mime });
        setDownloadUrl(URL.createObjectURL(blob));
        setProcessStep('تمت العملية بنجاح!');
        await ffmpeg.deleteFile(outputName).catch(() => {});
      }
      await ffmpeg.deleteFile(inputName).catch(() => {});
    } catch (err: any) { setError(err.message || 'حدث خطأ أثناء المعالجة.'); }
    finally { setIsProcessing(false); }
  };

  // --- Merge Logic ---
  const mergeFilesLogic = async () => {
    if (mergeFiles.length < 2) { setError('يجب إضافة ملفين على الأقل للدمج.'); return; }
    setIsProcessing(true); setError(null); setDownloadUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');
      setProcessStep('جاري تحضير الملفات للدمج...');
      
      const inputNames: string[] = [];
      const wavNames: string[] = [];
      
      for (let i = 0; i < mergeFiles.length; i++) {
        const mf = mergeFiles[i];
        const ext = mf.name.split('.').pop()?.toLowerCase() || 'mp3';
        const inputName = `merge_input_${i}.${ext}`;
        const wavName = `merge_wav_${i}.wav`;
        
        await ffmpeg.writeFile(inputName, await fetchFile(mf.file));
        await ffmpeg.exec(['-i', inputName, '-ar', '44100', '-ac', '2', '-y', wavName]);
        
        inputNames.push(inputName);
        wavNames.push(wavName);
        await ffmpeg.deleteFile(inputName).catch(() => {});
      }

      setProcessStep('جاري دمج الملفات...');
      const concatList = wavNames.map(name => `file '${name}'`).join('\n');
      await ffmpeg.writeFile('concat_list.txt', concatList);
      
      const mergedWav = 'merged_temp.wav';
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', '-y', mergedWav]);

      setProcessStep('جاري تحويل الصيغة النهائية...');
      const outputName = `merged_output.${targetFormat}`;
      let args: string[] = ['-i', mergedWav];
      
      if (targetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
      else if (targetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
      else if (targetFormat === 'flac') args.push('-c:a', 'flac');
      else if (targetFormat === 'ogg') args.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
      
      args.push('-y', outputName);
      await ffmpeg.exec(args);

      setProcessStep('جاري تحضير الملف...');
      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
      const blob = new Blob([data as any], { type: mime });
      setDownloadUrl(URL.createObjectURL(blob));
      setProcessStep('تم الدمج بنجاح!');

      for (const name of [...wavNames, mergedWav, outputName, 'concat_list.txt']) {
        await ffmpeg.deleteFile(name).catch(() => {});
      }
    } catch (err: any) { setError(err.message || 'حدث خطأ أثناء الدمج.'); }
    finally { setIsProcessing(false); }
  };

  const downloadPart = (part: SplitPart) => {
    const link = document.createElement('a'); link.href = part.url; link.download = part.name; link.click();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button onClick={() => setMode('trim')} className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${mode === 'trim' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Scissors size={16} className="inline ml-1" /> قص وتقسيم
        </button>
        <button onClick={() => setMode('merge')} className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${mode === 'merge' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Layers size={16} className="inline ml-1" /> دمج الملفات
        </button>
      </div>

      {/* ================= TRIM / SPLIT MODE ================= */}
      {mode === 'trim' && (
        <>
          {!file ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
              <Upload size={48} className="mb-4 text-slate-400" />
              <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملفاً صوتياً للبدء</h3>
              <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, FLAC (الحد الأقصى 50 ميجابايت)</p>
              <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors">
                اختيار ملف <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Music size={24} className="text-orange-600" />
                  <div>
                    <h4 className="font-bold text-slate-900 truncate max-w-xs">{file.name}</h4>
                    <p className="text-xs text-slate-500">المدة: {formatTime(duration)}</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setDuration(0); setDownloadUrl(null); setSplitParts([]); if (wavesurferRef.current) { wavesurferRef.current.destroy(); wavesurferRef.current = null; } }} className="text-sm text-red-600 font-bold hover:underline">إزالة</button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2">
                    <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700"><Pause size={20} /></button>
                    <button onClick={playSelection} className="flex h-10 px-4 items-center justify-center gap-2 rounded-full bg-white border-2 border-orange-500 text-orange-700 hover:bg-orange-50 font-bold text-sm"><Play size={16} /> معاينة</button>
                  </div>
                  <div className="text-sm font-mono text-slate-600">{formatTime(startTime)} - {formatTime(endTime)}</div>
                </div>
                <div ref={waveformRef} className="w-full rounded-lg bg-white overflow-hidden" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => setOperationMode('trim')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${operationMode === 'trim' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <CheckCircle size={24} /><span className="font-bold text-sm">الاحتفاظ بالمحدد</span>
                </button>
                <button onClick={() => setOperationMode('cut-middle')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${operationMode === 'cut-middle' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <Trash2 size={24} /><span className="font-bold text-sm">حذف المحدد</span>
                </button>
                <button onClick={() => setOperationMode('split')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${operationMode === 'split' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <Grid3x3 size={24} /><span className="font-bold text-sm">تقسيم الملف</span>
                </button>
                <button onClick={() => setOperationMode('silence')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${operationMode === 'silence' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  <VolumeX size={24} /><span className="font-bold text-sm">إزالة الصمت</span>
                </button>
              </div>

              {/* Split Settings */}
              {operationMode === 'split' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                  <h5 className="text-sm font-bold text-blue-900 flex items-center gap-2"><Grid3x3 size={16} /> خيارات التقسيم</h5>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="splitType" checked={splitType === 'count'} onChange={() => setSplitType('count')} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm font-bold text-blue-800">عدد الأجزاء</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="splitType" checked={splitType === 'duration'} onChange={() => setSplitType('duration')} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm font-bold text-blue-800">مدة كل جزء (ثواني)</span>
                    </label>
                  </div>
                  {splitType === 'count' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-800">عدد الأجزاء:</span>
                      <input type="number" min="2" max="100" value={splitCount} onChange={(e) => setSplitCount(parseInt(e.target.value) || 2)} className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-center text-sm font-bold bg-white" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-800">مدة كل جزء (ثواني):</span>
                      <input type="number" min="1" max={Math.floor(duration)} value={splitDuration} onChange={(e) => setSplitDuration(parseInt(e.target.value) || 30)} className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-center text-sm font-bold bg-white" />
                      <span className="text-xs text-blue-600">سيتم إنشاء {Math.ceil(duration / splitDuration)} أجزاء</span>
                    </div>
                  )}
                </div>
              )}

              {/* Silence Settings */}
              {operationMode === 'silence' && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-4">
                  <h5 className="text-sm font-bold text-purple-900 flex items-center gap-2"><VolumeX size={16} /> إعدادات إزالة الصمت</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-800 mb-1">عتبة الصمت (Threshold): {silenceThreshold} dB</label>
                      <input type="range" min="-60" max="-20" value={silenceThreshold} onChange={(e) => setSilenceThreshold(parseInt(e.target.value))} className="w-full accent-purple-600" />
                      <div className="flex justify-between text-[10px] text-purple-600 mt-1">
                        <span>-60dB (حساس جداً)</span>
                        <span>-20dB (صامت تماماً)</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-800 mb-1">الحد الأدنى لمدة الصمت: {silenceDuration} ثانية</label>
                      <input type="range" min="0.1" max="2.0" step="0.1" value={silenceDuration} onChange={(e) => setSilenceDuration(parseFloat(e.target.value))} className="w-full accent-purple-600" />
                      <div className="flex justify-between text-[10px] text-purple-600 mt-1">
                        <span>0.1s (فواصل قصيرة)</span>
                        <span>2.0s (فواصل طويلة)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Options (Fade) */}
              {operationMode !== 'split' && operationMode !== 'silence' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Clock size={16} /> خيارات متقدمة</h5>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={fadeIn} onChange={(e) => setFadeIn(e.target.checked)} className="w-4 h-4 accent-orange-600 rounded" />
                      <span className="text-sm font-bold text-slate-700">تلاشي في البداية (Fade In)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={fadeOut} onChange={(e) => setFadeOut(e.target.checked)} className="w-4 h-4 accent-orange-600 rounded" />
                      <span className="text-sm font-bold text-slate-700">تلاشي في النهاية (Fade Out)</span>
                    </label>
                    {(fadeIn || fadeOut) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">المدة (ثواني):</span>
                        <input type="number" min="0.5" max="10" step="0.5" value={fadeDuration} onChange={(e) => setFadeDuration(parseFloat(e.target.value))} className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setTargetFormat(f.id)} className={`rounded-xl border-2 p-3 text-center font-bold transition ${targetFormat === f.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>{f.name}</button>
                ))}
              </div>

              {(targetFormat === 'mp3' || targetFormat === 'ogg') && operationMode !== 'split' && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">معدل البت (Bitrate):</span>
                  <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="128">128 kbps</option><option value="192">192 kbps</option><option value="256">256 kbps</option><option value="320">320 kbps</option>
                  </select>
                </div>
              )}

              <button onClick={processAudio} disabled={isProcessing || (operationMode !== 'split' && operationMode !== 'silence' && endTime <= startTime) || duration === 0} className={`w-full rounded-xl px-6 py-4 font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                operationMode === 'trim' ? 'bg-orange-600' : 
                operationMode === 'cut-middle' ? 'bg-red-600' : 
                operationMode === 'split' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {isProcessing ? (<><RefreshCw size={20} className="animate-spin" /> {processStep}</>) : (
                  operationMode === 'trim' ? <><CheckCircle size={20} /> قص المقطع</> :
                  operationMode === 'cut-middle' ? <><Trash2 size={20} /> حذف المحدد</> :
                  operationMode === 'split' ? <><Grid3x3 size={20} /> تقسيم الملف</> :
                  <><VolumeX size={20} /> إزالة الصمت</>
                )}
              </button>

              {error && (<div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2"><AlertCircle size={20} className="shrink-0 mt-0.5" /><div><p className="font-bold">خطأ</p><p>{error}</p></div></div>)}

              {splitParts.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Grid3x3 size={20} className="text-blue-600" /> الأجزاء المقسمة ({splitParts.length})</h4>
                  <div className="space-y-3">
                    {splitParts.map((part) => (
                      <div key={part.index} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-lg shrink-0">{part.index}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">{part.name}</p>
                          <p className="text-xs text-slate-500">المدة: {formatTime(part.duration)} • الحجم: {(part.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={part.url} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="تشغيل"><Play size={18} /></a>
                          <button onClick={() => downloadPart(part)} className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition" title="تحميل"><Download size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {downloadUrl && (
                    <a href={downloadUrl} download="split-parts.zip" className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 transition">
                      <Download size={20} /> تحميل جميع الأجزاء (ZIP)
                    </a>
                  )}
                </div>
              )}

              {downloadUrl && operationMode !== 'split' && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                  <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" />
                  <h4 className="text-lg font-bold text-green-900 mb-3">تمت العملية بنجاح!</h4>
                  <audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg bg-white" />
                  <a href={downloadUrl} download={`processed.${targetFormat}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                    <Download size={20} /> تحميل الملف
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ================= MERGE MODE ================= */}
      {mode === 'merge' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8">
            <Layers size={40} className="mb-3 text-slate-400" />
            <h3 className="mb-2 text-lg font-bold text-slate-700">أضف ملفات صوتية للدمج</h3>
            <p className="mb-4 text-sm text-slate-500">يمكنك اختيار أكثر من ملف (MP3, WAV, M4A, FLAC)</p>
            <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors">
              اختيار ملفات <input type="file" accept="audio/*" multiple className="hidden" onChange={handleMergeFilesSelect} />
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><Layers size={20} /> قائمة الملفات ({mergeFiles.length})</h4>
              <div className="space-y-2">
                {mergeFiles.map((mf, index) => (
                  <div key={mf.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm shrink-0">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-slate-900">{mf.name}</p>
                      <p className="text-xs text-slate-500">{formatTime(mf.duration)} • {(mf.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => moveMergeFile(index, 'up')} disabled={index === 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600" title="نقل لأعلى"><ArrowUp size={16} /></button>
                      <button onClick={() => moveMergeFile(index, 'down')} disabled={index === mergeFiles.length - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600" title="نقل لأسفل"><ArrowDown size={16} /></button>
                      <button onClick={() => removeMergeFile(mf.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="حذف"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setTargetFormat(f.id)} className={`rounded-xl border-2 p-3 text-center font-bold transition ${targetFormat === f.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600'}`}>{f.name}</button>
                ))}
              </div>

              {(targetFormat === 'mp3' || targetFormat === 'ogg') && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">معدل البت (Bitrate):</span>
                  <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="128">128 kbps</option><option value="192">192 kbps</option><option value="256">256 kbps</option><option value="320">320 kbps</option>
                  </select>
                </div>
              )}

              <button onClick={mergeFilesLogic} disabled={isProcessing || mergeFiles.length < 2} className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {isProcessing ? (<><RefreshCw size={20} className="animate-spin" /> {processStep}</>) : (<><Layers size={20} /> دمج {mergeFiles.length} ملفات</>)}
              </button>

              {error && (<div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2"><AlertCircle size={20} className="shrink-0 mt-0.5" /><div><p className="font-bold">خطأ</p><p>{error}</p></div></div>)}
              
              {downloadUrl && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                  <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" />
                  <h4 className="text-lg font-bold text-green-900 mb-3">تم الدمج بنجاح!</h4>
                  <audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg bg-white" />
                  <a href={downloadUrl} download={`merged.${targetFormat}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                    <Download size={20} /> تحميل الملف المدمج
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
