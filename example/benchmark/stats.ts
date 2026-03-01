import type {
  BenchmarkResult,
  BenchmarkStats,
  DetectionResult,
  ThresholdRow,
  LanguageBreakdown,
} from "./types";

const THRESHOLDS = [0.99, 0.9, 0.8, 0.7, 0.5];

function computeStatsForDetector(
  results: BenchmarkResult[],
  pick: (r: BenchmarkResult) => DetectionResult
): BenchmarkStats {
  const total = results.length;
  const correct = results.filter((r) => pick(r).correct).length;

  const thresholds: ThresholdRow[] = THRESHOLDS.map((threshold) => {
    const above = results.filter((r) => pick(r).confidence >= threshold);
    const correctAbove = above.filter((r) => pick(r).correct).length;
    return {
      threshold,
      postsAbove: above.length,
      accuracy: above.length > 0 ? correctAbove / above.length : 0,
      nonDetectedRate: (total - above.length) / total,
    };
  });

  const langMap = new Map<string, { count: number; correct: number }>();
  for (const r of results) {
    const lang = r.sample.lang;
    const entry = langMap.get(lang) ?? { count: 0, correct: 0 };
    entry.count++;
    if (pick(r).correct) entry.correct++;
    langMap.set(lang, entry);
  }

  const perLanguage: LanguageBreakdown[] = Array.from(langMap.entries())
    .map(([lang, { count, correct: c }]) => ({
      lang,
      count,
      correct: c,
      accuracy: c / count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    correct,
    overallAccuracy: total > 0 ? correct / total : 0,
    thresholds,
    perLanguage,
  };
}

export function computeStats(results: BenchmarkResult[]): {
  native: BenchmarkStats;
  lande: BenchmarkStats;
} {
  return {
    native: computeStatsForDetector(results, (r) => r.native),
    lande: computeStatsForDetector(results, (r) => r.lande),
  };
}
