export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  a = a < BigInt(0) ? -a : a;
  b = b < BigInt(0) ? -b : b;

  while (b !== BigInt(0)) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

export function fraction(numerator: bigint | number, denominator: bigint | number = BigInt(1)): Fraction {
  let n = BigInt(numerator);
  let d = BigInt(denominator);

  if (d === BigInt(0)) throw new Error("مقام الكسر لا يمكن أن يساوي صفراً.");

  if (d < BigInt(0)) {
    n = -n;
    d = -d;
  }

  const divisor = gcd(n, d);

  return {
    numerator: n / divisor,
    denominator: d / divisor,
  };
}

export const ZERO = fraction(BigInt(0));
export const ONE = fraction(BigInt(1));

export function add(a: Fraction, b: Fraction): Fraction {
  return fraction(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

export function subtract(a: Fraction, b: Fraction): Fraction {
  return fraction(
    a.numerator * b.denominator - b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  return fraction(
    a.numerator * b.numerator,
    a.denominator * b.denominator,
  );
}

export function divide(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === BigInt(0)) throw new Error("لا يمكن القسمة على صفر.");

  return fraction(
    a.numerator * b.denominator,
    a.denominator * b.numerator,
  );
}

export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const difference =
    a.numerator * b.denominator - b.numerator * a.denominator;

  return difference < BigInt(0) ? -1 : difference > BigInt(0) ? 1 : 0;
}

export function toDecimal(value: Fraction, precision = 6): number {
  const scale = BigInt(10) ** BigInt(precision);

  return Number(
    (value.numerator * scale) / value.denominator,
  ) / Number(scale);
}

export function toPercentage(value: Fraction, precision = 4): number {
  return toDecimal(multiply(value, fraction(BigInt(100))), precision);
}

export function formatFraction(value: Fraction): string {
  if (value.denominator === BigInt(1)) return value.numerator.toString();

  return `${value.numerator}/${value.denominator}`;
}

export function isZero(value: Fraction): boolean {
  return value.numerator === BigInt(0);
}

export function isPositive(value: Fraction): boolean {
  return value.numerator > BigInt(0);
}
