import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { submitScan, type IdentificationResult } from "../api/client";
import Button from "../components/Button";

const loupeLogo = require("../../assets/LoupeLogoMark.png");

type Props = {
  onIdentified: (result: IdentificationResult) => void;
};

export default function CameraScreen({ onIdentified }: Props) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const scan = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    try {
      onIdentified(await submitScan(imageUri));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoTile}>
            <Image resizeMode="contain" source={loupeLogo} style={styles.logoMark} />
          </View>
          <Text style={styles.brand}>Loupe</Text>
        </View>
        <Text style={styles.title}>Item value intelligence from one photo.</Text>
      </View>
      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Choose a photo to identify an item.</Text>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color="#161616" /> : null}
      <View style={styles.actions}>
        <Button label={imageUri ? "Choose Different Photo" : "Choose Photo"} onPress={pickImage} />
        <Button disabled={!imageUri || loading} label="Scan Item" onPress={scan} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 22,
    padding: 20,
  },
  header: {
    gap: 8,
    paddingTop: 18,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  logoTile: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#161616",
  },
  logoMark: {
    width: 44,
    height: 44,
  },
  brand: {
    color: "#161616",
    fontSize: 42,
    fontWeight: "900",
  },
  title: {
    color: "#5f5a51",
    fontSize: 18,
    fontWeight: "600",
  },
  preview: {
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0cabf",
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: 340,
  },
  placeholder: {
    color: "#6f695f",
    fontSize: 16,
    fontWeight: "700",
    padding: 24,
    textAlign: "center",
  },
  error: {
    color: "#a23333",
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
});
