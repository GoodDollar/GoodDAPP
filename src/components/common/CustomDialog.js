// @flow
import React from 'react'
import { Portal, Dialog, Paragraph } from 'react-native-paper'
import CustomButton from './CustomButton'

type DialogProps = {
  visible?: boolean,
  title?: string,
  message?: string,
  dismissText?: string,
  onDismiss?: () => void
}
const CustomDialog = ({ visible, title, message, dismissText, onDismiss }: DialogProps) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss} dismissable={true}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Paragraph>{message}</Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <CustomButton onPress={onDismiss}>{dismissText || 'Done'}</CustomButton>
      </Dialog.Actions>
    </Dialog>
  </Portal>
)

export default CustomDialog
