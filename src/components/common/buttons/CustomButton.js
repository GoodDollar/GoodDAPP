// @flow
import React from 'react'
import { View } from 'react-native'
import { Button as BaseButton, DefaultTheme, Text } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import normalize from '../../../lib/utils/normalizeText'

type IconFunction = (string, number) => React.Node

export type ButtonProps = {
  children: any,
  color?: string,
  dark?: boolean,
  disabled?: boolean,
  icon?: string | IconFunction,
  iconAlignment?: string,
  iconSize?: number,
  loading?: boolean,
  mode?: string,
  onPress: any,
  style?: any,
  styles?: any,
  theme: DefaultTheme,
  uppercase?: boolean,
}

type TextContentProps = {
  children: any,
  dark?: boolean,
  styles: any,
  textStyle: any,
  uppercase?: boolean,
}

const mapPropsToStyles = ({ theme }) => ({
  button: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonWrapperText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginLeft: 0,
    marginTop: 0,
    marginRight: 0,
    paddingBottom: 0,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 0,
  },
  leftIcon: {
    marginRight: theme.sizes.default,
  },
  rightIcon: {
    marginLeft: theme.sizes.default,
  },
  buttonText: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(16),
    fontWeight: 500,
    paddingTop: 1,
  },
})

const TextContent = withStyles(mapPropsToStyles)(
  ({ children, dark, uppercase, styles, textStyle }: TextContentProps) => {
    if (typeof children === 'string') {
      return (
        <View style={styles.buttonWrapperText}>
          <Text
            style={[
              styles.buttonText,
              { color: dark && 'white' },
              { textTransform: uppercase ? 'uppercase' : 'none' },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </View>
      )
    }

    return children
  }
)

type IconButtonProps = {
  theme: DefaultTheme,
  dark?: boolean,
  icon?: string | IconFunction,
  size: number,
  style: any,
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
  const { theme, mode, style, children, icon, iconAlignment, iconSize, styles, textStyle, ...buttonProps } = props
  const disabled = props.loading || props.disabled
  const dark = mode === 'contained'
  const uppercase = mode !== 'text'
  return (
    <BaseButton
      compact
      dark={dark}
      disabled={disabled}
      mode={mode}
      style={[styles.button, style]}
      theme={{ ...theme, roundness: 50 }}
      uppercase={uppercase}
      {...buttonProps}
    >
      {icon && (!iconAlignment || iconAlignment === 'left') && (
        <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.leftIcon} />
      )}
      <TextContent dark={dark} uppercase={uppercase} textStyle={textStyle}>
        {children}
      </TextContent>
      {icon && iconAlignment === 'right' && (
        <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.rightIcon} />
      )}
    </BaseButton>
  )
}

CustomButton.defaultProps = {
  mode: 'contained',
}

export default withStyles(mapPropsToStyles)(CustomButton)
