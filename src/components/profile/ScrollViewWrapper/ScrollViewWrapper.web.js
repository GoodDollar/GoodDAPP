import React from 'react'
import { View } from 'react-native'

export const ScrollViewWrapper = props => {
  return <View style={{ flex: 1, flexDirection: 'column' }}>{props.children}</View>
}
