// @flow
import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { t } from '@lingui/macro'
import Icon from '../view/Icon'
import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'

type Props = {
  disabled?: boolean,
  style?: { row?: {}, icon?: {}, legendWrapper?: {}, legend?: {} },
  onPress: any,
  styles: any,
  theme: any,
}

const SendToAddress = ({ onPress, styles, theme, ...screenProps }: Props) => {
  const _onPress = useOnPress(onPress)
  return (
    <TouchableOpacity style={styles.alignContent} onPress={_onPress}>
      <View style={styles.iconWrapper}>
        <Icon name="send" color="white" size={28} />
      </View>
      <Text color="darkBlue" fontSize={14} fontWeight="medium">
        {t`Send to Address`}
      </Text>
    </TouchableOpacity>
  )
}

const mapPropsToStyle = ({ theme }) => ({
  alignContent: {
    alignItems: 'center',
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
})

export default withStyles(mapPropsToStyle)(SendToAddress)
