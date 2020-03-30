// @flow
import { useEffect } from 'react'
import { Platform } from 'react-native'
import SimpleStore from '../undux/SimpleStore'
import logger from '../logger/pino-logger'
import isWebApp from './isWebApp'

const log = logger.child({ from: 'App' })
let serviceWorkerRegistered = false

export default () => {
  const store = SimpleStore.useStore()
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }

    const serviceWorker = require('../../serviceWorker')

    const onUpdate = reg => {
      store.set('serviceWorkerUpdated')(reg)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        log.debug('service worker: controllerchange')
        window.location.reload()
      })
    }

    const onRegister = reg => {
      if (reg.waiting) {
        onUpdate(reg)
      }
    }

    if (!serviceWorkerRegistered) {
      log.debug('registering service worker')
      serviceWorker.register({ onRegister, onUpdate })
      serviceWorkerRegistered = true
    }

    if (!isWebApp) {
      log.debug('useEffect, registering beforeinstallprompt')

      window.addEventListener('beforeinstallprompt', e => {
        // For older browsers
        e.preventDefault()
        log.debug('Install Prompt fired')
        store.set('installPrompt')(e)
      })
    }
  })
}
