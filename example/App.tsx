import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DemoScreen from "./screens/DemoScreen";
import BenchmarkScreen from "./screens/BenchmarkScreen";

type Tab = "demo" | "benchmark";

export default function App() {
  const [tab, setTab] = useState<Tab>("demo");

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>expo-guess-language</Text>
        <View style={styles.tabs}>
          <TabButton
            label="Demo"
            active={tab === "demo"}
            onPress={() => setTab("demo")}
          />
          <TabButton
            label="Benchmark"
            active={tab === "benchmark"}
            onPress={() => setTab("benchmark")}
          />
        </View>
        {tab === "demo" ? <DemoScreen /> : <BenchmarkScreen />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 16,
    marginBottom: 8,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#e0e0e5",
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 7,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabLabelActive: {
    color: "#000",
  },
});
