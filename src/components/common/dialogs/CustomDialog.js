// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Dialog, Paragraph, Portal } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import CustomButton from '../buttons/CustomButton'
import ModalCloseButton from '../modal/ModalCloseButton'
import ModalLeftBorder from '../modal/ModalLeftBorder'
import ModalContents from '../modal/ModalContents'
import ModalInnerContents from '../modal/ModalInnerContents'
import ModalContainer from '../modal/ModalContainer'
import { theme } from '../../theme/styles'

export type DialogProps = {
  children?: any,
  dismissText?: string,
  image?: any,
  loading?: boolean,
  message?: string,
  onCancel?: () => void,
  onDismiss?: () => void,
  title?: string,
  type?: string,
  visible?: boolean,
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
  dismissText,
  image,
  loading = false,
  message = null,
  onCancel = null,
  onDismiss,
  title,
  type = 'common',
  visible,
}: DialogProps) => (
  <Portal>
    <Dialog style={styles.clearDialogStyles} visible={visible} onDismiss={onCancel || onDismiss} dismissable={true}>
      {onCancel || onDismiss ? <ModalCloseButton onClose={onCancel || onDismiss} /> : null}
      <ModalContainer>
        <ModalLeftBorder style={{ backgroundColor: getColorFromType(type) }} />
        <ModalContents>
          <ModalInnerContents>
            <Dialog.Title style={styles.title}>{title}</Dialog.Title>
            <View style={styles.content}>
              {children}
              {image ? image : null}
              {message && <Paragraph style={styles.paragraph}>{message}</Paragraph>}
            </View>
            <Dialog.Actions style={styles.buttonsContainer}>
              {onCancel && (
                <CustomButton disabled={loading} loading={loading} onPress={onCancel}>
                  Cancel
                </CustomButton>
              )}
              <CustomButton
                disabled={loading}
                loading={loading}
                onPress={onDismiss}
                style={[styles.buttonOK, { backgroundColor: getColorFromType(type) }]}
              >
                {dismissText || 'Done'}
              </CustomButton>
            </Dialog.Actions>
          </ModalInnerContents>
        </ModalContents>
      </ModalContainer>
    </Dialog>
  </Portal>
)

const getColorFromType = (type: string) => {
  return (
    {
      success: theme.colors.primary,
      error: theme.colors.red,
    }[type] || theme.colors.primary
  )
}

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

const styles = StyleSheet.create({
  clearDialogStyles: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  title: {
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.slabBold,
    fontSize: normalize(24),
    marginBottom: normalize(16),
    textAlign: 'center',
  },
  paragraph: {
    color: theme.colors.darkGray,
    fontSize: normalize(16),
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginBottom: normalize(40),
    padding: 0,
  },
  buttonsContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonOK: {
    minWidth: normalize(80),
  },
})

export { CustomDialog as default, SimpleStoreDialog }
