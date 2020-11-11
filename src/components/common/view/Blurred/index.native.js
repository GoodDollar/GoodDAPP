import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BlurView } from '@react-native-community/blur' // eslint-disable-line import/named
import { findNodeHandle, View } from 'react-native'

import { withStyles } from '../../../../lib/styles'
import useBlurredState from './useBlurredState'

const Blurred = ({ whenDialog = false, whenSideMenu = false, styles, children }) => {
  const viewRef = useRef()
  const [viewRefNode, setViewRefNode] = useState()
  const [isBlurred, blurStyle] = useBlurredState({ whenDialog, whenSideMenu })
  const fullView = useMemo(() => [styles.fullView, blurStyle], [blurStyle, styles])

  useEffect(() => {
    const node = findNodeHandle(viewRef.current)

    setViewRefNode(node)
  }, [])

  return (
    <View style={fullView}>
      <View ref={viewRef} style={[styles.container, fullView]}>
        {children}
      </View>
      {isBlurred && <BlurView style={fullView} viewRef={viewRefNode} blurType="light" blurAmount={24} />}
      {isBlurred && <View style={[fullView, styles.opacityView]} />}
    </View>
  )
}

const getStylesFromProps = () => ({
  opacityView: {
    backgroundColor: 'rgba(210, 210, 210, 0.5)',
  },
  container: {
    backgroundColor: '#fff',
  },
  fullView: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
  },
})

export default withStyles(getStylesFromProps)(Blurred)
