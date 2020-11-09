import React, { useMemo } from 'react'
import { View } from 'react-native'
import { isAndroid } from 'mobile-device-detect'
import { get } from 'lodash'

import SimpleStore from '../../../../lib/undux/SimpleStore.js'

import { withStyles } from '../../../../lib/styles'
import { getOriginalScreenHeight } from '../../../../lib/utils/orientation'

const Blurred = ({ styles, children, whenDialog = false, whenSideMenu = false }) => {
  const store = SimpleStore.useStore()

  const blurStyles = useMemo(() => {
    const { fullScreen, blurFx } = styles
    const isPopupShown = get(store.get('currentScreen'), 'dialogData.visible', false)
    const isSideNavShown = get(store.get('sidemenu'), 'visible', false)
    const isMobileKbdShown = !!store.get('isMobileKeyboardShown')
    const isFeedPopupShown = !!store.get('currentFeed')

    const minHeight = isAndroid && isMobileKbdShown ? getOriginalScreenHeight() : 480
    const isDialogShown = isPopupShown || isFeedPopupShown
    const stylesList = [{ minHeight }, fullScreen]

    if ((whenDialog && isDialogShown) || (whenSideMenu && isSideNavShown)) {
      stylesList.push(blurFx)
    }

    return stylesList
  }, [whenDialog, whenSideMenu, styles, store])

  return <View style={blurStyles}>{children}</View>
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
