// libraries
import React from 'react'
import { Image, View } from 'react-native'
import { noop } from 'lodash'

// components
import Text from '../view/Text'
import CustomButton from '../buttons/CustomButton'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'

// utils
import { store } from '../../../lib/undux/SimpleStore'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { theme } from '../../theme/styles'

const ButtonComponent = ({ button, styles }) => {
  const { text = 'OK', action = noop, mode } = button

  const handleActionPress = useOnPress(() => {
    action()
    store.set('currentScreen')({ dialogData: { visible: false } })
  }, [action])

  return (
    <CustomButton
      onPress={handleActionPress}
      mode={mode}
      textStyle={[styles.buttonTextStyle, mode === 'text' && styles.textOfButton_textMode]}
      style={mode === 'text' && styles.button_textMode}
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
      {buttons && buttons.length && (
        <View style={styles.buttonsContainer}>
          {buttons.map(button => (
            <ButtonComponent key={button.text} button={button} styles={styles} />
          ))}
        </View>
      )}
    </View>
  )
}

const mapStylesToProps = () => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    marginTop: 'auto',
    marginBottom: 'auto',
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
  buttonTextStyle: {
    paddingLeft: 5,
    paddingRight: 5,
  },
  textOfButton_textMode: {
    textDecorationLine: 'underline',
  },
  button_textMode: {
    marginRight: 'auto',
    marginLeft: 'auto',
  },
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
