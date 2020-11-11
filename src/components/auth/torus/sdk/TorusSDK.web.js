import DirectWebSDK from '@toruslabs/torus-direct-web-sdk'

import AbstractTorusSDK from './AbstractTorusSDK'

class TorusSDK extends AbstractTorusSDK {
  static factory() {
    return AbstractTorusSDK.factory(TorusSDK)
  }

  constructor(config, logger) {
    super(config, logger)
    const { env, publicUrl, googleClientId, facebookAppId, torusProxyContract, torusNetwork } = config

    this.torus = new DirectWebSDK({
      GOOGLE_CLIENT_ID: googleClientId,
      FACEBOOK_CLIENT_ID: facebookAppId,
      proxyContractAddress: torusProxyContract, // details for test net
      network: torusNetwork, // details for test net
      baseUrl: `${publicUrl}/torus/`,
      enableLogging: env === 'development',
    })
  }

  // eslint-disable-next-line require-await
  async initialize() {
    const { torus } = this

    return torus.init()
  }
}

export default TorusSDK.factory()
