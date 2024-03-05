// libraries
import React, { useCallback } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { HelperText, TextInput } from 'react-native-paper'

// components
import Icon from '../view/Icon'

// hooks
import { useClipboardPaste } from '../../../lib/hooks/useClipboard'
import usePermissions from '../../permissions/hooks/usePermissions'

// utils
import logger from '../../../lib/logger/js-logger'
import { Permissions } from '../../permissions/types'

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
  const { onBlur, onChangeText, to, error, navigate } = props
  const pasteToWho = useClipboardPaste(onChangeText, log)

  // check clipboard permission an show dialog is not allowed
  const [, requestClipboardPermissions] = usePermissions(Permissions.Clipboard, {
    requestOnMounted: false,
    onAllowed: pasteToWho,
    navigate,
  })

  const handlePastePress = useCallback(requestClipboardPermissions)

  return (
    <View style={styles.iconInputContainer}>
      <View style={styles.pasteIcon}>
        <Icon size={24} color="#282c34" name="paste" onPress={handlePastePress} />
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
    display: 'flex',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: 'inherit',
    marginTop: 10,
  },
  pasteIcon: {
    position: 'absolute',
    right: 0,
    paddingTop: 30,
    zIndex: 1,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
})

export default InputRecipient
