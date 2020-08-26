import { useCallback } from 'react'
import { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const [setCurrentFeed, setSideMenu] = useCurriedSetters(['currentFeed', 'sidemenu'])
  const { resetFeed = true, resetMenu = true, resetPopups = true, fireEvent = true } = options

  return useCallback(
    action => {
      if (resetPopups) {
        hideDialog()
      }

      if (resetFeed) {
        setCurrentFeed(null)
      }

      if (resetMenu) {
        setSideMenu({ visible: false })
      }

      if (fireEvent) {
        fireEventFromNavigation(action)
      }
    },
    [hideDialog, setSideMenu, setCurrentFeed, resetFeed, resetMenu, resetPopups, fireEvent],
  )
}
