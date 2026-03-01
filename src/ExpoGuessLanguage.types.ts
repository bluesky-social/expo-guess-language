export type LanguageResult = {
  language: string; // BCP-47 code ("en", "fr", "ja")
  confidence: number; // 0 to 1
};

export type GuessLanguageOptions = {
  maxResults?: number; // default 10
};
