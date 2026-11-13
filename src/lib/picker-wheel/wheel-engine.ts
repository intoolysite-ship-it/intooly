import type { WheelOption } from './types';

const TAU = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2;

export interface WheelSegment {
  option: WheelOption;
  index: number;
  startAngle: number;
  endAngle: number;
  angle: number;
}

export interface WheelSpinPlan {
  winnerIndex: number;
  targetRotation: number;
  winningAngle: number;
}

function normalizeAngle(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

function getRandomUnit(): number {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('المتصفح لا يدعم مولّد الأرقام العشوائية الآمن.');
  }

  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] / 4294967296;
}

function getValidWeight(option: WheelOption): number {
  const weight = Number(option.weight);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error('يجب أن يكون وزن كل خيار رقماً موجباً.');
  }

  return weight;
}

export function getWheelSegments(options: WheelOption[]): WheelSegment[] {
  if (options.length < 2) {
    throw new Error('تحتاج العجلة إلى خيارين على الأقل.');
  }

  const totalWeight = options.reduce(
    (total, option) => total + getValidWeight(option),
    0,
  );

  let currentAngle = 0;

  return options.map((option, index) => {
    const startAngle = currentAngle;
    const angle = (getValidWeight(option) / totalWeight) * TAU;
    currentAngle += angle;

    return {
      option,
      index,
      startAngle,
      endAngle: currentAngle,
      angle,
    };
  });
}

export function getWinnerIndexAtPointer(
  options: WheelOption[],
  rotation: number,
): number {
  const segments = getWheelSegments(options);
  const localAngle = normalizeAngle(POINTER_ANGLE - rotation);

  const segment = segments.find(
    (item) =>
      localAngle >= item.startAngle &&
      localAngle < item.endAngle,
  );

  return segment?.index ?? segments.length - 1;
}

export function createSpinPlan(
  options: WheelOption[],
  currentRotation = 0,
  extraTurns = 5,
): WheelSpinPlan {
  const segments = getWheelSegments(options);
  const totalWeight = options.reduce(
    (total, option) => total + getValidWeight(option),
    0,
  );

  let randomWeight = getRandomUnit() * totalWeight;
  let winnerIndex = segments.length - 1;

  for (const segment of segments) {
    randomWeight -= getValidWeight(segment.option);

    if (randomWeight < 0) {
      winnerIndex = segment.index;
      break;
    }
  }

  const winner = segments[winnerIndex];
  const winningAngle =
    winner.startAngle + getRandomUnit() * winner.angle;

  const desiredRotation = normalizeAngle(
    POINTER_ANGLE - winningAngle,
  );

  const minimumRotation = currentRotation + Math.max(1, extraTurns) * TAU;

  const turns = Math.ceil(
    (minimumRotation - desiredRotation) / TAU,
  );

  const targetRotation = desiredRotation + turns * TAU;

  return {
    winnerIndex,
    targetRotation,
    winningAngle,
  };
}

export function getWeightedWinnerIndices(
  options: WheelOption[],
  winnerCount: number,
): number[] {
  if (winnerCount < 1 || winnerCount > options.length) {
    throw new Error('عدد الفائزين غير صالح.');
  }

  const remaining = options.map((option, index) => ({
    option,
    index,
  }));

  const winners: number[] = [];

  while (winners.length < winnerCount) {
    const totalWeight = remaining.reduce(
      (total, item) => total + getValidWeight(item.option),
      0,
    );

    let randomWeight = getRandomUnit() * totalWeight;
    let selectedIndex = remaining.length - 1;

    for (let i = 0; i < remaining.length; i++) {
      randomWeight -= getValidWeight(remaining[i].option);

      if (randomWeight < 0) {
        selectedIndex = i;
        break;
      }
    }

    winners.push(remaining[selectedIndex].index);
    remaining.splice(selectedIndex, 1);
  }

  return winners;
}
