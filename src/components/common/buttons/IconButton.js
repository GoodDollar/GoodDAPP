// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import Text from '../view/Text'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'
import CustomIcon from './CustomIcon'

type IconProps = {
  text: String,
  onPress: Function,
  disabled: Boolean,
  name: String,
}

/**
 * Returns a button with an icon and text
 *
 * @param {IconProps} props
 * @param {String} props.text to shown
 * @param {Function} props.onPress action
 * @param {Boolean} props.disabled
 * @param {String} props.name icon name
 * @returns {React.Node}
 */
const IconButton = ({ styles, theme, text, onPress, disabled, name, ...iconProps }: IconProps) => {
  const _onPress = useOnPress(disabled ? undefined : onPress, [disabled])
  return (
    <TouchableOpacity cursor={disabled ? 'inherit' : 'pointer'} onPress={_onPress} style={styles.container}>
      <CustomIcon
        color={theme.colors.darkBlue}
        name={name}
        reverse
        reverseColor={disabled ? 'rgba(0, 0, 0, 0.32)' : '#282c34'}
        size={35}
        {...iconProps}
      />
      <Text fontSize={11} color={disabled ? 'rgba(0, 0, 0, 0.32)' : 'inherit'}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
    },
  }
}

export default withStyles(getStylesFromProps)(IconButton)
