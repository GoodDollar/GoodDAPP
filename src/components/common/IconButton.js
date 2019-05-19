// @flow
import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-elements/src/icons/Icon'
import normalize from 'react-native-elements/src/helpers/normalizeText'

type IconProps = {
  text: String,
  onPress: Function,
  disabled: Boolean,
  name: String
}

/**
 * Returns a button with an icon and text
 *
 * @param {IconProps} props
 * @returns Button with icon and text
 */
const IconButton = ({ text, onPress, disabled, ...iconProps }: IconProps) => {
  const styles = createStyles(disabled)
  return (
    <TouchableOpacity style={styles.container} onPress={!disabled ? onPress : undefined}>
      <Icon
        size={32}
        reverse
        color="white"
        reverseColor={disabled ? 'rgba(0, 0, 0, 0.32)' : '#282c34'}
        {...iconProps}
      />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const createStyles = disabled =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      cursor: disabled ? 'inherit' : 'pointer'
    },
    text: {
      color: disabled ? 'rgba(0, 0, 0, 0.32)' : 'inherit',
      fontSize: normalize(11)
    }
  })

export default IconButton
