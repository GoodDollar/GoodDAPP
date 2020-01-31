import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export const ScrollViewWrapper = props => {
  return (
    <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
      {props.children}
    </KeyboardAwareScrollView>
  )
}
