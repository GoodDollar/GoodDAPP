// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as BaseButton, Text } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { fontStyle } from './styles'

export type ButtonProps = {
  children: any,
  disabled?: boolean,
  mode?: string,
  color?: string,
  dark?: boolean,
  style?: any,
  onPress: any,
  loading?: boolean,
  uppercase?: boolean
}

const TextContent = ({ children, dark }) => {
  if (typeof children === 'string') {
    return <Text style={[styles.buttonText, { color: dark && 'white' }]}>{children}</Text>
  }

  return children
}

/**
 * Custom button based on react-native-paper
 * @param {Props} props
 * @param {React.Node|String} props.children If it's a string will add a Text component as child
 * @param {function} props.onPress
 * @param {boolean} [props.disabled]
 * @param {string} [props.mode]
 * @param {boolean} [props.loading]
 * @param {string} [props.color=#555555]
 * @param {boolean} [props.dark]
 * @param {boolean} [props.uppercase=true]
 * @param {Object} [props.style] Button style
 * @returns {React.Node}
 */
const CustomButton = (props: ButtonProps) => (
  <BaseButton {...props} style={[styles.button, props.style]} disabled={props.loading || props.disabled} compact={true}>
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
    padding: 0
  }
})

export default CustomButton
