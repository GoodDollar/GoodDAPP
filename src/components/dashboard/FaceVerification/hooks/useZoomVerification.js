import { useState, useRef, useCallback, useMemo } from "react";
import { noop, first } from 'lodash';

import api from '../api';
import { FaceVerificationProviders } from '../api/typings';
import ZoomAuthentication from "../../../../lib/zoom/ZoomAuthentication";

const sdk = ZoomAuthentication.ZoomSDK;
const { ZoomSessionStatus, ZoomSession, ZoomCustomization } = sdk;

const getFaceMapBase64 = async faceMetrics => new Promise(
  (resolve, reject) => faceMetrics.getFaceMapBase64(faceMap =>
    faceMap ? resolve(faceMetrics)
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
        auditTrailImage: first(capturedHD)
      };

      await api.performFaceVerification(payload, FaceVerificationProviders.Zoom);
      ZoomCustomization.setOverrideResultScreenSuccessMessage(
        "Face Recognition finished successfull"
      );

      sessionSuccessRef.current = true;
      zoomFaceMapResultCallback.succeed();
    } catch (exception) {
      const { message, response } = exception;

      //TODO: analyze exception
      // if we have some response with explanations
      // what went wrong (e.g. Brightness etc)
      // display corresponding message and retry
      if (response) {
        ZoomCustomization.setOverrideResultScreenSuccessMessage(
          message
        );

        zoomFaceMapResultCallback.retry();
        return
      }

      zoomFaceMapResultCallback.cancel(message);
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
