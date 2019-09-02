// @flow
import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator, Button as BaseButton, DefaultTheme } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import Text from '../view/Text'

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
  textStyle?: any,
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

const mapPropsToStyles = ({ theme, compact }) => ({
  buttonStyle: {
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'stretch',
    minHeight: 44,
    paddingLeft: 0,
    paddingRight: 0,
    padding: 0,
    margin: 0,
    display: 'flex',
  },
  leftIcon: {
    marginRight: theme.sizes.defaultDouble,
  },
  rightIcon: {
    marginLeft: theme.sizes.defaultDouble,
  },
  buttonText: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 1,
    letterSpacing: 0,
  },
  contentStyle: {
    letterSpacing: 0,
  },
  contentWrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  activityIndicator: {
    marginRight: compact ? theme.sizes.defaultHalf : theme.sizes.default,
    alignSelf: 'center',
  },
})

const TextContent = withStyles(mapPropsToStyles)(
  ({ children, color, dark, uppercase, styles, textStyle }: TextContentProps) => {
    if (typeof children === 'string') {
      // if set to dark, then text will be white.
      // if 'color' is specified, use the color for the text
      // if not, then button will be using 'primary' color
      const textColor = (dark && 'white') || color || 'primary'

      return (
        <Text
          color={textColor}
          fontWeight="medium"
          textTransform={uppercase ? 'uppercase' : 'none'}
          style={[styles.buttonText, textStyle]}
        >
          {children}
        </Text>
      )
    }

    return children
  }
)

type IconButtonProps = {
  dark?: boolean,
  icon?: string | IconFunction,
  size: number,
  style: any,
  theme: DefaultTheme,
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
  const {
    theme,
    mode,
    style,
    children,
    icon,
    iconAlignment,
    iconSize,
    styles,
    textStyle,
    loading,
    disabled,
    ...buttonProps
  } = props
  const dark = mode === 'contained'
  const uppercase = mode !== 'text'
  const color = props.color ? props.color : theme.colors.default
  return (
    <BaseButton
      dark={dark}
      mode={mode}
      style={[styles.buttonStyle, style]}
      contentStyle={styles.contentStyle}
      theme={{ ...theme, roundness: 50 }}
      uppercase={uppercase}
      disabled={disabled || loading}
      onPress={props.onPress}
      color={color}
      {...buttonProps}
    >
      <View style={styles.contentWrapper}>
        {icon && (!iconAlignment || iconAlignment === 'left') && (
          <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.leftIcon} />
        )}
        {loading && (
          <ActivityIndicator
            style={styles.activityIndicator}
            animating={loading}
            color={dark ? theme.colors.surface : color}
            size={23}
          />
        )}
        <TextContent dark={dark} uppercase={uppercase} textStyle={textStyle} color={buttonProps.color}>
          {children}
        </TextContent>
        {icon && iconAlignment === 'right' && (
          <IconButton icon={icon} theme={theme} dark={dark} size={iconSize} style={styles.rightIcon} />
        )}
      </View>
    </BaseButton>
  )
}

CustomButton.defaultProps = {
  mode: 'contained',
}

export default withStyles(mapPropsToStyles)(CustomButton)
