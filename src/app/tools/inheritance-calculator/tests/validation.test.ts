import assert from "node:assert/strict";
import { validateInheritanceInput } from "../lib/validation";
import type { InheritanceInput } from "../lib/types";

const validCase: InheritanceInput = {
  deceasedGender: "male",
  estateAmount: 120000,
  funeralExpenses: 5000,
  debts: 15000,
  bequest: 10000,
  otherHeirsPresent: false,
  heirs: {
    husband: 0,
    wives: 1,
    father: true,
    mother: true,
    sons: 2,
    daughters: 1,
  },
};

assert.equal(validateInheritanceInput(validCase).valid, true);

const invalidGender = {
  ...validCase,
  deceasedGender: "female" as const,
};

assert.equal(validateInheritanceInput(invalidGender).valid, false);

const invalidWives = {
  ...validCase,
  heirs: { ...validCase.heirs, wives: 5 },
};

assert.equal(validateInheritanceInput(invalidWives).valid, false);

const negativeEstate = {
  ...validCase,
  estateAmount: -100,
};

assert.equal(validateInheritanceInput(negativeEstate).valid, false);

const excessiveBequest = {
  ...validCase,
  bequest: 40000,
};

assert.equal(validateInheritanceInput(excessiveBequest).valid, false);

const excessiveDeductions = {
  ...validCase,
  funeralExpenses: 80000,
  debts: 50000,
};

assert.equal(validateInheritanceInput(excessiveDeductions).valid, false);

console.log("نجحت جميع اختبارات التحقق من بيانات المواريث.");

const otherHeirsCase = {
  ...validCase,
  otherHeirsPresent: true,
};

assert.equal(validateInheritanceInput(otherHeirsCase).valid, false);
assert.ok(
  validateInheritanceInput(otherHeirsCase).issues.some(
    (issue) => issue.field === "otherHeirsPresent",
  ),
);

const missingOtherHeirsFlag = { ...validCase, otherHeirsPresent: undefined } as unknown as InheritanceInput;
assert.equal(validateInheritanceInput(missingOtherHeirsFlag).valid, false);
