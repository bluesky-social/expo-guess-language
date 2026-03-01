export type Sample = {
  text: string;
  lang: string; // BCP-47
  linguaConfidence: number;
};

export type Dataset = {
  generatedAt: string;
  totalSeen: number;
  totalKept: number;
  samples: Sample[];
};

export type DetectionResult = {
  predicted: string | null; // BCP-47 or null if no result
  confidence: number;
  correct: boolean;
};

export type BenchmarkResult = {
  sample: Sample;
  native: DetectionResult;
  lande: DetectionResult;
};

export type ThresholdRow = {
  threshold: number;
  postsAbove: number;
  accuracy: number;
  nonDetectedRate: number;
};

export type LanguageBreakdown = {
  lang: string;
  count: number;
  correct: number;
  accuracy: number;
};

export type BenchmarkStats = {
  total: number;
  correct: number;
  overallAccuracy: number;
  thresholds: ThresholdRow[];
  perLanguage: LanguageBreakdown[];
};
