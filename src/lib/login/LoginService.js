// @flow
import * as jsonwebtoken from 'jsonwebtoken'
import { assign } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import API, { type Credentials, throwException } from '../API'
import { CREDS, JWT } from '../constants/localStorage'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'LoginService' })
const EMPTY_TOKEN = { jwt: null, decoded: null }

class LoginService {
  static toSign = 'Login to GoodDAPP'

  jwt: ?string

  constructor() {
    this.getJWT().then(jwt => assign(this, { jwt }))
  }

  // eslint-disable-next-line require-await
  async storeCredentials(creds: Credentials) {
    if (!creds) {
      return
    }

    return AsyncStorage.setItem(CREDS, creds)
  }

  storeJWT(jwt: string) {
    this.jwt = jwt

    if (jwt) {
      //prettier-ignore
      AsyncStorage
        .setItem(JWT, jwt)
        .catch(e => log.error('Failed to store JWT to AsyncStorage', e.message, e, { jwt }))
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
      //prettier-ignore
      AsyncStorage
        .setItem(JWT, null)
        .catch(e => log.error('Failed to clear JWT in the AsyncStorage', e.message, e))
    }

    const creds = await this.requestCredsAndJWT(refresh)
    const { jwt } = creds

    this.storeJWT(jwt)
    await API.init(jwt)

    return creds
  }

  async requestJWT(creds: Credentials): Promise<?Credentials | Error> {
    try {
      let { jwt } = await this.validateJWTExistenceAndExpiration()

      log.debug('jwt validation result:', { jwt })

      if (!jwt) {
        log.info('Calling server for authentication')

        const response = await API.auth(creds).catch(throwException)
        const { status, data, statusText } = response

        log.info('Got auth response', response)

        if (200 !== status) {
          throw new Error(statusText)
        }

        log.debug('Login success:', data)
        jwt = data.token
      }

      return { ...creds, jwt }
    } catch (exception) {
      const { message } = exception

      log.error('Login service auth failed:', message, exception)
      throw exception
    }
  }

  async requestCredsAndJWT(refresh = false): Promise<Credentials> {
    let creds = !refresh && (await this.getCredentials())

    if (!creds) {
      log.info('Generating creds because no creds was stored or we got an error reading AsyncStorage')

      creds = await this.login()
    }

    this.storeCredentials(creds)
    log.info('signed message', creds)

    // TODO: use date as nonce and validate on backend
    return this.requestJWT(creds)
  }

  async validateJWTExistenceAndExpiration(): Promise<string | null> {
    const jwt = await this.getJWT()

    if (!jwt) {
      log.debug('no JWT found', EMPTY_TOKEN)
      return EMPTY_TOKEN
    }

    const decoded = jsonwebtoken.decode(jwt, { json: true })
    const token = { jwt, decoded }
    const { exp, aud } = decoded || {}

    log.debug('JWT found, validating', token)

    // new format of jwt should contain aud, used with realmdb
    if (!aud) {
      token.jwt = null
      log.debug('JWT have old format', token)

      return token
    }

    if (!exp || Date.now() >= exp * 1000) {
      log.debug('JWT has been expired', EMPTY_TOKEN)
      return EMPTY_TOKEN
    }

    return token
  }
}

export default LoginService
