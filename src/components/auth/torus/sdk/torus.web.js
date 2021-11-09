import DirectWebSDK, { clearLoginDetailsStorage } from '@toruslabs/torus-direct-web-sdk'
import { defaults, get } from 'lodash'

// should be non-arrow function to be invoked with new
class Torus extends DirectWebSDK {
  constructor(Config, options) {
    const { publicUrl } = Config
    const popupMode = options.uxMode === 'popup'
    const baseUrl = publicUrl + (popupMode ? '/torus' : '')
    const redirectPathName = popupMode ? 'redirect' : 'Welcome/Auth'

    // setting values for url & redirect if  aren't overridden
    // doing this separately as we need to determine uxMode firstly
    const torusOptions = defaults({}, options, { baseUrl, redirectPathName })

    // as i remember baseUrl is web only - please re-check this
    super(torusOptions)
  }

  getRedirectResult(options = null) {
    const resultOptions = {
      ...(options || {}),
      replaceUrl: false,
      clearLoginDetails: false,
    }

    return super.getRedirectResult(resultOptions)
  }

  clearLoginDetails(redirectResult) {
    const { instanceId } = get(redirectResult, 'state', {})
    const { redirectParamsStorageMethod } = this.config

    clearLoginDetailsStorage(redirectParamsStorageMethod, instanceId)
  }
}

export default Torus
