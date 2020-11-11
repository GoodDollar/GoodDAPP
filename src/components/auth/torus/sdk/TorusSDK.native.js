import DirectNativeSDK from 'torus-direct-react-native-sdk'

import AbstractTorusSDK from './AbstractTorusSDK'

class TorusSDK extends AbstractTorusSDK {
  static factory() {
    return AbstractTorusSDK.factory(TorusSDK)
  }

  constructor(config, logger) {
    super(config, logger)

    this.torus = DirectNativeSDK
  }

  // eslint-disable-next-line require-await
  async initialize() {
    const { env, publicUrl, googleClientId, facebookAppId, torusProxyContract, torusNetwork } = this.config
    const { torus } = this

    return torus.init({
      GOOGLE_CLIENT_ID: googleClientId,
      FACEBOOK_CLIENT_ID: facebookAppId,
      proxyContractAddress: torusProxyContract, // details for test net
      network: torusNetwork, // details for test net
      baseUrl: `${publicUrl}/torus/`,
      enableLogging: env === 'development',
      redirectUri: 'gooddollar://org.gooddollar/redirect',
    })
  }
}

export default TorusSDK.factory()
