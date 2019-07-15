// @flow
import React from 'react'
import { Image, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../../lib/styles'

const ErrorIcon = props => {
  const { styles, style } = props
  const image = require('./img/ErrorIcon.png')

  return (
    <View style={[styles.errorIconContainer, style]}>
      <View style={styles.errorIconFrame}>
        <Image style={styles.errorIcon} source={image} />
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    errorIconContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: normalize(16),
    },
    errorIconFrame: {
      alignItems: 'center',
      borderColor: theme.colors.red,
      borderRadius: '50%',
      borderWidth: normalize(3),
      display: 'flex',
      flexDirection: 'row',
      height: normalize(90),
      justifyContent: 'center',
      width: normalize(90),
    },
    errorIcon: {
      height: normalize(49),
      width: normalize(36),
    },
  }
}

export default withStyles(getStylesFromProps)(ErrorIcon)
