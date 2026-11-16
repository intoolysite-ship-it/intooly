'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Music, Loader2, AlertCircle, CheckCircle2, RefreshCw, Play, Pause, Scissors, Clock, Layers } from 'lucide-react';

type AudioFormat = 'mp3' | 'wav' | 'flac' | 'ogg';

type MergeFile = {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  duration: number;
};

const FORMATS: { id: AudioFormat; name: string; mime: string }[] = [
  { id: 'mp3', name: 'MP3', mime: 'audio/mpeg' },
  { id: 'wav', name: 'WAV', mime: 'audio/wav' },
  { id: 'flac', name: 'FLAC', mime: 'audio/flac' },
  { id: 'ogg', name: 'OGG', mime: 'audio/ogg' },
];

export default function AudioEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(2);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'trim' | 'merge'>('trim');
  const [mergeFiles, setMergeFiles] = useState<MergeFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    try {
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
    } catch (err: any) {
      throw new Error('فشل تحميل محرك المعالجة.');
    }
  }, []);

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !audioBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    const data = audioBuffer.getChannelData(0);
    const samples = 500;
    const blockSize = Math.floor(data.length / samples);

    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * width;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[i * blockSize + j]);
      }
      const barHeight = (sum / blockSize) * height * 0.8;
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      gradient.addColorStop(0, '#f97316');
      gradient.addColorStop(1, '#c2410c');
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, Math.max(1, width / samples - 1), barHeight);
    }

    // رسم التحديد
    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;
    ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
    ctx.fillRect(startX, 0, endX - startX, height);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, 0, endX - startX, height);

    // مؤشر التشغيل
    const playX = (currentTime / duration) * width;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playX, 0);
    ctx.lineTo(playX, height);
    ctx.stroke();
  }, [audioBuffer, startTime, endTime, currentTime, duration]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setAudioUrl(URL.createObjectURL(selectedFile));
    setError(null);
    setDownloadUrl(null);
    e.target.value = '';

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setStartTime(0);
      setEndTime(buffer.duration);
    } catch (err) {
      setError('تعذر تحليل الملف الصوتي.');
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  // ============ دوال الدمج ============
  const handleMergeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('audio/')) continue;
      
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await f.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        
        const newFile: MergeFile = {
          id: Date.now().toString() + Math.random(),
          file: f,
          url: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
          duration: buffer.duration,
        };
        
        setMergeFiles(prev => [...prev, newFile]);
        ctx.close();
      } catch (err) {
        console.warn('فشل تحليل الملف:', f.name);
      }
    }
    e.target.value = '';
  };

  const removeMergeFile = (id: string) => {
    setMergeFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const moveMergeFile = (id: string, direction: 'up' | 'down') => {
    setMergeFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const mergeAllFiles = async () => {
    if (mergeFiles.length < 2) {
      setError('يجب إضافة ملفين على الأقل للدمج.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      setProcessStep('جاري قراءة الملفات...');
      const inputNames: string[] = [];
      for (let i = 0; i < mergeFiles.length; i++) {
        const mf = mergeFiles[i];
        const ext = mf.name.split('.').pop()?.toLowerCase() || 'mp3';
        const inputName = `input_${i}.${ext}`;
        await ffmpeg.writeFile(inputName, await fetchFile(mf.file));
        inputNames.push(inputName);
      }

      setProcessStep('جاري تحويل الملفات إلى WAV...');
      const wavNames: string[] = [];
      for (let i = 0; i < inputNames.length; i++) {
        const wavName = `wav_${i}.wav`;
        await ffmpeg.exec(['-i', inputNames[i], '-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '2', '-y', wavName]);
        wavNames.push(wavName);
      }

      setProcessStep('جاري دمج الملفات...');
      const concatContent = wavNames.map(f => `file '${f}'`).join('\n');
      await ffmpeg.writeFile('concat_list.txt', concatContent);
      const outputName = `merged_output.${targetFormat}`;
      
      let codecArgs: string[] = [];
      if (targetFormat === 'mp3') codecArgs = ['-c:a', 'libmp3lame', '-q:a', '2'];
      else if (targetFormat === 'wav') codecArgs = ['-c:a', 'pcm_s16le'];
      else if (targetFormat === 'flac') codecArgs = ['-c:a', 'flac'];
      else if (targetFormat === 'ogg') codecArgs = ['-c:a', 'libvorbis', '-q:a', '4'];

      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', ...codecArgs, '-y', outputName]);

      setProcessStep('جاري تحضير الملف...');
      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
      const blob = new Blob([data as any], { type: mime });
      
      setDownloadUrl(URL.createObjectURL(blob));
      setProcessStep('تم الدمج بنجاح!');

      // تنظيف
      for (const f of [...inputNames, ...wavNames]) {
        await ffmpeg.deleteFile(f).catch(() => {});
      }
      await ffmpeg.deleteFile('concat_list.txt').catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الدمج.');
    } finally {
      setIsProcessing(false);
    }
  };

  const trimAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      setProcessStep('جاري قراءة الملف...');
      const inputExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const inputName = `input.${inputExt}`;
      const outputName = `output.${targetFormat}`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setProcessStep('جاري قص الصوت...');
      const clipDuration = endTime - startTime;
      
      let args: string[] = ['-i', inputName, '-ss', startTime.toString(), '-t', clipDuration.toString()];
      
      // إضافة فلاتر Fade In / Fade Out
      const filters: string[] = [];
      if (fadeIn) filters.push(`afade=t=in:st=0:d=${fadeDuration}`);
      if (fadeOut) filters.push(`afade=t=out:st=${Math.max(0, clipDuration - fadeDuration)}:d=${fadeDuration}`);
      
      if (filters.length > 0) {
        args.push('-af', filters.join(','));
      }
      
      if (targetFormat === 'mp3') args.push('-c:a', 'libmp3lame', '-q:a', '2');
      else if (targetFormat === 'wav') args.push('-c:a', 'pcm_s16le');
      else if (targetFormat === 'flac') args.push('-c:a', 'flac');
      else if (targetFormat === 'ogg') args.push('-c:a', 'libvorbis', '-q:a', '4');
      args.push('-y', outputName);

      await ffmpeg.exec(args);

      setProcessStep('جاري تحضير الملف...');
      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
      const blob = new Blob([data as any], { type: mime });
      
      setDownloadUrl(URL.createObjectURL(blob));
      setProcessStep('تم القص بنجاح!');
      
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء القص.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* التبويبات */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setMode('trim')}
          className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${
            mode === 'trim' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Scissors size={16} className="inline ml-1" /> قص
        </button>
        <button
          onClick={() => setMode('merge')}
          className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${
            mode === 'merge' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers size={16} className="inline ml-1" /> دمج
        </button>
      </div>

      {/* وضع الدمج */}
      {mode === 'merge' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8">
            <Upload size={40} className="mb-3 text-slate-400" />
            <h3 className="mb-2 text-lg font-bold text-slate-700">أضف ملفات صوتية للدمج</h3>
            <p className="mb-4 text-sm text-slate-500">يمكنك اختيار أكثر من ملف (MP3, WAV, M4A, FLAC)</p>
            <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors">
              اختيار ملفات
              <input type="file" accept="audio/*" multiple className="hidden" onChange={handleMergeFileSelect} />
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">الملفات ({mergeFiles.length})</h4>
              {mergeFiles.map((mf, index) => (
                <div key={mf.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{mf.name}</p>
                    <p className="text-xs text-slate-500">{formatTime(mf.duration)} • {(mf.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveMergeFile(mf.id, 'up')} disabled={index === 0} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30" title="أعلى">
                      ▲
                    </button>
                    <button onClick={() => moveMergeFile(mf.id, 'down')} disabled={index === mergeFiles.length - 1} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30" title="أسفل">
                      ▼
                    </button>
                    <button onClick={() => removeMergeFile(mf.id)} className="p-1.5 rounded hover:bg-red-100 text-red-600" title="حذف">
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTargetFormat(f.id)}
                    className={`rounded-xl border-2 p-2 text-center font-bold text-sm transition ${
                      targetFormat === f.id 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <button
                onClick={mergeAllFiles}
                disabled={isProcessing || mergeFiles.length < 2}
                className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
                ) : (
                  <><Layers size={20} /> دمج {mergeFiles.length} ملفات في ملف واحد</>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div><p className="font-bold">خطأ</p><p>{error}</p></div>
            </div>
          )}

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

      {/* وضع القص (الواجهة الحالية) */}
      {mode === 'trim' && (
        <>
          {!file ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
          <Upload size={48} className="mb-4 text-slate-400" />
          <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملفاً صوتياً للبدء</h3>
          <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, FLAC (الحد الأقصى 50 ميجابايت)</p>
          <label className="cursor-pointer rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 transition-colors">
            اختيار ملف
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
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
            <button onClick={() => { setFile(null); setAudioUrl(null); setAudioBuffer(null); setDownloadUrl(null); }} className="text-sm text-red-600 font-bold hover:underline">
              إزالة
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl || ''}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-32 rounded-lg bg-white cursor-pointer"
              onClick={(e) => {
                if (!canvasRef.current || !audioRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const time = (x / rect.width) * duration;
                audioRef.current.currentTime = time;
                setCurrentTime(time);
              }}
            />
            <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
              <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div className="text-sm font-mono text-slate-600">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">البداية</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full accent-orange-600"
              />
              <p className="text-xs text-slate-500 mt-1 font-mono">{formatTime(startTime)}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">النهاية</label>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={endTime}
                onChange={(e) => setEndTime(parseFloat(e.target.value))}
                className="w-full accent-orange-600"
              />
              <p className="text-xs text-slate-500 mt-1 font-mono">{formatTime(endTime)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => setTargetFormat(f.id)}
                className={`rounded-xl border-2 p-3 text-center font-bold transition ${
                  targetFormat === f.id 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <button
            onClick={trimAudio}
            disabled={isProcessing || endTime <= startTime}
            className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? (
              <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
            ) : (
              <><Scissors size={20} /> قص المقطع (من {formatTime(startTime)} إلى {formatTime(endTime)})</>
            )}
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div><p className="font-bold">خطأ</p><p>{error}</p></div>
            </div>
          )}

          {downloadUrl && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" />
              <h4 className="text-lg font-bold text-green-900 mb-3">تم القص بنجاح!</h4>
              <audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg bg-white" />
              <a href={downloadUrl} download={`trimmed.${targetFormat}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                <Download size={20} /> تحميل المقطع
              </a>
            </div>
          )}
        </div>
      )}
      </>
    )}
    </div>
  );
}