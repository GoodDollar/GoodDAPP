"use client"

import { View, StyleSheet } from "react-native"
import type { ValidationStatus } from "@/lib/face-validation"

interface FaceOverlayProps {
  status: ValidationStatus
}

export function FaceOverlay({ status }: FaceOverlayProps) {
  const isGood = status === "GOOD_PHOTO"

  return (
    <View style={styles.container}>
      {/* Dark overlay with cutout */}
      <svg style={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <mask id="face-cutout">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {/* Make oval a little larger: rx from 28 to 30, ry from 38 to 40 */}
            <ellipse cx="50" cy="45" rx="30" ry="40" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.6)" mask="url(#face-cutout)" />
      </svg>

      {/* Oval guide */}
      <svg style={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse
          cx="50"
          cy="45"
          rx="30" // Make oval a little larger: rx from 28 to 30
          ry="40" // Make oval a little larger: ry from 38 to 40
          fill="none"
          stroke={isGood ? "#22c55e" : "#ffffff"}
          strokeWidth="0.5"
          strokeDasharray={isGood ? "0" : "2 2"}
          style={{
            transition: "all 300ms ease",
            filter: isGood ? "drop-shadow(0 0 8px rgba(34,197,94,0.5))" : "none",
          }}
        />
      </svg>

      {/* Corner guides */}
      <View style={styles.cornerContainer}>
        <View style={[styles.cornerBox, !isGood && styles.cornerBoxInactive]}>
          {/* Top left corner */}
          <View style={[styles.cornerTL, isGood ? styles.cornerGood : styles.cornerDefault]} />
          {/* Top right corner */}
          <View style={[styles.cornerTR, isGood ? styles.cornerGood : styles.cornerDefault]} />
          {/* Bottom left corner */}
          <View style={[styles.cornerBL, isGood ? styles.cornerGood : styles.cornerDefault]} />
          {/* Bottom right corner */}
          <View style={[styles.cornerBR, isGood ? styles.cornerGood : styles.cornerDefault]} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  svg: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
  cornerContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  cornerBox: {
    position: "relative",
    width: "56%",
    height: "76%",
    transform: "translateY(6%)",
  },
  cornerBoxInactive: {},
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 8,
  },
  cornerGood: {
    borderColor: "#22c55e",
  },
  cornerDefault: {
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
})
