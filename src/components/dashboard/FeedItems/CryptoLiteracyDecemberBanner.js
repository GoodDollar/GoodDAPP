import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { withStyles } from '../../../lib/styles'
import CryptoLiteracyImage from '../../../../src/assets/CryptoLiteracyDecember.svg'

const CryptoLiteracyBanner = ({ onPress, styles }) => (
  <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
    <View style={{ aspectRatio: 1024 / 507 }}>
      <CryptoLiteracyImage width="100%" height="100%" />
    </View>
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    marginHorizontal: theme.sizes.default,
    marginTop: 11,
  },
})

export default withStyles(getStylesFromProps)(CryptoLiteracyBanner)
