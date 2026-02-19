"use client"

import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from "react-native"
import { CheckCircle2, RefreshCw, Download } from "lucide-react"

interface CapturedPhotoProps {
  imageData: string
  onRetake: () => void
}

export function CapturedPhoto({ imageData, onRetake }: CapturedPhotoProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageData
    link.download = `face-capture-${Date.now()}.jpg`
    link.click()
  }

  return (
    <View style={styles.container}>
      {/* Success message */}
      <View style={styles.successMessage}>
        <CheckCircle2 size={20} color="#16a34a" />
        <Text style={styles.successText}>Photo captured successfully!</Text>
      </View>

      {/* Captured image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageData || "/placeholder.svg" }}
          style={styles.image}
        />
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.buttonOutline} onPress={onRetake}>
          <RefreshCw size={16} color="#666" />
          <Text style={styles.buttonOutlineText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleDownload}>
          <Download size={16} color="#fff" />
          <Text style={styles.buttonPrimaryText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#16a34a",
  },
  imageWrapper: {
    position: "relative",
    aspectRatio: 3 / 4,
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    transform: Platform.select({
      web: "scaleX(-1)",
      default: [{ scaleX: -1 }],
    }),
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  buttonOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "transparent",
    gap: 8,
  },
  buttonOutlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    gap: 8,
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})
