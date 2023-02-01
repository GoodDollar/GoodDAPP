// @flow

// TODO add type for enrollResult
export type FaceVerificationResponse = {
  enrollResult: any,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
}

export type FaceVerificationPayload = {
  faceScan: string | null,
  auditTrail: string[],
  lowQualityAuditTrail: string[],
  sessionId: string | null,
  status: FaceTecSessionStatus,
  chainId?: string | undefined,
  [key: string]: string | FaceTecSessionStatus | null | {},
}
