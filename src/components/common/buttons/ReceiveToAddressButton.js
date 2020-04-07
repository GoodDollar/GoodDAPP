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

const ReceiveToAddressButton = ({ onPress, styles, theme, disabled, style = {} }: Props) => (
  <TouchableOpacity style={style.row} onPress={disabled ? undefined : onPress}>
    <View style={styles.buttonContainer}>
      <View style={styles.iconWrapper}>
        <Icon name="send-to-address" color="white" size={26} />
      </View>
      <Text color="darkBlue" fontSize={10} fontWeight="medium" lineHeight={11} style={styles.text}>
        Receive to address
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
    height: 42,
    width: 42,
    marginBottom: 5,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: getDesignRelativeWidth(20),
  },
})

export default withStyles(mapPropsToStyle)(ReceiveToAddressButton)
