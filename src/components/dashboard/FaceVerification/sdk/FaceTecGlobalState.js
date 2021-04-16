import { Platform } from 'react-native'

import Config from '../../../../config/config'
import faceVerificationApi from '../api/FaceVerificationApi'
import { FaceTecSDK } from './FaceTecSDK'

// Zoom global state object
// Like in the Zoom's demo app it contains also
// initialization function with options preconfigured
const FaceTecGlobalState = {
  /**
   * @var {Error|null}
   */
  faceTecCriticalError: null,
  faceTecSDKInitializing: null,
  faceTecLicense: null,

  /**
   * Convenience method to initialize the FaceTec SDK.
   */
  async initialize() {
    const { faceTecLicenseKey, faceTecEncryptionKey, env } = Config
    const platform = Platform.select({ web: Platform.OS, default: 'native' })

    const obtainLicense = async () => {
      // if env is prod and no license set - obtain it from the server
      if (env === 'production' && !this.faceTecLicense) {
        this.faceTecLicense = await faceVerificationApi.getLicense(platform)
      }

      // for dev / qa it will return the default value (null)
      return this.faceTecLicense
    }

    if (!this.faceTecSDKInitializing) {
      // if not initializing - calling initialize sdk
      this.faceTecSDKInitializing = obtainLicense()
        .then(license => FaceTecSDK.initialize(faceTecLicenseKey, faceTecEncryptionKey, license))
        .finally(() => (this.faceTecSDKInitializing = null))
    }

    // awaiting previous or current initialize call
    await this.faceTecSDKInitializing
  },
}

export default FaceTecGlobalState
