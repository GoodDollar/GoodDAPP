import { useCallback, useContext } from 'react'
import { noop } from 'lodash'
import SimpleStore from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'
import { getRoutePath } from '../../components/appNavigation/stackNavigation'
import { GlobalTogglesContext } from '../contexts/togglesContext'

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const store = SimpleStore.useStore()

  const { setMenu, setDialogBlur } = useContext(GlobalTogglesContext)
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
        const { visible } = store.get('currentScreen').dialogData
        visible && hideDialog()
      }

      if (resetFeed) {
        setDialogBlur(false)
      }

      if (resetMenu) {
        setMenu(false)
      }

      if (fireEvent) {
        fireEventFromNavigation(action)
      }
    },
    [hideDialog, setMenu, setDialogBlur, resetFeed, resetMenu, resetPopups, fireEvent, onChange, store],
  )
}
