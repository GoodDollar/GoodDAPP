import React, { useMemo } from 'react'
import { View } from 'react-native'
import { isAndroid } from 'mobile-device-detect'
import { get } from 'lodash'

import SimpleStore from '../../../../lib/undux/SimpleStore.js'

import { withStyles } from '../../../../lib/styles'
import { getOriginalScreenHeight } from '../../../../lib/utils/orientation'

const useBlurredState = (options = null) => {
  const { whenDialog = false, whenSideMenu = false } = options || {}
  const store = SimpleStore.useStore()
  
  const isBlurred = useMemo(() => {
    const isPopupShown = get(store.get('currentScreen'), 'dialogData.visible', false)
    const isSideNavShown = get(store.get('sidemenu'), 'visible', false)
    const isFeedPopupShown = !!store.get('currentFeed')

    const isDialogShown = isPopupShown || isFeedPopupShown

    return (
      (whenDialog && isDialogShown) || 
      (whenSideMenu && isSideNavShown)
    )
  }, [whenDialog, whenSideMenu, store])
  
  const blurStyle = useMemo(() => {
    const isMobileKbdShown = !!store.get('isMobileKeyboardShown')
    const minHeight = isAndroid && isMobileKbdShown ? getOriginalScreenHeight() : 480
    
    return { minHeight }
  }, [store])
  
  return [isBlurred, blurStyle]
}

const Blurred = ({ styles, children, whenDialog = false, whenSideMenu = false }) => {
  const [isBlurred, blurStyle] = useBlurredState({ whenDialog, whenSideMenu })
  
  const viewStyles = useMemo(() => {
    const computedStyle = [styles.fullScreen, blurStyle]
    
    if (isBlurred) {
      computedStyle.push(styles.blurFx)
    }
    
    return computedStyle
  }, [isBlurred, blurStyle, styles])

  return <View style={viewStyles}>{children}</View>
}

const getStylesFromProps = () => ({
  fullScreen: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
  blurFx: {
    // TODO: native style
    filter: 'blur(24px) brightness(0.8) opacity(0.5)',
  },
})

export default withStyles(getStylesFromProps)(Blurred)
