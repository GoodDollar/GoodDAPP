"use client"

interface CountdownOverlayProps {
  count: number
}

export function CountdownOverlay({ count }: CountdownOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Animated ring */}
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${283}`}
            strokeDashoffset={`${283 * (1 - (4 - count) / 3)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span key={count} className="text-5xl font-bold text-white animate-in zoom-in-50 duration-300">
            {count}
          </span>
        </div>
      </div>
    </div>
  )
}
