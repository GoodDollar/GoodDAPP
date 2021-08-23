import { useContext, useMemo } from 'react'
import { isAndroid } from 'mobile-device-detect'

import SimpleStore from '../../../../lib/undux/SimpleStore.js'

import { getOriginalScreenHeight } from '../../../../lib/utils/orientation'
import { GlobalTogglesContext } from '../../../../lib/contexts/togglesContext'

const useBlurredState = (options = null) => {
  const { isDialogBlurOn, isMenuOn } = useContext(GlobalTogglesContext)
  const { whenDialog = false, whenSideMenu = false } = options || {}
  const store = SimpleStore.useStore()
  const isBlurred = useMemo(() => {
    return (whenDialog && isDialogBlurOn) || (whenSideMenu && isMenuOn)
  }, [whenDialog, whenSideMenu, store, isDialogBlurOn, isMenuOn])

  const blurStyle = useMemo(() => {
    const isMobileKbdShown = !!store.get('isMobileKeyboardShown')
    const minHeight = isAndroid && isMobileKbdShown ? getOriginalScreenHeight() : 480

    return { minHeight }
  }, [store])

  return [isBlurred, blurStyle]
}

export default useBlurredState
