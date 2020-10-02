// @flow
import { useEffect } from 'react'
import SimpleStore, { setInitFunctions } from '../undux/SimpleStore'
import logger from '../logger/pino-logger'
import isWebApp from '../utils/isWebApp'
import { isMobile } from '../utils/platform'

const log = logger.child({ from: 'App' })
let serviceWorkerRegistred = false

export default () => {
  const store = SimpleStore.useStore()

  useEffect(() => {
    if (!isMobile) {
      const serviceWorker = require('../../serviceWorker')

      const onUpdate = reg => {
        store.set('serviceWorkerUpdated')(reg)
        navigator.serviceWorker.addEventListener('controllerchange', function() {
          log.debug('service worker: controllerchange')
          window.location.reload()
        })
      }
      const onRegister = reg => {
        //force check for service worker update
        reg.update()
        if (reg.waiting) {
          onUpdate(reg)
        }
      }
      if (serviceWorkerRegistred === false) {
        log.debug('registering service worker')
        serviceWorker.register({ onRegister, onUpdate })
        serviceWorkerRegistred = true
      }
      if (isWebApp === false) {
        log.debug('useEffect, registering beforeinstallprompt')

        window.addEventListener('beforeinstallprompt', e => {
          // For older browsers
          e.preventDefault()
          log.debug('Install Prompt fired')
          store.set('installPrompt')(e)
        })
      }
    }
    setInitFunctions(store.set('wallet'), store.set('userStorage'))
  })
}
