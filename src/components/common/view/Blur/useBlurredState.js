import { useMemo } from 'react'
import { get } from 'lodash'
import { isAndroid } from 'mobile-device-detect'

import SimpleStore from '../../../../lib/undux/SimpleStore.js'

import { getOriginalScreenHeight } from '../../../../lib/utils/orientation'

const useBlurredState = (options = null) => {
  const { whenDialog = false, whenSideMenu = false } = options || {}
  const store = SimpleStore.useStore()

  const isBlurred = useMemo(() => {
    const isPopupShown = get(store.get('currentScreen'), 'dialogData.visible', false)
    const isSideNavShown = get(store.get('sidemenu'), 'visible', false)
    const isFeedPopupShown = !!store.get('currentFeed')

    const isDialogShown = isPopupShown || isFeedPopupShown

    return (whenDialog && isDialogShown) || (whenSideMenu && isSideNavShown)
  }, [whenDialog, whenSideMenu, store])

  const blurStyle = useMemo(() => {
    const isMobileKbdShown = !!store.get('isMobileKeyboardShown')
    const minHeight = isAndroid && isMobileKbdShown ? getOriginalScreenHeight() : 480

    return { minHeight }
  }, [store])

  return [isBlurred, blurStyle]
}

export default useBlurredState
