import DirectWebSDK from '@toruslabs/torus-direct-web-sdk'

export default class extends DirectWebSDK {
  // overriding getTorusKey to return FB accessToken
  async getTorusKey(verifier, verifierId, verifierParams, idToken) {
    const torusKey = await super.getTorusKey(verifier, verifierId, verifierParams, idToken)

    if (verifier.includes('facebook')) {
      return {
        ...torusKey,
        accessToken: idToken,
      }
    }

    return torusKey
  }
}
