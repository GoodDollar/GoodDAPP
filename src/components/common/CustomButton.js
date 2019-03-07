// @flow
import React from 'react'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { Button as BaseButton, Text } from 'react-native-paper'
import { normalize } from 'react-native-elements'

import { fontStyle } from './styles'

export type ButtonProps = {
  children: any,
  disabled?: boolean,
  mode?: string,
  color?: string,
  dark?: boolean,
  style?: any,
  onPress: any,
  loading?: boolean
}

const TextContent = ({ children, dark }) => {
  if (typeof children === 'string') {
    return <Text style={[styles.buttonText, { color: dark && 'white' }]}>{children}</Text>
  }

  return children
}

const CustomButton = (props: ButtonProps) => (
  <BaseButton {...props} style={[styles.button, props.style]} disabled={props.loading}>
    <TextContent {...props} />
  </BaseButton>
)

CustomButton.defaultProps = {
  color: '#555555',
  uppercase: true
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center'
  },
  buttonText: {
    ...fontStyle,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: normalize(5)
  }
})

export default CustomButton
