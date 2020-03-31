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

const initialSessionState = {
  isComplete: false,
  isSuccess: false,
  lastResult: null,
  lastMessage: null,
}

export default ({ onComplete = noop, onError = noop }) => {
  const sessionRef = useRef(null)
  const [sessionState, setSessionState] = useState(initialSessionState)

  const startVerification = useCallback(() => {
    if (sessionRef.current) {
      return
    }

    let isSuccess = false
    let lastResult = null
    let lastMessage = null
    let resultCallback = null

    const handleCompletion = () => {
      const { status } = lastResult

      if (!lastMessage) {
        lastMessage = getFriendlyDescriptionForZoomSessionStatus(status)
      }

      sessionRef.current = null
      onComplete(isSuccess, lastResult, lastMessage)

      setSessionState({
        isComplete: true,
        isSuccess,
        lastResult,
        lastMessage,
      })
    }

    // eslint-disable-next-line require-await
    const getFaceMapBase64 = async () => new Promise((resolve, reject) => {
      const { faceMetrics } = lastResult

      faceMetrics.getFaceMapBase64(faceMap =>
        faceMap ? resolve(faceMap)
          : reject(new Error('Error generating FaceMap !'))
      )
    })

    const performVerification = async () => {
      const zoomSessionResult = lastResult
      const zoomFaceMapResultCallback = resultCallback

      const { faceMetrics, sessionId } = zoomSessionResult
      const captured = faceMetrics.lowQualityAuditTrailCompressedBase64()
      const capturedHD = faceMetrics.getAuditTrailBase64JPG()

      try {
        const faceMap = await getFaceMapBase64()
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

        isSuccess = true
        lastMessage = successMessage
        zoomFaceMapResultCallback.succeed()
      } catch (exception) {
        const { message, response } = exception

        lastMessage = message

        if (response) {
          const { code, subCode, message: zoomMessage } = response.enrollmentResult || {}

          lastMessage = zoomMessage

          if (200 === code || 'nameCollision' === subCode) {
            ZoomCustomization.setOverrideResultScreenSuccessMessage(lastMessage)

            zoomFaceMapResultCallback.retry()
            return
          }
        }

        zoomFaceMapResultCallback.cancel(lastMessage)
        onError(exception)
      }
    }

    const processZoomSessionResultWhileZoomWaits = (zoomSessionResult, zoomFaceMapResultCallback) => {
      const { status, faceMetrics } = zoomSessionResult
      const { faceMap } = faceMetrics

      lastResult = zoomSessionResult
      resultCallback = zoomFaceMapResultCallback

      if (status !== ZoomSessionStatus.SessionCompletedSuccessfully || !faceMap || !faceMap.size) {
        api.cancelInFlightRequests()
        zoomFaceMapResultCallback.cancel()
        return
      }

      performVerification()
    }

    sessionRef.current = new ZoomSession(
      handleCompletion, { processZoomSessionResultWhileZoomWaits }
    )
  }, [onComplete, onError, setSessionState])

  return {
    startVerification,
    ...sessionState,
  }
}
