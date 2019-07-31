import React from 'react'
import { TextInput, View } from 'react-native'
import { HelperText } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const InputRounded = ({ styles, theme, icon, iconColor, error, onChange, ...inputProps }) => {
  const handleChange = event => {
    onChange(event.target.value)
  }

  return (
    <View style={styles.inputContainer}>
      <View
        style={inputProps.disabled ? styles.inputText : error ? styles.errorInputContainer : styles.iconInputContainer}
      >
        <TextInput style={error ? styles.inputError : styles.input} {...inputProps} onChange={handleChange} />
        <View style={styles.suffixIcon}>
          <Icon
            size={normalize(16)}
            color={error ? theme.colors.red : iconColor || theme.colors.gray50Percent}
            name={icon}
          />
        </View>
      </View>
      <HelperText type="error" visible={error} style={styles.error}>
        {error}
      </HelperText>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const defaultInputContainer = {
    paddingHorizontal: 40,
    paddingVertical: 0,
    position: 'relative',
  }
  const input = {
    backgroundColor: 'inherit',
    borderWidth: 0,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: normalize(14),
    lineHeight: 36,
  }
  return {
    inputContainer: {
      display: 'inline-flex',
      flex: 1,
    },
    errorInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.red,
      borderRadius: 24,
      borderWidth: 1,
    },
    iconInputContainer: {
      ...defaultInputContainer,
      borderColor: theme.colors.gray50Percent,
      borderRadius: 24,
      borderWidth: 1,
    },
    inputText: {
      ...defaultInputContainer,
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: 1,
    },
    input,
    inputError: {
      ...input,
      color: theme.colors.red,
    },
    suffixIcon: {
      paddingTop: theme.paddings.mainContainerPadding,
      position: 'absolute',
      right: 24,
      zIndex: 1,
    },
    error: {
      paddingRight: 0,
      textAlign: 'left',
    },
  }
}

export default withStyles(getStylesFromProps)(InputRounded)
