/* eslint-disable require-await */

class AbstractLoginStrategy {
  constructor(torus, config) {
    this.torus = torus
    this.config = config
  }

  async triggerLogin() {
    throw new Error('Trying to call abstract method AbstractLoginStrategy::triggerLogin()')
  }
}

export class FacebookStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { facebookAppId } = config

    return torus.triggerLogin({
      typeOfLogin: 'facebook',
      verifier: 'facebook-gooddollar',
      clientId: facebookAppId,
    })
  }
}

export class GoogleLegacyStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { googleClientId } = config

    return torus.triggerLogin({
      typeOfLogin: 'google',
      verifier: 'google-gooddollar',
      clientId: googleClientId,
    })
  }
}

export class GoogleStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { googleClientId } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: 'google-auth0-gooddollar',
      subVerifierDetailsArray: [
        {
          clientId: googleClientId,
          typeOfLogin: 'google',
          verifier: 'google-shubs',
        },
      ],
    })
  }
}

export class Auth0Strategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { auth0Domain, auth0ClientId } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: 'google-auth0-gooddollar',
      subVerifierDetailsArray: [
        {
          clientId: auth0ClientId,
          typeOfLogin: 'jwt',
          verifier: 'auth0',
          jwtParams: {
            connection: 'Username-Password-Authentication',
            domain: auth0Domain,
          },
        },
      ],
    })
  }
}

export class PaswordlessEmailStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { auth0Domain, auth0ClientId } = config

    return torus.triggerAggregateLogin({
      aggregateVerifierType: 'single_id_verifier',
      verifierIdentifier: 'google-auth0-gooddollar',
      subVerifierDetailsArray: [
        {
          clientId: auth0ClientId,
          typeOfLogin: 'jwt',
          verifier: 'auth0',
          jwtParams: {
            connection: '',
            domain: auth0Domain,
            verifierIdField: 'name',
          },
        },
      ],
    })
  }
}

export class PaswordlessSMSStrategy extends AbstractLoginStrategy {
  async triggerLogin() {
    const { torus, config } = this
    const { auth0Domain, auth0SMSClientId } = config

    return torus.triggerLogin({
      verifier: 'gooddollar-auth0-sms-passwordless',
      clientId: auth0SMSClientId,
      typeOfLogin: 'jwt',
      jwtParams: {
        connection: '',
        domain: auth0Domain,
        verifierIdField: 'name',
      },
    })
  }
}
