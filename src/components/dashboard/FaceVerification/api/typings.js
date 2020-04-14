// @flow

// TODO add type for enrollResult
export type FaceVerificationResponse = {
  enrollResult: any,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
}

export type FaceVerificationPayload = {
  sessionId: string,
} & (
  | {
      images: Array<{
        width: number,
        height: number,
        uri: string,
        base64?: string,
        exif?: { [name: string]: any },
        pictureOrientation: number,
        deviceOrientation: number,
      }>,
    }
  | {
      faceMap: string,
      lowQualityAuditTrailImage: string,
      auditTrailImage: string,
      userAgent: string,
    }
)
