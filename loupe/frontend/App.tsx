import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import CameraScreen from "./app/screens/CameraScreen";
import FollowUpScreen from "./app/screens/FollowUpScreen";
import HistoryScreen from "./app/screens/HistoryScreen";
import IdentificationScreen from "./app/screens/IdentificationScreen";
import ValuationScreen from "./app/screens/ValuationScreen";
import { submitAnswers, type IdentificationResult, type ValuationResult } from "./app/api/client";

type Route = "camera" | "identification" | "followup" | "valuation" | "history";

export default function App() {
  const [route, setRoute] = useState<Route>("camera");
  const [identification, setIdentification] = useState<IdentificationResult | null>(null);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [valuing, setValuing] = useState(false);

  const handleIdentified = (result: IdentificationResult) => {
    setIdentification(result);
    setRoute("identification");
  };

  const handleContinue = async () => {
    if (!identification) return;
    if (identification.questions.length > 0) {
      setRoute("followup");
      return;
    }
    setValuing(true);
    try {
      setValuation(await submitAnswers(identification.scan_id, {}));
      setRoute("valuation");
    } finally {
      setValuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {route === "camera" && <CameraScreen onIdentified={handleIdentified} />}
        {route === "identification" && identification && (
          <IdentificationScreen
            identification={identification}
            loading={valuing}
            onContinue={handleContinue}
          />
        )}
        {route === "followup" && identification && (
          <FollowUpScreen
            identification={identification}
            onValuation={result => {
              setValuation(result);
              setRoute("valuation");
            }}
          />
        )}
        {route === "valuation" && valuation && (
          <ValuationScreen
            valuation={valuation}
            onHistory={() => setRoute("history")}
            onNewScan={() => {
              setIdentification(null);
              setValuation(null);
              setRoute("camera");
            }}
          />
        )}
        {route === "history" && valuation && (
          <HistoryScreen scanId={valuation.scan_id} onBack={() => setRoute("valuation")} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8f7f3",
  },
  app: {
    flex: 1,
  },
});
