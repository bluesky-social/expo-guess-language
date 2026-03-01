import { detectWithLande } from "./lande-detect";

import type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export function guessLanguage(
  text: string,
  options?: GuessLanguageOptions
): Promise<LanguageResult[]> {
  return Promise.resolve(detectWithLande(text, options?.maxResults ?? 10));
}
