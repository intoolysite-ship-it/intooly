import assert from "node:assert/strict";
import { calculateInheritance } from "../lib/engine";
import type { InheritanceInput } from "../lib/types";

function makeInput(
  overrides: Partial<InheritanceInput> = {},
): InheritanceInput {
  return {
    deceasedGender: "male",
    estateAmount: 120000,
    funeralExpenses: 0,
    debts: 0,
    bequest: 0,
    otherHeirsPresent: false,
    heirs: {
      husband: 0,
      wives: 1,
      father: true,
      mother: true,
      sons: 2,
      daughters: 1,
    },
    ...overrides,
  };
}

const caseOne = calculateInheritance(makeInput());
assert.equal(caseOne.success, true);
assert.equal(caseOne.allocations.find((item) => item.type === "wife")?.totalShare.numerator, BigInt(1));
assert.equal(caseOne.allocations.find((item) => item.type === "wife")?.totalShare.denominator, BigInt(8));
assert.equal(caseOne.allocations.find((item) => item.type === "mother")?.totalShare.denominator, BigInt(6));
assert.equal(caseOne.allocations.find((item) => item.type === "father")?.totalShare.denominator, BigInt(6));

const caseTwo = calculateInheritance(makeInput({
  deceasedGender: "female",
  heirs: {
    husband: 1,
    wives: 0,
    father: false,
    mother: false,
    sons: 1,
    daughters: 1,
  },
}));
assert.equal(caseTwo.success, true);
assert.equal(caseTwo.allocations.find((item) => item.type === "husband")?.totalShare.denominator, BigInt(4));

const caseThree = calculateInheritance(makeInput({
  deceasedGender: "male",
  heirs: {
    husband: 0,
    wives: 1,
    father: true,
    mother: true,
    sons: 0,
    daughters: 1,
  },
}));
assert.equal(caseThree.success, true);

const unsupportedAwl = calculateInheritance(makeInput({
  deceasedGender: "female",
  heirs: {
    husband: 1,
    wives: 0,
    father: true,
    mother: true,
    sons: 0,
    daughters: 1,
  },
}));
assert.equal(unsupportedAwl.success, false);
assert.ok(unsupportedAwl.errors.some((message) => message.includes("العَول")));

const unsupportedRadd = calculateInheritance(makeInput({
  heirs: {
    husband: 0,
    wives: 1,
    father: false,
    mother: true,
    sons: 0,
    daughters: 1,
  },
}));
assert.equal(unsupportedRadd.success, false);

console.log("انتهت اختبارات محرك المواريث.");



// اختبار العمريتين
console.log("اختبار العمريتين");

const umariyyaHusband = calculateInheritance(makeInput({
  deceasedGender: "female",
  estateAmount: 60000,
  heirs: {
    husband: 1,
    wives: 0,
    father: true,
    mother: true,
    sons: 0,
    daughters: 0,
  },
}));

assert.equal(umariyyaHusband.success, true);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "husband")?.totalShare.numerator,
  BigInt(1),
);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "husband")?.totalShare.denominator,
  BigInt(2),
);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "mother")?.totalShare.numerator,
  BigInt(1),
);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "mother")?.totalShare.denominator,
  BigInt(6),
);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "father")?.totalShare.numerator,
  BigInt(1),
);
assert.equal(
  umariyyaHusband.allocations.find((item) => item.type === "father")?.totalShare.denominator,
  BigInt(3),
);

const umariyyaWife = calculateInheritance(makeInput({
  deceasedGender: "male",
  estateAmount: 80000,
  heirs: {
    husband: 0,
    wives: 1,
    father: true,
    mother: true,
    sons: 0,
    daughters: 0,
  },
}));

assert.equal(umariyyaWife.success, true);
assert.equal(
  umariyyaWife.allocations.find((item) => item.type === "wife")?.totalShare.denominator,
  BigInt(4),
);
assert.equal(
  umariyyaWife.allocations.find((item) => item.type === "mother")?.totalShare.numerator,
  BigInt(1),
);
assert.equal(
  umariyyaWife.allocations.find((item) => item.type === "mother")?.totalShare.denominator,
  BigInt(4),
);
assert.equal(
  umariyyaWife.allocations.find((item) => item.type === "father")?.totalShare.denominator,
  BigInt(2),
);


// اختبارات الأنصبة الدقيقة
console.log("اختبارات الأنصبة الدقيقة");

function assertShare(
  result: ReturnType<typeof calculateInheritance>,
  type: "husband" | "wife" | "father" | "mother" | "son" | "daughter",
  numerator: bigint,
  denominator: bigint,
) {
  const allocation = result.allocations.find((item) => item.type === type);
  assert.ok(allocation, `لم يتم العثور على نصيب ${type}`);
  assert.equal(allocation.totalShare.numerator, numerator, `بسط نصيب ${type}`);
  assert.equal(allocation.totalShare.denominator, denominator, `مقام نصيب ${type}`);
}

function assertEstateFullyDistributed(
  result: ReturnType<typeof calculateInheritance>,
) {
  assert.equal(result.success, true);
  assert.ok(
    Math.abs(result.totalDistributed - result.netEstate) < 0.000001,
    "مجموع المبالغ الموزعة يجب أن يساوي صافي التركة.",
  );
  assert.ok(
    Math.abs(result.remaining) < 0.000001,
    "يجب ألا يتبقى شيء من التركة.",
  );
}

// الحالة الأولى: زوجة وأب وأم وابنان وبنت
assertShare(caseOne, "wife", BigInt(1), BigInt(8));
assertShare(caseOne, "mother", BigInt(1), BigInt(6));
assertShare(caseOne, "father", BigInt(1), BigInt(6));
assertShare(caseOne, "son", BigInt(13), BigInt(30));
assertShare(caseOne, "daughter", BigInt(13), BigInt(120));
assertEstateFullyDistributed(caseOne);

// الحالة الثانية: زوج وابن وبنت
assertShare(caseTwo, "husband", BigInt(1), BigInt(4));
assertShare(caseTwo, "son", BigInt(1), BigInt(2));
assertShare(caseTwo, "daughter", BigInt(1), BigInt(4));
assertEstateFullyDistributed(caseTwo);

// الحالة الثالثة: زوجة وأب وأم وبنت
assertShare(caseThree, "wife", BigInt(1), BigInt(8));
assertShare(caseThree, "mother", BigInt(1), BigInt(6));
assertShare(caseThree, "daughter", BigInt(1), BigInt(2));
assertShare(caseThree, "father", BigInt(5), BigInt(24));
assertEstateFullyDistributed(caseThree);

// العمريتان: الزوج مع الأب والأم
assertShare(umariyyaHusband, "husband", BigInt(1), BigInt(2));
assertShare(umariyyaHusband, "mother", BigInt(1), BigInt(6));
assertShare(umariyyaHusband, "father", BigInt(1), BigInt(3));
assertEstateFullyDistributed(umariyyaHusband);

// العمريتان: الزوجة مع الأب والأم
assertShare(umariyyaWife, "wife", BigInt(1), BigInt(4));
assertShare(umariyyaWife, "mother", BigInt(1), BigInt(4));
assertShare(umariyyaWife, "father", BigInt(1), BigInt(2));
assertEstateFullyDistributed(umariyyaWife);

console.log("اجتازت جميع اختبارات الأنصبة الدقيقة وتوزيع التركة.");
