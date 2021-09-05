import { filter } from 'lodash'

import userStorage from '../userStorage/UserStorage'
import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'
import logger from '../logger/js-logger'
import uploadAvatars from './avatar'
import upgradeRealmDB from './upgradeRealmdb'
import upgradeProfileRealmDB from './upgradeProfileRealmdb'

const log = logger.child({ from: 'updates' })
const updates = [uploadAvatars, upgradeRealmDB, upgradeProfileRealmDB]

const update = async () => {
  const updatesData = (await userStorage.userProperties.get('updates')) || {
    lastUpdate: new Date(0),
    status: {},
    lastVersionUpdate: '',
  }

  const lastUpdate = new Date(updatesData.lastUpdate)
  const doneUpdates = updatesData.status || {}
  const prevVersion = updatesData.lastVersionUpdate

  log.debug('starting updates:', { prevVersion, lastUpdate, doneUpdates })

  if (prevVersion) {
    const promises = updates.map(upd => {
      const updateKey = `${upd.key}_${new Date(upd.fromDate).toISOString()}`

      if (upd.fromDate > lastUpdate || !doneUpdates[updateKey]) {
        return upd
          .update(lastUpdate, prevVersion, log)
          .then(_ => {
            doneUpdates[updateKey] = true
            log.info('update done:', updateKey)
            fireEvent('UPDATE_SUCCESS', { key: upd.key })
          })
          .catch(e => {
            doneUpdates[updateKey] = false
            fireEvent('UPDATE_FAILED', { key: upd.key, error: e.message })
            log.error('update failed:', e.message, e, { updKey: upd.key })
          })
          .then(_ => true)
      }

      log.info('updated skipped:', { updateKey })
      return false
    })

    log.debug('waiting update promises:', promises.length)

    const results = await Promise.all(promises).then(filter)

    log.debug('done updates:', { results }, results.length)
  } else {
    log.debug('skipping updates for no prevversion (new user?)')
  }

  updatesData.lastUpdate = new Date().toISOString()
  updatesData.lastVersionUpdate = Config.version
  updatesData.status = doneUpdates

  log.debug('saving updates status:', { updatesData })
  await userStorage.userProperties.set('updates', updatesData)
}

export default update
