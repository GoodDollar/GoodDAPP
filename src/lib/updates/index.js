import { filter } from 'lodash'

import Config from '../../config/config'
import { fireEvent, UPDATE_FAILED, UPDATE_SUCCESS } from '../analytics/analytics'
import logger from '../logger/js-logger'

import uploadAvatars from './avatar'
import upgradeProfile from './restoreProfile'
import claimGOOD from './claimGOOD'
import verifyCRM from './verifycrm'
import fixRegMethod from './fixRegMethod'
import resetRefund from './resetRefund'
import syncWhitelist from './syncWhitelist'

const log = logger.child({ from: 'updates' })

const updates = [upgradeProfile, uploadAvatars, claimGOOD, verifyCRM, fixRegMethod, resetRefund, syncWhitelist]

const update = async (goodWallet, userStorage) => {
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
    const updatesTasks = updates.reduce((acc, upd) => {
      const updateKey = `${upd.key}_${new Date(upd.fromDate).toISOString()}`

      if (upd.fromDate > lastUpdate || !doneUpdates[updateKey]) {
        acc.push(() =>
          upd
            .update(lastUpdate, prevVersion, log, goodWallet, userStorage)
            .then(_ => {
              doneUpdates[updateKey] = true
              log.info('update done:', updateKey)
              fireEvent(UPDATE_SUCCESS, { key: upd.key })
            })
            .catch(e => {
              doneUpdates[updateKey] = false
              fireEvent(UPDATE_FAILED, { key: upd.key, error: e.message })
              log.error('update failed:', e.message, e, { updKey: upd.key })
            })
            .then(_ => true),
        )
      } else {
        log.info('update skipped:', { updateKey })
      }

      return acc
    }, [])

    log.debug('waiting update tasks:', updatesTasks.length)

    // eslint-disable-next-line prettier/prettier
    const results = await updatesTasks
      .reduce((promise, upd) => promise.then(acc => upd().then(res => [...acc, res])), Promise.resolve([]))
      .then(filter)

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

export default async (goodWallet, userStorage, from = null) => {
  const logger = from || log

  try {
    await update(goodWallet, userStorage)
  } catch (e) {
    logger.warn('Run update failed', e.message, e)
  }
}
