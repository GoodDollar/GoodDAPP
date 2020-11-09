import React, { useEffect, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line import/named
import { BlurView } from '@react-native-community/blur'
import { findNodeHandle, StyleSheet, View } from 'react-native'
import { get } from 'lodash'
import SimpleStore from '../../../../lib/undux/SimpleStore.js'

const Blurred = ({ whenDialog = false, whenSideMenu = false, ...props }) => {
  const store = SimpleStore.useStore()

  const viewRef = useRef()
  const [viewRefNode, setViewRefNode] = useState()

  useEffect(() => {
    const node = findNodeHandle(viewRef.current)
    setViewRefNode(node)
  }, [])

  const hasBlur = useMemo(() => {
    const isPopupShown = get(store.get('currentScreen'), 'dialogData.visible', false)
    const isSideNavShown = get(store.get('sidemenu'), 'visible', false)
    const isFeedPopupShown = !!store.get('currentFeed')
    const isDialogShown = isPopupShown || isFeedPopupShown

    return (whenDialog && isDialogShown) || (whenSideMenu && isSideNavShown)
  }, [whenDialog, whenSideMenu, store])

  return (
    <View style={styles.fullView}>
      <View ref={viewRef} style={[styles.container, styles.fullView]}>
        {props.children}
      </View>
      {hasBlur && <BlurView style={styles.fullView} viewRef={viewRefNode} blurType="light" blurAmount={24} />}
      {hasBlur && <View style={[styles.fullView, styles.opacityView]} />}
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
