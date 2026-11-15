'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Music, Loader2, AlertCircle, CheckCircle2, RefreshCw, Volume2, Sliders } from 'lucide-react';

export default function AudioDenoiser() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(30); // 0-100
  const [error, setError] = useState<string | null>(null);
  const [processStep, setProcessStep] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const ffmpegRef = useRef<any>(null);

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
      throw new Error('فشل تحميل محرك المعالجة. يرجى تعطيل Ad-blocker أو استخدام Chrome/Edge.');
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setError('يرجى اختيار ملف صوتي صالح.');
      return;
    }
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setCleanedUrl(null);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const denoiseAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setCleanedUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      setProcessStep('جاري قراءة الملف...');
      const inputExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const inputName = `input.${inputExt}`;
      const outputName = `output.wav`;
      
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setProcessStep('جاري إزالة الضوضاء...');
      
      // afftdn (FFT Denoiser):
      // -nr: noise reduction (dB) - أعلى = إزالة أقوى
      // -nf: noise floor (dB) - مستوى الضوضاء
      // -tn: track noise - تتبع الضوضاء تلقائياً
      const nrValue = Math.round((noiseLevel / 100) * 40); // 0-40 dB
      
      await ffmpeg.exec([
        '-i', inputName,
        '-af', `afftdn=nr=${nrValue}:nf=-30:tn=1`,
        '-c:a', 'pcm_s16le',
        '-ar', '44100',
        '-y', outputName
      ]);

      setProcessStep('جاري تحضير الملف...');
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: 'audio/wav' });
      
      if (blob.size === 0) throw new Error('الملف الناتج فارغ. جرب مستوى تنظيف مختلف.');
      
      setCleanedUrl(URL.createObjectURL(blob));
      setProcessStep('تمت المعالجة بنجاح!');
      
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء المعالجة.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
            isDragging ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <Upload size={48} className="mb-4 text-slate-400" />
          <h3 className="mb-2 text-xl font-bold text-slate-700">اسحب ملفاً صوتياً هنا أو انقر للاختيار</h3>
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
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setOriginalUrl(null); setCleanedUrl(null); setError(null); }} className="text-sm text-red-600 font-bold hover:underline">
              إزالة
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Sliders size={16} className="text-orange-600" />
              قوة التنظيف: {noiseLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseInt(e.target.value))}
              className="w-full accent-orange-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>خفيف (0%)</span>
              <span>متوسط (50%)</span>
              <span>قوي (100%)</span>
            </div>
          </div>

          <button
            onClick={denoiseAudio}
            disabled={isProcessing}
            className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? (
              <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
            ) : (
              <><Volume2 size={20} /> إزالة الضوضاء</>
            )}
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div><p className="font-bold">خطأ</p><p>{error}</p></div>
            </div>
          )}

          {(originalUrl || cleanedUrl) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {originalUrl && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 mb-2 text-sm">الأصلي</h4>
                  <audio src={originalUrl} controls className="w-full" />
                </div>
              )}
              {cleanedUrl && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h4 className="font-bold text-green-900 mb-2 text-sm flex items-center gap-1">
                    <CheckCircle2 size={16} /> بعد التنظيف
                  </h4>
                  <audio src={cleanedUrl} controls className="w-full" />
                  <a href={cleanedUrl} download={`denoised-${file.name.replace(/\.[^.]+$/, '')}.wav`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors">
                    <Download size={16} /> تحميل
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