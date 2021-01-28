import Config from '../../../../config/config'
import { FaceTecSDK } from './FaceTecSDK'

// Zoom global state object
// Like in the Zoom's demo app it contains also
// initialization function with options preconfigured
const FaceTecGlobalState = {
  /**
   * @var {Promise|null}
   */
  faceTecSDKPreloading: null,

  /**
   * @var {Error|null}
   */
  faceTecCriticalError: null,

  /**
   * Convenience method to initialize the FaceTec SDK.
   */
  async initialize() {
    const { faceTecLicenseKey, faceTecLicenseText, faceTecEncryptionKey } = Config

    await FaceTecSDK.initialize(faceTecLicenseKey, faceTecEncryptionKey, faceTecLicenseText)
  },
}

export default FaceTecGlobalState
