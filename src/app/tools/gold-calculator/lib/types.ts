export type GoldKarat = 24 | 22 | 21 | 18 | 14;

export type GoldTabKey =
  | 'calculator'
  | 'buy'
  | 'sell'
  | 'profit'
  | 'portfolio'
  | 'zakat';

export interface GoldPriceResponse {
  source: string;
  symbol: 'XAU';
  currency: 'USD';
  unit: 'troy_ounce';
  priceUsdPerOunce: number;
  gram24Usd: number;
  updatedAt: string | null;
  fetchedAt: number;
  cached: boolean;
  stale: boolean;
}

export interface GoldKaratPrice {
  karat: GoldKarat;
  purity: number;
  pricePerGram: number;
}

export interface GoldCalculationInput {
  weight: number;
  karat: GoldKarat;
  pricePerGram: number;
  makingCharge: number;
  additionalFees: number;
  taxRate: number;
}

export interface GoldCalculationResult {
  goldValue: number;
  makingCost: number;
  additionalFees: number;
  tax: number;
  total: number;
}

export interface GoldPortfolioItem {
  id: string;
  name: string;
  weight: number;
  karat: GoldKarat;
  purchasePricePerGram: number;
  purchaseDate: string;
}

export interface GoldCountry {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
}