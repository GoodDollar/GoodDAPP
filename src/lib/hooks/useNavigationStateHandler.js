import { useCallback } from 'react'
import { noop } from 'lodash'
import { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const [setCurrentFeed, setSideMenu] = useCurriedSetters(['currentFeed', 'sidemenu'])
  const { resetFeed = true, resetMenu = true, resetPopups = true, fireEvent = true, onChange = noop } = options

  return useCallback(
    (prevNav, nav, action) => {
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
      
      onChange(prevNav, nav, action)
    },
    [hideDialog, setSideMenu, setCurrentFeed, resetFeed, resetMenu, resetPopups, fireEvent, onChange],
  )
}
