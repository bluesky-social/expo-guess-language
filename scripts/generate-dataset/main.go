package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/pemistahl/lingua-go"
	"nhooyr.io/websocket"
)

// Jetstream message types

type JetstreamMessage struct {
	Kind   string          `json:"kind"`
	Commit *JetstreamCommit `json:"commit,omitempty"`
}

type JetstreamCommit struct {
	Collection string          `json:"collection"`
	Record     json.RawMessage `json:"record"`
}

type PostRecord struct {
	Text  string   `json:"text"`
	Langs []string `json:"langs"`
}

// Output types

type Dataset struct {
	GeneratedAt string   `json:"generatedAt"`
	TotalSeen   int      `json:"totalSeen"`
	TotalKept   int      `json:"totalKept"`
	Samples     []Sample `json:"samples"`
}

type Sample struct {
	Text             string  `json:"text"`
	Lang             string  `json:"lang"`
	LinguaConfidence float64 `json:"linguaConfidence"`
}

// lingua Language → BCP-47 mapping
var languageToBCP47 = map[lingua.Language]string{
	lingua.Afrikaans:   "af",
	lingua.Albanian:    "sq",
	lingua.Arabic:      "ar",
	lingua.Armenian:    "hy",
	lingua.Azerbaijani: "az",
	lingua.Basque:      "eu",
	lingua.Belarusian:  "be",
	lingua.Bengali:     "bn",
	lingua.Bokmal:      "nb",
	lingua.Bosnian:     "bs",
	lingua.Bulgarian:   "bg",
	lingua.Catalan:     "ca",
	lingua.Chinese:     "zh",
	lingua.Croatian:    "hr",
	lingua.Czech:       "cs",
	lingua.Danish:      "da",
	lingua.Dutch:       "nl",
	lingua.English:     "en",
	lingua.Esperanto:   "eo",
	lingua.Estonian:    "et",
	lingua.Finnish:     "fi",
	lingua.French:      "fr",
	lingua.Ganda:       "lg",
	lingua.Georgian:    "ka",
	lingua.German:      "de",
	lingua.Greek:       "el",
	lingua.Gujarati:    "gu",
	lingua.Hebrew:      "he",
	lingua.Hindi:       "hi",
	lingua.Hungarian:   "hu",
	lingua.Icelandic:   "is",
	lingua.Indonesian:  "id",
	lingua.Irish:       "ga",
	lingua.Italian:     "it",
	lingua.Japanese:    "ja",
	lingua.Kazakh:      "kk",
	lingua.Korean:      "ko",
	lingua.Latin:       "la",
	lingua.Latvian:     "lv",
	lingua.Lithuanian:  "lt",
	lingua.Macedonian:  "mk",
	lingua.Malay:       "ms",
	lingua.Maori:       "mi",
	lingua.Marathi:     "mr",
	lingua.Mongolian:   "mn",
	lingua.Nynorsk:     "nn",
	lingua.Persian:     "fa",
	lingua.Polish:      "pl",
	lingua.Portuguese:  "pt",
	lingua.Punjabi:     "pa",
	lingua.Romanian:    "ro",
	lingua.Russian:     "ru",
	lingua.Serbian:     "sr",
	lingua.Shona:       "sn",
	lingua.Slovak:      "sk",
	lingua.Slovene:     "sl",
	lingua.Somali:      "so",
	lingua.Sotho:       "st",
	lingua.Spanish:     "es",
	lingua.Swahili:     "sw",
	lingua.Swedish:     "sv",
	lingua.Tagalog:     "tl",
	lingua.Tamil:       "ta",
	lingua.Telugu:      "te",
	lingua.Thai:        "th",
	lingua.Tsonga:      "ts",
	lingua.Tswana:      "tn",
	lingua.Turkish:     "tr",
	lingua.Ukrainian:   "uk",
	lingua.Urdu:        "ur",
	lingua.Vietnamese:  "vi",
	lingua.Welsh:       "cy",
	lingua.Xhosa:       "xh",
	lingua.Yoruba:      "yo",
	lingua.Zulu:        "zu",
}

// Build reverse map: BCP-47 → lingua.Language
var bcp47ToLanguage map[string]lingua.Language

func init() {
	bcp47ToLanguage = make(map[string]lingua.Language, len(languageToBCP47))
	for lang, code := range languageToBCP47 {
		bcp47ToLanguage[code] = lang
	}
}

func main() {
	count := flag.Int("count", 500, "target number of samples to collect")
	out := flag.String("out", "", "output file path (default: stdout)")
	flag.Parse()

	log.Printf("Building lingua detector (all languages)...")
	detector := lingua.NewLanguageDetectorBuilder().
		FromAllLanguages().
		Build()

	log.Printf("Connecting to Jetstream...")
	ctx := context.Background()
	url := "wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post"

	conn, _, err := websocket.Dial(ctx, url, nil)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.CloseNow()

	// Allow large messages
	conn.SetReadLimit(1 << 20) // 1MB

	samples := make([]Sample, 0, *count)
	totalSeen := 0

	log.Printf("Collecting samples (target: %d)...", *count)

	for len(samples) < *count {
		_, data, err := conn.Read(ctx)
		if err != nil {
			log.Fatalf("WebSocket read error: %v", err)
		}

		var msg JetstreamMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		if msg.Kind != "commit" || msg.Commit == nil || msg.Commit.Collection != "app.bsky.feed.post" {
			continue
		}

		var post PostRecord
		if err := json.Unmarshal(msg.Commit.Record, &post); err != nil {
			continue
		}

		totalSeen++

		// Skip posts with no text, no langs, or short text
		if len(strings.TrimSpace(post.Text)) < 20 || len(post.Langs) == 0 {
			continue
		}

		statedLang := normalizeLang(post.Langs[0])

		// Check if we can map the stated lang to a lingua language
		if _, ok := bcp47ToLanguage[statedLang]; !ok {
			continue
		}

		// Run lingua detection
		confidences := detector.ComputeLanguageConfidenceValues(post.Text)
		if len(confidences) == 0 {
			continue
		}

		// Find top result
		topLang := confidences[0].Language()
		topConf := confidences[0].Value()

		topBCP47, ok := languageToBCP47[topLang]
		if !ok {
			continue
		}

		// Only keep if lingua agrees with stated lang
		if topBCP47 != statedLang {
			continue
		}

		samples = append(samples, Sample{
			Text:             post.Text,
			Lang:             statedLang,
			LinguaConfidence: topConf,
		})

		if len(samples)%50 == 0 {
			log.Printf("  %d/%d samples collected (seen %d posts)", len(samples), *count, totalSeen)
		}
	}

	conn.Close(websocket.StatusNormalClosure, "done")

	dataset := Dataset{
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		TotalSeen:   totalSeen,
		TotalKept:   len(samples),
		Samples:     samples,
	}

	jsonData, err := json.MarshalIndent(dataset, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal JSON: %v", err)
	}

	var writer io.Writer = os.Stdout
	if *out != "" {
		f, err := os.Create(*out)
		if err != nil {
			log.Fatalf("Failed to create output file: %v", err)
		}
		defer f.Close()
		writer = f
	}

	if _, err := writer.Write(jsonData); err != nil {
		log.Fatalf("Failed to write output: %v", err)
	}

	if *out != "" {
		log.Printf("Wrote %d samples to %s (seen %d posts total)", len(samples), *out, totalSeen)
	} else {
		fmt.Fprintln(os.Stderr)
		log.Printf("Wrote %d samples to stdout (seen %d posts total)", len(samples), totalSeen)
	}
}

// normalizeLang extracts the primary language subtag from a BCP-47 tag.
// e.g. "pt-BR" → "pt", "zh-Hans" → "zh", "en" → "en"
func normalizeLang(tag string) string {
	parts := strings.SplitN(tag, "-", 2)
	return strings.ToLower(parts[0])
}
