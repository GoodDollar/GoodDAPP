// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
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
      <Text color={theme.colors.darkBlue} fontSize={14} fontFamily="medium">
        Scan QR Code
      </Text>
      <View style={styles.iconWrapper}>
        <Icon name="qrcode" color="white" size={30} />
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
    borderRadius: '50%',
    padding: normalize(8),
    marginLeft: theme.sizes.default,
  },
  icon: {
    backgroundColor: 'white',
  },
})

export default withStyles(mapPropsToStyle)(ScanQRButton)
