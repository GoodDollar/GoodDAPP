import { Platform } from 'react-native'
import { replace } from 'lodash'

const jwtParams = Platform.select({
  default: {},
  ios: {
    prompt: 'login',
  },
})

/* eslint-disable require-await */
export const LoginStrategy = {
  Facebook: 'facebook',
  GoogleLegacy: 'google-old',
  Google: 'google',
  Auth0: 'auth0',
  PaswordlessEmail: 'auth0-pwdless-email',
  PaswordlessSMS: 'auth0-pwdless-sms',
  getTestId(strategy) {
    switch (strategy) {
      case this.Facebook:
        return 'login_with_facebook'
      case this.Google:
      case this.GoogleLegacy:
        return 'login_with_google'
      case this.PaswordlessEmail:
        return 'Passwordless Email'
      case this.PaswordlessSMS:
        return 'login_with_auth0'
      default:
        return strategy || 'login_with_auth0'
    }
  },
  getTitle(strategy) {
    switch (strategy) {
      case this.Facebook:
        return 'Facebook'
      case this.Google:
        return 'google'
      case this.GoogleLegacy:
        return 'Google (Legacy)'
      case this.PaswordlessEmail:
        return 'Passwordless Email'
      case this.PaswordlessSMS:
        return 'Passwordless SMS'
      default:
        return strategy || 'Self Custody'
    }
  },
}

class AbstractLoginStrategy {
  constructor(torus, config) {
    this.torus = torus
    this.config = config
  }

  async triggerLogin() {
    throw new Error('Trying to call abstract method AbstractLoginStrategy::triggerLogin()')
  }
}

class AbstractAuth0Strategy extends AbstractLoginStrategy {
  get auth0ServerUri() {
    const { auth0Domain } = this.config

    return Platform.select({
      web: auth0Domain,
      default: replace(auth0Domain, 'https://', ''),
    })
  }
}

export class FacebookStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { facebookAppId, torusFacebook } = config

    return torus.triggerLogin({
      typeOfLogin: 'facebook',
      verifier: torusFacebook,
      clientId: facebookAppId,
      jwtParams,
    })
  }
}

export class GoogleLegacyStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { googleClientId, torusGoogle } = config

    return torus.triggerLogin({
      typeOfLogin: 'google',
      verifier: torusGoogle,
      clientId: googleClientId,
      jwtParams,
    })
  }
}

export class GoogleStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { googleClientId, torusGoogleAuth0 } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: torusGoogleAuth0,
      subVerifierDetailsArray: [
        {
          clientId: googleClientId,
          typeOfLogin: 'google',

          // for mainnet torus uses a different verifier
          verifier: config.env === 'production' ? 'google' : 'google-shubs',
          jwtParams,
        },
      ],
    })
  }
}

export class Auth0Strategy extends AbstractAuth0Strategy {
  async triggerLogin() {
    const { torus, config, auth0ServerUri } = this
    const { auth0ClientId, torusGoogleAuth0 } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: torusGoogleAuth0,
      subVerifierDetailsArray: [
        {
          clientId: auth0ClientId,
          typeOfLogin: 'jwt',
          verifier: 'auth0',
          jwtParams: {
            connection: 'Username-Password-Authentication',
            domain: auth0ServerUri,
            ...jwtParams,
          },
        },
      ],
    })
  }
}

export class PaswordlessEmailStrategy extends AbstractAuth0Strategy {
  async triggerLogin() {
    const { torus, config, auth0ServerUri } = this
    const { auth0ClientId, torusGoogleAuth0 } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: torusGoogleAuth0,
      subVerifierDetailsArray: [
        {
          clientId: auth0ClientId,
          typeOfLogin: 'jwt',
          verifier: 'auth0',
          jwtParams: {
            connection: '',
            domain: auth0ServerUri,
            verifierIdField: 'name',
            ...jwtParams,
          },
        },
      ],
    })
  }
}

export class PaswordlessSMSStrategy extends AbstractAuth0Strategy {
  async triggerLogin() {
    const { torus, config, auth0ServerUri } = this
    const { auth0SMSClientId, torusAuth0SMS } = config

    return torus.triggerLogin({
      verifier: torusAuth0SMS,
      clientId: auth0SMSClientId,
      typeOfLogin: 'jwt',
      jwtParams: {
        connection: '',
        domain: auth0ServerUri,
        verifierIdField: 'name',
        ...jwtParams,
      },
    })
  }
}
