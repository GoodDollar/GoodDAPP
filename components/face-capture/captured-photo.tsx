"use client"

import { Button } from "@/components/ui/button"
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
    <div className="space-y-4">
      {/* Success message */}
      <div className="flex items-center justify-center gap-2 text-green-600">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Photo captured successfully!</span>
      </div>

      {/* Captured image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-green-500">
        <img
          src={imageData || "/placeholder.svg"}
          alt="Captured face"
          className="h-full w-full object-cover scale-x-[-1]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetake} className="flex-1 bg-transparent">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake
        </Button>
        <Button onClick={handleDownload} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}
