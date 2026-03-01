import ExpoGuessLanguageModule from "./ExpoGuessLanguageModule";

import type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export function guessLanguageAsync(
  text: string,
  options?: GuessLanguageOptions
): Promise<LanguageResult[]> {
  return ExpoGuessLanguageModule.guessLanguageAsync(
    text,
    options?.maxResults ?? 10
  );
}

export function guessLanguageSync(
  text: string,
  options?: GuessLanguageOptions
): LanguageResult[] {
  return ExpoGuessLanguageModule.guessLanguageSync(
    text,
    options?.maxResults ?? 10
  );
}
