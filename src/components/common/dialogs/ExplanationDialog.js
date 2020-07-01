// libraries
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'

// components
import Text from '../view/Text'

// utils
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'

const ExplanationDialog = ({
  styles,
  theme,
  errorMessage,
  title,
  text,
  bottomLink,
  imageSource,
  image: ImageComponent,
}) => {
  const imageProps = {
    style: [styles.image, { marginTop: errorMessage ? undefined : getDesignRelativeHeight(8) }],
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
      {bottomLink && (
        <TouchableOpacity style={styles.bottomLink} onPress={bottomLink.action}>
          <Text color="primary" lineHeight={19} textDecorationLine="underline">
            {bottomLink.text}
          </Text>
        </TouchableOpacity>
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
    height: getDesignRelativeHeight(74, false),
    marginBottom: getDesignRelativeHeight(16),
  },
  title: {
    marginBottom: getDesignRelativeHeight(8),
  },
  bottomLink: {
    marginTop: getDesignRelativeHeight(24),
    marginBottom: getDesignRelativeHeight(8),
  },
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
