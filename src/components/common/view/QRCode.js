// @flow
import React from 'react'
import QRCodeReact from 'qrcode.react'
import { View } from 'react-native'
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
      borderColor: theme.colors.primary,
      borderRadius: 5,
      borderWidth: 1,
      padding: theme.sizes.defaultDouble,
    },
    qrWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(QRCode)
