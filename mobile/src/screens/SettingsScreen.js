// mobile/src/screens/SettingsScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { colors, cardShadow } from "../theme";

// For emulators: http://10.0.2.2:4000 (Android), http://localhost:4000 (iOS/web)
// For real devices on Wi‑Fi: http://<your-lan-ip>:4000
const BACKEND_URL = "http://localhost:4000";
const STORE_ID = 1;

export default function SettingsScreen() {
  const [status, setStatus] = useState(null);
  const [statusColor, setStatusColor] = useState("#ef4444");
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);

  const uploadCsv = async () => {
    setStatus(null);
    setSelectedFileName(null);
    setLoading(true);

    try {
      // 1) Pick a CSV file
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setStatus("Upload cancelled.");
        setStatusColor("#6b7280"); // gray
        setLoading(false);
        return;
      }

      const asset = result.assets && result.assets[0];

      if (!asset || !asset.uri) {
        setStatus("Could not read selected file.");
        setStatusColor("#ef4444");
        setLoading(false);
        return;
      }

      setSelectedFileName(asset.name || "reviews.csv");

      const formData = new FormData();

      // ⚠️ IMPORTANT: different handling for web vs native
      if (Platform.OS === "web" && asset.file) {
        // On web, use the real File object so the browser sets it as a file part
        formData.append("file", asset.file, asset.name || "reviews.csv");
      } else {
        // On native, the { uri, name, type } pattern is correct
        formData.append("file", {
          uri: asset.uri,
          name: asset.name || "reviews.csv",
          type: asset.mimeType || "text/csv",
        });
      }

      // 2) DO NOT set Content-Type, let fetch/React Native do it
      const response = await fetch(
        `${BACKEND_URL}/stores/${STORE_ID}/reviews/upload-csv`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        console.warn("Upload response was not valid JSON", err);
      }

      if (response.ok) {
        const importedCount = data?.imported ?? data?.rowsInserted ?? null;
        const message =
          importedCount != null
            ? `Upload successful. Imported ${importedCount} reviews.`
            : "Upload successful. Your reviews are being processed.";
        setStatus(message);
        setStatusColor("#22c55e"); // green
      } else {
        const errorMessage =
          data?.error || data?.message || "Upload failed on the server.";
        setStatus(`Error: ${errorMessage}`);
        setStatusColor("#ef4444");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus(`Upload failed: ${err.message || "Something went wrong."}`);
      setStatusColor("#ef4444");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Upload new review data for your store from a CSV file.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Reviews CSV</Text>
          <Text style={styles.cardSubtitle}>
            Pick a CSV file from your device and well import the
            reviews into StoreSight.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={uploadCsv}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Uploading..." : "Choose CSV & Upload"}
            </Text>
          </TouchableOpacity>

          {selectedFileName && (
            <Text style={styles.fileName}>Selected file: {selectedFileName}</Text>
          )}

          {status && (
            <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
          )}

          <Text style={styles.note}>
            CSV must match the importer format:{" "}
            <Text style={styles.noteEmphasis}>
              store_id, rating, source, review_text
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    textAlign: "left",
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    marginTop: 15,
    fontSize: 14,
    textAlign: "center",
    textAlign: "left",
  },
  fileName: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  note: {
    marginTop: 25,
    fontSize: 12,
    textAlign: "left",
    color: colors.muted,
  },
  noteEmphasis: {
    fontWeight: "600",
    color: colors.primary,
  },
});
