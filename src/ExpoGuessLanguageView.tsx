import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoGuessLanguageViewProps } from './ExpoGuessLanguage.types';

const NativeView: React.ComponentType<ExpoGuessLanguageViewProps> =
  requireNativeView('ExpoGuessLanguage');

export default function ExpoGuessLanguageView(props: ExpoGuessLanguageViewProps) {
  return <NativeView {...props} />;
}
