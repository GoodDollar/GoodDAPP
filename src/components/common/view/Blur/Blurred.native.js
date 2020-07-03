import React, { useEffect, useRef, useState } from 'react'
// eslint-disable-next-line import/named
import { BlurView } from '@react-native-community/blur'
import { findNodeHandle, StyleSheet, View } from 'react-native'

const Blurred = props => {
  const viewRef = useRef()
  const [viewRefNode, setViewRefNode] = useState()

  useEffect(() => {
    const node = findNodeHandle(viewRef.current)
    setViewRefNode(node)
  }, [])

  return (
    <View style={props.style}>
      <View ref={viewRef} style={[styles.container, styles.fullView]}>
        {props.children}
      </View>
      {props.blur && <BlurView style={styles.fullView} viewRef={viewRefNode} blurType="light" blurAmount={24} />}
      {props.blur && <View style={[styles.fullView, styles.opacityView]} />}
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
  },
})

export default Blurred
