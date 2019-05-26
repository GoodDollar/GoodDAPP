// @flow
import React from 'react'
import { Portal, Dialog, Paragraph } from 'react-native-paper'
import CustomButton from './CustomButton'

type DialogProps = {
  children?: any,
  visible?: boolean,
  title?: string,
  message?: string,
  dismissText?: string,
  onDismiss?: () => void,
  loading?: boolean,
  onCancel?: () => void
}

const CustomDialog = ({
  children,
  visible,
  title,
  message,
  dismissText,
  onDismiss,
  onCancel,
  loading = false
}: DialogProps) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onDismiss} dismissable={true}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        {children && children}
        {message && <Paragraph>{message}</Paragraph>}
      </Dialog.Content>
      <Dialog.Actions>
        {onCancel && (
          <CustomButton onPress={onCancel} disabled={loading} loading={loading}>
            Cancel
          </CustomButton>
        )}
        <CustomButton onPress={onDismiss} disabled={loading} loading={loading}>
          {dismissText || 'Done'}
        </CustomButton>
      </Dialog.Actions>
    </Dialog>
  </Portal>
)

export default CustomDialog
