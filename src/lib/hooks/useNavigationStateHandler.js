import { useCallback, useContext } from 'react'
import { noop } from 'lodash'
import { useDialog } from '../dialog/useDialog'
import { fireEventFromNavigation } from '../analytics/analytics'
import { getRoutePath } from '../../components/appNavigation/stackNavigation'
import { GlobalTogglesContext } from '../contexts/togglesContext'

export default (options = {}) => {
  const { hideDialog, isDialogShown } = useDialog()

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
        isDialogShown && hideDialog()
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
    [hideDialog, setMenu, setDialogBlur, resetFeed, resetMenu, resetPopups, fireEvent, onChange, isDialogShown],
  )
}
