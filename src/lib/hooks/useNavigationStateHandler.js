import { useCallback } from 'react'
import { noop } from 'lodash'
import { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'
import { getRoutePath } from '../../components/appNavigation/stackNavigation'

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const [setCurrentFeed, setSideMenu] = useCurriedSetters(['currentFeed', 'sidemenu'])
  const { resetFeed = true, resetMenu = true, resetPopups = true, fireEvent = true, onChange = noop } = options

  return useCallback(
    (prevNav, nav, action) => {
      // do not clean the dialog state if the route is not changed
      const isSameRoute = getRoutePath(prevNav) === getRoutePath(nav)

      onChange(prevNav, nav, action, isSameRoute)

      if (isSameRoute) {
        return
      }

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
    [hideDialog, setSideMenu, setCurrentFeed, resetFeed, resetMenu, resetPopups, fireEvent, onChange],
  )
}
