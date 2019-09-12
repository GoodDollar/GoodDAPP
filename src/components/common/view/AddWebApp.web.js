import React, { useEffect, useState } from 'react'
import AddToHomescreen from 'react-add-to-homescreen'
import SimpleStore from '../../../lib/undux/SimpleStore'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'AddWebApp' })

const handleAddToHomescreenClick = () => {
  alert(`
      1. Open Share menu
      2. Tap on "Add to Home Screen" button`)
}

const AddWebApp = props => {
  const [installPrompt, setInstallPrompt] = useState()
  const store = SimpleStore.useStore()

  const installApp = async () => {
    installPrompt.prompt()
    let outcome = await installPrompt.userChoice
    if (outcome.outcome == 'accepted') {
      log.debug('App Installed')
    } else {
      log.debug('App not installed')
    }

    // Remove the event reference
    setInstallPrompt(null)
  }

  useEffect(() => {
    log.debug('useEffect, registering beforeinstallprompt')

    window.addEventListener('beforeinstallprompt', e => {
      // For older browsers
      e.preventDefault()
      log.debug('Install Prompt fired')

      // See if the app is already installed, in that case, do nothing
      if (
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true
      ) {
        return
      }
      setInstallPrompt(e)
    })
  }, [])

  const { show } = store.get('addWebApp')

  useEffect(() => {
    log.debug({ installPrompt, show })
    if (installPrompt && show) {
      installApp()
    }
  }, [installPrompt, show])

  return <AddToHomescreen onAddToHomescreenClick={handleAddToHomescreenClick} />
}

export default AddWebApp
