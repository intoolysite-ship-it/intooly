'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Music, AlertCircle, CheckCircle2, RefreshCw, Play, Pause, Scissors, Clock, Layers } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';

type AudioFormat = 'mp3' | 'wav' | 'flac' | 'ogg';

const FORMATS: { id: AudioFormat; name: string; mime: string }[] = [
  { id: 'mp3', name: 'MP3', mime: 'audio/mpeg' },
  { id: 'wav', name: 'WAV', mime: 'audio/wav' },
  { id: 'flac', name: 'FLAC', mime: 'audio/flac' },
  { id: 'ogg', name: 'OGG', mime: 'audio/ogg' },
];

export default function AudioEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeDuration, setFadeDuration] = useState(2);
  const [bitrate, setBitrate] = useState('192');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'trim' | 'merge'>('trim');
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState('');

  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const ffmpegRef = useRef<any>(null);
  const playEndRef = useRef<number>(0);

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

  const initWaveSurfer = useCallback((url: string) => {
    if (!waveformRef.current) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#cbd5e1',
      progressColor: '#f97316',
      cursorColor: '#1e293b',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 120,
      max: true, // ✅ الحل: الموجة تتناسب مع عرض الحاوية بدون تمرير أفقي
      plugins: [regions],
    });

    wavesurferRef.current = ws;

    ws.on('ready', (dur: number) => {
      console.log('✅ WaveSurfer ready, duration =', dur);
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);

      regions.clearRegions();
      const region = regions.addRegion({
        start: 0,
        end: dur,
        color: 'rgba(249, 115, 22, 0.2)',
        drag: true,
        resize: true,
      });

      region.on('update', () => {
        setStartTime(region.start);
        setEndTime(region.end);
      });
    });

    ws.on('error', (err: any) => {
      console.error('❌ WaveSurfer error:', err);
      setError('تعذر تحليل الملف الصوتي.');
    });

    ws.on('audioprocess', (time: number) => {
      setCurrentTime(time);
      // ✅ إيقاف التشغيل تلقائياً عند نهاية المقطع المحدد
      if (playEndRef.current > 0 && time >= playEndRef.current) {
        ws.pause();
        playEndRef.current = 0;
      }
    });

    ws.on('seeking', (time: number) => setCurrentTime(time));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => { setIsPlaying(false); playEndRef.current = 0; });

    ws.load(url);
  }, []);

  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(null);
    setDownloadUrl(null);
    e.target.value = '';
    const url = URL.createObjectURL(selectedFile);
    setTimeout(() => initWaveSurfer(url), 100);
  };

  const togglePlay = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
        playEndRef.current = 0;
      } else {
        playEndRef.current = 0; // تشغيل كامل الملف
        wavesurferRef.current.play();
      }
    }
  };

  // ✅ زر جديد: معاينة المقطع المحدد فقط
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
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
      const args: string[] = ['-i', inputName, '-ss', startTime.toString(), '-t', clipDuration.toString()];

      const filters: string[] = [];
      if (fadeIn) filters.push(`afade=t=in:st=0:d=${fadeDuration}`);
      if (fadeOut) filters.push(`afade=t=out:st=${Math.max(0, clipDuration - fadeDuration)}:d=${fadeDuration}`);
      if (filters.length > 0) args.push('-af', filters.join(','));

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
      setProcessStep('تم القص بنجاح!');

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء القص.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        <button onClick={() => setMode('trim')} className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${mode === 'trim' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Scissors size={16} className="inline ml-1" /> قص
        </button>
        <button onClick={() => setMode('merge')} className={`flex-1 rounded-xl py-2.5 px-3 text-sm font-bold transition ${mode === 'merge' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          <Layers size={16} className="inline ml-1" /> دمج
        </button>
      </div>

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
                <button onClick={() => { setFile(null); setDuration(0); setDownloadUrl(null); if (wavesurferRef.current) { wavesurferRef.current.destroy(); wavesurferRef.current = null; } }} className="text-sm text-red-600 font-bold hover:underline">إزالة</button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2">
                    <button onClick={togglePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white hover:bg-orange-700" title="تشغيل/إيقاف الملف كاملاً">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={playSelection} disabled={endTime <= startTime} className="flex h-10 px-4 items-center justify-center gap-2 rounded-full bg-white border-2 border-orange-500 text-orange-700 hover:bg-orange-50 disabled:opacity-40 font-bold text-sm" title="معاينة المقطع المحدد فقط">
                      <Play size={16} /> معاينة المقطع
                    </button>
                  </div>
                  <div className="text-sm font-mono text-slate-600">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
                </div>
                <div ref={waveformRef} className="w-full rounded-lg bg-white overflow-hidden" />
              </div>

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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setTargetFormat(f.id)} className={`rounded-xl border-2 p-3 text-center font-bold transition ${targetFormat === f.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'}`}>
                    {f.name}
                  </button>
                ))}
              </div>

              {(targetFormat === 'mp3' || targetFormat === 'ogg') && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">معدل البت (Bitrate):</span>
                  <select value={bitrate} onChange={(e) => setBitrate(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none">
                    <option value="128">128 kbps (حجم أصغر)</option>
                    <option value="192">192 kbps (متوازن)</option>
                    <option value="256">256 kbps (جودة عالية)</option>
                    <option value="320">320 kbps (أعلى جودة)</option>
                  </select>
                </div>
              )}

              <button onClick={trimAudio} disabled={isProcessing || endTime <= startTime || duration === 0} className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {isProcessing ? (<><RefreshCw size={20} className="animate-spin" /> {processStep}</>) : (<><Scissors size={20} /> قص المقطع (من {formatTime(startTime)} إلى {formatTime(endTime)})</>)}
              </button>

              {error && (<div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2"><AlertCircle size={20} className="shrink-0 mt-0.5" /><div><p className="font-bold">خطأ</p><p>{error}</p></div></div>)}
              {downloadUrl && (<div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center"><CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" /><h4 className="text-lg font-bold text-green-900 mb-3">تم القص بنجاح!</h4><audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg bg-white" /><a href={downloadUrl} download={`trimmed.${targetFormat}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors"><Download size={20} /> تحميل المقطع</a></div>)}
            </div>
          )}
        </>
      )}

      {mode === 'merge' && (
        <div className="text-center py-10 text-slate-500">
          <Layers size={48} className="mx-auto mb-4 text-slate-300" />
          <p>وضع الدمج سيُعاد تفعيله بعد نجاح المرحلة الأولى.</p>
        </div>
      )}
    </div>
  );
}
