import { NativeModule, requireNativeModule } from 'expo';

import { ExpoGuessLanguageModuleEvents } from './ExpoGuessLanguage.types';

declare class ExpoGuessLanguageModule extends NativeModule<ExpoGuessLanguageModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGuessLanguageModule>('ExpoGuessLanguage');
