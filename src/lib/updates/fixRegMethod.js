import { get } from 'lodash'

import API from '../API'
import { REGISTRATION_METHOD_TORUS } from '../constants/login'

const fetchData = response => get(response, 'data', {})
const fromDate = new Date('2022/07/08')
const REG_METHOD_KEY = 'regMethod'

/**
 * @returns {Promise<void>}
 */
const fixRegMethod = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const { userProperties } = userStorage
  const identifier = goodWallet.getAccountForType('login')
  const regMethod = userProperties.get(REG_METHOD_KEY)

  log.debug('got reg method', { regMethod })

  if (REGISTRATION_METHOD_TORUS === regMethod) {
    log.debug('reg method OK, skipping')
    return
  }

  const response = await API.userExistsCheck({ identifier }).then(fetchData)
  const { exists = false, provider = null } = response

  log.debug('got user data', { response })

  if (!exists || !provider) {
    log.debug('account not exists, skipping')
    return
  }

  log.debug('ready to fix regMethod, updating user props')

  try {
    await userProperties.set(REG_METHOD_KEY, REGISTRATION_METHOD_TORUS)
    log.debug('regMethod fixed')
  } catch (e) {
    log.error('failed to fix regMethod', e.message, e)
  }
}

export default { fromDate, update: fixRegMethod, key: 'fixRegMethod' }
