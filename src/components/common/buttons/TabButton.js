// @flow
import React from 'react'
import { noop } from 'lodash'
import useOnPress from '../../../lib/hooks/useOnPress'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'
import BaseButton from './BaseButton'

export type TabButtonProps = {
  children: React.ReactText,
  onPress: any,
  style?: any,
  styles: any,
  textStyle?: any,
  isActive?: boolean,
  roundnessLeft?: number,
  roundnessRight?: number,
  hasRightBorder?: boolean,
  hasLeftBorder?: boolean,
  flex?: number,
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: 0,
    minHeight: 24,
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
const TabButton = (props: TabButtonProps) => {
  const {
    theme,
    mode,
    style,
    children,
    styles,
    textStyle,
    roundnessLeft = 0,
    roundnessRight = 0,
    contentStyle,
    onPress = noop,
    hasLeftBorder,
    hasRightBorder,
    flex = 1,
    isActive,
    ...buttonProps
  } = props
  const uppercase = mode !== 'text'
  const color = isActive ? '#eef0f9' : theme.colors.white
  const textColor = isActive ? theme.colors.default : '#8499BB'
  const onButtonPressed = useOnPress(onPress)

  return (
    <BaseButton
      mode={mode}
      contentStyle={[styles.contentStyle, contentStyle]}
      theme={{ ...theme, roundness: undefined }}
      uppercase={uppercase}
      onPress={onButtonPressed}
      {...buttonProps}
      color={color}
      style={[
        styles.buttonStyle,
        {
          flex,
          borderTopLeftRadius: roundnessLeft,
          borderTopRightRadius: roundnessRight,
          borderBottomLeftRadius: roundnessLeft,
          borderBottomRightRadius: roundnessRight,
        },
        hasLeftBorder && { borderLeftWidth: 1, borderColor: '#E9ECFF' },
        hasRightBorder && { borderRightWidth: 1, borderColor: '#E9ECFF' },
        style,
      ]}
    >
      <TextContent uppercase={uppercase} textStyle={textStyle} color={textColor}>
        {children}
      </TextContent>
    </BaseButton>
  )
}

TabButton.defaultProps = {
  mode: 'contained',
}

export default withStyles(mapPropsToStyles)(TabButton)
