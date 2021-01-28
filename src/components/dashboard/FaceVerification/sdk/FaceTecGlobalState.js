import Config from '../../../../config/config'
import { FaceTecSDK } from './FaceTecSDK'

const FaceTecGlobalState = {
  faceTecSDKPreloaded: false,
  faceTecSDKPreloading: null,
  faceTecCriticalError: null,

  async initialize() {
    const { faceTecLicenseKey, faceTecLicenseText, faceTecEncryptionKey } = Config

    await FaceTecSDK.initialize(faceTecLicenseKey, faceTecEncryptionKey, faceTecLicenseText)
  },
}

export default FaceTecGlobalState
