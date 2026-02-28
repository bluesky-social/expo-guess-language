import { registerWebModule, NativeModule } from 'expo';

import { ExpoGuessLanguageModuleEvents } from './ExpoGuessLanguage.types';

class ExpoGuessLanguageModule extends NativeModule<ExpoGuessLanguageModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoGuessLanguageModule, 'ExpoGuessLanguageModule');
