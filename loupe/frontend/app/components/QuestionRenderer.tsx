import React, { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import Button from "./Button";
import type { Question } from "../api/client";

type Props = {
  questions: Question[];
  onSubmit: (answers: Record<string, unknown>) => void;
  loading?: boolean;
};

export default function QuestionRenderer({ questions, onSubmit, loading }: Props) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const set = (key: string, value: unknown) => setAnswers(prev => ({ ...prev, [key]: value }));
  const canSubmit = questions.every(question => answers[question.field_key] !== undefined);

  return (
    <View style={styles.container}>
      {questions.map(question => (
        <View key={question.field_key} style={styles.field}>
          <Text style={styles.label}>{question.label}</Text>
          {question.input_type === "select" && question.options ? (
            <View style={styles.options}>
              {question.options.map(option => {
                const selected = answers[question.field_key] === option;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    style={[styles.option, selected && styles.selected]}
                    onPress={() => set(question.field_key, option)}
                  >
                    <Text style={[styles.optionText, selected && styles.selectedText]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : question.input_type === "boolean" ? (
            <View style={styles.booleanRow}>
              <Text style={styles.booleanText}>{answers[question.field_key] ? "Yes" : "No"}</Text>
              <Switch
                value={Boolean(answers[question.field_key])}
                onValueChange={value => set(question.field_key, value)}
              />
            </View>
          ) : (
            <TextInput
              autoCapitalize="words"
              keyboardType={question.input_type === "number" ? "numeric" : "default"}
              onChangeText={value =>
                set(question.field_key, question.input_type === "number" ? Number(value) : value)
              }
              placeholder="Enter value"
              placeholderTextColor="#817b70"
              style={styles.input}
              value={String(answers[question.field_key] ?? "")}
            />
          )}
        </View>
      ))}
      <Button
        disabled={!canSubmit || loading}
        label={loading ? "Valuing..." : "Get Valuation"}
        onPress={() => onSubmit(answers)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    color: "#22201c",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#c9c3b8",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#171512",
    backgroundColor: "#ffffff",
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: "#c9c3b8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  selected: {
    backgroundColor: "#161616",
    borderColor: "#161616",
  },
  optionText: {
    color: "#22201c",
    fontWeight: "600",
  },
  selectedText: {
    color: "#ffffff",
  },
  booleanRow: {
    minHeight: 48,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#c9c3b8",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  booleanText: {
    color: "#22201c",
    fontWeight: "600",
  },
});

