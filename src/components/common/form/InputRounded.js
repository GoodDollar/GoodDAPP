import React from 'react'
import { TextInput, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import ErrorText from './ErrorText'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const InputRounded = ({ styles, theme, icon, iconSize, iconColor, error, onChange, ...inputProps }) => {
  const handleChange = value => {
    onChange(value)
  }
  return (
    <View style={styles.inputContainer}>
      <View
        style={[
          styles.wrapperStyle,
          inputProps.disabled ? styles.inputText : error ? styles.errorInputContainer : styles.iconInputContainer,
        ]}
      >
        <TextInput
          onChangeText={value => handleChange(value)}
          placeholderTextColor={theme.colors.gray50Percent}
          style={error ? styles.inputError : styles.input}
          {...inputProps}
        />
        <View style={styles.suffixIcon}>
          <Icon
            color={error ? theme.colors.red : iconColor || theme.colors.gray50Percent}
            name={icon}
            size={iconSize}
          />
        </View>
      </View>
      {!inputProps.disabled && <ErrorText error={error} style={styles.errorMargin} />}
    </View>
  )
}

const getStylesFromProps = ({ theme, disabled }) => {
  const defaultInputContainer = {
    paddingHorizontal: theme.sizes.defaultQuadruple,
    paddingVertical: 0,
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1,
  }
  const input = {
    color: theme.colors.darkGray,
    backgroundColor: 'transparent',
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: normalize(14),
    justifyContent: 'center',
    fontWeight: '400',
    paddingVertical: disabled ? 14 : 10,
  }

  return {
    inputContainer: {
      display: 'flex',
      flex: 1,
    },
    errorInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.red,
    },
    iconInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.lightGray,
    },
    inputText: {
      ...defaultInputContainer,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.lightGray,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    input,
    inputError: {
      ...input,
      color: theme.colors.red,
    },
    suffixIcon: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      width: defaultInputContainer.paddingHorizontal,
      zIndex: 1,
      top: disabled ? 1 : 0,
    },
    error: {
      paddingRight: 0,
      textAlign: 'left',
    },
    errorMargin: {
      marginVertical: theme.sizes.default,
    },
    wrapperStyle: {
      justifyContent: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(InputRounded)
