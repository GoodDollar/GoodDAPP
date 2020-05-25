import React from 'react'
import { Image, View } from 'react-native'
import { withStyles } from '../../../../lib/styles'
import Text from '../../../common/view/Text'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const ExplanationDialog = ({ styles, theme, errorMessage, title, text, imageSource }) => {
  return (
    <View style={styles.container}>
      {errorMessage && (
        <Text color={theme.colors.red} style={styles.error}>
          {errorMessage}
        </Text>
      )}
      <Image style={styles.image} source={imageSource} resizeMode="contain" />
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
  },
  error: {
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(25),
  },
  image: {
    width: '100%',
    height: getDesignRelativeHeight(120),
    marginBottom: getDesignRelativeHeight(16),
  },
  title: {
    marginBottom: getDesignRelativeHeight(8),
  },
})

export default withStyles(mapStylesToProps)(ExplanationDialog)
