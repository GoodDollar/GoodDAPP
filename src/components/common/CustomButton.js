// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
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
  onPress: any
}

const CustomButton = ({ children, ...props }: ButtonProps) => (
  <BaseButton {...props} style={[styles.button, props.style]}>
    {typeof children === 'string' ? (
      <Text style={[styles.buttonText, { color: props.dark && 'white' }]}>{children}</Text>
    ) : (
      children
    )}
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
