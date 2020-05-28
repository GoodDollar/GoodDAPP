import React from 'react'
import { Image, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'

const ExplanationDialog = ({ styles, theme, errorMessage, title, text, imageSource, image: ImageComponent }) => {
  const imageProps = { style: styles.image, resizeMode: 'contain' }

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
      <Text fontSize={16}>{text}</Text>
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
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(25),
  },
  image: {
    width: '100%',
    height: getDesignRelativeHeight(120, false),
    marginBottom: getDesignRelativeHeight(16),
  },
  title: {
    marginBottom: getDesignRelativeHeight(8),
  },
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
