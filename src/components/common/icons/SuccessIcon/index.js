// @flow
import React from 'react'
import { Image, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../../lib/styles'

const SuccessIcon = props => {
  const { styles, style } = props
  const image = require('./img/SuccessIcon.png')

  return (
    <View style={[styles.successIconContainer, style]}>
      <View style={styles.successIconFrame}>
        <Image style={styles.successIcon} source={image} />
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    successIconContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: normalize(16),
    },
    successIconFrame: {
      alignItems: 'center',
      borderColor: theme.colors.primary,
      borderRadius: '50%',
      borderWidth: normalize(3),
      display: 'flex',
      flexDirection: 'row',
      height: normalize(90),
      justifyContent: 'center',
      width: normalize(90),
    },
    successIcon: {
      height: normalize(49),
      width: normalize(36),
    },
  }
}

export default withStyles(getStylesFromProps)(SuccessIcon)
