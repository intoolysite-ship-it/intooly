import type { InheritanceInput, HeirType } from "./types";
import {
  add,
  subtract,
  multiply,
  divide,
  compare,
  fraction,
  ZERO,
  ONE,
  toDecimal,
  formatFraction,
  type Fraction,
} from "./fraction";
import { validateInheritanceInput } from "./validation";

export interface HeirAllocation {
  type: HeirType;
  count: number;
  sharePerPerson: Fraction;
  totalShare: Fraction;
  amountPerPerson: number;
  totalAmount: number;
  reason: string;
}

export interface InheritanceResult {
  success: boolean;
  netEstate: number;
  allocations: HeirAllocation[];
  totalDistributed: number;
  remaining: number;
  errors: string[];
  notes: string[];
}

function resultError(message: string): InheritanceResult {
  return {
    success: false,
    netEstate: 0,
    allocations: [],
    totalDistributed: 0,
    remaining: 0,
    errors: [message],
    notes: [],
  };
}

export function calculateInheritance(
  input: InheritanceInput,
): InheritanceResult {
  const validation = validateInheritanceInput(input);

  if (!validation.valid) {
    return {
      ...resultError("يرجى تصحيح بيانات المسألة قبل الحساب."),
      errors: validation.issues.map((issue) => issue.message),
    };
  }

  const { heirs } = input;
  const netEstate =
    input.estateAmount -
    input.funeralExpenses -
    input.debts -
    input.bequest;

  if (netEstate < 0) {
    return resultError("صافي التركة غير صالح بعد الخصومات.");
  }

  const hasDescendants = heirs.sons > 0 || heirs.daughters > 0;
  const allocations: HeirAllocation[] = [];
  const notes: string[] = [];
  let assigned = ZERO;

  const addAllocation = (
    type: HeirType,
    count: number,
    totalShare: Fraction,
    reason: string,
  ) => {
    if (count <= 0 || compare(totalShare, ZERO) <= 0) return;

    const perPerson = divide(totalShare, fraction(count));
    allocations.push({
      type,
      count,
      sharePerPerson: perPerson,
      totalShare,
      amountPerPerson: netEstate * toDecimal(perPerson, 12),
      totalAmount: netEstate * toDecimal(totalShare, 12),
      reason,
    });
    assigned = add(assigned, totalShare);
  };

  // نصيب الزوج أو الزوجة
  if (heirs.husband > 0) {
    const share = fraction(hasDescendants ? 1 : 1, hasDescendants ? 4 : 2);
    addAllocation(
      "husband",
      1,
      share,
      hasDescendants
        ? "الربع لوجود فرع وارث."
        : "النصف لعدم وجود فرع وارث.",
    );
  }

  if (heirs.wives > 0) {
    const share = fraction(1, hasDescendants ? 8 : 4);
    addAllocation(
      "wife",
      heirs.wives,
      share,
      hasDescendants
        ? "الثمن للزوجات مجتمعات لوجود فرع وارث."
        : "الربع للزوجات مجتمعات لعدم وجود فرع وارث.",
    );
  }

  // الأم: مراعاة مسألتي العمريتين
  if (heirs.mother) {
    let motherShare: Fraction;

    if (
      !hasDescendants &&
      heirs.father &&
      (heirs.husband > 0 || heirs.wives > 0)
    ) {
      const spouseShare = heirs.husband > 0
        ? fraction(1, 2)
        : fraction(1, 4);
      motherShare = divide(
        subtract(ONE, spouseShare),
        fraction(3),
      );
      notes.push("طُبقت قاعدة ثلث الباقي للأم في إحدى العمريتين.");
    } else {
      motherShare = fraction(hasDescendants ? 1 : 1, hasDescendants ? 6 : 3);
    }

    addAllocation(
      "mother",
      1,
      motherShare,
      hasDescendants
        ? "السدس لوجود فرع وارث."
        : "الثلث عند عدم وجود فرع وارث، مع مراعاة العمريتين.",
    );
  }

  // الأب
  if (heirs.father) {
    if (heirs.sons > 0) {
      addAllocation(
        "father",
        1,
        fraction(1, 6),
        "السدس لوجود ابن وارث.",
      );
    } else if (heirs.daughters > 0) {
      addAllocation(
        "father",
        1,
        fraction(1, 6),
        "السدس فرضاً مع البنات، ويضاف إليه الباقي تعصيباً.",
      );
    }
  }

  // البنات عند عدم وجود أبناء ذكور
  if (heirs.sons === 0 && heirs.daughters > 0) {
    const daughterShare = heirs.daughters === 1
      ? fraction(1, 2)
      : fraction(2, 3);

    addAllocation(
      "daughter",
      heirs.daughters,
      daughterShare,
      heirs.daughters === 1
        ? "النصف للبنت الواحدة عند عدم وجود ابن."
        : "الثلثان للبنات عند عدم وجود ابن.",
    );
  }

  // الأبناء والبنات عصبة بالغير عند وجود ابن
  if (heirs.sons > 0) {
    const childUnits = heirs.sons * 2 + heirs.daughters;
    const residue = subtract(ONE, assigned);

    if (compare(residue, ZERO) < 0) {
      return resultError("مجموع الفروض تجاوز التركة؛ هذه المسألة تحتاج معالجة العَول.");
    }

    const unitShare = divide(residue, fraction(childUnits));

    addAllocation(
      "son",
      heirs.sons,
      multiply(unitShare, fraction(2 * heirs.sons)),
      "للذكر مثل حظ الأنثيين، مع توزيع الباقي على الأبناء والبنات.",
    );

    if (heirs.daughters > 0) {
      // تصحيح نصيب البنات بعد إضافة مجموعة الأبناء
      const childrenAllocation = allocations[allocations.length - 1];
      allocations.pop();
      assigned = subtract(assigned, childrenAllocation.totalShare);

      addAllocation(
        "son",
        heirs.sons,
        multiply(unitShare, fraction(2 * heirs.sons)),
        "للذكر مثل حظ الأنثيين.",
      );
      addAllocation(
        "daughter",
        heirs.daughters,
        multiply(unitShare, fraction(heirs.daughters)),
        "للأنثى نصف نصيب الذكر.",
      );
    }
  } else if (heirs.father) {
    const residue = subtract(ONE, assigned);
    if (compare(residue, ZERO) < 0) {
      return resultError("مجموع الفروض تجاوز التركة؛ هذه المسألة تحتاج معالجة العَول.");
    }
    if (compare(residue, ZERO) > 0) {
      const fatherAllocation = allocations.find((item) => item.type === "father");
      if (fatherAllocation) {
        allocations.splice(allocations.indexOf(fatherAllocation), 1);
        assigned = subtract(assigned, fatherAllocation.totalShare);
        addAllocation(
          "father",
          1,
          add(fatherAllocation.totalShare, residue),
          "الأب صاحب فرض وتعصيب؛ له السدس والباقي عند وجود البنات، أو الباقي تعصيباً عند عدم الفرع الوارث.",
        );
      } else {
        addAllocation(
          "father",
          1,
          residue,
          "الأب يأخذ الباقي تعصيباً.",
        );
      }
    }
  }

  const remainingFraction = subtract(ONE, assigned);

  if (compare(remainingFraction, ZERO) < 0) {
    return resultError("مجموع الفروض تجاوز التركة؛ العَول غير مدعوم في هذه النسخة.");
  }

  if (compare(remainingFraction, ZERO) > 0) {
    return resultError(
      "تبقى جزء من التركة يحتاج إلى أحكام الرَّد أو العصبات غير الموجودة في نطاق الحاسبة الحالي؛ لم يتم إصدار توزيع نهائي.",
    );
  }

  const totalDistributed = allocations.reduce(
    (sum, item) => sum + item.totalAmount,
    0,
  );

  return {
    success: true,
    netEstate,
    allocations,
    totalDistributed,
    remaining: netEstate - totalDistributed,
    errors: [],
    notes,
  };
}

export function formatShare(share: Fraction): string {
  return formatFraction(share);
}
