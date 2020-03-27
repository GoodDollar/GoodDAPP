import { useCallback } from "react";
import { noop } from 'lodash';

import useZoomSDK from './hooks/useZoomSDK';
import useZoomVerification from './hooks/useZoomVerification';

const FaceVerification = ({ screenProps, onError = noop }) => {
  const completionHandler = useCallback(isSuccess => {
    if (isSuccess) {
      screenProps.pop({ isValid: true })
    }
  }, [onSuccess, screenProps]);

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
