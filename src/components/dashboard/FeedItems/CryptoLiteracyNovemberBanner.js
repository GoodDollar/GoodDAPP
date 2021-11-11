import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'

import CryptoLiteracyNovemberWeb from '../../../../src/assets/CryptoLiteracyNovember.web.svg'
import CryptoLiteracyNovemberNative from '../../../../src/assets/CryptoLiteracyNovember.native.svg'

const CryptoLiteracyNovemberBanner = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    {Platform.select({
      web: <CryptoLiteracyNovemberWeb />,
      native: <CryptoLiteracyNovemberNative />,
    })}
  </TouchableOpacity>
)

export default CryptoLiteracyNovemberBanner
