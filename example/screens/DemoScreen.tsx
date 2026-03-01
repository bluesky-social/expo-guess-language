import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  guessLanguage,
  type LanguageResult,
} from "@bsky.app/expo-guess-language";
import lande from "lande";

// ISO 639-3 → BCP-47 (same mapping as the module uses internally)
const ISO3_TO_BCP47: Record<string, string> = {
  afr: "af",
  ara: "ar",
  aze: "az",
  bel: "be",
  ben: "bn",
  bul: "bg",
  cat: "ca",
  ces: "cs",
  ckb: "ckb",
  cmn: "zh",
  dan: "da",
  deu: "de",
  ell: "el",
  eng: "en",
  est: "et",
  eus: "eu",
  fin: "fi",
  fra: "fr",
  hau: "ha",
  heb: "he",
  hin: "hi",
  hrv: "hr",
  hun: "hu",
  hye: "hy",
  ind: "id",
  isl: "is",
  ita: "it",
  jpn: "ja",
  kat: "ka",
  kaz: "kk",
  kor: "ko",
  lit: "lt",
  mar: "mr",
  mkd: "mk",
  nld: "nl",
  nob: "nb",
  pes: "fa",
  pol: "pl",
  por: "pt",
  ron: "ro",
  run: "rn",
  rus: "ru",
  slk: "sk",
  spa: "es",
  srp: "sr",
  swe: "sv",
  tgl: "tl",
  tur: "tr",
  ukr: "uk",
  vie: "vi",
};

function detectWithLande(text: string, maxResults: number): LanguageResult[] {
  if (!text.trim()) return [];
  const results = lande(text);
  const mapped: LanguageResult[] = [];
  for (const [iso3, confidence] of results) {
    if (mapped.length >= maxResults) break;
    const bcp47 = ISO3_TO_BCP47[iso3];
    if (bcp47) mapped.push({ language: bcp47, confidence });
  }
  return mapped;
}

type TimedResults = {
  results: LanguageResult[];
  ms: number;
};

function useDebounce(text: string, delay: number): string {
  const [debounced, setDebounced] = useState(text);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), delay);
    return () => clearTimeout(id);
  }, [text, delay]);
  return debounced;
}

const MAX_RESULTS = 10;

export default function DemoScreen() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 200);
  const [nativeResults, setNativeResults] = useState<TimedResults | null>(null);
  const [landeResults, setLandeResults] = useState<TimedResults | null>(null);

  useEffect(() => {
    if (!debouncedText.trim()) {
      setNativeResults(null);
      setLandeResults(null);
      return;
    }

    // lande (sync, always available)
    const landeStart = performance.now();
    const lr = detectWithLande(debouncedText, MAX_RESULTS);
    const landeMs = performance.now() - landeStart;
    setLandeResults({ results: lr, ms: landeMs });

    // native (async on all platforms)
    const nativeStart = performance.now();
    guessLanguage(debouncedText, { maxResults: MAX_RESULTS })
      .then((nr) => {
        const nativeMs = performance.now() - nativeStart;
        setNativeResults({ results: nr, ms: nativeMs });
      })
      .catch(() => {
        setNativeResults(null);
      });
  }, [debouncedText]);

  return (
    <View style={styles.container}>
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Type or paste text in any language..."
          value={text}
          onChangeText={setText}
          multiline
        />
      </View>
      <View style={styles.columns}>
        <ResultColumn title={`Native (${Platform.OS})`} data={nativeResults} />
        <View style={styles.divider} />
        <ResultColumn title="lande (JS)" data={landeResults} />
      </View>
    </View>
  );
}

function ResultColumn({
  title,
  data,
}: {
  title: string;
  data: TimedResults | null;
}) {
  return (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      {data && <Text style={styles.timing}>{data.ms.toFixed(1)}ms</Text>}
      <ScrollView style={styles.resultsList}>
        {data?.results.map((r) => (
          <View key={r.language} style={styles.row}>
            <Text style={styles.lang}>{r.language}</Text>
            <Text style={styles.confidence}>
              {(r.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
        {data && data.results.length === 0 && (
          <Text style={styles.empty}>No results</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
  },
  input: {
    fontSize: 16,
    minHeight: 72,
    textAlignVertical: "top",
  },
  columns: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 16,
  },
  divider: {
    width: 8,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    color: "#333",
  },
  timing: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    fontVariant: ["tabular-nums"],
  },
  resultsList: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  lang: {
    fontSize: 15,
    fontWeight: "600",
  },
  confidence: {
    fontSize: 15,
    color: "#666",
    fontVariant: ["tabular-nums"],
  },
  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 16,
    fontSize: 14,
  },
});
