export type OvulationCalculationInput =
  | {
      cycleType: "regular";
      lastPeriodStart: string;
      cycleLength: number;
    }
  | {
      cycleType: "irregular";
      lastPeriodStart: string;
      shortestCycleLength: number;
      longestCycleLength: number;
    };

export interface OvulationCalculationResult {
  cycleType: "regular" | "irregular";
  lastPeriodStart: string;
  earliestOvulationDate: string;
  latestOvulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodEarliestDate: string;
  nextPeriodLatestDate: string;
}

/**
 * يتحقق من التاريخ ويعيد مكوناته دون الاعتماد على المنطقة الزمنية المحلية.
 */
function parseDateParts(dateString: string): {
  year: number;
  month: number;
  day: number;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    throw new Error("يرجى إدخال تاريخ صحيح.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1900 || year > 9999) {
    throw new Error("السنة المدخلة غير صالحة.");
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("التاريخ المدخل غير موجود في التقويم.");
  }

  return { year, month, day };
}

/**
 * يضيف عددًا من الأيام إلى تاريخ بصيغة YYYY-MM-DD.
 */
export function addCalendarDays(
  dateString: string,
  days: number
): string {
  const { year, month, day } = parseDateParts(dateString);

  if (!Number.isInteger(days)) {
    throw new Error("عدد الأيام يجب أن يكون عددًا صحيحًا.");
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  const resultYear = date.getUTCFullYear();
  const resultMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const resultDay = String(date.getUTCDate()).padStart(2, "0");

  if (resultYear > 9999) {
    throw new Error("التاريخ الناتج يتجاوز النطاق المدعوم.");
  }

  return `${resultYear}-${resultMonth}-${resultDay}`;
}

function validateCycleLength(length: number, fieldName: string): void {
  if (!Number.isInteger(length) || length < 15 || length > 60) {
    throw new Error(
      `${fieldName} يجب أن يكون عددًا صحيحًا بين 15 و60 يومًا.`
    );
  }
}

/**
 * يحسب مواعيد الإباضة والخصوبة والدورة التالية بصورة تقديرية.
 *
 * يعتمد الحساب التقويمي على افتراض أن الإباضة تحدث تقريبًا
 * قبل بداية الدورة التالية بنحو 14 يومًا.
 */
export function calculateOvulation(
  input: OvulationCalculationInput
): OvulationCalculationResult {
  parseDateParts(input.lastPeriodStart);

  let shortestCycle: number;
  let longestCycle: number;

  if (input.cycleType === "regular") {
    validateCycleLength(input.cycleLength, "طول الدورة");

    shortestCycle = input.cycleLength;
    longestCycle = input.cycleLength;
  } else {
    validateCycleLength(
      input.shortestCycleLength,
      "أقصر دورة"
    );

    validateCycleLength(
      input.longestCycleLength,
      "أطول دورة"
    );

    if (input.shortestCycleLength > input.longestCycleLength) {
      throw new Error(
        "أقصر دورة يجب ألا تكون أطول من أطول دورة."
      );
    }

    shortestCycle = input.shortestCycleLength;
    longestCycle = input.longestCycleLength;
  }

  // الإباضة التقديرية: نحو 14 يومًا قبل الدورة التالية.
  const earliestOvulationOffset = shortestCycle - 14;
  const latestOvulationOffset = longestCycle - 14;

  const earliestOvulationDate = addCalendarDays(
    input.lastPeriodStart,
    earliestOvulationOffset
  );

  const latestOvulationDate = addCalendarDays(
    input.lastPeriodStart,
    latestOvulationOffset
  );

  // نافذة الخصوبة: الأيام الخمسة السابقة للإباضة وحتى يومها.
  const fertileWindowStart = addCalendarDays(
    input.lastPeriodStart,
    shortestCycle - 19
  );

  const fertileWindowEnd = latestOvulationDate;

  const nextPeriodEarliestDate = addCalendarDays(
    input.lastPeriodStart,
    shortestCycle
  );

  const nextPeriodLatestDate = addCalendarDays(
    input.lastPeriodStart,
    longestCycle
  );

  return {
    cycleType: input.cycleType,
    lastPeriodStart: input.lastPeriodStart,
    earliestOvulationDate,
    latestOvulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    nextPeriodEarliestDate,
    nextPeriodLatestDate,
  };
}
