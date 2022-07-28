import { get } from 'lodash'

import API from '../API'

const fetchData = response => get(response, 'data', {})
const fromDate = new Date('2022/07/14')

/**
 * @returns {Promise<void>}
 */
const fixRegMethod = async (lastUpdate, prevVersion, log, goodWallet, userStorage) => {
  const { userProperties } = userStorage
  const identifier = goodWallet.getAccountForType('login')
  const { regMethod: regMethodFromProps, registered } = userProperties.getAll()

  log.debug('got reg method', { regMethod: regMethodFromProps })

  const response = await API.userExistsCheck({ identifier }).then(fetchData)
  const { exists = false, regMethod = 'selfCustody' } = response

  log.debug('got user data', { response })

  if (!exists) {
    log.debug('account not exists, skipping')
    return
  }

  if (registered && regMethodFromProps === regMethod) {
    log.debug('registered set and regMethod matches, skipping', { regMethod, registered })
    return
  }

  log.debug('ready to fix regMethod, updating user props')

  try {
    await userProperties.updateAll({ regMethod, registered: true })
    log.debug('regMethod and registered flag fixed')
  } catch (e) {
    log.error('failed to fix regMethod and registered flag', e.message, e)
  }
}

export default { fromDate, update: fixRegMethod, key: 'fixRegMethod' }
