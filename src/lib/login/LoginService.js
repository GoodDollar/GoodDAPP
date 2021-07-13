// @flow
import * as jsonwebtoken from 'jsonwebtoken'
import AsyncStorage from '../utils/asyncStorage'
import type { Credentials } from '../API/api'
import API, { getErrorMessage } from '../API/api'
import { CREDS, JWT } from '../constants/localStorage'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'LoginService' })

class LoginService {
  static toSign = 'Login to GoodDAPP'

  jwt: ?string

  constructor() {
    this.getJWT().then(jwt => (this.jwt = jwt))
  }

  // eslint-disable-next-line require-await
  async storeCredentials(creds: Credentials) {
    if (!creds) {
      return
    }

    return AsyncStorage.setItem(CREDS, creds)
  }

  // eslint-disable-next-line class-methods-use-this
  storeJWT(jwt: string) {
    this.jwt = jwt
    if (jwt) {
      AsyncStorage.setItem(JWT, jwt)
    }
  }

  async getCredentials(): Promise<?Credentials> {
    try {
      const data = await AsyncStorage.getItem(CREDS)

      if (!data) {
        throw new Error('No credentials was stored in the AsyncStorage')
      }

      return data
    } catch (exception) {
      const { message } = exception

      log.warn('Error fetching creds:', message, exception)
      return null
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getJWT(): Promise<?string> {
    return AsyncStorage.getItem(JWT)
  }

  // eslint-disable-next-line class-methods-use-this
  login(): Promise<Credentials> {
    throw new Error('Method not implemented')
  }

  async auth(refresh = false): Promise<?Credentials | Error> {
    if (refresh) {
      AsyncStorage.setItem(JWT, null)
    }

    let creds = await this.getCredentials()

    if (!creds) {
      log.info('Generating creds because no creds was stored or we got an error reading AsyncStorage')

      creds = await this.login()
    }

    this.storeCredentials(creds)
    log.info('signed message', creds)

    // TODO: write the nonce https://gitlab.com/gooddollar/gooddapp/issues/1
    creds = await this.requestJWT(creds)

    this.storeJWT(creds.jwt)
    API.init()

    return creds
  }

  async requestJWT(creds: Credentials): Promise<?Credentials | Error> {
    log.info('Calling server for authentication')

    try {
      let jwt = await this.validateJWTExistenceAndExpiration()
      if (!jwt) {
        const response = await API.auth(creds)
        const { status, data, statusText } = response

        log.info('Got auth response', response)

        if (200 !== status) {
          throw new Error(statusText)
        }

        log.debug('Login success:', data)
        jwt = data.token
      }
      return { ...creds, jwt }
    } catch (e) {
      const message = getErrorMessage(e)
      const exception = new Error(message)

      log.error('Login service auth failed:', message, exception)

      throw exception
    }
  }

  async validateJWTExistenceAndExpiration(): Promise<string | null> {
    const jwt = await this.getJWT()
    if (jwt) {
      const decoded = jsonwebtoken.decode(jwt, { json: true })

      if (decoded.exp && Date.now() < decoded.exp * 1000) {
        return jwt
      }
    }
    return null
  }
}

export default LoginService
