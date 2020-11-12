import DirectNativeSDK from 'torus-direct-react-native-sdk' // eslint-disable-line import/no-unresolved
import { omit } from 'lodash'

class Torus {
  constructor(options) {
    // as i remember baseUrl is web only - please re-check this
    this.options = omit(options, 'baseUrl')
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
}

export default Torus
