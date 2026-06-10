import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { getHistory } from "../api/client";
import Button from "../components/Button";

type Point = { date: string; price_mid: number };

type Props = {
  scanId: string;
  onBack: () => void;
};

export default function HistoryScreen({ scanId, onBack }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(scanId)
      .then(setPoints)
      .finally(() => setLoading(false));
  }, [scanId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Price History</Text>
      {loading ? <ActivityIndicator color="#161616" /> : null}
      <View style={styles.chart}>
        {points.length === 0 ? <Text style={styles.empty}>No history yet.</Text> : null}
        {points.map(point => (
          <View key={`${point.date}-${point.price_mid}`} style={styles.row}>
            <Text style={styles.date}>{point.date}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { width: `${Math.min(point.price_mid / 20, 100)}%` }]} />
            </View>
            <Text style={styles.price}>${Math.round(point.price_mid)}</Text>
          </View>
        ))}
      </View>
      <Button label="Back" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
  },
  title: {
    color: "#161616",
    fontSize: 30,
    fontWeight: "900",
  },
  chart: {
    gap: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  date: {
    width: 92,
    color: "#5f5a51",
    fontSize: 12,
    fontWeight: "700",
  },
  barWrap: {
    flex: 1,
    height: 16,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#ded8ce",
  },
  bar: {
    height: "100%",
    backgroundColor: "#1c7c54",
  },
  price: {
    width: 58,
    color: "#22201c",
    fontWeight: "900",
    textAlign: "right",
  },
  empty: {
    color: "#6f695f",
    fontWeight: "700",
  },
});

