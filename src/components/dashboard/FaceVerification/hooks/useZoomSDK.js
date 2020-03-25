import { useEffect, useState, useRef } from "react";
import { noop } from 'lodash';

import Config from "../../../../config/config";
import ZoomAuthentication from "../../../../lib/zoom/ZoomAuthentication";

const sdk = ZoomAuthentication.ZoomSDK;

export default ({ onInitialized = noop, onError = noop }) => {
  const [isInitialized, setInitialized] = useState(false);
  const onInitializedRef = useRef(onInitialized);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    // Set a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory("../zoom/resources");
    // Set the directory path for required ZoOm images.
    sdk.setImagesDirectory("../zoom/images");
    // Initialize ZoOm and configure the UI features.
    sdk.initialize(Config.zoomLicenseKey, () => {
      const sdkStatus = sdk.getStatus();
      const sdkInitialized = sdk.ZoomSDKStatus.Initialized === sdkStatus;

      setInitialized(sdkInitialized);

      if (!sdkInitialized) {
        const exception = new Error(sdk
          .getFriendlyDescriptionForZoomSDKStatus(sdkStatus)
        );

        exception.code = sdkStatus;
        onErrorRef.current(exception);
        return;
      }

      onInitializedRef.current();
    });
  }, []);

  return [sdk, isInitialized];
}
