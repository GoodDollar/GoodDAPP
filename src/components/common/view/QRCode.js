// @flow
import React from 'react'
import QRCodeReact from 'qrcode.react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withTheme } from 'react-native-paper'

const QRCode = (props: any) => {
  const styles = getStylesFromProps(props)
  return (
    <View style={styles.qrWrapper}>
      <View style={styles.qrCode}>
        <QRCodeReact {...props} />
      </View>
    </View>
  )
}

export default withTheme(QRCode)

const getStylesFromProps = props => {
  const { theme } = props

  return StyleSheet.create({
    qrCode: {
      padding: normalize(16),
      borderColor: theme.colors.primary,
      borderWidth: 1,
      borderRadius: normalize(5)
    },
    qrWrapper: {
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
}
