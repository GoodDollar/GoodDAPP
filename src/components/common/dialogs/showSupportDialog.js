//@flow
import React from 'react'
import Text from '../view/Text'
import useOnPress from '../../../lib/hooks/useOnPress'

export const showSupportDialog = (showErrorDialog, hideDialog, push, message) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const onPress = useOnPress(() => {
    hideDialog()
    push('Support')
  }, [hideDialog, push])

  showErrorDialog(
    message ? message + '. Please try again.' : `Something went wrong on our side. Please try again later.`,
    undefined,
    {
      boldMessage: (
        <>
          <Text fontWeight="inherit" color="inherit">
            {'Or contact '}
          </Text>
          <Text fontWeight="inherit" textDecorationLine="underline" color="inherit" onPress={onPress}>
            support
          </Text>
        </>
      ),
    }
  )
}
