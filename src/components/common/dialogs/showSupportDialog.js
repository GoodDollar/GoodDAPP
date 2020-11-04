//@flow

import React from 'react'
import { View } from 'react-native'
import Text from '../view/Text'

export const showSupportDialog = (
  showErrorDialog,
  hideDialog,
  push,
  message = 'Something went wrong on our side. Please try again',
) => {
  const wrapperStyles = {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  }

  showErrorDialog(message, undefined, {
    boldMessage: (
      <View style={wrapperStyles}>
        <Text fontWeight="inherit" color="inherit">
          {'Or contact '}
        </Text>
        <Text
          fontWeight="inherit"
          textDecorationLine="underline"
          color="inherit"
          onPress={() => {
            hideDialog()
            push('Support')
          }}
        >
          support
        </Text>
      </View>
    ),
  })
}
