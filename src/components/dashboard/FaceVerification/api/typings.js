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
  faceMap: string,
  lowQualityAuditTrailImage: string,
  auditTrailImage: string,
  userAgent: string,
}
