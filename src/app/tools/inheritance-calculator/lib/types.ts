export type DeceasedGender = "male" | "female";

export type HeirType =
  | "husband"
  | "wife"
  | "father"
  | "mother"
  | "son"
  | "daughter";

export interface HeirCounts {
  husband: number;
  wives: number;
  father: boolean;
  mother: boolean;
  sons: number;
  daughters: number;
}

export interface InheritanceInput {
  deceasedGender: DeceasedGender;
  estateAmount: number;
  funeralExpenses: number;
  debts: number;
  bequest: number;
  heirs: HeirCounts;
  otherHeirsPresent: boolean;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export const EMPTY_HEIRS: HeirCounts = {
  husband: 0,
  wives: 0,
  father: false,
  mother: false,
  sons: 0,
  daughters: 0,
};
