import ExpoGuessLanguageModule from "./ExpoGuessLanguageModule";

import type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

export type { GuessLanguageOptions, LanguageResult } from "./ExpoGuessLanguage.types";

// Lazy require: lande is in the bundle but never parsed/executed if Play Services is available
let _landeDetect: typeof import("./lande-detect") | undefined;
function getLandeDetect() {
  if (!_landeDetect) _landeDetect = require("./lande-detect");
  return _landeDetect!;
}

export function guessLanguage(
  text: string,
  options?: GuessLanguageOptions
): Promise<LanguageResult[]> {
  const maxResults = options?.maxResults ?? 10;
  if (ExpoGuessLanguageModule.isNativeAvailable) {
    return ExpoGuessLanguageModule.guessLanguage(text, maxResults);
  }
  return Promise.resolve(getLandeDetect().detectWithLande(text, maxResults));
}
