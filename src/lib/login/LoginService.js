// @flow
import type { Credentials } from '../API/api'
import API from '../API/api'
import { CREDS, JWT } from '../constants/localStorage'
import AsyncStorage from '../../lib/utils/asyncStorage'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'LoginService' })

class LoginService {
  static toSign = 'Login to GoodDAPP'

  jwt: ?string

  toSign: string = 'Login to GoodDAPP'

  constructor() {
    this.getJWT().then(jwt => (this.jwt = jwt))
  }

  storeCredentials(creds: Credentials) {
    if (!creds) {
      return
    }
    AsyncStorage.setItem(CREDS, creds)
  }

  // eslint-disable-next-line class-methods-use-this
  storeJWT(jwt: string) {
    this.jwt = jwt
    if (jwt) {
      AsyncStorage.setItem(JWT, jwt)
    }
  }

  async getCredentials(): Promise<?Credentials> {
    const data = await AsyncStorage.getItem(CREDS)
    return data ? data : null
  }

  // eslint-disable-next-line class-methods-use-this
  getJWT(): Promise<?string> {
    return AsyncStorage.getItem(JWT)
  }

  // eslint-disable-next-line class-methods-use-this
  login(): Promise<Credentials> {
    throw new Error('Method not implemented')
  }

  async auth(): Promise<?Credentials | Error> {
    let creds = await this.getCredentials()

    if (!creds) {
      creds = await this.login()
    }

    log.info('signed message', creds)
    this.storeCredentials(creds)

    // TODO: write the nonce https://gitlab.com/gooddollar/gooddapp/issues/1
    creds = await this.requestJWT(creds)

    this.storeJWT(creds.jwt)
    API.init()

    return creds
  }

  async requestJWT(creds: Credentials): Promise<?Credentials | Error> {
    log.info('Calling server for authentication')

    try {
      const response = await API.auth(creds)
      const { status, data, statusText } = response

      log.info('Got auth response', response)

      if (200 !== status) {
        throw new Error(statusText)
      }

      log.debug('Login success:', data)
      return { ...creds, jwt: data.token }
    } catch (exception) {
      const { message } = exception

      log.error('Login service auth failed:', message, exception)
      throw exception
    }
  }
}

export default LoginService
