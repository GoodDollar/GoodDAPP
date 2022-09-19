// @flow
import API, { getErrorMessage } from '../../../../lib/API'
import LoginService from '../../../../lib/login/LoginService'

import logger from '../../../../lib/logger/js-logger'

import type { Credentials } from '../../../../lib/API'

const log = logger.child({ from: 'FVFlowService' })

class FVFlowService extends LoginService {
  constructor(signature, nonce, fvsig, account) {
    super()

    this.signature = signature
    this.nonce = nonce
    this.fvsig = fvsig
    this.account = account
  }

  // eslint-disable-next-line require-await
  async login(): Promise<Credentials> {
    const creds = {
      signature: this.signature,
      nonce: this.nonce,
      fvsig: this.fvsig,
      account: this.account,
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
        const response = await API.fvAuth(creds)
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

export default FVFlowService
