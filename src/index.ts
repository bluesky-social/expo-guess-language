import ExpoGuessLanguageModule from "./ExpoGuessLanguageModule";

import type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export function guessLanguage(
  text: string,
  options?: GuessLanguageOptions
): Promise<LanguageResult[]> {
  return ExpoGuessLanguageModule.guessLanguage(
    text,
    options?.maxResults ?? 10
  );
}
