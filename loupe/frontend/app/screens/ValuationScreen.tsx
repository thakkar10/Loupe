import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { ValuationResult } from "../api/client";
import Button from "../components/Button";
import CompsList from "../components/CompsList";
import ConfidenceBar from "../components/ConfidenceBar";
import ValuationCard from "../components/ValuationCard";

type Props = {
  valuation: ValuationResult;
  onHistory: () => void;
  onNewScan: () => void;
};

export default function ValuationScreen({ valuation, onHistory, onNewScan }: Props) {
  const currency = valuation.valuation.currency;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.kicker}>{valuation.item.category}</Text>
        <Text style={styles.title}>
          {valuation.item.brand ? `${valuation.item.brand} ` : ""}
          {valuation.item.model ?? "Item"}
        </Text>
      </View>
      <ValuationCard
        currency={currency}
        featured
        range={valuation.valuation.current_value}
        title="Current Value"
      />
      <View style={styles.split}>
        <ValuationCard currency={currency} range={valuation.valuation.new_price} title="New" />
        <ValuationCard currency={currency} range={valuation.valuation.used_price} title="Used" />
      </View>
      <ConfidenceBar confidence={valuation.confidence} />
      <CompsList comps={valuation.comps} currency={currency} />
      <View style={styles.actions}>
        <Button label="View History" onPress={onHistory} variant="secondary" />
        <Button label="New Scan" onPress={onNewScan} />
      </View>
    </ScrollView>
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
    fontSize: 30,
    fontWeight: "900",
  },
  split: {
    gap: 12,
  },
  actions: {
    gap: 12,
    paddingTop: 8,
  },
});

