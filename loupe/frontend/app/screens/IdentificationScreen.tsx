import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { IdentificationResult } from "../api/client";
import Button from "../components/Button";

type Props = {
  identification: IdentificationResult;
  onContinue: () => void;
  loading?: boolean;
};

export default function IdentificationScreen({ identification, loading, onContinue }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Identification</Text>
      <Text style={styles.title}>{identification.model_guess ?? identification.category}</Text>
      <View style={styles.summary}>
        <Row label="Category" value={identification.category} />
        <Row label="Brand" value={identification.brand ?? "Unknown"} />
        <Row label="Confidence" value={`${Math.round(identification.confidence * 100)}%`} />
      </View>
      {identification.ambiguity_notes ? (
        <Text style={styles.note}>{identification.ambiguity_notes}</Text>
      ) : null}
      <View style={styles.fields}>
        <Text style={styles.sectionTitle}>Known Fields</Text>
        {Object.entries(identification.known_fields).map(([key, value]) => (
          <Row key={key} label={key.replace("_", " ")} value={String(value)} />
        ))}
      </View>
      {identification.questions.length > 0 ? (
        <Text style={styles.note}>
          Loupe needs {identification.questions.length} more field
          {identification.questions.length === 1 ? "" : "s"} before pricing.
        </Text>
      ) : null}
      <Button
        disabled={loading}
        label={
          loading
            ? "Valuing..."
            : identification.questions.length > 0
              ? "Answer Follow-Ups"
              : "Get Valuation"
        }
        onPress={onContinue}
      />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
  },
  kicker: {
    color: "#6f695f",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: "#161616",
    fontSize: 34,
    fontWeight: "900",
  },
  summary: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#ded8ce",
    paddingTop: 12,
  },
  fields: {
    gap: 10,
  },
  sectionTitle: {
    color: "#22201c",
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    color: "#6f695f",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  rowValue: {
    flex: 1,
    color: "#22201c",
    fontWeight: "800",
    textAlign: "right",
  },
  note: {
    color: "#5f5a51",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
