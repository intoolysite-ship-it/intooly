import type {
  InheritanceInput,
  ValidationIssue,
  ValidationResult,
} from "./types";

export function validateInheritanceInput(
  input: InheritanceInput,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const addIssue = (field: string, message: string) => {
    issues.push({ field, message });
  };

  if (!input || typeof input !== "object") {
    return {
      valid: false,
      issues: [{ field: "input", message: "بيانات المسألة غير صالحة." }],
    };
  }

  if (input.deceasedGender !== "male" && input.deceasedGender !== "female") {
    addIssue("deceasedGender", "يرجى تحديد جنس المتوفى.");
  }

  const amounts = [
    ["estateAmount", input.estateAmount],
    ["funeralExpenses", input.funeralExpenses],
    ["debts", input.debts],
    ["bequest", input.bequest],
  ] as const;

  for (const [field, value] of amounts) {
    if (!Number.isFinite(value) || value < 0) {
      addIssue(field, "يجب إدخال مبلغ صحيح غير سالب.");
    }
  }

if (typeof input.otherHeirsPresent !== "boolean") {
    addIssue("otherHeirsPresent", "يرجى تحديد ما إذا كان للمتوفى ورثة آخرون غير المذكورين.");
  } else if (input.otherHeirsPresent) {
    addIssue("otherHeirsPresent", "هذه المسألة تضم ورثة خارج نطاق الحاسبة الحالي، ولا يمكن إصدار توزيع نهائي آمن.");
  }

  const heirs = input.heirs;

  if (!heirs || typeof heirs !== "object") {
    addIssue("heirs", "بيانات الورثة غير مكتملة.");
  } else {
    for (const [field, value] of [
      ["husband", heirs.husband],
      ["wives", heirs.wives],
      ["sons", heirs.sons],
      ["daughters", heirs.daughters],
    ] as const) {
      if (!Number.isInteger(value) || value < 0) {
        addIssue(`heirs.${field}`, "يجب أن يكون العدد صفراً أو عدداً صحيحاً موجباً.");
      }
    }

    if (typeof heirs.father !== "boolean") {
      addIssue("heirs.father", "بيانات وجود الأب غير صالحة.");
    }

    if (typeof heirs.mother !== "boolean") {
      addIssue("heirs.mother", "بيانات وجود الأم غير صالحة.");
    }

    if (input.deceasedGender === "male" && heirs.husband > 0) {
      addIssue("heirs.husband", "لا يمكن إدخال زوج للمتوفى الذكر.");
    }

    if (input.deceasedGender === "female" && heirs.wives > 0) {
      addIssue("heirs.wives", "لا يمكن إدخال زوجات للمتوفاة الأنثى.");
    }

    if (input.deceasedGender === "male" && heirs.wives > 4) {
      addIssue("heirs.wives", "عدد الزوجات لا يمكن أن يتجاوز أربعاً.");
    }

    if (input.deceasedGender === "female" && heirs.husband > 1) {
      addIssue("heirs.husband", "لا يمكن أن يكون للمتوفاة أكثر من زوج واحد.");
    }
  }

  if (amounts.every(([, value]) => Number.isFinite(value) && value >= 0)) {
    const deductions =
      input.funeralExpenses + input.debts;

    if (deductions > input.estateAmount) {
      addIssue(
        "estateAmount",
        "مجموع مصاريف التجهيز والديون يتجاوز قيمة التركة.",
      );
    } else {
      const remainder = input.estateAmount - deductions;

      if (input.bequest > remainder / 3) {
        addIssue(
          "bequest",
          "الوصية تتجاوز ثلث صافي التركة قبل الوصية؛ تحتاج المسألة إلى مراجعة خاصة.",
        );
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
