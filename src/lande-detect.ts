import lande from "lande";

import type { LanguageResult } from "./ExpoGuessLanguage.types";

// ISO 639-3 → BCP-47 mapping for lande's 50 supported languages
const ISO639_3_TO_BCP47: Record<string, string> = {
  afr: "af",
  ara: "ar",
  aze: "az",
  bel: "be",
  ben: "bn",
  bul: "bg",
  cat: "ca",
  ces: "cs",
  ckb: "ckb",
  cmn: "zh",
  dan: "da",
  deu: "de",
  ell: "el",
  eng: "en",
  est: "et",
  eus: "eu",
  fin: "fi",
  fra: "fr",
  hau: "ha",
  heb: "he",
  hin: "hi",
  hrv: "hr",
  hun: "hu",
  hye: "hy",
  ind: "id",
  isl: "is",
  ita: "it",
  jpn: "ja",
  kat: "ka",
  kaz: "kk",
  kor: "ko",
  lit: "lt",
  mar: "mr",
  mkd: "mk",
  nld: "nl",
  nob: "nb",
  pes: "fa",
  pol: "pl",
  por: "pt",
  ron: "ro",
  run: "rn",
  rus: "ru",
  slk: "sk",
  spa: "es",
  srp: "sr",
  swe: "sv",
  tgl: "tl",
  tur: "tr",
  ukr: "uk",
  vie: "vi",
};

export function detectWithLande(
  text: string,
  maxResults: number
): LanguageResult[] {
  if (!text.trim()) return [];

  const results = lande(text);
  const mapped: LanguageResult[] = [];

  for (const [iso3, confidence] of results) {
    if (mapped.length >= maxResults) break;
    const bcp47 = ISO639_3_TO_BCP47[iso3];
    if (bcp47) {
      mapped.push({ language: bcp47, confidence });
    }
  }

  return mapped;
}
