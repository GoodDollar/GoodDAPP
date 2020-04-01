import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import useMountedState from '../../../../lib/hooks/useMountedState'

const sdk = ZoomAuthentication.ZoomSDK

const {
  ZoomSDKStatus,
  getFriendlyDescriptionForZoomSDKStatus
} = sdk;

export default ({ onInitialized = noop, onError = noop }) => {
  const [isInitialized, setInitialized] = useState(false)
  const [initError, setInitError] = useState(null)
  const mountedStateRef = useMountedState()
  const onInitializedRef = useRef(onInitialized)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    let sdkStatus = sdk.getStatus()

    const handleException = exception => {
      onErrorRef.current(exception)

      if (mountedStateRef.current) {
        setInitError(exception)
      }
    }

    const handleSdkStatus = () => {
      const sdkInitialized = ZoomSDKStatus.Initialized === sdkStatus

      if (!sdkInitialized) {
        const exception = new Error(getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

        exception.code = sdkStatus
        handleException(exception)
        return
      }

      onInitializedRef.current()
      setInitialized(sdkInitialized)
    }

    if (ZoomSDKStatus.NeverInitialized !== sdkStatus) {
      handleSdkStatus()
      return
    }

    // Set a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory('/zoom/resources')

    // Set the directory path for required ZoOm images.
    sdk.setImagesDirectory('/zoom/images')

    // Initialize ZoOm and configure the UI features.

    try {
      sdk.initialize(Config.zoomLicenseKey, () => {
        sdkStatus = sdk.getStatus()
        handleSdkStatus()
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
