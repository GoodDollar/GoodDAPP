import React, { useEffect } from 'react'
import AddToHomescreen from 'react-add-to-homescreen'

const handleAddToHomescreenClick = () => {
  alert(`
      1. Open Share menu
      2. Tap on "Add to Home Screen" button`)
}

const AddWebApp = props => {
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      console.info('beforeinstallprompt dashboard')
      console.info(e.platforms) // e.g., ["web", "android", "windows"]
      e.userChoice.then(
        function(outcome) {
          console.info(outcome) // either "accepted" or "dismissed"
        },
        err => console.info(err)
      )
    })
  }, [])
  return <AddToHomescreen onAddToHomescreenClick={handleAddToHomescreenClick} />
}

export default AddWebApp
