// @flow
import API, { getErrorMessage } from '../../../../lib/API'
import DeepLinking from '../../../../lib/utils/deepLinking'
import LoginService from '../../../../lib/login/LoginService'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'

import type { Credentials } from '../../../../lib/API'

const log = logger.child({ from: 'LoginFlowService' })

class LoginFlowService extends LoginService {
  constructor(signature, nonce, fvsig) {
    super()

    this.signature = signature
    this.nonce = nonce
    this.fvsig = fvsig
  }

  async login(): Promise<Credentials> {
    const creds = {
      signature: this.signature,
      nonce: this.nonce,
      fvsig: this.fvsig,
    }

    log.info('returning creds', { creds })
    return creds
  }

  async requestJWT(creds: Credentials): Promise<?Credentials | Error> {
    try {
      let { jwt } = await this.validateJWTExistenceAndExpiration()

      log.debug('jwt validation result:', { jwt })

      if (!jwt) {
        log.info('Calling server for authentication')
        const response = await API.fvauth(creds)
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
}

export default LoginFlowService
