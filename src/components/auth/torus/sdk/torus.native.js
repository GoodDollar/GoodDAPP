import DirectNativeSDK from '@toruslabs/torus-direct-react-native-sdk'
import { defaults, get } from 'lodash'
import { noop } from 'rxjs'

import { isAndroidNative } from '../../../../lib/utils/platform'

class Torus {
  clearLoginDetails = noop

  constructor(Config, options) {
    const { publicUrl } = Config
    const redirectUri = 'gooddollar://org.gooddollar/redirect'
    const browserRedirectUri = `${publicUrl}/torus/scripts.html`

    this.options = defaults({}, options, { redirectUri, browserRedirectUri })
  }

  // eslint-disable-next-line require-await
  async init() {
    const { options } = this

    return DirectNativeSDK.init(options)
  }

  // eslint-disable-next-line require-await
  async triggerLogin(loginOptions) {
    const options = this._configureLogin(loginOptions)

    return DirectNativeSDK.triggerLogin(options)
  }

  // eslint-disable-next-line require-await
  async triggerAggregateLogin(loginOptions) {
    const subOptions = get(loginOptions, 'subVerifierDetailsArray', [])
    const subVerifierDetailsArray = subOptions.map(this._configureLogin)
    const options = { ...loginOptions, subVerifierDetailsArray }

    return DirectNativeSDK.triggerAggregateLogin(options)
  }

  _configureLogin(loginOptions) {
    if (!isAndroidNative) {
      return loginOptions
    }

    return {
      ...loginOptions,
      preferCustomTabs: true,
      allowedBrowsers: ['com.android.chrome', 'com.google.android.apps.chrome', 'com.android.chrome.beta'],
    }
  }
}

export default Torus
