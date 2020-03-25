// @flow

export const FaceVerificationProviders = {
  Kairos: 'kairos',
  Zoom: 'zoom',
}

export type FaceVerificationProvider = $Values<typeof FaceVerificationProviders>;

// TODO add type for enrollResult
export type FaceVerificationResponse = {
  enrollResult: any,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
}

export type FaceVerificationPayload = {
  sessionId: String
} && ({
  images: Array<{
    width: number,
    height: number,
    uri: string,
    base64?: string,
    exif?: { [name: string]: any },
    pictureOrientation: number,
    deviceOrientation: number,
  }>
} || {
  faceMap: string,
  lowQualityAuditTrailImage: string,
  auditTrailImage: string,
})
