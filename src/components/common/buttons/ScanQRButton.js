// @flow
import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import Icon from '../view/Icon'
import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'

type Props = {
  disabled?: boolean,
  style?: { row?: {}, icon?: {}, legendWrapper?: {}, legend?: {} },
  onPress: any,
  styles: any,
  theme: any,
}

const ScanQRButton = ({ onPress, styles, theme, ...screenProps }: Props) => {
  const { disabled, style = {} } = screenProps
  return (
    <TouchableOpacity style={[styles.row, style.row]} onPress={disabled ? undefined : onPress}>
      <Text color="darkBlue" fontSize={14} fontWeight="medium">
        Scan QR Code
      </Text>
      <View style={styles.iconWrapper}>
        <Icon name="qrcode" color="white" size={28} />
      </View>
    </TouchableOpacity>
  )
}

const mapPropsToStyle = ({ theme }) => ({
  row: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
  iconWrapper: {
    backgroundColor: theme.colors.darkBlue,
    borderRadius: Platform.select({
      default: 42 / 2,
      web: '50%',
    }),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
    width: 42,
    marginLeft: theme.sizes.default,
  },
  icon: {
    backgroundColor: 'white',
  },
})

export default withStyles(mapPropsToStyle)(ScanQRButton)
