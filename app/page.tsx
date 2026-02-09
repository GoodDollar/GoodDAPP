import { FaceCaptureApp } from "@/components/face-capture/face-capture-app"
import { View, StyleSheet } from "react-native"

export default function Home() {
  return (
    <View style={styles.container}>
      <FaceCaptureApp />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: "100vh",
    backgroundColor: "var(--background)",
  },
})
