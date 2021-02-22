// @flow
import { noop } from 'lodash'
import config from '../../config/config'
import { retry } from './async'
import restart from './restart'
import { canReloadApp } from './canReloadApp'

const unregisterWorkerAndRestart = async () => {
  if (canReloadApp.current) {
    const registrations = await navigator.serviceWorker.getRegistrations()

    /* eslint-disable no-await-in-loop */
    for (let registration of registrations) {
      registration.scope.includes(config.publicUrl) && (await registration.unregister())
    }

    restart()
  }
}

const retryImport = fn =>
  retry(fn, 5, 1000).catch(e => {
    const { name, message } = e
    setTimeout(unregisterWorkerAndRestart, 30000)
    if ('SyntaxError' !== name || !message.startsWith('Unexpected token <')) {
      throw e
    }

    return new Promise(noop)
  })

export default retryImport
