import { detectWithLande } from "./lande-detect";

import type {
  GuessLanguageOptions,
  LanguageResult,
} from "./ExpoGuessLanguage.types";

export type {
  GuessLanguageOptions,
  LanguageResult,
} from "./ExpoGuessLanguage.types";

export function guessLanguageAsync(
  text: string,
  options?: GuessLanguageOptions,
): Promise<LanguageResult[]> {
  return Promise.resolve(detectWithLande(text, options?.maxResults ?? 10));
}

export function guessLanguageSync(
  text: string,
  options?: GuessLanguageOptions,
): LanguageResult[] {
  return detectWithLande(text, options?.maxResults ?? 10);
}
