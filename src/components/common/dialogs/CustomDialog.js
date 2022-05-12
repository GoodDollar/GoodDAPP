// @flow
import React, { useCallback, useContext } from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph, Portal } from 'react-native-paper'
import { isString } from 'lodash'

import normalize from '../../../lib/utils/normalizeText'
import { useDialog } from '../../../lib/dialog/useDialog'
import CustomButton from '../buttons/CustomButton'
import ErrorAnimation from '../../common/animations/Error'
import SuccessIcon from '../modal/SuccessIcon'
import LoadingIcon from '../modal/LoadingIcon'
import ModalWrapper from '../modal/ModalWrapper'
import { theme } from '../../theme/styles'
import Text from '../view/Text'
import Section from '../layout/Section'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

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
  const globalToggleState = useContext(GlobalTogglesContext)
  const defaultImage = type === 'error' ? <ErrorAnimation /> : loading ? <LoadingIcon /> : <SuccessIcon />
  const modalColor = getColorFromType(type)
  const textColor = type === 'error' ? 'red' : 'darkGray'
  const color = theme.colors[textColor]
  const handleMessage = _message => (isString(_message) ? Paragraph : Section.Row)
  const Message = handleMessage(message)
  const BoldMessage = handleMessage(boldMessage)
  const _onDismiss = useCallback(onDismiss)

  if (!visible) {
    return null
  }

  return (
    <Portal>
      <ModalWrapper
        onClose={_onDismiss}
        leftBorderColor={modalColor}
        showCloseButtons={showCloseButtons}
        showAtBottom={showAtBottom}
        showTooltipArrow={showTooltipArrow}
        itemType={'custom'}
        isMinHeight={isMinHeight}
        fullHeight={fullHeight}
      >
        <React.Fragment>
          {!!title && (
            <Text color={textColor} fontFamily={theme.fonts.slab} fontSize={24} fontWeight="bold" style={styles.title}>
              {title}
            </Text>
          )}
          <View style={styles.content}>
            {content ? (
              // eslint-disable-next-line prettier/prettier
              // need to pass down the global GlobalTogglesContext value
              // as it's done in RN Paper's <Portal /> source with theme/settings providers:
              // https://github.com/callstack/react-native-paper/blob/main/src/components/Portal/Portal.tsx#L54
              // otherwise useContext(GlobalTogglesContext) will return undefined for
              // any custom dialog component (e.g. ExplanationDialog and other ones)
              <GlobalTogglesContext.Provider value={globalToggleState}>{content}</GlobalTogglesContext.Provider>
            ) : (
              <>
                {children}
                {image ? image : defaultImage}
                {message && <Message style={[styles.paragraph, { color }]}>{message}</Message>}
                {boldMessage && (
                  <BoldMessage style={[styles.paragraph, { fontWeight: 'bold', color }]}>{boldMessage}</BoldMessage>
                )}
              </>
            )}
          </View>
          {showButtons ? (
            <View style={buttonsContainerStyle || styles.buttonsContainer}>
              {buttons ? (
                buttons.map(
                  ({ onPress = dismiss => dismiss(), style, disabled, mode, Component, ...buttonProps }, index) => (
                    <DialogButton
                      {...buttonProps}
                      Component={Component}
                      mode={mode}
                      onPress={() => onPress(_onDismiss)}
                      style={[{ marginLeft: 10 }, style]}
                      disabled={disabled || loading}
                      loading={loading}
                      key={index}
                    />
                  ),
                )
              ) : (
                <CustomButton disabled={loading} loading={loading} onPress={_onDismiss} style={[styles.buttonOK]}>
                  Ok
                </CustomButton>
              )}
            </View>
          ) : null}
        </React.Fragment>
      </ModalWrapper>
    </Portal>
  )
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
  const { dialogData, hideDialog } = useDialog()
  return (
    <CustomDialog
      {...dialogData}
      onDismiss={(...args) => {
        const currentDialogData = { ...dialogData }
        hideDialog()
        currentDialogData.onDismiss && currentDialogData.onDismiss(currentDialogData)
      }}
    />
  )
}

const DialogButton = ({ loading, dismiss, onPress, style, disabled, mode, Component, key, ...buttonProps }) => {
  const pressHandler = useCallback(() => {
    if (onPress) {
      onPress()
      return
    }

    dismiss()
  }, [dismiss, onPress])

  if (mode === 'custom') {
    return <Component />
  }

  return (
    <CustomButton
      {...buttonProps}
      mode={mode}
      onPress={pressHandler}
      style={style}
      disabled={disabled}
      loading={loading}
      key={key}
    >
      {buttonProps.text}
    </CustomButton>
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

    // maxHeight: Platform.select({
    //   web: 'none',
    //   default: 350,
    // }),
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
