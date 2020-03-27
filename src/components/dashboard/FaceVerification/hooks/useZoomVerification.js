import { useState, useRef, useCallback, useMemo } from "react";
import { noop, first } from 'lodash';

import api from '../api';
import { FaceVerificationProviders } from '../api/typings';
import ZoomAuthentication from "../../../../lib/zoom/ZoomAuthentication";

const {
  ZoomSession,
  ZoomCustomization,
  ZoomSessionStatus,
  createZoomAPIUserAgentString
} = ZoomAuthentication.ZoomSDK;

const getFaceMapBase64 = async faceMetrics => new Promise(
  (resolve, reject) => faceMetrics.getFaceMapBase64(faceMap =>
    faceMap ? resolve(faceMap)
      : reject(new Error("Error generating FaceMap !"))
  )
)

const initialSessionState = {
  isComplete: false,
  isSuccess: false,
  lastResult: null
};

export default ({ onComplete = noop, onError = noop }) => {
  const sessionRef = useRef(null);
  const sessionResultRef = useRef(null);
  const sessionSuccessRef = useRef(false);
  const resultCallbackRef = useRef(null);

  const [sessionState, setSessionState] = useState(initialSessionState);

  const handleCompletion = useCallback(() => {
    const isSuccess = sessionSuccessRef.current;
    const lastResult = sessionResultRef.current;

    sessionRef.current = null;

    setSessionState({ isComplete: true, isSuccess, lastResult });
    onComplete(isSuccess, lastResult);
  }, [onComplete, setSessionState]);

  const performVerification = useCallback(async () => {
    const zoomSessionResult = sessionResultRef.current;
    const zoomFaceMapResultCallback = resultCallbackRef.current;

    const { faceMetrics, sessionId } = zoomSessionResult;
    const captured = faceMetrics.lowQualityAuditTrailCompressedBase64();
    const capturedHD = faceMetrics.getAuditTrailBase64JPG();

    try {
      const faceMap = await getFaceMapBase64(faceMetrics);
      const payload = {
        sessionId,
        faceMap,
        lowQualityAuditTrailImage: first(captured),
        auditTrailImage: first(capturedHD),
        userAgent: createZoomAPIUserAgentString(sessionId)
      };

      const response = await api.performFaceVerification(
        payload, ({ loaded, total }) => {
          zoomFaceMapResultCallback.uploadProgress(loaded / total)
        }
      );

      ZoomCustomization.setOverrideResultScreenSuccessMessage(
        response.enrollmentResult.message
      );

      sessionSuccessRef.current = true;
      zoomFaceMapResultCallback.succeed();
    } catch (exception) {
      const { message, response } = exception;
      let errorMessage = message;

      if (response) {
        const {
          code, subCode,
          message: zoomMessage
        } = response.enrollmentResult || {}

        errorMessage = zoomMessage;

        if ((200 === code) || ('nameCollision' === subCode)) {
          ZoomCustomization.setOverrideResultScreenSuccessMessage(
            errorMessage
          );

          zoomFaceMapResultCallback.retry();
          return;
        }
      }

      zoomFaceMapResultCallback.cancel(errorMessage);
      onError(exception);
    }
  }, [onError]);

  const zoomProcessor = useMemo(() => ({
    processZoomSessionResultWhileZoomWaits(zoomSessionResult, zoomFaceMapResultCallback) {
      const { status, faceMetrics } = zoomSessionResult;
      const { faceMap } = faceMetrics;

      sessionResultRef.current = zoomSessionResult;
      resultCallbackRef.current = zoomFaceMapResultCallback;

      if (status !== ZoomSessionStatus.SessionCompletedSuccessfully || !faceMap || !faceMap.size) {
        api.cancelInFlightRequests();
        zoomFaceMapResultCallback.cancel();
        return;
      }

      performVerification();
    }
  }), [performVerification]);

  const startVerification = useCallback(() => {
    if (sessionRef.current) {
      return;
    }

    sessionRef.current = new ZoomSession(handleCompletion, zoomProcessor);
  }, [zoomProcessor, handleCompletion]);

  return {
    startVerification,
    ...sessionState
  };
}
