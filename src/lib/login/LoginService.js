// @flow
import { AsyncStorage } from 'react-native'
import { isError } from 'lodash'
import type { Credentials } from '../API/api'
import API from '../API/api'
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

    return AsyncStorage.setItem(CREDS, JSON.stringify(creds))
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

      return JSON.parse(data)
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

  async auth(): Promise<?Credentials | Error> {
    let creds = await this.getCredentials()

    if (!creds) {
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
      const response = await API.auth(creds)
      const { status, data, statusText } = response

      log.info('Got auth response', response)

      if (200 !== status) {
        throw new Error(statusText)
      }

      log.debug('Login success:', data)
      return { ...creds, jwt: data.token }
    } catch (exception) {
      let error = exception
      let { message } = exception

      // if the json or string http body was thrown from axios (error
      // interceptor in api.js doest that in almost cases) then we're wrapping
      // it onto Error object to keep correct stack trace for Sentry reporting
      if (!isError(exception)) {
        message = exception.error || exception
        error = new Error(exception)
      }

      log.error('Login service auth failed:', message, error)
      throw exception
    }
  }
}

export default LoginService
