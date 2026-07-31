export const INCI_TEXT_LIMIT = 8_000;
export const INCI_ROUTINE_LIMIT = 2_400;
export const INCI_IMAGE_LIMIT_BYTES = 5 * 1024 * 1024;

export type InciSource = "text" | "photo";
export type InciPosition = "начало списка" | "середина списка" | "конец списка";
export type InciAttention = "info" | "attention";

export type InciIngredient = {
  name: string;
  canonicalName: string;
  position: number;
  positionHint: InciPosition;
  recognized: boolean;
  active: boolean;
  roles: string[];
  note?: string;
};

export type InciActive = {
  name: string;
  inciName: string;
  positionHint: InciPosition;
  roles: string[];
  note: string;
};

export type InciFunctionalGroup = {
  id: string;
  label: string;
  count: number;
  ingredients: string[];
};

export type InciFlag = {
  id: string;
  level: InciAttention;
  title: string;
  description: string;
  ingredients: string[];
};

export type InciConflict = {
  id: string;
  level: InciAttention;
  title: string;
  description: string;
  suggestion: string;
  matched: string[];
};

export type InciOcr = {
  quality: "high" | "medium" | "low";
  note?: string;
};

export type InciAnalysis = {
  version: 1;
  source: InciSource;
  extractedText: string;
  analyzedAt: string;
  headline: string;
  overview: string;
  ingredientCount: number;
  recognizedCount: number;
  ingredients: InciIngredient[];
  actives: InciActive[];
  functionalGroups: InciFunctionalGroup[];
  flags: InciFlag[];
  routineSignals: string[];
  conflicts: InciConflict[];
  positives: string[];
  disclaimer: string;
  ocr?: InciOcr;
};

export type SavedInciAnalysis = {
  id: string;
  label: string;
  source: InciSource;
  headline: string;
  extractedText: string;
  routineText: string;
  ingredientCount: number;
  actives: InciActive[];
  conflicts: InciConflict[];
  createdAt: string;
};
