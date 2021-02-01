import Config from '../../../../config/config'
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

  /**
   * Convenience method to initialize the FaceTec SDK.
   */
  async initialize() {
    const { faceTecLicenseKey, faceTecLicenseText, faceTecEncryptionKey } = Config

    if (!this.faceTecSDKInitializing) {
      // if not initializing - calling initialize sdk
      this.faceTecSDKInitializing = FaceTecSDK.initialize(
        faceTecLicenseKey,
        faceTecEncryptionKey,
        faceTecLicenseText,
      ).finally(() => (this.faceTecSDKInitializing = null))
    }

    // awaiting previous or current initialize call
    await this.faceTecSDKInitializing
  },
}

export default FaceTecGlobalState
