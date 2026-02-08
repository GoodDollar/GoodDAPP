"use client"

import { cn } from "@/lib/utils"
import type { ValidationStatus } from "@/lib/face-validation"

interface FaceOverlayProps {
  status: ValidationStatus
}

export function FaceOverlay({ status }: FaceOverlayProps) {
  const isGood = status === "GOOD_PHOTO"

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <mask id="face-cutout">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <ellipse cx="50" cy="45" rx="28" ry="38" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="rgba(0, 0, 0, 0.6)" mask="url(#face-cutout)" />
      </svg>

      {/* Oval guide */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse
          cx="50"
          cy="45"
          rx="28"
          ry="38"
          fill="none"
          stroke={isGood ? "#22c55e" : "#ffffff"}
          strokeWidth="0.5"
          strokeDasharray={isGood ? "0" : "2 2"}
          className={cn("transition-all duration-300", isGood && "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]")}
        />
      </svg>

      {/* Corner guides */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn("relative w-[56%] h-[76%] -translate-y-[6%]", "transition-colors duration-300")}>
          {/* Top left corner */}
          <div
            className={cn(
              "absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl",
              isGood ? "border-green-500" : "border-white/50",
            )}
          />
          {/* Top right corner */}
          <div
            className={cn(
              "absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl",
              isGood ? "border-green-500" : "border-white/50",
            )}
          />
          {/* Bottom left corner */}
          <div
            className={cn(
              "absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl",
              isGood ? "border-green-500" : "border-white/50",
            )}
          />
          {/* Bottom right corner */}
          <div
            className={cn(
              "absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-xl",
              isGood ? "border-green-500" : "border-white/50",
            )}
          />
        </div>
      </div>
    </div>
  )
}
