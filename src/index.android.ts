import ExpoGuessLanguageModule from "./ExpoGuessLanguageModule";
import { detectWithLande } from "./lande-detect";

import type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export function guessLanguageAsync(
  text: string,
  options?: GuessLanguageOptions
): Promise<LanguageResult[]> {
  const maxResults = options?.maxResults ?? 10;
  if (ExpoGuessLanguageModule.isNativeAvailable) {
    return ExpoGuessLanguageModule.guessLanguageAsync(text, maxResults);
  }
  return Promise.resolve(detectWithLande(text, maxResults));
}

export function guessLanguageSync(
  text: string,
  options?: GuessLanguageOptions
): LanguageResult[] {
  return detectWithLande(text, options?.maxResults ?? 10);
}
