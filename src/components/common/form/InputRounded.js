import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from 'react-native-elements/src/icons/Icon'
import { HelperText } from 'react-native-paper'

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const InputRounded = ({ icon, error, ...inputProps }) => (
  <View style={styles.inputContainer}>
    <View style={styles.iconInputContainer}>
      <TextInput style={styles.input} {...inputProps} />
      <View style={styles.suffixIcon}>
        <Icon size={normalize(16)} color="#282c34" name={icon} />
      </View>
    </View>
    <HelperText type="error" visible={error} style={styles.error}>
      {error}
    </HelperText>
  </View>
)

const styles = StyleSheet.create({
  inputContainer: {
    display: 'inline-flex',
    flex: 1
  },
  iconInputContainer: {
    position: 'relative',
    borderColor: '#CBCBCB',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: normalize(24),
    paddingHorizontal: normalize(24),
    paddingVertical: 0
  },
  input: {
    flex: 1,
    backgroundColor: 'inherit',
    border: 0,
    outline: 0,
    lineHeight: normalize(36),
    fontSize: normalize(14)
  },
  suffixIcon: {
    position: 'absolute',
    right: normalize(24),
    paddingTop: normalize(10),
    zIndex: 1
  },
  error: {
    paddingRight: 0,
    textAlign: 'left'
  }
})

export default InputRounded
