"use client"

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Face Capture</h1>
          <p className="text-muted-foreground text-sm">
            Position your face within the oval and follow the instructions
          </p>
        </div>

        {capturedImage ? (
          <CapturedPhoto imageData={capturedImage} onRetake={handleRetake} />
        ) : (
          <FaceCapture onCapture={handleCapture} />
        )}
      </div>
    </div>
  )
}
