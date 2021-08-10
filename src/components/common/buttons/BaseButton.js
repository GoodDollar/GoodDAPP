// @flow

/* This component is based on the react-native-paper's Button component and gracefully handles Views as children */

import React, { useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { ActivityIndicator, Colors, Surface, Text, TouchableRipple, withTheme } from 'react-native-paper'
import Icon from 'react-native-paper/lib/module/components/Icon'
import color from 'color'
import { noop } from 'lodash'
import useOnPress from '../../../lib/hooks/useOnPress'

const { black, white } = Colors

const Button = ({
  disabled,
  compact,
  mode = 'text',
  dark,
  loading,
  icon,
  color: buttonColor,
  children,
  uppercase = true,
  accessibilityLabel,
  onPress = noop,
  style,
  theme,
  contentStyle,
  labelStyle,
  ...rest
}) => {
  const [elevationAnim] = useState(new Animated.Value(mode === 'contained' ? 2 : 0))
  const _onPress = useOnPress(onPress)

  const handlePressIn = () => {
    if (mode === 'contained') {
      const { scale } = theme.animation
      Animated.timing(elevationAnim, {
        toValue: 8,
        duration: 200 * scale,
        useNativeDriver: true,
      }).start()
    }
  }

  const handlePressOut = () => {
    if (mode === 'contained') {
      const { scale } = theme.animation
      Animated.timing(elevationAnim, {
        toValue: 2,
        duration: 150 * scale,
        useNativeDriver: true,
      }).start()
    }
  }

  const { colors, roundness } = theme
  const font = theme.fonts.medium

  let backgroundColor, borderColor, textColor, borderWidth

  if (mode === 'contained') {
    if (disabled) {
      backgroundColor = color(theme.dark ? white : black)
        .alpha(0.12)
        .rgb()
        .string()
    } else if (buttonColor) {
      backgroundColor = buttonColor
    } else {
      backgroundColor = colors.primary
    }
  } else {
    backgroundColor = 'transparent'
  }

  if (mode === 'outlined') {
    borderColor = color(theme.dark ? white : black)
      .alpha(0.29)
      .rgb()
      .string()
    borderWidth = StyleSheet.hairlineWidth
  } else {
    borderColor = 'transparent'
    borderWidth = 0
  }

  if (disabled) {
    textColor = color(theme.dark ? white : black)
      .alpha(0.32)
      .rgb()
      .string()
  } else if (mode === 'contained') {
    let isDark

    if (typeof dark === 'boolean') {
      isDark = dark
    } else {
      isDark = backgroundColor === 'transparent' ? false : !color(backgroundColor).isLight()
    }

    textColor = isDark ? white : black
  } else if (buttonColor) {
    textColor = buttonColor
  } else {
    textColor = colors.primary
  }

  const rippleColor = color(textColor)
    .alpha(0.32)
    .rgb()
    .string()
  const buttonStyle = {
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius: roundness,
  }
  const touchableStyle = {
    borderRadius: style ? StyleSheet.flatten(style).borderRadius || roundness : roundness,
  }
  const textStyle = { color: textColor, ...font }
  const elevation = disabled || mode !== 'contained' ? 0 : elevationAnim

  const isChildrenString = typeof children === 'string'
  const fullSizeStyle = { flex: 1, alignSelf: 'stretch' }
  const extraStyle = isChildrenString ? null : fullSizeStyle

  return (
    <Surface {...rest} style={[styles.button, compact && styles.compact, { elevation }, buttonStyle, style]}>
      <TouchableRipple
        borderless
        delayPressIn={0}
        onPress={_onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityTraits={disabled ? ['button', 'disabled'] : 'button'}
        accessibilityComponentType="button"
        accessibilityRole="button"
        accessibilityStates={disabled ? ['disabled'] : []}
        disabled={disabled}
        rippleColor={rippleColor}
        style={[touchableStyle, extraStyle]}
      >
        <View style={[styles.content, contentStyle, extraStyle]}>
          {icon && loading !== true ? (
            <View style={styles.icon}>
              <Icon source={icon} size={16} color={textColor} />
            </View>
          ) : null}
          {loading ? <ActivityIndicator size={16} color={textColor} style={styles.icon} /> : null}
          {isChildrenString ? (
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                compact && styles.compactLabel,
                uppercase && styles.uppercaseLabel,
                textStyle,
                font,
                labelStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            <View style={[styles.viewLabel, compact && styles.compactLabel]}>{children}</View>
          )}
        </View>
      </TouchableRipple>
    </Surface>
  )
}

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    borderStyle: 'solid',
  },
  compact: {
    minWidth: 'auto',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    marginLeft: 12,
    marginRight: -4,
  },
  label: {
    textAlign: 'center',
    letterSpacing: 1,
    marginVertical: 9,
    marginHorizontal: 16,
  },
  compactLabel: {
    marginHorizontal: 8,
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
  },
  viewLabel: {
    marginVertical: 9,
    marginHorizontal: 16,
  },
})

export default withTheme(Button)
