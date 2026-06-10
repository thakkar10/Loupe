import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ValuationResult } from "../api/client";

type Props = {
  comps: ValuationResult["comps"];
  currency: string;
};

export default function CompsList({ comps, currency }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comps</Text>
      {comps.map((comp, index) => (
        <View key={`${comp.source}-${index}`} style={styles.row}>
          <View style={styles.copy}>
            <Text numberOfLines={2} style={styles.compTitle}>
              {comp.title}
            </Text>
            <Text style={styles.meta}>
              {comp.source} {comp.condition ? `- ${comp.condition}` : ""}{" "}
              {comp.sold_date ? `- sold ${comp.sold_date}` : ""}
            </Text>
          </View>
          <Text style={styles.price}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(comp.price)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    color: "#22201c",
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ded8ce",
    paddingBottom: 12,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  compTitle: {
    color: "#22201c",
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: "#6f695f",
    fontSize: 12,
    fontWeight: "600",
  },
  price: {
    color: "#22201c",
    fontSize: 15,
    fontWeight: "900",
  },
});
