import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ValuationResult } from "../api/client";

type Props = {
  confidence: ValuationResult["confidence"];
};

export default function ConfidenceBar({ confidence }: Props) {
  const percent = Math.round(confidence.overall * 100);
  const breakdown = confidence.breakdown;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confidence</Text>
        <Text style={styles.score}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.grid}>
        <Text style={styles.detail}>AI {Math.round(breakdown.ai_identification * 100)}%</Text>
        <Text style={styles.detail}>Fields {Math.round(breakdown.field_completeness * 100)}%</Text>
        <Text style={styles.detail}>Comps {Math.round(breakdown.comp_volume * 100)}%</Text>
        <Text style={styles.detail}>Match {Math.round(breakdown.comp_similarity * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: "#22201c",
    fontSize: 16,
    fontWeight: "800",
  },
  score: {
    color: "#22201c",
    fontSize: 16,
    fontWeight: "800",
  },
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#ddd8cf",
  },
  fill: {
    height: "100%",
    backgroundColor: "#1c7c54",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detail: {
    color: "#5f5a51",
    fontSize: 12,
    fontWeight: "600",
  },
});

