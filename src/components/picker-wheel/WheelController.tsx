'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCw, Trophy, AlertCircle, X, PartyPopper } from 'lucide-react';
import type { WheelImage, WheelOption } from '@/lib/picker-wheel/types';
import { processWheelImage } from '@/lib/picker-wheel/image-processor';
import { saveWheelImage, deleteWheelImage } from '@/lib/picker-wheel/storage';
import { DEFAULT_OPTIONS, DEFAULT_WHEEL_SETTINGS } from '@/lib/picker-wheel/constants';
import { useWheelSpin } from '@/lib/picker-wheel/useWheelSpin';
import WheelCanvas from './WheelCanvas';
import WheelOptions from './WheelOptions';

const confettiColors = [
  '#ea580c', '#f59e0b', '#22c55e', '#3b82f6',
  '#ec4899', '#a855f7', '#14b8a6', '#ef4444',
];

export default function WheelController() {
  const [options, setOptions] = useState<WheelOption[]>(DEFAULT_OPTIONS);
  const [showImages, setShowImages] = useState(DEFAULT_WHEEL_SETTINGS.showImages);
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_WHEEL_SETTINGS.soundEnabled);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const imageUrlsRef = useRef<Set<string>>(new Set());

  const {
    rotation,
    isSpinning,
    winner,
    error,
    spin,
    reset,
  } = useWheelSpin({
    options,
    duration: DEFAULT_WHEEL_SETTINGS.spinDuration * 1000,
    extraTurns: 5,
    soundEnabled,
  });

  useEffect(() => {
    if (winner) {
      setShowWinnerModal(true);
    }
  }, [winner]);

  const handleOptionsChange = (nextOptions: WheelOption[]) => {
    setOptions(nextOptions);
    setShowWinnerModal(false);
    reset();
  };

  useEffect(() => {
    return () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      imageUrlsRef.current.clear();
    };
  }, []);
  const handleImageSelect = async (optionId: string, file: File | null) => {
    setImageError(null);

    const currentOption = options.find((option) => option.id === optionId);
    if (!currentOption) return;

    const oldImageId = currentOption.imageId;

    if (!file) {
      setOptions((previous) =>
        previous.map((option) =>
          option.id === optionId
            ? { ...option, imageId: undefined }
            : option,
        ),
      );

      setImageUrls((previous) => {
        const next = { ...previous };
        delete next[optionId];
        return next;
      });

      if (
        oldImageId &&
        !options.some(
          (option) => option.id !== optionId && option.imageId === oldImageId,
        )
      ) {
        await deleteWheelImage(oldImageId);
      }
      return;
    }

    setIsImageProcessing(true);

    let savedImageId: string | null = null;

    try {
      const processed = await processWheelImage(file);
      const imageId = crypto.randomUUID();

      const image: WheelImage = {
        id: imageId,
        blob: processed.blob,
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
      };

      await saveWheelImage(image);
      savedImageId = imageId;

      const imageUrl = URL.createObjectURL(processed.blob);
      imageUrlsRef.current.add(imageUrl);

      setImageUrls((previous) => ({
        ...previous,
        [optionId]: imageUrl,
      }));

      setOptions((previous) =>
        previous.map((option) =>
          option.id === optionId
            ? { ...option, imageId }
            : option,
        ),
      );

      if (
        oldImageId &&
        !options.some(
          (option) => option.id !== optionId && option.imageId === oldImageId,
        )
      ) {
        await deleteWheelImage(oldImageId);
      }
    } catch (error) {
      if (savedImageId) {
        await deleteWheelImage(savedImageId).catch(() => undefined);
      }

      setImageError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء معالجة الصورة وحفظها.',
      );
    } finally {
      setIsImageProcessing(false);
    }
  };
  const handleCloseWinner = () => {
    setShowWinnerModal(false);
  };

  return (
    <section dir="rtl" className="mx-auto w-full max-w-6xl space-y-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <WheelCanvas
            options={options}
            rotation={rotation}
            isSpinning={isSpinning}
            showImages={showImages}
            imageUrls={imageUrls}
            size={480}
          />

          <button
            type="button"
            onClick={spin}
            disabled={isSpinning || options.length < 2}
            className="inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCw
              className={`h-6 w-6 ${isSpinning ? 'animate-spin' : ''}`}
            />
            {isSpinning ? 'جاري الدوران...' : 'أدر العجلة'}
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={isSpinning}
            className="text-sm font-medium text-slate-500 transition hover:text-orange-600 disabled:opacity-40"
          >
            إعادة ضبط العجلة
          </button>
        </div>

        <div className="space-y-6">
          <WheelOptions
            options={options}
            onChange={handleOptionsChange}
            disabled={isSpinning || isImageProcessing}
            imageUrls={imageUrls}
            onImageSelect={handleImageSelect}
          />$2<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700"><input type="checkbox" checked={showImages}
              onChange={(event) => setShowImages(event.target.checked)}
              disabled={isSpinning}
              className="h-4 w-4 accent-orange-600"
            />
            إظهار صور الخيارات
          </label>

          {imageError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {imageError}
            </div>
          )}

          {isImageProcessing && (
            <p className="text-center text-sm font-medium text-orange-700">
              جارٍ معالجة الصورة وحفظها...
            </p>
          )}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => setSoundEnabled(event.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            تفعيل أصوات الدوران والفوز
          </label>

          {winner && !showWinnerModal && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium text-amber-800">الفائز هو</p>
              <p className="mt-1 break-words text-2xl font-extrabold text-slate-900">
                {winner.label}
              </p>
              <button
                type="button"
                onClick={() => setShowWinnerModal(true)}
                className="mt-3 text-sm font-bold text-orange-700 hover:text-orange-800"
              >
                عرض الاحتفال
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {winner && showWinnerModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={handleCloseWinner}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="winner-title"
            className="winner-celebration relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] border-4 border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-7 text-center shadow-2xl sm:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseWinner}
              aria-label="إغلاق نافذة الفائز"
              className="absolute left-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-500 shadow transition hover:bg-white hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 36 }, (_, index) => (
                <span
                  key={index}
                  className="winner-confetti absolute top-[-20px] h-3 w-2 rounded-sm"
                  style={{
                    left: `${(index * 37 + 7) % 100}%`,
                    backgroundColor: confettiColors[index % confettiColors.length],
                    animationDelay: `${(index % 12) * 0.16}s`,
                    animationDuration: `${2.5 + (index % 5) * 0.45}s`,
                  }}
                />
              ))}

              <span className="winner-balloon absolute left-[8%] top-[20%] text-4xl">🎈</span>
              <span className="winner-balloon absolute right-[8%] top-[25%] text-4xl">🎈</span>
              <span className="winner-balloon absolute bottom-[12%] left-[12%] text-3xl">🎊</span>
              <span className="winner-balloon absolute bottom-[15%] right-[12%] text-3xl">🎉</span>
            </div>

            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-300 to-orange-500 shadow-xl shadow-orange-500/30">
                <Trophy className="h-14 w-14 text-white drop-shadow-md" />
              </div>

              <div className="mb-3 flex items-center justify-center gap-2 text-orange-600">
                <PartyPopper className="h-6 w-6" />
                <p className="text-lg font-extrabold">تهانينا!</p>
                <PartyPopper className="h-6 w-6 -scale-x-100" />
              </div>

              <h2
                id="winner-title"
                className="mb-4 text-3xl font-black text-slate-900 sm:text-4xl"
              >
                لدينا فائز!
              </h2>

              <p className="mb-3 text-base font-semibold text-amber-800">
                الفائز في هذه الجولة هو
              </p>

              <div className="rounded-2xl border-2 border-amber-300 bg-white/90 px-4 py-6 shadow-inner">
                <p className="break-words text-3xl font-black leading-relaxed text-orange-600 sm:text-4xl">
                  {winner.label}
                </p>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-600">
                🎉 مبروك للفائز، حظاً سعيداً للجميع في الجولة القادمة!
              </p>

              <button
                type="button"
                onClick={handleCloseWinner}
                className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5 hover:from-orange-700 hover:to-amber-600"
              >
                <Trophy className="h-5 w-5" />
                رائع، متابعة
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .winner-celebration {
          animation: winner-appear 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .winner-confetti {
          animation-name: winner-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .winner-balloon {
          animation: balloon-float 2.5s ease-in-out infinite alternate;
        }

        @keyframes winner-appear {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes winner-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(650px) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes balloon-float {
          from {
            transform: translateY(0) rotate(-8deg);
          }
          to {
            transform: translateY(-14px) rotate(8deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .winner-celebration,
          .winner-confetti,
          .winner-balloon {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}



