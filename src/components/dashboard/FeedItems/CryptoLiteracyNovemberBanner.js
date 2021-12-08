import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'

import { withStyles } from '../../../lib/styles'
import CryptoLiteracyImageWeb from '../../../../src/assets/CryptoLiteracyNovember.web.svg'
import CryptoLiteracyImageNative from '../../../../src/assets/CryptoLiteracyNovember.native.svg'

const CryptoLiteracyImage = Platform.select({
  web: CryptoLiteracyImageWeb,
  native: CryptoLiteracyImageNative,
})

const CryptoLiteracyBanner = ({ onPress, styles }) => (
  <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
    <CryptoLiteracyImage />
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    marginHorizontal: theme.sizes.default,
    marginTop: 11,
  },
})

export default withStyles(getStylesFromProps)(CryptoLiteracyBanner)
