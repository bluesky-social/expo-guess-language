import { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  BenchmarkResult,
  BenchmarkStats,
  Dataset,
} from "../benchmark/types";
import { runBenchmark } from "../benchmark/runner";
import { computeStats } from "../benchmark/stats";
import dataset from "../assets/dataset.json";

type Status = "idle" | "running" | "done";

type AllStats = { native: BenchmarkStats; lande: BenchmarkStats };

export default function BenchmarkScreen() {
  const data = dataset as Dataset;
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [stats, setStats] = useState<AllStats | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  const langDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of data.samples) {
      counts.set(s.lang, (counts.get(s.lang) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [data]);

  const handleRun = useCallback(async () => {
    setStatus("running");
    setProgress({ done: 0, total: data.samples.length });
    setStats(null);

    const start = performance.now();
    const res = await runBenchmark(data.samples, (done, total) => {
      setProgress({ done, total });
    });
    setElapsedMs(performance.now() - start);

    setStats(computeStats(res));
    setStatus("done");
  }, [data]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Dataset info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dataset</Text>
        <Text style={styles.cardBody}>
          {data.samples.length} samples, {langDistribution.length}+ languages
        </Text>
        <Text style={styles.cardMeta}>
          Generated: {new Date(data.generatedAt).toLocaleDateString()}
        </Text>
        <View style={styles.langChips}>
          {langDistribution.map(([lang, count]) => (
            <View key={lang} style={styles.chip}>
              <Text style={styles.chipText}>
                {lang} ({count})
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Run button / progress */}
      {status === "idle" && (
        <Pressable style={styles.button} onPress={handleRun}>
          <Text style={styles.buttonText}>Run Benchmark</Text>
        </Pressable>
      )}

      {status === "running" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Running...</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    progress.total > 0
                      ? `${(progress.done / progress.total) * 100}%`
                      : "0%",
                },
              ]}
            />
          </View>
          <Text style={styles.cardBody}>
            {progress.done} / {progress.total}
          </Text>
        </View>
      )}

      {/* Results */}
      {status === "done" && stats && (
        <>
          {/* Overall accuracy comparison */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Overall Accuracy</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonCol}>
                <Text style={styles.bigNumber}>
                  {(stats.native.overallAccuracy * 100).toFixed(1)}%
                </Text>
                <Text style={styles.comparisonLabel}>
                  Native ({Platform.OS})
                </Text>
                <Text style={styles.cardMeta}>
                  {stats.native.correct}/{stats.native.total}
                </Text>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonCol}>
                <Text style={[styles.bigNumber, styles.bigNumberLande]}>
                  {(stats.lande.overallAccuracy * 100).toFixed(1)}%
                </Text>
                <Text style={styles.comparisonLabel}>lande (JS)</Text>
                <Text style={styles.cardMeta}>
                  {stats.lande.correct}/{stats.lande.total}
                </Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>
              {(elapsedMs / 1000).toFixed(1)}s total,{" "}
              {(elapsedMs / stats.native.total).toFixed(1)}ms/sample
            </Text>
          </View>

          {/* Threshold tables side by side */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Confidence Thresholds — Native ({Platform.OS})
            </Text>
            <ThresholdTable stats={stats.native} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Confidence Thresholds — lande (JS)
            </Text>
            <ThresholdTable stats={stats.lande} />
          </View>

          {/* Per-language breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Per Language</Text>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  { flex: 0.6 },
                ]}
              >
                Lang
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellHeader,
                  { flex: 0.5 },
                ]}
              >
                #
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>
                Native
              </Text>
              <Text style={[styles.tableCell, styles.tableCellHeader]}>
                lande
              </Text>
            </View>
            {stats.native.perLanguage.slice(0, 20).map((row) => {
              const landeRow = stats.lande.perLanguage.find(
                (l) => l.lang === row.lang,
              );
              return (
                <View key={row.lang} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 0.6 }]}>
                    {row.lang}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {row.count}
                  </Text>
                  <Text style={styles.tableCell}>
                    {(row.accuracy * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.tableCell}>
                    {landeRow
                      ? `${(landeRow.accuracy * 100).toFixed(1)}%`
                      : "—"}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Re-run */}
          <Pressable style={styles.button} onPress={handleRun}>
            <Text style={styles.buttonText}>Run Again</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function ThresholdTable({ stats }: { stats: BenchmarkStats }) {
  return (
    <>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableCellHeader]}>
          Threshold
        </Text>
        <Text style={[styles.tableCell, styles.tableCellHeader]}>Above</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader]}>Accuracy</Text>
        <Text style={[styles.tableCell, styles.tableCellHeader]}>Dropped</Text>
      </View>
      {stats.thresholds.map((row) => (
        <View key={row.threshold} style={styles.tableRow}>
          <Text style={styles.tableCell}>
            {"\u2265"} {row.threshold}
          </Text>
          <Text style={styles.tableCell}>{row.postsAbove}</Text>
          <Text style={styles.tableCell}>
            {(row.accuracy * 100).toFixed(1)}%
          </Text>
          <Text style={styles.tableCell}>
            {(row.nonDetectedRate * 100).toFixed(1)}%
          </Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: "#555",
  },
  cardMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  comparisonCol: {
    flex: 1,
    alignItems: "center",
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    alignSelf: "stretch",
    marginHorizontal: 12,
  },
  comparisonLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
    fontVariant: ["tabular-nums"],
  },
  bigNumberLande: {
    color: "#34C759",
  },
  langChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  chip: {
    backgroundColor: "#f0f0f5",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 12,
    color: "#555",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    color: "#444",
  },
  tableCellHeader: {
    fontWeight: "600",
    color: "#333",
  },
});
