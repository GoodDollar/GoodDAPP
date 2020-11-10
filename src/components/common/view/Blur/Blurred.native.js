import React, { useEffect, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line import/named
import { BlurView } from '@react-native-community/blur'
import { findNodeHandle, StyleSheet, View } from 'react-native'

import useBlurredState from './useBlurredState'

const Blurred = ({ whenDialog = false, whenSideMenu = false, ...props }) => {
  const viewRef = useRef()
  const [viewRefNode, setViewRefNode] = useState()

  useEffect(() => {
    const node = findNodeHandle(viewRef.current)
    setViewRefNode(node)
  }, [])

  const [isBlurred, blurStyle] = useBlurredState({ whenDialog, whenSideMenu })

  const viewStyles = useMemo(() => [styles.fullView, blurStyle], [blurStyle, styles])

  return (
    <View style={viewStyles}>
      <View ref={viewRef} style={[styles.container, styles.fullView]}>
        {props.children}
      </View>
      {isBlurred && <BlurView style={styles.fullView} viewRef={viewRefNode} blurType="light" blurAmount={24} />}
      {isBlurred && <View style={[styles.fullView, styles.opacityView]} />}
    </View>
  )
}

const styles = StyleSheet.create({
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

export default Blurred
