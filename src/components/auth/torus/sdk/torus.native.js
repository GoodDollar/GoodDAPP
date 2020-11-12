import DirectNativeSDK from 'torus-direct-react-native-sdk' // eslint-disable-line import/no-unresolved

class Torus {
  constructor(Config, options) {
    const redirectUri = 'gooddollar://org.gooddollar/redirect'

    this.options = { ...options, redirectUri }
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
