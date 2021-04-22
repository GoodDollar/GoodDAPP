import DirectNativeSDK from '@toruslabs/torus-direct-react-native-sdk'
import { defaults } from 'lodash'

class Torus {
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
    return DirectNativeSDK.triggerLogin(loginOptions)
  }

  // eslint-disable-next-line require-await
  async triggerAggregateLogin(loginOptions) {
    return DirectNativeSDK.triggerAggregateLogin(loginOptions)
  }
}

export default Torus
