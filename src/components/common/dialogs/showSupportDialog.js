//@flow
import React from 'react'
import Text from '../view/Text'

export const showSupportDialog = (showErrorDialog, hideDialog, push, message) => {
  showErrorDialog(message ? message : `Something went wrong on our side. Please try again later.`, undefined, {
    boldMessage: (
      <>
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
      </>
    ),
  })
}
