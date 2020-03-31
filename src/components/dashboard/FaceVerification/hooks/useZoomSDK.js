import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'

const sdk = ZoomAuthentication.ZoomSDK

const {
  ZoomSDKStatus,
  getFriendlyDescriptionForZoomSDKStatus
} = sdk;

export default ({ onInitialized = noop, onError = noop }) => {
  const [isInitialized, setInitialized] = useState(false)
  const [initError, setInitError] = useState(null)
  const onInitializedRef = useRef(onInitialized)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    const handleException = exception => {
      setInitError(exception)
      onErrorRef.current(exception)
    }

    // Set a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory('/zoom/resources')

    // Set the directory path for required ZoOm images.
    sdk.setImagesDirectory('/zoom/images')

    // Initialize ZoOm and configure the UI features.

    try {
      sdk.initialize(Config.zoomLicenseKey, () => {
        const sdkStatus = sdk.getStatus()
        const sdkInitialized = ZoomSDKStatus.Initialized === sdkStatus

        if (!sdkInitialized) {
          const exception = new Error(getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

          exception.code = sdkStatus
          handleException(exception)
          return
        }

        setInitialized(sdkInitialized)
        onInitializedRef.current()
      })
    } catch (exception) {
      handleException(exception)
    }
  }, [])

  return {
    sdk,
    isInitialized,
    initError,
  }
}
