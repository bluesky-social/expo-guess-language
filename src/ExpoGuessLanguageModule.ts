import { requireNativeModule } from "expo";

import type { LanguageResult } from "./ExpoGuessLanguage.types";

declare class ExpoGuessLanguageModuleType {
  isNativeAvailable: boolean;
  guessLanguage(text: string, maxResults: number): Promise<LanguageResult[]>;
}

export default requireNativeModule<ExpoGuessLanguageModuleType>(
  "ExpoGuessLanguage"
);
