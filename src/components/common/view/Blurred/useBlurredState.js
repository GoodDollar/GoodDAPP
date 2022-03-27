import { useContext, useMemo } from 'react'
import { isAndroid } from 'mobile-device-detect'

import { getOriginalScreenHeight } from '../../../../lib/utils/orientation'
import { GlobalTogglesContext } from '../../../../lib/contexts/togglesContext'

const useBlurredState = (options = null) => {
  const { isDialogBlurOn, isMenuOn, isMobileKeyboardShown } = useContext(GlobalTogglesContext)
  const { whenDialog = false, whenSideMenu = false } = options || {}
  const isBlurred = useMemo(() => {
    return (whenDialog && isDialogBlurOn) || (whenSideMenu && isMenuOn)
  }, [whenDialog, whenSideMenu, isDialogBlurOn, isMenuOn])

  const blurStyle = useMemo(() => {
    const minHeight = isAndroid && isMobileKeyboardShown ? getOriginalScreenHeight() : 480

    return { minHeight }
  }, [isMobileKeyboardShown])

  return [isBlurred, blurStyle]
}

export default useBlurredState
