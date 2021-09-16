// libraries
import React, { useCallback, useContext, useMemo } from 'react'
import { Image, Platform, View } from 'react-native'
import { isEmpty, noop } from 'lodash'

// components
import { CustomButton, Text } from '../../common'

// utils
import SimpleStore from '../../../lib/undux/SimpleStore'
import { hideDialog } from '../../../lib/undux/utils/dialog'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import normalizeText from '../../../lib/utils/normalizeText'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

const defaultCustomStyle = {}

const ExplanationButton = ({ text = 'OK', action = noop, mode, styles, style = defaultCustomStyle }) => {
  const { buttonText, textModeButtonText, textModeButton } = styles
  const store = SimpleStore.useStore()
  const { setDialogBlur } = useContext(GlobalTogglesContext)
  const isTextMode = mode === 'text'

  const handleActionPress = useCallback(() => {
    action()
    hideDialog(store, setDialogBlur)
  }, [action, store])

  return (
    <CustomButton
      onPress={handleActionPress}
      mode={mode}
      textStyle={[buttonText, isTextMode && textModeButtonText]}
      style={[isTextMode && textModeButton, style]}
    >
      {text}
    </CustomButton>
  )
}

const ExplanationDialog = ({
  styles,
  theme,
  errorMessage,
  label,
  title,
  text,
  imageSource,
  image: ImageComponent,
  imageHeight = 74,
  buttons,
  buttonsContainerStyle = defaultCustomStyle,
  containerStyle = defaultCustomStyle,
  imageContainer = defaultCustomStyle,
  titleStyle = defaultCustomStyle,
  textStyle = defaultCustomStyle,
  labelStyle = defaultCustomStyle,
  imageStyle = defaultCustomStyle,
}) => {
  const hasImage = imageSource || ImageComponent

  const imageProps = useMemo(() => {
    if (!hasImage) {
      return
    }

    return {
      style: [
        styles.image,
        {
          marginTop: errorMessage ? undefined : getDesignRelativeHeight(8),
          width: '100%',
        },
        imageStyle,
      ],
      resizeMode: 'contain',
    }
  }, [styles.image, imageStyle, hasImage])

  return (
    <View style={[styles.container, containerStyle]}>
      {errorMessage && (
        <Text color={theme.colors.red} style={styles.error}>
          {errorMessage}
        </Text>
      )}
      {hasImage && (
        <View style={[styles.centerImage, imageContainer]}>
          {ImageComponent ? (
            <View {...imageProps}>
              <ImageComponent />
            </View>
          ) : (
            <Image source={imageSource} {...imageProps} />
          )}
        </View>
      )}
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <Text fontSize={24} fontWeight="bold" fontFamily="Roboto Slab" style={[styles.title, titleStyle]}>
        {title}
      </Text>
      {text && <Text style={[styles.description, textStyle]}>{text}</Text>}
      {!isEmpty(buttons) && (
        <View style={[styles.buttonsContainer, buttonsContainerStyle]}>
          {buttons.map(buttonProps => (
            <ExplanationButton key={buttonProps.text} styles={styles} {...buttonProps} />
          ))}
        </View>
      )}
    </View>
  )
}

const mapStylesToProps = ({ theme }) => ({
  container: {
    display: 'flex',
    flex: 0,
    justifyContent: 'space-around',
    maxHeight: '100%',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  error: {
    marginTop: theme.paddings.defaultMargin * 3,
    marginBottom: theme.paddings.defaultMargin * 3,
  },
  image: {
    alignSelf: 'center',
    width: '100%',
    marginBottom: theme.paddings.defaultMargin * 3,
  },
  label: {
    color: theme.colors.darkGray,
    fontSize: normalizeText(10),
    lineHeight: 11,
    textAlign: 'left',
  },
  title: {
    marginBottom: theme.paddings.defaultMargin * 3,
  },
  description: {
    fontSize: normalizeText(24),
    lineHeight: normalizeText(26),
    marginBottom: theme.paddings.defaultMargin * 3,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
  },
  buttonText: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  textModeButtonText: {
    textDecorationLine: 'underline',
  },
  textModeButton: {
    marginRight: 'auto',
    marginLeft: 'auto',
  },
  centerImage: {
    ...Platform.select({
      native: {
        flex: 1,
      },
    }),
    justifyContent: 'center',
    alignSelf: 'center',
  },
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
