// @flow
import React from 'react'
import QRCodeReact from 'qrcode.react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'

const QRCode = ({ styles, ...props }: any) => {
  return (
    <View style={styles.qrWrapper}>
      <View style={styles.qrCode}>
        <QRCodeReact {...props} />
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    qrCode: {
      padding: normalize(16),
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: normalize(5),
    },
    qrWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(QRCode)
