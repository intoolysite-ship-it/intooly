'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WheelOption } from './types';
import {
  createSpinPlan,
  getWinnerIndexAtPointer,
} from './wheel-engine';
import { createWheelAudio, type WheelAudio } from './wheel-sounds';

interface UseWheelSpinOptions {
  options: WheelOption[];
  duration?: number;
  extraTurns?: number;
  soundEnabled?: boolean;
  onFinish?: (winner: WheelOption) => void;
}

interface UseWheelSpinReturn {
  rotation: number;
  isSpinning: boolean;
  winner: WheelOption | null;
  error: string | null;
  spin: () => void;
  reset: () => void;
}

const DEFAULT_DURATION = 8000;
const DEFAULT_EXTRA_TURNS = 5;

function easeOutQuart(progress: number): number {
  return 1 - Math.pow(1 - progress, 4);
}

export function useWheelSpin({
  options,
  duration = DEFAULT_DURATION,
  extraTurns = DEFAULT_EXTRA_TURNS,
  soundEnabled = true,
  onFinish,
}: UseWheelSpinOptions): UseWheelSpinReturn {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rotationRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const spinningRef = useRef(false);
  const mountedRef = useRef(true);
  const audioRef = useRef<WheelAudio | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const lastTickTimeRef = useRef(0);
  const lastTickProgressRef = useRef(0);

  const optionsRef = useRef(options);
  const durationRef = useRef(duration);
  const extraTurnsRef = useRef(extraTurns);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    optionsRef.current = options;
    durationRef.current = duration;
    extraTurnsRef.current = extraTurns;
    onFinishRef.current = onFinish;
    soundEnabledRef.current = soundEnabled;
  }, [options, duration, extraTurns, onFinish, soundEnabled]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      spinningRef.current = false;
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const reset = useCallback(() => {
    if (spinningRef.current) return;

    rotationRef.current = 0;
    setRotation(0);
    setWinner(null);
    setError(null);
  }, []);

  const spin = useCallback(() => {
    if (spinningRef.current) return;

    const currentOptions = optionsRef.current;

    if (currentOptions.length < 2) {
      setError('أضف خيارين على الأقل لبدء الدوران.');
      return;
    }

    if (!Number.isFinite(durationRef.current) || durationRef.current <= 0) {
      setError('مدة الدوران غير صالحة.');
      return;
    }

    let plan;

    try {
      plan = createSpinPlan(
        currentOptions,
        rotationRef.current,
        extraTurnsRef.current,
      );
    } catch (spinError) {
      setError(
        spinError instanceof Error
          ? spinError.message
          : 'حدث خطأ أثناء تجهيز الدوران.',
      );
      return;
    }

    if (soundEnabledRef.current) {
      try {
        if (!audioRef.current) {
          audioRef.current = createWheelAudio();
        }
        lastTickTimeRef.current = 0;
        lastTickProgressRef.current = 0;
      } catch {
        audioRef.current = null;
      }
    }

    spinningRef.current = true;
    setIsSpinning(true);
    setWinner(null);
    setError(null);

    const startRotation = rotationRef.current;
    const targetRotation = plan.targetRotation;
    const startTime = performance.now();
    const spinDuration = durationRef.current;

    const animate = (currentTime: number) => {
      if (!mountedRef.current) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = easeOutQuart(progress);

      const nextRotation =
        startRotation +
        (targetRotation - startRotation) * easedProgress;

      rotationRef.current = nextRotation;
      setRotation(nextRotation);

      if (soundEnabledRef.current && audioRef.current && progress < 1) {
        const tickInterval = 45 + easedProgress * 310;
        const progressStep = easedProgress - lastTickProgressRef.current;

        if (
          currentTime - lastTickTimeRef.current >= tickInterval &&
          progressStep > 0.00001
        ) {
          audioRef.current.playTick();
          lastTickTimeRef.current = currentTime;
          lastTickProgressRef.current = easedProgress;
        }
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      rotationRef.current = targetRotation;
      setRotation(targetRotation);

      frameRef.current = null;
      spinningRef.current = false;
      setIsSpinning(false);

      try {
        const actualWinnerIndex = getWinnerIndexAtPointer(
          currentOptions,
          targetRotation,
        );

        const actualWinner = currentOptions[actualWinnerIndex];

        if (!actualWinner || actualWinnerIndex !== plan.winnerIndex) {
          throw new Error('تعذر التحقق من نتيجة الدوران.');
        }

        setWinner(actualWinner);

        if (soundEnabledRef.current) {
          audioRef.current?.playWin();
        }

        onFinishRef.current?.(actualWinner);
      } catch (finishError) {
        setError(
          finishError instanceof Error
            ? finishError.message
            : 'حدث خطأ أثناء تحديد الفائز.',
        );
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, []);

  return {
    rotation,
    isSpinning,
    winner,
    error,
    spin,
    reset,
  };
}
