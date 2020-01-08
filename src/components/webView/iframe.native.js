import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native'

// const wHeight = getMaxDeviceHeight()

export const createIframe = (src, title) => {
  const IframeTab = props => {
    return (
      <View>
        <Text>External pages</Text>
      </View>
    )
  }
  IframeTab.navigationOptions = {
    title,
  }
  return IframeTab
}
