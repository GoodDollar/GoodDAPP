// @flow
import { noop } from 'lodash'
import config from '../../config/config'
import { retry } from './async'
import restart from './restart'

let hasAppUpdates = false

export const onAppUpdated = () => (hasAppUpdates = true)

const unregisterWorkerAndRestart = async () => {
  if (hasAppUpdates) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  const gdWorker = registrations.find(({ scope }) => scope.includes(config.publicUrl))

  if (gdWorker) {
    await gdWorker.unregister()
  }

  restart()
}

const retryImport = fn =>
  retry(fn, 5, 1000).catch(e => {
    const { name, message } = e

    if ('SyntaxError' !== name || !message.startsWith('Unexpected token <')) {
      throw e
    }

    setTimeout(unregisterWorkerAndRestart, 10000)
    return new Promise(noop)
  })

export default retryImport
