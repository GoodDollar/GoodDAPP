import _get from 'lodash/get'
import logger from '../../../lib/logger/pino-logger'
import userStorage from '../../../lib/gundb/UserStorage'
import API from '../../../lib/API/api'

const log = logger.child({ from: 'getMarketToken' })
export default async (setLoginToken = () => {}) => {
  try {
    let token = await userStorage.getProfileFieldValue('marketToken')
    if (token) {
      setLoginToken(token)
    }

    const newtoken = await API.getMarketToken().then(_ => _get(_, 'data.jwt'))
    if (newtoken !== undefined && newtoken !== token) {
      token = newtoken
      userStorage.setProfileField('marketToken', newtoken)
      if (token == null) {
        setLoginToken(newtoken)
      }
    }
    log.debug('got market login token', token)
    if (token == null) {
      //continue to market without login in
      setLoginToken('')
      throw new Error('empty market token')
    }
  } catch (e) {
    log.error(e, e.message)

    // showErrorDialog('Error login in to market, try again later or contact support', 'MARKETPLACE-1')
  }
}
