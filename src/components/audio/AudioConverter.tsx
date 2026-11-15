'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Music, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

type AudioFormat = 'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg' | 'aac';

const FORMATS: { id: AudioFormat; name: string; mime: string }[] = [
  { id: 'mp3', name: 'MP3', mime: 'audio/mpeg' },
  { id: 'wav', name: 'WAV', mime: 'audio/wav' },
  { id: 'm4a', name: 'M4A', mime: 'audio/mp4' },
  { id: 'flac', name: 'FLAC', mime: 'audio/flac' },
  { id: 'ogg', name: 'OGG', mime: 'audio/ogg' },
  { id: 'aac', name: 'AAC', mime: 'audio/aac' },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function AudioConverter({ defaultFormat = 'mp3' }: { defaultFormat?: AudioFormat }) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>(defaultFormat);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [processStep, setProcessStep] = useState('');

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFfmpegLoaded(true);
      return ffmpeg;
    } catch (err: any) {
      throw new Error('فشل تحميل محرك المعالجة. يرجى تعطيل Ad-blocker أو استخدام Chrome/Edge.');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('حجم الملف يتجاوز 50 ميجابايت. يرجى اختيار ملف أصغر.');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setDownloadUrl(null);
    e.target.value = '';
  };

  const convertAudio = async () => {
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

      setProcessStep('جاري تحويل الصوت...');
      
      let args: string[] = [];
      if (targetFormat === 'mp3') args = ['-c:a', 'libmp3lame', '-q:a', '2'];
      else if (targetFormat === 'wav') args = ['-c:a', 'pcm_s16le'];
      else if (targetFormat === 'flac') args = ['-c:a', 'flac'];
      else if (targetFormat === 'ogg') args = ['-c:a', 'libvorbis', '-q:a', '4'];
      else if (targetFormat === 'm4a' || targetFormat === 'aac') args = ['-c:a', 'aac', '-b:a', '192k'];
      else args = ['-c:a', 'copy'];

      await ffmpeg.exec(['-i', inputName, ...args, '-y', outputName]);

      setProcessStep('جاري تحضير الملف...');
      const data = await ffmpeg.readFile(outputName);
      const mime = FORMATS.find(f => f.id === targetFormat)?.mime || 'audio/mpeg';
      const blob = new Blob([data as any], { type: mime });
      
      if (blob.size === 0) throw new Error('الملف الناتج فارغ. جرب صيغة أخرى.');
      
      setDownloadUrl(URL.createObjectURL(blob));
      setProcessStep('تم التحويل بنجاح!');
      
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحويل.');
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
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12">
          <Upload size={48} className="mb-4 text-slate-400" />
          <h3 className="mb-2 text-xl font-bold text-slate-700">ارفع ملف صوتي للبدء</h3>
          <p className="mb-6 text-sm text-slate-500">MP3, WAV, M4A, FLAC, OGG, AAC (الحد الأقصى 50 ميجابايت)</p>
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
            <button onClick={() => { setFile(null); setDownloadUrl(null); setError(null); }} className="text-sm text-red-600 font-bold hover:underline">
              إزالة
            </button>
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
            onClick={convertAudio}
            disabled={isProcessing}
            className="w-full rounded-xl bg-orange-600 px-6 py-4 font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? (
              <><RefreshCw size={20} className="animate-spin" /> {processStep}</>
            ) : (
              <><RefreshCw size={20} /> تحويل إلى {targetFormat.toUpperCase()}</>
            )}
          </button>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">خطأ</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {downloadUrl && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" />
              <h4 className="text-lg font-bold text-green-900 mb-3">تم التحويل بنجاح!</h4>
              <audio src={downloadUrl} controls className="w-full mb-4 max-w-md mx-auto rounded-lg bg-white" />
              <a href={downloadUrl} download={`converted.${targetFormat}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors">
                <Download size={20} /> تحميل الملف
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}