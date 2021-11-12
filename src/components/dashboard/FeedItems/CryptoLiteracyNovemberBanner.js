import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'

import { withStyles } from '../../../lib/styles'
import CryptoLiteracyNovemberWeb from '../../../../src/assets/CryptoLiteracyNovember.web.svg'
import CryptoLiteracyNovemberNative from '../../../../src/assets/CryptoLiteracyNovember.native.svg'

const CryptoLiteracyNovemberBanner = ({ onPress, styles }) => (
  <TouchableOpacity style={styles.mainContainer} onPress={onPress}>
    {Platform.select({
      web: <CryptoLiteracyNovemberWeb />,
      native: <CryptoLiteracyNovemberNative />,
    })}
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    marginHorizontal: theme.sizes.default,
    marginTop: 11,
  },
})

export default withStyles(getStylesFromProps)(CryptoLiteracyNovemberBanner)
