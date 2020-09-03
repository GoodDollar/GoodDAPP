import { useCallback } from 'react'
import { noop } from 'lodash'
import SimpleStore, { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const store = SimpleStore.useStore()
  const skipNavigationPopupHiding = store.get('skipNavigationPopupHiding')
  const [setCurrentFeed, setSideMenu, setSkipNavigationPopupHiding] = useCurriedSetters([
    'currentFeed',
    'sidemenu',
    'skipNavigationPopupHiding',
  ])
  const { resetFeed = true, resetMenu = true, resetPopups = true, fireEvent = true, onChange = noop } = options

  return useCallback(
    (prevNav, nav, action) => {
      if (resetPopups && !skipNavigationPopupHiding) {
        hideDialog()
      } else {
        setSkipNavigationPopupHiding(false)
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
