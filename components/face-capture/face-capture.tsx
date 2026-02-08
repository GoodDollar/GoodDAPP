"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { FaceOverlay } from "./face-overlay"
import { StatusFeedback } from "./status-feedback"
import { CountdownOverlay } from "./countdown-overlay"
import { validateFrame, type ValidationStatus, type FaceDetectionResult } from "@/lib/face-validation"
import * as tf from "@tensorflow/tfjs";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

type FaceLandmarksDetector = Awaited<
  ReturnType<typeof import("@tensorflow-models/face-landmarks-detection").createDetector>
>

interface FaceCaptureProps {
  onCapture: (imageData: string) => void
}

export function FaceCapture({ onCapture }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<FaceLandmarksDetector | null>(null)
  const isProcessingRef = useRef(false)
  const isCapturingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Initializing...")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ValidationStatus>("NO_FACE")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const initializeFaceDetector = useCallback(async () => {
    try {
      setLoadingMessage("Loading TensorFlow.js...")
      console.log("[v0] Starting TensorFlow.js initialization")

      // Dynamic import to avoid SSR issues
      // const tf = await import("@tensorflow/tfjs")

      console.log("[v0] Setting WebGL backend")
      await tf.setBackend("webgl")
      await tf.ready()
      console.log("[v0] TensorFlow.js ready with backend:", tf.getBackend())

      setLoadingMessage("Loading face detection model...")
      console.log("[v0] Loading face landmarks detection model")

      // const faceLandmarksDetection = await import("@tensorflow-models/face-landmarks-detection")

      const detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
            runtime: 'tfjs',            
            maxFaces: 1,
            refineLandmarks:true
          }
      )

      console.log("[v0] Face detector created successfully")
      detectorRef.current = detector
      return true
    } catch (err) {
      console.error("[v0] Failed to initialize Face Detector:", err)
      setError(`Failed to load face detection: ${err instanceof Error ? err.message : "Unknown error"}`)
      return false
    }
  }, [])

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    try {
      setLoadingMessage("Accessing camera...")
      console.log("[v0] Requesting camera access")

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 900 },
          facingMode: "user",
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!
          video.onloadedmetadata = () => {
            videoRef.current.width = videoRef.current.videoWidth;
            videoRef.current.height = videoRef.current.videoHeight;
            video
              .play()
              .then(() => {
                console.log("[v0] Camera stream playing",videoRef.current.width,videoRef.current.height)
                resolve()
              })
              .catch(reject)
          }
          video.onerror = () => reject(new Error("Video failed to load"))
        })
      }

      return true
    } catch (err) {
      console.error("[v0] Camera access error:", err)
      setError("Unable to access camera. Please grant permission.")
      return false
    }
  }, [])

  // Start countdown for auto-capture
  const startCountdown = useCallback(() => {
    console.log("[v0] Starting capture countdown validation")
    if (isCapturingRef.current) return

    // Keep ref and state in sync. Ref is used for immediate checks.
    isCapturingRef.current = true
    setIsCapturing(true)
    setCountdown(3)

    let count = 3
    if(countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    countdownRef.current = setInterval(() => {
      console.log("[v0] Starting capture countdown validation interval", count)

      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        console.log("[v0] Countdown finished, capturing image validation")
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
          countdownRef.current = null
        }
        captureImage()
      }
    }, 1000)
  }, [])

  // Stop countdown
  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setCountdown(null)
    // Keep ref and state in sync
    isCapturingRef.current = false
    setIsCapturing(false)
  }, [])

  // Capture the image
  const captureImage = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      const context = canvas.getContext("2d")
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Flip horizontally to match the mirrored video display
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
        context.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL("image/jpeg", 0.9)
        onCapture(imageData)
      }
    }

    stopCountdown()
  }, [onCapture, stopCountdown])

  // Process video frames
  const desiredFPS = 5; // Target frames per second
  const frameInterval = 1000 / desiredFPS;

  const processFrame = useCallback(async () => {
    if (isProcessingRef.current) {
      return
    }
    const video = videoRef.current
    const canvas = canvasRef.current
    const detector = detectorRef.current

    if (!video || !canvas || !detector || video.readyState < 2) {
      return
    }

    isProcessingRef.current = true

    try {
      const faces = await detector.estimateFaces(video, {
        flipHorizontal: false,
      })
      // Convert to our validation format
      const result: FaceDetectionResult = {
        faces: faces.map((face) => ({
          keypoints: face.keypoints,
          box: face.box,
        })),
      }

      const validationStatus = validateFrame(
        result,
        video.videoWidth,
        video.videoHeight,
      )
      console.log({validationStatus})
      setStatus(validationStatus)

      if (validationStatus === "GOOD_PHOTO") {
        if (!isCapturingRef.current) {
          console.log("[v0] Face validation passed, starting countdown")
          startCountdown()
        }
      } else {
        if (isCapturingRef.current) {
          console.log("[v0] Face validation failed, stopping countdown")
          stopCountdown()
        }
      }
    } catch (err) {
      console.error("[v0] Face detection error:", err)
    }

    isProcessingRef.current = false
  }, [startCountdown, stopCountdown])

  // Initialize everything on mount
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      setIsLoading(true)

      // Initialize camera first
      const cameraReady = await initializeCamera()
      if (!mounted || !cameraReady) return

      // Then initialize the model
      const modelReady = await initializeFaceDetector()
      if (!mounted || !modelReady) return

      setIsLoading(false)
      // Start a fixed-interval loop instead of requestAnimationFrame
      animationFrameRef.current = window.setInterval(() => {
        // Call processFrame but ignore its returned promise
        void processFrame()
      }, frameInterval)
    }

    initialize()

    return () => {
      mounted = false
      if (animationFrameRef.current) {
        clearInterval(animationFrameRef.current)
      }

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (detectorRef.current) {
        detectorRef.current.dispose()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-destructive font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-sm text-primary underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
      />

      <canvas ref={canvasRef} className="hidden" />

      <FaceOverlay status={status} />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white text-sm">{loadingMessage}</p>
          </div>
        </div>
      )}

      {countdown !== null && <CountdownOverlay count={countdown} />}

      {!isLoading && <StatusFeedback status={status} isCapturing={isCapturing} />}
    </div>
  )
}
