import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import useMountedState from '../../../../lib/hooks/useMountedState'

// Zoom SDK reference
const sdk = global.ZoomAuthentication.ZoomSDK

export const {
  // SDK initialization status codes enum
  ZoomSDKStatus,

  // Helper function, returns full description
  // for SDK initialization status specified
  getFriendlyDescriptionForZoomSDKStatus,
} = sdk

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {object} result Public hook API
 * @property {typeof ZoomSDK} result.sdk - ZoomSDK reference
 * @property {boolean} result.isInitialized - Initialization state flag
 * @property {Error | null} result.initError - Initialization error (if happened)
 */
export default ({ onInitialized = noop, onError = noop }) => {
  // Initialization state flag
  const [isInitialized, setInitialized] = useState(false)

  // Initialization error state variable
  const [initError, setInitError] = useState(null)

  // Component mounted flag ref, it needs to check
  // is component still mounted before update it's state
  // This check is needed as onInitialized/onError could
  // perform redirects which unmounts component
  const mountedStateRef = useMountedState()

  // Configuration callbacks refs
  const onInitializedRef = useRef(null)
  const onErrorRef = useRef(null)

  // updating callbacks references on config changes
  useEffect(() => {
    onInitializedRef.current = onInitialized
    onErrorRef.current = onError
  }, [onInitialized, onError])

  // performing initialization attempt on component mounted
  // this callback should be ran once, so we're using refs
  // to access actual initialization / error callbacks
  useEffect(() => {
    // current ZoomSDK initialization status code
    let sdkStatus = sdk.getStatus()

    // Helper for handle exceptions
    const handleException = exception => {
      // executing current onError callback
      onErrorRef.current(exception)

      // if component is still mounted -
      if (mountedStateRef.current) {
        // updating initError state variable
        setInitError(exception)
      }
    }

    // Helper for handle SDK status code changes
    const handleSdkStatus = () => {
      // Checking is ZoomSDK successfullt initialized
      const sdkInitialized = ZoomSDKStatus.Initialized === sdkStatus

      // if not initialized - throwing an Error
      if (!sdkInitialized) {
        // retrieving full description from status code
        const exception = new Error(getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

        // adding status code as error's object property
        exception.code = sdkStatus

        // handling an error
        handleException(exception)
        return
      }

      // otherwise - executing onInitialized callback
      onInitializedRef.current()

      // and updating isInitialized state flag
      // (if component is still mounted)
      if (mountedStateRef.current) {
        setInitialized(sdkInitialized)
      }
    }

    // checking the last retrieved status code
    // if Zoom was initialized successfully,
    // then just handling status & executing
    // onInitialized callback
    if (ZoomSDKStatus.Initialized === sdkStatus) {
      handleSdkStatus()
      return
    }

    // otherwise, performing initialization:

    // 1. setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory('/zoom/resources')

    // 2. setting the directory path for required ZoOm images.
    sdk.setImagesDirectory('/zoom/images')

    try {
      // 3. initializing ZoOm and configuring the UI features.
      sdk.initialize(Config.zoomLicenseKey, () => {
        // updating & handling ZoomSDK status code
        sdkStatus = sdk.getStatus()
        handleSdkStatus()
      })
    } catch (exception) {
      // handling initialization exceptions
      // (some of them could be thrown during initialize() call)
      handleException(exception)
    }
  }, [])

  // exposing public hook API
  return {
    sdk,
    isInitialized,
    initError,
  }
}
