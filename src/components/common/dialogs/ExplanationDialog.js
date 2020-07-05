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

const ExplanationDialog = ({
  styles,
  theme,
  errorMessage,
  title,
  text,
  imageSource,
  image: ImageComponent,
  imageHeight = 74,
  buttons,
}) => {
  const imageProps = {
    style: [
      styles.image,
      { height: getDesignRelativeHeight(imageHeight) },
      { marginTop: errorMessage ? undefined : getDesignRelativeHeight(8) },
    ],
    resizeMode: 'contain',
  }

  return (
    <View style={styles.container}>
      {errorMessage && (
        <Text color={theme.colors.red} style={styles.error}>
          {errorMessage}
        </Text>
      )}
      {ImageComponent ? (
        <ImageComponent {...imageProps} />
      ) : imageSource ? (
        <Image source={imageSource} {...imageProps} />
      ) : null}
      <Text fontSize={24} fontWeight="bold" fontFamily="Roboto Slab" style={styles.title}>
        {title}
      </Text>
      {text && <Text fontSize={24}>{text}</Text>}
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
    marginBottom: getDesignRelativeHeight(16),
  },
  title: {
    marginBottom: getDesignRelativeHeight(8),
  },
  bottomLink: {
    marginTop: getDesignRelativeHeight(24),
    marginBottom: getDesignRelativeHeight(8),
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
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
