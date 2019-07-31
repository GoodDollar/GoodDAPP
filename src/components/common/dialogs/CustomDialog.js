// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Paragraph, Portal } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import CustomButton from '../buttons/CustomButton'
import ModalWrapper from '../modal/ModalWrapper'
import { theme } from '../../theme/styles'

export type DialogProps = {
  children?: any,
  dismissText?: string,
  image?: any,
  loading?: boolean,
  message?: string,
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
  onCancel = null,
  onDismiss,
  showButtons = true,
  title,
  type = 'common',
  visible,
}: DialogProps) => {
  return visible ? (
    <Portal>
      <ModalWrapper onClose={onCancel || onDismiss} leftBorderColor={getColorFromType(type)}>
        <React.Fragment>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.content}>
            {children}
            {image ? image : null}
            {message && <Paragraph style={styles.paragraph}>{message}</Paragraph>}
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
              <CustomButton
                disabled={loading}
                loading={loading}
                onPress={onDismiss}
                style={[styles.buttonOK, { backgroundColor: getColorFromType(type) }]}
              >
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
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.slabBold,
    fontSize: normalize(24),
    marginBottom: 16,
    paddingTop: 16,
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
