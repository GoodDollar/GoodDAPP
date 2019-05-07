// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'

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
    <View style={styles.container} onClick={!disabled ? onPress : undefined}>
      <Icon reverse color="white" reverseColor={disabled ? 'rgba(0, 0, 0, 0.32)' : '#282c34'} {...iconProps} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}

const createStyles = disabled =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      cursor: disabled ? 'inherit' : 'pointer'
    },
    text: { color: disabled ? 'rgba(0, 0, 0, 0.32)' : 'inherit' }
  })

export default IconButton
