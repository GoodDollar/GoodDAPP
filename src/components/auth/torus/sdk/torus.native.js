import { NodeDetailManager } from '@toruslabs/fetch-node-details'
import { keccak256, Torus as TorusSDK } from '@toruslabs/torus.js'
import { defaults } from 'lodash'

class Torus {
  constructor(Config, options) {
    this.options = defaults({}, options)
    this.torusInstance = new TorusSDK({
      clientId: options.web3AuthClientId,
      enableOneKey: false,
      network: options.network,
      legacyMetadataHost: 'https://metadata.tor.us',
    })
  }

  async init() {}

  // eslint-disable-next-line require-await
  async triggerAggregateLogin(loginOptions) {
    const { options, torusInstance } = this

    const nodeDetailManagerInstance = new NodeDetailManager({
      network: options.network,
    })

    return async (idToken, userIdentifier) => {
      const verifier = loginOptions.verifierIdentifier || loginOptions.verifier
      const verifierParams = {
        verify_params: [{ verifier_id: userIdentifier, idtoken: idToken }],
        verifier_id: userIdentifier,
        sub_verifier_ids: [loginOptions.subVerifierDetailsArray[0].verifier],
      }

      // console.log('Web3Auth JS core connect:', { verifierParams, verifier })

      const { torusNodeEndpoints, torusIndexes } = await nodeDetailManagerInstance.getNodeDetails({
        verifier,
        verifierId: userIdentifier,
      })
      const hashedIdToken = keccak256(Buffer.from(idToken, 'utf8'))

      // console.log(
      //   'Web3Auth JS core retrieve:',
      //   JSON.stringify({
      //     endpoints: torusNodeEndpoints,
      //     indexes: torusIndexes,
      //     verifier,
      //     verifierParams,
      //     hashedIdToken,
      //   }),
      // )

      const torusKey = await torusInstance.retrieveShares(
        torusNodeEndpoints,
        torusIndexes,
        verifier,
        verifierParams,
        hashedIdToken.slice(2),
      )

      // console.log({ torusKey })
      return torusKey.finalKeyData
    }
  }

  // eslint-disable-next-line require-await
  async triggerLogin(loginOptions) {
    const { options, torusInstance } = this

    const nodeDetailManagerInstance = new NodeDetailManager({
      network: options.network,
    })

    return async (idToken, userIdentifier) => {
      const verifier = loginOptions.verifier
      const { torusNodeEndpoints, torusIndexes } = await nodeDetailManagerInstance.getNodeDetails({
        verifier,
        verifierId: userIdentifier,
      })

      // console.log(
      //   'Web3Auth JS core retrieve:',
      //   JSON.stringify({
      //     endpoints: torusNodeEndpoints,
      //     indexes: torusIndexes,
      //     verifier,
      //     verifierParams,
      //     hashedIdToken,
      //   }),
      // )

      const torusKey = await torusInstance.retrieveShares(
        torusNodeEndpoints,
        torusIndexes,
        verifier,
        { verifier_id: userIdentifier },
        idToken,
      )

      // console.log({ torusKey })
      return torusKey.finalKeyData
    }
  }
}

export default Torus
