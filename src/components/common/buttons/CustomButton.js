// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button as BaseButton, DefaultTheme, Text, withTheme } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../../lib/logger/pino-logger'
import Icon from '../view/Icon'

const log = logger.child({ from: 'CustomButton' })

type IconFunction = (string, number) => React.Node

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
  icon?: string | IconFunction,
  iconAlignment?: string,
  iconSize?: number
}

type TextContentProps = {
  children: any,
  dark?: boolean,
  uppercase?: boolean
}

const TextContent = ({ children, dark, uppercase }: TextContentProps) => {
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

type IconButtonProps = {
  theme: DefaultTheme,
  dark?: boolean,
  icon?: string | IconFunction,
  size?: number
}

const IconButton = ({ theme, dark, icon, size, style }: IconButtonProps) => {
  if (typeof icon === 'function') {
    return icon(dark ? theme.colors.surface : theme.colors.primary, size)
  }
  return <Icon name={icon} color={dark ? theme.colors.surface : theme.colors.primary} size={size || 16} style={style} />
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
 * @param {string|(string => React.Node} [props.icon=edit)]
 * @param {string} [props.iconAlignment=right]
 * @param {number} [props.iconSize=20]
 * @param {Object} [props.style] Button style
 * @returns {React.Node}
 */
const CustomButton = (props: ButtonProps) => {
  const { theme, mode, style, children, icon, iconAlignment, iconSize, ...buttonProps } = props
  const disabled = props.loading || props.disabled
  const dark = mode === 'contained'
  const uppercase = mode !== 'text'

  log.debug({ theme, mode, disabled, dark, uppercase, props })

  return (
    <BaseButton
      {...buttonProps}
      theme={{ ...theme, roundness: 50 }}
      dark={dark}
      mode={mode}
      style={[styles.button, style]}
      disabled={disabled}
      uppercase={uppercase}
      compact
    >
      {icon && (!iconAlignment || iconAlignment === 'left') && (
        <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.leftIcon} />
      )}
      <TextContent dark={dark} uppercase={uppercase}>
        {children}
      </TextContent>
      {icon && iconAlignment === 'right' && (
        <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.rightIcon} />
      )}
    </BaseButton>
  )
}

CustomButton.defaultProps = {
  mode: 'contained'
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center'
  },
  buttonWrapperText: {
    minHeight: 34,
    justifyContent: 'center'
  },
  leftIcon: {
    marginRight: normalize(8)
  },
  rightIcon: {
    marginLeft: normalize(10)
  }
})

export default withTheme(CustomButton)
