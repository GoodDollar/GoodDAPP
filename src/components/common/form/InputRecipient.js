import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { HelperText, TextInput } from 'react-native-paper'
import Clipboard from '../../../lib/utils/Clipboard'
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'InputRecipient' })

/**
 * TopBar - used To display contextual information in a small container
 * @param {object} props - an object with props
 * @param {boolean} props.hideBalance - if falsy balance will be displayed
 * @param {function} props.push - pushes a route to the nav stack. When called, apps navigates to the specified ruote
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const InputRecipient = props => {
  const { onBlur, onChangeText, to, error } = props
  const pasteToWho = async () => {
    try {
      const who = await Clipboard.getString()
      onChangeText(who)
    } catch (err) {
      log.error('Paste action failed', err)
    }
  }

  return (
    <View style={styles.iconInputContainer}>
      <View style={styles.pasteIcon}>
        <Icon size={normalize(16)} color="#282c34" name="content-paste" onPress={pasteToWho} />
      </View>
      <TextInput
        onChangeText={onChangeText}
        onBlur={onBlur}
        value={to || ''}
        error={error}
        style={styles.input}
        placeholder="Phone Number / Email / Username"
        autoFocus
      />
      <HelperText type="error" visible={error}>
        {error}
      </HelperText>
    </View>
  )
}

const styles = StyleSheet.create({
  iconInputContainer: {
    display: 'inline-flex',
    position: 'relative'
  },
  input: {
    flex: 1,
    backgroundColor: 'inherit',
    marginTop: normalize(10)
  },
  pasteIcon: {
    position: 'absolute',
    cursor: 'pointer',
    right: 0,
    paddingTop: normalize(30),
    zIndex: 1
  }
})

export default InputRecipient
