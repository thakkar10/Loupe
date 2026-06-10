import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PriceRange } from "../api/client";

type Props = {
  title: string;
  range: PriceRange;
  currency: string;
  featured?: boolean;
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ValuationCard({ title, range, currency, featured }: Props) {
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <Text style={[styles.title, featured && styles.featuredText]}>{title}</Text>
      <Text style={[styles.mid, featured && styles.featuredText]}>{money(range.mid, currency)}</Text>
      <Text style={[styles.range, featured && styles.featuredSubtext]}>
        {money(range.low, currency)} - {money(range.high, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 5,
    borderWidth: 1,
    borderColor: "#d3cdc0",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  featured: {
    backgroundColor: "#161616",
    borderColor: "#161616",
  },
  title: {
    color: "#5f5a51",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  mid: {
    color: "#191713",
    fontSize: 34,
    fontWeight: "900",
  },
  range: {
    color: "#5f5a51",
    fontSize: 14,
    fontWeight: "600",
  },
  featuredText: {
    color: "#ffffff",
  },
  featuredSubtext: {
    color: "#d9d4cb",
  },
});

