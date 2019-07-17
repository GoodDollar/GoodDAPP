// @flow
import React from 'react'
import { View } from 'react-native'
import { Button as BaseButton, DefaultTheme, Text } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'

type IconFunction = (string, number) => React.Node

// import normalize from 'react-native-elements/src/helpers/normalizeText'

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
  iconSize?: number,
  styles?: any,
}

type TextContentProps = {
  children: any,
  dark?: boolean,
  uppercase?: boolean,
  styles: any,
  textStyle: any,
}

const mapPropsToStyles = ({ theme }) => ({
  button: {
    justifyContent: 'center',
    borderColor: theme.colors.primary,
  },
  buttonWrapperText: {
    minHeight: 28,
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.sizes.default,
  },
  rightIcon: {
    marginLeft: theme.sizes.default,
  },
  buttonText: {
    fontWeight: 'bold',
    lineHeight: 0,
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
