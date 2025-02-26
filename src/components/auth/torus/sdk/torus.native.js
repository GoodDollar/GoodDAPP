import * as WebBrowser from '@toruslabs/react-native-web-browser'
import Web3Auth from '@web3auth/react-native-sdk'
import EncryptedStorage from 'react-native-encrypted-storage'

import { defaults } from 'lodash'

// import { isAndroidNative } from '../../../../lib/utils/platform'

class Torus {
  constructor(Config, options) {
    const { torusRedirectUrl } = Config
    const redirectUri = 'gooddollar://openlogin'
    const browserRedirectUri = `${torusRedirectUrl}/torus/scripts.html`

    this.options = defaults({}, options, { redirectUri, browserRedirectUri })
  }

  // eslint-disable-next-line require-await
  async init() {}

  // eslint-disable-next-line require-await
  async triggerLogin(loginOptions) {
    const { options } = this
    const loginConfig = {
      login: {
        verifierSubIdentifier: loginOptions.subVerifierDetailsArray[0].verifier,
        ...loginOptions.subVerifierDetailsArray[0],
        verifier: loginOptions.verifierIdentifier,
      },
    }

    console.log('Web3Auth Native:', {
      useCoreKitKey: true,
      enableLogging: true,
      redirectUrl: options.redirectUri,
      clientId: options.web3AuthClientId,
      network: options.network,
      loginConfig,
    })
    const web3Auth = new Web3Auth(WebBrowser, EncryptedStorage, {
      useCoreKitKey: true,
      enableLogging: true,
      redirectUrl: options.redirectUri,
      clientId: options.web3AuthClientId,
      network: options.network,
      loginConfig,
    })
    await web3Auth.init()
    await web3Auth.login({ loginProvider: 'login', mfaLevel: 'none' })
    console.log('Web3Auth Native result:', web3Auth.privKey, web3Auth.userInfo())
    return { finalKeyData: { privKey: web3Auth.privKey }, userInfo: web3Auth.userInfo() }
  }

  // eslint-disable-next-line require-await
  async triggerAggregateLogin(loginOptions) {
    return this.triggerLogin(loginOptions)
  }

  // _configureLogin(loginOptions) {
  //   if (!isAndroidNative) {
  //     return loginOptions
  //   }

  //   return {
  //     ...loginOptions,
  //     preferCustomTabs: true,
  //     allowedBrowsers: ['com.android.chrome', 'com.google.android.apps.chrome', 'com.android.chrome.beta'],
  //   }
  // }
}

export default Torus
