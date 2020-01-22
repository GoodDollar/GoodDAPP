import React, { useRef, useState, useEffect } from 'react'
import { BlurView } from '@react-native-community/blur'
import { View, findNodeHandle, StyleSheet } from 'react-native'

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
        {props.blur && <View style={[styles.fullView, styles.opacityView]} />}
      </View>
      {props.blur && <BlurView style={styles.fullView} viewRef={viewRefNode} blurType="light" blurAmount={32} />}
    </View>
  )
}

const styles = StyleSheet.create({
  opacityView: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
