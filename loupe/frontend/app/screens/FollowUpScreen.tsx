import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { submitAnswers, type IdentificationResult, type ValuationResult } from "../api/client";
import QuestionRenderer from "../components/QuestionRenderer";

type Props = {
  identification: IdentificationResult;
  onValuation: (result: ValuationResult) => void;
};

export default function FollowUpScreen({ identification, onValuation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (answers: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      onValuation(await submitAnswers(identification.scan_id, answers));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not calculate valuation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>A few pricing details</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <QuestionRenderer
        loading={loading}
        onSubmit={handleSubmit}
        questions={identification.questions}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 20,
  },
  title: {
    color: "#161616",
    fontSize: 30,
    fontWeight: "900",
  },
  error: {
    color: "#a23333",
    fontWeight: "700",
  },
});
