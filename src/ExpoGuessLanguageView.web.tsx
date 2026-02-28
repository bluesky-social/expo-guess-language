import * as React from 'react';

import { ExpoGuessLanguageViewProps } from './ExpoGuessLanguage.types';

export default function ExpoGuessLanguageView(props: ExpoGuessLanguageViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
