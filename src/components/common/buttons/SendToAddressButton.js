// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Icon from '../view/Icon'
import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeWidth } from '../../../lib/utils/sizes'

type Props = {
  disabled?: boolean,
  style?: { row?: {}, icon?: {}, legendWrapper?: {}, legend?: {} },
  onPress: any,
  styles: any,
  theme: any,
}

const ScanQRButton = ({ onPress, styles, disabled, style = {} }: Props) => (
  <TouchableOpacity style={style.row} onPress={disabled ? undefined : onPress}>
    <View style={styles.buttonContainer}>
      <View style={styles.iconWrapper}>
        <Icon name="send-to-address" color="white" size={20} />
      </View>
      <Text color="darkBlue" fontSize={10} fontWeight="medium" lineHeight={11} style={styles.text}>
        Send to address
      </Text>
    </View>
  </TouchableOpacity>
)

const mapPropsToStyle = ({ theme }) => ({
  iconWrapper: {
    backgroundColor: theme.colors.darkBlue,
    borderRadius: 21, // half of height
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    marginBottom: 5,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: getDesignRelativeWidth(20),
  },
})

export default withStyles(mapPropsToStyle)(ScanQRButton)
