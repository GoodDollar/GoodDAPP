// @flow
import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
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
          <Icon name="backspace" color={theme.colors.darkGray} size={14} />
        </View>
      ) : (
        <Text style={styles.keyText}>{keyValue}</Text>
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
      padding: normalize(20),
      cursor: 'pointer',
    },
    keyText: {
      fontSize: normalize(20),
      fontFamily: 'RobotoSlab-Bold',
      fontWeight: '700',
      color: theme.colors.darkGray,
    },
    backspaceButton: {
      height: normalize(30),
      width: normalize(40),
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      cursor: 'pointer',
    },
  }
}

export default withStyles(getStylesFromProps)(KeyboardKey)
