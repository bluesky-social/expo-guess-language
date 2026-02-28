// Reexport the native module. On web, it will be resolved to ExpoGuessLanguageModule.web.ts
// and on native platforms to ExpoGuessLanguageModule.ts
export { default } from './ExpoGuessLanguageModule';
export { default as ExpoGuessLanguageView } from './ExpoGuessLanguageView';
export * from  './ExpoGuessLanguage.types';
