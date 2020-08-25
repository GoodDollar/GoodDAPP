import { useCallback } from 'react'
import { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'

export default () => {
  const [, hideDialog] = useDialog()
  const [setCurrentFeed, setSideMenu] = useCurriedSetters(['currentFeed', 'sidemenu'])

  // resetting all dialogs and blurred background related data from SimpleStore
  return useCallback(() => {
    hideDialog()
    setCurrentFeed(null)
    setSideMenu({ visible: false })
  }, [hideDialog])
}
