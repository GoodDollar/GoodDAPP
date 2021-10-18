// @flow
import React from 'react'
import { View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
import { noop } from 'lodash'
import useOnPress from '../../../lib/hooks/useOnPress'
import { withStyles } from '../../../lib/styles'
import { theme as DefaultTheme } from '../../theme/styles'
import Icon from '../view/Icon'
import Text from '../view/Text'
import BaseButton from './BaseButton'

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
  iconStyle?: any,
  styles: any,
  textStyle?: any,
  theme: DefaultTheme,
  uppercase?: boolean,
}

type TextContentProps = {
  children: any,
  dark?: boolean,
  color?: string,
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
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
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
  contentWrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    minHeight: 22,
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
  },
)

type IconButtonProps = {
  dark?: boolean,
  icon?: string | IconFunction,
  size: number,
  style: any,
  theme: DefaultTheme,
}

const IconButton = ({ theme, dark, icon, size, style, color }: IconButtonProps) => {
  if (typeof icon === 'function') {
    return icon(dark ? theme.colors.surface : theme.colors.primary, size)
  }
  return (
    <Icon
      name={icon}
      color={color || (dark ? theme.colors.surface : theme.colors.primary)}
      size={size || 16}
      style={style}
    />
  )
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
 * @param {string} [props.testID]
 * @param {boolean} [props.uppercase=true]
 * @param {string|(string => React.Node} [props.icon=edit)]
 * @param {string} [props.iconAlignment=right]
 * @param {number} [props.iconSize=20]
 * @param {Object} [props.style] Button style
 * @param {Object} [props.iconStyle] icon style
 * @returns {React.Node}
 */
const CustomButton = (props: ButtonProps) => {
  const {
    theme,
    mode,
    style,
    children,
    testID,
    icon,
    iconAlignment,
    iconSize,
    styles,
    textStyle,
    loading,
    disabled,
    iconStyle,
    roundness = 50,
    contentStyle,
    onPress = noop,
    iconColor,
    ...buttonProps
  } = props
  const dark = mode === 'contained'
  const uppercase = mode !== 'text'
  const color = props.color ? theme.colors[props.color] || props.color : theme.colors.default
  const onButtonPressed = useOnPress(onPress)

  return (
    <BaseButton
      dark={dark}
      testID={testID}
      mode={mode}
      contentStyle={[styles.contentStyle, contentStyle]}
      theme={{ ...theme, roundness }}
      uppercase={uppercase}
      disabled={disabled || loading}
      onPress={onButtonPressed}
      {...buttonProps}
      color={color}
      style={[styles.buttonStyle, style]}
    >
      <View style={styles.contentWrapper}>
        {icon && (!iconAlignment || iconAlignment === 'left') && (
          <IconButton
            icon={icon}
            theme={theme}
            dark={dark}
            size={iconSize || 14}
            style={iconStyle || styles.leftIcon}
            color={iconColor}
          />
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
          <IconButton
            icon={icon}
            theme={theme}
            dark={dark}
            size={iconSize || 14}
            style={iconStyle || styles.rightIcon}
            color={iconColor}
          />
        )}
      </View>
    </BaseButton>
  )
}

CustomButton.defaultProps = {
  mode: 'contained',
}

export default withStyles(mapPropsToStyles)(CustomButton)
