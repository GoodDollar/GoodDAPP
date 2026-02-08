"use client"

import { cn } from "@/lib/utils"
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

  return (
    <div className="absolute bottom-0 inset-x-0 p-4">
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
          "backdrop-blur-md transition-all duration-300",
          config.type === "success" && "bg-green-500/90 text-white",
          config.type === "warning" && "bg-amber-500/90 text-white",
          config.type === "error" && "bg-red-500/90 text-white",
        )}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span>{isCapturing && status === "GOOD_PHOTO" ? "Hold still..." : config.message}</span>
      </div>
    </div>
  )
}
