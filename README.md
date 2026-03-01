# @bsky.app/expo-guess-language

An Expo module for language detection using native platform APIs, with a JavaScript fallback.

## Platform support

| Platform | Backend | Notes |
| --- | --- | --- |
| iOS | [NaturalLanguage](https://developer.apple.com/documentation/naturallanguage) | Always available (iOS 15.1+) |
| Android | [ML Kit Language ID](https://developers.google.com/ml-kit/language/identification) | Requires Google Play Services |
| Android (no Play Services) | [lande](https://github.com/nicklatkovich/lande) | Automatic JS fallback |
| Web | [lande](https://github.com/nicklatkovich/lande) | JS-only |

## Installation

```
npx expo install @bsky.app/expo-guess-language
```

For bare React Native projects, run `npx pod-install` after installing.

## Usage

### Async

```ts
import { guessLanguageAsync } from "@bsky.app/expo-guess-language";

const results = await guessLanguageAsync("Hello, world!");
// [{ language: "en", confidence: 0.98 }, ...]
```

### Sync

```ts
import { guessLanguageSync } from "@bsky.app/expo-guess-language";

const results = guessLanguageSync("Hello, world!");
// [{ language: "en", confidence: 0.98 }, ...]
```

On iOS, `guessLanguageSync` uses the native NaturalLanguage framework. On Android and web, it uses the [lande](https://github.com/nicklatkovich/lande) JS library.

### Options

```ts
const results = await guessLanguageAsync("Bonjour le monde!", {
  maxResults: 3, // default: 10
});
```

### Types

```ts
type LanguageResult = {
  language: string; // BCP-47 code ("en", "fr", "ja", ...)
  confidence: number; // 0 to 1
};

type GuessLanguageOptions = {
  maxResults?: number; // default 10
};
```

## License

MIT
