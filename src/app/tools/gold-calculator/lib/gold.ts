import type {
  GoldCalculationInput,
  GoldCalculationResult,
  GoldKarat,
  GoldKaratPrice,
} from './types';

export const TROY_OUNCE_IN_GRAMS = 31.1034768;

export const GOLD_KARATS: {
  karat: GoldKarat;
  purity: number;
  label: string;
}[] = [
  { karat: 24, purity: 1, label: 'عيار 24' },
  { karat: 22, purity: 22 / 24, label: 'عيار 22' },
  { karat: 21, purity: 21 / 24, label: 'عيار 21' },
  { karat: 18, purity: 18 / 24, label: 'عيار 18' },
  { karat: 14, purity: 14 / 24, label: 'عيار 14' },
];

export function calculateGramPrice24(
  pricePerOunce: number,
): number {
  if (!Number.isFinite(pricePerOunce) || pricePerOunce < 0) {
    return 0;
  }

  return pricePerOunce / TROY_OUNCE_IN_GRAMS;
}

export function calculateKaratPrice(
  gram24Price: number,
): GoldKaratPrice[] {
  if (!Number.isFinite(gram24Price) || gram24Price < 0) {
    return [];
  }

  return GOLD_KARATS.map(({ karat, purity }) => ({
    karat,
    purity,
    pricePerGram: gram24Price * purity,
  }));
}

export function calculateGoldValue(
  weight: number,
  pricePerGram: number,
): number {
  if (
    !Number.isFinite(weight) ||
    !Number.isFinite(pricePerGram) ||
    weight < 0 ||
    pricePerGram < 0
  ) {
    return 0;
  }

  return weight * pricePerGram;
}

export function calculatePurchaseTotal(
  input: GoldCalculationInput,
): GoldCalculationResult {
  const values = [
    input.weight,
    input.pricePerGram,
    input.makingCharge,
    input.additionalFees,
    input.taxRate,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return {
      goldValue: 0,
      makingCost: 0,
      additionalFees: 0,
      tax: 0,
      total: 0,
    };
  }

  const weight = input.weight;
  const price = input.pricePerGram;
  const makingCharge = input.makingCharge;
  const additionalFees = input.additionalFees;
  const taxRate = input.taxRate;

  const goldValue = weight * price;
  const makingCost = weight * makingCharge;
  const taxableAmount = goldValue + makingCost + additionalFees;
  const tax = taxableAmount * (taxRate / 100);

  return {
    goldValue,
    makingCost,
    additionalFees,
    tax,
    total: taxableAmount + tax,
  };
}

export function calculateProfitLoss(
  purchaseTotal: number,
  currentValue: number,
): {
  amount: number;
  percentage: number;
} {
  if (
    !Number.isFinite(purchaseTotal) ||
    !Number.isFinite(currentValue) ||
    purchaseTotal <= 0
  ) {
    return { amount: 0, percentage: 0 };
  }

  const amount = currentValue - purchaseTotal;

  return {
    amount,
    percentage: (amount / purchaseTotal) * 100,
  };
}