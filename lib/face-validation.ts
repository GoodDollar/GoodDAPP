export interface Keypoint {
  x: number
  y: number
  z?: number
  name?: string
}

export interface BoundingBox {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
  width: number
  height: number
}

export interface FaceData {
  keypoints: Keypoint[]
  box?: BoundingBox
}

export interface FaceDetectionResult {
  faces: FaceData[]
}

export type ValidationStatus =
  | "GOOD_PHOTO"
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "FACE_TOO_CLOSE"
  | "FACE_TOO_FAR"
  | "FACE_TOO_LEFT"
  | "FACE_TOO_RIGHT"
  | "FACE_TOO_HIGH"
  | "FACE_TOO_LOW"
  | "FACE_CUTOFF"
  | "EYES_CLOSED"
  | "LOOKING_LEFT"
  | "LOOKING_RIGHT"
  | "LOOKING_UP"
  | "LOOKING_DOWN"

// Thresholds
const FACE_TOO_CLOSE_THRESHOLD = 0.35
const FACE_TOO_FAR_THRESHOLD = 0.15
const EYE_ASPECT_RATIO_THRESHOLD = 0.21
const INDIVIDUAL_EYE_THRESHOLD = 0.16
const YAW_THRESHOLD = 17
const PITCH_THRESHOLD = 13

// Face position thresholds (as percentage of frame)
const FACE_CENTER_X_MIN = 0.45
const FACE_CENTER_X_MAX = 0.55
const FACE_CENTER_Y_MIN = 0.25
const FACE_CENTER_Y_MAX = 0.55

/**
 * Main validation function that checks all conditions
 * Updated to accept width/height numbers instead of canvas element
 */
let logged = false
export function validateFrame(result: FaceDetectionResult | null, imgW: number, imgH: number): ValidationStatus {
  // Check for face detection
  if (!result || result.faces.length === 0) {
    return "NO_FACE"
  }

  // Check for multiple faces
  if (result.faces.length > 1) {
    return "MULTIPLE_FACES"
  }

  const face = result.faces[0]
  const keypoints = face.keypoints
  !logged &&
    console.log(
      "points:",
      face.keypoints.map((_) => _.name),
    )
  logged = true
  // Check face cutoff
  if (isFaceCutoff(keypoints, imgW, imgH)) {
    return "FACE_CUTOFF"
  }

  // Check face distance
  const distanceStatus = checkFaceDistance(keypoints, imgW)
  if (distanceStatus !== "GOOD_PHOTO") return distanceStatus

  // Check face position
  const positionStatus = checkFacePosition(keypoints, imgW, imgH)
  if (positionStatus !== "GOOD_PHOTO") return positionStatus

  // Check eyes open
  const eyesStatus = checkEyesOpen(keypoints)
  if (eyesStatus !== "GOOD_PHOTO") return eyesStatus

  // Check head orientation
  const orientationStatus = checkHeadOrientation(keypoints)
  if (orientationStatus !== "GOOD_PHOTO") return orientationStatus

  return "GOOD_PHOTO"
}

/**
 * Get keypoint by name or index (MediaPipe FaceMesh indices)
 */
function getKeypoint(keypoints: Keypoint[], nameOrIndex: string | number): Keypoint | undefined {
  if (typeof nameOrIndex === "string") {
    return keypoints.find((kp) => kp.name === nameOrIndex)
  }
  return keypoints[nameOrIndex]
}

/**
 * Check if face is cut off at edges
 */
function isFaceCutoff(keypoints: Keypoint[], imgW: number, imgH: number): boolean {
  const margin = 0.03

  for (const kp of keypoints) {
    const normalizedX = kp.x / imgW
    const normalizedY = kp.y / imgH
    if (normalizedX < margin || normalizedX > 1 - margin || normalizedY < margin || normalizedY > 1 - margin) {
      return true
    }
  }
  return false
}

/**
 * Check if face is too close or too far using eye distance
 */
function checkFaceDistance(keypoints: Keypoint[], imgW: number): ValidationStatus {
  // MediaPipe FaceMesh landmark indices for eyes
  const leftEyeOuter = getKeypoint(keypoints, 33) || getKeypoint(keypoints, "leftEyeOuter")
  const rightEyeOuter = getKeypoint(keypoints, 263) || getKeypoint(keypoints, "rightEyeOuter")

  if (!leftEyeOuter || !rightEyeOuter) return "NO_FACE"

  const eyeDistance =
    Math.sqrt(Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) + Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2)) / imgW

  if (eyeDistance > FACE_TOO_CLOSE_THRESHOLD) {
    return "FACE_TOO_CLOSE"
  }

  if (eyeDistance < FACE_TOO_FAR_THRESHOLD) {
    return "FACE_TOO_FAR"
  }

  return "GOOD_PHOTO"
}

/**
 * Check if face is centered in the frame
 */
function checkFacePosition(keypoints: Keypoint[], imgW: number, imgH: number): ValidationStatus {
  // Use nose tip as face center reference (index 1 in MediaPipe FaceMesh)
  const noseTip = getKeypoint(keypoints, 1) || getKeypoint(keypoints, "noseTip")

  if (!noseTip) return "NO_FACE"

  const centerX = noseTip.x / imgW
  const centerY = noseTip.y / imgH

  if (centerX < FACE_CENTER_X_MIN) return "FACE_TOO_LEFT"
  if (centerX > FACE_CENTER_X_MAX) return "FACE_TOO_RIGHT"
  if (centerY < FACE_CENTER_Y_MIN) return "FACE_TOO_HIGH"
  if (centerY > FACE_CENTER_Y_MAX) return "FACE_TOO_LOW"

  return "GOOD_PHOTO"
}

/**
 * Check if eyes are open using Eye Aspect Ratio (EAR)
 * Removed unused parameters
 */
function checkEyesOpen(keypoints: Keypoint[]): ValidationStatus {
  // MediaPipe FaceMesh eye landmark indices - using 6 points per eye for better EAR
  // User's LEFT eye (appears on right side of video) - indices 33, 133, etc.
  const userLeftEyeTop1 = getKeypoint(keypoints, 159)
  const userLeftEyeTop2 = getKeypoint(keypoints, 158)
  const userLeftEyeBottom1 = getKeypoint(keypoints, 145)
  const userLeftEyeBottom2 = getKeypoint(keypoints, 153)
  const userLeftEyeInner = getKeypoint(keypoints, 133)
  const userLeftEyeOuter = getKeypoint(keypoints, 33)

  // User's RIGHT eye (appears on left side of video) - indices 263, 362, etc.
  const userRightEyeTop1 = getKeypoint(keypoints, 386)
  const userRightEyeTop2 = getKeypoint(keypoints, 385)
  const userRightEyeBottom1 = getKeypoint(keypoints, 374)
  const userRightEyeBottom2 = getKeypoint(keypoints, 380)
  const userRightEyeInner = getKeypoint(keypoints, 362)
  const userRightEyeOuter = getKeypoint(keypoints, 263)

  // Validate we have all necessary keypoints for user's left eye
  if (
    !userLeftEyeTop1 ||
    !userLeftEyeTop2 ||
    !userLeftEyeBottom1 ||
    !userLeftEyeBottom2 ||
    !userLeftEyeInner ||
    !userLeftEyeOuter
  ) {
    return "NO_FACE"
  }
  // Validate we have all necessary keypoints for user's right eye
  if (
    !userRightEyeTop1 ||
    !userRightEyeTop2 ||
    !userRightEyeBottom1 ||
    !userRightEyeBottom2 ||
    !userRightEyeInner ||
    !userRightEyeOuter
  ) {
    return "NO_FACE"
  }

  // Calculate EAR for each eye
  const userLeftEAR = calculateImprovedEAR(
    userLeftEyeTop1,
    userLeftEyeTop2,
    userLeftEyeBottom1,
    userLeftEyeBottom2,
    userLeftEyeInner,
    userLeftEyeOuter,
  )
  const userRightEAR = calculateImprovedEAR(
    userRightEyeTop1,
    userRightEyeTop2,
    userRightEyeBottom1,
    userRightEyeBottom2,
    userRightEyeInner,
    userRightEyeOuter,
  )

  const avgEAR = (userLeftEAR + userRightEAR) / 2

  // Debug logging with clearer labels
  console.log(
    "[v0] Eye EAR - User's Left (video right):",
    userLeftEAR.toFixed(3),
    "User's Right (video left):",
    userRightEAR.toFixed(3),
    "Avg:",
    avgEAR.toFixed(3),
  )

  if (userLeftEAR < INDIVIDUAL_EYE_THRESHOLD) {
    console.log("[v0] User's LEFT eye appears closed")
    return "EYES_CLOSED"
  }

  if (userRightEAR < INDIVIDUAL_EYE_THRESHOLD) {
    console.log("[v0] User's RIGHT eye appears closed")
    return "EYES_CLOSED"
  }

  // Also check average for cases where both are partially closed
  if (avgEAR < EYE_ASPECT_RATIO_THRESHOLD) {
    console.log("[v0] Both eyes appear partially closed (avg below threshold)")
    return "EYES_CLOSED"
  }

  return "GOOD_PHOTO"
}

/**
 * Improved EAR calculation using 6 landmarks per eye
 * Based on the standard EAR formula: (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 */
function calculateImprovedEAR(
  top1: Keypoint,
  top2: Keypoint,
  bottom1: Keypoint,
  bottom2: Keypoint,
  inner: Keypoint,
  outer: Keypoint,
): number {
  // Vertical distances (eye height at two points)
  const verticalDist1 = Math.sqrt(Math.pow(top1.x - bottom1.x, 2) + Math.pow(top1.y - bottom1.y, 2))
  const verticalDist2 = Math.sqrt(Math.pow(top2.x - bottom2.x, 2) + Math.pow(top2.y - bottom2.y, 2))

  // Horizontal distance (eye width)
  const horizontalDist = Math.sqrt(Math.pow(inner.x - outer.x, 2) + Math.pow(inner.y - outer.y, 2))

  if (horizontalDist === 0) return 1

  // EAR = (vertical1 + vertical2) / (2 * horizontal)
  return (verticalDist1 + verticalDist2) / (2 * horizontalDist)
}

/**
 * Calculate distance between two keypoints
 */
function distance(p1: Keypoint, p2: Keypoint): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

/**
 * Improved head orientation check with debug logging and tighter thresholds
 */
function checkHeadOrientation(keypoints: Keypoint[]): ValidationStatus {
  // Use key landmarks to estimate head pose
  const noseTip = getKeypoint(keypoints, 1)
  const leftCheek = getKeypoint(keypoints, 234)
  const rightCheek = getKeypoint(keypoints, 454)
  const foreheadCenter = getKeypoint(keypoints, 10)
  const chin = getKeypoint(keypoints, 152)

  // Additional landmarks for more accurate yaw detection
  const leftTemple = getKeypoint(keypoints, 127)
  const rightTemple = getKeypoint(keypoints, 356)

  if (!noseTip || !leftCheek || !rightCheek || !foreheadCenter || !chin) {
    return "NO_FACE"
  }

  const leftDist = distance(noseTip, leftCheek)
  const rightDist = distance(noseTip, rightCheek)
  const yawRatio = leftDist / (leftDist + rightDist)

  // yawRatio close to 0.5 means facing forward
  const yawDeviation = Math.abs(yawRatio - 0.5) * 100

  console.log(
    "[v0] Head orientation - Yaw ratio:",
    yawRatio.toFixed(3),
    "Yaw deviation:",
    yawDeviation.toFixed(1),
    "Threshold:",
    YAW_THRESHOLD,
  )

  if (yawDeviation > YAW_THRESHOLD) {
    if (yawRatio < 0.5) return "LOOKING_RIGHT"
    return "LOOKING_LEFT"
  }

  const noseToForehead = distance(noseTip, foreheadCenter)
  const noseToChin = distance(noseTip, chin)
  const totalFaceHeight = noseToForehead + noseToChin

  const pitchRatio = noseToForehead / totalFaceHeight
  // Normal ratio is around 0.4-0.45 when looking straight
  const pitchDeviation = Math.abs(pitchRatio - 0.42) * 100

  console.log(
    "[v0] Head orientation - Pitch ratio:",
    pitchRatio.toFixed(3),
    "Pitch deviation:",
    pitchDeviation.toFixed(1),
    "Threshold:",
    PITCH_THRESHOLD,
  )

  if (pitchDeviation < PITCH_THRESHOLD) {
    if (pitchRatio < 0.42) return "LOOKING_DOWN"
    return "LOOKING_UP"
  }

  return "GOOD_PHOTO"
}
