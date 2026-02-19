"use client"

import { View, Text, StyleSheet, Platform } from "react-native" // Added Platform
import {
  type AlertCircle,
  CheckCircle2,
  User,
  Sun,
  Moon,
  MoveHorizontal,
  MoveVertical,
  ZoomIn,
  ZoomOut,
  Eye,
  RotateCcw,
  Users,
} from "lucide-react"
import type { ValidationStatus } from "@/lib/face-validation"

interface StatusFeedbackProps {
  status: ValidationStatus
  isCapturing: boolean
}

const statusConfig: Record<
  ValidationStatus,
  {
    message: string
    icon: typeof AlertCircle
    type: "success" | "warning" | "error"
  }
> = {
  GOOD_PHOTO: {
    message: "Perfect! Hold still...",
    icon: CheckCircle2,
    type: "success",
  },
  NO_FACE: {
    message: "Position your face in the oval",
    icon: User,
    type: "warning",
  },
  MULTIPLE_FACES: {
    message: "Only one face should be visible",
    icon: Users,
    type: "error",
  },
  TOO_DARK: {
    message: "Move to a brighter area",
    icon: Moon,
    type: "warning",
  },
  TOO_BRIGHT: {
    message: "Reduce the lighting",
    icon: Sun,
    type: "warning",
  },
  FACE_TOO_CLOSE: {
    message: "Move further from the camera",
    icon: ZoomOut,
    type: "warning",
  },
  FACE_TOO_FAR: {
    message: "Move closer to the camera",
    icon: ZoomIn,
    type: "warning",
  },
  FACE_TOO_LEFT: {
    message: "Move your face to the right",
    icon: MoveHorizontal,
    type: "warning",
  },
  FACE_TOO_RIGHT: {
    message: "Move your face to the left",
    icon: MoveHorizontal,
    type: "warning",
  },
  FACE_TOO_HIGH: {
    message: "Lower your face",
    icon: MoveVertical,
    type: "warning",
  },
  FACE_TOO_LOW: {
    message: "Raise your face",
    icon: MoveVertical,
    type: "warning",
  },
  FACE_CUTOFF: {
    message: "Ensure your full face is visible",
    icon: User,
    type: "error",
  },
  EYES_CLOSED: {
    message: "Please open your eyes",
    icon: Eye,
    type: "warning",
  },
  LOOKING_LEFT: {
    message: "Look straight at the camera",
    icon: RotateCcw,
    type: "warning",
  },
  LOOKING_RIGHT: {
    message: "Look straight at the camera",
    icon: RotateCcw,
    type: "warning",
  },
  LOOKING_UP: {
    message: "Lower your gaze",
    icon: RotateCcw,
    type: "warning",
  },
  LOOKING_DOWN: {
    message: "Raise your gaze",
    icon: RotateCcw,
    type: "warning",
  },
}

export function StatusFeedback({ status, isCapturing }: StatusFeedbackProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const getBackgroundColor = () => {
    switch (config.type) {
      case "success":
        return "rgba(34, 197, 94, 0.9)"
      case "warning":
        return "rgba(251, 191, 36, 0.9)"
      case "error":
        return "rgba(239, 68, 68, 0.9)"
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.feedback, { backgroundColor: getBackgroundColor() }]}>
        <Icon size={20} color="#fff" />
        <Text style={styles.feedbackText}>
          {isCapturing && status === "GOOD_PHOTO" ? "Hold still..." : config.message}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      web: {
        backdropFilter: "blur(10px)",
      } as React.CSSProperties,
      default: {}, // backdropFilter is a web-specific CSS property
    }),
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})
