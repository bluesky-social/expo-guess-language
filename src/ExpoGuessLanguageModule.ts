import { requireNativeModule } from "expo";

import type { LanguageResult } from "./ExpoGuessLanguage.types";

declare class ExpoGuessLanguageModuleType {
  isNativeAvailable: boolean;
  guessLanguageAsync(text: string, maxResults: number): Promise<LanguageResult[]>;
  guessLanguageSync(text: string, maxResults: number): LanguageResult[];
}

export default requireNativeModule<ExpoGuessLanguageModuleType>(
  "ExpoGuessLanguage"
);
