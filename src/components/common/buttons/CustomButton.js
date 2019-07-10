// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button as BaseButton, DefaultTheme, withTheme } from 'react-native-paper'
import Text from '../view/Text'

export type ButtonProps = {
  children: any,
  theme: DefaultTheme,
  disabled?: boolean,
  mode?: string,
  color?: string,
  dark?: boolean,
  style?: any,
  onPress: any,
  loading?: boolean,
  uppercase?: boolean,
}

const TextContent = ({ children, dark, uppercase }) => {
  if (typeof children === 'string') {
    return (
      <View style={styles.buttonWrapperText}>
        <Text
          style={[styles.buttonText, { color: dark && 'white' }, { textTransform: uppercase ? 'uppercase' : 'none' }]}
        >
          {children}
        </Text>
      </View>
    )
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
const CustomButton = (props: ButtonProps) => {
  const { theme, mode, style, children } = props
  const disabled = props.loading || props.disabled
  const dark = mode === 'contained'
  const uppercase = mode !== 'text'

  return (
    <BaseButton
      {...props}
      theme={{ ...theme, roundness: 50 }}
      dark={dark}
      style={[styles.button, style]}
      disabled={disabled}
      uppercase={uppercase}
      compact
    >
      <TextContent dark={dark} uppercase={uppercase}>
        {children}
      </TextContent>
    </BaseButton>
  )
}

CustomButton.defaultProps = {
  mode: 'contained',
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
  },
  buttonWrapperText: {
    minHeight: 34,
    justifyContent: 'center',
  },
})

export default withTheme(CustomButton)
