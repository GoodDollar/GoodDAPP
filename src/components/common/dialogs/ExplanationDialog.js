// libraries
import React from 'react'
import { Image, View } from 'react-native'
import { isEmpty, noop } from 'lodash'

// components
import Text from '../view/Text'
import CustomButton from '../buttons/CustomButton'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import SimpleStore from '../../../lib/undux/SimpleStore'
import { hideDialog } from '../../../lib/undux/utils/dialog'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { theme } from '../../theme/styles'
import normalizeText from '../../../lib/utils/normalizeText'

const ExplanationButton = ({ text = 'OK', action = noop, mode, styles }) => {
  const { buttonText, textModeButtonText, textModeButton } = styles
  const store = SimpleStore.useStore()
  const isTextMode = mode === 'text'

  const handleActionPress = useOnPress(() => {
    action()
    hideDialog(store)
  }, [action, store])

  return (
    <CustomButton
      onPress={handleActionPress}
      mode={mode}
      textStyle={[buttonText, isTextMode && textModeButtonText]}
      style={isTextMode && textModeButton}
    >
      {text}
    </CustomButton>
  )
}

const defaultCustomStyle = {}

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
  containerStyle = defaultCustomStyle,
  imageContainer = defaultCustomStyle,
  titleStyle = defaultCustomStyle,
  textStyle = defaultCustomStyle,
  labelStyle = defaultCustomStyle,
  imageStyle = defaultCustomStyle,
}) => {
  const imageProps = {
    style: [
      styles.image,
      { height: getDesignRelativeHeight(imageHeight, false) },
      { marginTop: errorMessage ? undefined : getDesignRelativeHeight(8) },
      imageStyle,
    ],
    resizeMode: 'contain',
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {errorMessage && (
        <Text color={theme.colors.red} style={styles.error}>
          {errorMessage}
        </Text>
      )}
      {ImageComponent ? (
        <ImageComponent {...imageProps} />
      ) : imageSource ? (
        <View style={imageContainer}>
          <Image source={imageSource} {...imageProps} />
        </View>
      ) : null}
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <Text fontSize={24} fontWeight="bold" fontFamily="Roboto Slab" style={[styles.title, titleStyle]}>
        {title}
      </Text>
      {text && <Text style={[styles.description, textStyle]}>{text}</Text>}
      {!isEmpty(buttons) && (
        <View style={styles.buttonsContainer}>
          {buttons.map(buttonProps => (
            <ExplanationButton key={buttonProps.text} styles={styles} {...buttonProps} />
          ))}
        </View>
      )}
    </View>
  )
}

const mapStylesToProps = () => ({
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    height: '100%',
    marginTop: 'auto',
    marginBottom: 'auto',
    minHeight: getDesignRelativeHeight(310),
  },
  error: {
    marginTop: getDesignRelativeHeight(16),
    marginBottom: getDesignRelativeHeight(25),
  },
  image: {
    width: '100%',
    marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble, false),
  },
  label: {
    color: theme.colors.darkGray,
    fontSize: normalizeText(10),
    lineHeight: 11,
    textAlign: 'left',
  },
  title: {
    marginBottom: getDesignRelativeHeight(8),
  },
  description: {
    fontSize: normalizeText(24),
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble, false),
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
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
