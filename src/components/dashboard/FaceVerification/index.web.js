import { useCallback } from "react";
import { noop } from 'lodash';

import useZoomSDK from './hooks/useZoomSDK';
import useZoomVerification from './hooks/useZoomVerification';

const FaceVerification = ({ onSuccess = noop, onError = noop }) => {
  const completionHandler = useCallback((isSuccess, lastResult) => {
    if (isSuccess) {
      onSuccess(lastResult);
    }
  }, [onSuccess]);

  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
    onError
  });

  useZoomSDK({
    onInitialized: startVerification,
    onError
  });

  return null;
}

export default FaceVerification;
