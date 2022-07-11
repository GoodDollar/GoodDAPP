// @flow
import { useContext, useEffect, useRef } from 'react'
import logger from '../logger/js-logger'
import isWebApp from '../utils/isWebApp'
import { isMobile } from '../utils/platform'
import { resetLastSplash } from '../../components/splash/Splash'
import { GlobalTogglesContext } from '../contexts/togglesContext'

const log = logger.child({ from: 'App' })
let serviceWorkerRegistred = false

const useServiceWorker = () => {
  const { setServiceWorkerUpdated, setInstallPrompt } = useContext(GlobalTogglesContext)
  const interval = useRef()

  useEffect(() => {
    if (!isMobile && setInstallPrompt && setServiceWorkerUpdated) {
      const serviceWorker = require('../../serviceWorker')

      const onUpdate = reg => {
        setServiceWorkerUpdated(reg)
        navigator.serviceWorker.addEventListener('controllerchange', async () => {
          log.debug('service worker: controllerchange')
          await resetLastSplash() // show full splash animation
          window.location.reload()
        })
      }

      const onRegister = reg => {
        //force check for service worker update
        reg.update()
        interval.current = setInterval(() => reg.update(), 60 * 60 * 1000)
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
          setInstallPrompt(e)
        })
      }
    }

    return () => interval.current && clearInterval(interval.current)
  }, [setInstallPrompt, setServiceWorkerUpdated])
}

export default useServiceWorker
