import DirectNativeSDK from 'torus-direct-react-native-sdk' // eslint-disable-line import/no-unresolved

class Torus {
  constructor(Config, options) {
    const { publicUrl } = Config

    const redirectUri = 'gooddollar://org.gooddollar/redirect'
    const browserRedirectUri = `${publicUrl || 'https://dev.gooddollar.org'}/torus/scripts.html`

    this.options = { ...options, redirectUri, browserRedirectUri }
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
