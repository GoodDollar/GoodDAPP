// @flow

// TODO add type for enrollResult
export type FaceVerificationResponse = {
  enrollResult: any,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
}

export type FaceVerificationPayload = {
  sessionId: string,
  enrollmentIdentifier: string,
  lowQualityAuditTrailImage: string,
  auditTrailImage: string,
  faceScan?: string,
  faceMap?: string,
}
