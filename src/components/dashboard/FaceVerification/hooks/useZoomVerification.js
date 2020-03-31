import { useCallback, useMemo, useRef, useState } from 'react'
import { first, noop } from 'lodash'

import api from '../api'
import { FaceVerificationProviders } from '../api/typings'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'

const { Zoom } = FaceVerificationProviders

const {
  ZoomSession,
  ZoomCustomization,
  ZoomSessionStatus,
  createZoomAPIUserAgentString,
  getFriendlyDescriptionForZoomSessionStatus,
} = ZoomAuthentication.ZoomSDK

// eslint-disable-next-line require-await
const getFaceMapBase64 = async faceMetrics =>
  new Promise((resolve, reject) =>
    faceMetrics.getFaceMapBase64(faceMap =>
      faceMap ? resolve(faceMap) : reject(new Error('Error generating FaceMap !'))
    )
  )

const initialSessionState = {
  isComplete: false,
  isSuccess: false,
  lastResult: null,
  lastMessage: null,
}

export default ({ onComplete = noop, onError = noop }) => {
  const sessionRef = useRef(null)
  const sessionResultRef = useRef(null)
  const sessionMessageRef = useRef(null)
  const sessionSuccessRef = useRef(false)
  const resultCallbackRef = useRef(null)

  const [sessionState, setSessionState] = useState(initialSessionState)

  const handleCompletion = useCallback(() => {
    const isSuccess = sessionSuccessRef.current
    const lastResult = sessionResultRef.current
    let lastMessage = sessionMessageRef.current

    if (!lastMessage) {
      lastMessage = getFriendlyDescriptionForZoomSessionStatus(lastResult.status)
    }

    sessionRef.current = null

    setSessionState({
      isComplete: true,
      isSuccess,
      lastResult,
      lastMessage,
    })

    onComplete(isSuccess, lastResult, lastMessage)
  }, [onComplete, setSessionState])

  const performVerification = useCallback(async () => {
    const zoomSessionResult = sessionResultRef.current
    const zoomFaceMapResultCallback = resultCallbackRef.current

    const { faceMetrics, sessionId } = zoomSessionResult
    const captured = faceMetrics.lowQualityAuditTrailCompressedBase64()
    const capturedHD = faceMetrics.getAuditTrailBase64JPG()

    try {
      const faceMap = await getFaceMapBase64(faceMetrics)
      const payload = {
        sessionId,
        faceMap,
        lowQualityAuditTrailImage: first(captured),
        auditTrailImage: first(capturedHD),
        userAgent: createZoomAPIUserAgentString(sessionId),
      }

      const response = await api.performFaceVerification(payload, Zoom, ({ loaded, total }) => {
        zoomFaceMapResultCallback.uploadProgress(loaded / total)
      })

      const { message: successMessage } = response.enrollmentResult

      ZoomCustomization.setOverrideResultScreenSuccessMessage(successMessage)

      sessionMessageRef.current = successMessage
      sessionSuccessRef.current = true
      zoomFaceMapResultCallback.succeed()
    } catch (exception) {
      const { message, response } = exception

      sessionMessageRef.current = message

      if (response) {
        const { code, subCode, message: zoomMessage } = response.enrollmentResult || {}

        sessionMessageRef.current = zoomMessage

        if (200 === code || 'nameCollision' === subCode) {
          ZoomCustomization.setOverrideResultScreenSuccessMessage(sessionMessageRef.current)

          zoomFaceMapResultCallback.retry()
          return
        }
      }

      zoomFaceMapResultCallback.cancel(sessionMessageRef.current)
      onError(exception)
    }
  }, [onError])

  const zoomProcessor = useMemo(
    () => ({
      processZoomSessionResultWhileZoomWaits(zoomSessionResult, zoomFaceMapResultCallback) {
        const { status, faceMetrics } = zoomSessionResult
        const { faceMap } = faceMetrics

        sessionResultRef.current = zoomSessionResult
        resultCallbackRef.current = zoomFaceMapResultCallback

        if (status !== ZoomSessionStatus.SessionCompletedSuccessfully || !faceMap || !faceMap.size) {
          api.cancelInFlightRequests()
          zoomFaceMapResultCallback.cancel()
          return
        }

        performVerification()
      },
    }),
    [performVerification]
  )

  const startVerification = useCallback(() => {
    if (sessionRef.current) {
      return
    }

    sessionRef.current = new ZoomSession(handleCompletion, zoomProcessor)
  }, [zoomProcessor, handleCompletion])

  return {
    startVerification,
    ...sessionState,
  }
}
