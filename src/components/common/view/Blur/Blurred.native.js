import React, { useRef } from 'react'
// eslint-disable-next-line import/named
import { BlurView } from '@react-native-community/blur'
import { View } from 'react-native'

const Blurred = props => {
  const viewRef = useRef({})
  return (
    <>
      <View ref={viewRef.current} style={props.style}>
        {props.children}
      </View>
      {props.blur && <BlurView style={props.style} viewRef={viewRef.current} blurType="dark" blurAmount={10} />}
    </>
  )
}
export default Blurred
