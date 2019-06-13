import React from 'react'
import { Portal, Snackbar } from 'react-native-paper'

const CustomSnackbar = ({ visible, text, onDismiss }) => {
  return (
    <Portal>
      <Snackbar duration={Snackbar.DURATION_SHORT} visible={visible} onDismiss={onDismiss}>
        {text}
      </Snackbar>
    </Portal>
  )
}

export default CustomSnackbar
