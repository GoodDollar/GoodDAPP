// @flow
import React from 'react'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import SimpleStore from '../../../lib/undux/SimpleStore'
import CustomButton from '../buttons/CustomButton'
export type DialogProps = {
  children?: any,
  visible?: boolean,
  title?: string,
  message?: string,
  dismissText?: string,
  onDismiss?: () => void,
  loading?: boolean,
  onCancel?: () => void
}

/**
 * Custom Dialog based on react-native-paper
 * @param {DialogProps} props
 * @param {React.Node|String} [props.children]
 * @param {function} [props.onDismiss]
 * @param {function} [props.onCancel]
 * @param {boolean} [props.visible]
 * @param {string} [props.title]
 * @param {string} [props.message]
 * @param {string} [props.dismissText]
 * @param {boolean} [props.loading]
 * @returns {React.Node}
 */
const CustomDialog = ({
  children = null,
  visible,
  title,
  message = null,
  dismissText,
  onDismiss,
  onCancel = null,
  loading = false
}: DialogProps) => (
  <Portal>
    <Dialog visible={visible} onDismiss={onCancel || onDismiss} dismissable={true}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        {children}
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

const SimpleStoreDialog = () => {
  const store = SimpleStore.useStore()
  const { dialogData } = store.get('currentScreen')
  return (
    <CustomDialog
      {...dialogData}
      onDismiss={(...args) => {
        const currentDialogData = { ...dialogData }
        store.set('currentScreen')({ dialogData: { visible: false } })
        currentDialogData.onDismiss && currentDialogData.onDismiss(currentDialogData)
      }}
    />
  )
}

export { CustomDialog as default, SimpleStoreDialog }
