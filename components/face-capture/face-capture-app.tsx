"use client"

import { View, Text, StyleSheet } from "react-native"
import { useState } from "react"
import { FaceCapture } from "./face-capture"
import { CapturedPhoto } from "./captured-photo"
import { Camera } from "lucide-react"

export function FaceCaptureApp() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Camera size={24} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Face Capture</Text>
          <Text style={styles.subtitle}>
            Position your face within the oval and follow the instructions
          </Text>
        </View>

        {capturedImage ? (
          <CapturedPhoto imageData={capturedImage} onRetake={handleRetake} />
        ) : (
          <FaceCapture onCapture={handleCapture} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  content: {
    width: "100%",
    maxWidth: 450,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.02,
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
})
