import assert from "node:assert/strict";
import {
  fraction,
  add,
  subtract,
  multiply,
  divide,
  compare,
  formatFraction,
  toPercentage,
} from "../lib/fraction";

const half = fraction(BigInt(1), BigInt(2));
const third = fraction(BigInt(1), BigInt(3));

assert.equal(formatFraction(add(half, third)), "5/6");
assert.equal(formatFraction(subtract(half, third)), "1/6");
assert.equal(formatFraction(multiply(half, third)), "1/6");
assert.equal(formatFraction(divide(half, third)), "3/2");

assert.equal(formatFraction(fraction(BigInt(6), BigInt(8))), "3/4");
assert.equal(compare(fraction(BigInt(2), BigInt(3)), fraction(BigInt(3), BigInt(4))), -1);
assert.equal(compare(fraction(BigInt(4), BigInt(8)), fraction(BigInt(1), BigInt(2))), 0);
assert.equal(toPercentage(fraction(BigInt(1), BigInt(4))), 25);

assert.throws(() => fraction(BigInt(1), BigInt(0)));
assert.throws(() => divide(half, fraction(BigInt(0))));

console.log("نجحت جميع اختبارات الكسور الحسابية.");
