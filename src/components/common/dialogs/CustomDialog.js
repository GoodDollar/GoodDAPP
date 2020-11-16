// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph, Portal } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import CustomButton from '../buttons/CustomButton'
import ErrorAnimation from '../../common/animations/Error'
import SuccessIcon from '../modal/SuccessIcon'
import LoadingIcon from '../modal/LoadingIcon'
import ModalWrapper from '../modal/ModalWrapper'
import { theme } from '../../theme/styles'
import Text from '../view/Text'

export type DialogButtonProps = { color?: string, mode?: string, onPress?: Function => void, text: string, style?: any }
export type DialogProps = {
  children?: any,
  image?: any,
  loading?: boolean,
  message?: string,
  boldMessage?: any,
  onCancel?: () => void,
  onDismiss?: () => void,
  showButtons?: boolean,
  showCloseButtons?: boolean,
  title?: string,
  type?: string,
  visible?: boolean,
  buttons?: DialogButtonProps[],
  isMinHeight?: boolean,
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
 * @param {boolean} [props.loading]
 * @param {DialogButtonProps[]} [props.buttons]
 * @returns {React.Node}
 */
const CustomDialog = ({
  children = null,
  image,
  loading = false,
  message = null,
  boldMessage = null,
  onDismiss,
  showButtons = true,
  showCloseButtons = true,
  showTooltipArrow,
  title,
  type = 'common',
  visible,
  content,
  buttons,
  showAtBottom,
  buttonsContainerStyle,
  fullHeight = false,
  isMinHeight = true,
}: DialogProps) => {
  const defaultImage = type === 'error' ? <ErrorAnimation /> : loading ? <LoadingIcon /> : <SuccessIcon />
  const modalColor = getColorFromType(type)
  const textColor = type === 'error' ? 'red' : 'darkGray'
  const color = theme.colors[textColor]
  return visible ? (
    <Portal>
      <ModalWrapper
        onClose={onDismiss}
        leftBorderColor={modalColor}
        showCloseButtons={showCloseButtons}
        showAtBottom={showAtBottom}
        showTooltipArrow={showTooltipArrow}
        itemType={'custom'}
        isMinHeight={isMinHeight}
        fullHeight={fullHeight}
      >
        <React.Fragment>
          {title && (
            <Text color={textColor} fontFamily="slab" fontSize={24} fontWeight="bold" style={styles.title}>
              {title}
            </Text>
          )}
          <View style={styles.content}>
            {content || (
              <>
                {children}
                {image ? image : defaultImage}
                {message && <Paragraph style={[styles.paragraph, { color }]}>{message}</Paragraph>}
                {boldMessage && (
                  <Paragraph style={[styles.paragraph, { fontWeight: 'bold', color }]}>{boldMessage}</Paragraph>
                )}
              </>
            )}
          </View>
          {showButtons ? (
            <View style={buttonsContainerStyle || styles.buttonsContainer}>
              {buttons ? (
                buttons.map(
                  ({ onPress = dismiss => dismiss(), style, disabled, mode, Component, ...buttonProps }, index) => {
                    if (mode === 'custom') {
                      return <Component />
                    }

                    return (
                      <CustomButton
                        {...buttonProps}
                        mode={mode}
                        onPress={() => onPress(onDismiss)}
                        style={[{ marginLeft: 10 }, style]}
                        disabled={disabled || loading}
                        loading={loading}
                        key={index}
                      >
                        {buttonProps.text}
                      </CustomButton>
                    )
                  },
                )
              ) : (
                <CustomButton disabled={loading} loading={loading} onPress={onDismiss} style={[styles.buttonOK]}>
                  Ok
                </CustomButton>
              )}
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
      queue: theme.colors.orange,
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
    minHeight: normalize(76),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    color: theme.colors.darkGray,
    fontSize: normalize(16),
    textAlign: 'center',
    marginTop: theme.sizes.defaultDouble,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: 0,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
  },
  buttonCancel: {
    minWidth: 80,
  },
  buttonOK: {
    minWidth: 80,
    paddingHorizontal: 10,
  },
})

export { CustomDialog as default, SimpleStoreDialog }
