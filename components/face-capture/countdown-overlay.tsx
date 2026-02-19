"use client"

import { View, Text, StyleSheet, Platform } from "react-native" // Added Platform

interface CountdownOverlayProps {
  count: number
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  const strokeDashoffset = 283 * (1 - (4 - count) / 3)

  return (
    <View style={styles.container}>
      <View style={styles.relative}>
        {/* Animated ring */}
        <svg
          style={{
              width: "100%",
              height: "100%",
              transform: "rotate(-90deg)",
            } }
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={283}
            strokeDashoffset={strokeDashoffset}
            style={Platform.select({
              web: {
                transition: "stroke-dashoffset 1000ms linear",
              },
              default: {
                // Native SVG libraries might not support CSS transitions directly
              },
            })}
          />
        </svg>

        {/* Number */}
        <View style={styles.numberContainer}>
          <Text key={count} style={styles.number}>
            {count}
          </Text>
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
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  relative: {
    position: "relative",
    width: 128,
    height: 128,
  },
  numberContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
  },
})
