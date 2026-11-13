export interface WheelAudio {
  playTick: () => void;
  playWin: () => void;
  dispose: () => void;
}

export function createWheelAudio(): WheelAudio | null {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null;
  }

  try {
    const context = new window.AudioContext();

    if (context.state === 'suspended') {
      void context.resume();
    }

    const playTone = (
      frequency: number,
      startOffset: number,
      duration: number,
      volume: number,
      type: OscillatorType = 'sine',
    ) => {
      if (context.state === 'closed') return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + startOffset;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + duration,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    };

    return {
      playTick: () => {
        playTone(900, 0, 0.045, 0.12, 'triangle');
      },

      playWin: () => {
        playTone(523.25, 0, 0.22, 0.16);
        playTone(659.25, 0.13, 0.22, 0.16);
        playTone(783.99, 0.26, 0.22, 0.16);
        playTone(1046.5, 0.42, 0.38, 0.18);
      },

      dispose: () => {
        if (context.state !== 'closed') {
          void context.close();
        }
      },
    };
  } catch {
    return null;
  }
}
