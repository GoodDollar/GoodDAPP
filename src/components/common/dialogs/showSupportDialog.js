//@flow
import React from 'react'
import Text from '../view/Text'

export const showSupportDialog = (showErrorDialog, hideDialog, screenProps, errorCode: string) => {
  showErrorDialog(`Something went wrong on our side... Error: ${errorCode}`, undefined, {
    boldMessage: (
      <>
        <Text fontWeight="inherit" color="inherit">
          {'Please contact '}
        </Text>
        <Text
          fontWeight="inherit"
          textDecorationLine="underline"
          color="inherit"
          onPress={() => {
            hideDialog()
            screenProps.push('Support')
          }}
        >
          support
        </Text>
      </>
    ),
  })
}
