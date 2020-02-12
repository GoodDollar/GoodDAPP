import userStorage from '../gundb/UserStorage'
import logger from '../logger/pino-logger'
import Config from '../../config/config'
import upd1 from './avatar'
const updates = [upd1]
const log = logger.child({ from: 'updates' })

const update = async () => {
  const updatesData = (await userStorage.userProperties.get('updates')) || {
    lastUpdate: new Date(0),
    status: {},
    lastVersionUpdate: '',
  }
  const lastUpdate = new Date(updatesData.lastUpdate)
  const doneUpdates = (await userStorage.userProperties.get('updates').get('status')) || {}
  const prevVersion = updatesData.lastVersionUpdate
  log.debug('starting updates:', { prevVersion, lastUpdate, doneUpdates })
  const promises = updates.map(upd => {
    const updateKey = `${upd.key}_${new Date(upd.fromDate).toISOString()}`
    if (upd.fromDate > lastUpdate || !doneUpdates[updateKey]) {
      return upd
        .update(lastUpdate, prevVersion, log)
        .then(_ => {
          doneUpdates[updateKey] = true
          log.info('update done:', updateKey)
        })
        .catch(e => {
          doneUpdates[updateKey] = false
          log.error('update failed:', e.message, e, { updKey: upd.key })
        })
        .then(_ => true)
    }
    return false
  })
  const results = await Promise.all(promises)
  log.debug('done updates:', results.filter(_ => _).length)
  updatesData.lastUpdate = new Date().toISOString()
  updatesData.lastVersionUpdate = Config.version
  updatesData.status = doneUpdates
  await userStorage.userProperties.set('updates', updatesData)
}

export default update
