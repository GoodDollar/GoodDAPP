// @flow
import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import useOnPress from '../../../lib/hooks/useOnPress'
import { withStyles } from '../../../lib/styles'
import Icon from './Icon'
import Text from './Text'

type KeyboardKeyProps = {
  keyValue: string,
  onPress: string => void,
}

const KeyboardKey = ({ keyValue, onPress, styles, theme }: KeyboardKeyProps) => {
  const onPressHandler = useOnPress(() => onPress(keyValue), [onPress, keyValue])

  return (
    <TouchableHighlight
      activeOpacity={0.8}
      onPress={onPressHandler}
      style={styles.key}
      underlayColor={theme.colors.lightGray}
    >
      {keyValue === 'backspace' ? (
        <View style={styles.backspaceButton}>
          <Icon name="backspace" color={theme.colors.darkGray} size={18} style={{ textAlign: 'center' }} />
        </View>
      ) : (
        <Text fontSize={20} fontWeight="bold" fontFamily="slab">
          {keyValue}
        </Text>
      )}
    </TouchableHighlight>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    key: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      cursor: 'pointer',
      padding: theme.sizes.default,
    },
    backspaceButton: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      cursor: 'pointer',
      height: 30,
      justifyContent: 'center',
      width: 40,
    },
  }
}

export default withStyles(getStylesFromProps)(KeyboardKey)
