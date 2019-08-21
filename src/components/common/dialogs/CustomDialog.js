// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph, Portal } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import CustomButton from '../buttons/CustomButton'
import ErrorIcon from '../modal/ErrorIcon'
import SuccessIcon from '../modal/SuccessIcon'
import ModalWrapper from '../modal/ModalWrapper'
import { theme } from '../../theme/styles'
import Text from '../view/Text'

export type DialogProps = {
  children?: any,
  dismissText?: string,
  image?: any,
  loading?: boolean,
  message?: string,
  boldMessage?: any,
  onCancel?: () => void,
  onDismiss?: () => void,
  showButtons?: boolean,
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
  boldMessage = null,
  onCancel = null,
  onDismiss,
  showButtons = true,
  title,
  type = 'common',
  visible,
}: DialogProps) => {
  const defaultImage = type === 'error' ? <ErrorIcon /> : <SuccessIcon />
  const modalColor = getColorFromType(type)
  const textColor = type === 'error' ? 'red' : 'darkGray'
  const color = theme.colors[textColor]

  return visible ? (
    <Portal>
      <ModalWrapper onClose={onCancel || onDismiss} leftBorderColor={modalColor}>
        <React.Fragment>
          <Text color={textColor} fontFamily="slab" fontSize={24} fontWeight="bold" style={styles.title}>
            {title}
          </Text>
          <View style={styles.content}>
            {children}
            {image ? image : defaultImage}
            {message && <Paragraph style={[styles.paragraph, { color }]}>{message}</Paragraph>}
            {boldMessage && (
              <Paragraph style={[styles.paragraph, { fontWeight: 'bold', color }]}>{boldMessage}</Paragraph>
            )}
          </View>
          {showButtons ? (
            <View style={styles.buttonsContainer}>
              {onCancel && (
                <CustomButton
                  color={theme.colors.lighterGray}
                  disabled={loading}
                  loading={loading}
                  mode="text"
                  onPress={onCancel}
                  style={styles.buttonCancel}
                >
                  Cancel
                </CustomButton>
              )}
              <CustomButton disabled={loading} loading={loading} onPress={onDismiss} style={[styles.buttonOK]}>
                {dismissText || 'Done'}
              </CustomButton>
            </View>
          ) : null}
        </React.Fragment>
      </ModalWrapper>
    </Portal>
  ) : null
}

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
  title: {
    marginBottom: theme.sizes.defaultDouble,
    paddingTop: theme.sizes.defaultDouble,
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
    marginBottom: 40,
    padding: 0,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonCancel: {
    minWidth: 80,
  },
  buttonOK: {
    marginLeft: 'auto',
    minWidth: 80,
  },
})

export { CustomDialog as default, SimpleStoreDialog }
