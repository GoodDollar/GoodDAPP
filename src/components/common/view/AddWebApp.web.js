import React, { useEffect, useState } from 'react'
import AddToHomescreen from 'react-add-to-homescreen'

const handleAddToHomescreenClick = () => {
  alert(`
      1. Open Share menu
      2. Tap on "Add to Home Screen" button`)
}

const AddWebApp = props => {
  const [installPrompt, setInstallPrompt] = useState()
  const installApp = async () => {
    installPrompt.prompt()
    let outcome = await installPrompt.userChoice
    if (outcome.outcome == 'accepted') {
      console.info('App Installed')
    } else {
      console.info('App not installed')
    }

    // Remove the event reference
    setInstallPrompt(null)
  }

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      // For older browsers
      e.preventDefault()
      console.info('Install Prompt fired')

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

  useEffect(() => {
    console.info({ installPrompt, show: props.show })
    if (installPrompt && props.show) {
      installApp()
    }
  }, [installPrompt, props.show])
  return <AddToHomescreen onAddToHomescreenClick={handleAddToHomescreenClick} />
}

export default AddWebApp
