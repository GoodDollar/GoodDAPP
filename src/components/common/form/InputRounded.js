import React from 'react'
import { Platform, TextInput, View } from 'react-native'
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
        style={inputProps.disabled ? styles.inputText : error ? styles.errorInputContainer : styles.iconInputContainer}
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

const getStylesFromProps = ({ theme }) => {
  const defaultInputContainer = {
    paddingHorizontal: 32,
    paddingVertical: 0,
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1,
    marginTop: theme.sizes.defaultHalf,
    marginBottom: theme.sizes.default,
  }
  const input = {
    color: theme.colors.darkGray,
    backgroundColor: 'transparent',
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: normalize(14),
    fontWeight: '400',
    padding: 10,
  }

  return {
    inputContainer: {
      display: Platform.select({
        // FIXME: RN
        default: 'flex',
        web: 'inline-flex',
      }),
      flex: 1,
    },
    errorInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.red,
    },
    iconInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.lightGray,
      marginBottom: theme.sizes.default,
    },
    inputText: {
      ...defaultInputContainer,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: theme.colors.lightGray,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      marginBottom: 0,
      marginTop: 2,
      paddingTop: 2,
      paddingBottom: 2,
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
    },
    error: {
      paddingRight: 0,
      textAlign: 'left',
    },
    errorMargin: {
      marginBottom: theme.sizes.default,
    },
  }
}

export default withStyles(getStylesFromProps)(InputRounded)
