import { guessLanguage } from "@bsky.app/expo-guess-language";
import lande from "lande";
import type { Sample, BenchmarkResult, DetectionResult } from "./types";

const YIELD_INTERVAL = 10;

// ISO 639-3 → BCP-47 (same mapping as DemoScreen)
const ISO3_TO_BCP47: Record<string, string> = {
  afr: "af", ara: "ar", aze: "az", bel: "be", ben: "bn", bul: "bg",
  cat: "ca", ces: "cs", ckb: "ckb", cmn: "zh", dan: "da", deu: "de",
  ell: "el", eng: "en", est: "et", eus: "eu", fin: "fi", fra: "fr",
  hau: "ha", heb: "he", hin: "hi", hrv: "hr", hun: "hu", hye: "hy",
  ind: "id", isl: "is", ita: "it", jpn: "ja", kat: "ka", kaz: "kk",
  kor: "ko", lit: "lt", mar: "mr", mkd: "mk", nld: "nl", nob: "nb",
  pes: "fa", pol: "pl", por: "pt", ron: "ro", run: "rn", rus: "ru",
  slk: "sk", spa: "es", srp: "sr", swe: "sv", tgl: "tl", tur: "tr",
  ukr: "uk", vie: "vi",
};

function detectWithLande(text: string): DetectionResult & {} {
  const results = lande(text);
  for (const [iso3, confidence] of results) {
    const bcp47 = ISO3_TO_BCP47[iso3];
    if (bcp47) {
      return { predicted: bcp47, confidence, correct: false }; // correct set by caller
    }
  }
  return { predicted: null, confidence: 0, correct: false };
}

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function runBenchmark(
  samples: Sample[],
  onProgress: (done: number, total: number) => void
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];

    // Native detection
    let native: DetectionResult = { predicted: null, confidence: 0, correct: false };
    try {
      const res = await guessLanguage(sample.text, { maxResults: 1 });
      if (res.length > 0) {
        native = {
          predicted: res[0].language,
          confidence: res[0].confidence,
          correct: res[0].language === sample.lang,
        };
      }
    } catch {
      // no result
    }

    // Lande detection
    const landeResult = detectWithLande(sample.text);
    landeResult.correct = landeResult.predicted === sample.lang;

    results.push({ sample, native, lande: landeResult });

    if ((i + 1) % YIELD_INTERVAL === 0) {
      onProgress(i + 1, samples.length);
      await yieldToUI();
    }
  }

  onProgress(samples.length, samples.length);
  return results;
}
