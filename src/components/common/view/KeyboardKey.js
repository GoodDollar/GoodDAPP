// @flow
import React from 'react'
import { Platform, TouchableHighlight, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import Icon from './Icon'
import Text from './Text'

type KeyboardKeyProps = {
  keyValue: string,
  onPress: string => void,
}

const KeyboardKey = ({ keyValue, onPress, styles, theme }: KeyboardKeyProps) => {
  return (
    <TouchableHighlight
      activeOpacity={0.8}
      onPress={() => onPress(keyValue)}
      style={styles.key}
      underlayColor={theme.colors.lightGray}
    >
      {keyValue === 'backspace' ? (
        <View style={styles.backspaceButton}>
          <Icon name="backspace" color={theme.colors.darkGray} size={18} style={{ textAlign: 'center' }} />
        </View>
      ) : (
        <Text fontSize={20} fontWeight="bold" fontFamily={theme.fonts.slab}>
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
      padding: theme.sizes.default,
      ...Platform.select({
        web: { cursor: 'pointer' },
      }),
    },
    backspaceButton: {
      ...Platform.select({
        web: {
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          cursor: 'pointer',
        },
      }),
      height: 30,
      justifyContent: 'center',
      width: 40,
    },
  }
}

export default withStyles(getStylesFromProps)(KeyboardKey)
