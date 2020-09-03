import { useCallback } from 'react'
import { noop } from 'lodash'
import { useCurriedSetters } from '../undux/SimpleStore.js'
import { useDialog } from '../undux/utils/dialog'
import { fireEventFromNavigation } from '../analytics/analytics'

const checkSameRoute = (prevNav, nav, prevIndexes = [], indexes = []) => {
  const prevIndex = prevNav.index
  const index = nav.index

  if (prevIndex >= 0 && index >= 0) {
    prevIndexes.push(prevIndex)
    indexes.push(index)
  } else {
    return prevIndexes.join('') === indexes.join('')
  }

  return checkSameRoute(prevNav.routes[prevIndex], nav.routes[index], prevIndexes, indexes)
}

export default (options = {}) => {
  const [, hideDialog] = useDialog()
  const [setCurrentFeed, setSideMenu] = useCurriedSetters(['currentFeed', 'sidemenu'])
  const { resetFeed = true, resetMenu = true, resetPopups = true, fireEvent = true, onChange = noop } = options

  return useCallback(
    (prevNav, nav, action) => {
      // do not clean the dialog state if the route is not changed
      const isSameRoute = checkSameRoute(prevNav, nav)
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

      onChange(prevNav, nav, action)
    },
    [hideDialog, setSideMenu, setCurrentFeed, resetFeed, resetMenu, resetPopups, fireEvent, onChange],
  )
}
